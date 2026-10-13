# 我的潮流买手店

一款可交互的纯前端买手店经营游戏 Demo。Next.js App Router + TypeScript + Tailwind CSS，移动端优先，支持静态导出和 GitHub Pages 部署。

**非官方概念演示，仅用于产品设计交流。** 所有商品、品牌、合作、购买和社区店铺均为模拟。24 张商品图为项目原创 SVG 示意图，随项目提供，无外部图片依赖。没有注册、登录、数据库、真实支付或多人服务。

## 立即运行

要求 Node.js 22.13+ 或 24 LTS，以及 pnpm。开发和验收实际使用 Node.js 24.19.0。

```bash
cd my-trend-buyer-shop
pnpm install --frozen-lockfile
pnpm dev
```

浏览器打开 `http://localhost:3000`。也可以使用 `npm install`、`npm run dev`；pnpm 锁文件提供可复现的依赖版本。

生产构建与本地静态预览：

```bash
pnpm build
pnpm start
```

`out/` 是可独立部署的完整静态网站。`pnpm start` 使用随项目提供的本地静态文件预览器，不是游戏后端。不要直接双击 `out/index.html`；需要通过 HTTP 访问。

## 面试演示路线（约 5 分钟）

1. 设置昵称、店名和装修风格，完成“挑选 3 件好物 → 布置第一面货架 → 正式开张”的三步引导。
2. 在 2.5D 店铺里点击挂架、鞋台、玻璃柜或饰品台座替换、下架商品；点击右侧心愿橱窗，模拟购入并观察身份变化。
3. 进入“今日经营”，开张获得 5 EXP，完成当天真实操作后领取 35 EXP。
4. 从手机顶栏右侧更多入口或“我的”页打开“体验模式”，也可从这里重新体验新手引导。
5. 在独立体验模式中切换周一至周日，体验七种任务；已领的同日奖励不会重复发放。
6. 预览 LV1–LV6 外观与分区：每级增加招牌、主题墙、第二展区、高级家具或限定收藏厅；播放升级动画，并补入 3 / 7 / 14 / 30 天有效经营数据后领取奖励。
7. “活动”里按风格选 2–3 件商品提交品牌选品板，再创建每周主题展；逛模拟潮店并点赞、留贴纸。
8. 返回正常店铺，原进度不变。正常存档和体验存档各自支持重置。

## 游戏规则

| 等级 | 经验门槛 | 主货架 | 心愿橱窗 |
| --- | ---: | ---: | ---: |
| LV1 | 0 | 3 | 2 |
| LV2 | 150 | 5 | 3 |
| LV3 | 400 | 7 | 4 |
| LV4 | 800 | 10 | 5 |
| LV5 | 1400 | 14 | 6 |
| LV6 | 2200 | 18 | 8 |

- 每天开张 +5 EXP，完成并领取当天经营任务 +35 EXP。两项都完成才计入连续有效经营。
- 周一：提交 2–3 件商品的选品板；周二：实际改变装修风格或装饰；周三：至少两个品类的搭配；周四：上架或替换与原位置不同的商品；周五：当天参观并点赞同一家店；周六：提交三件商品的主题展；周日：保存经营总结。
- 主题展每周可领取 60 EXP，一周只领取一次。须选三件好物，至少两件匹配主题。星期六经营奖励与主题展奖励分别结算。
- 品牌选品按风格提供 8 件模拟合作商品；选品板不占主货架，不需要拥有或购买。
- 商品上架只是陈列，不会伪造“拥有”。商品品牌和价格不影响经验。
- 连续 3 / 7 / 14 / 30 天分别解锁徽章、奖杯、灯牌和奖章，可在装修里放置。
- 断签不扣已有商品、经验或奖励。已达成的连续里程碑仍可补领。
- LV2 解锁额外展示区与新招牌，LV3 增加主题墙，LV4 增加第二展区入口，LV5 增加高级陈列家具，LV6 解锁限定收藏厅。每个展示区最多呈现三件商品，通过场景内分区控件切换。
- 日期使用浏览器本地日期；跨午夜及回到标签页时自动刷新当天。演示周固定为 2026-10-12 至 2026-10-18。

## 本地存档

| localStorage 键 | 内容 |
| --- | --- |
| `trend-buyer.normal.v1` | 正常游客存档 |
| `trend-buyer.demo.v1` | 隔离的体验存档 |
| `trend-buyer.mode.v1` | 当前模式 |
| `trend-buyer.demo-day.v1` | 体验周的星期索引 |

数据包括游客身份、店名、装修、货架、拥有来源、心愿及入手纪念、经验、日期任务、连续奖励、选品板、主题展、点赞、贴纸、操作足迹和新手引导进度。每次状态变更自动保存。旧版存档缺少教程字段时会自动迁移为“已完成引导”，不会覆盖原有货架或经营数据。异常存档备份为对应键的 `.recovery` 项并显示提示；存储被禁用或写入失败也有明确提示。

同一站点、同一浏览器的标签页共享存档；不同浏览器、隐私窗口、不同域名各自独立。清除浏览器站点数据会删除存档。本 Demo 不做跨设备同步或本地防作弊；没有声称是真实多人数据。

## GitHub Pages 部署

仓库包含 `.github/workflows/deploy-pages.yml`。推送到 `main` 后，GitHub Actions 会使用 Node.js 24 和 pnpm 构建 `out/`，自动加入仓库子路径，并发布到 GitHub Pages。项目不需要环境变量、数据库或第三方服务密钥。

仓库第一次部署时，在 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。后续每次推送都会自动更新网站。

参考：[GitHub Pages 自定义工作流](https://docs.github.com/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Next.js 静态导出](https://nextjs.org/docs/app/guides/static-exports)。

## 验证

```bash
pnpm test           # 12 项游戏状态与存档测试
pnpm typecheck      # TypeScript 检查
pnpm build          # 生产静态构建
```

自动浏览器验收（另一个终端先启动 `pnpm start`）：

```bash
pnpm exec playwright install chromium
pnpm test:browser
```

可设置 `BASE_URL` 指向其他本地端口；可设置 `CHROME_EXECUTABLE` 使用本机 Chrome，避免额外下载 Chromium。测试在新建的临时浏览器上下文中运行，不读取或清除你的日常浏览器存档。截图及 JSON 结果保存至忽略版本管理的 `test-results/`。

已实测：建店、货架替换/下架、心愿模拟购买、刷新恢复、所有七天任务、品牌选品、主题展奖励、3/7/30 天连续奖励领取、六级预览、体验存档隔离与重置；360/390/768/1440 像素下五个主页面均无横向溢出。

## 代码结构

```text
src/app/                页面入口、元数据、全局响应式样式
src/components/Game.tsx 主游戏编排、建店、弹窗、体验模式
src/components/Scene.tsx 2D/2.5D 交互店铺场景
src/components/Daily.tsx 每日经营、周历、连续奖励
src/components/Activities.tsx 品牌选品和每周主题展
src/components/Community.tsx 模拟店铺、点赞和演示榜单
src/components/Modal.tsx 原生 dialog、焦点约束、键盘关闭
src/lib/game.ts          纯函数状态转移、容量、任务、奖励去重
src/lib/storage.ts       存档校验、模式隔离、异常恢复
src/lib/catalog.ts       24 件原创演示商品数据
src/lib/community.ts     模拟店铺与预设留言
public/products/        24 张本地 SVG 商品图
scripts/serve.mjs        本地静态预览工具
 tests/                 状态测试和真实浏览器操作验收
```

后续扩展商品时可从目录数据与持久化版本迁移入手，不需要改变当前纯前端游戏模型。
