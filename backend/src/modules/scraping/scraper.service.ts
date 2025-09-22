import { Injectable, Logger } from '@nestjs/common';
import { PlaywrightCrawler, Dataset } from 'crawlee';
import { Browser, Page } from 'playwright';

export interface ScrapedNavigation {
  title: string;
  slug: string;
  url: string;
}

export interface ScrapedCategory {
  title: string;
  slug: string;
  url: string;
  parentSlug?: string;
}

export interface ScrapedProduct {
  sourceId: string;
  title: string;
  author?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  sourceUrl: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}

export interface ScrapedProductDetail {
  description?: string;
  longDescription?: string;
  specifications?: Record<string, any>;
  publisher?: string;
  publicationDate?: string;
  isbn?: string;
  isbn13?: string;
  pages?: number;
  language?: string;
  format?: string;
  genres?: string[];
  additionalImages?: string[];
  relatedProducts?: any[];
  reviews?: any[];
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private readonly baseUrl = process.env.WOB_BASE_URL || 'https://www.worldofbooks.com';
  private readonly userAgent = process.env.WOB_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  private readonly delay = parseInt(process.env.SCRAPING_DELAY_MS, 10) || 1000;

  private async createCrawler(options: any = {}) {
    return new PlaywrightCrawler({
      requestHandlerTimeoutSecs: 30,
      maxRequestRetries: 3,
      maxConcurrency: parseInt(process.env.MAX_CONCURRENT_SCRAPES, 10) || 3,
      launchContext: {
        launchOptions: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      },
      ...options,
    });
  }

  async scrapeNavigation(): Promise<ScrapedNavigation[]> {
    this.logger.log('Starting navigation scraping...');
    const results: ScrapedNavigation[] = [];

    const crawler = await this.createCrawler({
      requestHandler: async ({ page, request }) => {
        try {
          await page.setUserAgent(this.userAgent);
          await page.goto(request.loadedUrl, { waitUntil: 'networkidle' });
          
          // Wait for navigation elements to load
          await page.waitForSelector('nav, header', { timeout: 10000 });

          // Extract navigation items - adjust selectors based on World of Books structure
          const navItems = await page.evaluate(() => {
            const items: ScrapedNavigation[] = [];
            
            // Look for main navigation items
            const navElements = document.querySelectorAll('nav a, header a, .nav-item a, .menu-item a');
            
            navElements.forEach((element: Element) => {
              const link = element as HTMLAnchorElement;
              const text = link.textContent?.trim();
              const href = link.href;
              
              if (text && href && this.isMainNavItem(text, href)) {
                items.push({
                  title: text,
                  slug: this.createSlug(text),
                  url: href,
                });
              }
            });

            return items;
          });

          results.push(...navItems);
          await this.delay && new Promise(resolve => setTimeout(resolve, this.delay));
        } catch (error) {
          this.logger.error(`Failed to scrape navigation: ${error.message}`);
        }
      },
    });

    await crawler.run([this.baseUrl]);
    this.logger.log(`Scraped ${results.length} navigation items`);
    return results;
  }

  async scrapeCategories(navigationUrl: string): Promise<ScrapedCategory[]> {
    this.logger.log(`Starting category scraping for: ${navigationUrl}`);
    const results: ScrapedCategory[] = [];

    const crawler = await this.createCrawler({
      requestHandler: async ({ page, request }) => {
        try {
          await page.setUserAgent(this.userAgent);
          await page.goto(request.loadedUrl, { waitUntil: 'networkidle' });

          // Extract category information
          const categories = await page.evaluate(() => {
            const items: ScrapedCategory[] = [];
            
            // Look for category links - adjust selectors based on actual structure
            const categoryElements = document.querySelectorAll('.category-link, .subcategory, .category-item a');
            
            categoryElements.forEach((element: Element) => {
              const link = element as HTMLAnchorElement;
              const text = link.textContent?.trim();
              const href = link.href;
              
              if (text && href) {
                items.push({
                  title: text,
                  slug: this.createSlug(text),
                  url: href,
                });
              }
            });

            return items;
          });

          results.push(...categories);
          await this.delay && new Promise(resolve => setTimeout(resolve, this.delay));
        } catch (error) {
          this.logger.error(`Failed to scrape categories: ${error.message}`);
        }
      },
    });

    await crawler.run([navigationUrl]);
    this.logger.log(`Scraped ${results.length} categories`);
    return results;
  }

  async scrapeProducts(categoryUrl: string, limit: number = 50): Promise<ScrapedProduct[]> {
    this.logger.log(`Starting product scraping for: ${categoryUrl}`);
    const results: ScrapedProduct[] = [];

    const crawler = await this.createCrawler({
      requestHandler: async ({ page, request }) => {
        try {
          await page.setUserAgent(this.userAgent);
          await page.goto(request.loadedUrl, { waitUntil: 'networkidle' });

          // Wait for product grid to load
          await page.waitForSelector('.product, .book-item, .product-item', { timeout: 10000 });

          const products = await page.evaluate((limit: number) => {
            const items: ScrapedProduct[] = [];
            
            // Look for product items - adjust selectors based on actual structure
            const productElements = document.querySelectorAll('.product, .book-item, .product-item');
            
            Array.from(productElements).slice(0, limit).forEach((element: Element, index) => {
              try {
                const titleElement = element.querySelector('h2, h3, .title, .product-title');
                const authorElement = element.querySelector('.author, .product-author');
                const priceElement = element.querySelector('.price, .product-price');
                const imageElement = element.querySelector('img');
                const linkElement = element.querySelector('a');

                const title = titleElement?.textContent?.trim();
                const author = authorElement?.textContent?.trim();
                const priceText = priceElement?.textContent?.trim();
                const imageUrl = imageElement?.getAttribute('src') || imageElement?.getAttribute('data-src');
                const productUrl = linkElement?.getAttribute('href');

                if (title && productUrl) {
                  // Extract price and currency
                  let price: number | undefined;
                  let currency = 'GBP';
                  
                  if (priceText) {
                    const priceMatch = priceText.match(/[\d,]+\.?\d*/);
                    if (priceMatch) {
                      price = parseFloat(priceMatch[0].replace(/,/g, ''));
                    }
                    if (priceText.includes('$')) currency = 'USD';
                    else if (priceText.includes('€')) currency = 'EUR';
                  }

                  items.push({
                    sourceId: `wob_${Date.now()}_${index}`,
                    title,
                    author,
                    price,
                    currency,
                    imageUrl: imageUrl ? new URL(imageUrl, window.location.origin).href : undefined,
                    sourceUrl: new URL(productUrl, window.location.origin).href,
                    inStock: true, // Assume in stock unless indicated otherwise
                  });
                }
              } catch (error) {
                console.error('Error processing product element:', error);
              }
            });

            return items;
          }, limit);

          results.push(...products);
          await this.delay && new Promise(resolve => setTimeout(resolve, this.delay));
        } catch (error) {
          this.logger.error(`Failed to scrape products: ${error.message}`);
        }
      },
    });

    await crawler.run([categoryUrl]);
    this.logger.log(`Scraped ${results.length} products`);
    return results;
  }

  async scrapeProductDetail(productUrl: string): Promise<ScrapedProductDetail> {
    this.logger.log(`Starting product detail scraping for: ${productUrl}`);
    let result: ScrapedProductDetail = {};

    const crawler = await this.createCrawler({
      requestHandler: async ({ page, request }) => {
        try {
          await page.setUserAgent(this.userAgent);
          await page.goto(request.loadedUrl, { waitUntil: 'networkidle' });

          // Wait for product detail content to load
          await page.waitForSelector('.product-detail, .book-details, .product-info', { timeout: 10000 });

          result = await page.evaluate(() => {
            const detail: ScrapedProductDetail = {};

            // Extract description
            const descElement = document.querySelector('.description, .product-description, .book-description');
            detail.description = descElement?.textContent?.trim();

            // Extract specifications
            const specifications: Record<string, any> = {};
            const specElements = document.querySelectorAll('.spec-item, .product-spec, .book-info li');
            
            specElements.forEach((spec: Element) => {
              const text = spec.textContent?.trim();
              if (text && text.includes(':')) {
                const [key, value] = text.split(':').map(s => s.trim());
                if (key && value) {
                  specifications[key.toLowerCase().replace(/\s+/g, '_')] = value;
                }
              }
            });
            
            if (Object.keys(specifications).length > 0) {
              detail.specifications = specifications;
            }

            // Extract additional images
            const additionalImages: string[] = [];
            const imageElements = document.querySelectorAll('.product-gallery img, .additional-images img');
            
            imageElements.forEach((img: Element) => {
              const src = img.getAttribute('src') || img.getAttribute('data-src');
              if (src) {
                additionalImages.push(new URL(src, window.location.origin).href);
              }
            });
            
            if (additionalImages.length > 0) {
              detail.additionalImages = additionalImages;
            }

            // Extract related products
            const relatedProducts: any[] = [];
            const relatedElements = document.querySelectorAll('.related-product, .recommended-book');
            
            relatedElements.forEach((element: Element) => {
              const titleElement = element.querySelector('.title, h3');
              const linkElement = element.querySelector('a');
              const title = titleElement?.textContent?.trim();
              const url = linkElement?.getAttribute('href');
              
              if (title && url) {
                relatedProducts.push({
                  title,
                  url: new URL(url, window.location.origin).href,
                });
              }
            });
            
            if (relatedProducts.length > 0) {
              detail.relatedProducts = relatedProducts;
            }

            return detail;
          });

          await this.delay && new Promise(resolve => setTimeout(resolve, this.delay));
        } catch (error) {
          this.logger.error(`Failed to scrape product detail: ${error.message}`);
        }
      },
    });

    await crawler.run([productUrl]);
    this.logger.log(`Scraped product detail for: ${productUrl}`);
    return result;
  }

  private createSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private isMainNavItem(text: string, href: string): boolean {
    // Filter out non-main navigation items
    const excludePatterns = ['cart', 'account', 'login', 'search', 'contact', 'about'];
    const textLower = text.toLowerCase();
    
    return !excludePatterns.some(pattern => 
      textLower.includes(pattern) || href.toLowerCase().includes(pattern)
    ) && text.length > 1 && text.length < 50;
  }
}
