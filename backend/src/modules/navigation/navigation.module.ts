import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigationController } from './navigation.controller';
import { NavigationService } from './navigation.service';
import { Navigation } from '@/database/entities/navigation.entity';
import { ScrapingModule } from '../scraping/scraping.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Navigation]),
    ScrapingModule,
  ],
  controllers: [NavigationController],
  providers: [NavigationService],
  exports: [NavigationService],
})
export class NavigationModule {}
