import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  branchId: string;

  @IsString()
  @IsNotEmpty()
    @ApiProperty({ example: 'John Doe' })
  name: string;

  @IsString()
  @IsOptional()
    @ApiPropertyOptional({ example: 'sample_value' })
  description?: string;

  @IsNumber()
  @Type(() => Number)
    @ApiProperty({ example: 100 })
  price: number;

  @IsString()
  @IsOptional()
    @ApiPropertyOptional({ example: 'sample_value' })
  hsnNumber?: string;

  @IsString()
  @IsOptional()
    @ApiPropertyOptional({ example: 'sample_value' })
  skuNumber?: string;
}
