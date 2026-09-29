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

  async execute(email: string, password: string): Promise<any> {
    // Validate required fields
    if (!email || !password) {
      throw new BadRequestException('Todos los campos obligatorios deben ser proporcionados');
    }

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Do not reveal whether email or password is incorrect
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verify password
    const passwordMatches = await this.passwordHasher.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generate JWT token
    const token = await this.tokenService.sign({ sub: user.id, email: user.email });

    // Return user data without password
    const { id, firstName, lastName, email: userEmail } = user;
    return {
      accessToken: token,
      user: { id, firstName, lastName, email: userEmail },
    };
  }
}
