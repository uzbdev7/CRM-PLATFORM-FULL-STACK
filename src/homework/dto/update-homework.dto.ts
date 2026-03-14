import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsString } from "class-validator"

export class UpdateHomeworkDto {
  @ApiProperty({ example: 'Node.js vazifasi', description: 'Homework title' })
  @IsString()
  title: string

  @ApiProperty({ example: '16' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  durationTime?: number
}