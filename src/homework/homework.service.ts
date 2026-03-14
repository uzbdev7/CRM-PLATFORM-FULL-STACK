import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class HomeworkService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createHomeworkDto: CreateHomeworkDto,
    file: Express.Multer.File,
    user: { id: number; role: Role }
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: createHomeworkDto.lessonId }
    })
    if (!lesson) throw new NotFoundException("Lesson not found.")

    const existing = await this.prisma.homework.findFirst({
    where: { lessonId: createHomeworkDto.lessonId }
  })
    if (existing) throw new ConflictException("Bu lesson uchun homework allaqachon mavjud.")

    const homework = await this.prisma.homework.create({
      data: {
        ...createHomeworkDto,
        file: file ? file.path : null,
        teacherId: user.role === Role.TEACHER ? user.id : null,
        userId: ([Role.ADMIN, Role.SUPERADMIN, Role.ADMINISTRATOR] as Role[]).includes(user.role) ? user.id : null,
      }
    })

    return { success: true, message: "Homework created successfully", data: homework }
  }

  async findAll(user: { id: number; role: Role }) {

  if (user.role === Role.TEACHER) {
    const homeworks = await this.prisma.homework.findMany({
      where: {
        teacherId: user.id  // ← faqat o'zi yaratgan
        
      },
      orderBy: { created_at: 'asc' },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            groupId: true,
            group: { select: { id: true, name: true, status: true } }
          }
        }
      }
    })
    return { success: true, data: homeworks }
  }
// SuperAdmin uchun..
  const homeworks = await this.prisma.homework.findMany({
    orderBy: { created_at: 'asc' },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          groupId: true,
          group: { select: { id: true, name: true, status: true } }
        }
      }
    }
  })

  return { success: true, data: homeworks }
  }

  async findOne(lessonId: number, user: { id: number; role: Role }) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { group: true }
    })
    if (!lesson) throw new NotFoundException("Lesson not found.")

    if (user.role === Role.TEACHER) {
      const teacherGroup = await this.prisma.group.findFirst({
        where: { id: lesson.groupId, teacherId: user.id }
      })
      if (!teacherGroup) throw new ForbiddenException("Bu guruh sizga tegishli emas.")
    }

    if ([Role.ADMIN, Role.ADMINISTRATOR].includes(user.role as any)) {
      const adminGroup = await this.prisma.group.findFirst({
        where: { id: lesson.groupId, userId: user.id }
      })
      if (!adminGroup) throw new ForbiddenException("Bu guruh sizga tegishli emas.")
    }

    const homeworks = await this.prisma.homework.findMany({
      where: { lessonId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            groupId: true,
            group: { select: { id: true, name: true, status: true } }
          }
        }
      }
    })

    return { success: true, data: homeworks }
  }

  async update(
    id: number,
    updateHomeworkDto: UpdateHomeworkDto,
    file: Express.Multer.File,
    user: { id: number; role: Role }
  ) {
    const homework = await this.prisma.homework.findUnique({
      where: { id },
      include: { lesson: true }
    })
    if (!homework) throw new NotFoundException("Homework not found.")

    if (user.role === Role.TEACHER) {
      const teacherGroup = await this.prisma.group.findFirst({
        where: { id: homework.lesson.groupId, teacherId: user.id }
      })
      if (!teacherGroup) throw new ForbiddenException("Bu guruh sizga tegishli emas.")
    }

    if ([Role.ADMIN, Role.ADMINISTRATOR].includes(user.role as any)) {
      const adminGroup = await this.prisma.group.findFirst({
        where: { id: homework.lesson.groupId, userId: user.id }
      })
      if (!adminGroup) throw new ForbiddenException("Bu guruh sizga tegishli emas.")
    }

    const updated = await this.prisma.homework.update({
      where: { id },
      data: {
        ...updateHomeworkDto,
        file: file ? file.path : homework.file, // ← yangi file kelmasa eskisi qoladi
      }
    })

    return { success: true, message: "Homework updated successfully", data: updated }
  }

  async remove(id: number, user: { id: number; role: Role }) {
    const homework = await this.prisma.homework.findUnique({
      where: { id },
      include: { lesson: true }
    })
    if (!homework) throw new NotFoundException("Homework not found.")

    if (user.role === Role.TEACHER) {
      const teacherGroup = await this.prisma.group.findFirst({
        where: { id: homework.lesson.groupId, teacherId: user.id }
      })
      if (!teacherGroup) throw new ForbiddenException("Bu guruh sizga tegishli emas.")
    }

    if ([Role.ADMIN, Role.ADMINISTRATOR].includes(user.role as any)) {
      const adminGroup = await this.prisma.group.findFirst({
        where: { id: homework.lesson.groupId, userId: user.id }
      })
      if (!adminGroup) throw new ForbiddenException("Bu guruh sizga tegishli emas.")
    }

    await this.prisma.homework.delete({ where: { id } })

    return { success: true, message: "Homework deleted successfully" }
  }
}
