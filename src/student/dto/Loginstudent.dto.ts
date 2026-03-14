import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginStudentDto {
  @ApiProperty({ example: 'f7079867@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Jovohir123' })
  @IsString()
  password: string;
}

