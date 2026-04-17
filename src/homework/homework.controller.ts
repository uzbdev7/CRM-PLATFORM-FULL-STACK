import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, ParseIntPipe } from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { homeworkFileOptions } from '../config/multer.config';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Homework')
@ApiCookieAuth("access_token")
@Controller('homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @ApiOperation({summary:"ADMIN | SUPERADMIN | TEACHER"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.TEACHER)
  @Post('create')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        lessonId: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Node.js vazifasi' },
        durationTime: { type: 'number', example: 16 },
        file: { type: 'string', format: 'binary' } 
      },
      required: ['lessonId', 'title']
    }
  })
  @UseInterceptors(FileInterceptor('file', homeworkFileOptions))
  create(
    @Body() createHomeworkDto: CreateHomeworkDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.homeworkService.create(createHomeworkDto, file, user)
  }

  @ApiOperation({summary:"ADMIN | SUPERADMIN | TEACHER | ADMINISTRATOR | STUDENT"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.TEACHER, Role.STUDENT)
  @Get('all')
  findAll(
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.homeworkService.findAll(user)
  }

  @ApiOperation({summary:"ADMIN | SUPERADMIN | TEACHER | ADMINISTRATOR | STUDENT"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.TEACHER, Role.STUDENT)
  @Get(':lessonId')
  findOne(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.homeworkService.findOne(lessonId, user)
  }

  @ApiOperation({summary:"ADMIN | SUPERADMIN | TEACHER"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.TEACHER)
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Yangilangan vazifa' },
        durationTime: { type: 'number', example: 16 },
        file: { type: 'string', format: 'binary' }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file', homeworkFileOptions))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHomeworkDto: UpdateHomeworkDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.homeworkService.update(id, updateHomeworkDto, file, user)
  }

  @ApiOperation({summary:"ADMIN | SUPERADMIN | TEACHER"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.TEACHER)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.homeworkService.remove(id, user)
  }
 
}
