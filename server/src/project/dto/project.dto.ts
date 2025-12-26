import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateProjectDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  topic?: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  topic?: string;
}

export class SaveSourceDto {
  @IsIn(['reference', 'myNotes'])
  type: 'reference' | 'myNotes';

  @IsString()
  content: string;
}

