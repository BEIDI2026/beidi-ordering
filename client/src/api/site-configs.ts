import type {
  SiteConfigMap,
  UpdateSiteConfigRequest,
} from '@shared/api.interface';

import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';

export async function getSiteConfig(): Promise<SiteConfigMap> {
  try {
    const { data } = await axiosForBackend.get<SiteConfigMap>(
      '/api/site-configs',
    );
    return data;
  } catch (error: unknown) {
    logger.error(`[siteConfigsApi.getSiteConfig] failed: ${String(error)}`);
    throw error;
  }
}

export async function updateSiteConfig(
  data: UpdateSiteConfigRequest,
): Promise<SiteConfigMap> {
  try {
    const response = await axiosForBackend.patch<SiteConfigMap>(
      '/api/site-configs',
      data,
    );
    return response.data;
  } catch (error: unknown) {
    logger.error(`[siteConfigsApi.updateSiteConfig] failed: ${String(error)}`);
    throw error;
  }
}
