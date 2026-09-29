import { BadRequestException } from '@nestjs/common';
import { ICourseRepository } from '../../../core/domain/ports/course.repository.port';
import { Course } from '../../../../core/domain/entities/course.entity';
import { randomUUID } from 'crypto';

interface RegisterCourseDto {
  name: string;
  professor?: string;
  section?: string;
}

export class RegisterCourseUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(dto: RegisterCourseDto) {
    if (!dto.name || dto.name.trim() === '') {
      throw new BadRequestException('El nombre del curso es obligatorio');
    }

    const course = new Course({
      id: randomUUID(),
      name: dto.name,
      professor: dto.professor ?? null,
      section: dto.section ?? null,
      userId: 'user-uuid', // placeholder user identifier
    });

    await this.courseRepository.save(course);
    // Return without exposing internal userId (if any)
    return {
      id: course.id,
      name: course.name,
      professor: course.professor,
      section: course.section,
    };
  }
}
