import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { videoUrl, fileName } = await request.json();

        if (!videoUrl) {
            return NextResponse.json(
                { error: '비디오 URL이 필요합니다' },
                { status: 400 }
            );
        }

        console.log('비디오 다운로드 요청:', { videoUrl, fileName });

        // 비디오를 fetch로 가져오기
        const response = await fetch(videoUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        if (!response.ok) {
            console.error('비디오 fetch 실패:', response.status, response.statusText);
            return NextResponse.json(
                { error: `비디오를 가져올 수 없습니다: ${response.status}` },
                { status: response.status }
            );
        }

        const videoBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'video/mp4';

        console.log('비디오 다운로드 성공:', {
            size: videoBuffer.byteLength,
            contentType,
            fileName
        });

        // 다운로드 응답 반환
        return new NextResponse(videoBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${fileName || 'video.mp4'}"`,
                'Content-Length': videoBuffer.byteLength.toString(),
            },
        });
    } catch (error) {
        console.error('비디오 다운로드 API 오류:', error);
        return NextResponse.json(
            { error: '비디오 다운로드 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
} 