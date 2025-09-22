import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ScrapeJob, ScrapeJobStatus, ScrapeJobType } from '@/database/entities/scrape-job.entity';

export interface ScrapeJobOptions {
  targetUrl: string;
  targetType: ScrapeJobType;
  options?: Record<string, any>;
  priority?: number;
  delay?: number;
}

@Injectable()
export class ScrapingQueueService {
  private readonly logger = new Logger(ScrapingQueueService.name);

  constructor(
    @InjectQueue('scraping') private scrapingQueue: Queue,
    @InjectRepository(ScrapeJob)
    private scrapeJobRepository: Repository<ScrapeJob>,
  ) {}

  async addScrapeJob(jobOptions: ScrapeJobOptions): Promise<ScrapeJob> {
    // Create database record
    const scrapeJob = this.scrapeJobRepository.create({
      target_url: jobOptions.targetUrl,
      target_type: jobOptions.targetType,
      status: ScrapeJobStatus.PENDING,
      options: jobOptions.options || {},
    });

    const savedJob = await this.scrapeJobRepository.save(scrapeJob);

    // Add to queue
    await this.scrapingQueue.add(
      'scrape',
      {
        jobId: savedJob.id,
        ...jobOptions,
      },
      {
        priority: jobOptions.priority || 0,
        delay: jobOptions.delay || 0,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    this.logger.log(`Added scrape job ${savedJob.id} to queue`);
    return savedJob;
  }

  async updateJobStatus(
    jobId: number,
    status: ScrapeJobStatus,
    result?: Record<string, any>,
    error?: string,
  ): Promise<void> {
    const updateData: Partial<ScrapeJob> = {
      status,
      updated_at: new Date(),
    };

    if (status === ScrapeJobStatus.RUNNING && !result && !error) {
      updateData.started_at = new Date();
    }

    if (status === ScrapeJobStatus.COMPLETED || status === ScrapeJobStatus.FAILED) {
      updateData.finished_at = new Date();
    }

    if (result) {
      updateData.result = result;
    }

    if (error) {
      updateData.error_message = error;
    }

    await this.scrapeJobRepository.update(jobId, updateData);
    this.logger.log(`Updated job ${jobId} status to ${status}`);
  }

  async getJobStatus(jobId: number): Promise<ScrapeJob | null> {
    return this.scrapeJobRepository.findOne({ where: { id: jobId } });
  }

  async getRecentJobs(limit: number = 20): Promise<ScrapeJob[]> {
    return this.scrapeJobRepository.find({
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getJobsByStatus(status: ScrapeJobStatus): Promise<ScrapeJob[]> {
    return this.scrapeJobRepository.find({
      where: { status },
      order: { created_at: 'DESC' },
    });
  }

  async retryFailedJob(jobId: number): Promise<void> {
    const job = await this.scrapeJobRepository.findOne({ where: { id: jobId } });
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status !== ScrapeJobStatus.FAILED) {
      throw new Error(`Job ${jobId} is not in failed status`);
    }

    // Reset job status
    await this.scrapeJobRepository.update(jobId, {
      status: ScrapeJobStatus.PENDING,
      retry_count: (job.retry_count || 0) + 1,
      error_message: null,
      error_log: null,
    });

    // Add back to queue
    await this.scrapingQueue.add(
      'scrape',
      {
        jobId: job.id,
        targetUrl: job.target_url,
        targetType: job.target_type,
        options: job.options,
      },
      {
        priority: 1, // Higher priority for retries
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    this.logger.log(`Retried job ${jobId}`);
  }

  async cancelJob(jobId: number): Promise<void> {
    await this.scrapeJobRepository.update(jobId, {
      status: ScrapeJobStatus.CANCELLED,
      finished_at: new Date(),
    });

    // Try to remove from queue if still pending
    const jobs = await this.scrapingQueue.getJobs(['waiting', 'delayed']);
    const queueJob = jobs.find(job => job.data.jobId === jobId);
    
    if (queueJob) {
      await queueJob.remove();
    }

    this.logger.log(`Cancelled job ${jobId}`);
  }

  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.scrapingQueue.getWaiting(),
      this.scrapingQueue.getActive(),
      this.scrapingQueue.getCompleted(),
      this.scrapingQueue.getFailed(),
      this.scrapingQueue.getDelayed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      total: waiting.length + active.length + completed.length + failed.length + delayed.length,
    };
  }
}
