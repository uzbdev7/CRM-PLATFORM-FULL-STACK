import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginTeacherDto } from './dto/LoginTeacher.dto';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { Role } from '@prisma/client';
import { sendWelcomeMail } from 'src/helpers/mail.helper';
import { UpdateTeacherDto } from './dto/update-teacher.dto';


@Injectable()
export class TeacherService {
  constructor(
    private readonly prisma:PrismaService,
    private readonly jwtService: JwtService,
    private mailerService:MailerService
  ){}

  async createTeacher(dto:CreateTeacherDto, photo?:Express.Multer.File){
   
    const hashedPassword = await bcrypt.hash(dto.password, 10)
    const photoPath = photo ? `/uploads/photos/${photo.filename}` : null

    const teacher = await this.prisma.teacher.create({
      data:{
        fullName:dto.fullName,
        email: dto.email,
        password: hashedPassword,
        experience: dto.experience,
        position: dto.position,
        photo: photoPath,
      },
    });

     await sendWelcomeMail(this.mailerService, dto.email, dto.fullName, dto.password);

    return { message: 'Teacher yaratildi', teacherId: teacher.id };
  }

  async findTeacherHomeworks(user: { id: number; role: Role }) {

  const teacher = await this.prisma.teacher.findFirst({
    where: { id: user.id }
  })
  if (!teacher) throw new NotFoundException("Teacher not found.")

  const homeworks = await this.prisma.homework.findMany({
    where: { teacherId: teacher.id },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          groupId: true,
          group: { select: { id: true, name: true, status: true } }
        }
      },
      homeworkResults: {
        select: {
          id: true,
          score: true,
          status: true,
          student: {
            select: { id: true, fullName: true }
          }
        }
      }
    }
  })

  return { success: true, data: homeworks }
  }

  async login(dto: LoginTeacherDto, res: Response) {
    const user = await this.prisma.teacher.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Email yoki parol xato');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Email yoki parol xato');

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new InternalServerErrorException('JWT secret not configured');

    const token = this.jwtService.sign(
      { id: user.id, email: user.email, role: Role.TEACHER },
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
      role:"TEACHER",
       user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        experience:user.experience,
        position: user.position,
        photo: user.photo
      },
    });
  }

  async getAllTeachers() {
    const teachers = await this.prisma.teacher.findMany({
      select:{
        id:true,
        fullName:true,
        email:true,
        experience:true,
        position:true,
        status:true,
        groups:{
            select:{
              id:true,
              userId:true,
              roomId:true,
              startDate:true,
              startTime:true,
              weeKDays:true,
              status:true,
              course:{
                select:{
                  id:true,
                  name:true,
                  status:true,
                  durationMonth:true,
                  durationLesson:true,
                }
              },
                room:{
                  select:{
                    id:true,
                    name:true,
                    capacity:true,
                    status:true
                  }
                }
            } 
          }  
        }
      
    });
    return {
      success: true,
      data: teachers
    };
  }

  async getById(id:number){
    const teacher = await this.prisma.teacher.findUnique({
      where:{id}
    })

    if(!teacher) throw new NotFoundException("Teacher not found.")

    return {
      success:true,
      data:teacher
    }
  }

  async updateTeacherById(id: number, payload: UpdateTeacherDto, photo?: Express.Multer.File) {

    const teacher = await this.prisma.teacher.findUnique({
      where: { id }

    });

    if (!teacher) throw new NotFoundException("Teacher not found.");

    const photoPath = photo && photo.originalname ? photo.path : undefined;

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
      const existEmail = await this.prisma.teacher.findFirst({
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

    const updated = await this.prisma.teacher.update({
      where: { id },
      data: {
        ...cleanPayload,
        ...(photoPath && { photo: photoPath })
      }
    });

    const {password, ...withoutPassword} = updated
    return {
      success: true,
      data: withoutPassword,
      message: "Teacher's information has been updated."
    };
  }

  async deleteTeacher(id:number){
    const exists = await this.prisma.student.findUnique({where:{id}})

    if(!exists) throw new NotFoundException(`Teacher ${id} not found..`)

      await this.prisma.student.delete({where:{id}})
      
      return {
        success:true,
        message:"Teacher has been deleted successfully."
      }
    }

  async logout(res: Response) {
    res.clearCookie('access_token');
    return res.json({ message: 'Tizimdan chiqildi' });
  }
  
}
