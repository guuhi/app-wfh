import 'multer';
import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { memoryStorage, type File as MulterFile } from 'multer';
import { AuthUser } from '../auth/auth-user.interface';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../common/role.enum';
import { AttendanceService } from './attendance.service';
import { QueryAttendanceDto } from './dto/query-attendance.dto';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/** Handler layer. */
@Controller('attendances')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  // Employee: submit today's attendance (multipart/form-data, field "photo")
  @Post()
  @Roles(Role.EMPLOYEE)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_PHOTO_BYTES },
    }),
  )
  checkIn(@CurrentUser() user: AuthUser, @UploadedFile() photo?: MulterFile) {
    return this.attendance.checkIn(user, photo);
  }

  // Employee: own history
  @Get('me')
  @Roles(Role.EMPLOYEE)
  listMine(@CurrentUser() user: AuthUser) {
    return this.attendance.listMine(user);
  }

  // Admin: view all (read-only), filter by employee/date
  @Get()
  @Roles(Role.ADMIN)
  listAll(@Query() query: QueryAttendanceDto) {
    return this.attendance.listAll(query);
  }

  // Admin (any) or employee (own): photo file
  @Get(':id/photo')
  async photo(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Res() res: Response,
  ) {
    const path = await this.attendance.getPhotoPath(id, user);
    res.sendFile(path);
  }
}
