import { IsString, IsEmail, IsOptional, IsInt, IsEnum, IsPositive } from 'class-validator';
import { UserStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTeacherDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary', required:false })
  @IsOptional()
  photo?: any;

  @ApiProperty({example:"StrongPass123"})
  @IsString()
  password: string;

  @ApiProperty({example:"Ali@gmail.com"})
  @IsEmail()
  email: string;

  @ApiProperty({example: 5 })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  experience: number;

  @ApiProperty({example:"Full Stack Developer"})  
  @IsString()
  position: string;
}