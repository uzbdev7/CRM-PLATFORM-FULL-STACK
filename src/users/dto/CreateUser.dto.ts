// dto/CreateUser.dto.ts
import { Role } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsEnum, IsNotIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export enum AllowedUserRole {
  ADMIN = 'ADMIN',
  MANAGEMENT = 'MANAGEMENT',
  ADMINISTRATOR = 'ADMINISTRATOR',
}

export class CreateUserDto {
  @ApiProperty({ example: 'Ali Valiyev' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary', required:false })
  @IsOptional()
  photo?: any;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ example: 'Backend Developer' })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiProperty({ enum: AllowedUserRole, example: AllowedUserRole.ADMINISTRATOR })
  @IsEnum(AllowedUserRole)
  role: AllowedUserRole;

  @ApiProperty({ example: '01-01-2026' })
  @IsDate()
  @Type(() => Date)
  hire_date: Date;

  @ApiProperty({ example: 'ali@gmail.com' })
  @IsEmail()
  email: string;
}