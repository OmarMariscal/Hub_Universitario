import { BadRequestException } from '@nestjs/common';
import { RegisterCourseUseCase } from './register-course.use-case';

describe('RegisterCourseUseCase (RED)', () => {
  const mockCourseRepository = {
    save: jest.fn(),
  } as any;

  const useCase = new RegisterCourseUseCase(mockCourseRepository);

  it('debe crear un curso y devolver datos sin campos internos', async () => {
    const dto = {
      name: 'Matemáticas Avanzadas',
      professor: 'Dr. Pérez',
      section: 'A',
    };
    // Mock implementation to return saved entity
    mockCourseRepository.save.mockResolvedValue({
      id: 'generated-uuid',
      ...dto,
      userId: 'user-uuid',
    });

    const result = await useCase.execute(dto);
    expect(mockCourseRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: dto.name }));
    expect(result).toMatchObject({ name: dto.name, professor: dto.professor, section: dto.section });
    expect(result).not.toHaveProperty('userId'); // assuming we don't expose userId
  });

  it('debe lanzar BadRequestException si falta el nombre del curso', async () => {
    const dto = {
      // name missing
      professor: 'Dr. Pérez',
    };
    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(BadRequestException);
  });
});
