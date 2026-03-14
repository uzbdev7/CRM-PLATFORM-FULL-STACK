import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags("Attendance")
@ApiCookieAuth("access_token")
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post("create")
  @ApiOperation({summary:"ADMIN | ADMINISTRATOR | SUPERADMIN | TEACHER "})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN,Role.ADMINISTRATOR,Role.SUPERADMIN, Role.TEACHER)
  create(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @CurrentUser() user:{id:number, role:Role}  
  ) {
    return this.attendanceService.create(createAttendanceDto, user);
  }

  @ApiOperation({summary:"ADMIN | ADMINISTRATOR | SUPERADMIN | TEACHER "})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.TEACHER)
  @Get("all")
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get(':lessonId')
  @ApiOperation({summary:"ADMIN | ADMINISTRATOR | SUPERADMIN | TEACHER "})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.TEACHER)
  findOne(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.attendanceService.findOne(lessonId, user);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.TEACHER)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.attendanceService.update(id, updateAttendanceDto, user);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.TEACHER)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.attendanceService.remove(id, user);
  }

}
