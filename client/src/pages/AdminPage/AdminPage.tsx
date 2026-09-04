import { Link, useNavigate } from 'react-router-dom';
import { Package, FileText, Settings2, ArrowRight, Home, LogOut } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import ProtectedRoute from '@client/src/components/ProtectedRoute';
import { useAuth } from '@client/src/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@client/src/components/ui/card';

const BRAND_PRIMARY = 'hsl(20 30% 25%)';
const BRAND_ACCENT = 'hsl(350 30% 45%)';
const BRAND_BG = 'hsl(40 15% 97%)';

const entries = [
  {
    icon: Package,
    title: '商品管理',
    description: '新增、编辑、删除商品，调整库存',
    href: '/admin/products',
    color: BRAND_PRIMARY,
  },
  {
    icon: FileText,
    title: '订货单管理',
    description: '查看订货单，导出订货数据',
    href: '/admin/orders',
    color: BRAND_ACCENT,
  },
  {
    icon: Settings2,
    title: '网站设置',
    description: '修改品牌名、公司介绍、联系方式、Banner等',
    href: '/admin/site-config',
    color: 'hsl(40 60% 55%)',
  },
];

const AdminPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <ProtectedRoute>
      <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: BRAND_BG }}
    >
      <div className="w-full max-w-3xl">
        {/* 标题区 */}
        <div className="text-center mb-12">
          <div
            className="text-sm tracking-[0.3em] uppercase mb-3"
            style={{ color: BRAND_PRIMARY, opacity: 0.6 }}
          >
            BEIDI 北迪
          </div>
          <h1
            className="text-3xl md:text-4xl font-semibold tracking-tight mb-3"
            style={{ color: BRAND_PRIMARY }}
          >
            管理后台
          </h1>
          <p className="text-sm md:text-base" style={{ color: 'hsl(25 8% 50%)' }}>
            北迪 BEIDI 订货管理端
          </p>
        </div>

        {/* 入口卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {entries.map((entry) => {
            const Icon = entry.icon;
            return (
              <Card
                key={entry.title}
                className="group bg-white border hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer overflow-hidden"
                style={{ borderColor: 'hsl(30 10% 88%)' }}
              >
                <Link to={entry.href} className="block h-full">
                  <CardHeader className="pb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${entry.color}14` }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: entry.color }}
                      />
                    </div>
                    <CardTitle
                      className="text-lg font-semibold tracking-tight"
                      style={{ color: 'hsl(20 15% 15%)' }}
                    >
                      {entry.title}
                    </CardTitle>
                    <CardDescription
                      className="text-sm"
                      style={{ color: 'hsl(25 8% 50%)' }}
                    >
                      {entry.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                      style={{
                        borderColor: entry.color,
                        color: entry.color,
                      }}
                    >
                      进入
                      <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>

        {/* 返回首页 + 退出登录 */}
        <div className="flex items-center justify-center gap-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm transition-colors duration-200 hover:opacity-80"
            style={{ color: 'hsl(25 8% 50%)' }}
          >
            <Home className="w-4 h-4" />
            返回首页
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm transition-colors duration-200 hover:opacity-80"
            style={{ color: 'hsl(25 8% 50%)' }}
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default AdminPage;
