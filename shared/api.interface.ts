export interface ProductSku {
  id: string;
  productId: string;
  color: string;
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  styleNo: string;
  name: string;
  description: string;
  price: string;
  colors: string[];
  sizes: string[];
  series: string;
  season: string;
  images: string[];
  status: string;
  skus?: ProductSku[];
  totalStock?: number;
}

export interface ProductListQuery {
  page?: number;
  pageSize?: number;
  series?: string;
  keyword?: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateProductRequest {
  styleNo: string;
  name: string;
  description: string;
  price: number;
  colors: string[];
  sizes: string[];
  series: string;
  season: string;
  images: string[];
  skus: Array<{ color: string; size: string; stock: number }>;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  colors?: string[];
  sizes?: string[];
  series?: string;
  season?: string;
  images?: string[];
  status?: string;
  skus?: Array<{ color: string; size: string; stock: number }>;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  styleNo: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}

export interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  customerWechat: string;
  customerCompany: string;
  remark: string;
  status: string;
  totalQty: number;
  totalAmount: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface CreateOrderItemRequest {
  productId: string;
  color: string;
  size: string;
  quantity: number;
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  customerWechat: string;
  customerCompany: string;
  remark?: string;
  items: CreateOrderItemRequest[];
}

export interface OrderListQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
}

export interface OrderListResponse {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

export interface OrderExportData {
  orderNo: string;
  customerName: string;
  customerPhone: string;
  customerWechat: string;
  customerCompany: string;
  remark: string;
  status: string;
  totalQty: number;
  totalAmount: string;
  createdAt: string;
  items: Array<{
    styleNo: string;
    productName: string;
    color: string;
    size: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }>;
}

export interface SiteConfig {
  key: string;
  value: string;
}

export interface SiteConfigMap {
  brandName: string;
  brandSlogan: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  companyIntro: string;
  factoryIntro: string;
  contactPhone: string;
  contactPerson: string;
  contactEmail: string;
  addressBeijing: string;
  addressHangzhou: string;
  addressFactory: string;
}

export interface UpdateSiteConfigRequest {
  brandName?: string;
  brandSlogan?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  companyIntro?: string;
  factoryIntro?: string;
  contactPhone?: string;
  contactPerson?: string;
  contactEmail?: string;
  addressBeijing?: string;
  addressHangzhou?: string;
  addressFactory?: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  username: string;
}

export interface AdminUser {
  username: string;
}

export interface UpdateSkuStockRequest {
  stock: number;
}
