import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLessonVideoDto } from './dto/create-lesson-video.dto';
import { UpdateLessonVideoDto } from './dto/update-lesson-video.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class LessonVideoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createLessonVideoDto: CreateLessonVideoDto,
    file: Express.Multer.File,
    user: { id: number; role: Role }
  ) {
    if (!file) throw new BadRequestException("Video file is required.")

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: createLessonVideoDto.lessonId }
    })
    if (!lesson) throw new NotFoundException("Lesson not found.")

    const video = await this.prisma.lessonVideo.create({
      data: {
        ...createLessonVideoDto,
        file: file.path,
        teacherId: user.role === Role.TEACHER ? user.id : null,
        userId: ([Role.ADMIN, Role.SUPERADMIN, Role.ADMINISTRATOR] as Role[]).includes(user.role) ? user.id : null,
      }
    })

    return { success: true, message: "Lesson video created successfully", data: video }
  }

async findAll(user: { id: number; role: Role }) {
  if (user.role === Role.TEACHER) {
    const videos = await this.prisma.lessonVideo.findMany({
      where: {
        teacherId: user.id  // ← faqat o'zi yaratgan
      },
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
    return { success: true, data: videos }
  }

  if ([Role.ADMIN, Role.ADMINISTRATOR].includes(user.role as any)) {
    const videos = await this.prisma.lessonVideo.findMany({
      where: {
        userId: user.id  // ← faqat o'zi yaratgan
      },
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
    return { success: true, data: videos }
  }

  // SUPERADMIN → hamma videolar
  const videos = await this.prisma.lessonVideo.findMany({
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

  return { success: true, data: videos }
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

    const videos = await this.prisma.lessonVideo.findMany({
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

    return { success: true, data: videos }
  }

  async update(
    id: number,
    updateLessonVideoDto: UpdateLessonVideoDto,
    file: Express.Multer.File,
    user: { id: number; role: Role }
  ) {
    const video = await this.prisma.lessonVideo.findUnique({
      where: { id },
      include: { lesson: true }
    })
    if (!video) throw new NotFoundException("Lesson video not found.")

    if (user.role === Role.TEACHER) {
      const teacherGroup = await this.prisma.group.findFirst({
        where: { id: video.lesson.groupId, teacherId: user.id }
      })
      if (!teacherGroup) throw new ForbiddenException("Bu guruh sizga tegishli emas.")
    }

    if ([Role.ADMIN, Role.ADMINISTRATOR].includes(user.role as any)) {
      const adminGroup = await this.prisma.group.findFirst({
        where: { id: video.lesson.groupId, userId: user.id }
      })
      if (!adminGroup) throw new ForbiddenException("Bu guruh sizga tegishli emas.")
    }

    const updated = await this.prisma.lessonVideo.update({
      where: { id },
      data: {
        ...updateLessonVideoDto,
        file: file ? file.path : video.file, 
      }
    })

    return { success: true, message: "Lesson video updated successfully", data: updated }
  }

  async remove(id: number, user: { id: number; role: Role }) {
    const video = await this.prisma.lessonVideo.findUnique({
      where: { id },
      include: { lesson: true }
    })
    if (!video) throw new NotFoundException("Lesson video not found.")

    if (user.role === Role.TEACHER) {
      const teacherGroup = await this.prisma.group.findFirst({
        where: { id: video.lesson.groupId, teacherId: user.id }
      })
      if (!teacherGroup) throw new ForbiddenException("Bu guruh sizga tegishli emas.")
    }

    if ([Role.ADMIN, Role.ADMINISTRATOR].includes(user.role as any)) {
      const adminGroup = await this.prisma.group.findFirst({
        where: { id: video.lesson.groupId, userId: user.id }
      })
      if (!adminGroup) throw new ForbiddenException("Bu guruh sizga tegishli emas.")
    }

    await this.prisma.lessonVideo.delete({ where: { id } })

    return { success: true, message: "Lesson video deleted successfully" }
  }
}
