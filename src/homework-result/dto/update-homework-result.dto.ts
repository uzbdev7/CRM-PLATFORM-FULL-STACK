import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator"

export class UpdateHomeworkResultDto {
  @ApiPropertyOptional({ example: 'Yangilangan izoh' })
  @IsOptional()
  @IsString()
  title?: string

  @ApiPropertyOptional({ example: 90, minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number
}