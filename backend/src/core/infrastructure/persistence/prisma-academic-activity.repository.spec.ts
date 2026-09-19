import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { AcademicActivity } from '../../domain/entities/academic-activity.entity';
import { PrismaClient } from '../../../../generated/prisma/client';
import { PrismaAcademicActivityRepository } from './prisma-academic-activity.repository';

describe('PrismaAcademicActivityRepository (Integration)', () => {
  let prisma: PrismaClient;

  beforeEach(async () => {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    prisma = new PrismaClient({ adapter });
    await prisma.academicActivity.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('debe persistir una entidad AcademicActivity en la base de datos', async () => {
    const activity = new AcademicActivity({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      title: 'Entregar práctica de redes',
      description: 'Completar ejercicios del capítulo 3',
      course: 'Redes de Computadoras',
      dueDate: new Date('2026-10-15T23:59:00.000Z'),
      status: 'PENDING',
      priority: 'HIGH',
      source: 'MANUAL',
    });

    const repository = new PrismaAcademicActivityRepository(prisma);

    await repository.save(activity);

    const found = await prisma.academicActivity.findUnique({
      where: { id: activity.id },
    });

    expect(found).not.toBeNull();
    expect(found?.title).toBe(activity.title);
    expect(found?.status).toBe('PENDING');
  });
});
