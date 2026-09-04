import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  Eye,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet,
  Filter,
  LogOut,
} from 'lucide-react';
import ProtectedRoute from '@client/src/components/ProtectedRoute';
import { useAuth } from '@client/src/contexts/AuthContext';
import { toast } from 'sonner';
import { Table, TableProps } from '@lark-apaas/client-toolkit/antd-table';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { exportOrdersSummaryToExcel } from '@/utils/exportExcel';
import * as ordersApi from '@client/src/api/orders';
import type { Order } from '@shared/api.interface';

import OrderDetailDialog from './OrderDetailDialog';

const STATUS_OPTIONS: Array<{ value: string; label: string; variant: string }> = [
  { value: 'pending', label: '待确认', variant: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'confirmed', label: '已确认', variant: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'shipped', label: '已发货', variant: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'completed', label: '已完成', variant: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'cancelled', label: '已取消', variant: 'bg-muted text-muted-foreground border-border' },
];

const STATUS_FILTERS = [
  { value: '', label: '全部' },
  ...STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
];

function getStatusBadge(status: string) {
  const found = STATUS_OPTIONS.find((s) => s.value === status);
  const label = found ? found.label : status;
  const className = found ? found.variant : 'bg-muted text-muted-foreground border-border';
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  const [exportAllLoading, setExportAllLoading] = useState<boolean>(false);
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);

  /** 拉取订单列表 */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getOrders({
        page,
        pageSize,
        status: statusFilter || undefined,
        keyword: keyword || undefined,
      });
      setOrders(res.items);
      setTotal(res.total);
    } catch (error: unknown) {
      toast.error('订单列表加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, keyword]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /** 打开订单详情 */
  const openDetail = useCallback(async (order: Order) => {
    setDetailOrder(order);
    setDetailOpen(true);
    if (!order.items) {
      setDetailLoading(true);
      try {
        const full = await ordersApi.getOrder(order.id);
        setDetailOrder(full);
      } catch (error: unknown) {
        toast.error('订单详情加载失败');
      } finally {
        setDetailLoading(false);
      }
    }
  }, []);

  /** 更新订单状态 */
  const handleUpdateStatus = useCallback(
    async (orderId: string, nextStatus: string) => {
      setStatusUpdating(true);
      try {
        await ordersApi.updateOrderStatus(orderId, nextStatus);
        toast.success('订单状态已更新');
        fetchOrders();
        setDetailOrder((prev) =>
          prev && prev.id === orderId ? { ...prev, status: nextStatus } : prev,
        );
      } catch (error: unknown) {
        toast.error('状态更新失败，请稍后重试');
      } finally {
        setStatusUpdating(false);
      }
    },
    [fetchOrders],
  );

  /** 导出单订单 */
  const handleExportSingle = useCallback(async (order: Order) => {
    try {
      const target = order.items ? order : await ordersApi.getOrder(order.id);
      // 延迟导入以避免主页面加载时额外体积
      const { exportOrderToExcel } = await import('@/utils/exportExcel');
      exportOrderToExcel(target);
      toast.success(`已导出订货单 ${target.orderNo}`);
    } catch (error: unknown) {
      toast.error('导出失败，请稍后重试');
    }
  }, []);

  /** 导出全部（当前筛选条件下所有订单概要） */
  const handleExportAll = useCallback(async () => {
    setExportAllLoading(true);
    try {
      const all: Order[] = [];
      let curPage = 1;
      const size = 100;
      // 最多拉 5 页作为安全兜底（500 条）
      for (let i = 0; i < 5; i += 1) {
        const res = await ordersApi.getOrders({
          page: curPage,
          pageSize: size,
          status: statusFilter || undefined,
          keyword: keyword || undefined,
        });
        all.push(...res.items);
        if (all.length >= res.total || res.items.length < size) break;
        curPage += 1;
      }
      if (all.length === 0) {
        toast.info('当前没有可导出的订单');
        return;
      }
      exportOrdersSummaryToExcel(all);
      toast.success(`已导出 ${all.length} 条订单`);
    } catch (error: unknown) {
      toast.error('导出失败，请稍后重试');
    } finally {
      setExportAllLoading(false);
    }
  }, [statusFilter, keyword]);

  const handleSearch = useCallback(() => {
    setKeyword(searchInput.trim());
    setPage(1);
  }, [searchInput]);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
  }, []);

  /** 表格列 */
  const columns: TableProps<Order>['columns'] = useMemo(
    () => [
      {
        title: '订单号',
        dataIndex: 'orderNo',
        fixed: 'left',
        width: 180,
        render: (val: string, record: Order) => (
          <button
            type="button"
            className="text-primary font-medium hover:underline transition-colors"
            onClick={() => openDetail(record)}
          >
            {val}
          </button>
        ),
      },
      { title: '订货人', dataIndex: 'customerName', width: 100 },
      { title: '联系电话', dataIndex: 'customerPhone', width: 140 },
      { title: '门店/公司', dataIndex: 'customerCompany', width: 200, ellipsis: true },
      { title: '总件数', dataIndex: 'totalQty', width: 90, align: 'right' },
      {
        title: '总金额',
        dataIndex: 'totalAmount',
        width: 130,
        align: 'right',
        render: (val: string) => (
          <span className="font-medium text-accent">¥{val}</span>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (val: string) => getStatusBadge(val),
      },
      {
        title: '下单时间',
        dataIndex: 'createdAt',
        width: 180,
        render: (val: string) => {
          if (!val) return '';
          const d = new Date(val);
          if (Number.isNaN(d.getTime())) return val;
          const pad = (n: number): string => n.toString().padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        },
      },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 260,
        render: (_: unknown, record: Order) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => openDetail(record)}>
              <Eye className="size-3.5" />
              查看
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExportSingle(record)}
            >
              <Download className="size-3.5" />
              导出
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <RefreshCw className="size-3.5" />
                  更新状态
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>选择状态</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STATUS_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    disabled={opt.value === record.status || statusUpdating}
                    onClick={() => handleUpdateStatus(record.id, opt.value)}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [openDetail, handleExportSingle, handleUpdateStatus, statusUpdating],
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-10">
        {/* 面包屑 */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">管理后台</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="size-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>订货单管理</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 标题栏 */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              订货单管理
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              管理所有渠道客户的订货单，支持状态流转与批量导出
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              onClick={handleExportAll}
              disabled={exportAllLoading}
              className="rounded-full"
            >
              {exportAllLoading ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="size-4" />
              )}
              导出全部
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
              退出登录
            </Button>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6 flex flex-col md:flex-row md:items-center gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">状态：</span>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger size="sm" className="w-36">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="搜索订单号 / 客户名 / 公司名"
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleSearch}>
              搜索
            </Button>
          </div>
        </div>

        {/* 订单表格 */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <Table<Order>
            rowKey="id"
            columns={columns}
            dataSource={orders}
            loading={loading}
            scroll={{ x: 1200, y: 500 }}
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: handlePageChange,
              showSizeChanger: false,
              showTotal: (t) => `共 ${t} 条`,
            }}
          />
        </div>
      </div>

      <OrderDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        order={detailOrder}
        loading={detailLoading}
        statusUpdating={statusUpdating}
        onStatusUpdated={handleUpdateStatus}
      />
    </div>
    </ProtectedRoute>
  );
};

export default AdminOrdersPage;
