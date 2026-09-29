import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Course } from '../../../../core/domain/entities/course.entity';
import { ICourseRepository } from '../../../../core/domain/ports/course.repository.port';

interface RegisterCourseInput {
  name: string;
  professor?: string | null;
  section?: string | null;
  userId?: string;
}

export class RegisterCourseUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(dto: RegisterCourseInput) {
    if (!dto.name || dto.name.trim() === '') {
      throw new BadRequestException('El nombre del curso es obligatorio');
    }

    const course = new Course({
      id: randomUUID(),
      name: dto.name,
      professor: dto.professor ?? null,
      section: dto.section ?? null,
      userId: dto.userId ?? 'user-uuid',
    });

    await this.courseRepository.save(course);

    return {
      id: course.id,
      name: course.name,
      professor: course.professor,
      section: course.section,
    };
  }
}
