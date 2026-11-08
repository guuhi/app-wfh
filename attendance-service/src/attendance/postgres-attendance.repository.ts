import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Attendance, NewAttendance } from './attendance.model';
import { AttendanceFilter, AttendanceRepository } from './attendance.repository';

const COLUMNS =
  'id, employee_id, employee_name, attendance_date, attendance_at, photo_path, created_at';
const MAX_ROWS = 500;

interface AttendanceRow {
  id: string;
  employee_id: string;
  employee_name: string;
  attendance_date: string;
  attendance_at: Date;
  photo_path: string;
  created_at: Date;
}

function toAttendance(r: AttendanceRow): Attendance {
  return {
    id: r.id,
    employeeId: r.employee_id,
    employeeName: r.employee_name,
    attendanceDate: r.attendance_date,
    attendanceAt: r.attendance_at,
    photoPath: r.photo_path,
    createdAt: r.created_at,
  };
}

/** Repository implementation: plain SQL against PostgreSQL. */
@Injectable()
export class PostgresAttendanceRepository implements AttendanceRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: NewAttendance): Promise<Attendance> {
    const rows = await this.db.query<AttendanceRow>(
      `INSERT INTO attendances (employee_id, employee_name, attendance_date, attendance_at, photo_path)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${COLUMNS}`,
      [data.employeeId, data.employeeName, data.attendanceDate, data.attendanceAt, data.photoPath],
    );
    return toAttendance(rows[0]);
  }

  async findById(id: string): Promise<Attendance | null> {
    const rows = await this.db.query<AttendanceRow>(
      `SELECT ${COLUMNS} FROM attendances WHERE id = $1`,
      [id],
    );
    return rows[0] ? toAttendance(rows[0]) : null;
  }

  async findByEmployeeAndDate(employeeId: string, date: string): Promise<Attendance | null> {
    const rows = await this.db.query<AttendanceRow>(
      `SELECT ${COLUMNS} FROM attendances WHERE employee_id = $1 AND attendance_date = $2`,
      [employeeId, date],
    );
    return rows[0] ? toAttendance(rows[0]) : null;
  }

  async findAll(filter: AttendanceFilter): Promise<Attendance[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filter.employeeId) {
      values.push(filter.employeeId);
      conditions.push(`employee_id = $${values.length}`);
    }
    if (filter.dateFrom) {
      values.push(filter.dateFrom);
      conditions.push(`attendance_date >= $${values.length}`);
    }
    if (filter.dateTo) {
      values.push(filter.dateTo);
      conditions.push(`attendance_date <= $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await this.db.query<AttendanceRow>(
      `SELECT ${COLUMNS} FROM attendances ${where} ORDER BY attendance_at DESC LIMIT ${MAX_ROWS}`,
      values,
    );
    return rows.map(toAttendance);
  }
}
