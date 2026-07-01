import { IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class RefreshDto {
  @IsString()
    @ApiProperty({ example: 'sample_value' })
  refreshToken: string;
}
