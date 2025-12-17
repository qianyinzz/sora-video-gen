'use client';

import { useState, useRef } from 'react';
import { Wand2, Plus, X, Image as ImageIcon, Play, Download, Clock, Film } from 'lucide-react';

interface GeneratedVideo {
    id: string;
    prompt: string;
    videoUrl: string;
    thumbnailUrl: string;
    status: 'generating' | 'completed' | 'failed';
    createdAt: Date;
    settings: {
        orientation: string;
        size: string;
        duration: number;
    };
}

export default function VideoGenerator() {
    const [prompt, setPrompt] = useState('');
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentVideo, setCurrentVideo] = useState<GeneratedVideo | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [settings, setSettings] = useState({
        orientation: 'landscape',
        size: 'large',
        duration: 10,
    });
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('请输入视频描述');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            // Call generate API
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    settings,
                    hasImages: uploadedImages.length > 0,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = typeof data.error === 'string'
                    ? data.error
                    : JSON.stringify(data.error) || '生成失败';
                throw new Error(errorMessage);
            }

            // Create new video entry
            const newVideo: GeneratedVideo = {
                id: data.taskId,
                prompt,
                videoUrl: '',
                thumbnailUrl: '',
                status: 'generating',
                createdAt: new Date(),
                settings: { ...settings }
            };

            setCurrentVideo(newVideo);
            setGeneratedVideos([newVideo, ...generatedVideos]);

            // Start polling for status
            pollVideoStatus(data.taskId);

        } catch (error: unknown) {
            console.error('Generate error:', error);
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            setError(errorMessage);
            setIsGenerating(false);
        }
    };

    const pollVideoStatus = async (taskId: string) => {
        const maxAttempts = 60; // Poll for up to 5 minutes (60 * 5s)
        let attempts = 0;

        const poll = async () => {
            try {
                const response = await fetch(`/api/status/${taskId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || '查询失败');
                }

                // Update video status
                const updatedVideo: GeneratedVideo = {
                    id: taskId,
                    prompt: currentVideo?.prompt || prompt,
                    videoUrl: data.videoUrl || '',
                    thumbnailUrl: data.thumbnailUrl || '',
                    status: data.status === 'completed' ? 'completed' :
                        data.status === 'failed' ? 'failed' : 'generating',
                    createdAt: currentVideo?.createdAt || new Date(),
                    settings: currentVideo?.settings || settings
                };

                setCurrentVideo(updatedVideo);
                setGeneratedVideos(prev =>
                    prev.map(v => v.id === taskId ? updatedVideo : v)
                );

                if (data.status === 'completed') {
                    setIsGenerating(false);
                    console.log('Video generated successfully:', data.videoUrl);
                } else if (data.status === 'failed') {
                    setIsGenerating(false);
                    alert('视频生成失败：' + (data.error || '未知错误'));
                } else {
                    // Continue polling
                    attempts++;
                    if (attempts < maxAttempts) {
                        setTimeout(poll, 5000); // Poll every 5 seconds
                    } else {
                        setIsGenerating(false);
                        alert('生成超时，请稍后查看历史记录');
                    }
                }
            } catch (error: unknown) {
                console.error('Poll error:', error);
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(poll, 5000); // Retry
                } else {
                    setIsGenerating(false);
                    alert('查询失败，请稍后重试');
                }
            }
        };

        poll();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newImages = Array.from(files);
            setUploadedImages([...uploadedImages, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full max-w-7xl mx-auto animate-fade-in space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Left Panel - Controls */}
                <div className="space-y-6">
                    {/* Main Prompt Input with Image Upload */}
                    <div className="glass-card p-6">
                        <label className="block text-sm font-semibold mb-3 text-secondary">
                            描述你想生成的视频
                        </label>
                        <div className="relative">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="例如：夜晚的赛博朋克城市，霓虹灯闪烁，无人机在高楼间穿梭..."
                                className="textarea-primary pr-16"
                                rows={6}
                            />
                            {/* Upload Button */}
                            <button
                                type="button"
                                onClick={triggerFileUpload}
                                className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-neon-purple/50 group"
                                title="上传参考图片"
                            >
                                <Plus className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>

                        {/* Image Preview */}
                        {uploadedImages.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-tertiary">
                                    <ImageIcon className="w-4 h-4" />
                                    <span>参考图片 ({uploadedImages.length})</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {uploadedImages.map((file, index) => (
                                        <div
                                            key={index}
                                            className="relative group w-16 h-16 rounded-lg overflow-hidden border border-primary hover:border-neon-purple transition-colors"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Upload ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-2.5 h-2.5 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-2 flex items-center text-xs text-tertiary">
                            <span>Ctrl+Enter 快速生成</span>
                            <span className="text-neon-blue/70 ml-3">• 点击 + 上传参考图</span>
                        </div>
                    </div>

                    {/* Video Settings */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold mb-4 text-secondary">视频参数</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Orientation */}
                            <div>
                                <label className="block text-xs text-tertiary mb-2">视频方向</label>
                                <select
                                    value={settings.orientation}
                                    onChange={(e) =>
                                        setSettings({ ...settings, orientation: e.target.value })
                                    }
                                    className="select-primary"
                                >
                                    <option value="landscape">横屏</option>
                                    <option value="portrait">竖屏</option>
                                </select>
                            </div>

                            {/* Size */}
                            <div>
                                <label className="block text-xs text-tertiary mb-2">分辨率</label>
                                <select
                                    value={settings.size}
                                    onChange={(e) =>
                                        setSettings({ ...settings, size: e.target.value })
                                    }
                                    className="select-primary"
                                >
                                    <option value="small">720p</option>
                                    <option value="large">1080p</option>
                                </select>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-xs text-tertiary mb-2">时长</label>
                                <select
                                    value={settings.duration}
                                    onChange={(e) =>
                                        setSettings({ ...settings, duration: Number(e.target.value) })
                                    }
                                    className="select-primary"
                                >
                                    <option value={5}>5秒</option>
                                    <option value={10}>10秒</option>
                                    <option value={15}>15秒</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2 animate-fade-in">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {error}
                        </div>
                    )}

                    {/* Generate Button */}
                    <div>
                        <button
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || isGenerating}
                            className="gradient-button w-full text-lg py-4 inline-flex items-center justify-center gap-2"
                        >
                            <Wand2 className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                            {isGenerating ? '生成中...' : '开始生成'}
                        </button>
                        <p className="mt-3 text-xs text-tertiary text-center">
                            每次生成消耗 <span className="text-neon-purple font-semibold">1 次数</span>
                        </p>
                    </div>
                </div>

                {/* Right Panel - Preview */}
                <div>
                    {/* Current Video Preview */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold mb-4 text-secondary flex items-center gap-2">
                            <Film className="w-4 h-4" />
                            视频预览
                        </h3>
                        {currentVideo ? (
                            <div className="space-y-4">
                                {/* Video Player Area */}
                                <div className="relative aspect-video bg-dark-200 rounded-lg overflow-hidden border border-primary">
                                    {currentVideo.status === 'generating' ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 border-4 border-neon-purple border-t-transparent rounded-full animate-spin mb-4"></div>
                                            <p className="text-secondary text-sm">视频生成中...</p>
                                            <p className="text-tertiary text-xs mt-2">预计需要 30-60 秒</p>
                                        </div>
                                    ) : currentVideo.status === 'completed' && currentVideo.videoUrl ? (
                                        <video
                                            src={currentVideo.videoUrl}
                                            controls
                                            loop
                                            className="w-full h-full object-contain"
                                            poster={currentVideo.thumbnailUrl}
                                        >
                                            您的浏览器不支持视频播放
                                        </video>
                                    ) : currentVideo.status === 'completed' ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neon-purple/20 to-neon-blue/20">
                                            <div className="text-center">
                                                <div className="w-20 h-20 rounded-full bg-dark-100/80 backdrop-blur-sm border border-neon-purple flex items-center justify-center mb-4 mx-auto hover:scale-110 transition-transform cursor-pointer">
                                                    <Play className="w-10 h-10 text-neon-purple" />
                                                </div>
                                                <p className="text-secondary text-sm">视频已生成</p>
                                                <p className="text-tertiary text-xs mt-2">URL加载中...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <p className="text-red-500 text-sm">生成失败</p>
                                        </div>
                                    )}
                                </div>

                                {/* Video Info */}
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm text-secondary line-clamp-2">{currentVideo.prompt}</p>
                                        </div>
                                        {currentVideo.status === 'completed' && currentVideo.videoUrl && (
                                            <a
                                                href={currentVideo.videoUrl}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-secondary flex items-center gap-2 text-xs px-3 py-2"
                                            >
                                                <Download className="w-3 h-3" />
                                                下载
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-tertiary">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {currentVideo.settings.duration}秒
                                        </span>
                                        <span>{currentVideo.settings.size === 'large' ? '1080p' : '720p'}</span>
                                        <span>{currentVideo.settings.orientation === 'landscape' ? '横屏' : '竖屏'}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="aspect-video bg-dark-200 rounded-lg border border-dashed border-primary flex items-center justify-center">
                                <div className="text-center">
                                    <Film className="w-12 h-12 mx-auto mb-3 text-tertiary opacity-50" />
                                    <p className="text-tertiary text-sm">在左侧输入提示词开始生成视频</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Video History - Full Width Bottom Section */}
            {generatedVideos.length > 0 && (
                <div className="glass-card p-6">
                    <h3 className="text-sm font-semibold mb-4 text-secondary">生成历史</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {generatedVideos.map((video) => (
                            <div
                                key={video.id}
                                onClick={() => setCurrentVideo(video)}
                                className={`p-3 rounded-lg border transition-all cursor-pointer ${currentVideo?.id === video.id
                                    ? 'border-neon-purple bg-neon-purple/5'
                                    : 'border-primary hover:border-neon-blue'
                                    }`}
                            >
                                <div className="space-y-3">
                                    <div className="aspect-video bg-dark-200 rounded flex items-center justify-center border border-primary">
                                        {video.status === 'generating' ? (
                                            <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Play className="w-8 h-8 text-tertiary" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-secondary line-clamp-2 mb-2">{video.prompt}</p>
                                        <div className="flex items-center gap-2 text-xs text-tertiary flex-wrap">
                                            <span className={`px-2 py-0.5 rounded text-xs ${video.status === 'generating' ? 'bg-yellow-500/20 text-yellow-500' :
                                                video.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                                    'bg-red-500/20 text-red-500'
                                                }`}>
                                                {video.status === 'generating' ? '生成中' :
                                                    video.status === 'completed' ? '已完成' : '失败'}
                                            </span>
                                            <span>{video.settings.duration}秒</span>
                                            <span>{video.settings.size === 'large' ? '1080p' : '720p'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
