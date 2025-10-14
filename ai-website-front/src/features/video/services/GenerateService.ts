import apiClient from '@/lib/api/apiClient';
import { VideoDto, VideoCreateRequest } from '../types/Video';

/**
 * 파일을 Base64 문자열로 변환
 * @param file 변환할 파일
 */
export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('파일 읽기 실패'));
      }
    };
    reader.onerror = () => reject(new Error('파일 읽기 오류'));
    reader.readAsDataURL(file);
  });
};

// 비디오 저장 요청 타입
export interface VideoSaveRequest {
  prompt: string;
  endpoint: string;
  model: string;
  videoName: string;
  imageFile?: File | null;
  videoUrl: string;
  referenceUrl?: string;
  activeTab?: "image" | "text" | "video";
}

/**
 * admin이 비디오를 저장하는 함수
 * @param data 비디오 메타데이터
 */
export const saveVideo = async (data: VideoSaveRequest): Promise<VideoDto> => {
  // 최대 3번까지 재시도
  let lastError: Error | unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      // mode 결정 로직 개선
      const determineMode = (): 'IMAGE' | 'TEXT' => {
        // 1. activeTab이 명시적으로 제공된 경우 해당 값으로 결정
        if (data.activeTab) {
          return data.activeTab === 'image' ? 'IMAGE' : 'TEXT';
        }

        // 2. 이미지 파일이 있는 경우 IMAGE로 설정
        if (data.imageFile) {
          return 'IMAGE';
        }

        // 3. 레퍼런스 URL이 있는 경우 IMAGE로 설정
        if (data.referenceUrl) {
          return 'IMAGE';
        }

        // 4. 엔드포인트로 판단 (특정 엔드포인트는 항상 이미지 기반)
        if (['kling', 'wan', 'hunyuan', 'upscaler', 'pixverse'].includes(data.endpoint)) {
          return 'IMAGE';
        }

        // 5. 기본값은 TEXT
        return 'TEXT';
      };

      // JSON 형식으로 데이터 전송
      const requestData: VideoCreateRequest = {
        videoName: data.videoName,
        prompt: data.prompt,
        endpoint: data.endpoint,
        model: data.model,
        videoUrl: data.videoUrl,
        mode: determineMode(),
        referenceUrl: data.referenceUrl,
      };

      if (process.env.NODE_ENV !== 'production') {
        console.log(`[비디오 저장 요청] 시도 ${attempt + 1}/3`, {
          endpoint: data.endpoint,
          model: data.model,
          videoName: data.videoName,
          mode: requestData.mode,
        });
      }

      try {
        const apiResponse = await apiClient.post<VideoDto>('/my/videos', requestData, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000, // 15초 타임아웃 설정
        });

        // 성공 로그는 개발 환경에서만 출력
        if (process.env.NODE_ENV !== 'production') {
          console.log('[비디오 저장 성공]', {
            id: apiResponse.data.id,
            name: apiResponse.data.name,
          });
        }

        return apiResponse.data;
      } catch (networkError) {
        // 개발 환경에서만 로그 출력
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[API 요청 실패 (${attempt + 1}/3)] - 대체 방법 시도`);
        }

        // 마지막 시도에서는 saveVideoFromUrl 함수 사용
        if (attempt === 2) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('[마지막 시도] saveVideoFromUrl 함수로 전환');
          }
          return await saveVideoFromUrl(data);
        }

        // 다음 시도 전 지연 (백오프)
        lastError = networkError;
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
    } catch (error) {
      // 에러는 모든 환경에서 로깅 (중요 오류 추적용)
      console.error('[비디오 저장 실패]', error);

      if (error && typeof error === 'object' && 'response' in error && error.response) {
        const response = error.response as { data?: string; status?: number };
        if (response.status === 500) {
          throw new Error('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
      throw error;
    }
  }

  // 모든 시도 실패 시 마지막 에러 던지기
  throw lastError;
};

/**
 * URL을 통해 비디오를 서버에 저장하는 함수
 * @param data 비디오 메타데이터 (videoUrl 포함)
 */
export const saveVideoFromUrl = async (data: VideoSaveRequest): Promise<VideoDto> => {
  // 최대 3번까지 재시도
  let lastError: Error | unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const formData = new FormData();

      // mode 결정 로직 개선
      const determineMode = (): 'IMAGE' | 'TEXT' => {
        // 1. activeTab이 명시적으로 제공된 경우 해당 값으로 결정
        if (data.activeTab) {
          return data.activeTab === 'image' ? 'IMAGE' : 'TEXT';
        }

        // 2. 이미지 파일이 있는 경우 IMAGE로 설정
        if (data.imageFile) {
          return 'IMAGE';
        }

        // 3. 레퍼런스 URL이 있는 경우 IMAGE로 설정
        if (data.referenceUrl) {
          return 'IMAGE';
        }

        // 4. 엔드포인트로 판단 (특정 엔드포인트는 항상 이미지 기반)
        if (['kling', 'wan', 'hunyuan', 'upscaler', 'pixverse'].includes(data.endpoint)) {
          return 'IMAGE';
        }

        // 5. 기본값은 TEXT
        return 'TEXT';
      };

      // VideoCreateRequest에 필요한 메타데이터 객체
      const videoMetadata: VideoCreateRequest = {
        videoName: data.videoName,
        prompt: data.prompt,
        model: data.model,
        endpoint: data.endpoint,
        videoUrl: data.videoUrl,
        mode: determineMode(),
        referenceUrl: data.referenceUrl,
      };

      formData.append('data', new Blob([JSON.stringify(videoMetadata)], { type: 'application/json' }));

      if (data.imageFile) {
        formData.append('referenceFile', data.imageFile);
      }

      // 개발 환경에서만 로그 출력
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[URL 비디오 저장 요청] 시도 ${attempt + 1}/3`, {
          endpoint: '/my/videos/url',
          videoName: videoMetadata.videoName,
          model: videoMetadata.model,
          mode: videoMetadata.mode
        });
      }

      const apiResponse = await apiClient.post<VideoDto>('/my/videos/url', formData, {
        // FormData 사용 시 Content-Type은 브라우저가 자동으로 설정 (multipart/form-data)
        timeout: 20000, // 20초 타임아웃 (파일 업로드 고려)
      });

      // 개발 환경에서만 로그 출력
      if (process.env.NODE_ENV !== 'production') {
        console.log('[URL 비디오 저장 성공]', {
          id: apiResponse.data.id,
          name: apiResponse.data.name
        });
      }

      return apiResponse.data;
    } catch (error) {
      // 중요 에러는 모든 환경에서 로깅
      console.error(`[URL 비디오 저장 오류] 시도 ${attempt + 1}/3:`, error);

      // 마지막 시도가 아니면 재시도
      if (attempt < 2) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, 1500 * (attempt + 1)));
        continue;
      }

      // 마지막 시도면 에러 처리 및 던지기
      if (error && typeof error === 'object' && 'response' in error && error.response) {
        const response = error.response as { data?: string; status?: number };
        if (response.status === 500) {
          if (response.data?.includes('videoUrl')) {
            throw new Error('비디오 URL이 올바르지 않습니다. URL을 확인해주세요.');
          }
          throw new Error('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
      throw error;
    }
  }

  // 모든 시도 실패 시 마지막 에러 던지기
  throw lastError;
};

/**
 * 선택된 엔드포인트와 활성 탭에 따라 알맞은 API URL을 반환하는 함수
 * @param endpoint 선택한 모델 엔드포인트 (예: "veo2", "kling", "wan", "hunyuan", "upscaler", "pixverse")
 * @param activeTab 현재 활성화된 탭 ("image", "text", "video")
 * @returns API 엔드포인트 URL
 */
export function getVideoEndpointUrl(
  endpoint: string,
  activeTab: "image" | "text" | "video"
): string {
  // 1) veo2 모델은 이미지 변환과 텍스트 변환을 구분 처리
  if (endpoint === "veo2") {
    if (activeTab === "image") {
      return "/internal/video/image-to-video/veo2";
    } else {
      // "text" 또는 "video" 탭인 경우 텍스트→비디오 엔드포인트 사용
      return "/internal/video/text-to-video/veo2";
    }
  }

  // 2) 그 외 모델들은 모두 이미지→비디오 변환용
  const urlMap: Record<string, string> = {
    kling: "/internal/video/image-to-video/kling",
    wan: "/internal/video/image-to-video/wan",
    hunyuan: "/internal/video/image-to-video/hunyuan",
    upscaler: "/internal/video/upscaler",
    pixverse: "/internal/video/image-to-video/pixverse",
  };

  // 3) 매핑된 URL이 없으면 기본값(veo2 이미지 변환) 반환
  return urlMap[endpoint] ?? "/api/video/image-to-video/veo2";
}

