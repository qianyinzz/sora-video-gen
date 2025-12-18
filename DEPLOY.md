# 部署指南 (Supabase + Vercel)

## 1. Supabase 数据库设置

1. 登录 [Supabase](https://supabase.com/) 并创建一个新项目。
2. 进入项目设置 -> **Database**。
3. 找到 **Connection parameters**。
4. 获取以下两个连接字符串：
   - **Transaction Pooler (用于 `DATABASE_URL`)**: 端口通常是 6543。
   - **Session Pooler (用于 `DIRECT_URL`)**: 端口通常是 5432。

## 2. 环境变量配置

在 Vercel 项目设置中配置以下环境变量：

```env
# Supabase Database
DATABASE_URL="postgres://[user]:[password]@[host]:6543/[db]?pgbouncer=true"
DIRECT_URL="postgres://[user]:[password]@[host]:5432/[db]"

# Sora API
SORA_API_KEY=您的Sora密钥
SORA_API_ENDPOINT=https://yunwu.ai

# Google Auth
GOOGLE_CLIENT_ID=您的GoogleClientId
GOOGLE_CLIENT_SECRET=您的GoogleClientSecret

# NextAuth
NEXTAUTH_URL=https://您的域名.vercel.app
NEXTAUTH_SECRET=生成一个随机字符串
```

## 3. 数据库迁移

在本地配置好 `.env.local` 后，运行以下命令将数据库结构推送到 Supabase：

```bash
npx prisma migrate dev --name init_supabase
```

## 4. Google OAuth 回调地址

部署后，记得在 Google Cloud Console 中添加新的回调地址：
`https://您的域名.vercel.app/api/auth/callback/google`
