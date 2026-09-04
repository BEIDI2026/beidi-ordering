import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { productsApi } from '@client/src/api';
import type { Product } from '@shared/api.interface';
import { useCartContext } from '@client/src/contexts/CartContext';
import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { Badge } from '@client/src/components/ui/badge';
import { Skeleton } from '@client/src/components/ui/skeleton';
import { Image } from '@client/src/components/ui/image';

const SERIES_OPTIONS = [
  { value: '', label: '全部系列' },
  { value: '2025新款', label: '2025新款' },
];

const PAGE_SIZE = 9;

function getStockLabel(totalStock: number): { text: string; tone: string } {
  if (totalStock <= 0) return { text: '已售罄', tone: 'text-destructive' };
  if (totalStock < 30) return { text: '库存紧张', tone: 'text-amber-600' };
  return { text: '库存充足', tone: 'text-emerald-600' };
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const stockInfo = getStockLabel(product.totalStock ?? 0);

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer flex flex-col bg-card rounded-lg border border-border overflow-hidden shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-muted">
        <Image
          src={product.images?.[0] ?? ''}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <Badge
          variant="outline"
          className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium text-primary border-[hsl(40_60%_55%)/30]"
          style={{
            borderRadius: '9999px',
          }}
        >
          {product.series}
        </Badge>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <p className="text-xs text-muted-foreground tracking-wide">
          {product.styleNo}
        </p>
        <h3 className="text-base font-medium text-foreground leading-snug line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-semibold text-primary">
            ¥{product.price}
          </span>
          <span className={`text-xs ${stockInfo.tone}`}>{stockInfo.text}</span>
        </div>
        <Button
          onClick={handleAddClick}
          className="mt-1 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 text-sm"
          size="sm"
        >
          <ShoppingBag className="size-4" />
          加入订货单
        </Button>
      </div>
    </div>
  );
};

const ProductCardSkeleton: React.FC = () => (
  <div className="flex flex-col bg-card rounded-lg border border-border overflow-hidden">
    <Skeleton className="aspect-[3/4] w-full rounded-none" />
    <div className="p-4 flex flex-col gap-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-8 w-full rounded-full mt-1" />
    </div>
  </div>
);

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [series, setSeries] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { addItem } = useCartContext();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productsApi.getProducts({
        page,
        pageSize: PAGE_SIZE,
        series: series || undefined,
        keyword: debouncedKeyword || undefined,
      });
      setProducts(response.items);
      setTotal(response.total);
    } catch (err) {
      setError('加载商品失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [page, series, debouncedKeyword]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const handleSeriesChange = (value: string) => {
    setSeries(value);
    setPage(1);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      styleNo: product.styleNo,
      productName: product.name,
      color: product.colors?.[0] ?? '',
      size: product.sizes?.[0] ?? '',
      quantity: 1,
      unitPrice: product.price,
      image: product.images?.[0],
    });
    toast.success('已加入订货单', {
      description: `${product.name} 已添加到订货单`,
    });
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <p className="text-sm tracking-[0.3em] text-[hsl(40_60%_55%)] mb-3 font-medium">
            BEIDI 北迪 · 2025 NEW COLLECTION
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-3">
            2025 冬季新品
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
            经典时尚系列，精选五防面料，90绒子含量，
            <br className="hidden md:block" />
            以匠心工艺呈现高品质羽绒臻品。
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              系列：
            </span>
            <Select value={series} onValueChange={handleSeriesChange}>
              <SelectTrigger className="w-[180px] bg-card">
                <SelectValue placeholder="选择系列" />
              </SelectTrigger>
              <SelectContent>
                {SERIES_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索款号 / 名称"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
        </div>

        {/* Total count */}
        <p className="text-sm text-muted-foreground mb-4">
          共 <span className="font-medium text-foreground">{total}</span> 件商品
        </p>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchProducts} variant="outline" className="rounded-full">
              重新加载
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-2">暂无符合条件的商品</p>
            <p className="text-sm text-muted-foreground/70">
              试试调整筛选条件或搜索关键词
            </p>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              data-ai-section-type="card-list"
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={handlePrevPage}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <Button
                        key={p}
                        variant={p === page ? 'default' : 'ghost'}
                        size="sm"
                        className={`w-9 h-9 rounded-full ${
                          p === page
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ),
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={handleNextPage}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
