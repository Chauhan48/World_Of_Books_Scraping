import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { Product } from '@/database/entities/product.entity';
import { ProductDetail } from '@/database/entities/product-detail.entity';
import { Review } from '@/database/entities/review.entity';
import { ScrapingModule } from '../scraping/scraping.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductDetail, Review]),
    ScrapingModule,
  ],
  controllers: [ProductsController],
})
export class ProductsModule {}
