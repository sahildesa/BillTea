import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller()
@ApiTags('Health')
export class HealthController {
  @Get(['', 'health'])
    @ApiOperation({ summary: 'Check' })
    @ApiResponse({ status: 200, description: 'Successful operation.' })
  check() {
    return {
      success: true,
      status: 'OK',
      message: 'BillTea API server is running smoothly',
      timestamp: new Date().toISOString(),
    };
  }
}
