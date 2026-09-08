import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { DiscountsModule } from './discounts/discounts.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FeaturedProductsModule } from './featured-products/featured-products.module';
import { SponsoredBrandsModule } from './sponsored-brands/sponsored-brands.module';
import { BannersModule } from './banners/banners.module';
import { ProjectsModule } from './projects/projects.module';
import { ArticlesModule } from './articles/articles.module';
import { CompanyModule } from './company/company.module';
import { SocialMediaModule } from './social-media/social-media.module';
import { StaffModule } from './staff/staff.module';
import { UsersModule } from './users/users.module';
import { AcTypesModule } from './ac-types/ac-types.module';
import { EmailModule } from './email/email.module';
import { validateEnvironment } from './config/env.validation';
import { CatalogCacheModule } from './cache/catalog-cache.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    CatalogCacheModule,
    SearchModule,
    PrismaModule,
    AuthModule,
    SupabaseModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    OrdersModule,
    CartModule,
    WishlistModule,
    DiscountsModule,
    ReviewsModule,
    FeaturedProductsModule,
    SponsoredBrandsModule,
    BannersModule,
    ProjectsModule,
    ArticlesModule,
    CompanyModule,
    SocialMediaModule,
    StaffModule,
    UsersModule,
    AcTypesModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
