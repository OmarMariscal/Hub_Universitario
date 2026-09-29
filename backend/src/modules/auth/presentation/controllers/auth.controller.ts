import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegisterUserUseCase, UserResponse } from '../../application/use-cases/register-user.use-case';
import { RegisterUserDto } from '../dtos/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto): Promise<UserResponse> {
    return this.registerUserUseCase.execute(dto);
  }
}
