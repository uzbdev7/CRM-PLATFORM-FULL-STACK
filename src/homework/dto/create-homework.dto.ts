// create-homework.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateHomeworkDto {
  @ApiProperty({ example: 1, description: 'Lesson ID' })
  @Type(() => Number)
  @IsNumber()
  lessonId: number

  @ApiProperty({ example: 'Node.js vazifasi', description: 'Homework title' })
  @IsString()
  title: string

  @ApiProperty({ example: '16' })
  @IsOptional()
  @Type(() => Number) 
  @IsNumber()
  durationTime?: number
}