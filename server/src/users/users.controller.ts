import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { FeatureGuard } from '../common/guards/feature.guard';
import { RequireSubscription } from '../common/decorators/subscription.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard, FeatureGuard)
@Roles('OWNER')
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('create')
  @RequireSubscription('staff')
  @UseInterceptors(FileInterceptor('profilePicture'))
  @ApiOperation({ summary: 'Create' })
  @ApiResponse({ status: 201, description: 'Created successfully.' })
  async create(
    @CurrentUser('userId') userId: string,
    @CurrentUser('companyId') companyId: string | null,
    @Body() dto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      dto.profilePicture = `uploads/users/${file.filename}`;
    }
    return this.usersService.create(userId, companyId, dto);
  }

  @Get()
    @ApiOperation({ summary: 'Find All' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  async findAll(@CurrentUser('companyId') companyId: string | null) {
    return this.usersService.findAll(companyId);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('profilePicture'))
    @ApiOperation({ summary: 'Update' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('companyId') companyId: string | null,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      dto.profilePicture = `uploads/users/${file.filename}`;
    }
    return this.usersService.update(id, userId, companyId, dto);
  }

  @Delete(':id')
    @ApiOperation({ summary: 'Remove' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('companyId') companyId: string | null,
  ) {
    return this.usersService.remove(id, userId, companyId);
  }
}
