import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';
import { RegisterCourseUseCase } from './application/use-cases/register-course.use-case';
import { PrismaCourseRepository } from './infrastructure/repositories/prisma-course.repository';
import { CoursesController } from './presentation/controllers/courses.controller';

@Module({
  imports: [AuthModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [CoursesController],
  providers: [
    PrismaCourseRepository,
    {
      provide: RegisterCourseUseCase,
      useFactory: (courseRepo: PrismaCourseRepository) => new RegisterCourseUseCase(courseRepo),
      inject: [PrismaCourseRepository],
    },
  ],
  exports: [RegisterCourseUseCase, PrismaCourseRepository],
})
export class CoursesModule {}
