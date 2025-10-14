import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export async function POST(request) {
    try {
        const { prompt, imageUrl, aspectRatio, duration } = await request.json();

        if (!prompt || !aspectRatio || !duration) {
            return NextResponse.json(
                { error: "prompt, aspectRatio, duration이 모두 필요합니다." },
                { status: 400 }
            );
        }

        // API 키 설정
        fal.config({ credentials: process.env.FAL_KEY });

        const input = {
            prompt,
            aspect_ratio: aspectRatio,
            duration,
        };

        if (imageUrl) {
            input.image_url = imageUrl;
        }

        // Veo 2 API 호출 (Fal.ai API)
        const result = await fal.subscribe("fal-ai/veo2", {
            input,
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs.map((log) => log.message).forEach(console.log);
                }
            },
        });

        return NextResponse.json(
            { videoUrl: result.data.video.url, requestId: result.requestId },
            { status: 200 }
        );
    } catch (error) {
        console.error("비디오 생성 오류:", error);
        return NextResponse.json(
            { error: error.message || "영상 생성 중 오류 발생" },
            { status: 500 }
        );
    }
} 