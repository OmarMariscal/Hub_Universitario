import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService } from '../../../../core/domain/ports/token.service.port';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  async sign(payload: Record<string, any>): Promise<string> {
    // signAsync returns a Promise<string>
    return this.jwtService.signAsync(payload);
  }

  async verify<T extends object = any>(token: string): Promise<T> {
    return this.jwtService.verifyAsync<T>(token);
  }
}
