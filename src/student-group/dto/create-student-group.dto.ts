import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsInt, IsPositive } from 'class-validator';

export class CreateStudentGroupDto {
  @ApiProperty({ example: 1, description: 'Group ID' })
  @IsInt()
  @IsPositive()
  groupId: number;

  @ApiProperty({ example: 1, description: 'Student ID' })
  @IsInt()
  @IsPositive()
  studentId: number;
}