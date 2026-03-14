import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHomeworkResultDto } from './dto/create-homework-result.dto';
import { UpdateHomeworkResultDto } from './dto/update-homework-result.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeworkStatus, Role } from '@prisma/client';

@Injectable()
export class HomeworkResultService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateHomeworkResultDto,
    file: Express.Multer.File,
    user: { id: number; role: Role },
  ) {
    const homework = await this.prisma.homework.findUnique({
      where: { id: dto.homeworkId },
      include: { lesson: { include: { group: true } } },
    });
    if (!homework) throw new NotFoundException('Homework not found.');

    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });
    if (!student) throw new NotFoundException('Student not found.');

    // Teacher → faqat o'z guruhini tekshira oladi
    if (user.role === Role.TEACHER) {
      const teacherGroup = await this.prisma.group.findFirst({
        where: { id: homework.lesson.groupId, teacherId: user.id },
      });
      if (!teacherGroup)
        throw new ForbiddenException('Bu guruh sizga tegishli emas.');
    }

    // Admin → faqat o'z guruhini tekshira oladi
    if ([Role.ADMIN, Role.ADMINISTRATOR].includes(user.role as any)) {
      const adminGroup = await this.prisma.group.findFirst({
        where: { id: homework.lesson.groupId, userId: user.id },
      });
      if (!adminGroup)
        throw new ForbiddenException('Bu guruh sizga tegishli emas.');
    }

    const existing = await this.prisma.homeworkResult.findFirst({
      where: { homeworkId: dto.homeworkId, studentId: dto.studentId },
    });
    if (existing)
      throw new ConflictException(
        "Bu student uchun allaqachon ball qo'yilgan.",
      );

    const status =
      dto.score >= 60 ? HomeworkStatus.APPROVED : HomeworkStatus.REJECTED;

    const result = await this.prisma.homeworkResult.create({
      data: {
        homeworkId: dto.homeworkId,
        studentId: dto.studentId,
        title: dto.title,
        file: file ? file.path : null,
        score: dto.score,
        status,
        teacherId: user.role === Role.TEACHER ? user.id : null,
        userId: (
          [Role.ADMIN, Role.SUPERADMIN, Role.ADMINISTRATOR] as Role[]
        ).includes(user.role)
          ? user.id
          : null,
      },
    });

    return {
      success: true,
      message: "Ball muvaffaqiyatli qo'yildi.",
      data: result,
    };
  }

  async findAll(user: { id: number; role: Role }, status?: HomeworkStatus) {
    // SUPERADMIN → hamma
    if (user.role === Role.SUPERADMIN || user.role === Role.ADMIN) {
      const results = await this.prisma.homeworkResult.findMany({
        where: status ? { status } : {},
        include: {
          student: { select: { id: true, fullName: true } },
          homework: {
            select: {
              id: true,
              title: true,
              lesson: {
                select: {
                  id: true,
                  title: true,
                  group: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
        orderBy: { created_at: 'asc' },
      });
      return { success: true, data: results };
    }

    // TEACHER → faqat o'ziniki
    if (user.role === Role.TEACHER) {
      const results = await this.prisma.homeworkResult.findMany({
        where: { status, teacherId: user.id },
        include: {
          student: { select: { id: true, fullName: true } },
          homework: {
            select: {
              id: true,
              title: true,
              lesson: {
                select: {
                  id: true,
                  title: true,
                  group: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
        orderBy: { created_at: 'asc' },
      });
      return { success: true, data: results };
    }
  }

  async findOne(id: number, user: { id: number; role: Role }) {
    const result = await this.prisma.homeworkResult.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, fullName: true } },
        homework: {
          select: {
            id: true,
            title: true,
            lesson: {
              select: {
                id: true,
                title: true,
                group: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
    if (!result) throw new NotFoundException('Result not found.');

    // Teacher tekshiruvi
    if (user.role === Role.TEACHER && result.teacherId !== user.id) {
      throw new ForbiddenException('Bu natija sizga tegishli emas.');
    }

    return { success: true, data: result };
  }

  async update(
    id: number,
    dto: UpdateHomeworkResultDto,
    file: Express.Multer.File,
    user: { id: number; role: Role },
  ) {
    const result = await this.prisma.homeworkResult.findUnique({
      where: { id },
      include: {
        homework: { include: { lesson: { include: { group: true } } } },
      },
    });
    if (!result) throw new NotFoundException('Result not found.');

    // Teacher → faqat o'z guruhini
    if (user.role === Role.TEACHER) {
      const teacherGroup = await this.prisma.group.findFirst({
        where: { id: result.homework.lesson.groupId, teacherId: user.id },
      });
      if (!teacherGroup)
        throw new ForbiddenException('Bu guruh sizga tegishli emas.');
    }

    // Admin → faqat o'z guruhini
    if ([Role.ADMIN, Role.ADMINISTRATOR].includes(user.role as any)) {
      const adminGroup = await this.prisma.group.findFirst({
        where: { id: result.homework.lesson.groupId, userId: user.id },
      });
      if (!adminGroup)
        throw new ForbiddenException('Bu guruh sizga tegishli emas.');
    }

    // SUPERADMIN → hech qanday tekshiruv yo'q ✅

    const score = dto.score ?? result.score;
    const status =
      score >= 60 ? HomeworkStatus.APPROVED : HomeworkStatus.REJECTED;

    const updated = await this.prisma.homeworkResult.update({
      where: { id },
      data: {
        title: dto.title ?? result.title,
        score,
        status,
        file: file ? file.path : result.file,
        teacherId: user.role === Role.TEACHER ? user.id : result.teacherId,
        userId: (
          [Role.ADMIN, Role.SUPERADMIN, Role.ADMINISTRATOR] as Role[]
        ).includes(user.role)
          ? user.id
          : result.userId,
      },
    });

    return { success: true, message: 'Natija yangilandi.', data: updated };
  }

}
