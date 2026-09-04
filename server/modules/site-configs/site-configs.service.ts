import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';

import type {
  SiteConfigMap,
  UpdateSiteConfigRequest,
} from '@shared/api.interface';
import { siteConfigs } from '../../database/schema';

const CAMEL_TO_SNAKE: Record<keyof SiteConfigMap, string> = {
  brandName: 'brand_name',
  brandSlogan: 'brand_slogan',
  heroTitle: 'hero_title',
  heroSubtitle: 'hero_subtitle',
  heroImage: 'hero_image',
  companyIntro: 'company_intro',
  factoryIntro: 'factory_intro',
  contactPhone: 'contact_phone',
  contactPerson: 'contact_person',
  contactEmail: 'contact_email',
  addressBeijing: 'address_beijing',
  addressHangzhou: 'address_hangzhou',
  addressFactory: 'address_factory',
};

const ALL_CONFIG_KEYS = Object.values(CAMEL_TO_SNAKE);

const DEFAULT_MAP: SiteConfigMap = {
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

function snakeToCamel(snakeKey: string): keyof SiteConfigMap | null {
  for (const [camel, snake] of Object.entries(CAMEL_TO_SNAKE)) {
    if (snake === snakeKey) return camel as keyof SiteConfigMap;
  }
  return null;
}

@Injectable()
export class SiteConfigsService {
  private readonly logger = new Logger(SiteConfigsService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async findAll(): Promise<SiteConfigMap> {
    const rows = await this.db
      .select({
        configKey: siteConfigs.configKey,
        configValue: siteConfigs.configValue,
      })
      .from(siteConfigs);

    const result: SiteConfigMap = { ...DEFAULT_MAP };
    for (const row of rows) {
      const camelKey = snakeToCamel(row.configKey);
      if (camelKey) {
        result[camelKey] = row.configValue;
      }
    }
    return result;
  }

  async update(dto: UpdateSiteConfigRequest, userId: string): Promise<SiteConfigMap> {
    const entries = Object.entries(dto) as Array<[keyof SiteConfigMap, string]>;
    const validEntries = entries.filter(([, value]) => value !== undefined);

    if (validEntries.length === 0) {
      throw new BadRequestException('未提供可更新字段');
    }

    const now = new Date();

    for (const [camelKey, value] of validEntries) {
      const snakeKey = CAMEL_TO_SNAKE[camelKey];
      if (!snakeKey) continue;

      await this.db
        .insert(siteConfigs)
        .values({
          configKey: snakeKey,
          configValue: value,
          createdAt: now,
          createdBy: userId,
          updatedAt: now,
          updatedBy: userId,
        })
        .onConflictDoUpdate({
          target: siteConfigs.configKey,
          set: {
            configValue: value,
            updatedAt: now,
            updatedBy: userId,
          },
        });
    }

    const keysUpdated = validEntries.map(([k]) => k).join(', ');
    this.logger.log(`站点配置更新成功: keys=[${keysUpdated}]`);

    return this.findAll();
  }
}
