import { Controller, Post, Body, HttpCode, HttpStatus, Res, UseGuards, UseInterceptors, Request, Req, UploadedFile, Get, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { StudentService } from './student.service';
import { LoginStudentDto } from './dto/Loginstudent.dto';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { Response } from 'express';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiCookieAuth("access_token")
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}
  @Post('create')
  @ApiOperation({ summary: 'SUPERADMIN | ADMINISTRATOR | ADMIN' })
  @UseGuards(JwtAuthGuard,RoleGuard)  
  @Roles(Role.ADMIN, Role.MANAGEMENT, Role.SUPERADMIN, Role.ADMINISTRATOR)
  @UseInterceptors(FileInterceptor('photo', multerOptions))
  @ApiConsumes('multipart/form-data')

  register(@Body() dto:CreateStudentDto,
        @UploadedFile() photo? : Express.Multer.File,
  ){
    return this.studentService.createStudent(dto, photo)
  }

    @ApiOperation({ summary: 'STUDENT' })
    @ApiResponse({ status: 200, description: 'Login muvaffaqiyatli' })
    @ApiResponse({ status: 401, description: 'Email yoki parol xato' })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    create(@Body() Dto: LoginStudentDto, @Res() res:Response) {
      return this.studentService.login(Dto, res);
    }

    @ApiOperation({ summary: 'STUDENT' })
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(Role.STUDENT)
    @Get('my-homeworks')
    findStudentHomeworks(
      @CurrentUser() user: { id: number; role: Role }
    ) {
      return this.studentService.findStudentHomeworks(user)
    }

  
    @ApiOperation({summary:"ADMIN | SUPERADMIN | ADMINISTRATOR"})
    @ApiResponse({ status: 200, description: 'Barcha talabalar ro\'yhati' })
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(Role.ADMIN, Role.MANAGEMENT, Role.SUPERADMIN, Role.ADMINISTRATOR)
    @Get("getAll")
    getAll(){
      return this.studentService.getAllStudents()
    }


    @ApiOperation({summary:"ADMIN | SUPERADMIN | ADMINISTRATOR | MANAGEMENT"})
    @ApiResponse({ status: 200, description: 'Bitta talaba ma\'lumotlari.' })
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(Role.ADMIN, Role.MANAGEMENT, Role.SUPERADMIN, Role.ADMINISTRATOR)
    @Get(":id")
    getById(@Param('id', ParseIntPipe) id:number){
      return this.studentService.getById(id)
    }

    @ApiOperation({summary:"ADMIN | SUPERADMIN | ADMINISTRATOR | MANAGEMENT"})
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(Role.ADMIN, Role.MANAGEMENT, Role.SUPERADMIN, Role.ADMINISTRATOR)
    @Patch('update/:id')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          fullName: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' },
          birth_date:{type:"date"},
          photo: { type: 'string', format: 'binary' }, 
        },
      },
    })
    @UseInterceptors(FileInterceptor('photo', multerOptions))
    updateTeacherById(
      @Param('id', ParseIntPipe) id:number,
      @Body() payload:UpdateStudentDto,
      @UploadedFile() photo?: Express.Multer.File
    ){

      return this.studentService.updateStudentById(id, payload, photo)
    }

    @ApiOperation({summary:"ADMIN | SUPERADMIN | ADMINISTRATOR | MANAGEMENT"})
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(Role.ADMIN, Role.MANAGEMENT, Role.SUPERADMIN, Role.ADMINISTRATOR)
    @Delete('delete/:id')
    deleteStudent(@Param("id", ParseIntPipe) id:number){
      return this.studentService.deleteStudent(id)
    }
    
    @ApiOperation({ summary: 'STUDENT' })
    @ApiResponse({ status: 200, description: 'Muvaffaqiyatli chiqildi' })
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    logout(@Res() res: Response) {
      return this.studentService.logout(res);
    }
  
}
