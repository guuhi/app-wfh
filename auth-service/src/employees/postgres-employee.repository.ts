import { Injectable } from '@nestjs/common';
import { Role } from '../common/role.enum';
import { DatabaseService } from '../database/database.service';
import { Employee, EmployeeChanges, EmployeeWithPassword, NewEmployee } from './employee.model';
import { EmployeeRepository } from './employee.repository';

// Columns returned to callers. password_hash is deliberately NOT here.
const COLUMNS = 'id, name, email, position, phone, role, is_active, created_at, updated_at';

// A database row (snake_case) as returned by pg
interface EmployeeRow {
  id: string;
  name: string;
  email: string;
  position: string | null;
  phone: string | null;
  role: Role;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  password_hash?: string;
}

function toEmployee(r: EmployeeRow): Employee {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    position: r.position,
    phone: r.phone,
    role: r.role,
    isActive: r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** Repository implementation: plain SQL against PostgreSQL. */
@Injectable()
export class PostgresEmployeeRepository implements EmployeeRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: NewEmployee): Promise<Employee> {
    const rows = await this.db.query<EmployeeRow>(
      `INSERT INTO employees (name, email, position, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${COLUMNS}`,
      [
        data.name,
        data.email,
        data.position ?? null,
        data.phone ?? null,
        data.passwordHash,
        data.role ?? Role.EMPLOYEE,
      ],
    );
    return toEmployee(rows[0]);
  }

  async findAll(): Promise<Employee[]> {
    const rows = await this.db.query<EmployeeRow>(
      `SELECT ${COLUMNS} FROM employees ORDER BY created_at DESC`,
    );
    return rows.map(toEmployee);
  }

  async findById(id: string): Promise<Employee | null> {
    const rows = await this.db.query<EmployeeRow>(
      `SELECT ${COLUMNS} FROM employees WHERE id = $1`,
      [id],
    );
    return rows[0] ? toEmployee(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<Employee | null> {
    const rows = await this.db.query<EmployeeRow>(
      `SELECT ${COLUMNS} FROM employees WHERE email = $1`,
      [email],
    );
    return rows[0] ? toEmployee(rows[0]) : null;
  }

  async findByEmailWithPassword(email: string): Promise<EmployeeWithPassword | null> {
    const rows = await this.db.query<EmployeeRow>(
      `SELECT ${COLUMNS}, password_hash FROM employees WHERE email = $1`,
      [email],
    );
    if (!rows[0]) return null;
    return { ...toEmployee(rows[0]), passwordHash: rows[0].password_hash! };
  }

  async update(id: string, changes: EmployeeChanges): Promise<Employee | null> {
    // Fixed whitelist of property -> column. Column names never come from user input;
    // values always go through $1, $2... placeholders (no SQL injection).
    const columns: Record<keyof EmployeeChanges, string> = {
      name: 'name',
      email: 'email',
      passwordHash: 'password_hash',
      position: 'position',
      phone: 'phone',
      role: 'role',
      isActive: 'is_active',
    };

    const sets: string[] = [];
    const values: unknown[] = [];
    for (const key of Object.keys(columns) as (keyof EmployeeChanges)[]) {
      const value = changes[key];
      if (value === undefined) continue;
      values.push(value);
      sets.push(`${columns[key]} = $${values.length}`);
    }
    if (sets.length === 0) return this.findById(id);

    values.push(id);
    await this.db.query(
      `UPDATE employees SET ${sets.join(', ')}, updated_at = now() WHERE id = $${values.length}`,
      values,
    );
    return this.findById(id);
  }

  async countByRole(role: Role): Promise<number> {
    const rows = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM employees WHERE role = $1`,
      [role],
    );
    return Number(rows[0].count); // pg returns COUNT as a string
  }
}
