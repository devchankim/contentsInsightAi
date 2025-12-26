import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 minutes for LLM generation
});

// Types
export interface Project {
  id: string;
  title: string;
  topic?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { runs: number };
}

export interface SourceText {
  id: string;
  type: 'reference' | 'myNotes';
  content: string;
  createdAt: string;
}

export interface GenerationRun {
  id: string;
  type: 'analysis' | 'script';
  preset?: string;
  hookStyle?: string;
  targetLength?: number;
  result: string;
  createdAt: string;
  generationTimeMs?: number;
}

export interface InsightCard {
  id: string;
  title: string;
  description: string;
  suggestedPosition: 'hook' | 'body' | 'turn' | 'conclusion';
  intensity: number;
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

// API functions
export const projectApi = {
  list: () => api.get<Project[]>('/projects'),
  get: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (data: { title?: string; topic?: string }) => api.post<Project>('/projects', data),
  update: (id: string, data: { title?: string; topic?: string }) => 
    api.put<Project>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  saveSource: (id: string, type: 'reference' | 'myNotes', content: string) =>
    api.post(`/projects/${id}/sources`, { type, content }),
  getSources: (id: string) => api.get<SourceText[]>(`/projects/${id}/sources`),
};

export const generateApi = {
  analysis: (data: {
    projectId: string;
    referenceText: string;
    myNotes: string;
    provider?: 'openai' | 'anthropic';
  }) => api.post<AnalysisResult>('/generate/analysis', data),
  
  script: (data: {
    projectId: string;
    referenceText: string;
    myNotes: string;
    preset: 'knowledge' | 'entertainer' | 'info';
    hookStyle: 'curiosity' | 'benefit' | 'fear';
    targetLength: number;
    selectedInsightCards?: string[];
    provider?: 'openai' | 'anthropic';
  }) => api.post<ScriptResult>('/generate/script', data),
  
  retouch: (data: {
    projectId: string;
    originalText: string;
    style: 'shorter' | 'stimulating' | 'humor';
    provider?: 'openai' | 'anthropic';
  }) => api.post<{ retouchedText: string }>('/generate/retouch', data),
};

export default api;

