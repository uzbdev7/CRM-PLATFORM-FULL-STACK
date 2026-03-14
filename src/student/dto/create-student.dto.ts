import { IsString, IsEmail, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary', required:false })
  @IsOptional()
  photo?: any;

  @ApiProperty({example:"StrongPass123"})
  @IsString()
  password: string;

  @ApiProperty({example:"2026-03-05"})
  @IsDateString()
  birt_date: Date;

  @ApiProperty({example:"alicoder@gmail.com"})
  @IsEmail()
  email: string;
}