import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CatalogCacheService } from '../cache/catalog-cache.service';
import { ProductSearchService } from '../search/product-search.service';

describe('ProductsService', () => {
  let service: ProductsService;
  const prisma = {
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  };
  const cache = {
    get: jest.fn(),
    set: jest.fn(),
    invalidateCatalog: jest.fn(),
  };
  const search = {
    search: jest.fn(),
    syncProduct: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
        { provide: SupabaseService, useValue: {} },
        { provide: CatalogCacheService, useValue: cache },
        { provide: ProductSearchService, useValue: search },
      ],
    }).compile();

    service = module.get(ProductsService);
    jest.clearAllMocks();
    cache.get.mockResolvedValue(null);
    cache.set.mockResolvedValue(undefined);
    cache.invalidateCatalog.mockResolvedValue(undefined);
    search.search.mockResolvedValue(null);
    search.syncProduct.mockResolvedValue(undefined);
  });

  it('mengembalikan respons dari Redis tanpa membaca database', async () => {
    const cached = {
      data: [{ id: 'cached-product' }],
      meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
    };
    cache.get.mockResolvedValue(cached);

    await expect(service.findAll({})).resolves.toEqual(cached);
    expect(prisma.product.findMany).not.toHaveBeenCalled();
  });

  it('membaca PostgreSQL dan menyimpan hasil saat cache kosong', async () => {
    const products = [{ id: 'product-1' }];
    prisma.product.findMany.mockResolvedValue(products);
    prisma.product.count.mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result).toEqual({
      data: products,
      meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
    });
    expect(cache.set).toHaveBeenCalledWith(
      'products:list',
      { page: 1, limit: 10 },
      result,
    );
  });

  it('menyinkronkan indeks dan mengganti versi cache setelah produk dibuat', async () => {
    const product = { id: 'product-2' };
    prisma.product.create.mockResolvedValue(product);

    await expect(
      service.create({
        id_brand: 1,
        name: 'AC Example',
        price: 1000000,
        quantity: 2,
      }),
    ).resolves.toEqual(product);

    expect(cache.invalidateCatalog).toHaveBeenCalledTimes(1);
    expect(search.syncProduct).toHaveBeenCalledWith('product-2');
  });
});
