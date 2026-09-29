import { Injectable, BadRequestException, UnauthorizedException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../../../core/domain/ports/user.repository.port';
import { IPasswordHasher } from '../../../../core/domain/ports/password-hasher.port';
import { ITokenService } from '../../../../core/domain/ports/token.service.port';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IPasswordHasher') private readonly passwordHasher: IPasswordHasher,
    @Inject('ITokenService') private readonly tokenService: ITokenService,
  ) {}

  private throwInvalidCredentials(): never {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  async execute(email: string, password: string): Promise<any> {
    if (!email || !password) {
      throw new BadRequestException('Todos los campos obligatorios deben ser proporcionados');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.throwInvalidCredentials();
    }

    const passwordMatches = await this.passwordHasher.compare(password, user.password);
    if (!passwordMatches) {
      this.throwInvalidCredentials();
    }

    const accessToken = await this.tokenService.sign({ sub: user.id, email: user.email });
    const { id, firstName, lastName, email: userEmail } = user;
    return {
      accessToken,
      user: { id, firstName, lastName, email: userEmail },
    };
  }
}
