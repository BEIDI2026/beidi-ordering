import type {
  Order,
  OrderListQuery,
  OrderListResponse,
  CreateOrderRequest,
} from '@shared/api.interface';

import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';

export async function createOrder(
  data: CreateOrderRequest,
): Promise<Order> {
  try {
    const response = await axiosForBackend.post<Order>('/api/orders', data);
    return response.data;
  } catch (error: unknown) {
    logger.error(`[ordersApi.createOrder] failed: ${String(error)}`);
    throw error;
  }
}

export async function getOrders(
  params: OrderListQuery,
): Promise<OrderListResponse> {
  try {
    const { data } = await axiosForBackend.get<OrderListResponse>(
      '/api/orders',
      { params },
    );
    return data;
  } catch (error: unknown) {
    logger.error(`[ordersApi.getOrders] failed: ${String(error)}`);
    throw error;
  }
}

export async function getOrder(id: string): Promise<Order> {
  try {
    const { data } = await axiosForBackend.get<Order>(`/api/orders/${id}`);
    return data;
  } catch (error: unknown) {
    logger.error(`[ordersApi.getOrder] failed for id=${id}: ${String(error)}`);
    throw error;
  }
}

export async function updateOrderStatus(
  id: string,
  status: string,
): Promise<Order> {
  try {
    const { data } = await axiosForBackend.patch<Order>(
      `/api/orders/${id}/status`,
      { status },
    );
    return data;
  } catch (error: unknown) {
    logger.error(
      `[ordersApi.updateOrderStatus] failed for id=${id}: ${String(error)}`,
    );
    throw error;
  }
}

export async function getOrderExportData(id: string): Promise<any> {
  try {
    const { data } = await axiosForBackend.get(
      `/api/orders/${id}/export-data`,
    );
    return data;
  } catch (error: unknown) {
    logger.error(
      `[ordersApi.getOrderExportData] failed for id=${id}: ${String(error)}`,
    );
    throw error;
  }
}
