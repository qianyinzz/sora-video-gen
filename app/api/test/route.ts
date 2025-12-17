import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ message: 'API is working!' });
}

export async function POST(request: Request) {
    try {
        const apiKey = process.env.SORA_API_KEY;
        const apiEndpoint = process.env.SORA_API_ENDPOINT || 'https://yunwu.ai';

        // 测试正确的 API 调用格式
        const testPayload = {
            prompt: "A beautiful sunset over the ocean",
            model: "sora-2",
            orientation: "landscape",
            size: "large",
            duration: 10,
            watermark: false,
            private: true,
            images: []
        };

        console.log('Testing API call with payload:', testPayload);

        const response = await fetch(`${apiEndpoint}/v1/video/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(testPayload),
        });

        const responseData = await response.json();

        console.log('API Response Status:', response.status);
        console.log('API Response Data:', responseData);

        // 如果创建成功，尝试查询状态
        if (response.ok && responseData.id) {
            console.log('Testing status query with task ID:', responseData.id);

            const statusResponse = await fetch(`${apiEndpoint}/v1/video/query?id=${responseData.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
            });

            const statusData = await statusResponse.json();

            console.log('Status API Response Status:', statusResponse.status);
            console.log('Status API Response Data:', statusData);

            return NextResponse.json({
                createResponse: {
                    status: response.status,
                    success: response.ok,
                    data: responseData,
                },
                statusResponse: {
                    status: statusResponse.status,
                    success: statusResponse.ok,
                    data: statusData,
                },
                message: '测试完成'
            });
        }

        return NextResponse.json({
            status: response.status,
            success: response.ok,
            data: responseData,
            message: response.ok ? 'API 调用成功' : 'API 调用失败'
        });

    } catch (error: unknown) {
        console.error('Test API error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error',
            message: '测试 API 调用时出错'
        }, { status: 500 });
    }
}
