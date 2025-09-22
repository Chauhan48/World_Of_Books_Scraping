import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { Category } from '@/database/entities/category.entity';
import { ScrapingModule } from '../scraping/scraping.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    ScrapingModule,
  ],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
