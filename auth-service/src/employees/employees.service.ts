import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '../common/role.enum';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EMPLOYEE_REPOSITORY, EmployeeRepository } from './employee.repository';
import { Employee, EmployeeChanges, EmployeeWithPassword } from './employee.model';

const BCRYPT_ROUNDS = 10;

/** Usecase layer: business rules, no HTTP and no SQL in here. */
@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private readonly repo: EmployeeRepository,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    if (await this.repo.findByEmail(dto.email)) {
      throw new ConflictException('Email is already registered');
    }
    const { password, ...rest } = dto;
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    return this.repo.create({ ...rest, passwordHash });
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

    if (rest.email) {
      const existing = await this.repo.findByEmail(rest.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('Email is already registered');
      }
    }
    if (password) data.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    return (await this.repo.update(id, data))!;
  }

  /** "Delete" = deactivate, so attendance history stays intact. */
  async deactivate(id: string): Promise<Employee> {
    await this.findOne(id);
    return (await this.repo.update(id, { isActive: false }))!;
  }

  /** Called on startup by AdminSeeder. */
  async ensureAdmin(input: { name: string; email: string; password: string }): Promise<void> {
    if ((await this.repo.countByRole(Role.ADMIN)) > 0) return;
    await this.create({ ...input, role: Role.ADMIN, position: 'HRD' });
    this.logger.log(`Seeded admin account: ${input.email}`);
  }
}
