# Cloudflare Pages 与私有文章仓库

本项目采用「公开代码 + 私有文章」的折中方案。现有公开文章继续保留在 `src/content/posts/`，不再迁移；后续私有文章放入独立的私有 GitHub 仓库 `colars/blog-content`。

## 内容结构

私有仓库保持以下结构：

```text
blog-content/
└─ posts/
   ├─ new-private-post.md
   └─ images/
      └─ example.svg
```

构建时会生成被 Git 忽略的 `.content/posts/`，依次合并：

1. 公开文章：`src/content/posts/`
2. 私有文章：`blog-content/posts/`

文件名重复时构建会失败，不会静默覆盖。

## 创建只读 Token

在 GitHub 中创建 Fine-grained personal access token：

- Repository access：仅选择 `colars/blog-content`
- Contents：`Read-only`
- Metadata：`Read-only`
- Expiration：`180 days`

Token 只保存到 Cloudflare Pages 的环境变量中。不要写入 `.env.example`、README、GitHub 仓库或截图。

到期前生成新 Token，更新 Cloudflare 环境变量，再撤销旧 Token。

## Cloudflare Pages 配置

在 Cloudflare Pages 中创建或调整项目：

```text
Git provider: GitHub
Repository: colars/blog
Production branch: main
Build command: pnpm build
Build output directory: dist
```

设置环境变量：

```text
BLOG_CONTENT_REPO=colars/blog-content
BLOG_CONTENT_REF=main
CONTENT_REPO_TOKEN=<180 天只读 Token>
NODE_VERSION=22
```

`pnpm build` 会先运行 `prebuild`，自动合并公开文章和私有文章。

## 私有仓库自动部署

在 Cloudflare Pages 项目设置中创建一个 Deploy Hook，将 URL 保存到私有仓库的 Actions Secret：

```text
CLOUDFLARE_DEPLOY_HOOK_URL
```

将 [blog-content-deploy.yml](blog-content-deploy.yml) 复制到私有仓库的：

```text
.github/workflows/deploy-cloudflare-pages.yml
```

之后满足以下条件时会自动部署：

- 公开代码仓库 `main` 更新后，由 Cloudflare Git 集成自动构建。
- 私有仓库 `posts/**` 更新后，由 GitHub Actions 调用 Deploy Hook，触发 Cloudflare 重新拉取内容并构建。

## 本地开发

使用本地私有目录时，在 `.env` 中设置：

```text
BLOG_CONTENT_DIR=../BlogContent
```

执行：

```bash
pnpm content:sync
pnpm dev
```

也可以直接使用私有仓库测试：

```text
BLOG_CONTENT_REPO=colars/blog-content
BLOG_CONTENT_REF=main
CONTENT_REPO_TOKEN=<只读 Token>
```

本地 `.env` 已被 Git 忽略。

## 验证清单

- 公开文章数量与合并前一致。
- 私有文章能出现在首页、归档、标签、分类、RSS 与搜索中。
- 公开仓库中不存在新增私有文章源码。
- Token 失效或权限不足时构建失败，且错误日志不输出 Token。
- 私有仓库推送后 Deploy Hook 成功触发部署。
