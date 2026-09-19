import { AcademicActivity } from '../../domain/entities/academic-activity.entity';
import { IAcademicActivityRepository } from '../../application/ports/academic-activity.repository';
import { PrismaClient } from '../../../../generated/prisma/client';

export class PrismaAcademicActivityRepository
  implements IAcademicActivityRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async save(activity: AcademicActivity): Promise<void> {
    await this.prisma.academicActivity.create({
      data: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        course: activity.course,
        dueDate: activity.dueDate,
        status: activity.status,
        priority: activity.priority,
        source: activity.source,
      },
    });
  }
}
