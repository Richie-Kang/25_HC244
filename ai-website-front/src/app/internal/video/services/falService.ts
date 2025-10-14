import {
  AspectRatioType,
  DurationType,
  ResolutionType,
} from '../../../../features/video/videoGeneration/types/modelSettingTypes';

// DTO 타입 정의 (NestJS controller와 일치)
export interface HunyuanImageToVideoDto {
  userId: string;
  prompt: string;
  imageUrl: string;
  notificationId: string;
  seed?: number;
  aspect_ratio?: AspectRatioType;
  resolution?: ResolutionType;
  num_frames?: number;
  i2v_stability?: boolean;
}

export interface KlingImageToVideoDto {
  userId: string;
  prompt: string;
  imageUrl: string;
  notificationId: string;
  seed?: number;
  duration?: "5s" | "10s";
  negative_prompt?: string;
  cfg_scale?: number;
}

export interface Veo2ImageToVideoDto {
  userId: string;
  prompt: string;
  imageUrl: string;
  notificationId: string;
  seed?: number;
  aspect_ratio?: AspectRatioType;
  duration?: DurationType;
}

export interface PixverseImageToVideoDto {
  userId: string;
  prompt: string;
  imageUrl: string;
  notificationId: string;
  seed?: number;
  aspect_ratio?: AspectRatioType;
  resolution?: ResolutionType;
  duration?: "5" | "8";
  negative_prompt?: string;
  style?: "anime" | "3d_animation" | "clay" | "comic" | "cyberpunk";
}

export interface WanImageToVideoDto {
  userId: string;
  prompt: string;
  imageUrl: string;
  notificationId: string;
  seed?: number;
  enableSafetyChecker?: boolean;
}

export interface VideoJobStatusDto {
  jobId: string;
}

// API 응답 타입
export interface VideoJobResponse {
  jobId: string;
  status: string;
  message: string;
}

export interface VideoJobStatusResponse {
  jobId: string;
  status: string;
  progress?: number;
  result?: unknown;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
}

// NestJS 백엔드 비디오 생성 API 클라이언트 서비스
// (NestJS 서버가 실제 FAL AI API 호출을 담당)
export class VideoApiService {
  private static readonly NEST_BASE_URL = 'http://localhost:3001';
  private static readonly BASE_PATH = '/video/image-to-video';

  /**
   * NestJS 서버로 HTTP 요청을 보내는 공통 메서드
   */
  private static async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: unknown,
    params?: Record<string, string>
  ): Promise<T> {
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const url = new URL(`${this.NEST_BASE_URL}${endpoint}`);
    
    console.log(`🚀 [VideoApiService][${requestId}] ===== 요청 시작 =====`);
    console.log(`📍 [VideoApiService][${requestId}] 요청 정보:`, {
      requestId,
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      fullUrl: url.toString(),
      nestBaseUrl: this.NEST_BASE_URL,
      hasBody: !!body,
      bodySize: body ? JSON.stringify(body).length : 0,
      params
    });

    // GET 요청인 경우 쿼리 파라미터 추가
    if (params && method === 'GET') {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
      console.log(`📋 [VideoApiService][${requestId}] GET 파라미터 추가:`, params);
    }

    // POST 요청 body 로깅 (민감한 정보 마스킹)
    if (method === 'POST' && body) {
      const logBody = { ...body };
      
      // 이미지 URL 마스킹 처리
      if (typeof logBody === 'object' && logBody !== null && 'imageUrl' in logBody) {
        const imageUrl = (logBody as Record<string, unknown>).imageUrl;
        if (typeof imageUrl === 'string') {
          if (imageUrl.startsWith('data:image/')) {
            // Base64 이미지인 경우
            (logBody as Record<string, unknown>).imageUrl = `[BASE64_IMAGE:${imageUrl.length}bytes]`;
          } else if (imageUrl.length > 100) {
            // 일반 URL이 긴 경우
            (logBody as Record<string, unknown>).imageUrl = `${imageUrl.substring(0, 100)}...[truncated:${imageUrl.length}chars]`;
          }
        }
      }
      
      console.log(`📤 [VideoApiService][${requestId}] 요청 Body:`, {
        bodyKeys: Object.keys(logBody),
        bodyData: logBody
      });
    }

    const startTime = Date.now();
    console.log(`⏱️ [VideoApiService][${requestId}] 요청 전송 중... (${startTime}ms)`);

    try {
      const fetchHeaders = {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId, // 요청 추적을 위한 ID
      };
      
      console.log(`🌐 [VideoApiService][${requestId}] fetch() 호출:`, {
        url: url.toString(),
        headers: fetchHeaders,
        bodyPresent: method === 'POST' && !!body
      });

      const response = await fetch(url.toString(), {
        method,
        headers: fetchHeaders,
        body: method === 'POST' ? JSON.stringify(body) : undefined,
      });

      const responseTime = Date.now() - startTime;

      console.log(`📊 [VideoApiService][${requestId}] HTTP 응답 수신:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        responseTime: `${responseTime}ms`,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorText: string;
        let errorData: unknown;
        
        try {
          errorText = await response.text();
          // JSON 파싱 시도
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = errorText;
          }
        } catch (textError) {
          errorText = `응답 텍스트 읽기 실패: ${textError}`;
          errorData = null;
        }
        
        console.error(`❌ [VideoApiService][${requestId}] HTTP 요청 실패:`, {
          requestId,
          status: response.status,
          statusText: response.statusText,
          errorText: errorText?.substring(0, 500) + (errorText?.length > 500 ? '...[truncated]' : ''),
          errorData,
          endpoint,
          method,
          fullUrl: url.toString(),
          responseTime: `${responseTime}ms`
        });
        
        throw new Error(`NestJS API 요청 실패 (${response.status}): ${errorText || response.statusText}`);
      }

      let responseData: T;
      try {
        responseData = await response.json() as T;
      } catch (jsonError) {
        console.error(`❌ [VideoApiService][${requestId}] JSON 파싱 실패:`, {
          error: jsonError instanceof Error ? jsonError.message : jsonError,
          responseTime: `${responseTime}ms`
        });
        throw new Error('응답 JSON 파싱 실패');
      }

      console.log(`✅ [VideoApiService][${requestId}] 요청 성공 완료:`, {
        requestId,
        endpoint,
        responseTime: `${responseTime}ms`,
        responseDataKeys: typeof responseData === 'object' && responseData !== null ? Object.keys(responseData) : 'N/A',
        responseData
      });
      console.log(`🏁 [VideoApiService][${requestId}] ===== 요청 완료 =====`);

      return responseData;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // 네트워크 에러 상세 분석
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error(`🌐 [VideoApiService][${requestId}] 네트워크 연결 오류:`, {
          requestId,
          endpoint,
          fullUrl: url.toString(),
          nestBaseUrl: this.NEST_BASE_URL,
          error: error.message,
          errorStack: error.stack,
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          possibleCauses: [
            'NestJS 서버가 실행되지 않음 (localhost:3001)',
            'CORS 정책 위반',
            '네트워크 연결 문제',
            '잘못된 URL 또는 포트',
            '방화벽 차단'
          ],
          troubleshootingSteps: [
            '1. NestJS 서버가 localhost:3001에서 실행 중인지 확인',
            '2. 브라우저 개발자 도구 네트워크 탭 확인',
            '3. 서버 로그 확인',
            '4. CORS 설정 확인'
          ]
        });
        throw new Error(`네트워크 연결 오류: NestJS 서버(${this.NEST_BASE_URL})에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.`);
      }
      
      // 기타 에러 상세 로깅
      console.error(`💥 [VideoApiService][${requestId}] 예상치 못한 오류:`, {
        requestId,
        endpoint,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      });
      console.log(`🔚 [VideoApiService][${requestId}] ===== 요청 실패 =====`);
      
      throw error;
    }
  }

  /**
   * Hunyuan 이미지-비디오 생성 요청
   */
  static async createHunyuanVideo(dto: HunyuanImageToVideoDto): Promise<VideoJobResponse> {
    const methodId = `HUNYUAN-${Date.now()}`;
    
    console.log(`🎬 [VideoApiService][${methodId}] ===== Hunyuan 비디오 생성 시작 =====`);
    console.log(`📋 [VideoApiService][${methodId}] Hunyuan 요청 데이터:`, {
      methodId,
      model: 'Hunyuan',
      userId: dto.userId,
      notificationId: dto.notificationId,
      prompt: dto.prompt?.substring(0, 100) + (dto.prompt?.length > 100 ? '...' : ''),
      promptLength: dto.prompt?.length || 0,
      seed: dto.seed,
      aspect_ratio: dto.aspect_ratio,
      resolution: dto.resolution,
      num_frames: dto.num_frames,
      i2v_stability: dto.i2v_stability,
      imageUrlType: dto.imageUrl?.startsWith('data:') ? 'BASE64' : 'URL',
      imageUrlLength: dto.imageUrl?.length || 0,
      timestamp: new Date().toISOString()
    });

    try {
      console.log(`⚡ [VideoApiService][${methodId}] Hunyuan API 호출 시작...`);
      
      const result = await this.makeRequest<VideoJobResponse>(
        `${this.BASE_PATH}/hunyuan`,
        'POST',
        dto
      );
      
      console.log(`🎉 [VideoApiService][${methodId}] Hunyuan 비디오 생성 요청 성공:`, {
        methodId,
        model: 'Hunyuan',
        jobId: result.jobId,
        status: result.status,
        message: result.message,
        timestamp: new Date().toISOString()
      });
      console.log(`🏁 [VideoApiService][${methodId}] ===== Hunyuan 완료 =====`);
      
      return result;
    } catch (error) {
      console.error(`❌ [VideoApiService][${methodId}] Hunyuan 비디오 생성 실패:`, {
        methodId,
        model: 'Hunyuan',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 5).join('\n') // 스택 트레이스 축약
        } : error,
        requestData: {
          userId: dto.userId,
          notificationId: dto.notificationId,
          prompt: dto.prompt?.substring(0, 50) + '...',
          imageUrlType: dto.imageUrl?.startsWith('data:') ? 'BASE64' : 'URL'
        },
        timestamp: new Date().toISOString()
      });
      console.log(`🔚 [VideoApiService][${methodId}] ===== Hunyuan 실패 =====`);
      throw error;
    }
  }

  /**
   * Kling 이미지-비디오 생성 요청
   */
  static async createKlingVideo(dto: KlingImageToVideoDto): Promise<VideoJobResponse> {
    const methodId = `KLING-${Date.now()}`;
    
    console.log(`🎬 [VideoApiService][${methodId}] ===== Kling 비디오 생성 시작 =====`);
    console.log(`📋 [VideoApiService][${methodId}] Kling 요청 데이터:`, {
      methodId,
      model: 'Kling',
      userId: dto.userId,
      notificationId: dto.notificationId,
      prompt: dto.prompt?.substring(0, 100) + (dto.prompt?.length > 100 ? '...' : ''),
      promptLength: dto.prompt?.length || 0,
      seed: dto.seed,
      duration: dto.duration,
      negative_prompt: dto.negative_prompt,
      cfg_scale: dto.cfg_scale,
      imageUrlType: dto.imageUrl?.startsWith('data:') ? 'BASE64' : 'URL',
      imageUrlLength: dto.imageUrl?.length || 0,
      timestamp: new Date().toISOString()
    });

    try {
      console.log(`⚡ [VideoApiService][${methodId}] Kling API 호출 시작...`);
      
      const result = await this.makeRequest<VideoJobResponse>(
        `${this.BASE_PATH}/kling`,
        'POST',
        dto
      );
      
      console.log(`🎉 [VideoApiService][${methodId}] Kling 비디오 생성 요청 성공:`, {
        methodId,
        model: 'Kling',
        jobId: result.jobId,
        status: result.status,
        message: result.message,
        timestamp: new Date().toISOString()
      });
      console.log(`🏁 [VideoApiService][${methodId}] ===== Kling 완료 =====`);
      
      return result;
    } catch (error) {
      console.error(`❌ [VideoApiService][${methodId}] Kling 비디오 생성 실패:`, {
        methodId,
        model: 'Kling',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 5).join('\n')
        } : error,
        requestData: {
          userId: dto.userId,
          notificationId: dto.notificationId,
          prompt: dto.prompt?.substring(0, 50) + '...',
          imageUrlType: dto.imageUrl?.startsWith('data:') ? 'BASE64' : 'URL'
        },
        timestamp: new Date().toISOString()
      });
      console.log(`🔚 [VideoApiService][${methodId}] ===== Kling 실패 =====`);
      throw error;
    }
  }

  /**
   * VEO2 이미지-비디오 생성 요청
   */
  static async createVeo2Video(dto: Veo2ImageToVideoDto): Promise<VideoJobResponse> {
    const methodId = `VEO2-${Date.now()}`;
    
    console.log(`🎬 [VideoApiService][${methodId}] ===== VEO2 비디오 생성 시작 =====`);
    console.log(`📋 [VideoApiService][${methodId}] VEO2 요청 데이터:`, {
      methodId,
      model: 'VEO2',
      userId: dto.userId,
      notificationId: dto.notificationId,
      prompt: dto.prompt?.substring(0, 100) + (dto.prompt?.length > 100 ? '...' : ''),
      promptLength: dto.prompt?.length || 0,
      seed: dto.seed,
      aspect_ratio: dto.aspect_ratio,
      duration: dto.duration,
      imageUrlType: dto.imageUrl?.startsWith('data:') ? 'BASE64' : 'URL',
      imageUrlLength: dto.imageUrl?.length || 0,
      timestamp: new Date().toISOString()
    });

    try {
      console.log(`⚡ [VideoApiService][${methodId}] VEO2 API 호출 시작...`);
      
      const result = await this.makeRequest<VideoJobResponse>(
        `${this.BASE_PATH}/veo2`,
        'POST',
        dto
      );
      
      console.log(`🎉 [VideoApiService][${methodId}] VEO2 비디오 생성 요청 성공:`, {
        methodId,
        model: 'VEO2',
        jobId: result.jobId,
        status: result.status,
        message: result.message,
        timestamp: new Date().toISOString()
      });
      console.log(`🏁 [VideoApiService][${methodId}] ===== VEO2 완료 =====`);
      
      return result;
    } catch (error) {
      console.error(`❌ [VideoApiService][${methodId}] VEO2 비디오 생성 실패:`, {
        methodId,
        model: 'VEO2',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 5).join('\n')
        } : error,
        requestData: {
          userId: dto.userId,
          notificationId: dto.notificationId,
          prompt: dto.prompt?.substring(0, 50) + '...',
          imageUrlType: dto.imageUrl?.startsWith('data:') ? 'BASE64' : 'URL'
        },
        timestamp: new Date().toISOString()
      });
      console.log(`🔚 [VideoApiService][${methodId}] ===== VEO2 실패 =====`);
      throw error;
    }
  }

  /**
   * Pixverse 이미지-비디오 생성 요청
   */
  static async createPixverseVideo(dto: PixverseImageToVideoDto): Promise<VideoJobResponse> {
    const methodId = `PIXVERSE-${Date.now()}`;
    
    console.log(`🎬 [VideoApiService][${methodId}] ===== Pixverse 비디오 생성 시작 =====`);
    console.log(`📋 [VideoApiService][${methodId}] Pixverse 요청 데이터:`, {
      methodId,
      model: 'Pixverse',
      userId: dto.userId,
      notificationId: dto.notificationId,
      prompt: dto.prompt?.substring(0, 100) + (dto.prompt?.length > 100 ? '...' : ''),
      promptLength: dto.prompt?.length || 0,
      seed: dto.seed,
      aspect_ratio: dto.aspect_ratio,
      resolution: dto.resolution,
      duration: dto.duration,
      negative_prompt: dto.negative_prompt,
      style: dto.style,
      imageUrlType: dto.imageUrl?.startsWith('data:') ? 'BASE64' : 'URL',
      imageUrlLength: dto.imageUrl?.length || 0,
      timestamp: new Date().toISOString()
    });

    try {
      console.log(`⚡ [VideoApiService][${methodId}] Pixverse API 호출 시작...`);
      
      const result = await this.makeRequest<VideoJobResponse>(
        `${this.BASE_PATH}/pixverse`,
        'POST',
        dto
      );
      
      console.log(`🎉 [VideoApiService][${methodId}] Pixverse 비디오 생성 요청 성공:`, {
        methodId,
        model: 'Pixverse',
        jobId: result.jobId,
        status: result.status,
        message: result.message,
        timestamp: new Date().toISOString()
      });
      console.log(`🏁 [VideoApiService][${methodId}] ===== Pixverse 완료 =====`);
      
      return result;
    } catch (error) {
      console.error(`❌ [VideoApiService][${methodId}] Pixverse 비디오 생성 실패:`, {
        methodId,
        model: 'Pixverse',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 5).join('\n')
        } : error,
        requestData: {
          userId: dto.userId,
          notificationId: dto.notificationId,
          prompt: dto.prompt?.substring(0, 50) + '...',
          imageUrlType: dto.imageUrl?.startsWith('data:') ? 'BASE64' : 'URL'
        },
        timestamp: new Date().toISOString()
      });
      console.log(`🔚 [VideoApiService][${methodId}] ===== Pixverse 실패 =====`);
      throw error;
    }
  }

  /**
   * WAN 이미지-비디오 생성 요청
   */
  static async createWanVideo(dto: WanImageToVideoDto): Promise<VideoJobResponse> {
    const methodId = `WAN-${Date.now()}`;
    
    console.log(`🎬 [VideoApiService][${methodId}] ===== WAN 비디오 생성 시작 =====`);
    console.log(`📋 [VideoApiService][${methodId}] WAN 요청 데이터:`, {
      methodId,
      model: 'WAN',
      userId: dto.userId,
      notificationId: dto.notificationId,
      prompt: dto.prompt?.substring(0, 100) + (dto.prompt?.length > 100 ? '...' : ''),
      promptLength: dto.prompt?.length || 0,
      seed: dto.seed,
      enableSafetyChecker: dto.enableSafetyChecker,
      imageUrlType: dto.imageUrl?.startsWith('data:') ? 'BASE64' : 'URL',
      imageUrlLength: dto.imageUrl?.length || 0,
      timestamp: new Date().toISOString()
    });

    try {
      console.log(`⚡ [VideoApiService][${methodId}] WAN API 호출 시작...`);
      
      const result = await this.makeRequest<VideoJobResponse>(
        `${this.BASE_PATH}/wan`,
        'POST',
        dto
      );
      
      console.log(`🎉 [VideoApiService][${methodId}] WAN 비디오 생성 요청 성공:`, {
        methodId,
        model: 'WAN',
        jobId: result.jobId,
        status: result.status,
        message: result.message,
        timestamp: new Date().toISOString()
      });
      console.log(`🏁 [VideoApiService][${methodId}] ===== WAN 완료 =====`);
      
      return result;
    } catch (error) {
      console.error(`❌ [VideoApiService][${methodId}] WAN 비디오 생성 실패:`, {
        methodId,
        model: 'WAN',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 5).join('\n')
        } : error,
        requestData: {
          userId: dto.userId,
          notificationId: dto.notificationId,
          prompt: dto.prompt?.substring(0, 50) + '...',
          imageUrlType: dto.imageUrl?.startsWith('data:') ? 'BASE64' : 'URL'
        },
        timestamp: new Date().toISOString()
      });
      console.log(`🔚 [VideoApiService][${methodId}] ===== WAN 실패 =====`);
      throw error;
    }
  }

  /**
   * 작업 상태 조회
   */
  static async getJobStatus(jobId: string): Promise<VideoJobStatusResponse> {
    const methodId = `STATUS-${Date.now()}`;
    
    console.log(`🔍 [VideoApiService][${methodId}] ===== 작업 상태 조회 시작 =====`);
    console.log(`📋 [VideoApiService][${methodId}] 상태 조회 요청:`, {
      methodId,
      jobId,
      timestamp: new Date().toISOString()
    });

    try {
      console.log(`⚡ [VideoApiService][${methodId}] 상태 조회 API 호출 시작...`);
      
      const result = await this.makeRequest<VideoJobStatusResponse>(
        `${this.BASE_PATH}/status`,
        'GET',
        undefined,
        { jobId }
      );
      
      console.log(`📊 [VideoApiService][${methodId}] 작업 상태 조회 성공:`, {
        methodId,
        jobId: result.jobId,
        status: result.status,
        progress: result.progress,
        hasResult: !!result.result,
        hasError: !!result.error,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        timestamp: new Date().toISOString()
      });
      console.log(`🏁 [VideoApiService][${methodId}] ===== 상태 조회 완료 =====`);
      
      return result;
    } catch (error) {
      console.error(`❌ [VideoApiService][${methodId}] 작업 상태 조회 실패:`, {
        methodId,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 5).join('\n')
        } : error,
        jobId,
        timestamp: new Date().toISOString()
      });
      console.log(`🔚 [VideoApiService][${methodId}] ===== 상태 조회 실패 =====`);
      throw error;
    }
  }

  /**
   * 모델 타입에 따른 동적 비디오 생성 요청
   */
  static async createVideoByModel(
    modelType: 'hunyuan' | 'kling' | 'veo2' | 'pixverse' | 'wan',
    dto: HunyuanImageToVideoDto | KlingImageToVideoDto | Veo2ImageToVideoDto | PixverseImageToVideoDto | WanImageToVideoDto
  ): Promise<VideoJobResponse> {
    console.log(`🎯 [VideoApiService] 동적 비디오 생성 요청:`, {
      modelType,
      userId: dto.userId,
      notificationId: dto.notificationId
    });

    try {
      let result: VideoJobResponse;

      switch (modelType) {
        case 'hunyuan':
          result = await this.createHunyuanVideo(dto as HunyuanImageToVideoDto);
          break;
        case 'kling':
          result = await this.createKlingVideo(dto as KlingImageToVideoDto);
          break;
        case 'veo2':
          result = await this.createVeo2Video(dto as Veo2ImageToVideoDto);
          break;
        case 'pixverse':
          result = await this.createPixverseVideo(dto as PixverseImageToVideoDto);
          break;
        case 'wan':
          result = await this.createWanVideo(dto as WanImageToVideoDto);
          break;
        default:
          console.error(`❌ [VideoApiService] 지원하지 않는 모델 타입:`, { modelType });
          throw new Error(`Unsupported model type: ${modelType}`);
      }

      console.log(`✅ [VideoApiService] 동적 비디오 생성 요청 완료:`, {
        modelType,
        jobId: result.jobId,
        status: result.status
      });

      return result;
    } catch (error) {
      console.error(`❌ [VideoApiService] 동적 비디오 생성 요청 실패:`, {
        modelType,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }
}

// 기본 export
export default VideoApiService;
