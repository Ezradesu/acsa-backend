import { Module } from '@nestjs/common';
import { SponsoredBrandsService } from './sponsored-brands.service';
import { SponsoredBrandsController } from './sponsored-brands.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [SponsoredBrandsController],
    providers: [SponsoredBrandsService],
    exports: [SponsoredBrandsService],
})
export class SponsoredBrandsModule { }