import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { LoyaltyRank } from '../enums/loyalty-rank.enum';
import { User } from './user.entity';

@Entity('loyalty')
export class Loyalty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @OneToOne(() => User, (user) => user.loyalty, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'enum', enum: LoyaltyRank, default: LoyaltyRank.BRONZE })
  rank: LoyaltyRank;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
