import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
    try {
        // URL이 유효한지 확인
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            throw new Error('유효하지 않은 이미지 URL입니다.');
        }

        // CloudFront URL인 경우 특별 처리
        const isCloudFrontUrl = url.includes('cloudfront.net');

        const response = await fetch(url, {
            headers: {
                'Accept': 'image/*',
                // CloudFront URL인 경우 추가 헤더
                ...(isCloudFrontUrl && {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                })
            }
        });

        if (!response.ok) {
            throw new Error(`이미지 다운로드 실패: ${response.status} ${response.statusText}`);
        }

        // Content-Type 확인 및 처리
        const contentType = response.headers.get('content-type');
        if (!contentType) {
            // Content-Type이 없는 경우 URL 확장자로부터 추정
            const extension = url.split('.').pop()?.toLowerCase();
            const mimeTypes: { [key: string]: string } = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'webp': 'image/webp'
            };
            const mimeType = mimeTypes[extension || ''] || 'image/jpeg';

            if (!mimeType.startsWith('image/')) {
                throw new Error('유효하지 않은 이미지 형식입니다.');
            }
        } else if (!contentType.startsWith('image/')) {
            throw new Error('유효하지 않은 이미지 형식입니다.');
        }

        const arrayBuffer = await response.arrayBuffer();
        const bufferData = Buffer.from(arrayBuffer);

        return {
            data: bufferData.toString('base64'),
            mimeType: contentType || 'image/jpeg',
        };
    } catch (error) {
        console.error('이미지 처리 중 오류:', error);
        throw new Error(`이미지 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
}

// 모델 추천용 프롬프트 생성 함수
function getModelRecommendationPrompt(existingPrompt: string) {
    return `당신은 영상 생성 모델 추천 시스템입니다.
제공된 이미지와 프롬프트를 분석하여 최적의 모델과 설정을 JSON 형식으로 반환해주세요.

사용 가능한 모델과 각각의 설정 파라미터:

1. KLING:
{
  "model": "kling",
  "settings": {
    "aspectRatio": "16:9" | "9:16" | "1:1",
    "duration": "5s" | "10s",
    "cameraControl": "down_back" | "forward_up" | "right_turn_forward" | "left_turn_forward"
  }
}

2. WAN:
{
  "model": "wan",
  "settings": {
    "aspectRatio": "16:9" | "9:16" | "1:1",
    "numFrames": number,
    "framesPerSecond": 8 | 16 | 24,
    "numInferenceSteps": 20 | 30 | 40,
    "enableSafetyChecker": boolean,
    "enablePromptExpansion": boolean
  }
}

3. VEO2:
{
  "model": "veo2",
  "settings": {
    "aspectRatio": "16:9" | "9:16" | "1:1",
    "duration": "5s" | "6s" | "7s" | "8s" | "10s",
    "enableSafetyChecker": boolean
  }
}

4. PIXVERSE:
{
  "model": "pixverse",
  "settings": {
    "aspectRatio": "16:9" | "9:16" | "1:1",
    "duration": "5" | "8",
    "negative_prompt": string,
    "style": "anime" | "3d_animation" | "clay" | "comic" | "cyberpunk"
  }
}

위 모델들 중에서 프롬프트와 이미지에 가장 적합한 모델을 선택하고, 해당 모델의 설정 파라미터만 포함하여 JSON 형식으로 응답해주세요.
모델별로 필요한 파라미터만 포함해야 합니다.

프롬프트:
${existingPrompt}
`;
}

export async function POST(req: NextRequest) {
    try {
        // console.log('[Gemini API] 요청 시작');

        // 런타임에 환경 변수 확인
        if (!process.env.GOOGLE_API_KEY) {
            console.error('[Gemini API] GOOGLE_API_KEY 환경 변수 누락');
            return NextResponse.json(
                {
                    error: 'GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다.',
                },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

        const { imageUrl, existingPrompt, mode = 'prompt' } = await req.json();
        // console.log('[Gemini API] 요청 파라미터:', { imageUrl: imageUrl?.substring(0, 50) + '...', existingPrompt: existingPrompt?.substring(0, 100) + '...', mode });

        if (!imageUrl) {
            console.error('[Gemini API] imageUrl 누락');
            return NextResponse.json(
                {
                    error: '이미지 URL이 필요합니다.',
                    details: '요청 본문에 imageUrl이 포함되어 있지 않습니다.',
                },
                { status: 400 }
            );
        }

        if (!existingPrompt) {
            console.error('[Gemini API] existingPrompt 누락');
            return NextResponse.json(
                {
                    error: '기존 프롬프트가 필요합니다.',
                    details: '요청 본문에 existingPrompt가 포함되어 있지 않습니다.',
                },
                { status: 400 }
            );
        }

        // 이미지 URL을 base64로 변환
        // console.log('[Gemini API] 이미지 다운로드 시작:', imageUrl);
        let imageBase64, mimeType;
        try {
            const imageData = await fetchImageAsBase64(imageUrl);
            imageBase64 = imageData.data;
            mimeType = imageData.mimeType;
            // console.log('[Gemini API] 이미지 다운로드 완료, 크기:', imageBase64.length, 'mimeType:', mimeType);
        } catch (imageError) {
            console.error('[Gemini API] 이미지 처리 실패:', imageError);
            return NextResponse.json(
                {
                    error: '이미지 처리 실패',
                    details: imageError instanceof Error ? imageError.message : '알 수 없는 이미지 오류',
                },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // mode에 따라 다른 프롬프트 사용
        let prompt: string;
        if (mode === 'model-recommendation') {
            prompt = getModelRecommendationPrompt(existingPrompt);
            // console.log('[Gemini API] 모델 추천 모드 프롬프트 생성 완료');
        } else {
            prompt = `당신은 영상 생성용 프롬프트를 보정하는 인공지능입니다.

당신의 목표는 다음과 같습니다:

1. 아래 제공된 이미지 내용을 분석하여, 시각적 요소(등장 인물, 배경, 색상, 스타일 등)를 간결하게 요약합니다.
2. 제공된 기존 프롬프트 중에서 이미지에 대한 설명이 포함된 문장을 찾아, 이미지 분석 결과에 맞춰 해당 부분만 자연스럽게 **수정**합니다.
3. 기존 프롬프트의 구조, 분위기, 문체는 최대한 **유지**하십시오.
4. 프롬프트 전체를 새로 작성하지 말고, 기존 문장을 바탕으로 **'이미지 관련 설명만 교체된 전체 문장'**을 반환하십시오.
5. 영상 생성 모델이 이해하기 쉬운 자연스러운 문장을 만들어야 합니다.

- 이미지 분석 결과는 응답에 포함하지 마십시오.
- 응답은 수정된 전체 프롬프트 1개 한글로 출력하십시오.

기존 프롬프트:
${existingPrompt}
`;
            // console.log('[Gemini API] 프롬프트 보정 모드 프롬프트 생성 완료');
        }

        // console.log('[Gemini API] Gemini 모델 호출 시작');
        let result;
        try {
            result = await model.generateContent({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType,
                                    data: imageBase64,
                                },
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: mode === 'model-recommendation' ? 0.1 : 0.2,
                    topP: 0.8,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                ],
            });
            // console.log('[Gemini API] Gemini 모델 호출 완료');
            // console.log('[Gemini API] 응답 텍스트 길이:', text.length);

            const text = result.response.text();

            // mode에 따라 다른 응답 처리
            if (mode === 'model-recommendation') {
                // console.log('[Gemini API] JSON 파싱 시도:', text.substring(0, 200) + '...');
                
                // JSON 블록을 정확히 추출
                let cleanedText = text;
                
                // ```json ... ``` 패턴이 있는 경우 그 안의 내용만 추출
                const jsonBlockMatch = text.match(/```json\s*\n?([\s\S]*?)\n?\s*```/);
                if (jsonBlockMatch) {
                    cleanedText = jsonBlockMatch[1].trim();
                } else {
                    // ```json이 없는 경우 일반 ``` 블록 확인
                    const codeBlockMatch = text.match(/```\s*\n?([\s\S]*?)\n?\s*```/);
                    if (codeBlockMatch) {
                        cleanedText = codeBlockMatch[1].trim();
                    } else {
                        // 코드 블록이 없는 경우 { 로 시작하는 JSON 찾기
                        const jsonStartIndex = text.indexOf('{');
                        const jsonEndIndex = text.lastIndexOf('}');
                        if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
                            cleanedText = text.substring(jsonStartIndex, jsonEndIndex + 1).trim();
                        } else {
                            // 그래도 안 되면 전체 텍스트에서 마크다운 제거
                            cleanedText = text.replace(/^```json\s*\n?/g, '').replace(/\n?\s*```$/g, '').trim();
                            cleanedText = cleanedText.replace(/^```\s*\n?/g, '').replace(/\n?\s*```$/g, '').trim();
                        }
                    }
                }
                
                // console.log('[Gemini API] 정제된 텍스트:', cleanedText.substring(0, 200) + '...');
                try {
                    const parsedResponse = JSON.parse(cleanedText);
                    // console.log('[Gemini API] JSON 파싱 성공:', parsedResponse);

                    // 필수 파라미터 검증
                    if (!parsedResponse.model || !parsedResponse.settings) {
                        console.error('[Gemini API] 필수 파라미터 검증 실패:', parsedResponse);
                        throw new Error('필수 파라미터가 누락되었습니다.');
                    }

                    // console.log('[Gemini API] 모델 추천 응답 성공');
                    return NextResponse.json(parsedResponse);
                } catch (e) {
                    console.error('[Gemini API] JSON 파싱 또는 검증 실패:', e);
                    console.error('[Gemini API] 원본 텍스트:', text);
                    return NextResponse.json(
                        {
                            error: '모델 추천 응답 파싱 실패',
                            details: e instanceof Error ? e.message : '알 수 없는 오류',
                            rawResponse: text.substring(0, 500), // 디버깅용으로 일부 텍스트 포함
                        },
                        { status: 500 }
                    );
                }
            } else {
                // 프롬프트 보정 모드에서는 텍스트 그대로 반환
                // console.log('[Gemini API] 프롬프트 보정 응답 성공');
                return NextResponse.json({ generated_prompt: text });
            }
        } catch (geminiError) {
            console.error('[Gemini API] Gemini 모델 호출 실패:', geminiError);
            return NextResponse.json(
                {
                    error: 'Gemini AI 호출 실패',
                    details: geminiError instanceof Error ? geminiError.message : '알 수 없는 Gemini 오류',
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('[Gemini API] 전체 처리 중 예상치 못한 오류:', error);
        console.error('[Gemini API] 오류 스택:', error instanceof Error ? error.stack : 'No stack trace');

        // 에러 응답을 항상 JSON 형식으로 반환
        return NextResponse.json(
            {
                error: 'API 요청 처리 중 오류가 발생했습니다.',
                details: error instanceof Error ? error.message : '알 수 없는 오류',
                timestamp: new Date().toISOString(),
                path: '/internal/gemini',
            },
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    }
}
