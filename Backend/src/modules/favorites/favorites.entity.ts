import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, Unique, JoinColumn } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Spa } from '../spas/entities/spa.entity';

@Entity('favorites')
@Unique(['customer', 'spa']) // Prevent duplicate favorites
export class Favorite {
  @PrimaryGeneratedColumn({ name: 'favorite_id' })
  id: number;

  @ManyToOne(() => User, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  customer: User;

  @Column({ name: 'user_id' })
  customerId: number;

  @ManyToOne(() => Spa, { eager: true, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spa_id' })
  spa: Spa;

  @Column({ name: 'spa_id' })
  spaId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
