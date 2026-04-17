import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateHomeworkResponseDto } from './dto/create-homework-response.dto';
import { UpdateHomeworkResponseDto } from './dto/update-homework-response.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HomeworkStatus, Role } from '@prisma/client';

@Injectable()
export class HomeworkResponseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateHomeworkResponseDto,
    file: Express.Multer.File,
    user: { id: number; role: Role }
  ) {
    // Student ni top
    const student = await this.prisma.student.findUnique({
      where: { id: user.id }
    })
    if (!student) throw new NotFoundException("Student not found.")

    // Homework mavjudmi?
    const homework = await this.prisma.homework.findUnique({
      where: { id: dto.homeworkId }
    })
    if (!homework) throw new NotFoundException("Homework not found.")

    // Deadline tekshiruvi
    const deadline = new Date(homework.created_at)
    deadline.setHours(deadline.getHours() + (homework.durationTime ?? 16))
    const now = new Date()

    // Student allaqachon yuborganmi?
    const existing = await this.prisma.homeworkResponse.findFirst({
      where: { homeworkId: dto.homeworkId, studentId: student.id }
    })
    if (existing) throw new ConflictException("Siz bu vazifani allaqachon yuborgansiz.")

    // Status — deadline o'tganmi?
    const status = now > deadline 
      ? HomeworkStatus.DELAY 
      : HomeworkStatus.PENDING

    const response = await this.prisma.homeworkResponse.create({
      data: {
        homeworkId: dto.homeworkId,
        studentId: student.id,
        title: dto.title,
        file: file ? file.path : null,
        status,
      }
    })

    return { success: true, message: "Vazifa muvaffaqiyatli yuborildi.", data: response }
  }

  async findMyResponses(user: { id: number; role: Role }) {
    const student = await this.prisma.student.findUnique({
      where: { id: user.id }
    })
    if (!student) throw new NotFoundException("Student not found.")

    const responses = await this.prisma.homeworkResponse.findMany({
      where: { studentId: student.id },
      include: {
        homework: {
          select: {
            id: true,
            title: true,
            durationTime: true,
            created_at: true,
            lesson: {
              select: {
                id: true,
                title: true,
                group: { select: { id: true, name: true } }
              }
            }
          }
        }
      },
      orderBy: { created_at: 'asc' }
    })

    return { success: true, data: responses }
  }

  async update(
    id: number,
    dto: UpdateHomeworkResponseDto,
    file: Express.Multer.File,
    user: { id: number; role: Role }
  ) {
    const student = await this.prisma.student.findUnique({
      where: { id: user.id }
    })
    if (!student) throw new NotFoundException("Student not found.")

    const response = await this.prisma.homeworkResponse.findUnique({
      where: { id },
      include: { homework: true }
    })
    if (!response) throw new NotFoundException("Response not found.")

    // Faqat o'ziniki
    if (response.studentId !== student.id) {
      throw new ForbiddenException("Bu vazifa sizga tegishli emas.")
    }

    // Deadline tekshiruvi — tugagan bo'lsa update qila olmaydi
    const deadline = new Date(response.homework.created_at)
    deadline.setHours(deadline.getHours() + (response.homework.durationTime ?? 16))
    
    if (new Date() > deadline) {
      throw new ForbiddenException("Deadline tugagan, vazifani yangilab bo'lmaydi.")
    }

    const updated = await this.prisma.homeworkResponse.update({
      where: { id },
      data: {
        title: dto.title ?? response.title,
        file: file ? file.path : response.file,
      }
    })

    return { success: true, message: "Vazifa yangilandi.", data: updated }
  }

// TEACHER UCHUN YUKLAMAGAN STUDENTLARNI ROYHATI.
    async findMissedStudents(homeworkId: number, user: { id: number; role: Role }) {
    const homework = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
      include: { lesson: { include: { group: true } } }
    })
    if (!homework) throw new NotFoundException("Homework not found.")

    // Teacher o'z guruhimi tekshir
    if (user.role === Role.TEACHER) {
      const teacherGroup = await this.prisma.group.findFirst({
        where: { id: homework.lesson.groupId, teacherId: user.id }
      })
      if (!teacherGroup) throw new ForbiddenException("Bu guruh sizga tegishli emas.")
    }

    // Guruhning barcha studentlari
    const studentGroups = await this.prisma.studentGroup.findMany({
      where: { groupId: homework.lesson.groupId },
      include: { student: { select: { id: true, fullName: true } } }
    })

    // Response yuborgan studentlar
    const responses = await this.prisma.homeworkResponse.findMany({
      where: { homeworkId }
    })
    const submittedIds = responses.map(r => r.studentId)

    // Yuklamagan studentlar
    const missedStudents = studentGroups
      .filter(sg => !submittedIds.includes(sg.studentId))
      .map(sg => sg.student)

    return { success: true, data: missedStudents }
  }

  // UYGA VAZIFA UCHUN KUTAYOTGAN JAVOBLAR (Bajarilgan, lekin baholanmagan yoki baholangan)
  async findResponsesByHomework(homeworkId: number, user: { id: number; role: Role }) {
    const homework = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
      include: { lesson: { include: { group: true } } }
    })
    if (!homework) throw new NotFoundException("Homework not found.")

    // Teacher o'z guruhimi tekshir (ADMIN/SUPERADMIN uchun bu tekshiruv shart emas)
    if (user.role === Role.TEACHER) {
      const teacherGroup = await this.prisma.group.findFirst({
        where: { id: homework.lesson.groupId, teacherId: user.id }
      })
      if (!teacherGroup) throw new ForbiddenException("Bu guruh sizga tegishli emas.")
    }

    const responses = await this.prisma.homeworkResponse.findMany({
      where: { homeworkId },
      include: {
        student: { select: { id: true, fullName: true } }
      },
      orderBy: { created_at: 'asc' }
    });

    return { success: true, data: responses };
  }
}
