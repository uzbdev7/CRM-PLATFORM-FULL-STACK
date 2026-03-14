// create-group.dto.ts
import { IsString, IsInt, IsEnum, IsOptional, IsPositive, IsDateString, IsArray, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status, WeekDays } from '@prisma/client';

export class CreateGroupDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  teacherId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  roomId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  courseId: number;

  @ApiProperty({ example: 'N25' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: [WeekDays.MONDAY, WeekDays.WEDNESDAY, WeekDays.SATURDAY], enum: WeekDays, isArray: true })
  @IsArray()
  @IsEnum(WeekDays, { each: true })
  weeKDays: WeekDays[];
}