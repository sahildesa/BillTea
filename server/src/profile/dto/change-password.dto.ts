import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordDto {
  @IsString()
    @ApiProperty({ example: 'password123' })
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters' })
    @ApiProperty({ example: 'password123' })
  newPassword: string;
}
