import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductSearchService } from './product-search.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [ProductSearchService],
  exports: [ProductSearchService],
})
export class SearchModule {}
