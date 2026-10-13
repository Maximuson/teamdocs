import { describe, expect, it } from 'vitest';
import { healthResponseSchema } from '@teamdocs/contracts';
import { AppService } from './app.service.js';

describe('AppService', () => {
  it('returns a health payload that satisfies the shared API contract', () => {
    const result = healthResponseSchema.safeParse(new AppService().getHealth());

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error(result.error.message);
    }

    expect(result.data.status).toBe('ok');
    expect(result.data.service).toBe('teamdocs-api');
  });
});
