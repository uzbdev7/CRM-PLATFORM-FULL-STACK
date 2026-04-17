import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags("Lessons")
@Controller('lesson')
@ApiCookieAuth("access_token")
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post("create")
  @ApiOperation({summary:"ADMIN | ADMINISTRATOR | SUPERADMIN"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR,Role.SUPERADMIN, Role.TEACHER)
  create(
    @Body() dto: CreateLessonDto,
    @CurrentUser() user: {id:number, role:Role}
    ) {
    return this.lessonService.create(dto, user);
  }

  @ApiOperation({summary:"HAMMA UCHUN"})
  @Get('all')
  findAll() {
    return this.lessonService.findAll();
  }

  @ApiOperation({summary:"ADMIN | ADMINISTRATOR | SUPERADMIN | STUDENT"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR,Role.SUPERADMIN, Role.TEACHER, Role.STUDENT)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.lessonService.findOne(id, user)
  }

  @Patch(':id')
  @ApiOperation({summary:"ADMIN | ADMINISTRATOR | SUPERADMIN"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR,Role.SUPERADMIN, Role.TEACHER)
  update(
    @CurrentUser() user: {id:number, role:Role},
    @Param('id', ParseIntPipe) id: number, 
    @Body() payload: UpdateLessonDto
  ){
    return this.lessonService.update(user, id, payload);
  }

  @Delete(':id')
  @ApiOperation({summary:"ADMIN | ADMINISTRATOR | SUPERADMIN"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR,Role.SUPERADMIN, Role.TEACHER)
  remove(
    @CurrentUser() user: {id:number, role:Role},
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.lessonService.remove(user, id);
  }

}
