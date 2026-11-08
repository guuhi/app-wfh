import { IsOptional, IsUUID, Matches } from 'class-validator';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class QueryAttendanceDto {
  @IsOptional() @IsUUID()
  employeeId?: string;

  @IsOptional() @Matches(DATE, { message: 'dateFrom must be YYYY-MM-DD' })
  dateFrom?: string;

  @IsOptional() @Matches(DATE, { message: 'dateTo must be YYYY-MM-DD' })
  dateTo?: string;
}
