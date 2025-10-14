import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export const runtime = 'edge';

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

        const formData = await req.formData();
        const model_image_url = formData.get('model_image_url') as string;
        const garment_image_url = formData.get('garment_image_url') as string;
        const category = formData.get('category') as string || "auto";
        const mode = formData.get('mode') as string || "balanced";
        const garment_photo_type = formData.get('garment_photo_type') as string || "auto";
        const moderation_level = formData.get('moderation_level') as string || "permissive";
        const seed = Number(formData.get('seed')) || 42;
        const num_samples = Number(formData.get('num_samples')) || 1;
        const segmentation_free = formData.get('segmentation_free') === 'true';
        const output_format = formData.get('output_format') as string || "png";

        console.log('🔍 Received params:', {
            model_image_url,
            garment_image_url,
            category,
            mode,
            garment_photo_type,
            moderation_level,
            seed,
            num_samples,
            segmentation_free,
            output_format
        });

        // 필수 파라미터 검증
        if (!model_image_url || !garment_image_url) {
            return NextResponse.json(
                { error: "model_image_url and garment_image_url are required" },
                { status: 400 }
            );
        }

        // category 유효성 검증 (fal-ai 문서에 맞춤)
        const validCategories = ["tops", "bottoms", "one-pieces", "auto"];
        if (!validCategories.includes(category)) {
            return NextResponse.json(
                { error: `Invalid category '${category}'. Must be one of: ${validCategories.join(', ')}` },
                { status: 400 }
            );
        }

        // mode 유효성 검증
        const validModes = ["performance", "balanced", "quality"];
        if (!validModes.includes(mode)) {
            return NextResponse.json(
                { error: `Invalid mode '${mode}'. Must be one of: ${validModes.join(', ')}` },
                { status: 400 }
            );
        }

        // garment_photo_type 유효성 검증
        const validGarmentPhotoTypes = ["auto", "model", "flat-lay"];
        if (!validGarmentPhotoTypes.includes(garment_photo_type)) {
            return NextResponse.json(
                { error: `Invalid garment_photo_type '${garment_photo_type}'. Must be one of: ${validGarmentPhotoTypes.join(', ')}` },
                { status: 400 }
            );
        }

        // output_format 유효성 검증
        const validOutputFormats = ["png", "jpeg"];
        if (!validOutputFormats.includes(output_format)) {
            return NextResponse.json(
                { error: `Invalid output_format '${output_format}'. Must be one of: ${validOutputFormats.join(', ')}` },
                { status: 400 }
            );
        }

        console.log('✅ All parameters validated successfully');

        // Fashn API 호출
        console.log('🚀 Calling Fashn API...');
        const result = await fal.subscribe("fal-ai/fashn/tryon/v1.5", {
            input: {
                model_image: model_image_url,
                garment_image: garment_image_url,
                category,
                mode,
                garment_photo_type,
                moderation_level,
                seed,
                num_samples,
                segmentation_free,
                output_format,
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log('📝 Progress:', update.logs.map((log) => log.message));
                }
            },
        });

        console.log('✅ Fashn API call successful:', result);

        // 결과 이미지 URL 반환
        return NextResponse.json({
            success: true,
            imageUrl: result.data.images[0]  // 첫 번째 생성된 이미지 URL 반환
        });
    } catch (error) {
        console.error("Error in image generation:", error);
        let errorMsg = "Failed to generate image";
        // ValidationError 등에서 body.detail[0].msg 추출
        if (error && typeof error === 'object') {
            const errObj = error as { body?: { detail?: { msg?: string }[] }, message?: string, toString?: () => string };
            if (errObj.body && Array.isArray(errObj.body.detail) && errObj.body.detail[0]?.msg) {
                errorMsg = errObj.body.detail[0].msg!;
            } else if (typeof errObj.message === 'string') {
                errorMsg = errObj.message;
            } else if (typeof errObj.toString === 'function') {
                errorMsg = errObj.toString();
            }
        } else if (typeof error === 'string') {
            errorMsg = error;
        }
        return NextResponse.json(
            { error: errorMsg, details: error },
            { status: 500 }
        );
    }
}
