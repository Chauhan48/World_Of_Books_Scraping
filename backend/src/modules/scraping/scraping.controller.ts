import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScrapingQueueService } from './scraping-queue.service';
import { ScrapeJobType } from '@/database/entities/scrape-job.entity';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('scraping')
@Controller('scrape')
export class ScrapingController {
  constructor(private readonly scrapingQueueService: ScrapingQueueService) {}

  @Post('navigation')
  @ApiOperation({ summary: 'Trigger navigation scraping' })
  @ApiResponse({ status: 201, description: 'Scraping job created' })
  async scrapeNavigation() {
    const job = await this.scrapingQueueService.addScrapeJob({
      targetUrl: 'https://www.worldofbooks.com',
      targetType: ScrapeJobType.NAVIGATION,
    });
    return { jobId: job.id, status: 'started' };
  }

  @Post('category/:id')
  @ApiOperation({ summary: 'Trigger category scraping' })
  @ApiResponse({ status: 201, description: 'Scraping job created' })
  async scrapeCategory(@Param('id') id: string, @Body() body: any) {
    const job = await this.scrapingQueueService.addScrapeJob({
      targetUrl: body.url,
      targetType: ScrapeJobType.CATEGORY,
      options: { categoryId: id },
    });
    return { jobId: job.id, status: 'started' };
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get scraping jobs' })
  @ApiResponse({ status: 200, description: 'List of scraping jobs' })
  async getJobs(@Query() pagination: PaginationDto) {
    return this.scrapingQueueService.getRecentJobs(pagination.limit);
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get scraping job status' })
  @ApiResponse({ status: 200, description: 'Scraping job details' })
  async getJobStatus(@Param('id') id: string) {
    return this.scrapingQueueService.getJobStatus(parseInt(id));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get queue statistics' })
  @ApiResponse({ status: 200, description: 'Queue statistics' })
  async getStats() {
    return this.scrapingQueueService.getQueueStats();
  }
}
