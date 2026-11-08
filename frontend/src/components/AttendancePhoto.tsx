import { useEffect, useState } from 'react';
import { attendanceApi } from '../api/attendance';

/** Loads the proof photo only when asked (the file endpoint needs the auth header). */
export default function AttendancePhoto({ photoUrl }: { photoUrl: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
  }, [src]);

  async function show() {
    setState('loading');
    try {
      const blob = await attendanceApi.getPhoto(photoUrl);
      setSrc(URL.createObjectURL(blob));
      setState('idle');
    } catch {
      setState('error');
    }
  }

  if (src) {
    return (
      <img
        className="thumb"
        src={src}
        alt="Attendance proof"
        title="Click to hide"
        onClick={() => setSrc(null)}
      />
    );
  }
  return (
    <button
      type="button"
      className="link"
      onClick={show}
      disabled={state === 'loading'}
    >
      {state === 'loading'
        ? 'Loading...'
        : state === 'error'
          ? 'Retry'
          : 'View photo'}
    </button>
  );
}
