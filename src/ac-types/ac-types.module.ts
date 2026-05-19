import { Module } from '@nestjs/common';
import { AcTypesService } from './ac-types.service';
import { AcTypesController } from './ac-types.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AcTypesController],
  providers: [AcTypesService],
  exports: [AcTypesService],
})
export class AcTypesModule {}
