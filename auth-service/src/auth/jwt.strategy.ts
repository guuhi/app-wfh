import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EmployeesService } from '../employees/employees.service';
import { AuthUser, JwtPayload } from './auth-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly employees: EmployeesService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /** Runs after the signature is verified; the return value becomes request.user. */
  async validate(payload: JwtPayload): Promise<AuthUser> {
    // Auth service owns the employee table, so it can reject deactivated users immediately.
    const employee = await this.employees.findOne(payload.sub).catch(() => null);
    if (!employee || !employee.isActive) throw new UnauthorizedException();
    return { id: employee.id, email: employee.email, name: employee.name, role: employee.role };
  }
}
