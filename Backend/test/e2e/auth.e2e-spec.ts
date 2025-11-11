import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

// Skipped for now: serves as a scaffold for a full JWT guard integration test.
describe.skip('Auth E2E (JWT Guard)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('simulates a customer login and validates JWT-protected access', async () => {
    // Arrange: register and log in a user to obtain JWT tokens
    // const loginResponse = await request(app.getHttpServer())
    //   .post('/auth/login')
    //   .send({ email: 'customer@example.com', password: 'password123' })
    //   .expect(201);
    // const accessToken = loginResponse.body.data.accessToken;

    // Act & Assert: confirm protected route enforces JWT guard and role permissions
    await request(app.getHttpServer())
      .get('/customers/profile')
      .set('Authorization', 'Bearer <accessToken>')
      .expect(200);
  });
});
