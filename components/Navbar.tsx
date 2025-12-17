import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass-card">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold neon-text">SoraGen</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              生成视频
            </Link>
            <Link
              href="/gallery"
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              我的作品
            </Link>
            <Link
              href="/inspiration"
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              灵感库
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              定价
            </Link>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {/* Credits Display */}
            <div className="glass-card px-4 py-2 rounded-full">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neon-purple" />
                <span className="text-sm font-semibold">30</span>
                <span className="text-xs text-secondary">次数</span>
              </div>
            </div>

            {/* Login Button / User Avatar */}
            <button className="gradient-button">
              登录
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
