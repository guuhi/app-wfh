export type Role = 'EMPLOYEE' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string | null;
  phone: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeInput {
  name: string;
  email: string;
  password?: string;
  position?: string;
  phone?: string;
  role?: Role;
}

export interface EmployeeUpdate extends Partial<EmployeeInput> {
  isActive?: boolean;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  attendanceDate: string; // YYYY-MM-DD
  attendanceAt: string; // ISO timestamp
  photoUrl: string; // path on attendance-service; needs the auth header
}

export interface AttendanceFilter {
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
}
