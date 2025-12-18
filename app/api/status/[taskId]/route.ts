import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { taskId } = await params;

        if (!taskId) {
            return NextResponse.json(
                { error: '任务ID不能为空' },
                { status: 400 }
            );
        }

        const apiKey = process.env.SORA_API_KEY;
        const apiEndpoint = process.env.SORA_API_ENDPOINT || 'https://yunwu.ai';

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API 配置错误' },
                { status: 500 }
            );
        }

        // Query Sora2API for task status
        const response = await fetch(`${apiEndpoint}/v1/video/query?id=${taskId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Sora API Status Error:', {
                status: response.status,
                taskId,
                error: errorData
            });

            const errorMessage = errorData.message || errorData.error || '查询失败，请稍后重试';
            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            );
        }

        const data = await response.json();

        console.log('Status API Response:', {
            taskId,
            status: response.status,
            data: data
        });

        // Map API response to our format
        const result = {
            taskId: data.id,
            status: data.status, // pending, processing, completed, failed
            videoUrl: data.video_url || null,
            thumbnailUrl: data.cover_url || null, // 尝试获取封面图，如果没有则为null
            progress: data.status === 'completed' ? 100 :
                data.status === 'processing' ? 50 : 0,
            estimatedTime: data.status === 'pending' ? 60 : null,
            error: data.status === 'failed' ? '任务失败' : null,
            enhancedPrompt: data.enhanced_prompt,
            statusUpdateTime: data.status_update_time,
        };

        // Update database if status changed or completed
        if (data.status === 'completed' || data.status === 'failed') {
            try {
                await prisma.video.update({
                    where: { taskId: taskId },
                    data: {
                        status: data.status,
                        videoUrl: result.videoUrl,
                        thumbnailUrl: result.thumbnailUrl,
                    },
                });
            } catch (dbError) {
                console.error('Failed to update video status in DB:', dbError);
                // Don't fail the request if DB update fails, just log it
            }
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Get video status error:', error);
        return NextResponse.json(
            { error: '服务器错误，请稍后重试' },
            { status: 500 }
        );
    }
}
