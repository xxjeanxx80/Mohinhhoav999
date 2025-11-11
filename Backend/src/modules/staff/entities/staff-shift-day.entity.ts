import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StaffShift } from './staff-shift.entity';

@Entity('staff_shift_days')
export class StaffShiftDay {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ManyToOne(() => StaffShift, (shift) => shift.shiftDays, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shift_id' })
  shift: StaffShift;

  @Column({ type: 'int' })
  weekday: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

