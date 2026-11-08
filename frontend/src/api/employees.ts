import { AUTH_API, request } from './http';
import type { Employee, EmployeeInput, EmployeeUpdate } from './types';

export const employeesApi = {
  list: () => request<Employee[]>(AUTH_API, '/employees'),
  create: (input: EmployeeInput) =>
    request<Employee>(AUTH_API, '/employees', { method: 'POST', body: input }),
  update: (id: string, input: EmployeeUpdate) =>
    request<Employee>(AUTH_API, `/employees/${id}`, {
      method: 'PUT',
      body: input,
    }),
  deactivate: (id: string) =>
    request<Employee>(AUTH_API, `/employees/${id}`, { method: 'DELETE' }),
};
