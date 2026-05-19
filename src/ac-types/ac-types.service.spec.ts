import { Test, TestingModule } from '@nestjs/testing';
import { AcTypesService } from './ac-types.service';

describe('AcTypesService', () => {
  let service: AcTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcTypesService],
    }).compile();

    service = module.get<AcTypesService>(AcTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
