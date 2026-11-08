import { Role } from '../common/role.enum';

/** Plain data shape (like a Go struct). Never contains the password hash. */
export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string | null;
  phone: string | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Only used by login, to compare passwords. */
export interface EmployeeWithPassword extends Employee {
  passwordHash: string;
}

export interface NewEmployee {
  name: string;
  email: string;
  passwordHash: string;
  position?: string;
  phone?: string;
  role?: Role;
}

export interface EmployeeChanges {
  name?: string;
  email?: string;
  passwordHash?: string;
  position?: string;
  phone?: string;
  role?: Role;
  isActive?: boolean;
}
