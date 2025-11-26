import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Role } from '../../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { CreateSpaDto } from './dto/create-spa.dto';
import { UpdateSpaDto } from './dto/update-spa.dto';
import { ApproveSpaDto } from './dto/approve-spa.dto';
import { NearbySpaDto } from './dto/nearby-spas.dto';
import { Spa } from './entities/spa.entity';
import { SpaService } from '../services/entities/service.entity';
import { Staff } from '../staff/entities/staff.entity';
import { GeocodingService } from './services/geocoding.service';

@Injectable()
export class SpasService {
  private readonly logger = new Logger(SpasService.name);

  constructor(
    @InjectRepository(Spa) private readonly spaRepository: Repository<Spa>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(SpaService) private readonly spaServiceRepository: Repository<SpaService>,
    @InjectRepository(Staff) private readonly staffRepository: Repository<Staff>,
    private readonly geocodingService: GeocodingService,
  ) {}

  async create(ownerId: number, dto: CreateSpaDto) {
    const owner = await this.userRepository.findOne({ where: { id: ownerId } });
    if (!owner || owner.role !== Role.OWNER) {
      throw new NotFoundException('Owner not found.');
    }

    // Don't allow manual latitude/longitude in DTO - always geocode from address
    const { latitude: _lat, longitude: _lng, ...spaData } = dto as any;

    // Create spa entity manually to avoid TypeORM type inference issues
    const spa = new Spa();
    Object.assign(spa, { ...spaData, owner });

    // Always geocode from address if address is provided (ignore any lat/lng in request)
    if (dto.address && dto.address.trim().length > 0) {
      const geocodeResult = await this.geocodingService.geocodeAddress(dto.address);
      if (geocodeResult) {
        spa.latitude = geocodeResult.latitude;
        spa.longitude = geocodeResult.longitude;
        this.logger.log(`Auto-geocoded address "${dto.address}" -> (${spa.latitude}, ${spa.longitude})`);
      } else {
        this.logger.warn(`Failed to geocode address: "${dto.address}"`);
        // Clear any existing coordinates if geocoding fails
        spa.latitude = null;
        spa.longitude = null;
      }
    } else {
      // No address provided - clear coordinates
      spa.latitude = null;
      spa.longitude = null;
    }

    await this.spaRepository.save(spa);

    return new ApiResponseDto({
      success: true,
      message: 'Spa created and pending approval.',
      data: spa,
    });
  }

  async findAll() {
    const spas = await this.spaRepository.find();
    return new ApiResponseDto({ success: true, message: 'Spas retrieved.', data: spas });
  }

  async findFeatured() {
    const spas = await this.spaRepository.find({ 
      where: { isApproved: true },
      take: 8,
      order: { createdAt: 'DESC' }
    });
    return new ApiResponseDto({ success: true, message: 'Featured spas retrieved.', data: spas });
  }

  async findOnePublic(id: number) {
    const spa = await this.spaRepository.findOne({ 
      where: { id, isApproved: true },
      relations: ['services', 'feedbacks', 'feedbacks.customer']
    });
    if (!spa) {
      throw new NotFoundException('Spa not found or not approved.');
    }

    return new ApiResponseDto({ success: true, message: 'Spa retrieved.', data: spa });
  }

  async findByOwner(ownerId: number) {
    this.logger.debug(`Finding spas for owner: ${ownerId}`);
    const spas = await this.spaRepository.find({ 
      where: { owner: { id: ownerId } },
      relations: ['owner']
    });
    this.logger.debug(`Found ${spas.length} spa(s) for owner ${ownerId}`);
    return new ApiResponseDto({ success: true, message: 'Spas retrieved.', data: spas });
  }

  async findOne(id: number) {
    const spa = await this.spaRepository.findOne({ where: { id } });
    if (!spa) {
      throw new NotFoundException('Spa not found.');
    }

    return new ApiResponseDto({ success: true, message: 'Spa retrieved.', data: spa });
  }

  async update(id: number, dto: UpdateSpaDto) {
    const spa = await this.spaRepository.findOne({ where: { id } });
    if (!spa) {
      throw new NotFoundException('Spa not found.');
    }

    // Store old address to check if it changed
    const oldAddress = spa.address;
    
    // Don't allow manual latitude/longitude in DTO - always geocode from address
    const { latitude, longitude, ...spaUpdateData } = dto as any;
    
    // Update all fields except coordinates (will be set from geocoding)
    Object.assign(spa, spaUpdateData);

    // Always geocode from address if address is provided or changed
    // This ensures coordinates always match the address text
    if (dto.address && dto.address.trim().length > 0) {
      const addressChanged = dto.address !== oldAddress;
      
      // Always geocode if address is provided (even if it didn't change, to ensure accuracy)
      // or if address changed
      if (addressChanged || !spa.latitude || !spa.longitude) {
        const geocodeResult = await this.geocodingService.geocodeAddress(dto.address);
        if (geocodeResult) {
          spa.latitude = geocodeResult.latitude;
          spa.longitude = geocodeResult.longitude;
          this.logger.log(`Auto-geocoded address "${dto.address}" -> (${spa.latitude}, ${spa.longitude})`);
        } else {
          this.logger.warn(`Failed to geocode address: "${dto.address}"`);
          // Clear coordinates if geocoding fails
          spa.latitude = null;
          spa.longitude = null;
        }
      }
    } else if (dto.address === null || dto.address === undefined || dto.address.trim().length === 0) {
      // Address was removed - clear coordinates
      spa.latitude = null;
      spa.longitude = null;
    }

    await this.spaRepository.save(spa);

    return new ApiResponseDto({ success: true, message: 'Spa updated.', data: spa });
  }

  async approve(id: number, dto: ApproveSpaDto) {
    const spa = await this.spaRepository.findOne({ where: { id } });
    if (!spa) {
      throw new NotFoundException('Spa not found.');
    }

    spa.isApproved = dto.isApproved;
    await this.spaRepository.save(spa);

    return new ApiResponseDto({ success: true, message: 'Spa approval updated.', data: spa });
  }

  async remove(id: number) {
    const spa = await this.spaRepository.findOne({ where: { id } });
    if (!spa) {
      throw new NotFoundException('Spa not found.');
    }

    await this.spaRepository.delete(id);

    return new ApiResponseDto({ success: true, message: 'Spa removed.' });
  }

  /**
   * Find nearby spas using Haversine formula with Raw Query
   * Formula: distance = 6371 * acos(cos(lat1)*cos(lat2)*cos(lng2-lng1) + sin(lat1)*sin(lat2))
   * Using Raw Query for better performance and reliability
   */
  async findNearby(dto: NearbySpaDto) {
    const { lat, lng, radius = 10 } = dto;

    // Validate input
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return new ApiResponseDto({
        success: false,
        message: 'Invalid latitude or longitude.',
        data: [],
      });
    }

    this.logger.debug(`Searching for spas near (${lat}, ${lng}) within ${radius}km`);

    try {
      // Raw SQL query with Haversine formula - more reliable than QueryBuilder
      const spas = await this.spaRepository.query(
        `
        SELECT 
          spa_id as id,
          name,
          address,
          latitude,
          longitude,
          phone,
          email,
          opening_time as "openingTime",
          closing_time as "closingTime",
          description,
          (
            6371 * acos(
              LEAST(1.0, GREATEST(-1.0,
                cos(radians($1::numeric)) * cos(radians(latitude::numeric)) *
                cos(radians(longitude::numeric) - radians($2::numeric)) +
                sin(radians($1::numeric)) * sin(radians(latitude::numeric))
              ))
            )
          ) as distance_km
        FROM spas
        WHERE is_approved = true
          AND latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND (
            6371 * acos(
              LEAST(1.0, GREATEST(-1.0,
                cos(radians($1::numeric)) * cos(radians(latitude::numeric)) *
                cos(radians(longitude::numeric) - radians($2::numeric)) +
                sin(radians($1::numeric)) * sin(radians(latitude::numeric))
              ))
            )
          ) <= $3
        ORDER BY distance_km ASC
        LIMIT 100
      `,
        [lat, lng, radius],
      );

      this.logger.log(`Found ${spas.length} spa(s) within ${radius}km of (${lat}, ${lng})`);
      
      // Debug: Log coordinates of found spas
      if (spas.length > 0) {
        this.logger.debug('Spa coordinates found:');
        spas.forEach((spa, index) => {
          this.logger.debug(`${index + 1}. ${spa.name}: lat=${spa.latitude}, lng=${spa.longitude}, distance=${spa.distance_km}km`);
        });
      }

      return new ApiResponseDto({
        success: true,
        message: `Found ${spas.length} spa(s) within ${radius}km.`,
        data: spas.map((spa) => ({
          id: parseInt(spa.id),
          name: spa.name,
          address: spa.address,
          latitude: spa.latitude ? parseFloat(spa.latitude) : null,
          longitude: spa.longitude ? parseFloat(spa.longitude) : null,
          phone: spa.phone,
          email: spa.email,
          openingTime: spa.openingTime,
          closingTime: spa.closingTime,
          description: spa.description,
          distance: parseFloat(spa.distance_km || '0').toFixed(2),
          distanceKm: parseFloat(spa.distance_km || '0'),
        })),
      });
    } catch (error) {
      this.logger.error('Error finding nearby spas', error instanceof Error ? error.stack : String(error));
      // Return error response with details
      return new ApiResponseDto({
        success: false,
        message: error instanceof Error ? error.message : 'Error finding nearby spas.',
        data: [],
      });
    }
  }

  async getSpaServices(spaId: number) {
    const spa = await this.spaRepository.findOne({ where: { id: spaId } });
    if (!spa) {
      throw new NotFoundException('Spa not found.');
    }

    const services = await this.spaServiceRepository.find({
      where: { spa: { id: spaId } },
      relations: ['spa'],
      order: { createdAt: 'DESC' },
    });

    return new ApiResponseDto({
      success: true,
      message: 'Spa services retrieved.',
      data: { services },
    });
  }

  async getSpaStaff(spaId: number) {
    const spa = await this.spaRepository.findOne({ where: { id: spaId } });
    if (!spa) {
      throw new NotFoundException('Spa not found.');
    }

    const staff = await this.staffRepository.find({
      where: { spa: { id: spaId }, isActive: true },
      relations: ['spa'],
      order: { createdAt: 'DESC' },
    });

    return new ApiResponseDto({
      success: true,
      message: 'Spa staff retrieved.',
      data: { staff },
    });
  }

  async updateAvatar(id: number, file: Express.Multer.File, mediaService: any) {
    if (!file) {
      throw new NotFoundException('No file provided');
    }

    const spa = await this.spaRepository.findOne({ where: { id } });
    if (!spa) {
      throw new NotFoundException('Spa not found.');
    }

    // Upload to media table
    const mediaResult = await mediaService.uploadSpaAvatar(file, id);

    return new ApiResponseDto({
      success: true,
      message: 'Spa avatar updated successfully.',
      data: { spa, media: mediaResult.data },
    });
  }

  async updateBackground(id: number, file: Express.Multer.File, mediaService: any) {
    if (!file) {
      throw new NotFoundException('No file provided');
    }

    const spa = await this.spaRepository.findOne({ where: { id } });
    if (!spa) {
      throw new NotFoundException('Spa not found.');
    }

    // Upload to media table
    const mediaResult = await mediaService.uploadSpaBackground(file, id);

    return new ApiResponseDto({
      success: true,
      message: 'Spa background updated successfully.',
      data: { spa, media: mediaResult.data },
    });
  }
}
