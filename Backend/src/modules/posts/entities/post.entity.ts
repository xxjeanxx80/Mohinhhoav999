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

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn({ name: 'post_id' })
  id: number;

  @ManyToOne(() => Spa, { eager: true, nullable: false })
  @JoinColumn({ name: 'spa_id' })
  spa: Spa;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

