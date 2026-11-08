import { useState, type FormEvent } from 'react';
import { errorMessage } from '../api/http';
import type { Employee, Role } from '../api/types';

export interface EmployeeFormValues {
  name: string;
  email: string;
  password: string;
  position: string;
  phone: string;
  role: Role;
}

interface Props {
  employee?: Employee; // present = edit mode
  onSubmit: (values: EmployeeFormValues) => Promise<void>;
  onCancel: () => void;
}

export default function EmployeeForm({ employee, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<EmployeeFormValues>({
    name: employee?.name ?? '',
    email: employee?.email ?? '',
    password: '',
    position: employee?.position ?? '',
    phone: employee?.phone ?? '',
    role: employee?.role ?? 'EMPLOYEE',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof EmployeeFormValues>(key: K, value: EmployeeFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSubmit(values);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <h2>{employee ? 'Edit employee' : 'Add employee'}</h2>

      <label>
        Name
        <input required value={values.name} onChange={(e) => set('name', e.target.value)} />
      </label>
      <label>
        Email
        <input type="email" required value={values.email} onChange={(e) => set('email', e.target.value)} />
      </label>
      <label>
        {employee ? 'New password (leave blank to keep)' : 'Password'}
        <input
          type="password"
          required={!employee}
          minLength={8}
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => set('password', e.target.value)}
        />
      </label>
      <label>
        Position
        <input required value={values.position} onChange={(e) => set('position', e.target.value)} />
      </label>
      <label>
        Phone (optional)
        <input value={values.phone} onChange={(e) => set('phone', e.target.value)} />
      </label>
      <label>
        Role
        <select value={values.role} onChange={(e) => set('role', e.target.value as Role)}>
          <option value="EMPLOYEE">Employee</option>
          <option value="ADMIN">HRD admin</option>
        </select>
      </label>

      {error && <p className="error full" role="alert">{error}</p>}

      <div className="row full">
        <button type="submit" className="btn" disabled={busy}>
          {busy ? 'Saving...' : 'Save employee'}
        </button>
        <button type="button" className="btn btn-quiet" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  );
}
