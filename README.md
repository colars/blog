# en 的个人随笔

一个参考 Firefly 的轻盈排版与卡片布局、但独立实现的 Astro 个人博客。站点采用静态生成，适合记录 AI 学习、内容创作与日常思考。

GitHub 仓库：[colars/blog](https://github.com/colars/blog)

## 技术栈

- Astro 7 + TypeScript
- Tailwind CSS 4
- Markdown 内容集合
- Pagefind 静态全文搜索
- RSS、Sitemap 与基础 SEO

## 环境要求

- Node.js `>=22.23.0`
- pnpm `>=11`

## 本地开发

```bash
pnpm install
pnpm dev
```

开发地址为 `http://localhost:4321`。

Pagefind 搜索索引只会在生产构建时生成。开发模式下可以正常写作和浏览页面；需要验证搜索时，请执行：

```bash
pnpm build
pnpm preview
```

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm check` | 检查 Astro 与 TypeScript |
| `pnpm build` | 生产构建并生成 Pagefind 搜索索引 |
| `pnpm preview` | 本地预览生产构建 |

## 新增文章

在 `src/content/posts/` 中创建 Markdown 文件：

```yaml
---
title: "文章标题"
description: "一句文章摘要"
publishedAt: 2026-11-12
updatedAt: 2026-11-12
category: "随笔"
tags: ["AI", "写作"]
cover: "/images/cover-ai.svg"
featured: false
draft: false
---
```

支持标准 Markdown、标题目录、代码高亮和上一篇／下一篇导航。设置 `draft: true` 后，文章不会进入正式页面、RSS 或搜索索引。

## 私有文章与 Cloudflare Pages

现有三篇文章继续保留在公开仓库。后续文章可以放入私有仓库 `colars/blog-content/posts/`，构建时自动与公开文章合并，公开代码的 Fork 不会包含后续私有文章源码。

Cloudflare Pages 使用：

```text
Build command: pnpm build
Output directory: dist
Environment:
  BLOG_CONTENT_REPO=colars/blog-content
  BLOG_CONTENT_REF=main
  CONTENT_REPO_TOKEN=<180 天只读 Token>
  NODE_VERSION=22
```

`pnpm dev`、`pnpm check` 和 `pnpm build` 均会在执行前自动运行内容同步。完整配置、Token 权限和 Deploy Hook 工作流见 [Cloudflare Pages 部署说明](docs/cloudflare-pages.md)。

## 站点配置

- 站点名称与作者资料：`src/config/site.ts`
- 导航结构：`src/components/Header.astro`
- 主题颜色与全局样式：`src/styles/global.css`
- 部署域名：修改 `astro.config.mjs` 中的 `site`

## 部署

构建命令为 `pnpm build`，输出目录为 `dist/`。可部署到 Cloudflare Pages、Vercel 或 Netlify，平台框架预设选择 Astro。

当前使用 `https://en-blog.example.com` 作为 SEO 占位域名，上线前必须替换为真实域名。

## 视觉来源

界面设计参考 [CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly) 的轻盈卡片与双栏信息组织方式。本项目未复制其角色素材；当前视觉均由 CSS 与原创 SVG 实现。
