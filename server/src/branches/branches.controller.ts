import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller('branches')
@UseGuards(JwtAuthGuard)
@ApiTags('Branches')
@ApiBearerAuth()
export class BranchesController {
  constructor(private branchesService: BranchesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('OWNER')
    @ApiOperation({ summary: 'Create' })
    @ApiResponse({ status: 201, description: 'Created successfully.' })
  async create(
    @CurrentUser('companyId') companyId: string | null,
    @Body() dto: CreateBranchDto,
  ) {
    return this.branchesService.create(companyId, dto);
  }

  @Get()
    @ApiOperation({ summary: 'Find All' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  async findAll(@CurrentUser('companyId') companyId: string | null) {
    return this.branchesService.findAll(companyId);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('OWNER')
    @ApiOperation({ summary: 'Update' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  async update(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string | null,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branchesService.update(id, companyId, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('OWNER')
    @ApiOperation({ summary: 'Remove' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string | null,
  ) {
    return this.branchesService.remove(id, companyId);
  }
}
