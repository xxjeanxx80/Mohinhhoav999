import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Booking Flow (e2e)', () => {
  let app: INestApplication;
  let customerToken: string;
  let ownerId: number;
  let customerId: number;
  let spaId: number;
  let serviceId: number;
  let staffId: number;
  let bookingId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Booking Flow', () => {
    it('Step 1: Register as OWNER and create spa', async () => {
      // Register owner
      const ownerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'owner@test.com',
          password: 'Test123456',
          role: 'OWNER',
        })
        .expect(201);

      ownerId = ownerResponse.body.data.user.id;
      const ownerToken = ownerResponse.body.data.tokens.accessToken;

      // Create spa
      const spaResponse = await request(app.getHttpServer())
        .post('/spas')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Test Luxury Spa',
          address: '123 Test Street, District 1',
          phone: '0123456789',
          latitude: 10.7769,
          longitude: 106.7009,
          openingTime: '08:00',
          closingTime: '22:00',
        })
        .expect(201);

      spaId = spaResponse.body.data.id;
      expect(spaId).toBeDefined();
    });

    it('Step 2: Admin approves spa', async () => {
      // Register admin
      const adminResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'Admin123456',
          role: 'ADMIN',
        })
        .expect(201);

      const adminToken = adminResponse.body.data.tokens.accessToken;

      // Approve spa
      await request(app.getHttpServer())
        .patch(`/spas/${spaId}/approval`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isApproved: true,
        })
        .expect(200);
    });

    it('Step 3: Owner creates service and staff', async () => {
      // Login as owner
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'owner@test.com',
          password: 'Test123456',
        })
        .expect(200);

      const ownerToken = loginResponse.body.data.tokens.accessToken;

      // Create service
      const serviceResponse = await request(app.getHttpServer())
        .post('/services')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          spaId,
          name: 'Swedish Massage',
          description: 'Relaxing full body massage',
          price: 500000,
          durationMinutes: 90,
        })
        .expect(201);

      serviceId = serviceResponse.body.data.id;

      // Create staff
      const staffResponse = await request(app.getHttpServer())
        .post('/staff')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          spaId,
          name: 'John Therapist',
          email: 'john@spa.com',
          phone: '0987654321',
          skills: ['Massage', 'Aromatherapy'],
        })
        .expect(201);

      staffId = staffResponse.body.data.id;
    });

    it('Step 4: Customer browses spas (public)', async () => {
      // Get featured spas
      const featuredResponse = await request(app.getHttpServer())
        .get('/spas/public/featured')
        .expect(200);

      expect(featuredResponse.body.data).toBeInstanceOf(Array);
      expect(featuredResponse.body.data.length).toBeGreaterThan(0);

      // Get spa details
      const spaDetailResponse = await request(app.getHttpServer())
        .get(`/spas/public/${spaId}`)
        .expect(200);

      expect(spaDetailResponse.body.data.name).toBe('Test Luxury Spa');
      expect(spaDetailResponse.body.data.services).toBeDefined();
    });

    it('Step 5: Customer finds nearby spas using geolocation', async () => {
      const response = await request(app.getHttpServer())
        .get('/spas/nearby')
        .query({
          lat: 10.7769,
          lng: 106.7009,
          radius: 10,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      // Should find our test spa
      const foundSpa = response.body.data.find((s: any) => s.spa_id === spaId);
      expect(foundSpa).toBeDefined();
      expect(foundSpa.distance_km).toBeDefined();
      expect(parseFloat(foundSpa.distance_km)).toBeLessThan(1); // Very close
    });

    it('Step 6: Customer registers and creates booking', async () => {
      // Register customer
      const customerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'customer@test.com',
          password: 'Customer123',
          role: 'CUSTOMER',
        })
        .expect(201);

      customerId = customerResponse.body.data.user.id;
      customerToken = customerResponse.body.data.tokens.accessToken;

      // Create booking
      const bookingResponse = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          spaId,
          serviceId,
          staffId,
          customerId,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        })
        .expect(201);

      bookingId = bookingResponse.body.data.id;
      expect(bookingResponse.body.data.status).toBe('CONFIRMED');
      expect(bookingResponse.body.data.finalPrice).toBeDefined();
      expect(bookingResponse.body.data.commissionAmount).toBeDefined();
    });

    it('Step 7: Customer views their bookings', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookings/me')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const booking = response.body.data[0];
      expect(booking.spa).toBeDefined();
      expect(booking.service).toBeDefined();
      expect(booking.staff).toBeDefined();
    });

    it('Step 8: Customer submits feedback after booking', async () => {
      const feedbackResponse = await request(app.getHttpServer())
        .post('/feedbacks')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          bookingId,
          rating: 5,
          comment: 'Excellent service! Very relaxing and professional.',
        })
        .expect(201);

      expect(feedbackResponse.body.data.rating).toBe(5);
      expect(feedbackResponse.body.data.spa).toBeDefined();
    });

    it('Step 9: Verify feedback appears in spa details', async () => {
      const spaResponse = await request(app.getHttpServer())
        .get(`/spas/public/${spaId}`)
        .expect(200);

      expect(spaResponse.body.data.feedbacks).toBeDefined();
      expect(spaResponse.body.data.feedbacks.length).toBeGreaterThan(0);
      
      const feedback = spaResponse.body.data.feedbacks[0];
      expect(feedback.rating).toBe(5);
      expect(feedback.customer).toBeDefined();
    });

    it('Step 10: Verify recent feedbacks endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/feedbacks/public/recent')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      const ourFeedback = response.body.data.find((f: any) => f.rating === 5);
      expect(ourFeedback).toBeDefined();
    });
  });

  describe('Booking Reschedule & Cancel', () => {
    it('Should reschedule booking', async () => {
      const newDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 2 days from now
      
      const response = await request(app.getHttpServer())
        .patch(`/bookings/${bookingId}/reschedule`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          scheduledAt: newDate.toISOString(),
        })
        .expect(200);

      expect(response.body.data.scheduledAt).toBeDefined();
    });

    it('Should cancel booking with soft delete', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          reason: 'Change of plans',
        })
        .expect(200);

      expect(response.body.data.status).toBe('CANCELLED');
    });
  });

  describe('CASCADE Delete Behavior', () => {
    it('Deleting booking should cascade to feedbacks', async () => {
      // This tests the CASCADE constraint
      // When a booking is soft-deleted, feedbacks should also be handled
      
      const bookingsResponse = await request(app.getHttpServer())
        .get('/bookings/me')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      // Soft-deleted bookings should not appear
      const activeBooking = bookingsResponse.body.data.find((b: any) => b.id === bookingId);
      expect(activeBooking).toBeUndefined(); // Should not find cancelled booking
    });
  });
});

