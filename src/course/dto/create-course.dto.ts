// create-course.dto.ts
import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  IsDecimal,
  IsPositive,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CourseLevel, Status } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  durationMonth: number;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  durationLesson: number;
  
  @ApiProperty()
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiProperty()
  @IsEnum(Status)
  status: Status

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number) 
  price: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;
}