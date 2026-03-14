import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty({ example: 1, description: 'Lesson ID' })
  @IsInt()
  lessonId: number;

  @ApiProperty({ example: 1, description: 'Student ID' })
  @IsInt()
  studentId: number;

  @ApiProperty({ example: true, description: 'Is student present?' })
  @IsBoolean()
  isPresent: boolean;
}
