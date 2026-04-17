import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

import { Role } from '@prisma/client';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';


@ApiTags("Attendance")
@ApiCookieAuth("access_token")
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post("create")
  @ApiOperation({summary:"ADMIN | ADMINISTRATOR | SUPERADMIN | MANAGEMENT | TEACHER "})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN,Role.ADMINISTRATOR,Role.SUPERADMIN, Role.MANAGEMENT, Role.TEACHER)
  create(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @CurrentUser() user:{id:number, role:Role}  
  ) {
    return this.attendanceService.create(createAttendanceDto, user);
  }

  // [O'ZGARTIRISH]: O'quvchilar o'zlarining davomatini ko'ra olishi uchun STUDENT roli qo'shildi
  @ApiOperation({summary:"ADMIN | ADMINISTRATOR | SUPERADMIN | MANAGEMENT | TEACHER | STUDENT "})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.MANAGEMENT, Role.TEACHER, Role.STUDENT)
  @Get("all")
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get(':lessonId')
  // [O'ZGARTIRISH]: Dars bo'yicha davomatni ko'rish imkoniyati STUDENT ga ham berildi
  @ApiOperation({summary:"ADMIN | ADMINISTRATOR | SUPERADMIN | MANAGEMENT | TEACHER | STUDENT "})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.MANAGEMENT, Role.TEACHER, Role.STUDENT)
  findOne(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.attendanceService.findOne(lessonId, user);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.MANAGEMENT, Role.TEACHER)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.attendanceService.update(id, updateAttendanceDto, user);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.MANAGEMENT, Role.TEACHER)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.attendanceService.remove(id, user);
  }

}
