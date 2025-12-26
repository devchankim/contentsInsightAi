// LLM Provider Interface - 교체 가능한 구조
export interface LlmProvider {
  generate(params: GenerateParams): Promise<GenerateResponse>;
  getProviderName(): string;
  getDefaultModel(): string;
}

export interface GenerateParams {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface GenerateResponse {
  content: string;
  model: string;
  tokensUsed?: number;
}

