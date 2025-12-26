import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { LlmProvider, GenerateParams, GenerateResponse } from '../interfaces/llm-provider.interface';

@Injectable()
export class AnthropicProvider implements LlmProvider {
  private client: Anthropic;
  private readonly defaultModel = 'claude-3-5-sonnet-20241022';

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      console.warn('⚠️  ANTHROPIC_API_KEY not found - Anthropic provider will not work');
    }
    this.client = new Anthropic({ apiKey });
  }

  getProviderName(): string {
    return 'anthropic';
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  async generate(params: GenerateParams): Promise<GenerateResponse> {
    const response = await (this.client as any).messages.create({
      model: params.model || this.defaultModel,
      system: params.systemPrompt,
      messages: [{ role: 'user', content: params.userPrompt }],
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 4000,
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';

    return {
      content: text,
      model: response.model,
      tokensUsed: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
    };
  }
}

