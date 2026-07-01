import { IsString, IsOptional, IsArray, MinLength } from 'class-validator';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
    @ApiPropertyOptional({ example: 'John Doe' })
  name?: string;

  @IsOptional()
  @IsString()
    @ApiPropertyOptional({ example: 'sample_value' })
  logo?: string;

  @IsOptional()
  @IsArray()
    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  identifiers?: Array<{ label: string; value: string }>;
}
