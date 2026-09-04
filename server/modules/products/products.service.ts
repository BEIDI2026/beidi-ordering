import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { and, eq, ilike, desc, sql, count, sum, inArray } from 'drizzle-orm';

import type {
  Product,
  ProductSku,
  ProductListResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListQuery,
} from '@shared/api.interface';
import { products, productSkus } from '../../database/schema';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  private mapProduct(row: typeof products.$inferSelect): Product {
    return {
      id: row.id,
      styleNo: row.styleNo,
      name: row.name,
      description: row.description,
      price: String(row.price),
      colors: row.colors,
      sizes: row.sizes,
      series: row.series,
      season: row.season,
      images: row.images,
      status: row.status,
    };
  }

  private mapSku(row: typeof productSkus.$inferSelect): ProductSku {
    return {
      id: row.id,
      productId: row.productId,
      color: row.color,
      size: row.size,
      stock: row.stock,
    };
  }

  async findList(query: ProductListQuery): Promise<ProductListResponse> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const offset = (page - 1) * pageSize;

    const conditions = [eq(products.status, 'active')];
    if (query.series) {
      conditions.push(eq(products.series, query.series));
    }
    if (query.keyword) {
      const keyword = `%${query.keyword}%`;
      conditions.push(sql`(${products.name} ilike ${keyword} or ${products.styleNo} ilike ${keyword})`);
    }
    const whereClause = and(...conditions);

    const [countResult, rows] = await Promise.all([
      this.db.select({ count: count() }).from(products).where(whereClause),
      this.db
        .select()
        .from(products)
        .where(whereClause)
        .orderBy(desc(products.createdAt))
        .limit(pageSize)
        .offset(offset),
    ]);

    const total = Number(countResult[0]?.count ?? 0);

    if (rows.length === 0) {
      return { items: [], total, page, pageSize };
    }

    const productIds = rows.map((row: typeof products.$inferSelect) => row.id);

    const skuRows = await this.db
      .select({
        productId: productSkus.productId,
        totalStock: sum(productSkus.stock),
      })
      .from(productSkus)
      .where(inArray(productSkus.productId, productIds))
      .groupBy(productSkus.productId);

    const stockMap = new Map<string, number>();
    for (const s of skuRows) {
      stockMap.set(s.productId, Number(s.totalStock ?? 0));
    }

    const items: Product[] = rows.map((row: typeof products.$inferSelect) => {
      const p = this.mapProduct(row);
      p.totalStock = stockMap.get(row.id) ?? 0;
      return p;
    });

    return { items, total, page, pageSize };
  }

  async findById(id: string): Promise<Product> {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new BadRequestException('无效的商品ID');
    }
    const rows = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
    if (rows.length === 0) {
      throw new NotFoundException('商品不存在');
    }

    const product = this.mapProduct(rows[0]);

    const skuRows = await this.db
      .select()
      .from(productSkus)
      .where(eq(productSkus.productId, id));

    product.skus = skuRows.map((row: typeof productSkus.$inferSelect) =>
      this.mapSku(row),
    );

    return product;
  }

  async create(dto: CreateProductRequest, userId: string): Promise<Product> {
    const result = await this.db.transaction(async (tx) => {
      const [productRow] = await tx
        .insert(products)
        .values({
          styleNo: dto.styleNo,
          name: dto.name,
          description: dto.description,
          price: String(dto.price),
          colors: dto.colors,
          sizes: dto.sizes,
          series: dto.series,
          season: dto.season,
          images: dto.images,
          status: 'active',
          createdBy: userId,
          updatedBy: userId,
        })
        .returning();

      const skuValues = dto.skus.map((sku) => ({
        productId: productRow.id,
        color: sku.color,
        size: sku.size,
        stock: sku.stock,
        createdBy: userId,
        updatedBy: userId,
      }));

      const skuRows = await tx
        .insert(productSkus)
        .values(skuValues)
        .returning();

      return { product: productRow, skus: skuRows };
    });

    const product = this.mapProduct(result.product);
    product.skus = result.skus.map((row) => this.mapSku(row));

    this.logger.log(`商品创建成功: id=${product.id}, styleNo=${product.styleNo}`);
    return product;
  }

  async update(id: string, dto: UpdateProductRequest, userId: string): Promise<Product> {
    const result = await this.db.transaction(async (tx) => {
      // 先确认商品存在
      const existing = await tx.select({ id: products.id }).from(products).where(eq(products.id, id)).limit(1);
      if (existing.length === 0) {
        throw new NotFoundException('商品不存在');
      }

      const patch: Partial<typeof products.$inferInsert> = {};
      if (dto.name !== undefined) patch.name = dto.name;
      if (dto.description !== undefined) patch.description = dto.description;
      if (dto.price !== undefined) patch.price = String(dto.price);
      if (dto.colors !== undefined) patch.colors = dto.colors;
      if (dto.sizes !== undefined) patch.sizes = dto.sizes;
      if (dto.series !== undefined) patch.series = dto.series;
      if (dto.season !== undefined) patch.season = dto.season;
      if (dto.images !== undefined) patch.images = dto.images;
      if (dto.status !== undefined) patch.status = dto.status;

      let updatedProduct: typeof products.$inferSelect;
      if (Object.keys(patch).length > 0) {
        patch.updatedAt = new Date();
        patch.updatedBy = userId;
        const [row] = await tx
          .update(products)
          .set(patch)
          .where(eq(products.id, id))
          .returning();
        updatedProduct = row;
      } else {
        const [row] = await tx.select().from(products).where(eq(products.id, id)).limit(1);
        updatedProduct = row;
      }

      let skuRows: typeof productSkus.$inferSelect[] = [];
      if (dto.skus !== undefined) {
        await tx.delete(productSkus).where(eq(productSkus.productId, id));

        if (dto.skus.length > 0) {
          const skuValues = dto.skus.map((sku) => ({
            productId: id,
            color: sku.color,
            size: sku.size,
            stock: sku.stock,
            createdBy: userId,
            updatedBy: userId,
          }));
          skuRows = await tx
            .insert(productSkus)
            .values(skuValues)
            .returning();
        }
      } else {
        skuRows = await tx.select().from(productSkus).where(eq(productSkus.productId, id));
      }

      return { product: updatedProduct, skus: skuRows };
    });

    const product = this.mapProduct(result.product);
    product.skus = result.skus.map((row) => this.mapSku(row));

    this.logger.log(`商品更新成功: id=${id}`);
    return product;
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const deleted = await this.db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });

    if (deleted.length === 0) {
      throw new NotFoundException('商品不存在');
    }

    this.logger.log(`商品删除成功: id=${id}`);
    return { success: true };
  }

  async updateSkuStock(
    productId: string,
    skuId: string,
    stock: number,
    userId: string,
  ): Promise<ProductSku> {
    // 确认商品存在
    const product = await this.db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (product.length === 0) {
      throw new NotFoundException('商品不存在');
    }

    const updated = await this.db
      .update(productSkus)
      .set({ stock, updatedAt: new Date(), updatedBy: userId })
      .where(and(eq(productSkus.id, skuId), eq(productSkus.productId, productId)))
      .returning();

    if (updated.length === 0) {
      throw new NotFoundException('SKU 不存在');
    }

    this.logger.log(`SKU 库存更新成功: skuId=${skuId}, stock=${stock}`);
    return this.mapSku(updated[0]);
  }
}
