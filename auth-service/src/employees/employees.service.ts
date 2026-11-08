import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '../common/role.enum';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EMPLOYEE_REPOSITORY, EmployeeRepository } from './employee.repository';
import {
  Employee,
  EmployeeChanges,
  EmployeeWithPassword,
} from './employee.model';

const BCRYPT_ROUNDS = 10;

/** Usecase layer: business rules, no HTTP and no SQL in here. */
@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private readonly repo: EmployeeRepository,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    // Validate and clean everything first, before touching the database.
    const name = this.requireText(dto.name, 'Name');
    const email = this.requireText(dto.email, 'Email');
    const position = this.requireText(dto.position, 'Position');
    if (!dto.role) throw new BadRequestException('Role is required');
    const passwordHash = await this.hashPassword(dto.password);

    if (await this.repo.findByEmail(email)) {
      throw new ConflictException('Email is already registered');
    }

    return this.repo.create({
      name,
      email,
      position,
      phone: dto.phone?.trim() || undefined, // optional: blank means "not given"
      role: dto.role,
      passwordHash,
    });
  }

  findAll(): Promise<Employee[]> {
    return this.repo.findAll();
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.repo.findById(id);
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  findByEmailWithPassword(email: string): Promise<EmployeeWithPassword | null> {
    return this.repo.findByEmailWithPassword(email);
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    await this.findOne(id);
    const { password, ...rest } = dto;
    const data: EmployeeChanges = { ...rest };

    // A field that is sent must not be blank. A field that is not sent stays unchanged.
    if (rest.name !== undefined) {
      data.name = this.requireText(rest.name, 'Name');
    }
    if (rest.email !== undefined) {
      data.email = this.requireText(rest.email, 'Email');
    }
    if (rest.position !== undefined) {
      data.position = this.requireText(rest.position, 'Position');
    }
    if (rest.phone !== undefined) {
      data.phone = rest.phone.trim(); // optional: blank clears it
    }
    if (password !== undefined) {
      data.passwordHash = await this.hashPassword(password);
    }

    if (data.email) {
      const existing = await this.repo.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('Email is already registered');
      }
    }

    return (await this.repo.update(id, data))!;
  }

  /** "Delete" = deactivate, so attendance history stays intact. */
  async deactivate(id: string): Promise<Employee> {
    await this.findOne(id);
    return (await this.repo.update(id, { isActive: false }))!;
  }

  /** Called on startup by AdminSeeder. */
  async ensureAdmin(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<void> {
    if ((await this.repo.countByRole(Role.ADMIN)) > 0) return;
    await this.create({ ...input, role: Role.ADMIN, position: 'HRD' });
    this.logger.log(`Seeded admin account: ${input.email}`);
  }

  /** Required text: trims surrounding spaces and rejects missing or blank values. */
  private requireText(value: unknown, field: string): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`${field} is required`);
    }
    return value.trim();
  }

  /**
   * Passwords are NOT trimmed (spaces can be part of a password),
   * but a missing or all-spaces password is rejected.
   */
  private async hashPassword(password: unknown): Promise<string> {
    if (typeof password !== 'string' || !password.trim()) {
      throw new BadRequestException('Password is required');
    }
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }
}
