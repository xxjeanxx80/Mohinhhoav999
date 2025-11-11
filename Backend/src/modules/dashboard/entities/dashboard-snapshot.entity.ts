import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('dashboard_snapshots')
export class DashboardSnapshot {
  @PrimaryGeneratedColumn({ name: 'snapshot_id' })
  id: number;

  @Column({ name: 'snapshot_date', type: 'date' })
  snapshotDate: Date;

  @Column({ name: 'bookings_count', type: 'int' })
  bookingsCount: number;

  @Column({ name: 'total_revenue', type: 'numeric', precision: 12, scale: 2 })
  totalRevenue: number;

  @Column({ name: 'new_customers', type: 'int' })
  newCustomers: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
