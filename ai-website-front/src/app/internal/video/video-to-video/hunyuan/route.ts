import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export async function POST(request: Request) {
    try {
        // 런타임에 환경 변수 확인
        if (!process.env.FAL_KEY) {
            return NextResponse.json(
                {
                    error: "FAL_KEY 환경 변수가 설정되지 않았습니다.",
                },
                { status: 500 }
            );
        }

        fal.config({
            credentials: process.env.FAL_KEY,
        });

        const body = await request.json();
        const {
            prompt,
            video_url,
            num_inference_steps = 30,
            seed,
            aspect_ratio = "16:9",
            resolution = "720p",
            num_frames = 129,
            enable_safety_checker = true,
            strength = 0.85,
            pro_mode = false,
        } = body;

        const result = await fal.subscribe("fal-ai/hunyuan-video/video-to-video", {
            input: {
                prompt,
                video_url,
                num_inference_steps,
                seed,
                aspect_ratio,
                resolution,
                num_frames,
                enable_safety_checker,
                strength,
                pro_mode,
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log(update.logs.map((log) => log.message));
                }
            },
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in video generation:", error);
        return NextResponse.json(
            { error: "Failed to generate video" },
            { status: 500 }
        );
    }
}
