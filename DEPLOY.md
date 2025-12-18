# 部署指南 (Supabase + Vercel)

## 1. 获取 Supabase 数据库连接信息 (最关键的一步)

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)。
2. 进入您的项目。
3. 点击左下角的 **Project Settings** (齿轮图标)。
4. 点击左侧菜单的 **Database**。
5. 向下滚动找到 **Connection parameters** 部分。
6. **获取 `DATABASE_URL` (用于连接池)**:
   - 确保 **Mode** 选择为 `Transaction`。
   - 复制 **URI** (通常端口是 `6543`)。
   - **注意**: 复制后的链接中 `[YOUR-PASSWORD]` 需要替换为您创建项目时设置的数据库密码。
   - **重要**: 在链接末尾添加 `?pgbouncer=true` (如果还没有的话)。
   - *示例*: `postgres://postgres.xxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

7. **获取 `DIRECT_URL` (用于直接连接)**:
   - 将 **Mode** 切换为 `Session`。
   - 复制 **URI** (通常端口是 `5432`)。
   - 同样替换密码。
   - *示例*: `postgres://postgres.xxxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres`

## 2. 在 Vercel 配置环境变量

1. 登录 Vercel，进入您的项目页面。
2. 点击顶部的 **Settings** 选项卡。
3. 点击左侧菜单的 **Environment Variables**。
4. 逐个添加以下变量 (Key 和 Value)：

| Key | Value 说明 |
|-----|------------|
| `DATABASE_URL` | 上一步获取的 **Transaction** 模式链接 (端口 6543) |
| `DIRECT_URL` | 上一步获取的 **Session** 模式链接 (端口 5432) |
| `SORA_API_KEY` | 您的 Sora API 密钥 |
| `SORA_API_ENDPOINT` | `https://yunwu.ai` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console 中的 Client ID |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console 中的 Client Secret |
| `NEXTAUTH_URL` | 您的 Vercel 域名 (例如 `https://sora-gen.vercel.app`) |
| `NEXTAUTH_SECRET` | 任意长随机字符串 (用于加密 Session) |

5. 添加完所有变量后，如果您的项目已经在部署中，需要去 **Deployments** 页面点击 **Redeploy** 才能生效。

## 3. 数据库迁移 (本地操作)

在您本地电脑上：

1. 创建 `.env` 文件，填入上面获取的 `DATABASE_URL` 和 `DIRECT_URL`。
2. 运行迁移命令，将表结构推送到 Supabase：
   ```bash
   npx prisma migrate dev --name init_supabase
   ```

## 4. Google OAuth 回调地址

部署成功获得域名后：
1. 回到 [Google Cloud Console](https://console.cloud.google.com/)。
2. 找到您的 OAuth 2.0 Client ID 设置。
3. 在 **Authorized redirect URIs** 中添加：
   `https://您的项目域名.vercel.app/api/auth/callback/google`
