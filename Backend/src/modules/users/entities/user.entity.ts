import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../../common/enums/role.enum';
import { Loyalty } from './loyalty.entity';
import { LoyaltyHistory } from './loyalty-history.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role: Role;

  @Column({ name: 'oauth_provider', type: 'varchar', length: 255, nullable: true })
  oauthProvider: string | null;

  @Column({ name: 'oauth_provider_id', type: 'varchar', length: 255, nullable: true })
  oauthProviderId: string | null;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 255, nullable: true })
  refreshTokenHash: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  // Bank account information for payouts
  @Column({ name: 'bank_name', type: 'varchar', length: 255, nullable: true })
  bankName: string | null;

  @Column({ name: 'bank_account_number', type: 'varchar', length: 50, nullable: true })
  bankAccountNumber: string | null;

  @Column({ name: 'bank_account_holder', type: 'varchar', length: 255, nullable: true })
  bankAccountHolder: string | null;

  @OneToOne(() => Loyalty, (loyalty) => loyalty.user)
  loyalty?: Loyalty;

  @OneToMany(() => LoyaltyHistory, (history) => history.user)
  loyaltyHistory?: LoyaltyHistory[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
