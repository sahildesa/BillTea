import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiTags('Profile')
@ApiBearerAuth()
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
    @ApiOperation({ summary: 'Get Profile' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Put()
    @ApiOperation({ summary: 'Update Profile' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(userId, dto);
  }

  @Put('password')
    @ApiOperation({ summary: 'Change Password' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  async changePassword(
    @CurrentUser('userId') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.profileService.changePassword(userId, dto);
  }
}
