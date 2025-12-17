import VideoGenerator from '@/components/VideoGenerator';

export default function HomePage() {
  return (
    <div className="container mx-auto px-6 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
          AI 视频生成，灵感即现实
        </h1>
        <p className="text-lg text-secondary max-w-2xl mx-auto">
          使用先进的 Sora AI 技术，将您的创意转化为精美视频
        </p>
      </div>

      {/* Video Generator */}
      <VideoGenerator />

      {/* Features */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 text-center glass-card-hover">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="font-semibold mb-2">快速生成</h3>
          <p className="text-sm text-secondary">
            平均 2-3 分钟完成视频生成
          </p>
        </div>

        <div className="glass-card p-6 text-center glass-card-hover">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <span className="text-2xl">🎨</span>
          </div>
          <h3 className="font-semibold mb-2">高质量输出</h3>
          <p className="text-sm text-secondary">
            支持 1080p 高清视频生成
          </p>
        </div>

        <div className="glass-card p-6 text-center glass-card-hover">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
          <h3 className="font-semibold mb-2">灵活定价</h3>
          <p className="text-sm text-secondary">
            新用户赠送 30 次免费额度
          </p>
        </div>
      </div>
    </div>
  );
}
