import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { imageUrl, fileName } = await request.json();

        if (!imageUrl) {
            return NextResponse.json(
                { error: '이미지 URL이 필요합니다' },
                { status: 400 }
            );
        }

        console.log('다운로드 요청:', { imageUrl, fileName });

        // 이미지를 fetch로 가져오기
        const response = await fetch(imageUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        if (!response.ok) {
            console.error('이미지 fetch 실패:', response.status, response.statusText);
            return NextResponse.json(
                { error: `이미지를 가져올 수 없습니다: ${response.status}` },
                { status: response.status }
            );
        }

        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        console.log('이미지 다운로드 성공:', {
            size: imageBuffer.byteLength,
            contentType,
            fileName
        });

        // 다운로드 응답 반환
        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${fileName || 'image'}"`,
                'Content-Length': imageBuffer.byteLength.toString(),
            },
        });
    } catch (error) {
        console.error('다운로드 API 오류:', error);
        return NextResponse.json(
            { error: '이미지 다운로드 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
} 