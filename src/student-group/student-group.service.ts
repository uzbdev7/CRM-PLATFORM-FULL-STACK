import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentGroupDto } from './dto/create-student-group.dto';
import { UpdateStudentGroupDto } from './dto/update-student-group.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Status } from '@prisma/client';

@Injectable()
export class StudentGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async createStudentGroup(payload: CreateStudentGroupDto) {
    const existGroup = await this.prisma.group.findUnique({
      where: { id: payload.groupId },
    });

    if (!existGroup) throw new NotFoundException('Group Id not found.');

    const existStudent = await this.prisma.student.findUnique({
      where: { id: payload.studentId },
    });

    if (!existStudent) throw new NotFoundException('Student Id not found.');

    const alreadyExists = await this.prisma.studentGroup.findUnique({
      where: {
        groupId_studentId: {
          groupId: payload.groupId,
          studentId: payload.studentId,
        },
      },
    });

    if (alreadyExists)
      throw new BadRequestException('Student already exists in this group!');

    await this.prisma.studentGroup.create({
      data: payload,
    });

    return {
      success: true,
      message: 'Student added in group',
    };
  }

  async getAllStudentGroupByStatus(status?: Status) {
    const studentGroup = await this.prisma.studentGroup.findMany({
      where: status ? { status } : {},
    });

    return {
      success: true,
      data: studentGroup,
    };
  }

  async getById(id: number) {
    const exist = await this.prisma.studentGroup.findUnique({
      where: { id },
    });

    if (!exist) throw new NotFoundException('This id not found.');

    const getAll = await this.prisma.studentGroup.findUnique({
      where: { id },
      include: {
        group: {
          select: {
            id: true,
            courseId: true,
            name: true,
            startDate: true,
            startTime: true,
            weeKDays: true,
            status: true,
            course: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: getAll,
    };
  }

  async update(id: number, payload: UpdateStudentGroupDto) {
    const existStudentGroup = await this.prisma.studentGroup.findUnique({
      where: { id },
    });
    if (!existStudentGroup)
      throw new NotFoundException('StudentGroup not found');

    if (payload.studentId) {
      const existStudent = await this.prisma.student.findUnique({
        where: { id: payload.studentId },
      });
      if (!existStudent) throw new NotFoundException('Student not found');
    }

    if (payload.groupId) {
      const existGroup = await this.prisma.group.findUnique({
        where: { id: payload.groupId },
      });
      if (!existGroup) throw new NotFoundException('Group not found');
    }

    return this.prisma.studentGroup.update({
      where: { id },
      data: payload,
    });
  }

  async remove(id: number) {
    const existStudentGroup = await this.prisma.studentGroup.findUnique({
      where: { id },
    });
    if (!existStudentGroup)
      throw new NotFoundException('StudentGroup Id not found');

    await this.prisma.studentGroup.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'StudentGroup deleted successfully',
    };
  }
}
