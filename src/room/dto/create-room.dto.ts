import { IsString, IsInt, IsEnum, IsOptional, IsPositive, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  capacity: number;
  
  @ApiProperty()
  @IsOptional()
  @IsEnum(Status)
  status?: Status;  
}