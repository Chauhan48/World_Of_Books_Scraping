import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SimpleCategoriesService, SimpleProductsService } from '../scraping/scraping.module';
import { ScrapingQueueService } from '../scraping/scraping-queue.service';
import { ScrapeJobType } from '@/database/entities/scrape-job.entity';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: SimpleCategoriesService,
    private readonly productsService: SimpleProductsService,
    private readonly scrapingQueueService: ScrapingQueueService,
  ) {}

  @Get(':id/products')
  @ApiOperation({ summary: 'Get products in category' })
  @ApiResponse({ status: 200, description: 'List of products' })
  async getProducts(
    @Param('id') id: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.productsService.findByCategory(
      parseInt(id),
      pagination.page,
      pagination.limit,
    );
  }

  @Post(':id/scrape')
  @ApiOperation({ summary: 'Trigger product scraping for category' })
  @ApiResponse({ status: 201, description: 'Scraping job created' })
  async scrapeProducts(@Param('id') id: string) {
    const category = await this.categoriesService.repo.findOne({ 
      where: { id: parseInt(id) } 
    });
    
    if (!category || !category.source_url) {
      throw new Error('Category not found or missing source URL');
    }

    const job = await this.scrapingQueueService.addScrapeJob({
      targetUrl: category.source_url,
      targetType: ScrapeJobType.PRODUCT,
      options: { categoryId: id },
    });
    
    return { jobId: job.id, status: 'started' };
  }
}
