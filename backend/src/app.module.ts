import { Module } from '@nestjs/common';
import { AcademicActivityModule } from './core/infrastructure/modules/academic-activity.module';

@Module({
  imports: [AcademicActivityModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
