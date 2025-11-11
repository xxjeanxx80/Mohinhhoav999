import { Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'customers' })
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({ length: 100 })
  name: string;

  @Expose()
  @Column({ length: 100, unique: true })
  email: string;

  @Expose()
  @Column({ length: 20, nullable: true })
  phone?: string;
  
  @Expose()
  @Column({ length: 255 })
  address?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
