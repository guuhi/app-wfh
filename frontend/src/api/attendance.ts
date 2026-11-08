import { ATTENDANCE_API, request, requestBlob } from './http';
import type { Attendance, AttendanceFilter } from './types';

export const attendanceApi = {
  checkIn: (photo: Blob) => {
    const form = new FormData();
    form.append('photo', photo, 'attendance.jpg'); // field name must be "photo"
    return request<Attendance>(ATTENDANCE_API, '/attendances', {
      method: 'POST',
      body: form,
    });
  },
  listMine: () => request<Attendance[]>(ATTENDANCE_API, '/attendances/me'),
  listAll: (filter: AttendanceFilter) => {
    const params = new URLSearchParams();
    if (filter.employeeId) params.set('employeeId', filter.employeeId);
    if (filter.dateFrom) params.set('dateFrom', filter.dateFrom);
    if (filter.dateTo) params.set('dateTo', filter.dateTo);
    const qs = params.toString();
    return request<Attendance[]>(
      ATTENDANCE_API,
      `/attendances${qs ? `?${qs}` : ''}`,
    );
  },
  // <img src> cannot send the Authorization header, so fetch the file as a blob.
  getPhoto: (photoUrl: string) => requestBlob(ATTENDANCE_API, photoUrl),
};
