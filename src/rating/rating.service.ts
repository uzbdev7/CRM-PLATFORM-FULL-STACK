import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RatingService {
  constructor(private readonly prisma:PrismaService){}
  
  async create(createRatingDto: CreateRatingDto, user: { id: number; role: Role }) {

    console.log('user:', user)

    const student = await this.prisma.student.findUnique({
      where: { id: user.id }
    })
    if (!student) throw new NotFoundException("Student not found.")

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: createRatingDto.lessonId },
      include: { group: true }
    })
    if (!lesson) throw new NotFoundException("Lesson not found.")

    const studentGroup = await this.prisma.studentGroup.findFirst({
      where: { studentId: student.id, groupId: lesson.groupId }
    })
    if (!studentGroup) throw new ForbiddenException("Bu guruh sizga tegishli emas.")

    const existing = await this.prisma.rating.findFirst({
      where: { lessonId: createRatingDto.lessonId, studentId: student.id }
    })
    if (existing) throw new ConflictException("Siz bu darsni allaqachon baholagansiz.")

    const rating = await this.prisma.rating.create({
      data: {
        lessonId: createRatingDto.lessonId,
        score: createRatingDto.score,
        studentId: student.id,
        teacherId: lesson.group.teacherId, 
      },
      include: {
        lesson: { select: { id: true, title: true } },
        teacher: { select: { id: true, fullName: true } }
      }
    })

    return { success: true, message: "Baholash muvaffaqiyatli amalga oshirildi.", data: rating }
  }

  async findMyRatings(user: { id: number; role: Role }) {

    const student = await this.prisma.student.findUnique({
      where: { id: user.id }
    })
    if (!student) throw new NotFoundException("Student not found.")

    const ratings = await this.prisma.rating.findMany({
      where: { studentId: student.id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            group: { select: { id: true, name: true } }
          }
        },
        teacher: { select: { id: true, fullName: true } }
      },
      orderBy: { created_at: 'asc' }
    })

    return { success: true, data: ratings }
  }

  // SUPERADMIN → hamma ratinglar
  async findAll() {
    const ratings = await this.prisma.rating.findMany({
      include: {
        lesson: { select: { id: true, title: true } },
        teacher: { select: { id: true, fullName: true } },
        student: { select: { id: true, fullName: true } }
      },
      orderBy: { created_at: 'asc' }
    })
    return { success: true, data: ratings }
  }

  // TEACHER → o'ziga berilgan ratinglar
  async findTeacherRatings(user: { id: number; role: Role }) {
    console.log('user:', user)

    const teacher = await this.prisma.teacher.findUnique({
      where: { id: user.id }
    })
    if (!teacher) throw new NotFoundException("Teacher not found.")

    const ratings = await this.prisma.rating.findMany({
      where: { teacherId: teacher.id },
      include: {
        lesson: { select: { id: true, title: true } },
        student: { select: { id: true, fullName: true } }
      },
      orderBy: { created_at: 'asc' }
    })

    return { success: true, data: ratings }
  }
}
