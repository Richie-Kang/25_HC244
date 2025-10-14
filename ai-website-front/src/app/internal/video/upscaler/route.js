import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

// FAL API 키는 환경 변수에서 자동으로 로드됨 (fal 패키지 사용 시)
const MODEL_ID = "fal-ai/video-upscaler";

export async function POST(req) {
  try {
    const { videoUrl } = await req.json();
    
    if (!videoUrl) {
      return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
    }

    // fal.subscribe 사용하여 비디오 업스케일링 요청
    const result = await fal.subscribe(MODEL_ID, {
      input: {
        video: videoUrl
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: result.data,
      requestId: result.requestId 
    });
  } catch (error) {
    console.error("Error processing video:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
