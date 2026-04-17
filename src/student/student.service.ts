import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginStudentDto } from './dto/Loginstudent.dto';
import * as bcrypt from 'bcrypt'
import { Response } from 'express';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateStudentDto } from './dto/create-student.dto';
import { Role } from '@prisma/client';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '../prisma/prisma.service';
import { sendWelcomeMail } from '../helpers/mail.helper';


@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private mailerService: MailerService
  ) { }

  async createStudent(dto: CreateStudentDto, photo?: Express.Multer.File) {

    const hashedPassword = await bcrypt.hash(dto.password, 10)
    const photoPath = photo ? `/uploads/photos/${photo.filename}` : null

    try {
      const student = await this.prisma.student.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          password: hashedPassword,
          birt_date: new Date(dto.birt_date),
          photo: photoPath,
        },
      });

      await sendWelcomeMail(this.mailerService, dto.email, dto.fullName, dto.password);

      return { message: 'Student yaratildi', studentId: student.id, };
    } catch (error: any) {
      if (error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
        throw new ConflictException(`Bu email manzili allaqachon ro'yxatdan o'tgan: ${dto.email}`);
      }
      throw error;
    }
  }

  // homework.service.ts
  async findStudentHomeworks(user: { id: number; role: Role }) {

    const student = await this.prisma.student.findFirst({
      where: { id: user.id }
    })

    if (!student) throw new NotFoundException("Student not found.")

    // StudentGroup orqali student qaysi groupda ekanini top
    const studentGroups = await this.prisma.studentGroup.findMany({
      where: { studentId: student.id }
    })
    const groupIds = studentGroups.map(sg => sg.groupId)

    // O'sha groupdagi lessonlarning homeworklari
    const homeworks = await this.prisma.homework.findMany({
      where: {
        lesson: {
          groupId: { in: groupIds }
        }
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
        },
        homeworkResponses: {
          where: { studentId: student.id },
          select: { id: true, status: true, file: true, title: true, created_at: true }
        },
        homeworkResults: {
          where: { studentId: student.id },
          select: {
            id: true,
            score: true,
            status: true,
            title: true,
            created_at: true,
            teacherId: true,
            file: true,
          }
        }
      }
    })

    return { success: true, data: homeworks }
  }

  async login(dto: LoginStudentDto, res: Response) {
    const user = await this.prisma.student.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Email yoki parol xato');

    const inputPassword = (dto.password || '').trim();
    const storedPassword = (user.password || '').trim();
    const normalizedHash = storedPassword.startsWith('$2y$')
      ? `$2b$${storedPassword.slice(4)}`
      : storedPassword;

    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(normalizedHash);
    const isMatch = isBcryptHash
      ? await bcrypt.compare(inputPassword, normalizedHash)
      : inputPassword === storedPassword;

    if (!isMatch) throw new UnauthorizedException('Email yoki parol xato');

    if (storedPassword.startsWith('$2y$')) {
      await this.prisma.student.update({
        where: { id: user.id },
        data: { password: normalizedHash },
      });
    }

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new InternalServerErrorException('JWT secret not configured');

    const token = this.jwtService.sign(
      { id: user.id, email: user.email, role: Role.STUDENT },
      { secret, expiresIn: '8h' },
    );

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000,
    });

    return res.json({
      message: 'Login muvaffaqiyatli',
      role: "STUDENT",
      token,
      userId: user.id,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        birt_date: user.birt_date,
        photo: user.photo,
        role: "STUDENT"
      }
    });
  }

  async getAllStudents() {
    const students = await this.prisma.student.findMany({
      orderBy: { created_at: 'asc' },
    })
    return students.map(({ password, ...s }) => s);
  }

  async getById(id: number, user?: { id: number; role: Role }) {
    if (user?.role === Role.STUDENT && Number(user.id) !== Number(id)) {
      throw new ForbiddenException("Bu ma'lumot sizga tegishli emas.");
    }

    const student = await this.prisma.student.findUnique({
      where: { id }
    })

    if (!student) throw new NotFoundException("Student not found")

    const { password, ...safeStudent } = student;

    return {
      success: true,
      data: safeStudent
    }
  }

  async updateStudentById(
    id: number,
    payload: UpdateStudentDto,
    photo?: Express.Multer.File,
    user?: { id: number; role: Role }
  ) {

    if (user?.role === Role.STUDENT && Number(user.id) !== Number(id)) {
      throw new ForbiddenException("Bu profil sizga tegishli emas.");
    }

    const teacher = await this.prisma.student.findUnique({
      where: { id }

    });

    if (!teacher) throw new NotFoundException("Student not found.");

    const photoPath = photo?.filename ? `/uploads/photos/${photo.filename}` : undefined;

    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) =>
        v !== '' &&
        v !== null &&
        v !== undefined &&
        v !== 'undefined' &&
        v !== 'null'
      )
    );

    if (!cleanPayload.email) {

      cleanPayload.email = teacher.email;
    } else {
      const existEmail = await this.prisma.student.findFirst({
        where: {
          email: cleanPayload.email,
          NOT: { id }
        }
      });
      if (existEmail) throw new ConflictException("This email already exists.");
    }

    if (cleanPayload.password) {
      cleanPayload.password = await bcrypt.hash(cleanPayload.password, 10);
    } else {
      cleanPayload.password = teacher.password;
    }

    if (cleanPayload.birt_date) {
      const parsedDate = new Date(cleanPayload.birt_date as string);
      if (Number.isNaN(parsedDate.getTime())) {
        throw new BadRequestException("birt_date noto'g'ri formatda. YYYY-MM-DD yuboring.");
      }
      cleanPayload.birt_date = parsedDate;
    }

    const updated = await this.prisma.student.update({
      where: { id },
      data: {
        ...cleanPayload,
        ...(photoPath && { photo: photoPath })
      }
    });

    const { password, ...withoutPassword } = updated
    return {
      success: true,
      data: withoutPassword,
      message: "Student's information has been updated."
    };
  }

  async deleteStudent(id: number) {
    const exists = await this.prisma.student.findUnique({ where: { id } })

    if (!exists) throw new NotFoundException(`Student ${id} not found..`)

    await this.prisma.student.delete({ where: { id } })

    return {
      success: true,
      message: "Student has been deleted successfully."
    }
  }


  async logout(res: Response) {
    res.clearCookie('access_token');
    return res.json({ message: 'Chiqildi' });
  }

}
