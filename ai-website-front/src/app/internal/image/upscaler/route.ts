import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export const runtime = 'edge';

// 이미지 크기를 가져오는 함수
async function getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
    try {
        // 실제 이미지를 다운로드해서 크기 확인
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error('Failed to fetch image');
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // PNG 파일 확인 (89 50 4E 47)
        if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
            // PNG IHDR 청크에서 크기 정보 읽기 (빅엔디안)
            const width = (uint8Array[16] << 24) | (uint8Array[17] << 16) | (uint8Array[18] << 8) | uint8Array[19];
            const height = (uint8Array[20] << 24) | (uint8Array[21] << 16) | (uint8Array[22] << 8) | uint8Array[23];
            console.log(`PNG dimensions detected: ${width}x${height}`);
            return { width, height };
        }

        // JPEG 파일 확인 (FF D8)
        if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) {
            let i = 2;
            while (i < uint8Array.length - 8) {
                // SOF0 (Start of Frame) 마커 찾기 (FF C0)
                if (uint8Array[i] === 0xFF && uint8Array[i + 1] === 0xC0) {
                    const height = (uint8Array[i + 5] << 8) | uint8Array[i + 6];
                    const width = (uint8Array[i + 7] << 8) | uint8Array[i + 8];
                    console.log(`JPEG dimensions detected: ${width}x${height}`);
                    return { width, height };
                }
                // 다른 마커들 건너뛰기
                if (uint8Array[i] === 0xFF && uint8Array[i + 1] !== 0xFF) {
                    const segmentLength = (uint8Array[i + 2] << 8) | uint8Array[i + 3];
                    i += segmentLength + 2;
                } else {
                    i++;
                }
            }
        }

        // WebP 파일 확인 (52 49 46 46 ... 57 45 42 50)
        if (uint8Array[0] === 0x52 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46 && uint8Array[3] === 0x46 &&
            uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && uint8Array[10] === 0x42 && uint8Array[11] === 0x50) {
            // VP8 또는 VP8L 청크 찾기
            let i = 12;
            while (i < uint8Array.length - 8) {
                const chunkType = String.fromCharCode(uint8Array[i], uint8Array[i + 1], uint8Array[i + 2], uint8Array[i + 3]);
                const chunkSize = uint8Array[i + 4] | (uint8Array[i + 5] << 8) | (uint8Array[i + 6] << 16) | (uint8Array[i + 7] << 24);

                if (chunkType === 'VP8 ') {
                    // VP8 비트스트림에서 크기 정보 추출
                    const width = ((uint8Array[i + 14] | (uint8Array[i + 15] << 8)) & 0x3fff);
                    const height = ((uint8Array[i + 16] | (uint8Array[i + 17] << 8)) & 0x3fff);
                    console.log(`WebP VP8 dimensions detected: ${width}x${height}`);
                    return { width, height };
                } else if (chunkType === 'VP8L') {
                    // VP8L 비트스트림에서 크기 정보 추출
                    const bits = uint8Array[i + 9] | (uint8Array[i + 10] << 8) | (uint8Array[i + 11] << 16) | (uint8Array[i + 12] << 24);
                    const width = (bits & 0x3FFF) + 1;
                    const height = ((bits >> 14) & 0x3FFF) + 1;
                    console.log(`WebP VP8L dimensions detected: ${width}x${height}`);
                    return { width, height };
                }

                i += 8 + chunkSize;
                if (chunkSize % 2 === 1) i++; // 패딩
            }
        }

        console.warn('Could not detect image dimensions, using default 2048x2048');
        // 기본값을 더 큰 값으로 설정하여 안전하게 처리
        return { width: 2048, height: 2048 };
    } catch (error) {
        console.error('Error getting image dimensions:', error);
        // 기본값을 더 큰 값으로 설정하여 안전하게 처리
        return { width: 2048, height: 2048 };
    }
}

// 최적의 업스케일 배율 계산
function calculateOptimalUpscaleFactor(width: number, height: number, requestedFactor: number): number {
    const MAX_MEGAPIXELS = 32;
    const currentMegapixels = (width * height) / (1024 * 1024);

    console.log(`Current image megapixels: ${currentMegapixels.toFixed(2)} MP`);

    // 업스케일 후 예상 메가픽셀 계산
    const resultMegapixels = currentMegapixels * (requestedFactor * requestedFactor);
    console.log(`Requested upscale would result in: ${resultMegapixels.toFixed(2)} MP`);

    // 최대 허용 메가픽셀을 초과하는 경우 배율 조정
    if (resultMegapixels > MAX_MEGAPIXELS) {
        // 최대 허용 배율 계산: sqrt(MAX_MEGAPIXELS / currentMegapixels)
        const maxPossibleFactor = Math.sqrt(MAX_MEGAPIXELS / currentMegapixels);
        const adjustedFactor = Math.max(1, Math.floor(maxPossibleFactor * 10) / 10);

        console.log(`Adjusting upscale factor from ${requestedFactor} to ${adjustedFactor}`);
        return adjustedFactor;
    }

    // 요청된 배율이 허용 범위 내인 경우 그대로 사용
    return requestedFactor;
}

export async function POST(req: NextRequest) {
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

        const body = await req.json();
        const {
            image_url,
            prompt = "masterpiece, best quality, highres",
            upscale_factor = 2,
            negative_prompt = "(worst quality, low quality, normal quality:2)",
            creativity = 0.35,
            resemblance = 0.6,
            guidance_scale = 4,
            num_inference_steps = 18,
            seed,
            enable_safety_checker = true,
        } = body;

        // 필수 파라미터 검증
        if (!image_url) {
            return NextResponse.json(
                { error: "image_url is required" },
                { status: 400 }
            );
        }

        // upscale_factor 유효성 검증 (1-4 범위)
        if (upscale_factor < 1 || upscale_factor > 4) {
            return NextResponse.json(
                { error: "Invalid upscale_factor. Must be between 1 and 4" },
                { status: 400 }
            );
        }

        // creativity 유효성 검증 (0-1 범위)
        if (creativity < 0 || creativity > 1) {
            return NextResponse.json(
                { error: "Invalid creativity. Must be between 0 and 1" },
                { status: 400 }
            );
        }

        // resemblance 유효성 검증 (0-1 범위)
        if (resemblance < 0 || resemblance > 1) {
            return NextResponse.json(
                { error: "Invalid resemblance. Must be between 0 and 1" },
                { status: 400 }
            );
        }

        // 이미지 크기 확인 및 업스케일 배율 조정
        const { width, height } = await getImageDimensions(image_url);
        const adjustedUpscaleFactor = calculateOptimalUpscaleFactor(width, height, upscale_factor);

        console.log(`Original image: ${width}x${height}`);
        console.log(`Requested upscale factor: ${upscale_factor}`);
        console.log(`Adjusted upscale factor: ${adjustedUpscaleFactor}`);

        // 이미지가 너무 큰 경우 사전에 체크
        const currentMegapixels = (width * height) / (1024 * 1024);
        if (currentMegapixels > 32) {
            return NextResponse.json(
                {
                    error: `이미지가 너무 큽니다. 현재 이미지: ${currentMegapixels.toFixed(1)}MP, 최대 허용: 32MP`,
                    details: `이미지 크기: ${width}x${height}`,
                    currentMegapixels: currentMegapixels,
                    maxMegapixels: 32
                },
                { status: 422 }
            );
        }

        // Clarity Upscaler API 호출
        const result = await fal.subscribe("fal-ai/clarity-upscaler", {
            input: {
                image_url,
                prompt,
                upscale_factor: adjustedUpscaleFactor,
                negative_prompt,
                creativity,
                resemblance,
                guidance_scale,
                num_inference_steps,
                ...(seed && { seed }),
                enable_safety_checker,
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log(update.logs.map((log) => log.message));
                }
            },
        });

        // 응답에 조정된 배율 정보 포함
        return NextResponse.json({
            ...result.data,
            adjustedUpscaleFactor,
            originalDimensions: { width, height },
            message: adjustedUpscaleFactor !== upscale_factor
                ? `이미지가 너무 커서 업스케일 배율을 ${upscale_factor}에서 ${adjustedUpscaleFactor}로 조정했습니다.`
                : undefined
        });
    } catch (error) {
        console.error("Error in image upscaling:", error);

        // FAL API 에러 처리
        if (error && typeof error === 'object' && 'body' in error) {
            const falError = error as { status?: number; body?: { detail?: Array<{ msg?: string }> } };
            if (falError.status === 422 && falError.body?.detail) {
                const detail = falError.body.detail[0];
                if (detail?.msg?.includes('too large to upscale')) {
                    return NextResponse.json(
                        {
                            error: "이미지가 너무 커서 업스케일링할 수 없습니다.",
                            details: detail.msg,
                            suggestion: "더 작은 이미지를 사용하거나 업스케일 배율을 낮춰주세요."
                        },
                        { status: 422 }
                    );
                }

                return NextResponse.json(
                    {
                        error: "업스케일링 요청이 유효하지 않습니다.",
                        details: detail.msg
                    },
                    { status: 422 }
                );
            }
        }

        // 일반적인 에러 메시지 처리
        if (error instanceof Error) {
            if (error.message.includes('too large to upscale')) {
                return NextResponse.json(
                    {
                        error: "이미지가 너무 커서 업스케일링할 수 없습니다. 더 작은 이미지를 사용하거나 업스케일 배율을 낮춰주세요.",
                        details: error.message
                    },
                    { status: 422 }
                );
            }

            return NextResponse.json(
                {
                    error: "업스케일링 중 오류가 발생했습니다.",
                    details: error.message
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: "업스케일링에 실패했습니다." },
            { status: 500 }
        );
    }
}
