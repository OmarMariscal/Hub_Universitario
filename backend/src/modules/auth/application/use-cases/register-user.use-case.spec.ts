/* oxlint-disable typescript/unbound-method */
import { BadRequestException, ConflictException } from '@nestjs/common';
import { RegisterUserUseCase } from './register-user.use-case';
import { IUserRepository } from '../../../../core/domain/ports/user.repository.port';
import { IPasswordHasher } from '../../../../core/domain/ports/password-hasher.port';
import { User } from '../../../../core/domain/entities/user.entity';

describe('RegisterUserUseCase', () => {
  let userRepositoryMock: jest.Mocked<IUserRepository>;
  let passwordHasherMock: jest.Mocked<IPasswordHasher>;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    userRepositoryMock = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    passwordHasherMock = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    useCase = new RegisterUserUseCase(userRepositoryMock, passwordHasherMock);
  });

  it('debe crear un usuario exitosamente y devolver datos sin el campo password (Escenario 1)', async () => {
    // Arrange
    const dto = {
      firstName: 'Omar Jesús',
      lastName: 'Mariscal Rodríguez',
      email: 'omar.mariscal@alumnos.udg.mx',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    };

    userRepositoryMock.findByEmail.mockResolvedValue(null);
    passwordHasherMock.hash.mockResolvedValue('$2b$10$hashedPassword123');
    userRepositoryMock.save.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith('omar.mariscal@alumnos.udg.mx');
    expect(passwordHasherMock.hash).toHaveBeenCalledWith('SecurePassword123!');
    expect(userRepositoryMock.save).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.firstName).toBe('Omar Jesús');
    expect(result.lastName).toBe('Mariscal Rodríguez');
    expect(result.email).toBe('omar.mariscal@alumnos.udg.mx');
    expect((result as any).password).toBeUndefined();
  });

  it('debe lanzar BadRequestException si las contraseñas no coinciden (Escenario 2)', async () => {
    // Arrange
    const dto = {
      firstName: 'Omar Jesús',
      lastName: 'Mariscal Rodríguez',
      email: 'omar.mariscal@alumnos.udg.mx',
      password: 'SecurePassword123!',
      confirmPassword: 'PasswordDiferente999!',
    };

    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    expect(userRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('debe lanzar ConflictException si el correo electrónico ya está registrado (Escenario 3)', async () => {
    // Arrange
    const dto = {
      firstName: 'Omar Jesús',
      lastName: 'Mariscal Rodríguez',
      email: 'omar.mariscal@alumnos.udg.mx',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    };

    const existingUser = new User({
      id: 'existing-uuid',
      firstName: 'Omar',
      lastName: 'Mariscal',
      email: 'omar.mariscal@alumnos.udg.mx',
      password: 'hashed-password',
    });

    userRepositoryMock.findByEmail.mockResolvedValue(existingUser);

    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(userRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('debe lanzar BadRequestException si falta un campo obligatorio como email (Escenario 4)', async () => {
    // Arrange
    const dtoSinEmail = {
      firstName: 'Omar Jesús',
      lastName: 'Mariscal Rodríguez',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    };

    // Act & Assert
    await expect(useCase.execute(dtoSinEmail as any)).rejects.toThrow(BadRequestException);
    expect(userRepositoryMock.save).not.toHaveBeenCalled();
  });
});
