import { IsString, IsOptional, IsIn, IsInt, Min, Max, IsArray } from 'class-validator';

export class GenerateAnalysisDto {
  @IsString()
  projectId: string;

  @IsString()
  referenceText: string;

  @IsString()
  myNotes: string;

  @IsOptional()
  @IsIn(['openai', 'anthropic'])
  provider?: 'openai' | 'anthropic';

  @IsOptional()
  @IsString()
  model?: string;
}

export class GenerateScriptDto {
  @IsString()
  projectId: string;

  @IsString()
  referenceText: string;

  @IsString()
  myNotes: string;

  @IsIn(['knowledge', 'entertainer', 'info'])
  preset: 'knowledge' | 'entertainer' | 'info';

  @IsIn(['curiosity', 'benefit', 'fear'])
  hookStyle: 'curiosity' | 'benefit' | 'fear';

  @IsInt()
  @Min(3)
  @Max(15)
  targetLength: number; // minutes

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedInsightCards?: string[]; // IDs of cards to use

  @IsOptional()
  @IsIn(['openai', 'anthropic'])
  provider?: 'openai' | 'anthropic';

  @IsOptional()
  @IsString()
  model?: string;
}

export class RetouchDto {
  @IsString()
  projectId: string;

  @IsString()
  originalText: string;

  @IsIn(['shorter', 'stimulating', 'humor'])
  style: 'shorter' | 'stimulating' | 'humor';

  @IsOptional()
  @IsIn(['openai', 'anthropic'])
  provider?: 'openai' | 'anthropic';
}

// Response types (for documentation/type safety)
export interface InsightCard {
  id: string;
  title: string;
  description: string;
  suggestedPosition: 'hook' | 'body' | 'turn' | 'conclusion';
  intensity: number; // 1-5
}

export interface AnalysisResult {
  outline: {
    hook: string;
    body: string;
    turn: string;
    conclusion: string;
  };
  insightCards: InsightCard[];
}

export interface ScriptRow {
  visual: string;
  audio: string;
  timingHint?: string;
}

export interface ScriptResult {
  titleCandidates: string[];
  thumbnailConcepts: Array<{
    layout: string;
    text: string;
  }>;
  script: ScriptRow[];
}

