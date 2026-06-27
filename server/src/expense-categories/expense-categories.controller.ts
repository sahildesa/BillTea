import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ExpenseCategoriesService } from './expense-categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(private readonly expenseCategoriesService: ExpenseCategoriesService) {}

  @Post()
  create(@Body() createExpenseCategoryDto: { name: string }, @Req() req: any) {
    return this.expenseCategoriesService.create(createExpenseCategoryDto.name, req.user.companyId, req.user.id);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.expenseCategoriesService.findAll(req.user.companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseCategoryDto: { name: string }, @Req() req: any) {
    return this.expenseCategoriesService.update(id, updateExpenseCategoryDto.name, req.user.companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.expenseCategoriesService.remove(id, req.user.companyId);
  }
}
