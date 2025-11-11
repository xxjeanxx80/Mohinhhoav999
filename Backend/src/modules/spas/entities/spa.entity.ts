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
import { User } from '../../users/entities/user.entity';
import { SpaService } from '../../services/entities/service.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { Feedback } from '../../feedbacks/entities/feedback.entity';

@Entity('spas')
export class Spa {
  @PrimaryGeneratedColumn({ name: 'spa_id' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ name: 'opening_time', type: 'time', nullable: true })
  openingTime: string | null;

  @Column({ name: 'closing_time', type: 'time', nullable: true })
  closingTime: string | null;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'is_approved', default: false })
  isApproved: boolean;

  @OneToMany(() => SpaService, (service) => service.spa)
  services?: SpaService[];

  @OneToMany(() => Staff, (staff) => staff.spa)
  staffMembers?: Staff[];

  @OneToMany(() => Feedback, (feedback) => feedback.spa)
  feedbacks?: Feedback[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
