import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import { CreateUserDto } from './dto/CreateUser.dto';
import { LoginUserDto } from './dto/LoginUser.dto';

import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { sendWelcomeMail } from '../helpers/mail.helper';

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
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: normalizedHash },
      });
    }

    const token = this.jwtService.sign(
      { id: user.id, email: user.email, role: user.role },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '8h' },
    );

    res.cookie('access_token', token, {
      httpOnly: true,
      maxAge: 8 * 60 * 60 * 1000,
    });

    return res.json({ message: 'Login muvaffaqiyatli',
      userId: user.id, 
      role:user.role, 
      fullName:user.fullName,
      token
     });
  }

  async getAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { created_at: 'asc' },
      select: {
        id:         true,
        fullName:   true,
        email:      true,
        role:       true,
        photo:      true,
        hire_date:  true,
        created_at: true,
      },
    });
 
    return {
      success:true,
      data:users
    };
  }

  // LOGOUT
  async logout(res: Response) {
    res.clearCookie('access_token');
    return res.json({ message: 'Chiqildi' });
  }
}