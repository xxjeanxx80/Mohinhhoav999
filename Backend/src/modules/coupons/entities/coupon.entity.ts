import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Spa } from '../../spas/entities/spa.entity';

@Entity({ name: 'coupons' })
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @ManyToOne(() => Spa, { eager: true, nullable: true })
  @JoinColumn({ name: 'spa_id' })
  spa?: Spa | null;

  @Column({ name: 'discount_percent', type: 'numeric', precision: 5, scale: 2 })
  discountPercent: number;

  @Column({ name: 'max_redemptions', type: 'int', nullable: true })
  maxRedemptions?: number | null;

  @Column({ name: 'current_redemptions', type: 'int', default: 0 })
  currentRedemptions: number;

  @Column({ name: 'isActive', default: true })
  isActive: boolean;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
