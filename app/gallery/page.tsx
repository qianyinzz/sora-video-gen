import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Play, Download, Clock, Film, Calendar } from 'lucide-react';

export default async function GalleryPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            videos: {
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!user) {
        redirect('/');
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">我的作品</h1>
                <p className="text-secondary">查看和管理您生成的视频</p>
            </div>

            {user.videos.length === 0 ? (
                <div className="text-center py-20 glass-card">
                    <Film className="w-16 h-16 mx-auto mb-4 text-tertiary opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">暂无作品</h3>
                    <p className="text-secondary mb-6">您还没有生成过任何视频</p>
                    <a href="/" className="gradient-button inline-flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        去生成视频
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {user.videos.map((video) => (
                        <div key={video.id} className="glass-card overflow-hidden group">
                            {/* Video Preview */}
                            <div className="aspect-video bg-dark-200 relative">
                                {video.status === 'completed' && video.videoUrl ? (
                                    <video
                                        src={video.videoUrl}
                                        className="w-full h-full object-cover"
                                        controls
                                        poster={video.thumbnailUrl || undefined}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {video.status === 'processing' || video.status === 'pending' ? (
                                            <div className="text-center">
                                                <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                                <span className="text-xs text-secondary">生成中...</span>
                                            </div>
                                        ) : (
                                            <div className="text-center text-red-500">
                                                <span className="text-xs">生成失败</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Overlay Info */}
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${video.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                            video.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                                                'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                        {video.status === 'completed' ? '已完成' :
                                            video.status === 'failed' ? '失败' : '生成中'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <p className="text-sm text-secondary line-clamp-2 mb-3 h-10" title={video.prompt}>
                                    {video.prompt}
                                </p>

                                <div className="flex items-center justify-between text-xs text-tertiary">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {video.duration}s
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(video.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {video.status === 'completed' && video.videoUrl && (
                                        <a
                                            href={video.videoUrl}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-full hover:bg-white/5 text-secondary hover:text-neon-purple transition-colors"
                                            title="下载视频"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
