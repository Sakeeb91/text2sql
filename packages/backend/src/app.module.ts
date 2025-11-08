/**
 * Root application module.
 *
 * This module imports all feature modules and configures global providers.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiProviderModule } from './modules/ai-provider/ai-provider.module';
import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { QueryModule } from './modules/query/query.module';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation.schema';

@Module({
  imports: [
    // Configuration module - must be imported first
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
      envFilePath: ['.env.local', '.env'],
    }),
    // Feature modules
    HealthModule,
    DatabaseModule,
    AiProviderModule,
    QueryModule,
  ],
})
export class AppModule {}

