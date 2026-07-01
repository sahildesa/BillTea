import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";

@UseGuards(JwtAuthGuard)
@Controller('customers')
@ApiTags('Customers')
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
    @ApiOperation({ summary: 'Create' })
    @ApiResponse({ status: 201, description: 'Created successfully.' })
  create(@CurrentUser() user: any, @Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(user.companyId, user.sub, createCustomerDto);
  }

  @Get()
    @ApiOperation({ summary: 'Find All' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  findAll(@CurrentUser() user: any, @Query('branchId') branchId?: string) {
    return this.customersService.findAll(user.companyId, branchId);
  }

  @Get(':id')
    @ApiOperation({ summary: 'Find One' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.customersService.findOne(id, user.companyId);
  }

  @Put(':id')
    @ApiOperation({ summary: 'Update' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, user.companyId, updateCustomerDto);
  }

  @Delete(':id')
    @ApiOperation({ summary: 'Remove' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.customersService.remove(id, user.companyId);
  }
}
