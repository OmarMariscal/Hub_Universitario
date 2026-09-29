import 'dotenv/config';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { IUserRepository } from '../../../../core/domain/ports/user.repository.port';
import { User } from '../../../../core/domain/entities/user.entity';
import { PrismaClient } from '../../../../generated/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository, OnModuleDestroy {
  private readonly pool: Pool;
  private readonly prisma: PrismaClient;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    this.pool = new Pool({ connectionString });
    const adapter = new PrismaPg(this.pool);
    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
    await this.pool.end();
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      create: {
        id: user.id,
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const rawUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!rawUser) {
      return null;
    }

    return new User({
      id: rawUser.id,
      email: rawUser.email,
      password: rawUser.password,
      firstName: rawUser.firstName,
      lastName: rawUser.lastName,
      createdAt: rawUser.createdAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const rawUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!rawUser) {
      return null;
    }

    return new User({
      id: rawUser.id,
      email: rawUser.email,
      password: rawUser.password,
      firstName: rawUser.firstName,
      lastName: rawUser.lastName,
      createdAt: rawUser.createdAt,
    });
  }
}
