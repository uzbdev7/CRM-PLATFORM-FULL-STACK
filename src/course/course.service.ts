import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Status } from '@prisma/client';

@Injectable()
export class CourseService {
  constructor(private prisma:PrismaService){}
  
  async createCourse(payload: CreateCourseDto) {

    const existCourse = await this.prisma.course.findUnique({
      where: {name:payload.name}
    })

    if(existCourse){
      throw new ConflictException("Course name already exists")
    }

    await this.prisma.course.create({
      data:payload
    })

    return {
      success:true,
      message:"Course created"
      
    }
  }

  async getAllCourses(status?: Status) {
  const courses = await this.prisma.course.findMany({
    where: status ? { status } : {}
  });

    return {
      success: true,
      data: courses
    };
  }

  async getCourseById(id:number){
    const course = await this.prisma.course.findUnique({
      where:{id},
      include:{
        groups:true
      }
    })

    if(!course) throw new NotFoundException(`Course ${id} not found`)

    return {
      success:true,
      data:course
    }
  }

  async updateCourseById(id:number,payload:UpdateCourseDto){
    const existCourse = await this.prisma.course.findUnique({where:{id}})

    if(!existCourse) throw new  NotFoundException(`Course ${id} not found.`)

    const updated = await this.prisma.course.update({
      where:{id},
    data:payload
    })

    return {
      success:true,
      message: "Course has been updated.",
      data:updated
    }
  }

  async deleteCourseById(id:number){
    const course = await this.prisma.course.findUnique({where:{id}})

    if(!course) throw new NotFoundException(`Course ${id} not found`)

    await this.prisma.course.delete({where:{id}})

    return {
      success:true,
      message: `course ${id} has been deleted`
    }
  }

}