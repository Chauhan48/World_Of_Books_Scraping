import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = appController.getHealth();
      
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result.message).toBe('Product Data Explorer API is running!');
      expect(typeof result.uptime).toBe('number');
    });
  });

  describe('getHello', () => {
    it('should return health status', () => {
      const result = appController.getHello();
      
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Product Data Explorer API is running!');
    });
  });
});
