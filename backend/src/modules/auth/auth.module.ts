import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './presentation/controllers/auth.controller';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher.service';
import { JwtTokenService } from './infrastructure/services/jwt-token.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaUserRepository,
    BcryptPasswordHasher,
    JwtTokenService,
    JwtStrategy,
    JwtAuthGuard,
    {
      provide: RegisterUserUseCase,
      useFactory: (userRepo: PrismaUserRepository, hasher: BcryptPasswordHasher) =>
        new RegisterUserUseCase(userRepo, hasher),
      inject: [PrismaUserRepository, BcryptPasswordHasher],
    },
    {
      provide: LoginUserUseCase,
      useFactory: (
        userRepo: PrismaUserRepository,
        hasher: BcryptPasswordHasher,
        tokenService: JwtTokenService,
      ) => new LoginUserUseCase(userRepo, hasher, tokenService),
      inject: [PrismaUserRepository, BcryptPasswordHasher, JwtTokenService],
    },
  ],
  exports: [
    RegisterUserUseCase,
    LoginUserUseCase,
    PrismaUserRepository,
    BcryptPasswordHasher,
    JwtTokenService,
    JwtAuthGuard,
  ],
})
export class AuthModule {}
