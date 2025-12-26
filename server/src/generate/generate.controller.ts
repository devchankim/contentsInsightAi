import { Controller, Post, Body } from '@nestjs/common';
import { GenerateService } from './generate.service';
import { GenerateAnalysisDto, GenerateScriptDto, RetouchDto } from './dto/generate.dto';

@Controller('api/generate')
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}

  @Post('analysis')
  async generateAnalysis(@Body() dto: GenerateAnalysisDto) {
    return this.generateService.generateAnalysis(dto);
  }

  @Post('script')
  async generateScript(@Body() dto: GenerateScriptDto) {
    return this.generateService.generateScript(dto);
  }

  @Post('retouch')
  async retouch(@Body() dto: RetouchDto) {
    return this.generateService.retouch(dto);
  }
}

