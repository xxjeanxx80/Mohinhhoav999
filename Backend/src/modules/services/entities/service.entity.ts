import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Spa } from '../../spas/entities/spa.entity';

export enum ServiceType {
  AT_SPA = 'AT_SPA',
  AT_HOME = 'AT_HOME',
}

@Entity('services')
export class SpaService {
  @PrimaryGeneratedColumn({ name: 'service_id' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', name: 'duration_minutes' })
  durationMinutes: number;

  @Column({ type: 'enum', enum: ServiceType, default: ServiceType.AT_SPA })
  serviceType: ServiceType;

  @ManyToOne(() => Spa, (spa) => spa.services, { eager: true, nullable: false })
  @JoinColumn({ name: 'spa_id' })
  spa: Spa;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
