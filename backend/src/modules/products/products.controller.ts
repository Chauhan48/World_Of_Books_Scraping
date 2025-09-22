import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SimpleProductsService } from '../scraping/scraping.module';
import { ScrapingQueueService } from '../scraping/scraping-queue.service';
import { ScrapeJobType } from '@/database/entities/scrape-job.entity';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: SimpleProductsService,
    private readonly scrapingQueueService: ScrapingQueueService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product details' })
  async findById(@Param('id') id: string) {
    return this.productsService.findById(parseInt(id));
  }

  @Post(':id/scrape')
  @ApiOperation({ summary: 'Trigger detailed scraping for product' })
  @ApiResponse({ status: 201, description: 'Scraping job created' })
  async scrapeDetail(@Param('id') id: string) {
    const product = await this.productsService.findById(parseInt(id));
    
    if (!product || !product.source_url) {
      throw new Error('Product not found or missing source URL');
    }

    const job = await this.scrapingQueueService.addScrapeJob({
      targetUrl: product.source_url,
      targetType: ScrapeJobType.PRODUCT_DETAIL,
      options: { productId: id },
    });
    
    return { jobId: job.id, status: 'started' };
  }
}
