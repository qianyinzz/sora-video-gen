'use client';

import Link from 'next/link';
import { Sparkles, LogIn, LogOut, User } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();

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
            {status === 'loading' ? (
              <div className="w-20 h-8 rounded-full bg-white/5 animate-pulse"></div>
            ) : session ? (
              <>
                {/* Credits Display */}
                <div className="glass-card px-4 py-2 rounded-full border border-primary/50">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-neon-purple" />
                    {/* @ts-ignore */}
                    <span className="text-sm font-semibold text-white">{session.user?.credits ?? 0}</span>
                    <span className="text-xs text-secondary">次数</span>
                  </div>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                  {session.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full border border-primary ring-2 ring-transparent hover:ring-neon-purple transition-all"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="p-2 rounded-full hover:bg-white/5 text-secondary hover:text-red-400 transition-colors"
                    title="退出登录"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="gradient-button flex items-center gap-2 px-6"
              >
                <LogIn className="w-4 h-4" />
                登录
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
