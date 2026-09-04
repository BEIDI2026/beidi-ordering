import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  Shield,
  Feather,
  Factory,
  Sparkles,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
  Building2,
  Shirt,
  BedDouble,
  Dumbbell,
  MapPin,
  Phone,
  Mail,
  Award,
} from 'lucide-react';

import { Button } from '@client/src/components/ui/button';
import { Image } from '@client/src/components/ui/image';
import { useCartContext } from '@client/src/contexts/CartContext';
import { useSiteConfig } from '@client/src/contexts/SiteConfigContext';
import { productsApi } from '@client/src/api';
import type { Product } from '@shared/api.interface';
import { logger } from '@lark-apaas/client-toolkit/logger';

const HERO_IMAGE = 'https://aka.doubaocdn.com/s/L7Ri2NXias';
const OFFICE_IMAGE = 'https://aka.doubaocdn.com/s/noaFF2imJC';
const FACTORY_HERO_IMAGE = 'https://aka.doubaocdn.com/s/L7Ri2NXias';

const factoryPhotos = [
  { src: 'https://aka.doubaocdn.com/s/jrcDVsoP9W', alt: '生产车间实景' },
  { src: 'https://aka.doubaocdn.com/s/VWh6aC8RwL', alt: '自动模板机' },
  { src: 'https://aka.doubaocdn.com/s/XJTWNpCVGg', alt: '自动充绒机' },
  { src: 'https://aka.doubaocdn.com/s/48vHIDrONy', alt: '成品包装车间' },
];

const stats = [
  { value: '30年', label: '专业羽绒服制造经验' },
  { value: '300万件', label: '年产能（新厂投产后）' },
  { value: '500+', label: '员工' },
];

const factoryHighlights = [
  {
    icon: Building2,
    title: '办公楼',
    desc: '占地3000㎡，含展厅、样衣间、会议室、财务室',
  },
  {
    icon: Factory,
    title: '生产车间',
    desc: '平层18500㎡，40条流水线，1700名工人，1000台平缝机',
  },
  {
    icon: Feather,
    title: '自动充绒机',
    desc: '30台自动充绒机，充绒精准高效',
  },
  {
    icon: Shirt,
    title: '自动模板机',
    desc: '100台模板设备，工艺标准化',
  },
  {
    icon: BedDouble,
    title: '生活建筑',
    desc: '四层4000㎡，员工食堂+工人宿舍',
  },
  {
    icon: Dumbbell,
    title: '运动场馆',
    desc: '1000㎡，篮球/羽毛球/乒乓球',
  },
];

const features = [
  {
    icon: Shield,
    title: '五防面料',
    desc: '防风、防水、防油、防污、防静电，一衣多穿无惧挑战。',
  },
  {
    icon: Feather,
    title: '90绒子含量',
    desc: '精选高品质羽绒，蓬松度高，保暖性强，轻盈舒适。',
  },
  {
    icon: Award,
    title: '严苛品控',
    desc: 'ISO9001质量体系认证，36道工序层层检验，全程可追溯。',
  },
  {
    icon: Factory,
    title: '实力工厂',
    desc: '30年制衣经验，500+员工，百万件年产能，李宁等品牌代工合作。',
  },
];

const contactCards = [
  {
    title: '北京丰昌北迪服装有限公司',
    address: '北京市朝阳区雅宝路华声国际大厦701室',
  },
  {
    title: '杭州丰昌北迪服装科技有限公司',
    address: '浙江省杭州市临平区艺尚创谷中心24幢1单元802室',
  },
  {
    title: '秦皇岛丰昌制衣有限公司（工厂）',
    address: '河北省秦皇岛市昌黎县泥井镇才庄村',
  },
];

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { addItem } = useCartContext();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.skus || product.skus.length === 0) return;
    const firstSku = product.skus[0];
    addItem({
      productId: product.id,
      styleNo: product.styleNo,
      productName: product.name,
      color: firstSku.color,
      size: firstSku.size,
      quantity: 1,
      unitPrice: product.price,
      image: product.images?.[0],
    });
  };

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-lg border border-[hsl(30_10%_88%)] bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {/* 图片 */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-[hsl(30_10%_92%)]"
      >
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[hsl(25_8%_50%)]">
            暂无图片
          </div>
        )}
      </div>
      {/* 信息 */}
      <div className="p-4">
        <p
          className="text-xs tracking-wider"
          style={{ color: 'hsl(25 8% 50%)' }}
        >
          {product.styleNo}
        </p>
        <h3
          className="mt-1 line-clamp-1 text-base font-medium leading-snug"
          style={{ color: 'hsl(20 15% 15%)' }}
        >
          {product.name}
        </h3>
        <div className="mt-3 flex items-center justify-between">
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ color: 'hsl(350 30% 45%)' }}
          >
            ¥{product.price}
          </span>
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(30_10%_88%)] transition-all duration-300 hover:scale-110"
            style={{
              backgroundColor: 'hsl(40 15% 97%)',
              color: 'hsl(20 30% 25%)',
            }}
            aria-label="加入订货单"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-[hsl(30_10%_88%)] bg-white">
      <div className="aspect-[3/4] w-full animate-pulse bg-[hsl(30_10%_92%)]" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-[hsl(30_10%_92%)]" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-[hsl(30_10%_88%)]" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-[hsl(30_10%_92%)]" />
      </div>
    </div>
  );
}

const HomePage = () => {
  const { config } = useSiteConfig();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await productsApi.getProducts({ pageSize: 4 });
        if (mounted) setProducts(data.items);
      } catch (error: unknown) {
        logger.error(`[HomePage] fetch products failed: ${String(error)}`);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const scrollToAbout = () => {
    const el = document.getElementById('about');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'hsl(40 15% 97%)' }}
    >
      {/* ===== Hero 区 ===== */}
      <section className="relative h-[85vh] min-h-[560px] w-full overflow-hidden">
        {/* 背景图 */}
        <div className="absolute inset-0">
          <Image
            src={config.heroImage}
            alt="北迪 BEIDI 新厂全景"
            className="h-full w-full object-cover"
          />
          {/* 半透明蒙层 */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(20,15,10,0.75) 0%, rgba(20,15,10,0.45) 50%, rgba(20,15,10,0.25) 100%)',
            }}
          />
        </div>

        {/* 内容 */}
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 md:px-8">
          <div className="max-w-xl text-white">
            <p
              className="text-sm font-medium tracking-[0.3em] uppercase"
              style={{ color: 'hsl(40 60% 55%)' }}
            >
              {config.brandName}
            </p>
            <h1 className="mt-3 text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              {config.heroTitle}
            </h1>
            <p
              className="mt-4 text-lg font-medium"
              style={{ color: 'hsl(40 20% 96%)' }}
            >
              {config.heroSubtitle}
            </p>
            <p
              className="mt-3 text-sm leading-relaxed opacity-80 md:text-base"
              style={{ color: 'hsl(30 10% 85%)' }}
            >
              高端女装羽绒服 · 2025冬季新款
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products">
                <Button
                  size="lg"
                  className="rounded-full"
                  style={{
                    backgroundColor: 'hsl(40 60% 55%)',
                    color: 'hsl(20 30% 25%)',
                    border: 'none',
                  }}
                >
                  浏览新款
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={scrollToAbout}
                className="rounded-full border-white/60 bg-transparent text-white hover:bg-white/10"
              >
                了解品牌
              </Button>
            </div>
          </div>
        </div>

        {/* 底部渐变过渡 */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{
            background:
              'linear-gradient(to top, hsl(40 15% 97%), transparent)',
          }}
        />
      </section>

      {/* ===== 公司介绍区 ===== */}
      <section
        id="about"
        className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24"
      >
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          {/* 左侧图片 */}
          <div className="relative">
            <div
              className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-[hsl(30_10%_92%)] shadow-lg"
            >
              <Image
                src={OFFICE_IMAGE}
                alt="丰昌制衣办公楼"
                className="h-full w-full object-cover"
              />
            </div>
            {/* 金色装饰方块 */}
            <div
              className="absolute -bottom-4 -right-4 h-20 w-20 rounded-lg md:-bottom-6 md:-right-6 md:h-24 md:w-24"
              style={{ backgroundColor: 'hsl(40 60% 55%)', opacity: 0.2 }}
            />
          </div>

          {/* 右侧文字 */}
          <div>
            <p
              className="text-xs font-medium tracking-[0.25em] uppercase"
              style={{ color: 'hsl(40 60% 55%)' }}
            >
              ABOUT FENGCHANG
            </p>
            <h2
              className="mt-2 text-3xl font-semibold leading-tight tracking-tight md:text-4xl"
              style={{ color: 'hsl(20 30% 25%)' }}
            >
              关于丰昌制衣
            </h2>

            <div
              className="mt-6 space-y-4 text-base leading-relaxed"
              style={{ color: 'hsl(20 15% 35%)' }}
            >
              {config.companyIntro.split('\n').filter(Boolean).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* 数据卡片 */}
            <div className="mt-8 grid grid-cols-3 gap-3 md:gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-[hsl(30_10%_88%)] bg-white p-4 text-center md:p-5"
                >
                  <p
                    className="text-2xl font-semibold leading-tight tracking-tight md:text-3xl"
                    style={{ color: 'hsl(20 30% 25%)' }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="mt-1 text-xs leading-relaxed md:text-sm"
                    style={{ color: 'hsl(25 8% 50%)' }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 新厂宣传区 ===== */}
      <section
        id="factory"
        className="py-16 md:py-24"
        style={{ backgroundColor: 'hsl(40 15% 97%)' }}
      >
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="text-center">
            <p
              className="text-xs font-medium tracking-[0.25em] uppercase"
              style={{ color: 'hsl(40 60% 55%)' }}
            >
              NEW FACTORY
            </p>
            <h2
              className="mt-2 text-3xl font-semibold leading-tight tracking-tight md:text-4xl"
              style={{ color: 'hsl(20 30% 25%)' }}
            >
              新厂规划 · 实力见证
            </h2>
            <p
              className="mx-auto mt-3 max-w-xl text-sm leading-relaxed md:text-base"
              style={{ color: 'hsl(25 8% 50%)' }}
            >
              {config.factoryIntro}
            </p>
          </div>

          {/* 新厂全景大图 */}
          <div
            className="mt-10 overflow-hidden rounded-xl shadow-lg"
            style={{ backgroundColor: 'hsl(30 10% 92%)' }}
          >
            <Image
              src={FACTORY_HERO_IMAGE}
              alt="新厂全景概念图"
              className="aspect-[21/9] w-full object-cover"
            />
          </div>

          {/* 6个亮点卡片 */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {factoryHighlights.map((item) => (
              <div
                key={item.title}
                data-ai-section-type="card"
                className="rounded-xl border border-[hsl(30_10%_88%)] bg-white p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'hsl(40 60% 92%)' }}
                >
                  <item.icon
                    className="h-6 w-6"
                    style={{ color: 'hsl(40 60% 55%)' }}
                  />
                </div>
                <h3
                  className="mt-4 text-lg font-semibold leading-snug"
                  style={{ color: 'hsl(20 30% 25%)' }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: 'hsl(25 8% 50%)' }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* 工厂实景小图展示区 */}
          <div className="mt-12">
            <h3
              className="text-center text-xl font-semibold leading-snug"
              style={{ color: 'hsl(20 30% 25%)' }}
            >
              工厂实景
            </h3>
            <p
              className="mx-auto mt-2 text-center text-sm"
              style={{ color: 'hsl(25 8% 50%)' }}
            >
              真实车间 · 匠心制造
            </p>
            <div
              data-ai-section-type="card-list"
              className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
            >
              {factoryPhotos.map((photo) => (
                <div
                  key={photo.alt}
                  className="group overflow-hidden rounded-lg border border-[hsl(30_10%_88%)] bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md"
                >
                  <div
                    className="aspect-square w-full overflow-hidden"
                    style={{ backgroundColor: 'hsl(30 10% 92%)' }}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3 text-center">
                    <p
                      className="text-xs font-medium"
                      style={{ color: 'hsl(20 15% 35%)' }}
                    >
                      {photo.alt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 特色优势区 ===== */}
      <section
        className="py-16 md:py-24"
        style={{ backgroundColor: 'hsl(30 10% 92%)' }}
      >
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="text-center">
            <p
              className="text-xs font-medium tracking-[0.25em] uppercase"
              style={{ color: 'hsl(40 60% 55%)' }}
            >
              WHY BEIDI
            </p>
            <h2
              className="mt-2 text-3xl font-semibold leading-tight tracking-tight md:text-4xl"
              style={{ color: 'hsl(20 30% 25%)' }}
            >
              品牌优势
            </h2>
            <p
              className="mx-auto mt-3 max-w-xl text-sm leading-relaxed md:text-base"
              style={{ color: 'hsl(25 8% 50%)' }}
            >
              三十年专注品质，以匠心打造每一件羽绒服
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                data-ai-section-type="card"
                className="rounded-xl border border-[hsl(30_10%_88%)] bg-white p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md md:p-8"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'hsl(40 60% 92%)' }}
                >
                  <feature.icon
                    className="h-6 w-6"
                    style={{ color: 'hsl(40 60% 55%)' }}
                  />
                </div>
                <h3
                  className="mt-4 text-lg font-semibold leading-snug"
                  style={{ color: 'hsl(20 30% 25%)' }}
                >
                  {feature.title}
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: 'hsl(25 8% 50%)' }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 新款预览区 ===== */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <div className="flex items-end justify-between">
          <div>
            <p
              className="text-xs font-medium tracking-[0.25em] uppercase"
              style={{ color: 'hsl(40 60% 55%)' }}
            >
              NEW ARRIVAL
            </p>
            <h2
              className="mt-2 text-3xl font-semibold leading-tight tracking-tight md:text-4xl"
              style={{ color: 'hsl(20 30% 25%)' }}
            >
              精选新款
            </h2>
          </div>
          <Link
            to="/products"
            className="group flex items-center gap-1 text-sm font-medium transition-all duration-300 hover:gap-2"
            style={{ color: 'hsl(20 30% 25%)' }}
          >
            查看全部
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div
          data-ai-section-type="card-list"
          className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            : products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </section>

      {/* ===== 联系我们 ===== */}
      <section
        id="contact"
        className="py-16 md:py-24"
        style={{ backgroundColor: 'hsl(20 30% 25%)' }}
      >
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="text-center">
            <p
              className="text-xs font-medium tracking-[0.25em] uppercase"
              style={{ color: 'hsl(40 60% 55%)' }}
            >
              CONTACT US
            </p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
              联系我们
            </h2>
            <p
              className="mx-auto mt-3 max-w-xl text-sm leading-relaxed md:text-base"
              style={{ color: 'hsl(30 10% 75%)' }}
            >
              欢迎渠道客户洽谈合作，我们期待与您携手共赢
            </p>
          </div>

          {/* 三个地址卡片 */}
          <div
            data-ai-section-type="card-list"
            className="mt-12 grid gap-6 md:grid-cols-3"
          >
            {[
              {
                title: '北京丰昌北迪服装有限公司',
                address: config.addressBeijing,
              },
              {
                title: '杭州丰昌北迪服装科技有限公司',
                address: config.addressHangzhou,
              },
              {
                title: '秦皇岛丰昌制衣有限公司（工厂）',
                address: config.addressFactory,
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-xl border p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg md:p-8"
                style={{
                  backgroundColor: 'hsla(0, 0%, 100%, 0.05)',
                  borderColor: 'hsla(40, 20%, 80%, 0.15)',
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'hsla(40, 60%, 55%, 0.15)' }}
                >
                  <MapPin
                    className="h-6 w-6"
                    style={{ color: 'hsl(40 60% 55%)' }}
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug text-white">
                  {card.title}
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: 'hsl(30 10% 75%)' }}
                >
                  {card.address}
                </p>
              </div>
            ))}
          </div>

          {/* 联系方式 */}
          <div
            className="mt-12 flex flex-col items-center justify-center gap-6 rounded-xl border p-8 text-center md:flex-row md:gap-12 md:p-10"
            style={{
              backgroundColor: 'hsla(0, 0%, 100%, 0.03)',
              borderColor: 'hsla(40, 20%, 80%, 0.12)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: 'hsla(40, 60%, 55%, 0.15)' }}
              >
                <Phone
                  className="h-5 w-5"
                  style={{ color: 'hsl(40 60% 55%)' }}
                />
              </div>
              <div className="text-left">
                <p
                  className="text-xs"
                  style={{ color: 'hsl(25 8% 60%)' }}
                >
                  联系电话
                </p>
                <p className="text-sm font-medium text-white">
                  {config.contactPhone} / {config.contactPerson}
                </p>
              </div>
            </div>
            <div
              className="hidden h-10 w-px md:block"
              style={{ backgroundColor: 'hsla(40, 20%, 80%, 0.2)' }}
            />
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: 'hsla(40, 60%, 55%, 0.15)' }}
              >
                <Mail
                  className="h-5 w-5"
                  style={{ color: 'hsl(40 60% 55%)' }}
                />
              </div>
              <div className="text-left">
                <p
                  className="text-xs"
                  style={{ color: 'hsl(25 8% 60%)' }}
                >
                  邮箱
                </p>
                <p className="text-sm font-medium text-white">
                  {config.contactEmail}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
