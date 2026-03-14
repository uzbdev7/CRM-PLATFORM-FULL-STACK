// create-homework-result.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateHomeworkResultDto {
  @ApiProperty({ example: 1, description: 'Homework ID' })
  @Type(() => Number)
  @IsNumber()
  homeworkId: number

  @ApiProperty({ example: 1, description: 'Student ID' })
  @Type(() => Number)
  @IsNumber()
  studentId: number

  @ApiProperty({ example: 'Yaxshi bajarilgan' })
  @IsString()
  title: string

  @ApiProperty({ example: 85, description: 'Ball (0-100)', minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number
}