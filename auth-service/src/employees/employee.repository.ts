import { Role } from '../common/role.enum';
import { Employee, EmployeeChanges, EmployeeWithPassword, NewEmployee } from './employee.model';

export const EMPLOYEE_REPOSITORY = Symbol('EMPLOYEE_REPOSITORY');

export interface EmployeeRepository {
  create(data: NewEmployee): Promise<Employee>;
  findAll(): Promise<Employee[]>;
  findById(id: string): Promise<Employee | null>;
  findByEmail(email: string): Promise<Employee | null>;
  findByEmailWithPassword(email: string): Promise<EmployeeWithPassword | null>;
  update(id: string, changes: EmployeeChanges): Promise<Employee | null>;
  countByRole(role: Role): Promise<number>;
}
