import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('loyalty_history')
export class LoyaltyHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.loyaltyHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
