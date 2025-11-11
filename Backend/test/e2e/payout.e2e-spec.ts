import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

// Skipped stub to validate the payout approval lifecycle for owners and admins.
describe.skip('Payout E2E (Approval lifecycle)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('requests, reviews, and completes a payout with appropriate role checks', async () => {
    // Arrange: login as spa owner to request a payout
    // const ownerLogin = await request(app.getHttpServer())
    //   .post('/auth/login')
    //   .send({ email: 'owner@example.com', password: 'password123' })
    //   .expect(201);
    // const ownerToken = ownerLogin.body.data.accessToken;

    await request(app.getHttpServer())
      .post('/payouts/request')
      .set('Authorization', 'Bearer <ownerToken>')
      .send({ amount: 250, note: 'Weekly earnings' })
      .expect(201);

    // Act & Assert: admin reviews and completes the payout
    // const adminLogin = await request(app.getHttpServer())
    //   .post('/auth/login')
    //   .send({ email: 'admin@example.com', password: 'password123' })
    //   .expect(201);
    // const adminToken = adminLogin.body.data.accessToken;

    await request(app.getHttpServer())
      .patch('/payouts/review')
      .set('Authorization', 'Bearer <adminToken>')
      .send({ payoutId: 'payout-id', status: 'APPROVED' })
      .expect(200);

    await request(app.getHttpServer())
      .patch('/payouts/complete')
      .set('Authorization', 'Bearer <adminToken>')
      .send({ payoutId: 'payout-id' })
      .expect(200);
  });
});
