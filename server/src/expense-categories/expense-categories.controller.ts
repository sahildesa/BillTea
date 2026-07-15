import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { ExpenseCategoriesService } from './expense-categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";

@UseGuards(JwtAuthGuard)
@Controller('expense-categories')
@ApiTags('ExpenseCategories')
@ApiBearerAuth()
export class ExpenseCategoriesController {
  constructor(private readonly expenseCategoriesService: ExpenseCategoriesService) {}

  @Post()
    @ApiOperation({ summary: 'Create' })
    @ApiResponse({ status: 201, description: 'Created successfully.' })
  create(@Body() createExpenseCategoryDto: { name: string; branchId: string }, @Req() req: any) {
    if (!createExpenseCategoryDto.branchId) {
      throw new BadRequestException('branchId is required');
    }
    return this.expenseCategoriesService.create(createExpenseCategoryDto.name, req.user.companyId, createExpenseCategoryDto.branchId, req.user.userId);
  }

  @Get()
    @ApiOperation({ summary: 'Find All' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  findAll(@Req() req: any, @Query('branchId') branchId?: string) {
    if (!branchId) {
      throw new BadRequestException('branchId query parameter is required');
    }
    return this.expenseCategoriesService.findAll(req.user.companyId, branchId);
  }

  @Patch(':id')
    @ApiOperation({ summary: 'Update' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  update(@Param('id') id: string, @Body() updateExpenseCategoryDto: { name: string }, @Req() req: any) {
    return this.expenseCategoriesService.update(id, updateExpenseCategoryDto.name, req.user.companyId);
  }

  @Delete(':id')
    @ApiOperation({ summary: 'Remove' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.expenseCategoriesService.remove(id, req.user.companyId);
  }
}
