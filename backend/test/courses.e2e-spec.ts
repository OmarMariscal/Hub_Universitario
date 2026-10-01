/* oxlint-disable typescript/unbound-method */
import 'dotenv/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('CoursesController (e2e) - HU-04', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const registerUser = async (email: string) => {
    const body = {
      firstName: 'Curso',
      lastName: 'E2E',
      email,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    };

    return request(app.getHttpServer()).post('/auth/register').send(body);
  };

  const loginUser = async (email: string) => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email,
      password: 'SecurePassword123!',
    });

    return response.body.accessToken as string;
  };

  it('POST /courses - crea una materia con JWT válido (201 Created)', async () => {
    const email = `course.${Date.now()}@alumnos.udg.mx`;
    await registerUser(email);
    const token = await loginUser(email);

    const response = await request(app.getHttpServer())
      .post('/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Matemáticas Avanzadas',
        professor: 'Dr. Ramírez',
        section: 'A-101',
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: 'Matemáticas Avanzadas',
      professor: 'Dr. Ramírez',
      section: 'A-101',
    });
    expect(response.body.id).toBeDefined();
  });

  it('POST /courses - falla con 400 si falta el nombre', async () => {
    const email = `course-missing.${Date.now()}@alumnos.udg.mx`;
    await registerUser(email);
    const token = await loginUser(email);

    const response = await request(app.getHttpServer())
      .post('/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        professor: 'Dr. Torres',
      });

    expect(response.status).toBe(400);
  });

  it('POST /courses - falla con 401 si no hay JWT', async () => {
    const response = await request(app.getHttpServer())
      .post('/courses')
      .send({
        name: 'Sin autenticación',
      });

    expect(response.status).toBe(401);
  });
});
