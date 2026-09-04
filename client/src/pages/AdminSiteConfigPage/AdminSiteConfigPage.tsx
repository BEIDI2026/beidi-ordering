import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, LogOut } from 'lucide-react';
import ProtectedRoute from '@client/src/components/ProtectedRoute';
import { useAuth } from '@client/src/contexts/AuthContext';
import { toast } from 'sonner';

import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Textarea } from '@client/src/components/ui/textarea';
import { Label } from '@client/src/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@client/src/components/ui/card';
import { Skeleton } from '@client/src/components/ui/skeleton';
import { getSiteConfig, updateSiteConfig } from '@client/src/api/site-configs';
import type {
  SiteConfigMap,
  UpdateSiteConfigRequest,
} from '@shared/api.interface';
import { logger } from '@lark-apaas/client-toolkit/logger';

const BRAND_PRIMARY = 'hsl(20 30% 25%)';
const BRAND_BG = 'hsl(40 15% 97%)';

const emptyForm: SiteConfigMap = {
  brandName: '',
  brandSlogan: '',
  heroTitle: '',
  heroSubtitle: '',
  heroImage: '',
  companyIntro: '',
  factoryIntro: '',
  contactPhone: '',
  contactPerson: '',
  contactEmail: '',
  addressBeijing: '',
  addressHangzhou: '',
  addressFactory: '',
};

const AdminSiteConfigPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const [form, setForm] = useState<SiteConfigMap>(emptyForm);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSiteConfig();
      setForm(data);
    } catch (error: unknown) {
      logger.error(`[AdminSiteConfig] fetch failed: ${String(error)}`);
      toast('加载配置失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleFieldChange = (
    key: keyof SiteConfigMap,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const payload: UpdateSiteConfigRequest = { ...form };
      const updated = await updateSiteConfig(payload);
      setForm(updated);
      toast('配置保存成功');
    } catch (error: unknown) {
      logger.error(`[AdminSiteConfig] save failed: ${String(error)}`);
      toast('保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const FieldRow = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {children}
    </div>
  );

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen"
        style={{ backgroundColor: BRAND_BG }}
      >
        <div className="max-w-4xl mx-auto py-12 px-6">
          {/* 顶部操作栏：返回 + 退出登录 */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-white/50"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="w-4 h-4" />
              返回管理后台
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-white/50 text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </Button>
          </div>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            style={{ color: BRAND_PRIMARY }}
          >
            网站配置管理
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            管理品牌信息、公司介绍与联系方式等站点展示内容
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i: number) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* 品牌与Banner */}
            <Card>
              <CardHeader>
                <CardTitle
                  className="text-xl"
                  style={{ color: BRAND_PRIMARY }}
                >
                  品牌与Banner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FieldRow label="品牌名称">
                    <Input
                      value={form.brandName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange('brandName', e.target.value)
                      }
                      placeholder="请输入品牌名称"
                    />
                  </FieldRow>
                  <FieldRow label="品牌标语">
                    <Input
                      value={form.brandSlogan}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange('brandSlogan', e.target.value)
                      }
                      placeholder="请输入品牌标语"
                    />
                  </FieldRow>
                  <FieldRow label="首页Banner标题">
                    <Input
                      value={form.heroTitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange('heroTitle', e.target.value)
                      }
                      placeholder="请输入Banner标题"
                    />
                  </FieldRow>
                  <FieldRow label="首页Banner副标题">
                    <Input
                      value={form.heroSubtitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange('heroSubtitle', e.target.value)
                      }
                      placeholder="请输入Banner副标题"
                    />
                  </FieldRow>
                  <div className="md:col-span-2">
                    <FieldRow label="Banner图片URL">
                      <Input
                        value={form.heroImage}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFieldChange('heroImage', e.target.value)
                        }
                        placeholder="请输入Banner图片地址"
                      />
                    </FieldRow>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 公司与工厂介绍 */}
            <Card>
              <CardHeader>
                <CardTitle
                  className="text-xl"
                  style={{ color: BRAND_PRIMARY }}
                >
                  公司与工厂介绍
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <FieldRow label="公司介绍">
                    <Textarea
                      value={form.companyIntro}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleFieldChange('companyIntro', e.target.value)
                      }
                      placeholder="请输入公司介绍"
                      rows={6}
                    />
                  </FieldRow>
                  <FieldRow label="工厂宣传">
                    <Textarea
                      value={form.factoryIntro}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleFieldChange('factoryIntro', e.target.value)
                      }
                      placeholder="请输入工厂宣传内容"
                      rows={6}
                    />
                  </FieldRow>
                </div>
              </CardContent>
            </Card>

            {/* 联系方式 */}
            <Card>
              <CardHeader>
                <CardTitle
                  className="text-xl"
                  style={{ color: BRAND_PRIMARY }}
                >
                  联系方式
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FieldRow label="订货电话">
                    <Input
                      value={form.contactPhone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange('contactPhone', e.target.value)
                      }
                      placeholder="请输入订货电话"
                    />
                  </FieldRow>
                  <FieldRow label="联系人">
                    <Input
                      value={form.contactPerson}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange('contactPerson', e.target.value)
                      }
                      placeholder="请输入联系人"
                    />
                  </FieldRow>
                  <div className="md:col-span-2">
                    <FieldRow label="邮箱">
                      <Input
                        value={form.contactEmail}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFieldChange('contactEmail', e.target.value)
                        }
                        placeholder="请输入邮箱地址"
                        type="email"
                      />
                    </FieldRow>
                  </div>
                  <div className="md:col-span-2">
                    <FieldRow label="北京公司地址">
                      <Input
                        value={form.addressBeijing}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFieldChange('addressBeijing', e.target.value)
                        }
                        placeholder="请输入北京公司地址"
                      />
                    </FieldRow>
                  </div>
                  <div className="md:col-span-2">
                    <FieldRow label="杭州公司地址">
                      <Input
                        value={form.addressHangzhou}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFieldChange('addressHangzhou', e.target.value)
                        }
                        placeholder="请输入杭州公司地址"
                      />
                    </FieldRow>
                  </div>
                  <div className="md:col-span-2">
                    <FieldRow label="工厂地址">
                      <Input
                        value={form.addressFactory}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFieldChange('addressFactory', e.target.value)
                        }
                        placeholder="请输入工厂地址"
                      />
                    </FieldRow>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 保存按钮 */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={submitting}
                size="lg"
                style={{
                  backgroundColor: BRAND_PRIMARY,
                }}
                className="rounded-full px-8"
              >
                <Save className="w-4 h-4" />
                {submitting ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default AdminSiteConfigPage;
