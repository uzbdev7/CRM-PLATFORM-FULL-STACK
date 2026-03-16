import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginStudentDto } from './dto/Loginstudent.dto';
import * as bcrypt from 'bcrypt'
import { Response } from 'express';
import { sendWelcomeMail } from 'src/helpers/mail.helper';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateStudentDto } from './dto/create-student.dto';
import { Role } from '@prisma/client';
import { UpdateStudentDto } from './dto/update-student.dto';


@Injectable()
export class StudentService {
 constructor(private readonly prisma:PrismaService,
     private readonly jwtService: JwtService,
     private mailerService:MailerService
   ){}

  async createStudent(dto:CreateStudentDto, photo?:Express.Multer.File){
    
      const hashedPassword = await bcrypt.hash(dto.password, 10)
      const photoPath = photo ? `/uploads/photos/${photo.filename}` : null
  
      const student = await this.prisma.student.create({
        data:{
          fullName:dto.fullName,
          email: dto.email,
          password: hashedPassword,
          birt_date:new Date(dto.birt_date),
          photo: photoPath,
        },
      });
  
      await sendWelcomeMail(this.mailerService, dto.email, dto.fullName, dto.password);
  
      return { message: 'Student yaratildi', studentId: student.id };
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
            select: { id: true, status: true, file: true }
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
 
     const isMatch = await bcrypt.compare(dto.password, user.password);
     if (!isMatch) throw new UnauthorizedException('Email yoki parol xato');
 
     const secret = process.env.JWT_ACCESS_SECRET;
     if (!secret) throw new InternalServerErrorException('JWT secret not configured');
 
     const token = this.jwtService.sign(
       { id: user.id, email: user.email, role:Role.STUDENT },
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
       role:"STUDENT",
       token,
       userId: user.id ,


     });
   }

   async getAllStudents(){
    const students = await this.prisma.student.findMany({
      orderBy: { created_at: 'asc' },
    })
    return {
      success:true,
      data:students
    }
   }

   async getById(id:number){
    const student = await this.prisma.student.findUnique({
      where:{id}
    })

    if(!student) throw new NotFoundException("Student not found")

      return {
        success:true,
        data:student
      }
   }

   async updateStudentById(id: number, payload: UpdateStudentDto, photo?: Express.Multer.File) {

    const teacher = await this.prisma.student.findUnique({
      where: { id }

    });

    if (!teacher) throw new NotFoundException("Student not found.");

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

    const updated = await this.prisma.student.update({
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
      message: "Student's information has been updated."
    };
   }
 
  async deleteStudent(id:number){
    const exists = await this.prisma.student.findUnique({where:{id}})

    if(!exists) throw new NotFoundException(`Student ${id} not found..`)

      await this.prisma.student.delete({where:{id}})

      return {
        success:true,
        message:"Student has been deleted successfully."
      }
    }


  async logout(res: Response) {
    res.clearCookie('access_token');
    return res.json({ message: 'Chiqildi' });
  }

}
