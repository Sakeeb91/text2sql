/**
 * Runtime validation schema for AI provider configuration.
 */

import { AiProviderConfig, AiProviderType } from '@text2sql/shared';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class AiProviderConfigDto implements AiProviderConfig {
  @IsEnum(AiProviderType)
  type!: AiProviderType;

  @IsString()
  @IsNotEmpty()
  apiKey!: string;

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  maxTokens?: number;
}
