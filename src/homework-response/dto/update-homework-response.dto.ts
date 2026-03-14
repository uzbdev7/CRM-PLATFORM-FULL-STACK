import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateHomeworkResponseDto {
  @ApiPropertyOptional({ example: 'Yangilangan vazifa' })
  @IsOptional()
  @IsString()
  title?: string
}