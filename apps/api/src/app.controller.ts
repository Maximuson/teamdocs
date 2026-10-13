import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@teamdocs/contracts';
import { AppService } from './app.service.js';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): HealthResponse {
    return this.appService.getHealth();
  }
}
