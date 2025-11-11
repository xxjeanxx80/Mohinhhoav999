import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Staff } from './staff.entity';
import { StaffShiftDay } from './staff-shift-day.entity';

@Entity('staff_shifts')
export class StaffShift {
  @PrimaryGeneratedColumn({ name: 'shift_id' })
  id: number;

  @ManyToOne(() => Staff, (staff) => staff.shifts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Column({ type: 'time', name: 'start_time' })
  startTime: string; // Format: "HH:MM:SS"

  @Column({ type: 'time', name: 'end_time' })
  endTime: string; // Format: "HH:MM:SS"

  @OneToMany(() => StaffShiftDay, (shiftDay) => shiftDay.shift, { cascade: ['insert', 'update', 'remove'], eager: true })
  shiftDays?: StaffShiftDay[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
