import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { ShoppingBag, Settings, Sparkles } from 'lucide-react';

import { Badge } from '@client/src/components/ui/badge';
import { CartProvider, useCartContext } from '@client/src/contexts/CartContext';
import { SiteConfigProvider, useSiteConfig } from '@client/src/contexts/SiteConfigContext';
import { cn } from '@/lib/utils';

const navLinks = [
  { to: '/', label: '首页', end: true },
  { to: '/products', label: '新款系列', end: false },
];

function Navbar() {
  const { totalCount } = useCartContext();
  const { config } = useSiteConfig();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(30_10%_88%)]/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8">
        {/* 左侧：品牌名 */}
        <Link
          to="/"
          className="flex items-center gap-2 transition-all duration-300 hover:opacity-80"
        >
          <Sparkles
            className="h-5 w-5"
            style={{ color: 'hsl(40 60% 55%)' }}
          />
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ color: 'hsl(20 30% 25%)' }}
          >
            BEIDI
            <span className="ml-2 text-sm font-normal opacity-70">北迪</span>
          </span>
        </Link>

        {/* 中间导航 */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'relative text-sm font-medium transition-all duration-300',
                  isActive
                    ? ''
                    : 'opacity-70 hover:opacity-100',
                )
              }
              style={({ isActive }) => ({
                color: isActive ? 'hsl(20 30% 25%)' : 'hsl(20 15% 15%)',
              })}
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full"
                      style={{ backgroundColor: 'hsl(40 60% 55%)' }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          <NavLink
            to="/cart"
            className="relative text-sm font-medium transition-all duration-300 hover:opacity-100"
          >
            {({ isActive }) => (
              <span
                className={cn(
                  'relative inline-flex items-center gap-1',
                  isActive ? '' : 'opacity-70',
                )}
                style={{ color: 'hsl(20 15% 15%)' }}
              >
                订货单
                {totalCount > 0 && (
                  <Badge
                    className="ml-1 h-4 min-w-[1.25rem] justify-center px-1 text-[10px] leading-none"
                    style={{
                      backgroundColor: 'hsl(350 30% 45%)',
                      color: 'white',
                    }}
                  >
                    {totalCount > 99 ? '99+' : totalCount}
                  </Badge>
                )}
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full"
                    style={{ backgroundColor: 'hsl(40 60% 55%)' }}
                  />
                )}
              </span>
            )}
          </NavLink>
        </nav>

        {/* 右侧：管理后台 */}
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(30_10%_88%)] bg-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
          aria-label="管理后台"
        >
          <Settings
            className="h-4 w-4"
            style={{ color: 'hsl(20 30% 25%)' }}
          />
        </button>
      </div>
    </header>
  );
}

function Footer() {
  const { config } = useSiteConfig();
  return (
    <footer
      className="text-white"
      style={{ backgroundColor: 'hsl(20 30% 25%)' }}
    >
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          {/* 品牌信息 */}
          <div>
            <div className="flex items-center gap-2">
              <Sparkles
                className="h-5 w-5"
                style={{ color: 'hsl(40 60% 55%)' }}
              />
              <span className="text-lg font-semibold tracking-tight">
                {config.brandName}
              </span>
            </div>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: 'hsl(30 10% 75%)' }}
            >
              旗下公司：北京丰昌北迪 / 杭州丰昌北迪
            </p>
            <p
              className="mt-1 text-xs"
              style={{ color: 'hsl(25 8% 60%)' }}
            >
              诚实经营 · 道德经商 · 制造经典 · 创造完美
            </p>
          </div>

          {/* 联系方式 */}
          <div>
            <h4 className="text-sm font-medium">联系我们</h4>
            <div
              className="mt-3 space-y-2 text-sm"
               style={{ color: 'hsl(30 10% 75%)' }}
             >
               <p>订货热线：{config.contactPhone}</p>
               <p>联系人：{config.contactPerson}</p>
               <p>邮箱：{config.contactEmail}</p>
             </div>
          </div>

          {/* 公司地址 */}
          <div>
            <h4 className="text-sm font-medium">公司地址</h4>
            <div
              className="mt-3 space-y-2 text-sm"
              style={{ color: 'hsl(30 10% 75%)' }}
            >
              <p>北京公司：{config.addressBeijing}</p>
              <p>杭州公司：{config.addressHangzhou}</p>
              <p>工厂：{config.addressFactory}</p>
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <div
          className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs md:flex-row"
          style={{
            borderColor: 'hsl(20 25% 35%)',
            color: 'hsl(25 8% 60%)',
          }}
        >
           <p>© 2025 {config.brandName} 版权所有 · 秦皇岛丰昌制衣有限公司</p>
           <p>{config.brandSlogan}</p>
        </div>
      </div>
    </footer>
  );
}

function FloatingCartButton() {
  const { totalCount } = useCartContext();
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/cart')}
      aria-label="查看订货单"
      className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        backgroundColor: 'hsl(20 30% 25%)',
        color: 'hsl(40 20% 96%)',
      }}
    >
      <ShoppingBag className="h-5 w-5" />
      {totalCount > 0 && (
        <span
          className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold"
          style={{ backgroundColor: 'hsl(350 30% 45%)', color: 'white' }}
        >
          {totalCount > 99 ? '99+' : totalCount}
        </span>
      )}
    </button>
  );
}

function LayoutContent() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: 'hsl(40 15% 97%)' }}
    >
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingCartButton />
    </div>
  );
}

const Layout = () => {
  return (
    <SiteConfigProvider>
      <CartProvider>
        <LayoutContent />
      </CartProvider>
    </SiteConfigProvider>
  );
};

export default Layout;
