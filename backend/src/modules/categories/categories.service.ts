import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '@/database/entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // Create a new category or update an existing one by slug
  async createOrUpdate(data: Partial<Category>): Promise<Category> {
    const existing = await this.categoryRepository.findOne({
      where: { slug: data.slug },
    });

    if (existing) {
      await this.categoryRepository.update(existing.id, {
        ...data,
        updated_at: new Date(),
      });
      return this.categoryRepository.findOne({ where: { id: existing.id } });
    }

    const category = this.categoryRepository.create(data);
    return this.categoryRepository.save(category);
  }

  // Find a category by source URL
  async findBySourceUrl(sourceUrl: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { source_url: sourceUrl },
    });
  }

  // Update product count for a category by counting associated products
  async updateProductCount(categoryId: number): Promise<void> {
    // Assuming you have a productsRepository injected or can get the count in some other way
    // For this example, a raw count query is used. Adjust if needed.
    const productCount = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.products', 'product')
      .where('category.id = :id', { id: categoryId })
      .getCount();

    await this.categoryRepository.update(categoryId, {
      product_count: productCount,
      updated_at: new Date(),
    });
  }
}
