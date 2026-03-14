import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ example: '1-dars NodeJs ga kirish' })
  @IsString()
  title: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  groupId: number;
}