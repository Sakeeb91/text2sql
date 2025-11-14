/**
 * Query module.
 *
 * Handles text-to-SQL query conversion and execution.
 * This module will be implemented in Phase 3.
 */

import { Module } from '@nestjs/common';

import { AiProviderModule } from '../ai-provider/ai-provider.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, AiProviderModule],
  controllers: [],
  providers: [],
})
export class QueryModule {}
