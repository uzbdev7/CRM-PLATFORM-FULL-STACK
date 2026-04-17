import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role, Status } from '@prisma/client';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags("Courses")
@Controller('course')
@ApiCookieAuth("access_token")
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @ApiOperation({summary:"ADMIN | SUPERADMIN"})
  @UseGuards(JwtAuthGuard,RoleGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Post("create")
  createCourse(@Body() payload: CreateCourseDto) {
    return this.courseService.createCourse(payload);
  }

  @ApiOperation({summary:"Hamma uchun"})
  @Get('all/status')
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: Status
  })
  getAllCourses(@Query('status') status?: Status) {
    return this.courseService.getAllCourses(status);
  }

  @ApiOperation({summary:"Hamma uchun"})
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id:number){
    return this.courseService.getCourseById(id)
  }

  @ApiOperation({summary:"SUPERADMIN | ADMIN | ADMINISTRATOR"})
  @UseGuards(JwtAuthGuard,RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id:number,
    @Body() dto:UpdateCourseDto
  ){
    return this.courseService.updateCourseById(id,dto)
  }

  @ApiOperation({summary:"SUPERADMIN | ADMIN | ADMINISTRATOR"})
  @UseGuards(JwtAuthGuard,RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR, Role.SUPERADMIN)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id:number){
    return this.courseService.getCourseById(id)
  }

}
