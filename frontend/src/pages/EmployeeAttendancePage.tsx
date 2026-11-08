import { useCallback, useEffect, useState } from 'react';
import { attendanceApi } from '../api/attendance';
import { errorMessage } from '../api/http';
import type { Attendance } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import AttendancePhoto from '../components/AttendancePhoto';
import CameraCapture from '../components/CameraCapture';

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function EmployeeAttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [cameraKey, setCameraKey] = useState(0); // changing the key resets the camera
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setRecords(await attendanceApi.listMine());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Only a hint for the UI. The server decides what "today" is and enforces one per day.
  const today = new Date().toLocaleDateString('en-CA');
  const todays = records.find((r) => r.attendanceDate === today);

  async function submit() {
    if (!photo) return;
    setSubmitting(true);
    setError('');
    try {
      await attendanceApi.checkIn(photo);
      setPhoto(null);
      setCameraKey((k) => k + 1);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSubmitting(false);
      await load();
    }
  }

  return (
    <>
      <h1>Hi, {user?.name}</h1>

      <section className="card">
        <h2>Today's attendance</h2>
        {todays ? (
          <p>You checked in today at {formatTime(todays.attendanceAt)}.</p>
        ) : (
          <>
            <p className="muted">Take a photo as proof that you are working from home.</p>
            <CameraCapture key={cameraKey} onChange={setPhoto} disabled={submitting} />
            <button type="button" className="btn" onClick={submit} disabled={!photo || submitting}>
              {submitting ? 'Submitting...' : 'Submit attendance'}
            </button>
          </>
        )}
        {error && <p className="error" role="alert">{error}</p>}
      </section>

      <section>
        <h2>My history</h2>
        {loading ? (
          <p className="muted">Loading...</p>
        ) : records.length === 0 ? (
          <p className="muted">No attendance yet. Your first check-in will show up here.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Date</th><th>Time</th><th>Photo</th></tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.attendanceDate}</td>
                  <td>{formatTime(r.attendanceAt)}</td>
                  <td><AttendancePhoto photoUrl={r.photoUrl} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
