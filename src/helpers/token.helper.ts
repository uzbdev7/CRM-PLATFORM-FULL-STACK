// src/users/helpers/token.helper.ts
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

export function generateAccessToken(jwtService: JwtService, payload: JwtPayload): string {
  return jwtService.sign(payload, {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: '8h',
  });
}

export function verifyAccessToken(jwtService: JwtService, token: string): JwtPayload {
  return jwtService.verify(token, {
    secret: process.env.JWT_ACCESS_SECRET,
  });
}