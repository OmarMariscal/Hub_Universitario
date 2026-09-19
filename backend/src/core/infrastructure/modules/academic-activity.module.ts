import 'dotenv/config';
import { Module } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../../generated/prisma/client';
import { IAcademicActivityRepository } from '../../application/ports/academic-activity.repository';
import { RegisterAcademicActivityUseCase } from '../../application/use-cases/register-academic-activity/register-academic-activity.use-case';
import { PrismaAcademicActivityRepository } from '../persistence/prisma-academic-activity.repository';
import { AcademicActivityController } from '../http/academic-activity.controller';

@Module({
  controllers: [AcademicActivityController],
  providers: [
    {
      provide: PrismaClient,
      useFactory: () => {
        const adapter = new PrismaPg({
          connectionString: process.env.DATABASE_URL!,
        });
        return new PrismaClient({ adapter });
      },
    },
    {
      provide: 'IAcademicActivityRepository',
      useClass: PrismaAcademicActivityRepository,
    },
    {
      provide: RegisterAcademicActivityUseCase,
      useFactory: (repository: IAcademicActivityRepository) => {
        return new RegisterAcademicActivityUseCase(repository);
      },
      inject: ['IAcademicActivityRepository'],
    },
  ],
})
export class AcademicActivityModule {}
