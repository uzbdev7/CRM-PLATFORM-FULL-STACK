import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { HomeworkResultService } from './homework-result.service';
import { CreateHomeworkResultDto } from './dto/create-homework-result.dto';
import { UpdateHomeworkResultDto } from './dto/update-homework-result.dto';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { HomeworkStatus, Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { homeworkResultOptions } from 'src/config/multer.config';

@ApiTags('HomeworkResult')
@ApiCookieAuth("access_token")
@Controller('homework-result')
export class HomeworkResultController {
  constructor(private readonly homeworkResultService: HomeworkResultService) {}

  
  @ApiOperation({summary:"ADMIN | SUPERADMIN | TEACHER | ADMINISTRATOR"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.TEACHER)
  @Post('check')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        homeworkId: { type: 'number', example: 1 },
        studentId: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Yaxshi bajarilgan' },
        score: { type: 'number', example: 85, minimum: 0, maximum: 100 },
        file: { type: 'string', format: 'binary' },
      },
      required: ['homeworkId', 'studentId', 'title', 'score'],
    },
  })
  @UseInterceptors(FileInterceptor('file', homeworkResultOptions))
  create(
    @Body() dto: CreateHomeworkResultDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: number; role: Role },
  ) {
    return this.homeworkResultService.create(dto, file, user);
  }

  
  @ApiOperation({summary:"ADMIN | SUPERADMIN | TEACHER | ADMINISTRATOR"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.TEACHER)
  @Get('all')
  @ApiQuery({ 
  name: 'status', 
  enum: [HomeworkStatus.REJECTED, HomeworkStatus.APPROVED], 
  required: false 
})
  findAll(
    @Query('status') status: HomeworkStatus,
    @CurrentUser() user: { id: number; role: Role },
  ) {
    return this.homeworkResultService.findAll(user, status);
  }

  
  @ApiOperation({summary:"ADMIN | SUPERADMIN | TEACHER | ADMINISTRATOR"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.TEACHER)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: Role },
  ) {
    return this.homeworkResultService.findOne(id, user);
  }

  
  @ApiOperation({summary:"ADMIN | SUPERADMIN | TEACHER | ADMINISTRATOR"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN, Role.TEACHER)
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Yangilangan izoh' },
        score: { type: 'number', example: 90, minimum: 0, maximum: 100 },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', homeworkResultOptions))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHomeworkResultDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: number; role: Role },
  ) {
    return this.homeworkResultService.update(id, dto, file, user);
  }

}
