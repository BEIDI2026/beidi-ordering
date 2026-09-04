import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

import { productsApi } from '@client/src/api';
import type { Product, ProductSku } from '@shared/api.interface';
import { useCartContext } from '@client/src/contexts/CartContext';
import { Button } from '@client/src/components/ui/button';
import { Badge } from '@client/src/components/ui/badge';
import { Skeleton } from '@client/src/components/ui/skeleton';
import { Image } from '@client/src/components/ui/image';

function getTotalStock(skus: ProductSku[]): number {
  return skus.reduce((sum: number, sku: ProductSku) => sum + sku.stock, 0);
}

function getStockLabel(total: number): { text: string; tone: string } {
  if (total <= 0) return { text: '已售罄', tone: 'text-destructive' };
  if (total < 30) return { text: '库存紧张', tone: 'text-amber-600' };
  return { text: '库存充足', tone: 'text-emerald-600' };
}

const ProductDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (!id || id === ':id') {
      setError('无效的商品ID');
      setLoading(false);
      return;
    }
    let cancelled = false;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productsApi.getProduct(id);
        if (!cancelled) {
          setProduct(data);
          setSelectedColor(data.colors?.[0] ?? '');
          setSelectedSize('');
          setQuantity(1);
        }
      } catch (err) {
        if (!cancelled) setError('商品加载失败，请稍后重试');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const skus = product?.skus ?? [];

  const totalStock = useMemo(() => {
    if (!product) return 0;
    if (product.totalStock !== undefined) return product.totalStock;
    return getTotalStock(skus);
  }, [product, skus]);

  const stockInfo = getStockLabel(totalStock);

  // Stock for each size given selected color
  const sizeStockMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!selectedColor) return map;
    for (const sku of skus) {
      if (sku.color === selectedColor) {
        map.set(sku.size, sku.stock);
      }
    }
    return map;
  }, [selectedColor, skus]);

  const selectedSkuStock = selectedColor && selectedSize
    ? sizeStockMap.get(selectedSize) ?? 0
    : 0;

  const canAddToCart =
    !!selectedColor && !!selectedSize && quantity > 0 && selectedSkuStock > 0;

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedSize('');
    setQuantity(1);
  };

  const handleSizeSelect = (size: string) => {
    const stock = sizeStockMap.get(size) ?? 0;
    if (stock <= 0) return;
    setSelectedSize(size);
    if (quantity > stock) setQuantity(stock);
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncreaseQty = () => {
    if (quantity < selectedSkuStock) setQuantity(quantity + 1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setQuantity(1);
      return;
    }
    const clamped = Math.max(1, Math.min(val, selectedSkuStock || 999));
    setQuantity(clamped);
  };

  const handleAddToCart = () => {
    if (!product || !selectedColor || !selectedSize) return;
    addItem({
      productId: product.id,
      styleNo: product.styleNo,
      productName: product.name,
      color: selectedColor,
      size: selectedSize,
      quantity,
      unitPrice: product.price,
      image: product.images?.[0],
    });
    toast.success('已加入订货单', {
      description: `${product.name} · ${selectedColor} · ${selectedSize} × ${quantity}`,
    });
  };

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <div className="flex flex-col gap-4 pt-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full mt-4" />
              <Skeleton className="h-10 w-full mt-4" />
              <Skeleton className="h-10 w-full mt-2" />
              <Skeleton className="h-12 w-full rounded-full mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Error / Not found ----
  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <AlertTriangle className="size-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {error ? error : '商品不存在'}
          </h2>
          <p className="text-muted-foreground mb-6">
            请检查链接是否正确，或返回商品列表继续浏览
          </p>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => navigate('/products')}
          >
            <ArrowLeft className="size-4" />
            返回商品列表
          </Button>
        </div>
      </div>
    );
  }

  const mainImage = product.images?.[0] ?? '';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-14">
        {/* Back link */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          返回商品列表
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
          {/* Left: Image */}
          <div className="space-y-4">
            <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-muted shadow-sm">
              <Image
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    className="flex-shrink-0 w-20 h-24 rounded-md overflow-hidden border border-border hover:border-primary transition-colors"
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      width={80}
                      height={96}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground tracking-wide mb-2">
              款号：{product.styleNo}
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-3 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <Badge
                variant="outline"
                className="rounded-full text-xs font-normal border-[hsl(40_60%_55%)/40] text-[hsl(40_60%_55%)]"
              >
                {product.series}
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full text-xs font-normal"
              >
                {product.season}
              </Badge>
            </div>

            <div className="text-3xl md:text-4xl font-semibold text-primary mb-2">
              ¥{product.price}
            </div>

            <div className="flex items-center gap-2 mb-6 text-sm">
              <Package className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">库存总数：</span>
              <span className={`font-medium ${stockInfo.tone}`}>
                {stockInfo.text}（{totalStock} 件）
              </span>
            </div>

            <p className="text-foreground/80 leading-relaxed mb-8 text-sm md:text-base">
              {product.description}
            </p>

            <div className="border-t border-border pt-6 space-y-6">
              {/* Color selection */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">
                  颜色
                  <span className="text-muted-foreground font-normal ml-2">
                    {selectedColor || '请选择'}
                  </span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`
                        relative px-4 py-2 rounded-full border text-sm transition-all duration-200
                        ${
                          selectedColor === color
                            ? 'border-primary bg-primary/5 text-primary font-medium'
                            : 'border-border bg-card text-foreground hover:border-primary/50'
                        }
                      `}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size selection */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">
                  尺码
                  <span className="text-muted-foreground font-normal ml-2">
                    {selectedSize || '请选择'}
                  </span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size: string) => {
                    const stock = selectedColor
                      ? sizeStockMap.get(size) ?? 0
                      : -1;
                    const isSoldOut = selectedColor && stock <= 0;
                    const isSelected = selectedSize === size;

                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(size)}
                        disabled={isSoldOut}
                        className={`
                          relative min-w-[90px] px-4 py-2.5 rounded-md border text-sm transition-all duration-200 flex flex-col items-center gap-0.5
                          ${
                            isSoldOut
                              ? 'border-border bg-muted text-muted-foreground cursor-not-allowed line-through'
                              : isSelected
                                ? 'border-primary bg-primary/5 text-primary font-medium'
                                : 'border-border bg-card text-foreground hover:border-primary/50'
                          }
                        `}
                      >
                        <span className="font-medium">{size}</span>
                        {selectedColor && (
                          <span className="text-xs opacity-70">
                            {isSoldOut
                              ? '售罄'
                              : `库存: ${stock}`}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">数量</p>
                <div className="inline-flex items-center border border-border rounded-md overflow-hidden">
                  <button
                    onClick={handleDecreaseQty}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Minus className="size-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 h-10 text-center text-sm border-x border-border bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min={1}
                    max={selectedSkuStock || 999}
                  />
                  <button
                    onClick={handleIncreaseQty}
                    disabled={
                      !selectedSkuStock || quantity >= selectedSkuStock
                    }
                    className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                {selectedColor && selectedSize && (
                  <p className="text-xs text-muted-foreground mt-2">
                    当前 SKU 库存：{selectedSkuStock} 件
                  </p>
                )}
              </div>

              {/* Add to cart button */}
              <Button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 text-base font-medium"
                size="lg"
              >
                <ShoppingBag className="size-5" />
                {canAddToCart
                  ? '加入订货单'
                  : !selectedColor
                    ? '请选择颜色'
                    : !selectedSize
                      ? '请选择尺码'
                      : '该规格已售罄'}
              </Button>
            </div>

            {/* Bottom back link */}
            <div className="mt-auto pt-8">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-4" />
                继续选购其他商品
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
