import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateLessonVideoDto {
  @ApiProperty({ example: 1, description: 'Lesson ID' })
  @Type(() => Number)
  @IsNumber()
  lessonId: number

}