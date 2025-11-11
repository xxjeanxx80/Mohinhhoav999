import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum MediaRelatedType {
  USER = 'USER',
  SPA = 'SPA',
  SERVICE = 'SERVICE',
  POST = 'POST',
  HOMEPAGE = 'HOMEPAGE',
}

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn({ name: 'media_id' })
  id: number;

  @Column({ name: 'related_type', type: 'varchar', length: 50 })
  relatedType: MediaRelatedType;

  @Column({ name: 'related_id', type: 'int' })
  relatedId: number;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tag: string | null; // 'avatar', 'background', 'gallery', etc.

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

