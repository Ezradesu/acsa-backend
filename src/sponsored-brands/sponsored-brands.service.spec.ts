import { Test, TestingModule } from '@nestjs/testing';
import { SponsoredBrandsService } from './sponsored-brands.service';

describe('SponsoredBrandsService', () => {
  let service: SponsoredBrandsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SponsoredBrandsService],
    }).compile();

    service = module.get<SponsoredBrandsService>(SponsoredBrandsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
