import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Controller('api/metrics')
export class MetricsController {
  constructor(private prisma: PrismaService) {}

  @Get('project/:id')
  async getProjectMetrics(@Param('id') id: string) {
    const runs = await this.prisma.generationRun.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'asc' },
    });

    const analysisRuns = runs.filter(r => r.type === 'analysis');
    const scriptRuns = runs.filter(r => r.type === 'script');

    const avgAnalysisTime = analysisRuns.length > 0
      ? analysisRuns.reduce((sum, r) => sum + (r.generationTimeMs || 0), 0) / analysisRuns.length
      : 0;

    const avgScriptTime = scriptRuns.length > 0
      ? scriptRuns.reduce((sum, r) => sum + (r.generationTimeMs || 0), 0) / scriptRuns.length
      : 0;

    return {
      totalRuns: runs.length,
      analysisCount: analysisRuns.length,
      scriptCount: scriptRuns.length,
      avgAnalysisTimeMs: Math.round(avgAnalysisTime),
      avgScriptTimeMs: Math.round(avgScriptTime),
      totalTokensUsed: runs.reduce((sum, r) => sum + (r.tokensUsed || 0), 0),
      firstRunAt: runs[0]?.createdAt,
      lastRunAt: runs[runs.length - 1]?.createdAt,
    };
  }

  @Get('summary')
  async getGlobalMetrics() {
    const [projects, runs] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.generationRun.findMany({
        select: {
          type: true,
          generationTimeMs: true,
          tokensUsed: true,
        },
      }),
    ]);

    const analysisRuns = runs.filter(r => r.type === 'analysis');
    const scriptRuns = runs.filter(r => r.type === 'script');

    return {
      totalProjects: projects,
      totalRuns: runs.length,
      avgAnalysisTimeMs: analysisRuns.length > 0
        ? Math.round(analysisRuns.reduce((sum, r) => sum + (r.generationTimeMs || 0), 0) / analysisRuns.length)
        : 0,
      avgScriptTimeMs: scriptRuns.length > 0
        ? Math.round(scriptRuns.reduce((sum, r) => sum + (r.generationTimeMs || 0), 0) / scriptRuns.length)
        : 0,
      totalTokens: runs.reduce((sum, r) => sum + (r.tokensUsed || 0), 0),
    };
  }
}

