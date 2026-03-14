import { IsDateString, IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsDateString()
  birt_date?: Date;

  @IsOptional()
  @IsEmail()
  email?: string;
}