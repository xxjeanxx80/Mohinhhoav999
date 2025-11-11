import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

// Skipped stub capturing the booking flow with coupons and role enforcement.
describe.skip('Booking E2E (Coupon workflow)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('walks through booking creation, coupon application, and confirmation', async () => {
    // Arrange: login as customer and obtain JWT token
    // const customerLogin = await request(app.getHttpServer())
    //   .post('/auth/login')
    //   .send({ email: 'customer@example.com', password: 'password123' })
    //   .expect(201);
    // const accessToken = customerLogin.body.data.accessToken;

    // Act: create a booking with a valid coupon code
    await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', 'Bearer <accessToken>')
      .send({
        spaId: 'spa-id',
        serviceId: 'service-id',
        staffId: 'staff-id',
        couponCode: 'WELCOME10',
        scheduledAt: new Date().toISOString(),
      })
      .expect(201);

    // Assert: additional checks verifying booking status, commission, and downstream events would be added here
  });
});
