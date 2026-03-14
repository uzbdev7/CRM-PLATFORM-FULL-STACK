import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import { CreateUserDto } from './dto/CreateUser.dto';
import { LoginUserDto } from './dto/LoginUser.dto';
import { sendWelcomeMail } from 'src/helpers/mail.helper'; 
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  // REGISTER

async register(dto: CreateUserDto, photo?: Express.Multer.File) { 

  const hashedPassword = await bcrypt.hash(dto.password, 10);
  const photoPath = photo ? `/uploads/photos/${photo.filename}` : null;

  const user = await this.prisma.user.create({
    data: {
      fullName: dto.fullName,
      email: dto.email,
      password: hashedPassword,
      role: dto.role as unknown as Role,
      hire_date: new Date(dto.hire_date),
      photo: photoPath,
      position: dto.position,
    },
  });

  await sendWelcomeMail(this.mailerService, dto.email, dto.fullName as string, dto.password as string);

  return { message: 'User yaratildi', userId: user.id };
}

  // LOGIN
  async login(dto: LoginUserDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Email yoki parol xato');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Email yoki parol xato');

    const token = this.jwtService.sign(
      { id: user.id, email: user.email, role: user.role },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '8h' },
    );

    res.cookie('access_token', token, {
      httpOnly: true,
      maxAge: 8 * 60 * 60 * 1000,
    });

    return res.json({ message: 'Login muvaffaqiyatli', userId: user.id,role:user.role, token });
  }

  // LOGOUT
  async logout(res: Response) {
    res.clearCookie('access_token');
    return res.json({ message: 'Chiqildi' });
  }
}