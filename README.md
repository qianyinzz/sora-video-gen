# Sora Video Generator

一个基于 Next.js 16 和 Sora-2 模型的 AI 视频生成应用。

## 功能特点

- 🎬 使用 Sora-2 AI 模型生成高质量视频
- 📱 响应式设计，支持桌面和移动设备
- ⚙️ 可自定义视频设置（方向、尺寸、时长）
- 📊 实时查看生成进度
- 🎨 现代化 UI，采用玻璃拟态设计风格
- ⚡ Next.js 16 + TypeScript + Tailwind CSS

## 技术栈

- [Next.js 16](https://nextjs.org/) - React 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Lucide React](https://lucide.dev/) - 图标库

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/qianyinzz/sora-video-gen.git
cd sora-video-gen
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env.local` 文件并配置以下变量：

```env
# Sora2API 配置
SORA_API_KEY=your-api-key-here
SORA_API_ENDPOINT=https://yunwu.ai
```

### 4. 运行项目

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## API 文档

### 创建视频

- **端点**: `POST /v1/video/create`
- **必需参数**:
  - `prompt`: 视频描述
  - `model`: 模型名称 (使用 `sora-2`)
  - `orientation`: 方向 (`portrait` 或 `landscape`)
  - `size`: 尺寸 (`small` 或 `large`)
  - `duration`: 时长（秒）
  - `watermark`: 是否添加水印
  - `private`: 是否隐藏视频
  - `images`: 图片链接数组

### 查询状态

- **端点**: `GET /v1/video/query?id={taskId}`
- **返回字段**:
  - `id`: 任务 ID
  - `status`: 状态 (`pending`, `processing`, `completed`, `failed`)
  - `video_url`: 视频链接（完成后）
  - `enhanced_prompt`: 增强后的提示词

## 项目结构

```
sora-video-gen/
├── app/
│   ├── api/
│   │   ├── generate/         # 创建视频 API
│   │   ├── status/          # 查询状态 API
│   │   └── test/            # 测试 API
│   ├── globals.css          # 全局样式
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 首页
├── components/
│   ├── Navbar.tsx           # 导航栏
│   └── VideoGenerator.tsx   # 视频生成器
└── README.md                # 项目说明
```

## 部署

### Vercel 部署

1. 将项目推送到 GitHub
2. 在 [Vercel](https://vercel.com) 上导入项目
3. 配置环境变量
4. 部署完成

### 其他平台

确保在部署时设置以下环境变量：
- `SORA_API_KEY`
- `SORA_API_ENDPOINT`

## 注意事项

- 请妥善保管 API 密钥，不要提交到版本控制系统
- 确保账户有足够的余额来生成视频
- 视频生成可能需要一些时间，请耐心等待

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
