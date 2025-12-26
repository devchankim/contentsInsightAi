import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { LlmService, ProviderType } from '@/llm/llm.service';
import { ProjectService } from '@/project/project.service';
import {
  GenerateAnalysisDto,
  GenerateScriptDto,
  RetouchDto,
  AnalysisResult,
  ScriptResult,
} from './dto/generate.dto';
import {
  ANALYSIS_SYSTEM_PROMPT,
  ANALYSIS_USER_PROMPT_TEMPLATE,
  SCRIPT_SYSTEM_PROMPT,
  SCRIPT_USER_PROMPT_TEMPLATE,
  RETOUCH_SYSTEM_PROMPT,
  RETOUCH_USER_PROMPT_TEMPLATE,
} from './prompts/prompts';

@Injectable()
export class GenerateService {
  constructor(
    private prisma: PrismaService,
    private llmService: LlmService,
    private projectService: ProjectService,
  ) {}

  async generateAnalysis(dto: GenerateAnalysisDto): Promise<AnalysisResult> {
    const provider: ProviderType = dto.provider || 'openai';
    const startTime = Date.now();

    // Save source texts
    await this.projectService.saveSourceText(dto.projectId, 'reference', dto.referenceText);
    await this.projectService.saveSourceText(dto.projectId, 'myNotes', dto.myNotes);

    // Call LLM
    const response = await this.llmService.generate(provider, {
      systemPrompt: ANALYSIS_SYSTEM_PROMPT,
      userPrompt: ANALYSIS_USER_PROMPT_TEMPLATE(dto.referenceText, dto.myNotes),
      temperature: 0.7,
      maxTokens: 3000,
      model: dto.model,
    });

    const result = this.llmService.parseJsonResponse<AnalysisResult>(response.content);

    // Save generation run
    await this.prisma.generationRun.create({
      data: {
        projectId: dto.projectId,
        type: 'analysis',
        inputSnapshot: JSON.stringify({
          referenceText: dto.referenceText.substring(0, 500) + '...',
          myNotes: dto.myNotes.substring(0, 500) + '...',
        }),
        result: JSON.stringify(result),
        llmProvider: provider,
        llmModel: response.model,
        tokensUsed: response.tokensUsed,
        generationTimeMs: Date.now() - startTime,
      },
    });

    return result;
  }

  async generateScript(dto: GenerateScriptDto): Promise<ScriptResult> {
    const provider: ProviderType = dto.provider || 'openai';
    const startTime = Date.now();

    // Save source texts
    await this.projectService.saveSourceText(dto.projectId, 'reference', dto.referenceText);
    await this.projectService.saveSourceText(dto.projectId, 'myNotes', dto.myNotes);

    // Build insight cards context if provided
    const insightsContext = dto.selectedInsightCards?.length
      ? `선택된 인사이트 카드:\n${dto.selectedInsightCards.map((id, idx) => `${idx + 1}. ${id}`).join('\n')}`
      : undefined;

    // Call LLM
    const response = await this.llmService.generate(provider, {
      systemPrompt: SCRIPT_SYSTEM_PROMPT,
      userPrompt: SCRIPT_USER_PROMPT_TEMPLATE(
        dto.referenceText,
        dto.myNotes,
        dto.preset,
        dto.hookStyle,
        dto.targetLength,
        insightsContext,
      ),
      temperature: 0.8,
      maxTokens: 4000,
      model: dto.model,
    });

    const result = this.llmService.parseJsonResponse<ScriptResult>(response.content);

    // Save generation run
    await this.prisma.generationRun.create({
      data: {
        projectId: dto.projectId,
        type: 'script',
        preset: dto.preset,
        hookStyle: dto.hookStyle,
        targetLength: dto.targetLength,
        inputSnapshot: JSON.stringify({
          referenceText: dto.referenceText.substring(0, 500) + '...',
          myNotes: dto.myNotes.substring(0, 500) + '...',
          selectedInsightCards: dto.selectedInsightCards,
        }),
        result: JSON.stringify(result),
        llmProvider: provider,
        llmModel: response.model,
        tokensUsed: response.tokensUsed,
        generationTimeMs: Date.now() - startTime,
      },
    });

    return result;
  }

  async retouch(dto: RetouchDto): Promise<{ retouchedText: string }> {
    const provider: ProviderType = dto.provider || 'openai';

    const response = await this.llmService.generate(provider, {
      systemPrompt: RETOUCH_SYSTEM_PROMPT,
      userPrompt: RETOUCH_USER_PROMPT_TEMPLATE(dto.originalText, dto.style),
      temperature: 0.8,
      maxTokens: 1000,
    });

    return { retouchedText: response.content.trim() };
  }
}

