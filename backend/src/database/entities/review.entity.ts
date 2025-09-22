import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Product } from './product.entity';

@Entity('review')
@Index(['product_id'])
@Index(['rating'])
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  product_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author_id: string;

  @Column({ type: 'integer', nullable: true })
  rating: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'boolean', default: true })
  is_verified: boolean;

  @Column({ type: 'integer', default: 0 })
  helpful_count: number;

  @Column({ type: 'date', nullable: true })
  review_date: Date;

  @ManyToOne(() => Product, product => product.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
