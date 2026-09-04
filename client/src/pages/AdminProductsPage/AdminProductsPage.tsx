import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronRight,
  LayoutDashboard,
  X,
  LogOut,
} from 'lucide-react';
import ProtectedRoute from '@client/src/components/ProtectedRoute';
import { useAuth } from '@client/src/contexts/AuthContext';

import { Table } from '@lark-apaas/client-toolkit/antd-table';
import type { TableProps } from '@lark-apaas/client-toolkit/antd-table';
import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Textarea } from '@client/src/components/ui/textarea';
import { Badge } from '@client/src/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@client/src/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@client/src/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@client/src/components/ui/breadcrumb';
import { Image } from '@client/src/components/ui/image';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@client/src/api/products';
import type {
  Product,
  ProductSku,
  CreateProductRequest,
  UpdateProductRequest,
} from '@shared/api.interface';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { toast } from 'sonner';

const BRAND_PRIMARY = 'hsl(20 30% 25%)';
const BRAND_BG = 'hsl(40 15% 97%)';

interface ProductFormState {
  styleNo: string;
  name: string;
  description: string;
  price: string;
  series: string;
  season: string;
  colors: string;
  sizes: string;
  images: string;
  status: string;
}

const emptyForm: ProductFormState = {
  styleNo: '',
  name: '',
  description: '',
  price: '',
  series: '',
  season: '',
  colors: '',
  sizes: '',
  images: '',
  status: 'active',
};

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // 列表数据
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  const [keyword, setKeyword] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  // 弹窗
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [skuStocks, setSkuStocks] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 删除确认
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 获取列表
  const fetchData = useCallback(
    async (pageNum: number, kw: string) => {
      setLoading(true);
      try {
        const res = await getProducts({
          page: pageNum,
          pageSize,
          keyword: kw || undefined,
        });
        setData(res.items);
        setTotal(res.total);
        setPage(res.page);
      } catch (error: unknown) {
        logger.error(`[AdminProducts] fetch failed: ${String(error)}`);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchData(page, keyword);
  }, [page, keyword, fetchData]);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // SKU 组合
  const colorList = useMemo(
    () =>
      form.colors
        .split(',')
        .map((c: string) => c.trim())
        .filter(Boolean),
    [form.colors],
  );

  const sizeList = useMemo(
    () =>
      form.sizes
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean),
    [form.sizes],
  );

  const skuKey = (color: string, size: string) => `${color}__${size}`;

  // 打开新增
  const handleAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setSkuStocks({});
    setDialogOpen(true);
  };

  // 打开编辑
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      styleNo: product.styleNo,
      name: product.name,
      description: product.description || '',
      price: product.price,
      series: product.series || '',
      season: product.season || '',
      colors: (product.colors || []).join(', '),
      sizes: (product.sizes || []).join(', '),
      images: (product.images || []).join(', '),
      status: product.status || 'active',
    });
    // 回显 SKU 库存
    const stocks: Record<string, number> = {};
    if (product.skus && product.skus.length > 0) {
      product.skus.forEach((sku: ProductSku) => {
        stocks[skuKey(sku.color, sku.size)] = sku.stock;
      });
    }
    setSkuStocks(stocks);
    setDialogOpen(true);
  };

  // 更新单个 SKU 库存
  const handleSkuStockChange = (
    color: string,
    size: string,
    value: string,
  ) => {
    const numValue = parseInt(value, 10);
    setSkuStocks((prev) => ({
      ...prev,
      [skuKey(color, size)]: isNaN(numValue) ? 0 : numValue,
    }));
  };

  // 提交
  const handleSubmit = async () => {
    if (!form.styleNo.trim()) {
      toast('请填写款号');
      return;
    }
    if (!form.name.trim()) {
      toast('请填写商品名');
      return;
    }
    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast('请输入有效的价格');
      return;
    }

    const colors = colorList;
    const sizes = sizeList;
    const images = form.images
      .split(',')
      .map((img: string) => img.trim())
      .filter(Boolean);

    const skus = colors.flatMap((color: string) =>
      sizes.map((size: string) => ({
        color,
        size,
        stock: skuStocks[skuKey(color, size)] || 0,
      })),
    );

    setSubmitting(true);
    try {
      if (editingProduct) {
        const payload: UpdateProductRequest = {
          name: form.name,
          description: form.description,
          price: priceNum,
          series: form.series,
          season: form.season,
          colors,
          sizes,
          images,
          status: form.status,
          skus,
        };
        await updateProduct(editingProduct.id, payload);
      } else {
        const payload: CreateProductRequest = {
          styleNo: form.styleNo,
          name: form.name,
          description: form.description,
          price: priceNum,
          colors,
          sizes,
          series: form.series,
          season: form.season,
          images,
          skus,
        };
        await createProduct(payload);
      }
      setDialogOpen(false);
      fetchData(page, keyword);
    } catch (error: unknown) {
      logger.error(`[AdminProducts] submit failed: ${String(error)}`);
      toast('保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除
  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteProduct(deletingId);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchData(page, keyword);
    } catch (error: unknown) {
      logger.error(`[AdminProducts] delete failed: ${String(error)}`);
      toast('删除失败，请重试');
    }
  };

  // 表格列
  const columns: TableProps<Product>['columns'] = [
    {
      title: '图片',
      dataIndex: 'images',
      width: 80,
      fixed: 'left',
      render: (_: unknown, record: Product) => (
        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
          {record.images && record.images[0] ? (
            <Image
              src={record.images[0]}
              alt={record.name}
              width={48}
              height={48}
              className="w-12 h-12 object-cover"
            />
          ) : (
            <div className="text-xs text-muted-foreground">无图</div>
          )}
        </div>
      ),
    },
    {
      title: '款号',
      dataIndex: 'styleNo',
      width: 120,
      render: (v: string) => (
        <span className="font-mono text-sm">{v}</span>
      ),
    },
    { title: '商品名', dataIndex: 'name', width: 180 },
    { title: '系列', dataIndex: 'series', width: 120 },
    {
      title: '价格',
      dataIndex: 'price',
      width: 100,
      render: (v: string) => (
        <span style={{ color: 'hsl(350 30% 45%)' }} className="font-medium">
          ¥{v}
        </span>
      ),
    },
    {
      title: '总库存',
      dataIndex: 'totalStock',
      width: 100,
      render: (v: number) => (v !== undefined ? v : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) =>
        status === 'active' ? (
          <Badge variant="default" style={{ backgroundColor: BRAND_PRIMARY }}>
            上架
          </Badge>
        ) : (
          <Badge variant="secondary">下架</Badge>
        ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 140,
      render: (_: unknown, record: Product) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(record)}
            className="text-xs px-2"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1" />
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(record.id)}
            className="text-xs px-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full" style={{ backgroundColor: BRAND_BG }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        {/* 面包屑 */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  管理后台
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-3.5 h-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>商品管理</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 操作栏 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <div className="sr-only">搜索框</div>
          </div>
          <div className="sr-only">占位</div>
        </div>

        {/* 顶部操作栏：搜索 + 新增 + 退出 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
              style={{ color: 'hsl(25 8% 50%)' }}
            />
            <Input
              type="text"
              placeholder="搜索款号/商品名"
              value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchInput(e.target.value)
              }
              className="pl-9 bg-white"
              style={{ borderColor: 'hsl(30 10% 88%)' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleAdd}
              className="w-full sm:w-auto"
              style={{ backgroundColor: BRAND_PRIMARY }}
            >
              <Plus className="w-4 h-4 mr-1" />
              新增商品
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-1" />
              退出登录
            </Button>
          </div>
        </div>

        {/* 表格 */}
        <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: 'hsl(30 10% 88%)' }}>
          <Table<Product>
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey="id"
            scroll={{ x: 900, y: 500 }}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: false,
              onChange: (p: number) => setPage(p),
            }}
          />
        </div>
      </div>
      </div>

      {/* 新增/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          showCloseButton={false}
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle style={{ color: BRAND_PRIMARY }}>
                {editingProduct ? '编辑商品' : '新增商品'}
              </DialogTitle>
              <button
                onClick={() => setDialogOpen(false)}
                className="rounded-md p-1 hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'hsl(20 15% 15%)' }}>
                款号 <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.styleNo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, styleNo: e.target.value })
                }
                placeholder="例如：YR24001"
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'hsl(20 15% 15%)' }}>
                商品名 <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="例如：长款羽绒服"
                className="bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'hsl(20 15% 15%)' }}>
                描述
              </label>
              <Textarea
                value={form.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="商品描述"
                rows={3}
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'hsl(20 15% 15%)' }}>
                价格（元） <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={form.price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, price: e.target.value })
                }
                placeholder="例如：1299"
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'hsl(20 15% 15%)' }}>
                系列
              </label>
              <Input
                value={form.series}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, series: e.target.value })
                }
                placeholder="例如：都市摩登系列"
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'hsl(20 15% 15%)' }}>
                季节
              </label>
              <Input
                value={form.season}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, season: e.target.value })
                }
                placeholder="例如：2024秋冬"
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'hsl(20 15% 15%)' }}>
                状态
              </label>
              <Select
                value={form.status}
                onValueChange={(val: string) =>
                  setForm({ ...form, status: val })
                }
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">上架</SelectItem>
                  <SelectItem value="inactive">下架</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'hsl(20 15% 15%)' }}>
                颜色（多个用逗号分隔）
              </label>
              <Input
                value={form.colors}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, colors: e.target.value })
                }
                placeholder="例如：米白, 黑色, 驼色"
                className="bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'hsl(20 15% 15%)' }}>
                尺码（多个用逗号分隔）
              </label>
              <Input
                value={form.sizes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, sizes: e.target.value })
                }
                placeholder="例如：S, M, L, XL"
                className="bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'hsl(20 15% 15%)' }}>
                图片 URL（多个用逗号分隔）
              </label>
              <Textarea
                value={form.images}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setForm({ ...form, images: e.target.value })
                }
                placeholder="图片 URL，多个用逗号分隔"
                rows={2}
                className="bg-white"
              />
            </div>
          </div>

          {/* SKU 库存表格 */}
          {colorList.length > 0 && sizeList.length > 0 && (
            <div className="mt-6">
              <div className="text-sm font-medium mb-3" style={{ color: 'hsl(20 15% 15%)' }}>
                SKU 库存管理
              </div>
              <div className="overflow-x-auto rounded-md border" style={{ borderColor: 'hsl(30 10% 88%)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: 'hsl(30 10% 92%)' }}>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                        颜色 \ 尺码
                      </th>
                      {sizeList.map((size: string) => (
                        <th
                          key={size}
                          className="px-3 py-2 text-center font-medium text-muted-foreground whitespace-nowrap"
                        >
                          {size}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {colorList.map((color: string) => (
                      <tr
                        key={color}
                        className="border-t"
                        style={{ borderColor: 'hsl(30 10% 88%)' }}
                      >
                        <td className="px-3 py-2 font-medium whitespace-nowrap" style={{ color: 'hsl(20 15% 15%)' }}>
                          {color}
                        </td>
                        {sizeList.map((size: string) => (
                          <td key={size} className="px-2 py-1.5">
                            <Input
                              type="number"
                              value={skuStocks[skuKey(color, size)] ?? 0}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) =>
                                handleSkuStockChange(
                                  color,
                                  size,
                                  e.target.value,
                                )
                              }
                              className="text-center h-8 bg-white"
                              min="0"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              type="button"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ backgroundColor: BRAND_PRIMARY }}
            >
              {submitting ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除商品后将无法恢复，确定要删除该商品吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              style={{ backgroundColor: 'hsl(2 84% 62%)' }}
              className="text-white"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
};

export default AdminProductsPage;
