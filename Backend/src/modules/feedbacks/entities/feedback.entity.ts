import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { User } from '../../users/entities/user.entity';
import { Spa } from '../../spas/entities/spa.entity';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn({ name: 'feedback_id' })
  id: number;

  @ManyToOne(() => Booking, (booking) => booking.feedbacks, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => Spa, (spa) => spa.feedbacks, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spa_id' })
  spa: Spa;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  customer: User;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
