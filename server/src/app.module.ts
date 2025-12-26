import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { LlmModule } from './llm/llm.module';
import { ProjectModule } from './project/project.module';
import { GenerateModule } from './generate/generate.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Serve Vue static build from public/ directory (will be built later)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'], // Exclude API routes
    }),
    PrismaModule,
    LlmModule,
    ProjectModule,
    GenerateModule,
    MetricsModule,
  ],
})
export class AppModule {}

