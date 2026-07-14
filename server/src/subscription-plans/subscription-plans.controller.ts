import { Controller, Get, Post, Body, Put, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { SubscriptionPlansService } from './subscription-plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Subscription Plans')
@ApiBearerAuth()
@Controller('subscription-plans')
export class SubscriptionPlansController {
  constructor(private readonly plansService: SubscriptionPlansService) {}

  // ─── Super Admin Endpoints ────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a subscription plan (Super Admin)' })
  @ApiResponse({ status: 201, description: 'Plan created successfully.' })
  create(@Body() dto: CreatePlanDto) {
    return this.plansService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'List all plans including deleted (Super Admin)' })
  @ApiResponse({ status: 200, description: 'Successful operation.' })
  findAll() {
    return this.plansService.findAll();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get subscription statistics (Super Admin)' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully.' })
  getStats() {
    return this.plansService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get plan details (Super Admin)' })
  @ApiResponse({ status: 200, description: 'Successful operation.' })
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update a plan (Super Admin)' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully.' })
  update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Soft delete a plan (Super Admin)' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully.' })
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Activate a plan (Super Admin)' })
  @ApiResponse({ status: 200, description: 'Plan activated successfully.' })
  activate(@Param('id') id: string) {
    return this.plansService.activate(id);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Deactivate a plan (Super Admin)' })
  @ApiResponse({ status: 200, description: 'Plan deactivated successfully.' })
  deactivate(@Param('id') id: string) {
    return this.plansService.deactivate(id);
  }

  // ─── Public/User Endpoints ────────────────────────────────

  @Get('public/active')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all active plans (User)' })
  @ApiResponse({ status: 200, description: 'Active plans retrieved.' })
  findActive() {
    return this.plansService.findActive();
  }
}
