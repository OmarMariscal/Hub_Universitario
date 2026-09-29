import { Course } from '../entities/course.entity';

export interface ICourseRepository {
  save(course: Course): Promise<void>;
  findAllByUserId(userId: string): Promise<Course[]>;
}
