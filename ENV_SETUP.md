# Sora Video Generation Platform - Environment Variables
# 复制此文件为 .env.local 并填入您的实际配置

# ==============================================
# 第一优先级：Sora2API 配置（视频生成核心功能）
# ==============================================
# Sora2API 密钥 - 从 https://yunwu.ai 获取
SORA_API_KEY=your-sora-api-key-here

# Sora2API 端点 - 默认使用官方端点
SORA_API_ENDPOINT=https://yunwu.ai

# ==============================================
# 第二优先级：数据库配置（用户数据存储）
# ==============================================
# PostgreSQL 数据库连接字符串
# 格式: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://user:password@localhost:5432/sora_db

# ==============================================  
# 第三优先级：用户认证（NextAuth）
# ==============================================
# NextAuth URL - 本地开发使用 localhost，生产环境使用实际域名
NEXTAUTH_URL=http://localhost:3000

# NextAuth Secret - 生成方法: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-key-change-this-in-production

# Google OAuth 凭据 - 从 Google Cloud Console 获取
# https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ==============================================
# 第四优先级：AWS S3 存储（图片/视频存储）
# ==============================================
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1

# ==============================================
# 第五优先级：Stripe 支付（积分购买）
# ==============================================
# Stripe 公钥（前端使用）
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxx

# Stripe 密钥（后端使用）
STRIPE_SECRET_KEY=sk_test_xxx

# Stripe Webhook 密钥
STRIPE_WEBHOOK_SECRET=whsec_xxx

# ==============================================
# 开发说明
# ==============================================
# 1. 当前阶段只需要配置 SORA_API_KEY 即可开始测试视频生成
# 2. 其他配置可以在后续功能开发时逐步添加
# 3. 生产环境请确保修改所有敏感信息，特别是 NEXTAUTH_SECRET
