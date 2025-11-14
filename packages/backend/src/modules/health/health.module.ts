/**
 * Health check module.
 *
 * Provides health check endpoints for monitoring application status.
 */

import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
