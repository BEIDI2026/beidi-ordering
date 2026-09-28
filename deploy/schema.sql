CREATE EXTENSION IF NOT EXISTS "pgcrypto";
DO $$ BEGIN
  CREATE TYPE user_profile AS (user_id text);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_no VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  colors TEXT[] NOT NULL DEFAULT '{}',
  sizes TEXT[] NOT NULL DEFAULT '{}',
  series VARCHAR(100) NOT NULL DEFAULT '',
  season VARCHAR(50) NOT NULL DEFAULT '',
  images TEXT[] NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  _created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _created_by user_profile,
  _updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _updated_by user_profile
);
CREATE INDEX IF NOT EXISTS idx_products_style_no ON products(style_no);
CREATE INDEX IF NOT EXISTS idx_products_series ON products(series);

CREATE TABLE IF NOT EXISTS product_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color VARCHAR(50) NOT NULL,
  size VARCHAR(20) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  _created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _created_by user_profile,
  _updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _updated_by user_profile,
  UNIQUE(product_id, color, size)
);
CREATE INDEX IF NOT EXISTS idx_skus_product_id ON product_skus(product_id);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_wechat VARCHAR(100) NOT NULL,
  customer_company VARCHAR(255) NOT NULL,
  remark TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  total_qty INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  _created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _created_by user_profile,
  _updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _updated_by user_profile
);
CREATE UNIQUE INDEX IF NOT EXISTS orders_order_no_key ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  style_no VARCHAR(50) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  color VARCHAR(50) NOT NULL,
  size VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  _created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _created_by user_profile,
  _updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _updated_by user_profile
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

CREATE TABLE IF NOT EXISTS site_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value TEXT NOT NULL DEFAULT '',
  _created_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _created_by user_profile,
  _updated_at TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _updated_by user_profile
);
CREATE UNIQUE INDEX IF NOT EXISTS site_configs_config_key_key ON site_configs(config_key);

INSERT INTO site_configs (config_key, config_value) VALUES
('brand_name', 'BEIDI 北迪'),
('brand_slogan', '诚实经营 · 道德经商 · 制造经典 · 创造完美'),
('hero_title', '匠心羽绒 · 优雅随行'),
('hero_subtitle', '30年专业制造，北迪2025冬季新品系列'),
('hero_image', 'https://aka.doubaocdn.com/s/L7Ri2NXias'),
('company_intro', '公司创建于1996年，是一家集生产、销售为一体的现代化企业。旗下品牌"北迪"享誉国内外，主要生产羽绒服、运动长裤、风衣、短裤等，选用优质梭织面料，具有良好的保暖透气性。公司已通过ISO9001质量管理体系认证，先后为李宁、Kappa、坦博尔、真维斯、班尼路等知名品牌提供代工合作。'),
('factory_intro', '2023年公司在昌黎经济开发区建设新厂，占地36630.96平方米，总投资1.25亿元，可容纳2000人就业，投产后年产能300万件。新厂配套包括办公楼3000平米、生产车间18500平米（40条流水线）、员工生活楼4000平米、运动场馆1000平米，并融入光伏项目实现绿色生产。'),
('contact_phone', '13601193150'),
('contact_person', '才宏伟 13910103896'),
('contact_email', 'fczycw@163.com'),
('address_beijing', '北京市朝阳区雅宝路华声国际大厦701室'),
('address_hangzhou', '浙江省杭州市临平区艺尚创谷中心24幢1单元802室'),
('address_factory', '河北省秦皇岛市昌黎县泥井镇才庄村')
ON CONFLICT (config_key) DO NOTHING;
