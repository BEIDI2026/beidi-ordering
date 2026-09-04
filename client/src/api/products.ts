import type {
  Product,
  ProductListQuery,
  ProductListResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductSku,
} from '@shared/api.interface';

import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';

export async function getProducts(
  params: ProductListQuery,
): Promise<ProductListResponse> {
  try {
    const { data } = await axiosForBackend.get<ProductListResponse>(
      '/api/products',
      { params },
    );
    return data;
  } catch (error: unknown) {
    logger.error(`[productsApi.getProducts] failed: ${String(error)}`);
    throw error;
  }
}

export async function getProduct(id: string): Promise<Product> {
  try {
    const { data } = await axiosForBackend.get<Product>(`/api/products/${id}`);
    return data;
  } catch (error: unknown) {
    logger.error(`[productsApi.getProduct] failed for id=${id}: ${String(error)}`);
    throw error;
  }
}

export async function createProduct(
  data: CreateProductRequest,
): Promise<Product> {
  try {
    const response = await axiosForBackend.post<Product>(
      '/api/products',
      data,
    );
    return response.data;
  } catch (error: unknown) {
    logger.error(`[productsApi.createProduct] failed: ${String(error)}`);
    throw error;
  }
}

export async function updateProduct(
  id: string,
  data: UpdateProductRequest,
): Promise<Product> {
  try {
    const response = await axiosForBackend.patch<Product>(
      `/api/products/${id}`,
      data,
    );
    return response.data;
  } catch (error: unknown) {
    logger.error(
      `[productsApi.updateProduct] failed for id=${id}: ${String(error)}`,
    );
    throw error;
  }
}

export async function deleteProduct(
  id: string,
): Promise<{ success: boolean }> {
  try {
    await axiosForBackend.delete(`/api/products/${id}`);
    return { success: true };
  } catch (error: unknown) {
    logger.error(
      `[productsApi.deleteProduct] failed for id=${id}: ${String(error)}`,
    );
    throw error;
  }
}

export async function updateSkuStock(
  productId: string,
  skuId: string,
  stock: number,
): Promise<ProductSku> {
  try {
    const { data } = await axiosForBackend.patch<ProductSku>(
      `/api/products/${productId}/skus/${skuId}/stock`,
      { stock },
    );
    return data;
  } catch (error: unknown) {
    logger.error(
      `[productsApi.updateSkuStock] failed for productId=${productId}, skuId=${skuId}: ${String(error)}`,
    );
    throw error;
  }
}
