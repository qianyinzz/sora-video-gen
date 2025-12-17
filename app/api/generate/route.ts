import { NextResponse } from 'next/server';

//步骤4: 添加Sora API调用
export async function POST(request: Request) {
    try {
        console.log('=== Video Generation API Called ===');

        const body = await request.json();
        const { prompt, settings } = body;

        console.log('Request:', { prompt, settings });

        // 验证输入
        if (!prompt || prompt.trim().length === 0) {
            return NextResponse.json({
                error: '提示词不能为空'
            }, { status: 400 });
        }

        // 读取环境变量
        const apiKey = process.env.SORA_API_KEY;
        const apiEndpoint = process.env.SORA_API_ENDPOINT || 'https://yunwu.ai';

        console.log('Environment Check:', {
            hasApiKey: !!apiKey,
            keyLength: apiKey?.length || 0,
            endpoint: apiEndpoint
        });

        if (!apiKey || apiKey === 'your-sora-api-key-here') {
            return NextResponse.json({
                error: 'API密钥未配置，请在.env.local中设置'
            }, { status: 500 });
        }

        // 准备请求数据
        const requestPayload = {
            prompt: prompt,
            model: 'sora-2',
            orientation: settings?.orientation || 'landscape',
            size: settings?.size || 'large',
            duration: settings?.duration || 10,
            watermark: false,  // 强制无水印
            private: false,    // 公开视频
            images: [],        // 暂时不支持图片上传
        };

        console.log('Calling Sora API with:', requestPayload);

        // 调用Sora API
        const apiResponse = await fetch(`${apiEndpoint}/v1/video/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(requestPayload),
        });

        console.log('Sora API Status:', apiResponse.status);

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error('Sora API Error:', errorText);

            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText };
            }

            const errorMessage = typeof errorData.message === 'string' ? errorData.message :
                typeof errorData.error === 'string' ? errorData.error :
                    JSON.stringify(errorData.message || errorData.error || '视频生成失败');

            return NextResponse.json({
                error: errorMessage
            }, { status: apiResponse.status });
        }

        const data = await apiResponse.json();
        console.log('Sora API Success:', data);

        return NextResponse.json({
            success: true,
            taskId: data.id || data.task_id || Date.now().toString(),
            status: data.status || 'processing',
            message: '视频生成已开始',
        });

    } catch (error: unknown) {
        console.error('API Route Error:', error);
        console.error('Error Stack:', error instanceof Error ? error.stack : 'No stack trace');

        return NextResponse.json({
            error: `服务器错误: ${error instanceof Error ? error.message : 'Unknown error'}`
        }, { status: 500 });
    }
}
