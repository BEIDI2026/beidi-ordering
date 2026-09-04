import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import { siteConfigsApi } from '@client/src/api';
import type { SiteConfigMap } from '@shared/api.interface';
import { logger } from '@lark-apaas/client-toolkit/logger';

const defaultConfig: SiteConfigMap = {
  brandName: 'BEIDI 北迪',
  brandSlogan: '诚实经营 · 道德经商 · 制造经典 · 创造完美',
  heroTitle: '匠心羽绒 · 优雅随行',
  heroSubtitle: '30年专业制造，北迪2025冬季新品系列',
  heroImage: 'https://aka.doubaocdn.com/s/L7Ri2NXias',
  companyIntro: '',
  factoryIntro: '',
  contactPhone: '13601193150',
  contactPerson: '才宏伟 13910103896',
  contactEmail: 'fczycw@163.com',
  addressBeijing: '北京市朝阳区雅宝路华声国际大厦701室',
  addressHangzhou: '浙江省杭州市临平区艺尚创谷中心24幢1单元802室',
  addressFactory: '河北省秦皇岛市昌黎县泥井镇才庄村',
};

interface SiteConfigContextValue {
  config: SiteConfigMap;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextValue>({
  config: defaultConfig,
  loading: true,
  refresh: async () => {},
});

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfigMap>(defaultConfig);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const data = await siteConfigsApi.getSiteConfig();
      const merged: SiteConfigMap = { ...defaultConfig };
      (Object.keys(data) as Array<keyof SiteConfigMap>).forEach((key) => {
        const val = data[key];
        if (val && val.trim()) {
          merged[key] = val;
        }
      });
      setConfig(merged);
    } catch (error: unknown) {
      logger.error(`[siteConfig] fetch failed: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, loading, refresh: fetchConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
