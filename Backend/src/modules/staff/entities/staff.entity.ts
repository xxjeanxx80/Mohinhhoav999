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
import { StaffShift } from './staff-shift.entity';
import { StaffSkill } from './staff-skill.entity';
import { StaffTimeOff } from './staff-time-off.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn({ name: 'staff_id' })
  id: number;

  @ManyToOne(() => Spa, (spa) => spa.staffMembers, { eager: true, nullable: false })
  @JoinColumn({ name: 'spa_id' })
  spa: Spa;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => StaffSkill, (skill) => skill.staff, { cascade: true })
  skills?: StaffSkill[];

  @OneToMany(() => StaffShift, (shift) => shift.staff, { cascade: true })
  shifts?: StaffShift[];

  @OneToMany(() => StaffTimeOff, (timeOff) => timeOff.staff, { cascade: true })
  timeOff?: StaffTimeOff[];

  @OneToMany(() => Booking, (booking) => booking.staff)
  bookings?: Booking[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
