import { useLocation, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Home } from 'lucide-react';

import {
  Card,
  CardContent,
} from '@client/src/components/ui/card';
import { Button } from '@client/src/components/ui/button';

interface LocationState {
  orderNo?: string;
}

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const orderNo = state?.orderNo;

  return (
    <div
      className="w-full"
      style={{ backgroundColor: 'hsl(40 15% 97%)' }}
    >
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-6 py-16 md:px-8 md:py-24">
        <Card className="w-full text-center transition-all duration-500">
          <CardContent className="px-6 py-12 md:px-12 md:py-16">
            {/* 成功图标 */}
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full shadow-lg md:h-24 md:w-24">
              <div
                className="flex h-full w-full items-center justify-center rounded-full"
                style={{ backgroundColor: 'hsl(40 60% 55%)' }}
              >
                <Check
                  className="h-10 w-10 stroke-[3] text-white md:h-12 md:w-12"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* 标题 */}
            <h1
              className="text-2xl font-semibold tracking-tight md:text-3xl"
              style={{ color: 'hsl(20 30% 25%)' }}
            >
              订货单提交成功！
            </h1>

            {/* 订单号 */}
            <div
              className="mx-auto mt-6 inline-flex flex-col items-center gap-2 rounded-xl px-8 py-5"
              style={{ backgroundColor: 'hsl(30 10% 92%)' }}
            >
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: 'hsl(25 8% 50%)' }}
              >
                订单号
              </span>
              <span
                className="text-xl font-semibold tracking-wide md:text-2xl"
                style={{ color: 'hsl(20 30% 25%)' }}
              >
                {orderNo ?? '—'}
              </span>
            </div>

            {/* 提示文案 */}
            <p
              className="mx-auto mt-6 max-w-xs text-sm leading-relaxed md:text-base"
              style={{ color: 'hsl(25 8% 50%)' }}
            >
              我们的客户经理将在24小时内与您联系确认订单详情
            </p>

            {/* 分割线 */}
            <div
              className="my-8 h-px w-full"
              style={{ backgroundColor: 'hsl(30 10% 88%)' }}
            />

            {/* 按钮组 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                className="rounded-full px-8"
                style={{ backgroundColor: 'hsl(20 30% 25%)' }}
                onClick={() => navigate('/products')}
              >
                继续选购
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-8"
                style={{ borderColor: 'hsl(30 10% 88%)' }}
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4" />
                返回首页
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
