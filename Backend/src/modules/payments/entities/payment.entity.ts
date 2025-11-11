import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  CASH = 'CASH',
  PAYPAL = 'PAYPAL',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'booking_id' })
  bookingId: number;

  @ManyToOne(() => Booking, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'booking_id' })
  booking?: Booking | null;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'commission_percent', type: 'numeric', precision: 5, scale: 2, default: 0 })
  commissionPercent: number;

  @Column({ name: 'commission_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  commissionAmount: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ name: 'transaction_reference', type: 'varchar', length: 255, nullable: true })
  transactionReference?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
