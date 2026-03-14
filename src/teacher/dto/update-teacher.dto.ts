import { IsEmail, IsInt, IsOptional, IsPositive, IsString } from "class-validator";
import { Type } from "class-transformer";

export class UpdateTeacherDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  experience?: number;

  @IsOptional()
  @IsString()
  position?: string;
}