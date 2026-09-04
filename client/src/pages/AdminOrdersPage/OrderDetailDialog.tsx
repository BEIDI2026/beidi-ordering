import { useCallback } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { exportOrderToExcel, statusText, formatDateTime } from '@/utils/exportExcel';
import * as ordersApi from '@client/src/api/orders';
import type { Order, OrderItem } from '@shared/api.interface';

const STATUS_OPTIONS = [
  { value: 'pending', label: '待确认', variant: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'confirmed', label: '已确认', variant: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'shipped', label: '已发货', variant: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'completed', label: '已完成', variant: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'cancelled', label: '已取消', variant: 'bg-muted text-muted-foreground border-border' },
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

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-3">
    <span className="text-muted-foreground shrink-0 w-20">{label}：</span>
    <span className="text-foreground break-words">{value}</span>
  </div>
);

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  loading: boolean;
  statusUpdating: boolean;
  onStatusUpdated: (orderId: string, nextStatus: string) => void;
}

const OrderDetailDialog = ({
  open,
  onOpenChange,
  order,
  loading,
  statusUpdating,
  onStatusUpdated,
}: OrderDetailDialogProps) => {
  const handleExport = useCallback(async () => {
    if (!order) return;
    try {
      let target: Order = order;
      if (!order.items) {
        target = await ordersApi.getOrder(order.id);
      }
      exportOrderToExcel(target);
      toast.success(`已导出订货单 ${target.orderNo}`);
    } catch (error: unknown) {
      toast.error('导出失败，请稍后重试');
    }
  }, [order]);

  const handleUpdateStatus = useCallback(
    (nextStatus: string) => {
      if (!order) return;
      onStatusUpdated(order.id, nextStatus);
    },
    [order, onStatusUpdated],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-xl">
              订货单详情
              <span className="text-primary font-mono ml-2 text-base">
                {order?.orderNo}
              </span>
            </DialogTitle>
            {order && getStatusBadge(order.status)}
          </div>
          <DialogDescription>
            下单时间：{order ? formatDateTime(order.createdAt) : '-'}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            加载中...
          </div>
        )}

        {order && !loading && (
          <div className="flex-1 overflow-y-auto">
            {/* 订货人信息 */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                订货人信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <InfoRow label="姓名" value={order.customerName} />
                <InfoRow label="电话" value={order.customerPhone} />
                <InfoRow label="微信" value={order.customerWechat} />
                <InfoRow label="公司/门店" value={order.customerCompany} />
                <div className="md:col-span-2">
                  <InfoRow label="备注" value={order.remark || '-'} />
                </div>
              </div>
            </div>

            {/* 商品明细 */}
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                商品明细
              </h3>
              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="text-left font-medium px-3 py-2">款号</th>
                      <th className="text-left font-medium px-3 py-2">商品名</th>
                      <th className="text-left font-medium px-3 py-2">颜色</th>
                      <th className="text-left font-medium px-3 py-2">尺码</th>
                      <th className="text-right font-medium px-3 py-2">数量</th>
                      <th className="text-right font-medium px-3 py-2">单价</th>
                      <th className="text-right font-medium px-3 py-2">小计</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items ?? []).length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          暂无商品明细
                        </td>
                      </tr>
                    ) : (
                      order.items?.map((item: OrderItem) => (
                        <tr
                          key={item.id}
                          className="border-t border-border hover:bg-muted/40"
                        >
                          <td className="px-3 py-2 font-mono text-xs">
                            {item.styleNo}
                          </td>
                          <td className="px-3 py-2">{item.productName}</td>
                          <td className="px-3 py-2">{item.color}</td>
                          <td className="px-3 py-2">{item.size}</td>
                          <td className="px-3 py-2 text-right">{item.quantity}</td>
                          <td className="px-3 py-2 text-right">
                            ¥{item.unitPrice}
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            ¥{item.subtotal}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 汇总 */}
            <div className="mt-6 flex flex-col md:flex-row md:justify-end gap-4 md:gap-12 pr-2">
              <div className="flex items-center justify-between md:block">
                <span className="text-sm text-muted-foreground">总件数</span>
                <span className="text-lg font-semibold">
                  {order.totalQty}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    件
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between md:block">
                <span className="text-sm text-muted-foreground">总金额</span>
                <span className="text-2xl font-semibold text-accent">
                  ¥{order.totalAmount}
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-2 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">更新状态：</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={!order}>
                  <RefreshCw className="size-3.5" />
                  选择状态
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>更新为</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STATUS_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    disabled={statusUpdating || order?.status === opt.value}
                    onClick={() => handleUpdateStatus(opt.value)}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} disabled={!order}>
              <Download className="size-4" />
              导出该订单
            </Button>
            <Button variant="default" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;
