# en 的个人随笔

## 项目定位

这是一个基于 Astro 7 的静态个人博客，面向中文随笔、AI 学习记录与内容创作经验。站点以 Markdown 为主要写作入口，构建产物部署到静态托管平台。

## 核心目录

- `src/pages/`：页面路由，包含首页、文章、归档、标签、关于、搜索与 RSS。
- `src/content/posts/`：正式文章，只接受 Markdown 与 MDX。
- `src/components/`：可复用页面组件。
- `src/layouts/`：全站基础布局与 SEO 元信息。
- `src/styles/`：主题变量、布局、组件与正文样式。
- `src/config/`：站点资料、导航和作者配置。
- `src/utils/`：内容排序、日期、阅读时间与标签路径工具。
- `public/images/`：站点使用的原创 SVG 视觉素材。
- `docs/`：Cloudflare Pages 与私有文章仓库的部署说明和模板。

## 工作流

1. 现有公开文章保留在 `src/content/posts/`；后续私有文章放入独立私有仓库 `colars/blog-content/posts/`。
2. 文章头信息必须包含 `title`、`description`、`publishedAt`、`tags`。
3. `.content/posts/` 是构建生成的合并目录，已加入 `.gitignore`，禁止提交。
4. 本地写作使用 `pnpm dev`，页面地址为 `http://localhost:4321`；启动前会自动同步内容。
5. 提交前运行 `pnpm check` 与 `pnpm build`，并确认 Pagefind 索引生成。

## Git 与远端同步

- GitHub 仓库：`https://github.com/colars/blog`
- 默认分支：`main`，远端名：`origin`
- 每次推送前都必须取得用户当次明确确认；此前对某次推送的确认不适用于后续推送。
- 代码、文章或配置改动完成后，先完成必要验证并报告待推送内容，等待用户确认后再提交和推送。
- 不使用强推，不覆盖远端历史；远端已有更新时先安全整合。
- Cloudflare 部署同样属于外部写操作，必须取得用户当次确认。

## 私有内容构建

- 公开代码仓库和公开文章历史保持不变，不再清理已有文章历史。
- 私有文章通过 `BLOG_CONTENT_REPO` 与 `CONTENT_REPO_TOKEN` 在 Cloudflare 构建时获取，或通过 `BLOG_CONTENT_DIR` 从本地私有目录同步。
- `CONTENT_REPO_TOKEN` 使用 Fine-grained Token，仅授予私有文章仓库 `Contents: Read-only`，有效期目标为 180 天。
- 禁止在日志、代码、文档示例或 Git 提交中输出真实 Token。
- 公开文章与私有文章文件名冲突时必须终止构建。
- Cloudflare Pages 项目为 `en-blog-pages`，正式生产地址为 `https://blog.xieje.cn/`。
- 向私有文章仓库推送会通过 Deploy Hook 自动部署；推送前同样必须取得用户当次确认，不单独绕过部署确认。

## 内容约定

- 中文标点使用全角符号，中英文及中文与数字之间保留半角空格。
- 默认作者为 `en`，博客名称为 `en 的个人随笔`。
- 草稿使用 `draft: true`，不会进入页面、RSS 和搜索索引。
- 封面图统一放在 `public/images/`，使用原创或已获授权的素材。

## 验证入口

- 类型与 Astro 诊断：`pnpm check`
- 生产构建与搜索索引：`pnpm build`
- 构建结果预览：`pnpm preview`

## 项目红线

- 不引入 Firefly 默认角色素材或其他未获授权的动漫图片。
- 不把真实密钥、评论服务令牌或分析服务凭据写入仓库。
- 不提交 `.content/`、`.env` 或 `CONTENT_REPO_TOKEN`。
- 不删除现有文章，除非用户明确要求。
