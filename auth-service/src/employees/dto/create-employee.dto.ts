import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '../../common/role.enum';

export class CreateEmployeeDto {
  @IsString() @IsNotEmpty() @MaxLength(150)
  name: string;

  @IsEmail() @MaxLength(150)
  email: string;

  @IsString() @MinLength(8) @MaxLength(72) // bcrypt limit
  password: string;

  @IsOptional() @IsString() @MaxLength(100)
  position?: string;

  @IsOptional() @IsString() @MaxLength(30)
  phone?: string;

  @IsOptional() @IsEnum(Role)
  role?: Role;
}
