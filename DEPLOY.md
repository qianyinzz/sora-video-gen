# 部署指南

## 1. 数据库迁移 (重要)

由于 Vercel 等 Serverless 环境不支持 SQLite 持久化存储，我们需要切换到 PostgreSQL。

### 推荐方案：Vercel Postgres

1. 在 Vercel 项目控制台，点击 **Storage** -> **Create Database** -> **Postgres**。
2. 创建后，将生成的环境变量（`POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING` 等）添加到项目中。
3. 修改 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL") // uses connection pooling
  directUrl = env("POSTGRES_URL_NON_POOLING") // uses a direct connection
}
```

4. 本地生成迁移文件：
```bash
npx prisma migrate dev --name init_postgres
```

## 2. 环境变量配置

在 Vercel 项目设置中配置以下环境变量：

- `SORA_API_KEY`: 您的 Sora API 密钥
- `SORA_API_ENDPOINT`: https://yunwu.ai
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret
- `NEXTAUTH_URL`: https://您的域名.vercel.app
- `NEXTAUTH_SECRET`: 生成一个随机字符串 (可以使用 `openssl rand -base64 32`)

## 3. Google OAuth 回调地址

部署后，记得在 Google Cloud Console 中添加新的回调地址：
`https://您的域名.vercel.app/api/auth/callback/google`
