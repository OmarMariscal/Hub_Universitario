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

  it('debe rechazar la creación si el campo title está ausente o vacío (CA-1, CA-5)', async () => {
    // Arrange: DTO con title ausente y stub del repositorio
    const dtoSinTitle = {
      course: 'Calidad de Software',
      dueDate: new Date('2026-10-20T18:00:00'),
      priority: 'MEDIUM' as const,
    };

    const repositoryStub = {
      save: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new RegisterAcademicActivityUseCase(repositoryStub as any);

    // Act & Assert: debe lanzar error indicando que title es obligatorio
    await expect(useCase.execute(dtoSinTitle as any)).rejects.toThrow(/title/i);
  });

  it('debe rechazar la creación si el campo priority tiene un valor no permitido (CA-4, CA-6)', async () => {
    // Arrange: DTO con priority no permitida ('URGENT') usando as any para simular payload inválido
    const dtoPrioridadInvalida = {
      title: 'Presentar proyecto final',
      course: 'Ingeniería de Software',
      dueDate: new Date('2026-11-05T09:00:00'),
      priority: 'URGENT',
    };

    const repositoryStub = {
      save: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new RegisterAcademicActivityUseCase(repositoryStub as any);

    // Act & Assert: debe lanzar error indicando que priority no es un valor permitido
    await expect(
      useCase.execute(dtoPrioridadInvalida as any),
    ).rejects.toThrow(/priority/i);
  });
});
