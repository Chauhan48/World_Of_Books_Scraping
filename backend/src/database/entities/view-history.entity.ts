import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('view_history')
@Index(['session_id'])
@Index(['user_id'])
@Index(['created_at'])
export class ViewHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  session_id: string;

  @Column({ type: 'varchar', length: 1000 })
  path: string;

  @Column({ type: 'jsonb', nullable: true })
  path_json: Record<string, any>;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  referrer: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  user_agent: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
