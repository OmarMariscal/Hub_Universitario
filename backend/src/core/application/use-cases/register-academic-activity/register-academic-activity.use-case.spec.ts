import { RegisterAcademicActivityUseCase } from './register-academic-activity.use-case';

describe('RegisterAcademicActivityUseCase', () => {
  it('debe crear una actividad académica con status PENDING, source MANUAL y un id UUID válido (CA-3, CA-7)', async () => {
    // Arrange: datos válidos de entrada y stub del repositorio
    const dto = {
      title: 'Entregar práctica de redes',
      course: 'Redes de Computadoras',
      dueDate: new Date('2026-10-15T23:59:00'),
      priority: 'HIGH' as const,
    };

    const repositoryStub = {
      save: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new RegisterAcademicActivityUseCase(repositoryStub as any);

    // Act
    const result = await useCase.execute(dto);

    // Assert: Criterios CA-3 y CA-7
    expect(result).toBeDefined();
    expect(result.status).toBe('PENDING');
    expect(result.source).toBe('MANUAL');
    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
