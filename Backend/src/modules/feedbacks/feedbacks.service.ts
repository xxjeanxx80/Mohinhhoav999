import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Feedback } from './entities/feedback.entity';

@Injectable()
export class FeedbacksService {
  private readonly logger = new Logger(FeedbacksService.name);

  constructor(
    @InjectRepository(Feedback) private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(customerId: number, dto: CreateFeedbackDto) {
    this.logger.debug(`Creating feedback for customer ${customerId}, booking ${dto.bookingId}`);
    
    const booking = await this.bookingRepository.findOne({ 
      where: { id: dto.bookingId },
      relations: ['spa', 'customer']
    });
    
    if (!booking) {
      this.logger.warn(`Booking not found for id: ${dto.bookingId}`);
      throw new NotFoundException('Booking not found.');
    }

    // Verify that the booking belongs to the customer
    if (booking.customer.id !== customerId) {
      this.logger.warn(`Booking access denied: booking customer ${booking.customer.id} != requested customer ${customerId}`);
      throw new NotFoundException('Booking not found or access denied.');
    }

    const customer = await this.userRepository.findOne({ where: { id: customerId } });
    if (!customer) {
      this.logger.warn(`Customer not found for id: ${customerId}`);
      throw new NotFoundException('Customer not found.');
    }

    const feedback = this.feedbackRepository.create({
      booking,
      spa: booking.spa,
      customer,
      rating: dto.rating,
      comment: dto.comment ?? null,
    });

    const saved = await this.feedbackRepository.save(feedback);
    this.logger.log(`Feedback saved successfully: id ${saved.id}, booking ${booking.id}, spa ${booking.spa?.id}`);

    return new ApiResponseDto({ success: true, message: 'Feedback recorded.', data: saved });
  }

  async findAll() {
    const feedback = await this.feedbackRepository.find();
    return new ApiResponseDto({ success: true, message: 'Feedback retrieved.', data: feedback });
  }

  async findRecent() {
    const feedback = await this.feedbackRepository.find({
      relations: ['customer'],
      order: { createdAt: 'DESC' },
      take: 8,
      where: { rating: 5 }
    });
    return new ApiResponseDto({ success: true, message: 'Recent feedback retrieved.', data: feedback });
  }

  async findForBooking(bookingId: number) {
    const feedback = await this.feedbackRepository.find({ 
      where: { booking: { id: bookingId } },
      relations: ['booking', 'customer', 'spa']
    });
    return new ApiResponseDto({ success: true, message: 'Feedback retrieved for booking.', data: feedback });
  }

  async findBySpa(spaId: number) {
    const feedback = await this.feedbackRepository.find({
      where: { spa: { id: spaId } },
      relations: ['customer', 'spa', 'booking'],
      order: { createdAt: 'DESC' },
    });
    return new ApiResponseDto({ success: true, message: 'Spa feedback retrieved.', data: feedback });
  }

  async findByOwner(ownerId: number) {
    const feedback = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.spa', 'spa')
      .leftJoinAndSelect('feedback.customer', 'customer')
      .leftJoinAndSelect('feedback.booking', 'booking')
      .leftJoinAndSelect('spa.owner', 'owner')
      .where('owner.id = :ownerId', { ownerId })
      .orderBy('feedback.createdAt', 'DESC')
      .getMany();
    
    return new ApiResponseDto({ success: true, message: 'Owner feedbacks retrieved.', data: feedback });
  }
}
