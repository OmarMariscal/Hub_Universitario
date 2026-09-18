import { AcademicActivity } from '../../domain/entities/academic-activity.entity';

export interface IAcademicActivityRepository {
  save(activity: AcademicActivity): Promise<void>;
}
