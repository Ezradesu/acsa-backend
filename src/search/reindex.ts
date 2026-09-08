import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ProductSearchService } from './product-search.service';

async function reindex(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const search = app.get(ProductSearchService);
    const count = await search.reindexAll();
    console.log(`Reindex selesai. ${count} produk diproses.`);
  } finally {
    await app.close();
  }
}

void reindex().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Reindex gagal: ${message}`);
  process.exitCode = 1;
});
