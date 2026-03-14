// src/auth/guards/role.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. @Roles() decorator dan rollarni olish
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    // 2. Agar @Roles() qoyilmagan bolsa, hammaga ruxsat
    if (!requiredRoles) return true;

    // 3. Request dan userni olish (JwtAuthGuard uni req.user ga qoygan)
    const { user } = context.switchToHttp().getRequest();

    // 4. User roli kerakli rollar ichida bormi
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Sizda bu amalni bajarish uchun ruxsat yo\'q');
    }

    return true;
  }
}