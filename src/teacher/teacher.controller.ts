import { Controller, Post, Body, HttpCode, HttpStatus, Res, UseGuards, UseInterceptors, UploadedFile, Request, Get, ParseIntPipe, Param, Patch, Delete, ForbiddenException } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginTeacherDto } from './dto/LoginTeacher.dto';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { multerOptions } from '../config/multer.config';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Teacher')
@ApiCookieAuth("access_token")
@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  // CREATE TEACHER
  @ApiOperation({ summary: 'SUPERADMIN | ADMINISTRATOR | ADMIN | MANAGEMENT' })
  @UseGuards(JwtAuthGuard,RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGEMENT, Role.SUPERADMIN, Role.ADMINISTRATOR)
  @UseInterceptors(FileInterceptor('photo', multerOptions))
  @ApiConsumes('multipart/form-data')
  @Post("create")
   register(
    @Body() dto: CreateTeacherDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.teacherService.createTeacher(dto, photo);
  }

  @ApiOperation({ summary: 'TEACHER | SUPERADMIN | ADMIN' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.TEACHER,Role.SUPERADMIN, Role.ADMIN)
  @Get('my-homeworks')
  findTeacherHomeworks(
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.teacherService.findTeacherHomeworks(user)
  }

  // LOGIN TEACHER
  @ApiResponse({ status: 200, description: 'Login muvaffaqiyatli' })
  @ApiResponse({ status: 401, description: 'Email yoki parol xato' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:"TEACHER"})
  @Post('login')
  create(@Body() loginTeacherDto: LoginTeacherDto, @Res() res:Response) {
    return this.teacherService.login(loginTeacherDto, res);
  }

  // GET ALL TEACHER
  @ApiOperation({summary:"ADMIN | SUPERADMIN | ADMINISTRATOR"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGEMENT, Role.SUPERADMIN, Role.ADMINISTRATOR)
  @Get("getAll")
  getAll(){
    return this.teacherService.getAllTeachers()
  }

  // GET TEACHER BY ID
  @ApiOperation({summary:"ADMIN | SUPERADMIN | ADMINISTRATOR | MANAGEMENT | TEACHER (own data)"})
  @ApiResponse({ status: 200, description: 'Bitta teacher ma\'lumotlari.' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGEMENT, Role.SUPERADMIN, Role.ADMINISTRATOR, Role.TEACHER)
  @Get(":id")
  getById(
    @Param('id', ParseIntPipe) id:number,
    @CurrentUser() user: { id: number; role: Role },
  ){
    // Teachers can only read their own data
    if (user.role === Role.TEACHER && user.id !== id) {
      throw new ForbiddenException('Faqat o\'z profilingizni ko\'rishingiz mumkin');
    }
    return this.teacherService.getById(id)
  }

  // UPDATE TEACHER BY ID SUPERADMIN ...
  @ApiOperation({summary:"ADMIN | SUPERADMIN | ADMINISTRATOR | MANAGEMENT"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGEMENT, Role.SUPERADMIN, Role.ADMINISTRATOR, Role.TEACHER)
  @Patch('update/:id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        experience: { type: 'number' },
        position: { type: 'string' },
        photo: { type: 'string', format: 'binary' }, 
      },
    },
  })
  @UseInterceptors(FileInterceptor('photo', multerOptions))
  updateTeacherById(
    @Param('id', ParseIntPipe) id:number,
    @Body() payload:UpdateTeacherDto,
    @CurrentUser() user: { id: number; role: Role },
    @UploadedFile() photo?: Express.Multer.File
  ){
    return this.teacherService.updateTeacherById(id, payload, photo, user)
  }

  // TEACHER DELETE 
  @ApiOperation({summary:"ADMIN | SUPERADMIN | ADMINISTRATOR | MANAGEMENT"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGEMENT, Role.SUPERADMIN, Role.ADMINISTRATOR)
  @Delete('delete/:id')
  deleteTeacher(@Param("id", ParseIntPipe) id:number){
    return this.teacherService.deleteTeacher(id)
  }

  // TEACHER LOGOUT
  @ApiOperation({ summary: 'TEACHER' })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli chiqildi' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Res() res: Response) {
    return this.teacherService.logout(res);
  }

}
