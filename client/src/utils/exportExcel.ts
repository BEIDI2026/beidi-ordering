import * as XLSX from 'xlsx';
import type { Order, OrderItem } from '@shared/api.interface';

/**
 * 将状态英文 key 转为中文描述
 */
export function statusText(status: string): string {
  const map: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
  };
  return map[status] ?? status;
}

/**
 * 格式化日期（YYYY-MM-DD HH:mm:ss）
 */
export function formatDateTime(value: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * 导出单个订货单为 Excel（两个 Sheet：订货单信息 + 商品明细）
 */
export function exportOrderToExcel(order: Order): void {
  const items: OrderItem[] = order.items ?? [];

  // Sheet1：订货单信息（纵向 key-value）
  const infoData: Array<Array<string | number>> = [
    ['订单号', order.orderNo],
    ['订货人', order.customerName],
    ['联系电话', order.customerPhone],
    ['微信号', order.customerWechat],
    ['门店/公司', order.customerCompany],
    ['备注', order.remark],
    ['状态', statusText(order.status)],
    ['总件数', order.totalQty],
    ['总金额', `¥${order.totalAmount}`],
    ['下单时间', formatDateTime(order.createdAt)],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
  wsInfo['!cols'] = [{ wch: 14 }, { wch: 40 }];

  // Sheet2：商品明细
  const detailHeader = ['款号', '商品名', '颜色', '尺码', '数量', '单价', '小计'];
  const detailRows = items.map((item: OrderItem) => [
    item.styleNo,
    item.productName,
    item.color,
    item.size,
    item.quantity,
    item.unitPrice,
    item.subtotal,
  ]);
  const wsDetail = XLSX.utils.aoa_to_sheet([detailHeader, ...detailRows]);
  wsDetail['!cols'] = [
    { wch: 14 },
    { wch: 28 },
    { wch: 10 },
    { wch: 8 },
    { wch: 8 },
    { wch: 12 },
    { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsInfo, '订货单信息');
  XLSX.utils.book_append_sheet(wb, wsDetail, '商品明细');
  XLSX.writeFile(wb, `订货单_${order.orderNo}.xlsx`);
}

/**
 * 导出全部订单概要为 Excel（一张表）
 */
export function exportOrdersSummaryToExcel(orders: Order[]): void {
  const header = [
    '订单号',
    '订货人',
    '联系电话',
    '门店/公司',
    '总件数',
    '总金额',
    '状态',
    '下单时间',
  ];
  const rows = orders.map((order: Order) => [
    order.orderNo,
    order.customerName,
    order.customerPhone,
    order.customerCompany,
    order.totalQty,
    order.totalAmount,
    statusText(order.status),
    formatDateTime(order.createdAt),
  ]);
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws['!cols'] = [
    { wch: 18 },
    { wch: 12 },
    { wch: 16 },
    { wch: 24 },
    { wch: 10 },
    { wch: 14 },
    { wch: 10 },
    { wch: 20 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '订货单列表');
  const ts = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `订货单列表_${ts}.xlsx`);
}
