import { Test, TestingModule } from '@nestjs/testing';
import { AcTypesController } from './ac-types.controller';
import { AcTypesService } from './ac-types.service';

describe('AcTypesController', () => {
  let controller: AcTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcTypesController],
      providers: [AcTypesService],
    }).compile();

    controller = module.get<AcTypesController>(AcTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
