import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Navigation } from '@/database/entities/navigation.entity';

@Injectable()
export class NavigationService {
  constructor(
    @InjectRepository(Navigation)
    private navigationRepository: Repository<Navigation>,
  ) {}

  async findAll(): Promise<Navigation[]> {
    return this.navigationRepository.find({
      where: { is_active: true },
      order: { display_order: 'ASC', title: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<Navigation | null> {
    return this.navigationRepository.findOne({
      where: { slug, is_active: true },
      relations: ['categories'],
    });
  }

  async findBySourceUrl(sourceUrl: string): Promise<Navigation | null> {
    return this.navigationRepository.findOne({
      where: { source_url: sourceUrl },
    });
  }

  async createOrUpdate(data: Partial<Navigation>): Promise<Navigation> {
    const existing = await this.navigationRepository.findOne({
      where: { slug: data.slug },
    });

    if (existing) {
      await this.navigationRepository.update(existing.id, {
        ...data,
        updated_at: new Date(),
      });
      return this.navigationRepository.findOne({ where: { id: existing.id } });
    }

    const navigation = this.navigationRepository.create(data);
    return this.navigationRepository.save(navigation);
  }
}
