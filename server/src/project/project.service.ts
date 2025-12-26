import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { runs: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        sources: true,
        runs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async create(data: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        title: data.title || '새 프로젝트',
        topic: data.topic,
      },
    });
  }

  async update(id: string, data: UpdateProjectDto) {
    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.project.delete({
      where: { id },
    });
  }

  async saveSourceText(projectId: string, type: 'reference' | 'myNotes', content: string) {
    // Delete existing source of same type for this project (keep only latest)
    await this.prisma.sourceText.deleteMany({
      where: { projectId, type },
    });

    return this.prisma.sourceText.create({
      data: {
        projectId,
        type,
        content,
      },
    });
  }

  async getSources(projectId: string) {
    return this.prisma.sourceText.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

