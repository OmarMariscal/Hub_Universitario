import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginUserUseCase } from './login-user.use-case';
import { IUserRepository } from '../../../../core/domain/ports/user.repository.port';
import { IPasswordHasher } from '../../../../core/domain/ports/password-hasher.port';
import { ITokenService } from '../../../../core/domain/ports/token.service.port';

describe('LoginUserUseCase (RED)', () => {
  let useCase: LoginUserUseCase;
  const mockUserRepo = {
    findByEmail: jest.fn(),
  } as unknown as IUserRepository;
  const mockHasher = {
    compare: jest.fn(),
  } as unknown as IPasswordHasher;
  const mockTokenService = {
    sign: jest.fn(),
  } as unknown as ITokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCase,
        { provide: 'IUserRepository', useValue: mockUserRepo },
        { provide: 'IPasswordHasher', useValue: mockHasher },
        { provide: 'ITokenService', useValue: mockTokenService },
      ],
    }).compile();
    useCase = module.get<LoginUserUseCase>(LoginUserUseCase);
  });

  it('debe emitir JWT y datos básicos con credenciales válidas', async () => {
    const email = 'omar.mariscal@alumnos.udg.mx';
    const password = 'SecurePassword123!';
    const user = {
      id: 'uuid-123',
      email,
      password: 'hashed',
      firstName: 'Omar',
      lastName: 'Mariscal',
    } as any;
    mockUserRepo.findByEmail.mockResolvedValueOnce(user);
    mockHasher.compare.mockResolvedValueOnce(true);
    mockTokenService.sign.mockReturnValueOnce('jwt-token');

    const result = await useCase.execute(email, password);
    expect(result).toHaveProperty('accessToken', 'jwt-token');
    expect(result).toHaveProperty('user');
    expect(result.user).toMatchObject({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    expect(result.user).not.toHaveProperty('password');
  });

  it('debe lanzar 401 si la contraseña es incorrecta', async () => {
    const email = 'omar.mariscal@alumnos.udg.mx';
    const password = 'WrongPassword';
    const user = {
      id: 'uuid-123',
      email,
      password: 'hashed',
    } as any;
    mockUserRepo.findByEmail.mockResolvedValueOnce(user);
    mockHasher.compare.mockResolvedValueOnce(false);

    await expect(useCase.execute(email, password)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('debe lanzar 401 si el email no existe', async () => {
    const email = 'nonexistent@domain.com';
    const password = 'AnyPassword';
    mockUserRepo.findByEmail.mockResolvedValueOnce(null);

    await expect(useCase.execute(email, password)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('debe lanzar 400 si faltan campos obligatorios', async () => {
    // Simular falta de email pasando undefined
    // La capa de aplicación debe validar y lanzar BadRequestException
    // Aquí simplemente llamamos con valores undefined para provocar el error en el futuro.
    await expect(useCase.execute(undefined as any, 'pwd')).rejects.toBeInstanceOf(BadRequestException);
  });
});
