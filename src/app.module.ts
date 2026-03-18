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

@Module({
  imports: [PrismaModule, AuthModule, SupabaseModule, CategoriesModule, BrandsModule, ProductsModule, OrdersModule, CartModule, WishlistModule],
  controllers: [AppController, CategoriesController, BrandsController, ProductsController, OrdersController, CartController, WishlistController],
  providers: [AppService, SupabaseService, CategoriesService, BrandsService, ProductsService, OrdersService, CartService, WishlistService],
})
export class AppModule { }