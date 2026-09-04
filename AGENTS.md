# 北迪 BEIDI — 女装羽绒服 B2B 订货小程序

高端女装羽绒服品牌北迪 BEIDI 的 B2B 订货系统，面向渠道客户/门店，提供选款、下单订货、订单管理等能力。

## 设计规范

### 品牌调性
- 定位：高端时尚女装羽绒服品牌
- 关键词：极简、高级、质感、优雅、都市摩登
- 风格：时尚感强，符合女装羽绒服品牌调性

### 色彩系统
| Token | 值 | 用途 |
|-------|-----|------|
| `--primary` | `hsl(20 30% 25%)` | 主色（深咖棕），品牌识别、按钮、重点强调 |
| `--primary-foreground` | `hsl(40 20% 96%)` | 主色前景文字 |
| `--accent` | `hsl(350 30% 45%)` | 点缀色（酒红/枣红），价格、收藏、强调按钮 |
| `--background` | `hsl(40 15% 97%)` | 页面背景（暖米白） |
| `--foreground` | `hsl(20 15% 15%)` | 正文文字（深棕黑） |
| `--muted` | `hsl(30 10% 92%)` | 次级背景 |
| `--muted-foreground` | `hsl(25 8% 50%)` | 次级文字 |
| `--border` | `hsl(30 10% 88%)` | 边框线 |
| `--card` | `hsl(0 0% 100%)` | 卡片背景 |
| `--card-foreground` | `hsl(20 15% 15%)` | 卡片文字 |
| `--gold` | `hsl(40 60% 55%)` | 金色点缀，标签、VIP 标识 |

### 排版
- 字体：系统默认 sans-serif
- 字号层级：
  - 展示大号：`text-5xl md:text-6xl` / `leading-tight`，用于首页 Hero
  - 页面标题：`text-3xl md:text-4xl` / `leading-tight`
  - 区块标题：`text-2xl` / `leading-snug`
  - 卡片标题：`text-lg` / `leading-snug`
  - 正文：`text-base` / `leading-relaxed`
  - 辅助文字：`text-sm`
  - 极小辅助：`text-xs`
- 字重：标题 `font-semibold`，正文 `font-normal`，强调 `font-medium`
- 字间距：标题 `tracking-tight`，正文 `tracking-normal`

### 间距与布局
- 页面最大宽度：`max-w-7xl mx-auto`
- 页面水平内边距：`px-6 md:px-8`
- 区块垂直间距：`py-16 md:py-24`
- 卡片内边距：`p-6`
- 栅格间距：`gap-6 md:gap-8`
- 图片容器圆角：`rounded-lg`（产品图）/ `rounded-xl`（大图 Hero）

### 组件风格
- 按钮：圆角 `rounded-full`，过渡 `transition-all duration-300`
- 卡片：白底 + 细边框 + 轻微阴影，hover 时阴影加深 + 轻微上移
- 图片：`object-cover`，产品图比例 3:4
- 分割线：细边 + 浅色调，`border-t border-border`

### 动画
- 过渡默认：`transition-all duration-300 ease-out`
- hover 位移：`-translate-y-1`
- 入场淡入：`opacity-0 → opacity-100` + `translate-y-4 → translate-y-0`

### 图片资源
- 53 张 2025 新品羽绒服产品图
- 6 张工厂/新厂宣传图
- 所有图片已上传，使用完整 in-site 路径
