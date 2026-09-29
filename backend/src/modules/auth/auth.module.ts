import { Module } from '@nestjs/common';
import { AuthController } from './presentation/controllers/auth.controller';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher.service';

@Module({
  controllers: [AuthController],
  providers: [
    PrismaUserRepository,
    BcryptPasswordHasher,
    {
      provide: RegisterUserUseCase,
      useFactory: (userRepo: PrismaUserRepository, hasher: BcryptPasswordHasher) => {
        return new RegisterUserUseCase(userRepo, hasher);
      },
      inject: [PrismaUserRepository, BcryptPasswordHasher],
    },
  ],
  exports: [RegisterUserUseCase, PrismaUserRepository, BcryptPasswordHasher],
})
export class AuthModule {}
