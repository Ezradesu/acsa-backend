import { Module } from '@nestjs/common';
import { FeaturedProductsService } from './featured-products.service';
import { FeaturedProductsController } from './featured-products.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [FeaturedProductsController],
    providers: [FeaturedProductsService],
    exports: [FeaturedProductsService],
})
export class FeaturedProductsModule { }