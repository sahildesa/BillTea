import { IsString, IsEmail, MinLength, Matches } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: 'Full name must be at least 3 characters' })
    @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @IsString()
  @Matches(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits' })
    @ApiProperty({ example: '9876543210' })
  phoneNumber: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
    @ApiProperty({ example: 'john@gmail.com' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
    @ApiProperty({ example: 'password123' })
  password: string;
}
