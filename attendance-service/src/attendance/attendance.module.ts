import { Module } from '@nestjs/common';
import { ATTENDANCE_REPOSITORY } from './attendance.repository';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { PostgresAttendanceRepository } from './postgres-attendance.repository';

@Module({
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    { provide: ATTENDANCE_REPOSITORY, useClass: PostgresAttendanceRepository },
  ],
})
export class AttendanceModule {}
