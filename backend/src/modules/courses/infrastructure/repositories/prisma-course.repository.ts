import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { ICourseRepository } from '../../../../core/domain/ports/course.repository.port';
import { Course } from '../../../../core/domain/entities/course.entity';
import { PrismaClient } from '../../../../generated/client';

@Injectable()
export class PrismaCourseRepository implements ICourseRepository, OnModuleDestroy {
  private readonly pool: Pool;
  private readonly prisma: PrismaClient;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    this.pool = new Pool({ connectionString });
    const adapter = new PrismaPg(this.pool);
    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
    await this.pool.end();
  }

  async save(course: Course): Promise<void> {
    await this.prisma.course.create({
      data: {
        id: course.id,
        name: course.name,
        professor: course.professor ?? null,
        section: course.section ?? null,
        userId: course.userId,
      },
    });
  }

  async findAllByUserId(userId: string): Promise<Course[]> {
    const prismaCourses = await this.prisma.course.findMany({ where: { userId } });
    return prismaCourses.map((course) =>
      new Course({
        id: course.id,
        name: course.name,
        professor: course.professor,
        section: course.section,
        userId: course.userId,
      }),
    );
  }
}
