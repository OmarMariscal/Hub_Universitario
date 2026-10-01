import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO para crear una materia académica.
 *
 * - `name` es obligatorio.
 * - `professor` y `section` son explícitamente opcionales.
 */
export class CreateCourseDto {
  @IsNotEmpty({ message: 'El nombre de la materia es obligatorio' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  professor?: string | null;

  @IsOptional()
  @IsString()
  section?: string | null;
}
