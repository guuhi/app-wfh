import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { EmployeesModule } from './employees/employees.module';

// Composition root (like main.go).
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // loads .env
    DatabaseModule, // PostgreSQL connection pool
    EmployeesModule,
    AuthModule,
  ],
})
export class AppModule {}
