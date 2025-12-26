import { Module } from '@nestjs/common';
import { LlmModule } from '@/llm/llm.module';
import { ProjectModule } from '@/project/project.module';
import { GenerateService } from './generate.service';
import { GenerateController } from './generate.controller';

@Module({
  imports: [LlmModule, ProjectModule],
  controllers: [GenerateController],
  providers: [GenerateService],
})
export class GenerateModule {}

