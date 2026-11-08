import 'multer';
import { type File as MulterFile } from 'multer';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdir, rm, stat, writeFile } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { AuthUser } from '../auth/auth-user.interface';
import { Role } from '../common/role.enum';
import { detectImageExtension } from '../common/image-type';
import {
  ATTENDANCE_REPOSITORY,
  AttendanceFilter,
  AttendanceRepository,
} from './attendance.repository';
import { Attendance } from './attendance.model';

const PG_UNIQUE_VIOLATION = '23505';

/** Usecase layer. */
@Injectable()
export class AttendanceService {
  private readonly uploadDir: string;
  private readonly timezone: string;

  constructor(
    @Inject(ATTENDANCE_REPOSITORY) private readonly repo: AttendanceRepository,
    config: ConfigService,
  ) {
    this.uploadDir = resolve(config.get<string>('UPLOAD_DIR', './uploads'));
    this.timezone = config.get<string>('APP_TIMEZONE', 'Asia/Jakarta');
  }

  async checkIn(user: AuthUser, file?: MulterFile) {
    if (!file)
      throw new BadRequestException(
        'Photo is required (multipart field "photo")',
      );
    const ext = detectImageExtension(file.buffer);
    if (!ext)
      throw new BadRequestException(
        'Photo must be a valid JPEG, PNG or WebP image',
      );

    // Time always comes from the server, never from the client.
    const now = new Date();
    const attendanceDate = this.localDate(now);

    if (await this.repo.findByEmployeeAndDate(user.id, attendanceDate)) {
      throw new ConflictException('Attendance already submitted today');
    }

    const relativePath = join(
      user.id,
      `${attendanceDate}-${randomUUID()}.${ext}`,
    );
    const absolutePath = join(this.uploadDir, relativePath);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.buffer);

    try {
      const saved = await this.repo.create({
        employeeId: user.id,
        employeeName: user.name,
        attendanceDate,
        attendanceAt: now,
        photoPath: relativePath,
      });
      return this.toResponse(saved);
    } catch (err) {
      await rm(absolutePath, { force: true }); // don't leave orphan files
      if ((err as { code?: string }).code === PG_UNIQUE_VIOLATION) {
        throw new ConflictException('Attendance already submitted today');
      }
      throw err;
    }
  }

  async listMine(user: AuthUser) {
    const rows = await this.repo.findAll({ employeeId: user.id });
    return rows.map((r) => this.toResponse(r));
  }

  async listAll(filter: AttendanceFilter) {
    const rows = await this.repo.findAll(filter);
    return rows.map((r) => this.toResponse(r));
  }

  /** Admin can see any photo; an employee only their own. */
  async getPhotoPath(id: string, user: AuthUser): Promise<string> {
    const attendance = await this.repo.findById(id);
    if (!attendance) throw new NotFoundException('Attendance not found');
    if (user.role !== Role.ADMIN && attendance.employeeId !== user.id) {
      throw new ForbiddenException();
    }
    const absolutePath = join(this.uploadDir, attendance.photoPath);
    await stat(absolutePath).catch(() => {
      throw new NotFoundException('Photo file missing');
    });
    return absolutePath;
  }

  /** 'YYYY-MM-DD' of `date` in the configured timezone. */
  private localDate(date: Date): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: this.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  private toResponse(a: Attendance) {
    return {
      id: a.id,
      employeeId: a.employeeId,
      employeeName: a.employeeName,
      attendanceDate: a.attendanceDate,
      attendanceAt: a.attendanceAt,
      photoUrl: `/attendances/${a.id}/photo`,
    };
  }
}
