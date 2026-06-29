import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get(['', 'health'])
  check() {
    return {
      success: true,
      status: 'OK',
      message: 'BillTea API server is running smoothly',
      timestamp: new Date().toISOString(),
    };
  }
}
