import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Staff } from './staff.entity';

@Entity('staff_time_off')
export class StaffTimeOff {
  @PrimaryGeneratedColumn({ name: 'time_off_id' })
  id: number;

  @ManyToOne(() => Staff, (staff) => staff.timeOff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Column({ type: 'timestamp with time zone', name: 'start_at' })
  startAt: Date;

  @Column({ type: 'timestamp with time zone', name: 'end_at' })
  endAt: Date;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
