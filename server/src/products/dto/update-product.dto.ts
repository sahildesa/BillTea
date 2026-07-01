import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateProductDto {
  @IsString()
  @IsOptional()
    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  branchId?: string;

  @IsString()
  @IsOptional()
    @ApiPropertyOptional({ example: 'John Doe' })
  name?: string;

  @IsString()
  @IsOptional()
    @ApiPropertyOptional({ example: 'sample_value' })
  description?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
    @ApiPropertyOptional({ example: 100 })
  price?: number;

  @IsString()
  @IsOptional()
    @ApiPropertyOptional({ example: 'sample_value' })
  hsnNumber?: string;

  @IsString()
  @IsOptional()
    @ApiPropertyOptional({ example: 'sample_value' })
  skuNumber?: string;
}
