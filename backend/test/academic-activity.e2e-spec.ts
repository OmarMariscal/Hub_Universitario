import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AcademicActivityModule } from '../src/core/infrastructure/modules/academic-activity.module';

describe('POST /activities (E2E — HU-01)', () => {
  let app: INestApplication;
  const saveMock = jest.fn().mockResolvedValue(undefined);

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AcademicActivityModule],
    })
      .overrideProvider('IAcademicActivityRepository')
      .useValue({ save: saveMock })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    saveMock.mockClear();
  });

  it('debe registrar exitosamente una actividad académica con código 201 (CA-1, CA-2, CA-3, CA-7)', async () => {
    const payload = {
      title: 'Entregar práctica de redes',
      course: 'Redes de Computadoras',
      dueDate: '2026-10-15T23:59:00.000Z',
      priority: 'HIGH',
    };

    const response = await request(app.getHttpServer())
      .post('/activities')
      .send(payload)
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.status).toBe('PENDING');
    expect(response.body.source).toBe('MANUAL');
    expect(response.body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it('debe rechazar la solicitud con código 400 cuando falta el campo obligatorio title (CA-1, CA-5)', async () => {
    const payload = {
      course: 'Calidad de Software',
      dueDate: '2026-10-20T18:00:00.000Z',
      priority: 'MEDIUM',
    };

    const response = await request(app.getHttpServer())
      .post('/activities')
      .send(payload)
      .expect(400);

    const errorMessage = Array.isArray(response.body.message)
      ? response.body.message.join(' ')
      : response.body.message;

    expect(errorMessage).toMatch(/title/i);
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('debe rechazar la solicitud con código 400 cuando el campo priority no es válido (CA-4, CA-6)', async () => {
    const payload = {
      title: 'Presentar proyecto final',
      course: 'Ingeniería de Software',
      dueDate: '2026-11-05T09:00:00.000Z',
      priority: 'URGENT',
    };

    const response = await request(app.getHttpServer())
      .post('/activities')
      .send(payload)
      .expect(400);

    const errorMessage = Array.isArray(response.body.message)
      ? response.body.message.join(' ')
      : response.body.message;

    expect(errorMessage).toMatch(/priority/i);
    expect(saveMock).not.toHaveBeenCalled();
  });
});
