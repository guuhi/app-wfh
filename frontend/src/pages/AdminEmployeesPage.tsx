import { useCallback, useEffect, useState } from 'react';
import { employeesApi } from '../api/employees';
import { errorMessage } from '../api/http';
import type { Employee, EmployeeUpdate } from '../api/types';
import EmployeeForm, { type EmployeeFormValues } from '../components/EmployeeForm';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editing, setEditing] = useState<Employee | 'new' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setEmployees(await employeesApi.list());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(values: EmployeeFormValues) {
    if (editing === 'new') {
      await employeesApi.create({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        position: values.position || undefined,
        phone: values.phone || undefined,
      });
    } else if (editing) {
      const body: EmployeeUpdate = {
        name: values.name,
        email: values.email,
        role: values.role,
        position: values.position,
        phone: values.phone,
      };
      if (values.password) body.password = values.password;
      await employeesApi.update(editing.id, body);
    }
    setEditing(null);
    await load();
  }

  async function setActive(employee: Employee, isActive: boolean) {
    setError('');
    try {
      if (isActive) await employeesApi.update(employee.id, { isActive: true });
      else await employeesApi.deactivate(employee.id);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <>
      <div className="row between">
        <h1>Employees</h1>
        {!editing && (
          <button type="button" className="btn" onClick={() => setEditing('new')}>
            Add employee
          </button>
        )}
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      {editing && (
        <EmployeeForm
          key={editing === 'new' ? 'new' : editing.id}
          employee={editing === 'new' ? undefined : editing}
          onSubmit={save}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? (
        <p className="muted">Loading...</p>
      ) : employees.length === 0 ? (
        <p className="muted">No employees yet. Add the first one.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Position</th><th>Phone</th><th>Role</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className={emp.isActive ? '' : 'inactive'}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.position}</td>
                <td>{emp.phone}</td>
                <td>{emp.role === 'ADMIN' ? 'HRD admin' : 'Employee'}</td>
                <td>{emp.isActive ? 'Active' : 'Inactive'}</td>
                <td className="actions">
                  <button type="button" className="link" onClick={() => setEditing(emp)}>Edit</button>
                  {emp.isActive ? (
                    <button type="button" className="link danger" onClick={() => setActive(emp, false)}>
                      Deactivate
                    </button>
                  ) : (
                    <button type="button" className="link" onClick={() => setActive(emp, true)}>
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
