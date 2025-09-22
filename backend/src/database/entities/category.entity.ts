import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Navigation } from './navigation.entity';
import { Product } from './product.entity';

@Entity('category')
@Index(['slug'], { unique: true })
@Index(['navigation_id'])
@Index(['parent_id'])
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  source_url: string;

  @Column({ type: 'integer', nullable: true })
  navigation_id: number;

  @Column({ type: 'integer', nullable: true })
  parent_id: number;

  @Column({ type: 'integer', default: 0 })
  product_count: number;

  @Column({ type: 'integer', default: 0 })
  display_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_scraped_at: Date;

  @ManyToOne(() => Navigation, navigation => navigation.categories)
  @JoinColumn({ name: 'navigation_id' })
  navigation: Navigation;

  @ManyToOne(() => Category, category => category.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, category => category.parent)
  children: Category[];

  @OneToMany(() => Product, product => product.category)
  products: Product[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
