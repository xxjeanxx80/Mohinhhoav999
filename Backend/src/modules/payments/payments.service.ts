import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Booking } from '../bookings/entities/booking.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
  ) {}

  async createPayment(dto: CreatePaymentDto) {
    const booking = await this.bookingRepository.findOne({ where: { id: dto.bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found for payment.');
    }

    const commissionAmount = this.calculateCommission(dto.amount, dto.commissionPercent);

    const payment = this.paymentRepository.create({
      bookingId: dto.bookingId,
      amount: dto.amount,
      method: dto.method,
      status: PaymentStatus.COMPLETED,
      commissionPercent: dto.commissionPercent,
      commissionAmount,
      transactionReference: dto.transactionReference ?? null,
    });

    const saved = await this.paymentRepository.save(payment);

    return new ApiResponseDto({ success: true, message: 'Payment processed.', data: saved });
  }

  async refundPayment(dto: RefundPaymentDto) {
    const payment = await this.paymentRepository.findOne({ where: { id: dto.paymentId } });
    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    payment.status = PaymentStatus.REFUNDED;
    const saved = await this.paymentRepository.save(payment);

    return new ApiResponseDto({ success: true, message: 'Payment refunded.', data: saved });
  }

  async findOne(id: number) {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    return new ApiResponseDto({ success: true, message: 'Payment retrieved.', data: payment });
  }

  async findAll() {
    const payments = await this.paymentRepository.find({ order: { createdAt: 'DESC' } });
    return new ApiResponseDto({ success: true, message: 'All payments retrieved.', data: payments });
  }

  private calculateCommission(amount: number, percent: number) {
    const commission = amount * (percent / 100);
    return Number(commission.toFixed(2));
  }
}
