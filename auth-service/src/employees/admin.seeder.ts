import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmployeesService } from './employees.service';

@Injectable()
export class AdminSeeder implements OnApplicationBootstrap {
  constructor(
    private readonly employees: EmployeesService,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.employees.ensureAdmin({
      name: this.config.get('ADMIN_NAME', 'HRD Admin'),
      email: this.config.getOrThrow('ADMIN_EMAIL'),
      password: this.config.getOrThrow('ADMIN_PASSWORD'),
    });
  }
}
