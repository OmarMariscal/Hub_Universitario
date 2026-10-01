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
    this.validateRequiredFields(command);
    this.validatePasswordMatch(command.password, command.confirmPassword);

    await this.ensureEmailIsUnique(command.email);

    const hashedPassword = await this.passwordHasher.hash(command.password);

    const user = new User({
      id: randomUUID(),
      firstName: command.firstName.trim(),
      lastName: command.lastName.trim(),
      email: command.email.toLowerCase().trim(),
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return this.toResponse(user);
  }

  private validateRequiredFields(command: RegisterUserCommand): void {
    const { firstName, lastName, email, password, confirmPassword } = command;
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      throw new BadRequestException('Todos los campos obligatorios deben ser proporcionados');
    }
  }

  private validatePasswordMatch(password: string, confirmPassword: string): void {
    if (password !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
  }

  private async ensureEmailIsUnique(email: string): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('El correo ya se encuentra registrado');
    }
  }

  private toResponse(user: User): UserResponse {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  }
}

