import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        console.log('=== Video Generation API Called ===');

        // 1. 验证用户登录
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({
                error: '请先登录'
            }, { status: 401 });
        }

        // 2. 获取用户并检查积分
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({
                error: '用户不存在'
            }, { status: 404 });
        }

        if (user.credits < 1) {
            return NextResponse.json({
                error: '积分不足，请充值'
            }, { status: 403 });
        }

        const body = await request.json();
        const { prompt, settings } = body;

        console.log('Request:', { prompt, settings, user: user.email });

        // 验证输入
        if (!prompt || prompt.trim().length === 0) {
            return NextResponse.json({
                error: '提示词不能为空'
            }, { status: 400 });
        }

        // 读取环境变量
        const apiKey = process.env.SORA_API_KEY;
        const apiEndpoint = process.env.SORA_API_ENDPOINT || 'https://yunwu.ai';

        if (!apiKey || apiKey === 'your-sora-api-key-here') {
            return NextResponse.json({
                error: 'API密钥未配置'
            }, { status: 500 });
        }

        // 3. 扣除积分并创建视频记录 (使用事务确保数据一致性)
        // 注意：由于我们要先调用外部API，这里不能简单的把所有操作放在一个事务里，
        // 因为外部API调用时间较长。
        // 策略：先扣费并创建记录 -> 调用API -> 成功则更新taskId，失败则退款并标记失败

        // 3.1 扣费并创建初始记录
        const video = await prisma.$transaction(async (tx) => {
            // 再次检查积分（防止并发）
            const currentUser = await tx.user.findUnique({
                where: { id: user.id },
            });

            if (!currentUser || currentUser.credits < 1) {
                throw new Error('CREDITS_NOT_ENOUGH');
            }

            // 扣费
            await tx.user.update({
                where: { id: user.id },
                data: { credits: { decrement: 1 } },
            });

            // 创建视频记录
            return await tx.video.create({
                data: {
                    userId: user.id,
                    prompt: prompt,
                    status: 'pending',
                    duration: settings?.duration || 10,
                    size: settings?.size || 'large',
                    orientation: settings?.orientation || 'landscape',
                },
            });
        });

        try {
            // 4. 准备请求数据
            const requestPayload = {
                prompt: prompt,
                model: 'sora-2',
                orientation: settings?.orientation || 'landscape',
                size: settings?.size || 'large',
                duration: settings?.duration || 10,
                watermark: false,
                private: false,
                images: [],
            };

            console.log('Calling Sora API with:', requestPayload);

            // 5. 调用Sora API
            const apiResponse = await fetch(`${apiEndpoint}/v1/video/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify(requestPayload),
            });

            if (!apiResponse.ok) {
                const errorText = await apiResponse.text();
                throw new Error(`Sora API Error: ${errorText}`);
            }

            const data = await apiResponse.json();
            console.log('Sora API Success:', data);

            const taskId = data.id || data.task_id;

            // 6. 更新视频记录
            await prisma.video.update({
                where: { id: video.id },
                data: {
                    taskId: taskId,
                    status: 'processing', // API调用成功，状态变为处理中
                },
            });

            return NextResponse.json({
                success: true,
                taskId: taskId,
                status: 'processing',
                message: '视频生成已开始',
            });

        } catch (error: any) {
            console.error('Generation Process Error:', error);

            // 7. 失败处理：退还积分并更新状态
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: user.id },
                    data: { credits: { increment: 1 } },
                }),
                prisma.video.update({
                    where: { id: video.id },
                    data: {
                        status: 'failed',
                        // 存储错误信息以便排查
                        prompt: `${video.prompt} [Error: ${error.message}]`
                    },
                }),
            ]);

            return NextResponse.json({
                error: error.message || '视频生成失败，积分已退还'
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('API Route Error:', error);

        if (error.message === 'CREDITS_NOT_ENOUGH') {
            return NextResponse.json({
                error: '积分不足，请充值'
            }, { status: 403 });
        }

        return NextResponse.json({
            error: `服务器错误: ${error.message}`
        }, { status: 500 });
    }
}
