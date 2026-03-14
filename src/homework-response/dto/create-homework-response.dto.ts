// create-homework-response.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateHomeworkResponseDto {
  @ApiProperty({ example: 1, description: 'Homework ID' })
  @Type(() => Number)
  @IsNumber()
  homeworkId: number
  
  @ApiProperty({ example: 'Vazifa yakunlandi.' })
  @IsString()
  title: string
}