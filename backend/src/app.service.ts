import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { message: string; timestamp: string; uptime: number } {
    return {
      message: 'Product Data Explorer API is running!',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
