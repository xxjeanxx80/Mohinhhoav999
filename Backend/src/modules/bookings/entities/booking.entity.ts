import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Spa } from '../../spas/entities/spa.entity';
import { SpaService } from '../../services/entities/service.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { User } from '../../users/entities/user.entity';
import { Feedback } from '../../feedbacks/entities/feedback.entity';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn({ name: 'booking_id' })
  id: number;

  @ManyToOne(() => Spa, { eager: true, nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'spa_id' })
  spa: Spa;

  @ManyToOne(() => SpaService, { eager: true, nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'service_id' })
  service: SpaService;

  @ManyToOne(() => User, { eager: true, nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  customer: User;

  @ManyToOne(() => Staff, (staff) => staff.bookings, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'staff_id' })
  staff?: Staff | null;

  @Column({ type: 'timestamp with time zone', name: 'scheduled_at' })
  scheduledAt: Date;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ name: 'coupon_code', type: 'varchar', length: 255, nullable: true })
  couponCode: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_price' })
  totalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'final_price' })
  finalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'commission_amount' })
  commissionAmount: number;

  @OneToMany(() => Feedback, (feedback) => feedback.booking, { cascade: true })
  feedbacks?: Feedback[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
