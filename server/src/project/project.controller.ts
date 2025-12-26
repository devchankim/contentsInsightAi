import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto, SaveSourceDto } from './dto/project.dto';

@Controller('api/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateProjectDto) {
    return this.projectService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateProjectDto) {
    return this.projectService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.projectService.delete(id);
  }

  @Post(':id/sources')
  saveSource(@Param('id') id: string, @Body() data: SaveSourceDto) {
    return this.projectService.saveSourceText(id, data.type, data.content);
  }

  @Get(':id/sources')
  getSources(@Param('id') id: string) {
    return this.projectService.getSources(id);
  }
}

