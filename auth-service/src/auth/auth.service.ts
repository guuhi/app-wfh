import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { EmployeesService } from '../employees/employees.service';
import { JwtPayload } from './auth-user.interface';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly employees: EmployeesService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const employee = await this.employees.findByEmailWithPassword(dto.email);

    // Same error for unknown email / wrong password / inactive: don't leak which one.
    const valid =
      !!employee &&
      employee.isActive &&
      (await bcrypt.compare(dto.password, employee.passwordHash));
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    const payload: JwtPayload = {
      sub: employee.id,
      email: employee.email,
      name: employee.name,
      role: employee.role,
    };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user: { id: employee.id, name: employee.name, email: employee.email, role: employee.role },
    };
  }

  me(userId: string) {
    return this.employees.findOne(userId);
  }
}
