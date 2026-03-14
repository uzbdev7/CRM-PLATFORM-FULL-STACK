import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor (private readonly prisma:PrismaService){}

  async create(createAttendanceDto: CreateAttendanceDto, user: { id: number; role: Role }) {

      const lessonId = await this.prisma.lesson.findUnique({
        where:{id:createAttendanceDto.lessonId}
      })

      if(!lessonId) throw new NotFoundException("Lesson Id not found.")


      const studentId = await this.prisma.student.findUnique({
        where:{id:createAttendanceDto.studentId}
      })

      if(!studentId) throw new NotFoundException("Student Id not found.")
        
      const attendance = await this.prisma.attendance.create({
        data:{
          ...createAttendanceDto,
          teacherId: user.role === Role.TEACHER ? user.id : null,
          userId: ([Role.ADMIN, Role.SUPERADMIN, Role.ADMINISTRATOR]as Role[]) .includes(user.role) ? user.id : null,
        }
      })

      return {
        success:true,
        message:"Attendance created successfully",
        data:attendance
      }
    }

  async findAll() {
      const attendance = await this.prisma.attendance.findMany()
      return {
        success:true,
        data:attendance
      }
    }

  async findOne(lessonId: number, user: { id: number; role: Role }) {
      
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { group: true }
    })
    if (!lesson) throw new NotFoundException("Lesson not found.")

    if (user.role === Role.TEACHER) {
      const teacherGroup = await this.prisma.group.findFirst({
        where: {
          id: lesson.groupId,
          teacherId: user.id  
        }
      })
      if (!teacherGroup) throw new ForbiddenException("Bu guruh sizga tegishli emas.")
    }
      const attendance = await this.prisma.attendance.findMany({
        where: { lessonId },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              status: true
            }
          },
          lesson: {
            select: {
              id: true,
              title: true,
              groupId: true,
              userId: true,
              teacherId: true,
              group: {
                select: {
                  id: true,
                  name: true,
                  status: true
                }
              }
            }
          }
        }
      })

    return {
      success: true,
      data: attendance
    }
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto, user: { id: number; role: Role }) {

     const lesson = await this.prisma.lesson.findUnique({
      where:{id:updateAttendanceDto.lessonId}
    })

    if (!lesson) throw new NotFoundException("Lesson Id not found.")

    const student = await this.prisma.student.findUnique({
      where:{id:updateAttendanceDto.studentId}
    })

    if (!student) throw new NotFoundException("Stundent Id not found.")

    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: { lesson: true }
    })
    if (!attendance) throw new NotFoundException("Attendance not found.")

    if (user.role === Role.TEACHER) {
      const teacherGroup = await this.prisma.group.findFirst({
        where: { id: attendance.lesson.groupId, teacherId: user.id }
      })
      if (!teacherGroup) throw new ForbiddenException("Bu guruh sizga tegishli emas.")
    }

    const updated = await this.prisma.attendance.update({
      where: { id },
      data: updateAttendanceDto
    })

    return {
      success: true,
      message: "Attendance updated successfully",
      data: updated
    }
  }

  async remove(id: number, user: { id: number; role: Role }) {

    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: { lesson: true }
    })

    if (!attendance) throw new NotFoundException("Attendance not found.")

    if (user.role === Role.TEACHER) {
      const teacherGroup = await this.prisma.group.findFirst({
        where: { id: attendance.lesson.groupId, teacherId: user.id }
      })
      if (!teacherGroup) throw new ForbiddenException("Bu guruh sizga tegishli emas.")
    }

    await this.prisma.attendance.delete({ where: { id } })

    return {
      success: true,
      message: "Attendance deleted successfully"
    }
  }

}
