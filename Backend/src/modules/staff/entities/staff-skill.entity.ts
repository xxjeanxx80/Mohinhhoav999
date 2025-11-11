import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Staff } from './staff.entity';

@Entity('staff_skills')
export class StaffSkill {
  @PrimaryGeneratedColumn({ name: 'skill_id' })
  id: number;

  @ManyToOne(() => Staff, (staff) => staff.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Column({ type: 'varchar', length: 255 })
  name: string;
}
