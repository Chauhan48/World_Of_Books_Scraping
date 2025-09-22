import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '@/database/entities/product.entity';
import { ProductDetail } from '@/database/entities/product-detail.entity';
import { Review } from '@/database/entities/review.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductDetail)
    private readonly productDetailRepository: Repository<ProductDetail>,

    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  // Create or update a basic product record
  async createOrUpdate(data: Partial<Product>): Promise<Product> {
    const existing = await this.productRepository.findOne({
      where: { source_id: data.source_id },
    });

    if (existing) {
      await this.productRepository.update(existing.id, {
        ...data,
        updated_at: new Date(),
      });
      return this.productRepository.findOne({ where: { id: existing.id } });
    }

    const product = this.productRepository.create(data);
    return this.productRepository.save(product);
  }

  // Create or update detailed product info
  async createOrUpdateDetail(productId: number, detailData: Partial<ProductDetail>): Promise<ProductDetail> {
    const existingDetail = await this.productDetailRepository.findOne({
      where: { product_id: productId },
    });

    if (existingDetail) {
      await this.productDetailRepository.update(existingDetail.id, {
        ...detailData,
        updated_at: new Date(),
      });
      return this.productDetailRepository.findOne({ where: { id: existingDetail.id } });
    }

    const detail = this.productDetailRepository.create({
      ...detailData,
      product_id: productId,
    });
    return this.productDetailRepository.save(detail);
  }

  // Create multiple reviews linked to a product
  async createReviews(productId: number, reviews: Partial<Review>[]): Promise<Review[]> {
    const reviewEntities = reviews.map(review => this.reviewRepository.create({
      ...review,
      product_id: productId,
      created_at: new Date(),
    }));
    return this.reviewRepository.save(reviewEntities);
  }
}
