import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SiteConfigsService } from './site-configs.service';
import type {
  SiteConfigMap,
  UpdateSiteConfigRequest,
} from '@shared/api.interface';

@Controller('api/site-configs')
export class SiteConfigsController {
  constructor(private readonly siteConfigsService: SiteConfigsService) {}

  // 公开接口：获取所有站点配置
  @Get()
  async findAll(): Promise<SiteConfigMap> {
    return this.siteConfigsService.findAll();
  }

  // 管理端：批量更新站点配置
  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(
    @Req() req: { user: { username: string } },
    @Body() dto: UpdateSiteConfigRequest,
  ): Promise<SiteConfigMap> {
    const { username } = req.user;
    return this.siteConfigsService.update(dto, `admin:${username}`);
  }
}
