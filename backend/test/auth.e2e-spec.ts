/* oxlint-disable typescript/unbound-method */
import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e) - HU-02', () => {
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

  const uniqueEmail = `e2e.${Date.now()}@alumnos.udg.mx`;

  it('POST /auth/register - Registro exitoso (201 Created)', async () => {
    const dto = {
      firstName: 'Omar Jesús',
      lastName: 'Mariscal Rodríguez',
      email: uniqueEmail,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(dto);

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(response.body.firstName).toBe('Omar Jesús');
    expect(response.body.lastName).toBe('Mariscal Rodríguez');
    expect(response.body.email).toBe(uniqueEmail);
    expect(response.body.password).toBeUndefined();
  });

  it('POST /auth/register - Fallo por contraseñas distintas (400 Bad Request)', async () => {
    const dto = {
      firstName: 'Omar Jesús',
      lastName: 'Mariscal Rodríguez',
      email: `otro.${Date.now()}@alumnos.udg.mx`,
      password: 'SecurePassword123!',
      confirmPassword: 'PasswordDiferente999!',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(dto);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/contraseñas no coinciden/i);
  });

  it('POST /auth/register - Fallo por correo duplicado (409 Conflict)', async () => {
    const dto = {
      firstName: 'Omar Jesús',
      lastName: 'Mariscal Rodríguez',
      email: uniqueEmail,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(dto);

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/registrado/i);
  });

  it('POST /auth/register - Fallo por campo obligatorio ausente (400 Bad Request)', async () => {
    const dtoSinEmail = {
      firstName: 'Omar Jesús',
      lastName: 'Mariscal Rodríguez',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(dtoSinEmail);

    expect(response.status).toBe(400);
  });

  it('POST /auth/login - Inicio de sesión exitoso (200 OK)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: uniqueEmail,
        password: 'SecurePassword123!',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user).toMatchObject({
      id: expect.any(String),
      firstName: 'Omar Jesús',
      lastName: 'Mariscal Rodríguez',
      email: uniqueEmail,
    });
    expect(response.body.user).not.toHaveProperty('password');
  });

  it('POST /auth/login - Fallo por contraseña incorrecta (401 Unauthorized)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: uniqueEmail,
        password: 'PasswordIncorrecta999!',
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Credenciales inválidas');
  });

  it('POST /auth/login - Fallo por campo obligatorio ausente (400 Bad Request)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: uniqueEmail,
      });

    expect(response.status).toBe(400);
  });
});
