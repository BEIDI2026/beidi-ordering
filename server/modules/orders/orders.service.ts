import { Inject, Injectable, Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { eq, and, or, like, desc, sql, inArray } from 'drizzle-orm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateOrderRequest,
  Order,
  OrderItem,
  OrderListQuery,
  OrderListResponse,
  OrderExportData,
} from '@shared/api.interface';
import { orders, orderItems, products, productSkus } from '@server/database/schema';

type OrderSelect = typeof orders.$inferSelect;
type OrderItemSelect = typeof orderItems.$inferSelect;
type ProductSelect = typeof products.$inferSelect;
type ProductSkuSelect = typeof productSkus.$inferSelect;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async create(dto: CreateOrderRequest): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('订单商品不能为空');
    }

    const productIds: string[] = dto.items.map((item) => item.productId);

    // 批量查询商品信息
    const productList: ProductSelect[] = await this.db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    const productMap = new Map<string, ProductSelect>();
    for (const p of productList) {
      productMap.set(p.id, p);
    }

    // 批量查询 SKU 库存
    const skuConditions = dto.items.map((item) =>
      and(
        eq(productSkus.productId, item.productId),
        eq(productSkus.color, item.color),
        eq(productSkus.size, item.size),
      ),
    );

    const skuList: ProductSkuSelect[] = await this.db
      .select()
      .from(productSkus)
      .where(or(...skuConditions));

    const skuKey = (productId: string, color: string, size: string): string =>
      `${productId}|${color}|${size}`;

    const skuMap = new Map<string, ProductSkuSelect>();
    for (const sku of skuList) {
      skuMap.set(skuKey(sku.productId, sku.color, sku.size), sku);
    }

    // 校验库存与商品存在性
    for (const item of dto.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException(
          `商品不存在: productId=${item.productId}`,
        );
      }
      const sku = skuMap.get(skuKey(item.productId, item.color, item.size));
      if (!sku) {
        throw new BadRequestException(
          `SKU 不存在: 款号 ${product.styleNo} / ${item.color} / ${item.size}`,
        );
      }
      if (sku.stock < item.quantity) {
        throw new ConflictException(
          `库存不足: 款号 ${product.styleNo} / ${item.color} / ${item.size}，当前库存 ${sku.stock}，请求 ${item.quantity}`,
        );
      }
    }

    // 计算汇总
    let totalQty = 0;
    let totalAmountNum = 0;

    const orderItemRows: Array<{
      productId: string;
      styleNo: string;
      productName: string;
      color: string;
      size: string;
      quantity: number;
      unitPrice: string;
      subtotal: string;
    }> = [];

    for (const item of dto.items) {
      const product = productMap.get(item.productId)!;
      const unitPrice = String(product.price);
      const subtotalNum = item.quantity * Number(unitPrice);
      const subtotal = subtotalNum.toFixed(2);

      totalQty += item.quantity;
      totalAmountNum += subtotalNum;

      orderItemRows.push({
        productId: item.productId,
        styleNo: product.styleNo,
        productName: product.name,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });
    }

    const totalAmount = totalAmountNum.toFixed(2);
    const orderNo = this.generateOrderNo();

    // 事务：创建订单 + 订单项 + 扣减库存
    const result = await this.db.transaction(async (tx) => {
      const [insertedOrder] = await tx
        .insert(orders)
        .values({
          orderNo,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerWechat: dto.customerWechat,
          customerCompany: dto.customerCompany,
          remark: dto.remark ?? '',
          status: 'pending',
          totalQty,
          totalAmount,
        })
        .returning();

      const insertedItems = await tx
        .insert(orderItems)
        .values(
          orderItemRows.map((row) => ({
            orderId: insertedOrder.id,
            productId: row.productId,
            styleNo: row.styleNo,
            productName: row.productName,
            color: row.color,
            size: row.size,
            quantity: row.quantity,
            unitPrice: row.unitPrice,
            subtotal: row.subtotal,
          })),
        )
        .returning();

      // 原子扣减库存
      for (const item of orderItemRows) {
        const updated = await tx
          .update(productSkus)
          .set({ stock: sql<number>`${productSkus.stock} - ${item.quantity}` })
          .where(
            and(
              eq(productSkus.productId, item.productId),
              eq(productSkus.color, item.color),
              eq(productSkus.size, item.size),
            ),
          )
          .returning({ id: productSkus.id });

        if (updated.length === 0) {
          throw new ConflictException(
            `库存扣减失败: 款号 ${item.styleNo} / ${item.color} / ${item.size}`,
          );
        }
      }

      return { order: insertedOrder, items: insertedItems };
    });

    this.logger.log(`订单创建成功: orderNo=${orderNo}, totalQty=${totalQty}, totalAmount=${totalAmount}`);

    return this.mapOrder(result.order, result.items);
  }

  async findList(query: OrderListQuery): Promise<OrderListResponse> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (query.status) {
      conditions.push(eq(orders.status, query.status));
    }
    if (query.keyword) {
      const kw = `%${query.keyword}%`;
      conditions.push(
        or(
          like(orders.orderNo, kw),
          like(orders.customerName, kw),
          like(orders.customerCompany, kw),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [listResult, countResult] = await Promise.all([
      this.db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(pageSize)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(whereClause),
    ]);

    const total = Number(countResult[0]?.count ?? 0);

    const items: Order[] = listResult.map((row) => this.mapOrder(row, []));

    return { items, total, page, pageSize };
  }

  async findOne(id: string): Promise<Order> {
    const orderRows: OrderSelect[] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (orderRows.length === 0) {
      throw new NotFoundException('订单不存在');
    }

    const itemRows: OrderItemSelect[] = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id))
      .orderBy(orderItems.id);

    return this.mapOrder(orderRows[0], itemRows);
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const validStatuses = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`无效的订单状态: ${status}`);
    }

    const updated = await this.db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();

    if (updated.length === 0) {
      throw new NotFoundException('订单不存在');
    }

    this.logger.log(`订单状态更新: id=${id}, status=${status}`);

    return this.mapOrder(updated[0], []);
  }

  async getExportData(id: string): Promise<OrderExportData> {
    const order = await this.findOne(id);
    return {
      orderNo: order.orderNo,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerWechat: order.customerWechat,
      customerCompany: order.customerCompany,
      remark: order.remark,
      status: order.status,
      totalQty: order.totalQty,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: (order.items ?? []).map((item) => ({
        styleNo: item.styleNo,
        productName: item.productName,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
    };
  }

  private generateOrderNo(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePart = `${yyyy}${mm}${dd}`;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let random = '';
    for (let i = 0; i < 6; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `ORD${datePart}${random}`;
  }

  private mapOrder(order: OrderSelect, items: OrderItemSelect[]): Order {
    return {
      id: order.id,
      orderNo: order.orderNo,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerWechat: order.customerWechat,
      customerCompany: order.customerCompany,
      remark: order.remark,
      status: order.status,
      totalQty: order.totalQty,
      totalAmount: String(order.totalAmount),
      createdAt: order.createdAt.toISOString(),
      items: items.map((item): OrderItem => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        styleNo: item.styleNo,
        productName: item.productName,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        subtotal: String(item.subtotal),
      })),
    };
  }
}
