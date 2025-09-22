import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NavigationService } from './navigation.service';
import { SimpleNavigationService, SimpleCategoriesService } from '../scraping/scraping.module';
import { ScrapingQueueService } from '../scraping/scraping-queue.service';
import { ScrapeJobType } from '@/database/entities/scrape-job.entity';

@ApiTags('navigation')
@Controller('navigation')
export class NavigationController {
  constructor(
    private readonly navigationService: NavigationService,
    private readonly simpleNavigationService: SimpleNavigationService,
    private readonly simpleCategoriesService: SimpleCategoriesService,
    private readonly scrapingQueueService: ScrapingQueueService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all navigation items' })
  @ApiResponse({ status: 200, description: 'List of navigation items' })
  async findAll() {
    return this.simpleNavigationService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get navigation by slug' })
  @ApiResponse({ status: 200, description: 'Navigation item with categories' })
  async findBySlug(@Param('slug') slug: string) {
    return this.navigationService.findBySlug(slug);
  }

  @Get(':slug/categories')
  @ApiOperation({ summary: 'Get categories for navigation' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async getCategories(@Param('slug') slug: string) {
    const navigation = await this.navigationService.findBySlug(slug);
    if (!navigation) {
      return [];
    }
    return this.simpleCategoriesService.findByNavigation(navigation.id);
  }

  @Post(':slug/scrape')
  @ApiOperation({ summary: 'Trigger scraping for navigation categories' })
  @ApiResponse({ status: 201, description: 'Scraping job created' })
  async scrapeCategories(@Param('slug') slug: string) {
    const navigation = await this.navigationService.findBySlug(slug);
    if (!navigation || !navigation.source_url) {
      throw new Error('Navigation not found or missing source URL');
    }

    const job = await this.scrapingQueueService.addScrapeJob({
      targetUrl: navigation.source_url,
      targetType: ScrapeJobType.CATEGORY,
    });
    
    return { jobId: job.id, status: 'started' };
  }
}
