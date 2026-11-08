import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { attendanceApi } from '../api/attendance';
import { employeesApi } from '../api/employees';
import { errorMessage } from '../api/http';
import type { Attendance, AttendanceFilter, Employee } from '../api/types';
import AttendancePhoto from '../components/AttendancePhoto';

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function AdminAttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filter, setFilter] = useState<AttendanceFilter>({});
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (f: AttendanceFilter) => {
    setLoading(true);
    setError('');
    try {
      setRecords(await attendanceApi.listAll(f));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load({});
    employeesApi.list().then(setEmployees).catch((e) => setError(errorMessage(e)));
  }, [load]);

  function search(e: FormEvent) {
    e.preventDefault();
    void load(filter);
  }

  return (
    <>
      <h1>Attendance</h1>
      <p className="muted">Read-only view of what employees have submitted.</p>

      <form className="filters" onSubmit={search}>
        <label>
          Employee
          <select
            value={filter.employeeId ?? ''}
            onChange={(e) => setFilter({ ...filter, employeeId: e.target.value })}
          >
            <option value="">All employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </label>
        <label>
          From
          <input
            type="date"
            value={filter.dateFrom ?? ''}
            onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={filter.dateTo ?? ''}
            onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
          />
        </label>
        <button type="submit" className="btn">Apply filters</button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      {loading ? (
        <p className="muted">Loading...</p>
      ) : records.length === 0 ? (
        <p className="muted">No attendance found. Try a wider date range.</p>
      ) : (
        <table>
          <thead>
            <tr><th>Employee</th><th>Date</th><th>Time</th><th>Photo</th></tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>{r.employeeName}</td>
                <td>{r.attendanceDate}</td>
                <td>{formatTime(r.attendanceAt)}</td>
                <td><AttendancePhoto photoUrl={r.photoUrl} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
