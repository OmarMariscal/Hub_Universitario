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
    if (!dto.title || (typeof dto.title === 'string' && dto.title.trim() === '')) {
      throw new Error('El campo title es obligatorio');
    }

    if (!dto.course || (typeof dto.course === 'string' && dto.course.trim() === '')) {
      throw new Error('El campo course es obligatorio');
    }

    if (!dto.dueDate) {
      throw new Error('El campo dueDate es obligatorio');
    }

    if (!dto.priority) {
      throw new Error('El campo priority es obligatorio');
    }

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
