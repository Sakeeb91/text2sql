import { HealthResponse } from '@text2sql/shared';
import { describe, expect, it } from 'vitest';

import { HealthController } from '../src/modules/health/health.controller';

describe('HealthController', () => {
  it('returns an ok status with a timestamp', () => {
    const controller = new HealthController();
    const response: HealthResponse = controller.getHealth();

    expect(response.status).toBe('ok');
    expect(new Date(response.timestamp).toString()).not.toBe('Invalid Date');
    expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
