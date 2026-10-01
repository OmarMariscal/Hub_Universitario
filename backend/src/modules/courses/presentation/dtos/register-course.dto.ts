import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Data Transfer Object for creating a course.
 *
 * - `name` is required.
 * - `professor` and `section` are optional and may be omitted or set to `null`.
 */
export class RegisterCourseDto {
  @IsNotEmpty({ message: 'El nombre del curso es obligatorio' })
  name: string;

  @IsOptional()
  @IsString()
  professor?: string | null;

  @IsOptional()
  @IsString()
  section?: string | null;
}
