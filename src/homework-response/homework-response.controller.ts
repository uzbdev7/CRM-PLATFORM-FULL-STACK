import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, ParseIntPipe, UploadedFile } from '@nestjs/common';
import { HomeworkResponseService } from './homework-response.service';
import { CreateHomeworkResponseDto } from './dto/create-homework-response.dto';
import { UpdateHomeworkResponseDto } from './dto/update-homework-response.dto';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { homeworkResponseOptions } from '../config/multer.config';

@ApiTags('HomeworkResponse')
@ApiCookieAuth("access_token")
@Controller('homework-response')
export class HomeworkResponseController {
  constructor(private readonly homeworkResponseService: HomeworkResponseService) {}

  @ApiOperation({summary:"STUDENT"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.STUDENT)
  @Post('create')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        homeworkId: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Mening vazifam' },
        file: { type: 'string', format: 'binary' }
      },
      required: ['homeworkId', 'title']
    }
  })
  @UseInterceptors(FileInterceptor('file', homeworkResponseOptions))
  create(
    @Body() createHomeworkResponseDto: CreateHomeworkResponseDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.homeworkResponseService.create(createHomeworkResponseDto, file, user)
  }

  // Student o'z yuklagan vazifalarini ko'radi
  @ApiOperation({summary:"STUDENT"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.STUDENT)
  @Get('my-responses')
  findMyResponses(
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.homeworkResponseService.findMyResponses(user)
  }

  // Update — deadline tugagunga qadar
  @ApiOperation({summary:"STUDENT"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.STUDENT)
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Yangilangan vazifa' },
        file: { type: 'string', format: 'binary' }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file', homeworkResponseOptions))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHomeworkResponseDto: UpdateHomeworkResponseDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.homeworkResponseService.update(id, updateHomeworkResponseDto, file, user)
  }

  @ApiOperation({summary:" TEACHER | ADMIN | SUPERADMIN | SUPERADMIN"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.TEACHER)
  @Get(':id/missed-students')
  findMissedStudents(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.homeworkResponseService.findMissedStudents(id, user)
  }

  @ApiOperation({summary:" TEACHER | ADMIN | SUPERADMIN | ADMINISTRATOR"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.TEACHER)
  @Get('homework/:homeworkId')
  findResponsesByHomework(
    @Param('homeworkId', ParseIntPipe) homeworkId: number,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.homeworkResponseService.findResponsesByHomework(homeworkId, user)
  }
}