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

const ALLOWED_PRIORITIES: readonly string[] = ['LOW', 'MEDIUM', 'HIGH'];
const REQUIRED_FIELDS: readonly (keyof RegisterAcademicActivityDto)[] = [
  'title',
  'course',
  'dueDate',
  'priority',
];

export class RegisterAcademicActivityUseCase {
  constructor(private readonly repository: IAcademicActivityRepository) {}

  async execute(dto: RegisterAcademicActivityDto): Promise<AcademicActivity> {
    this.validateDto(dto);

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

  private validateDto(dto: RegisterAcademicActivityDto): void {
    for (const field of REQUIRED_FIELDS) {
      const value = dto[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        throw new Error(`El campo ${field} es obligatorio`);
      }
    }

    if (!ALLOWED_PRIORITIES.includes(dto.priority)) {
      throw new Error('El valor proporcionado para priority no es válido');
    }
  }
}
