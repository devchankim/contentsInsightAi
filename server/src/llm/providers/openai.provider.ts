import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LlmProvider, GenerateParams, GenerateResponse } from '../interfaces/llm-provider.interface';

@Injectable()
export class OpenAiProvider implements LlmProvider {
  private client: OpenAI;
  private readonly defaultModel = 'gpt-4o-mini';

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      console.warn('⚠️  OPENAI_API_KEY not found - OpenAI provider will not work');
    }
    this.client = new OpenAI({ apiKey });
  }

  getProviderName(): string {
    return 'openai';
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  async generate(params: GenerateParams): Promise<GenerateResponse> {
    const response = await this.client.chat.completions.create({
      model: params.model || this.defaultModel,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt },
      ],
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 4000,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      model: response.model,
      tokensUsed: response.usage?.total_tokens,
    };
  }
}

