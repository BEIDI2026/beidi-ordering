import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductsService } from './products.service';
import type {
  Product,
  ProductListResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductSku,
  UpdateSkuStockRequest,
} from '@shared/api.interface';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 公开接口：商品列表
  @Get()
  async findList(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('series') series?: string,
    @Query('keyword') keyword?: string,
  ): Promise<ProductListResponse> {
    return this.productsService.findList({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      series,
      keyword,
    });
  }

  // 公开接口：商品详情
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Product> {
    return this.productsService.findById(id);
  }

  // 管理端：新增商品
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: { user: { username: string } },
    @Body() dto: CreateProductRequest,
  ): Promise<Product> {
    const { username } = req.user;
    return this.productsService.create(dto, `admin:${username}`);
  }

  // 管理端：更新商品
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: { user: { username: string } },
    @Param('id') id: string,
    @Body() dto: UpdateProductRequest,
  ): Promise<Product> {
    const { username } = req.user;
    return this.productsService.update(id, dto, `admin:${username}`);
  }

  // 管理端：删除商品
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.productsService.remove(id);
  }

  // 管理端：调整 SKU 库存
  @UseGuards(JwtAuthGuard)
  @Patch(':id/skus/:skuId/stock')
  async updateSkuStock(
    @Req() req: { user: { username: string } },
    @Param('id') id: string,
    @Param('skuId') skuId: string,
    @Body() dto: UpdateSkuStockRequest,
  ): Promise<ProductSku> {
    const { username } = req.user;
    return this.productsService.updateSkuStock(id, skuId, dto.stock, `admin:${username}`);
  }
}
