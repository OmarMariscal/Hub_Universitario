import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';

@Module({
  imports: [AuthModule, CoursesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
