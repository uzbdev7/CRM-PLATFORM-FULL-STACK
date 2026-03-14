import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

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
  @Roles(Role.ADMIN, Role.ADMINISTRATOR,Role.SUPERADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lessonService.remove(id);
  }

}
