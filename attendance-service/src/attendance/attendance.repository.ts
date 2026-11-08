import { Attendance, NewAttendance } from './attendance.model';

export const ATTENDANCE_REPOSITORY = Symbol('ATTENDANCE_REPOSITORY');

export interface AttendanceFilter {
  employeeId?: string;
  dateFrom?: string; // YYYY-MM-DD inclusive
  dateTo?: string; // YYYY-MM-DD inclusive
}

export interface AttendanceRepository {
  create(data: NewAttendance): Promise<Attendance>;
  findById(id: string): Promise<Attendance | null>;
  findByEmployeeAndDate(employeeId: string, date: string): Promise<Attendance | null>;
  findAll(filter: AttendanceFilter): Promise<Attendance[]>;
}
