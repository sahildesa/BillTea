import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchasePlanDto {
  @ApiProperty({ description: 'ID of the plan to purchase' })
  @IsString()
  @IsNotEmpty()
  planId: string;
}
