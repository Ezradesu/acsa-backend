import { Test, TestingModule } from '@nestjs/testing';
import { SponsoredBrandsController } from './sponsored-brands.controller';

describe('SponsoredBrandsController', () => {
  let controller: SponsoredBrandsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SponsoredBrandsController],
    }).compile();

    controller = module.get<SponsoredBrandsController>(SponsoredBrandsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
