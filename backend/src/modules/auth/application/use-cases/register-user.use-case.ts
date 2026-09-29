import { BadRequestException, ConflictException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { IUserRepository } from '../../../../core/domain/ports/user.repository.port';
import { IPasswordHasher } from '../../../../core/domain/ports/password-hasher.port';
import { User } from '../../../../core/domain/entities/user.entity';

export interface RegisterUserCommand {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserResponse> {
    if (!command.email || !command.firstName || !command.lastName || !command.password || !command.confirmPassword) {
      throw new BadRequestException('Todos los campos obligatorios deben ser proporcionados');
    }

    if (command.password !== command.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new ConflictException('El correo ya se encuentra registrado');
    }

    const hashedPassword = await this.passwordHasher.hash(command.password);

    const user = new User({
      id: randomUUID(),
      firstName: command.firstName,
      lastName: command.lastName,
      email: command.email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  }
}
