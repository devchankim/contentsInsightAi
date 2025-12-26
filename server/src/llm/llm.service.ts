import { Injectable, BadRequestException } from '@nestjs/common';
import { OpenAiProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { LlmProvider, GenerateParams } from './interfaces/llm-provider.interface';

export type ProviderType = 'openai' | 'anthropic';

@Injectable()
export class LlmService {
  private providers: Map<ProviderType, LlmProvider>;

  constructor(
    private openAiProvider: OpenAiProvider,
    private anthropicProvider: AnthropicProvider,
  ) {
    this.providers = new Map<ProviderType, LlmProvider>([
      ['openai', openAiProvider as LlmProvider],
      ['anthropic', anthropicProvider as LlmProvider],
    ]);
  }

  getProvider(type: ProviderType): LlmProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new BadRequestException(`Unknown provider: ${type}`);
    }
    return provider;
  }

  async generate(provider: ProviderType, params: GenerateParams) {
    const llm = this.getProvider(provider);
    const startTime = Date.now();

    try {
      const response = await llm.generate(params);
      const generationTimeMs = Date.now() - startTime;

      return {
        ...response,
        provider: llm.getProviderName(),
        generationTimeMs,
      };
    } catch (error) {
      console.error(`LLM generation error (${provider}):`, error.message);
      throw error;
    }
  }

  // Helper: Parse JSON response from LLM with fallback
  parseJsonResponse<T>(content: string, fallback?: T): T {
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.warn('Failed to parse LLM JSON response:', error.message);
      if (fallback !== undefined) {
        return fallback;
      }
      throw new BadRequestException('Invalid JSON response from LLM');
    }
  }
}

