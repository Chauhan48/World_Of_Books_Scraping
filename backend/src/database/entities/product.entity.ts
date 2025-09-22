import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Category } from './category.entity';
import { ProductDetail } from './product-detail.entity';
import { Review } from './review.entity';

@Entity('product')
@Index(['source_id'], { unique: true })
@Index(['category_id'])
@Index(['last_scraped_at'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  source_id: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  image_url: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  source_url: string;

  @Column({ type: 'integer', nullable: true })
  category_id: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating_avg: number;

  @Column({ type: 'integer', default: 0 })
  review_count: number;

  @Column({ type: 'boolean', default: true })
  in_stock: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_scraped_at: Date;

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToOne(() => ProductDetail, detail => detail.product, { cascade: true })
  detail: ProductDetail;

  @OneToMany(() => Review, review => review.product, { cascade: true })
  reviews: Review[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
