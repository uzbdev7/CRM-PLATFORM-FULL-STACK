// create-rating.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateRatingDto {
  @ApiProperty({ example: 1, description: 'Lesson ID' })
  @Type(() => Number)
  @IsNumber()
  lessonId: number

  @ApiProperty({ 
    example: 5, 
    description: 'Baho (1-5 yulduz)',
    minimum: 1,
    maximum: 5
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  score: number
}