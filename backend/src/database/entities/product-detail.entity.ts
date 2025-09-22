import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_detail')
export class ProductDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', unique: true })
  product_id: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  long_description: string;

  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  publisher: string;

  @Column({ type: 'date', nullable: true })
  publication_date: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  isbn: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  isbn13: string;

  @Column({ type: 'integer', nullable: true })
  pages: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  language: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  format: string;

  @Column({ type: 'text', array: true, nullable: true })
  genres: string[];

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  additional_images: string[];

  @Column({ type: 'jsonb', nullable: true })
  related_products: Record<string, any>[];

  @OneToOne(() => Product, product => product.detail, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
