// dto/LoginUser.dto.ts
import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'mengilovahrorbek5@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Axrorbek123!' })
  @IsString()
  password: string;
}