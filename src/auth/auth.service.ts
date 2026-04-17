import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

type AuthCandidate = {
  id: number;
  email: string;
  password: string;
  fullName: string;
  photo?: string | null;
  role: Role;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async matchesPassword(storedPassword: string, inputPassword: string) {
    const normalizedHash = storedPassword.startsWith('$2y$')
      ? `$2b$${storedPassword.slice(4)}`
      : storedPassword;

    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(normalizedHash);
    return isBcryptHash
      ? bcrypt.compare(inputPassword.trim(), normalizedHash)
      : inputPassword.trim() === storedPassword.trim();
  }

  private async normalizeHash<T extends { id: number; password: string }>(
    model: 'user' | 'teacher' | 'student',
    record: T,
    normalizedHash: string,
  ) {
    if (!record.password.startsWith('$2y$')) return;

    const data = { password: normalizedHash };
    if (model === 'user') {
      await this.prisma.user.update({ where: { id: record.id }, data });
      return;
    }
    if (model === 'teacher') {
      await this.prisma.teacher.update({ where: { id: record.id }, data });
      return;
    }
    await this.prisma.student.update({ where: { id: record.id }, data });
  }

  async login(dto: LoginDto, res: Response) {
    let user;
    let teacher;
    let student;

    try {
      [user, teacher, student] = await Promise.all([
        this.prisma.user.findUnique({ where: { email: dto.email } }),
        this.prisma.teacher.findUnique({ where: { email: dto.email } }),
        this.prisma.student.findUnique({ where: { email: dto.email } }),
      ]);
    } catch (error) {
      const code = (error as { code?: string })?.code;
      const message = (error as { message?: string })?.message || '';
      if (code === 'P1001' || message.includes("Can't reach database server")) {
        throw new ServiceUnavailableException(
          "Database serverga ulanib bo'lmadi. DATABASE_URL ulanishini tekshiring.",
        );
      }
      throw error;
    }

    const candidates: Array<{ model: 'user' | 'teacher' | 'student'; data: AuthCandidate | null }> = [
      { model: 'user', data: user ? { ...user, role: user.role as Role } : null },
      { model: 'teacher', data: teacher ? { ...teacher, role: Role.TEACHER } : null },
      { model: 'student', data: student ? { ...student, role: Role.STUDENT } : null },
    ];

    for (const candidate of candidates) {
      if (!candidate.data) continue;

      const { data } = candidate;
      const ok = await this.matchesPassword(data.password, dto.password);
      if (!ok) continue;

      const normalizedHash = data.password.startsWith('$2y$')
        ? `$2b$${data.password.slice(4)}`
        : data.password;
      await this.normalizeHash(candidate.model, { id: data.id, password: data.password }, normalizedHash);

      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret) throw new UnauthorizedException('JWT secret not configured');

      const token = this.jwtService.sign(
        { id: data.id, email: data.email, role: data.role },
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
        userId: data.id,
        role: data.role,
        fullName: data.fullName,
        photo: data.photo ?? null,
        token,
      });
    }

    throw new UnauthorizedException('Email yoki parol xato');
  }
}