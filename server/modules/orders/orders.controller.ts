import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';
import type {
  CreateOrderRequest,
  Order,
  OrderExportData,
  OrderListQuery,
  OrderListResponse,
  UpdateOrderStatusRequest,
} from '@shared/api.interface';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * 提交订货单（公开接口，允许匿名访问）
   */
  @Post()
  async create(@Body() dto: CreateOrderRequest): Promise<Order> {
    return this.ordersService.create(dto);
  }

  /**
   * 订单列表（管理端，需登录）
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async findList(@Query() query: OrderListQuery): Promise<OrderListResponse> {
    const page = query.page !== undefined ? Number(query.page) : 1;
    const pageSize = query.pageSize !== undefined ? Number(query.pageSize) : 20;
    return this.ordersService.findList({
      page,
      pageSize,
      status: query.status,
      keyword: query.keyword,
    });
  }

  /**
   * 获取单条订单导出数据（管理端，需登录）
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/export-data')
  async getExportData(@Param('id') id: string): Promise<OrderExportData> {
    return this.ordersService.getExportData(id);
  }

  /**
   * 订单详情（管理端，需登录）
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  /**
   * 更新订单状态（管理端，需登录）
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusRequest,
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, dto.status);
  }
}
