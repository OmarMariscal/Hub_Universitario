import { randomUUID } from 'node:crypto';
import { AcademicActivity } from '../../../domain/entities/academic-activity.entity';
import { IAcademicActivityRepository } from '../../ports/academic-activity.repository';

export interface RegisterAcademicActivityDto {
  title: string;
  course: string;
  dueDate: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  description?: string;
}

export class RegisterAcademicActivityUseCase {
  constructor(private readonly repository: IAcademicActivityRepository) {}

  async execute(dto: RegisterAcademicActivityDto): Promise<AcademicActivity> {
    const activity = new AcademicActivity({
      id: randomUUID(),
      title: dto.title,
      description: dto.description,
      course: dto.course,
      dueDate: dto.dueDate,
      status: 'PENDING',
      priority: dto.priority,
      source: 'MANUAL',
    });

    await this.repository.save(activity);

    return activity;
  }
}
