import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { PrismaService } from '../prisma/prisma.service';

export interface ProductSearchInput {
  search: string;
  id_brand?: number[];
  id_category?: number[];
  id_ac_type?: number;
  min_price?: number;
  max_price?: number;
  freon_type?: string;
  model_code?: string;
  series_name?: string;
  includeDeleted?: boolean;
  page: number;
  limit: number;
  sortBy?: 'price' | 'date';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductSearchResult {
  ids: string[];
  total: number;
}

type SearchProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  freon_type: string | null;
  model_code: string | null;
  series_name: string | null;
  id_brand: number;
  id_category: number | null;
  id_ac_type: number | null;
  created_at: string;
  is_deleted: boolean;
};

@Injectable()
export class ProductSearchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProductSearchService.name);
  private readonly indexName: string;
  private client: Client | null = null;
  private available = false;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.indexName =
      config.get<string>('ELASTICSEARCH_PRODUCT_INDEX') ?? 'acsa-products';
    const node = config.get<string>('ELASTICSEARCH_NODE');
    if (node) this.client = new Client({ node, requestTimeout: 3000 });
  }

  async onModuleInit(): Promise<void> {
    if (!this.client) {
      this.logger.warn(
        'ELASTICSEARCH_NODE kosong. Pencarian memakai PostgreSQL.',
      );
      return;
    }

    try {
      await this.client.ping();
      await this.ensureIndex();
      this.available = true;
      this.logger.log('Pencarian produk terhubung ke Elasticsearch.');
    } catch (error) {
      this.available = false;
      this.logger.warn(
        `Elasticsearch tidak dapat dipakai. Pencarian memakai PostgreSQL: ${this.errorMessage(error)}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.close();
  }

  async search(input: ProductSearchInput): Promise<ProductSearchResult | null> {
    if (!(await this.isReady())) return null;
    const client = this.client;
    if (!client) return null;

    const filters: object[] = [];
    if (!input.includeDeleted) filters.push({ term: { is_deleted: false } });
    if (input.id_brand?.length) {
      filters.push({ terms: { id_brand: input.id_brand } });
    }
    if (input.id_category?.length) {
      filters.push({ terms: { id_category: input.id_category } });
    }
    if (input.id_ac_type) {
      filters.push({ term: { id_ac_type: input.id_ac_type } });
    }
    if (input.min_price !== undefined || input.max_price !== undefined) {
      filters.push({
        range: {
          price: {
            ...(input.min_price !== undefined ? { gte: input.min_price } : {}),
            ...(input.max_price !== undefined ? { lte: input.max_price } : {}),
          },
        },
      });
    }
    this.addTextFilter(filters, 'freon_type', input.freon_type);
    this.addTextFilter(filters, 'model_code', input.model_code);
    this.addTextFilter(filters, 'series_name', input.series_name);

    const sort = input.sortBy
      ? [
          `${input.sortBy === 'price' ? 'price' : 'created_at'}:${input.sortOrder ?? (input.sortBy === 'price' ? 'asc' : 'desc')}`,
        ]
      : ['_score:desc', 'created_at:desc'];

    try {
      const response = await client.search<SearchProduct>({
        index: this.indexName,
        from: (input.page - 1) * input.limit,
        size: input.limit,
        track_total_hits: true,
        _source: false,
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: input.search,
                  fields: [
                    'name^4',
                    'model_code^3',
                    'series_name^2',
                    'description',
                    'freon_type',
                  ],
                  fuzziness: 'AUTO',
                },
              },
            ],
            filter: filters,
          },
        },
        sort,
      });

      const total =
        typeof response.hits.total === 'number'
          ? response.hits.total
          : (response.hits.total?.value ?? 0);
      return {
        ids: response.hits.hits
          .map((hit) => hit._id)
          .filter((id): id is string => Boolean(id)),
        total,
      };
    } catch (error) {
      this.logger.warn(
        `Pencarian Elasticsearch gagal. PostgreSQL dipakai: ${this.errorMessage(error)}`,
      );
      return null;
    }
  }

  async syncProduct(id: string): Promise<void> {
    if (!(await this.isReady())) return;
    const client = this.client;
    if (!client) return;
    try {
      const product = await this.prisma.product.findUnique({ where: { id } });
      if (!product) {
        await client.delete(
          { index: this.indexName, id, refresh: false },
          { ignore: [404] },
        );
        return;
      }
      await client.index({
        index: this.indexName,
        id,
        document: this.toDocument(product),
        refresh: false,
      });
    } catch (error) {
      this.logger.warn(
        `Produk ${id} belum tersinkron ke Elasticsearch: ${this.errorMessage(error)}`,
      );
    }
  }

  async reindexAll(): Promise<number> {
    if (!this.client) throw new Error('ELASTICSEARCH_NODE belum diisi.');
    await this.client.ping();
    await this.ensureIndex();
    await this.client.deleteByQuery({
      index: this.indexName,
      query: { match_all: {} },
      refresh: true,
      conflicts: 'proceed',
    });

    const products = await this.prisma.product.findMany();
    if (products.length === 0) {
      this.available = true;
      return 0;
    }

    const operations = products.flatMap((product) => [
      { index: { _index: this.indexName, _id: product.id } },
      this.toDocument(product),
    ]);
    const result = await this.client.bulk({ operations, refresh: true });
    if (result.errors) {
      throw new Error('Sebagian dokumen gagal dimasukkan ke Elasticsearch.');
    }
    this.available = true;
    return products.length;
  }

  private async ensureIndex(): Promise<void> {
    if (!this.client) return;
    const exists = await this.client.indices.exists({ index: this.indexName });
    if (exists) return;
    await this.client.indices.create({
      index: this.indexName,
      mappings: {
        properties: {
          id: { type: 'keyword' },
          name: { type: 'text' },
          description: { type: 'text' },
          price: { type: 'double' },
          freon_type: { type: 'keyword' },
          model_code: { type: 'keyword' },
          series_name: { type: 'keyword' },
          id_brand: { type: 'integer' },
          id_category: { type: 'integer' },
          id_ac_type: { type: 'integer' },
          created_at: { type: 'date' },
          is_deleted: { type: 'boolean' },
        },
      },
    });
  }

  private async isReady(): Promise<boolean> {
    if (!this.client) return false;
    if (this.available) return true;
    try {
      await this.client.ping();
      await this.ensureIndex();
      this.available = true;
      return true;
    } catch {
      return false;
    }
  }

  private toDocument(product: {
    id: string;
    name: string;
    description: string | null;
    price: { toString(): string };
    freon_type: string | null;
    model_code: string | null;
    series_name: string | null;
    id_brand: number;
    id_category: number | null;
    id_ac_type: number | null;
    created_at: Date;
    is_deleted: boolean;
  }): SearchProduct {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price.toString()),
      freon_type: product.freon_type,
      model_code: product.model_code,
      series_name: product.series_name,
      id_brand: product.id_brand,
      id_category: product.id_category,
      id_ac_type: product.id_ac_type,
      created_at: product.created_at.toISOString(),
      is_deleted: product.is_deleted,
    };
  }

  private addTextFilter(
    filters: object[],
    field: string,
    value?: string,
  ): void {
    if (!value) return;
    filters.push({
      wildcard: {
        [field]: { value: `*${value}*`, case_insensitive: true },
      },
    });
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
