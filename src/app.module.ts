import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SupabaseService } from './supabase/supabase.service';
import { SupabaseModule } from './supabase/supabase.module';
import { CategoriesService } from './categories/categories.service';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesModule } from './categories/categories.module';
import { BrandsService } from './brands/brands.service';
import { BrandsController } from './brands/brands.controller';
import { BrandsModule } from './brands/brands.module';
import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';
import { ProductsModule } from './products/products.module';
import { OrdersService } from './orders/orders.service';
import { OrdersController } from './orders/orders.controller';
import { OrdersModule } from './orders/orders.module';
import { CartService } from './cart/cart.service';
import { CartController } from './cart/cart.controller';
import { CartModule } from './cart/cart.module';
import { WishlistService } from './wishlist/wishlist.service';
import { WishlistController } from './wishlist/wishlist.controller';
import { WishlistModule } from './wishlist/wishlist.module';
import { DiscountsService } from './discounts/discounts.service';
import { DiscountsController } from './discounts/discounts.controller';
import { DiscountsModule } from './discounts/discounts.module';
import { ReviewsService } from './reviews/reviews.service';
import { ReviewsController } from './reviews/reviews.controller';
import { ReviewsModule } from './reviews/reviews.module';
import { FeaturedProductsService } from './featured-products/featured-products.service';
import { FeaturedProductsController } from './featured-products/featured-products.controller';
import { FeaturedProductsModule } from './featured-products/featured-products.module';
import { SponsoredBrandsService } from './sponsored-brands/sponsored-brands.service';
import { SponsoredBrandsController } from './sponsored-brands/sponsored-brands.controller';
import { SponsoredBrandsModule } from './sponsored-brands/sponsored-brands.module';
import { BannersService } from './banners/banners.service';
import { BannersController } from './banners/banners.controller';
import { BannersModule } from './banners/banners.module';
import { ProjectsService } from './projects/projects.service';
import { ProjectsController } from './projects/projects.controller';
import { ProjectsModule } from './projects/projects.module';
import { ArticlesService } from './articles/articles.service';
import { ArticlesController } from './articles/articles.controller';
import { ArticlesModule } from './articles/articles.module';
import { CompanyService } from './company/company.service';
import { CompanyController } from './company/company.controller';
import { CompanyModule } from './company/company.module';
import { SocialMediaService } from './social-media/social-media.service';
import { SocialMediaController } from './social-media/social-media.controller';
import { SocialMediaModule } from './social-media/social-media.module';
import { StaffService } from './staff/staff.service';
import { StaffController } from './staff/staff.controller';
import { StaffModule } from './staff/staff.module';

@Module({
  imports: [PrismaModule, AuthModule, SupabaseModule, CategoriesModule, BrandsModule, ProductsModule, OrdersModule, CartModule, WishlistModule, DiscountsModule, ReviewsModule, FeaturedProductsModule, SponsoredBrandsModule, BannersModule, ProjectsModule, ArticlesModule, CompanyModule, SocialMediaModule, StaffModule],
  controllers: [AppController, CategoriesController, BrandsController, ProductsController, OrdersController, CartController, WishlistController, DiscountsController, ReviewsController, FeaturedProductsController, SponsoredBrandsController, BannersController, ProjectsController, ArticlesController, CompanyController, SocialMediaController, StaffController],
  providers: [AppService, SupabaseService, CategoriesService, BrandsService, ProductsService, OrdersService, CartService, WishlistService, DiscountsService, ReviewsService, FeaturedProductsService, SponsoredBrandsService, BannersService, ProjectsService, ArticlesService, CompanyService, SocialMediaService, StaffService],
})
export class AppModule { }