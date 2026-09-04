import { useMemo } from 'react';

import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Trash2,
  ShoppingBag,
  Minus,
  Plus,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@client/src/components/ui/card';
import { Input } from '@client/src/components/ui/input';
import { Label } from '@client/src/components/ui/label';
import { Textarea } from '@client/src/components/ui/textarea';
import { Button } from '@client/src/components/ui/button';
import { useCartContext } from '@client/src/contexts/CartContext';
import * as ordersApi from '@client/src/api/orders';
import Image from '@client/src/components/ui/image';

const schema = z.object({
  customerName: z.string().min(1, '请填写姓名'),
  customerPhone: z
    .string()
    .min(1, '请填写联系电话')
    .regex(/^1[3-9]\d{9}$/, '请输入有效的11位手机号'),
  customerWechat: z.string().optional(),
  customerCompany: z.string().min(1, '请填写门店/公司名称'),
  remark: z.string().optional(),
});

type OrderFormValues = z.infer<typeof schema>;

const CartPage = () => {
  const { items, updateQuantity, removeItem, clearCart, totalCount, totalAmount } =
    useCartContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerWechat: '',
      customerCompany: '',
      remark: '',
    },
    mode: 'onBlur',
  });

  const styleCount = items.length;

  const isSubmitDisabled = useMemo(
    () => items.length === 0,
    [items.length],
  );

  const onSubmit = async (values: OrderFormValues) => {
    if (items.length === 0) return;

    try {
      const order = await ordersApi.createOrder({
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerWechat: values.customerWechat ?? '',
        customerCompany: values.customerCompany,
        remark: values.remark ?? '',
        items: items.map((item) => ({
          productId: item.productId,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
        })),
      });

      clearCart();
      toast.success('订货单提交成功');
      navigate('/order-success', { state: { orderNo: order.orderNo } });
    } catch (error: unknown) {
      toast.error('提交失败，请稍后重试');
    }
  };

  return (
    <div
      className="w-full"
      style={{ backgroundColor: 'hsl(40 15% 97%)' }}
    >
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">
        {/* 页面标题 */}
        <div className="mb-10">
          <h1
            className="text-3xl font-semibold tracking-tight md:text-4xl"
            style={{ color: 'hsl(20 30% 25%)' }}
          >
            我的订货单
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: 'hsl(25 8% 50%)' }}
          >
            {items.length > 0
              ? `共 ${styleCount} 款 · ${totalCount} 件商品`
              : '订货单还是空的'}
          </p>
        </div>

        {items.length === 0 ? (
          /* 空状态 */
          <Card className="mx-auto max-w-md text-center">
            <CardContent className="flex flex-col items-center py-16">
              <div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: 'hsl(30 10% 92%)' }}
              >
                <ShoppingBag
                  className="h-10 w-10"
                  style={{ color: 'hsl(25 8% 50%)' }}
                />
              </div>
              <h2
                className="text-lg font-medium"
                style={{ color: 'hsl(20 15% 15%)' }}
              >
                订货单还是空的
              </h2>
              <p
                className="mt-2 text-sm"
                style={{ color: 'hsl(25 8% 50%)' }}
              >
                去新款系列挑选心仪的款式吧
              </p>
              <Button
                className="mt-8 rounded-full px-8"
                style={{ backgroundColor: 'hsl(20 30% 25%)' }}
                onClick={() => navigate('/products')}
              >
                去选购
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* 两栏布局 */
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
            {/* 左侧：商品列表 */}
            <div className="w-full lg:w-2/3">
              <div className="space-y-4">
                {items.map((item) => {
                  const subtotal = (
                    parseFloat(item.unitPrice) * item.quantity
                  ).toFixed(2);

                  return (
                    <Card
                      key={`${item.productId}-${item.color}-${item.size}`}
                      className="transition-all duration-300 hover:shadow-md"
                    >
                      <CardContent className="p-4 md:p-6">
                        <div className="flex gap-4 md:gap-6">
                          {/* 缩略图 */}
                          <div
                            className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg md:h-24 md:w-24"
                            style={{ backgroundColor: 'hsl(30 10% 92%)' }}
                          >
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.productName}
                                width={96}
                                height={96}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ShoppingBag
                                  className="h-8 w-8"
                                  style={{ color: 'hsl(25 8% 50%)' }}
                                />
                              </div>
                            )}
                          </div>

                          {/* 商品信息 */}
                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p
                                  className="text-xs font-medium"
                                  style={{ color: 'hsl(40 60% 55%)' }}
                                >
                                  {item.styleNo}
                                </p>
                                <h3
                                  className="mt-1 truncate text-base font-medium"
                                  style={{ color: 'hsl(20 15% 15%)' }}
                                >
                                  {item.productName}
                                </h3>
                                <p
                                  className="mt-1 text-xs"
                                  style={{ color: 'hsl(25 8% 50%)' }}
                                >
                                  {item.color} / {item.size}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(
                                    item.productId,
                                    item.color,
                                    item.size,
                                  )
                                }
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 hover:bg-muted"
                                aria-label="删除商品"
                              >
                                <Trash2
                                  className="h-4 w-4"
                                  style={{ color: 'hsl(25 8% 50%)' }}
                                />
                              </button>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              {/* 数量调整器 */}
                              <div
                                className="flex items-center rounded-full border"
                                style={{ borderColor: 'hsl(30 10% 88%)' }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.color,
                                      item.size,
                                      item.quantity - 1,
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 hover:bg-muted"
                                  aria-label="减少数量"
                                >
                                  <Minus
                                    className="h-3.5 w-3.5"
                                    style={{ color: 'hsl(20 30% 25%)' }}
                                  />
                                </button>
                                <span
                                  className="min-w-[2rem] text-center text-sm font-medium"
                                  style={{ color: 'hsl(20 15% 15%)' }}
                                >
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.color,
                                      item.size,
                                      item.quantity + 1,
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 hover:bg-muted"
                                  aria-label="增加数量"
                                >
                                  <Plus
                                    className="h-3.5 w-3.5"
                                    style={{ color: 'hsl(20 30% 25%)' }}
                                  />
                                </button>
                              </div>

                              {/* 单价 + 小计 */}
                              <div className="text-right">
                                <p
                                  className="text-xs"
                                  style={{ color: 'hsl(25 8% 50%)' }}
                                >
                                  ¥{item.unitPrice} × {item.quantity}
                                </p>
                                <p
                                  className="mt-0.5 text-base font-semibold"
                                  style={{ color: 'hsl(350 30% 45%)' }}
                                >
                                  ¥{subtotal}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* 清空订货单 */}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    toast.info('订货单已清空');
                  }}
                  className="text-sm transition-all duration-300 hover:opacity-80"
                  style={{ color: 'hsl(25 8% 50%)' }}
                >
                  清空订货单
                </button>
              </div>
            </div>

            {/* 右侧：汇总 + 表单 */}
            <div className="w-full lg:w-1/3">
              <div className="lg:sticky lg:top-24">
                {/* 汇总卡片 */}
                <Card className="mb-6">
                  <CardHeader className="pb-4">
                    <CardTitle
                      className="text-lg"
                      style={{ color: 'hsl(20 30% 25%)' }}
                    >
                      订货汇总
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'hsl(25 8% 50%)' }}>
                        商品种类
                      </span>
                      <span
                        className="font-medium"
                        style={{ color: 'hsl(20 15% 15%)' }}
                      >
                        {styleCount} 款
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'hsl(25 8% 50%)' }}>
                        总件数
                      </span>
                      <span
                        className="font-medium"
                        style={{ color: 'hsl(20 15% 15%)' }}
                      >
                        {totalCount} 件
                      </span>
                    </div>
                    <div
                      className="mt-4 flex items-center justify-between border-t pt-4"
                      style={{ borderColor: 'hsl(30 10% 88%)' }}
                    >
                      <span
                        className="text-sm"
                        style={{ color: 'hsl(25 8% 50%)' }}
                      >
                        总金额
                      </span>
                      <span
                        className="text-2xl font-semibold tracking-tight"
                        style={{ color: 'hsl(20 30% 25%)' }}
                      >
                        ¥{totalAmount}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* 订货人信息表单 */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle
                      className="text-lg"
                      style={{ color: 'hsl(20 30% 25%)' }}
                    >
                      订货人信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      {/* 姓名 */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="customerName"
                          style={{ color: 'hsl(20 15% 15%)' }}
                        >
                          姓名
                          <span
                            className="ml-1"
                            style={{ color: 'hsl(350 30% 45%)' }}
                          >
                            *
                          </span>
                        </Label>
                        <Input
                          id="customerName"
                          placeholder="请输入姓名"
                          {...register('customerName')}
                          aria-invalid={!!errors.customerName}
                        />
                        {errors.customerName && (
                          <p className="text-xs text-destructive">
                            {errors.customerName.message}
                          </p>
                        )}
                      </div>

                      {/* 联系电话 */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="customerPhone"
                          style={{ color: 'hsl(20 15% 15%)' }}
                        >
                          联系电话
                          <span
                            className="ml-1"
                            style={{ color: 'hsl(350 30% 45%)' }}
                          >
                            *
                          </span>
                        </Label>
                        <Input
                          id="customerPhone"
                          placeholder="请输入手机号"
                          {...register('customerPhone')}
                          aria-invalid={!!errors.customerPhone}
                        />
                        {errors.customerPhone && (
                          <p className="text-xs text-destructive">
                            {errors.customerPhone.message}
                          </p>
                        )}
                      </div>

                      {/* 微信号 */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="customerWechat"
                          style={{ color: 'hsl(20 15% 15%)' }}
                        >
                          微信号
                        </Label>
                        <Input
                          id="customerWechat"
                          placeholder="请输入微信号（选填）"
                          {...register('customerWechat')}
                        />
                      </div>

                      {/* 门店/公司名称 */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="customerCompany"
                          style={{ color: 'hsl(20 15% 15%)' }}
                        >
                          门店/公司名称
                          <span
                            className="ml-1"
                            style={{ color: 'hsl(350 30% 45%)' }}
                          >
                            *
                          </span>
                        </Label>
                        <Input
                          id="customerCompany"
                          placeholder="请输入门店或公司名称"
                          {...register('customerCompany')}
                          aria-invalid={!!errors.customerCompany}
                        />
                        {errors.customerCompany && (
                          <p className="text-xs text-destructive">
                            {errors.customerCompany.message}
                          </p>
                        )}
                      </div>

                      {/* 备注 */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="remark"
                          style={{ color: 'hsl(20 15% 15%)' }}
                        >
                          备注
                        </Label>
                        <Textarea
                          id="remark"
                          placeholder="有其他需求可以在这里备注（选填）"
                          rows={3}
                          {...register('remark')}
                        />
                      </div>

                      {/* 提交按钮 */}
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitDisabled || isSubmitting}
                        className="mt-2 w-full rounded-full py-6 text-base font-medium transition-all duration-300"
                        style={{ backgroundColor: 'hsl(20 30% 25%)' }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            提交中...
                          </>
                        ) : (
                          '提交订货单'
                        )}
                      </Button>

                      {isSubmitDisabled && (
                        <p
                          className="text-center text-xs"
                          style={{ color: 'hsl(25 8% 50%)' }}
                        >
                          订货单为空，无法提交
                        </p>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
