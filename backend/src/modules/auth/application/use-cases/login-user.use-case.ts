import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../../../../core/domain/ports/user.repository.port';
import { IPasswordHasher } from '../../../../core/domain/ports/password-hasher.port';
import { ITokenService } from '../../../../core/domain/ports/token.service.port';

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
  ) {}

  // TODO: Implement login logic (RED phase)
  async execute(email: string, password: string): Promise<any> {
    // Placeholder to cause test failure until implementation is added.
    throw new Error('Not implemented');
  }
}
