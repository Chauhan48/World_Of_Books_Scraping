import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScraperService } from './scraper.service';
import { ScrapingQueueService } from './scraping-queue.service';
// Import services will be injected via module
import { NavigationService } from '../navigation/navigation.service';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';
import { ScrapeJobType, ScrapeJobStatus } from '@/database/entities/scrape-job.entity';

@Processor('scraping')
@Injectable()
export class ScrapingProcessor {
  private readonly logger = new Logger(ScrapingProcessor.name);

  constructor(
    private readonly scraperService: ScraperService,
    private readonly queueService: ScrapingQueueService,
    @Inject('NavigationService') private readonly navigationService: any,
    @Inject('CategoriesService') private readonly categoriesService: any,
    @Inject('ProductsService') private readonly productsService: any
  ) {}

  @Process('scrape')
  async handleScrape(job: Job) {
    const { jobId, targetUrl, targetType, options } = job.data;
    this.logger.log(`Processing scrape job ${jobId}: ${targetType} - ${targetUrl}`);

    try {
      // Update job status to running
      await this.queueService.updateJobStatus(jobId, ScrapeJobStatus.RUNNING);

      let result: any;

      switch (targetType) {
        case ScrapeJobType.NAVIGATION:
          result = await this.processNavigationScrape(targetUrl, options);
          break;
        
        case ScrapeJobType.CATEGORY:
          result = await this.processCategoryScrape(targetUrl, options);
          break;
        
        case ScrapeJobType.PRODUCT:
          result = await this.processProductScrape(targetUrl, options);
          break;
        
        case ScrapeJobType.PRODUCT_DETAIL:
          result = await this.processProductDetailScrape(targetUrl, options);
          break;
        
        default:
          throw new Error(`Unknown scrape type: ${targetType}`);
      }

      // Update job status to completed
      await this.queueService.updateJobStatus(
        jobId,
        ScrapeJobStatus.COMPLETED,
        result,
      );

      this.logger.log(`Completed scrape job ${jobId}`);
      return result;

    } catch (error) {
      this.logger.error(`Scrape job ${jobId} failed: ${error.message}`, error.stack);
      
      // Update job status to failed
      await this.queueService.updateJobStatus(
        jobId,
        ScrapeJobStatus.FAILED,
        undefined,
        error.message,
      );

      throw error;
    }
  }

  private async processNavigationScrape(targetUrl: string, options: any) {
    const scrapedNavigation = await this.scraperService.scrapeNavigation();
    
    // Save navigation items to database
    const savedItems = [];
    for (const navItem of scrapedNavigation) {
      try {
        const saved = await this.navigationService.createOrUpdate({
          title: navItem.title,
          slug: navItem.slug,
          source_url: navItem.url,
          last_scraped_at: new Date(),
        });
        savedItems.push(saved);
      } catch (error) {
        this.logger.warn(`Failed to save navigation item: ${navItem.title}`, error.message);
      }
    }

    return {
      scraped_count: scrapedNavigation.length,
      saved_count: savedItems.length,
      items: savedItems,
    };
  }

  private async processCategoryScrape(targetUrl: string, options: any) {
    const scrapedCategories = await this.scraperService.scrapeCategories(targetUrl);
    
    // Find navigation item for this URL
    const navigation = await this.navigationService.findBySourceUrl(targetUrl);
    
    const savedItems = [];
    for (const category of scrapedCategories) {
      try {
        const saved = await this.categoriesService.createOrUpdate({
          title: category.title,
          slug: category.slug,
          source_url: category.url,
          navigation_id: navigation?.id,
          last_scraped_at: new Date(),
        });
        savedItems.push(saved);
      } catch (error) {
        this.logger.warn(`Failed to save category: ${category.title}`, error.message);
      }
    }

    return {
      scraped_count: scrapedCategories.length,
      saved_count: savedItems.length,
      navigation_id: navigation?.id,
      items: savedItems,
    };
  }

  private async processProductScrape(targetUrl: string, options: any) {
    const limit = options?.limit || 50;
    const scrapedProducts = await this.scraperService.scrapeProducts(targetUrl, limit);
    
    // Find category for this URL
    const category = await this.categoriesService.findBySourceUrl(targetUrl);
    
    const savedItems = [];
    for (const product of scrapedProducts) {
      try {
        const saved = await this.productsService.createOrUpdate({
          source_id: product.sourceId,
          title: product.title,
          author: product.author,
          price: product.price,
          currency: product.currency,
          image_url: product.imageUrl,
          source_url: product.sourceUrl,
          category_id: category?.id,
          rating_avg: product.rating,
          review_count: product.reviewCount || 0,
          in_stock: product.inStock ?? true,
          last_scraped_at: new Date(),
        });
        savedItems.push(saved);
      } catch (error) {
        this.logger.warn(`Failed to save product: ${product.title}`, error.message);
      }
    }

    // Update category product count
    if (category) {
      await this.categoriesService.updateProductCount(category.id);
    }

    return {
      scraped_count: scrapedProducts.length,
      saved_count: savedItems.length,
      category_id: category?.id,
      items: savedItems,
    };
  }

  private async processProductDetailScrape(targetUrl: string, options: any) {
    const productId = options?.productId;
    
    if (!productId) {
      throw new Error('Product ID is required for product detail scraping');
    }

    const scrapedDetail = await this.scraperService.scrapeProductDetail(targetUrl);
    
    // Save product detail
    const saved = await this.productsService.createOrUpdateDetail(productId, {
      description: scrapedDetail.description,
      long_description: scrapedDetail.longDescription,
      specifications: scrapedDetail.specifications,
      publisher: scrapedDetail.publisher,
      publication_date: scrapedDetail.publicationDate ? new Date(scrapedDetail.publicationDate) : undefined,
      isbn: scrapedDetail.isbn,
      isbn13: scrapedDetail.isbn13,
      pages: scrapedDetail.pages,
      language: scrapedDetail.language,
      format: scrapedDetail.format,
      genres: scrapedDetail.genres,
      additional_images: scrapedDetail.additionalImages,
      related_products: scrapedDetail.relatedProducts,
    });

    // Save reviews if any
    if (scrapedDetail.reviews && scrapedDetail.reviews.length > 0) {
      await this.productsService.createReviews(productId, scrapedDetail.reviews);
    }

    return {
      product_id: productId,
      detail_saved: !!saved,
      reviews_count: scrapedDetail.reviews?.length || 0,
    };
  }
}
