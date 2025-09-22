import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScraperService } from './scraper.service';
import { ScrapingQueueService } from './scraping-queue.service';
import { ScrapingProcessor } from './scraping.processor';
import { ScrapingController } from './scraping.controller';
import { ScrapeJob } from '@/database/entities/scrape-job.entity';
import { Navigation } from '@/database/entities/navigation.entity';
import { Category } from '@/database/entities/category.entity';
import { Product } from '@/database/entities/product.entity';
import { ProductDetail } from '@/database/entities/product-detail.entity';
import { Review } from '@/database/entities/review.entity';

// Simple service implementations
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SimpleNavigationService {
  constructor(@InjectRepository(Navigation) private repo: Repository<Navigation>) { }

  async findBySourceUrl(url: string) {
    return this.repo.findOne({ where: { source_url: url } });
  }

  async createOrUpdate(data: any) {
    const existing = await this.repo.findOne({ where: { slug: data.slug } });
    if (existing) {
      await this.repo.update(existing.id, data);
      return this.repo.findOne({ where: { id: existing.id } });
    }
    return this.repo.save(this.repo.create(data));
  }

  async findAll() {
    return this.repo.find({ where: { is_active: true }, order: { display_order: 'ASC' } });
  }
}

@Injectable()
export class SimpleCategoriesService {
  constructor(@InjectRepository(Category) public repo: Repository<Category>) { }

  async findBySourceUrl(url: string) {
    return this.repo.findOne({ where: { source_url: url } });
  }

  async createOrUpdate(data: any) {
    const existing = await this.repo.findOne({ where: { slug: data.slug } });
    if (existing) {
      await this.repo.update(existing.id, data);
      return this.repo.findOne({ where: { id: existing.id } });
    }
    return this.repo.save(this.repo.create(data));
  }

  async updateProductCount(id: number) {
    const count = await this.repo
      .createQueryBuilder('category')
      .leftJoin('category.products', 'product')
      .where('category.id = :id', { id })
      .getCount();
    await this.repo.update(id, { product_count: count, updated_at: new Date() });
  }

  async findByNavigation(navigationId: number) {
    return this.repo.find({ where: { navigation_id: navigationId, is_active: true } });
  }
}

@Injectable()
export class SimpleProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(ProductDetail) private detailRepo: Repository<ProductDetail>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>
  ) { }

  async createOrUpdate(data: any) {
    const existing = await this.productRepo.findOne({ where: { source_id: data.source_id } });
    if (existing) {
      await this.productRepo.update(existing.id, data);
      return this.productRepo.findOne({ where: { id: existing.id } });
    }
    return this.productRepo.save(this.productRepo.create(data));
  }

  async createOrUpdateDetail(productId: number, data: any) {
    const existing = await this.detailRepo.findOne({ where: { product_id: productId } });
    if (existing) {
      await this.detailRepo.update(existing.id, data);
      return this.detailRepo.findOne({ where: { id: existing.id } });
    }
    data.product_id = productId;
    return this.detailRepo.save(this.detailRepo.create(data));
  }

  async createReviews(productId: number, reviews: any[]) {
    const reviewEntities = reviews.map(review =>
      this.reviewRepo.create({ ...review, product_id: productId, created_at: new Date() }),
    );
    return this.reviewRepo.save([].concat(...reviewEntities));
  }

  async findByCategory(categoryId: number, page = 1, limit = 20) {
    const [items, total] = await this.productRepo.findAndCount({
      where: { category_id: categoryId, is_active: true },
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' }
    });
    return { items, total, page, limit };
  }

  async findById(id: number) {
    return this.productRepo.findOne({
      where: { id },
      relations: ['detail', 'reviews', 'category']
    });
  }
}

@Module({
  imports: [
    TypeOrmModule.forFeature([ScrapeJob, Navigation, Category, Product, ProductDetail, Review]),
    BullModule.registerQueue({ name: 'scraping' }),
  ],
  providers: [
    ScraperService,
    ScrapingQueueService,
    ScrapingProcessor,
    SimpleNavigationService,
    SimpleCategoriesService,
    SimpleProductsService,
    // Provide aliases for the processor
    { provide: 'NavigationService', useClass: SimpleNavigationService },
    { provide: 'CategoriesService', useClass: SimpleCategoriesService },
    { provide: 'ProductsService', useClass: SimpleProductsService },
  ],
  controllers: [ScrapingController],
  exports: [SimpleNavigationService, SimpleCategoriesService, SimpleProductsService, ScrapingQueueService],
})
export class ScrapingModule { }
