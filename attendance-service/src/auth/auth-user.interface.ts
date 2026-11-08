import { Role } from '../common/role.enum';

/** Claims stored inside the JWT. */
export interface JwtPayload {
  sub: string; // employee id
  email: string;
  name: string;
  role: Role;
}

/** What controllers receive via @CurrentUser() (like c.MustGet("user") in Gin). */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}
