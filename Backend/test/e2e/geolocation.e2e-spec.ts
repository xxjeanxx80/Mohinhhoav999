import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Geolocation - Nearby Spas (e2e)', () => {
  let app: INestApplication;
  let ownerToken: string;
  let adminToken: string;

  // Test locations in Ho Chi Minh City
  const testLocations = [
    {
      name: 'Spa Central District 1',
      lat: 10.7769,
      lng: 106.7009,
      address: '123 Nguyen Hue, District 1, HCMC',
    },
    {
      name: 'Spa District 3',
      lat: 10.7831,
      lng: 106.6917,
      address: '456 Vo Van Tan, District 3, HCMC',
    },
    {
      name: 'Spa Binh Thanh',
      lat: 10.8142,
      lng: 106.7064,
      address: '789 Xo Viet Nghe Tinh, Binh Thanh, HCMC',
    },
    {
      name: 'Spa Far Away',
      lat: 10.9500,
      lng: 106.8500,
      address: 'Remote location, far from city center',
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Setup: Register owner and admin
    const ownerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'geo-owner@test.com',
        password: 'Test123456',
        role: 'OWNER',
      });

    ownerToken = ownerResponse.body.data.tokens.accessToken;

    const adminResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'geo-admin@test.com',
        password: 'Admin123456',
        role: 'ADMIN',
      });

    adminToken = adminResponse.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Setup Test Spas with Different Locations', () => {
    it('Should create multiple spas at different locations', async () => {
      for (const location of testLocations) {
        // Create spa
        const spaResponse = await request(app.getHttpServer())
          .post('/spas')
          .set('Authorization', `Bearer ${ownerToken}`)
          .send({
            name: location.name,
            address: location.address,
            phone: '0123456789',
            latitude: location.lat,
            longitude: location.lng,
            openingTime: '08:00',
            closingTime: '22:00',
          })
          .expect(201);

        const spaId = spaResponse.body.data.id;

        // Approve spa
        await request(app.getHttpServer())
          .patch(`/spas/${spaId}/approval`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            isApproved: true,
          })
          .expect(200);
      }
    });
  });

  describe('Haversine Distance Calculation', () => {
    it('Should find nearby spas within 5km radius from District 1', async () => {
      const response = await request(app.getHttpServer())
        .get('/spas/nearby')
        .query({
          lat: 10.7769, // District 1 center
          lng: 106.7009,
          radius: 5, // 5km radius
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      // Should find spas in District 1, 3, and Binh Thanh
      // Should NOT find the far away spa
      const spaNames = response.body.data.map((s: any) => s.name);
      expect(spaNames).toContain('Spa Central District 1');
      expect(spaNames).toContain('Spa District 3');
      
      // Verify distance calculations
      response.body.data.forEach((spa: any) => {
        expect(spa.distance_km).toBeDefined();
        expect(parseFloat(spa.distance_km)).toBeLessThanOrEqual(5);
      });
    });

    it('Should sort results by distance (nearest first)', async () => {
      const response = await request(app.getHttpServer())
        .get('/spas/nearby')
        .query({
          lat: 10.7769,
          lng: 106.7009,
          radius: 10,
        })
        .expect(200);

      const distances = response.body.data.map((s: any) => parseFloat(s.distance_km));
      
      // Verify sorted ascending
      for (let i = 1; i < distances.length; i++) {
        expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1]);
      }

      // First result should be the closest spa
      expect(response.body.data[0].name).toBe('Spa Central District 1');
    });

    it('Should respect radius parameter', async () => {
      // Test with 1km radius - should only find very close spas
      const smallRadiusResponse = await request(app.getHttpServer())
        .get('/spas/nearby')
        .query({
          lat: 10.7769,
          lng: 106.7009,
          radius: 1,
        })
        .expect(200);

      // Test with 20km radius - should find more spas
      const largeRadiusResponse = await request(app.getHttpServer())
        .get('/spas/nearby')
        .query({
          lat: 10.7769,
          lng: 106.7009,
          radius: 20,
        })
        .expect(200);

      expect(largeRadiusResponse.body.data.length).toBeGreaterThanOrEqual(
        smallRadiusResponse.body.data.length
      );
    });

    it('Should use default radius of 10km when not specified', async () => {
      const response = await request(app.getHttpServer())
        .get('/spas/nearby')
        .query({
          lat: 10.7769,
          lng: 106.7009,
          // No radius parameter
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      // All results should be within 10km
      response.body.data.forEach((spa: any) => {
        expect(parseFloat(spa.distance_km)).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('Validation and Edge Cases', () => {
    it('Should validate latitude range', async () => {
      await request(app.getHttpServer())
        .get('/spas/nearby')
        .query({
          lat: 100, // Invalid: > 90
          lng: 106.7009,
          radius: 10,
        })
        .expect(400);
    });

    it('Should validate longitude range', async () => {
      await request(app.getHttpServer())
        .get('/spas/nearby')
        .query({
          lat: 10.7769,
          lng: 200, // Invalid: > 180
          radius: 10,
        })
        .expect(400);
    });

    it('Should validate radius range', async () => {
      // Too small
      await request(app.getHttpServer())
        .get('/spas/nearby')
        .query({
          lat: 10.7769,
          lng: 106.7009,
          radius: 0.05, // Invalid: < 0.1
        })
        .expect(400);

      // Too large
      await request(app.getHttpServer())
        .get('/spas/nearby')
        .query({
          lat: 10.7769,
          lng: 106.7009,
          radius: 150, // Invalid: > 100
        })
        .expect(400);
    });

    it('Should only return approved spas', async () => {
      // Create unapproved spa
      const unapprovedResponse = await request(app.getHttpServer())
        .post('/spas')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Unapproved Spa',
          address: 'Same location as District 1',
          phone: '0123456789',
          latitude: 10.7769,
          longitude: 106.7009,
          openingTime: '08:00',
          closingTime: '22:00',
        })
        .expect(201);

      // Search nearby (unapproved spa should NOT appear)
      const response = await request(app.getHttpServer())
        .get('/spas/nearby')
        .query({
          lat: 10.7769,
          lng: 106.7009,
          radius: 1,
        })
        .expect(200);

      const spaNames = response.body.data.map((s: any) => s.name);
      expect(spaNames).not.toContain('Unapproved Spa');
    });

    it('Should exclude spas without coordinates', async () => {
      // This is handled by the query: spa.latitude IS NOT NULL
      const response = await request(app.getHttpServer())
        .get('/spas/nearby')
        .query({
          lat: 10.7769,
          lng: 106.7009,
          radius: 50,
        })
        .expect(200);

      // All results should have coordinates
      response.body.data.forEach((spa: any) => {
        expect(spa.latitude).toBeDefined();
        expect(spa.longitude).toBeDefined();
        expect(spa.latitude).not.toBeNull();
        expect(spa.longitude).not.toBeNull();
      });
    });
  });

  describe('Distance Accuracy', () => {
    it('Should calculate accurate distances using Haversine formula', async () => {
      const response = await request(app.getHttpServer())
        .get('/spas/nearby')
        .query({
          lat: 10.7769,
          lng: 106.7009,
          radius: 10,
        })
        .expect(200);

      // Find specific spa and verify distance
      const district3Spa = response.body.data.find((s: any) => s.name === 'Spa District 3');
      if (district3Spa) {
        const distance = parseFloat(district3Spa.distance_km);
        // District 3 should be about 1-2 km from District 1
        expect(distance).toBeGreaterThan(0.5);
        expect(distance).toBeLessThan(3);
      }

      const binhThanhSpa = response.body.data.find((s: any) => s.name === 'Spa Binh Thanh');
      if (binhThanhSpa) {
        const distance = parseFloat(binhThanhSpa.distance_km);
        // Binh Thanh should be about 4-6 km from District 1
        expect(distance).toBeGreaterThan(3);
        expect(distance).toBeLessThan(7);
      }
    });

    it('Should format distance to 2 decimal places', async () => {
      const response = await request(app.getHttpServer())
        .get('/spas/nearby')
        .query({
          lat: 10.7769,
          lng: 106.7009,
          radius: 10,
        })
        .expect(200);

      response.body.data.forEach((spa: any) => {
        // Distance should be string with max 2 decimal places
        const decimalPart = spa.distance_km.split('.')[1];
        if (decimalPart) {
          expect(decimalPart.length).toBeLessThanOrEqual(2);
        }
      });
    });
  });

  describe('Performance', () => {
    it('Should respond within reasonable time for large radius', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/spas/nearby')
        .query({
          lat: 10.7769,
          lng: 106.7009,
          radius: 100, // Max radius
        })
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      // Should respond within 2 seconds
      expect(responseTime).toBeLessThan(2000);
    });
  });
});

