import { Injectable } from '@nestjs/common';
import { healthResponseSchema, type HealthResponse } from '@teamdocs/contracts';

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return healthResponseSchema.parse({
      status: 'ok',
      service: 'teamdocs-api',
      timestamp: new Date().toISOString(),
    });
  }
}
