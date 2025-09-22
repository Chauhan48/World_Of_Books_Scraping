import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ScrapeJobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum ScrapeJobType {
  NAVIGATION = 'navigation',
  CATEGORY = 'category',
  PRODUCT = 'product',
  PRODUCT_DETAIL = 'product_detail'
}

@Entity('scrape_job')
@Index(['status'])
@Index(['target_type'])
@Index(['started_at'])
export class ScrapeJob {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 1000 })
  target_url: string;

  @Column({
    type: 'enum',
    enum: ScrapeJobType
  })
  target_type: ScrapeJobType;

  @Column({
    type: 'enum',
    enum: ScrapeJobStatus,
    default: ScrapeJobStatus.PENDING
  })
  status: ScrapeJobStatus;

  @Column({ type: 'jsonb', nullable: true })
  options: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  result: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'jsonb', nullable: true })
  error_log: Record<string, any>;

  @Column({ type: 'integer', default: 0 })
  retry_count: number;

  @Column({ type: 'integer', default: 3 })
  max_retries: number;

  @Column({ type: 'integer', nullable: true })
  items_processed: number;

  @Column({ type: 'integer', nullable: true })
  items_total: number;

  @Column({ type: 'timestamp', nullable: true })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  finished_at: Date;

  @Column({ type: 'interval', nullable: true })
  duration: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
