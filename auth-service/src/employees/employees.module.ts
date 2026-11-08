import { Module } from '@nestjs/common';
import { AdminSeeder } from './admin.seeder';
import { EMPLOYEE_REPOSITORY } from './employee.repository';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { PostgresEmployeeRepository } from './postgres-employee.repository';

@Module({
  controllers: [EmployeesController],
  providers: [
    EmployeesService,
    AdminSeeder,
    { provide: EMPLOYEE_REPOSITORY, useClass: PostgresEmployeeRepository }, // DI binding
  ],
  exports: [EmployeesService],
})
export class EmployeesModule {}
