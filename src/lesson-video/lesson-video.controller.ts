import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, ParseIntPipe } from '@nestjs/common';
import { LessonVideoService } from './lesson-video.service';
import { CreateLessonVideoDto } from './dto/create-lesson-video.dto';
import { UpdateLessonVideoDto } from './dto/update-lesson-video.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Role } from '@prisma/client';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { videoFileOptions } from 'src/config/multer.config';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiCookieAuth("access_token")
@Controller('lesson-video')
export class LessonVideoController {
  constructor(private readonly lessonVideoService: LessonVideoService) {}

  @ApiOperation({summary:"ADMIN | SUPERADMIN | TEACHER"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.TEACHER)
  @Post('create')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        lessonId: { type: 'number', example: 1 },
        file: { type: 'string', format: 'binary', description: 'Video fayl (majburiy)' }
      },
      required: ['lessonId', 'file']
    }
  })
  @UseInterceptors(FileInterceptor('file', videoFileOptions))
  create(
    @Body() createLessonVideoDto: CreateLessonVideoDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.lessonVideoService.create(createLessonVideoDto, file, user)
  }

  @ApiOperation({summary:"ADMIN | SUPERADMIN | TEACHER | ADMINISTRATOR"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.TEACHER)
  @Get('all')
  findAll(
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.lessonVideoService.findAll(user)
  }

  @ApiOperation({summary:"ADMIN | SUPERADMIN | TEACHER | ADMINISTRATOR"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.TEACHER)
  @Get(':lessonId')
  findOne(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.lessonVideoService.findOne(lessonId, user)
  }

  @ApiOperation({summary:"ADMIN | SUPERADMIN | TEACHER "})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.TEACHER)
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        durationTime: { type: 'number', example: 20 },
        file: { type: 'string', format: 'binary' }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file', videoFileOptions))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLessonVideoDto: UpdateLessonVideoDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.lessonVideoService.update(id, updateLessonVideoDto, file, user)
  }

  @ApiOperation({summary:"ADMIN | SUPERADMIN | TEACHER"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.TEACHER)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.lessonVideoService.remove(id, user)
  }
}
