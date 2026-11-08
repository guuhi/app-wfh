/** Plain data shape (like a Go struct). */
export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  attendanceDate: string; // 'YYYY-MM-DD', local day in APP_TIMEZONE
  attendanceAt: Date; // exact server time
  photoPath: string;
  createdAt: Date;
}

export type NewAttendance = Omit<Attendance, 'id' | 'createdAt'>;
