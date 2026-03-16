import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class LessonService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateLessonDto, user: { id: number; role: Role }) {
    const existLesson = await this.prisma.lesson.findFirst({
      where: { title: payload.title },
    });

    if (existLesson) {
      throw new ConflictException('This lesson title already created.');
    }

    const exist = await this.prisma.group.findUnique({
      where: { id: payload.groupId },
    });

    if (!exist) throw new NotFoundException('Group Id not found');

    await this.prisma.lesson.create({
      data: {
        ...payload,
        teacherId: user.role === Role.TEACHER ? user.id : null,
        userId:
          user.role === Role.ADMIN ||
          user.role === Role.SUPERADMIN ||
          user.role === Role.ADMINISTRATOR
            ? user.id
            : null,
      },
    });

    return {
      success: true,
      message: 'Lesson created successfully.',
    };
  }

  async findAll() {
    const lessons = await this.prisma.lesson.findMany({
      orderBy: { created_at: 'asc' }
    });

    return {
      success: true,
      data: lessons,
    };
  }

  async findOne(id: number, user: { id: number; role: Role }) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        group: {
          select: { id: true, name: true, status: true }
        },
        attendances: {
          orderBy: { created_at: 'asc' }
        },
        homework: {
          orderBy: { created_at: 'asc' }
        },
        lessonVideos: {
          orderBy: { created_at: 'asc' }
        },
        ratings: {
          orderBy: { created_at: 'asc' }
        },
      }
    })

    if (!lesson) throw new NotFoundException('Lesson not found.')

    if (user.role === Role.STUDENT) {
      const student = await this.prisma.student.findFirst({
        where: { id: user.id }
      })

      if (!student) throw new NotFoundException('Student not found.')

      const studentGroup = await this.prisma.studentGroup.findFirst({
        where: { studentId: student.id, groupId: lesson.groupId }
      })

      if (!studentGroup) throw new ForbiddenException('Bu guruh sizga tegishli emas.')

      const rating = await this.prisma.rating.findFirst({
        where: { lessonId: id, studentId: student.id }
      })

      return {
        success: true,
        data: {
          ...lesson,
          homework: rating ? lesson.homework : [],
          lessonVideos: rating ? lesson.lessonVideos : [],
          isRated: !!rating
        }
      }
    }

    return { success: true, data: lesson }
  } 

  async update(user:{id:number, role:Role} ,id:number, payload: UpdateLessonDto) {

     if (payload.groupId) {
    const exist = await this.prisma.group.findUnique({
      where: { id: payload.groupId },
    });
    if (!exist) throw new NotFoundException('Group Id not found');
  }

    const updated = await this.prisma.lesson.update({
      where: { id },
      data: {
        ...payload,
        teacherId: user.role === Role.TEACHER ? user.id : null,
        userId:
          user.role === Role.ADMIN ||
          user.role === Role.SUPERADMIN ||
          user.role === Role.ADMINISTRATOR
            ? user.id
            : null,
      },
    });
    return {
      success: true,
      message: "Lesson's information has been changed.",
      data: updated,
    };
  }

  async remove(id: number) {
    const exist = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!exist) throw new NotFoundException('Lesson Id not found.');

    return {
      success: true,
      message: "Lesson's information has been deleted.",
    };
  }
}
