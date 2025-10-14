// src/lib/api/GenerationNotificationService.ts
import apiClient from '@/lib/api/apiClient';

/* ------------------------------------------------------------------
 * 타입 정의
 * ------------------------------------------------------------------ */
export type GenerationStatus =
    | 'REQUESTED'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED';

/** 생성(요청) 바디 */
export interface GenerationNotificationCreateRequest {
    /** 예: "골프장에서 매력 뽐내기" */
    title: string;
    /** 최초 썸네일 URL(선택) */
    thumbnailUrl?: string;
    /** 예상 이미지·영상 개수(선택) */
    mediaCount?: number;
}

/** 상태 업데이트 바디 */
export interface GenerationNotificationUpdateRequest {
    status: GenerationStatus;
    /** 변경된 썸네일 URL(선택) */
    thumbnailUrl?: string;
    /** 변경된 이미지·영상 개수(선택) */
    mediaCount?: number;
    /** 생성된 비디오 ID (선택) */
    videoId?: number;
    /** 실패 시 오류 메시지 (선택) */
    errorMessage?: string;
    /** 사용자 ID (필수) */
    userId: string;
}

/** 단건 응답 */
export interface GenerationNotificationResponse {
    id: number;
    title: string;
    thumbnailUrl: string;
    mediaCount: number;
    status: GenerationStatus;
    updatedAt: string; // ISO‑8601 문자열
    /** 생성된 비디오 ID (성공 시) */
    videoId?: number;
    /** 실패 시 오류 메시지 */
    errorMessage?: string;
}

/** 목록 응답 */
export interface GenerationNotificationListResponse {
    notifications: GenerationNotificationResponse[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

/* ------------------------------------------------------------------
 * 서비스 클래스
 * ------------------------------------------------------------------ */
export class GenerationNotificationService {
    /** 백엔드 컨트롤러 base path */
    private static readonly BASE_PATH = '/notifications';

    /**
     * ① 생성(요청) 알림 등록
     */
    static async createNotification(
        request: GenerationNotificationCreateRequest,
    ): Promise<GenerationNotificationResponse> {
        try {
            const { data } = await apiClient.post<GenerationNotificationResponse>(
                this.BASE_PATH,
                request,
            );
            return data;
        } catch {
            throw new Error('생성 요청 알림 등록에 실패했습니다.');
        }
    }

    /**
     * ② 상태/썸네일/개수 업데이트
     */
    static async updateNotification(
        id: number,
        request: GenerationNotificationUpdateRequest,
    ): Promise<GenerationNotificationResponse> {
        try {
            console.log(`[GenerationNotificationService] 알림 업데이트 요청:`, {
                id,
                request,
                url: `${this.BASE_PATH}/${id}`
            });

            const { data } = await apiClient.put<GenerationNotificationResponse>(
                `${this.BASE_PATH}/${id}`,
                request,
            );

            console.log(`[GenerationNotificationService] 알림 업데이트 성공:`, {
                id,
                response: data
            });

            return data;
        } catch (error: unknown) {
            console.error(`[GenerationNotificationService] 알림 업데이트 실패:`, {
                id,
                request,
                error
            });

            const err = error as { response?: { status?: number, data?: unknown } };
            if (err.response?.status === 401) {
                throw new Error('인증이 필요합니다.');
            }

            // 더 자세한 에러 정보 출력
            const responseData = err.response?.data as { message?: string } | undefined;
            const errorMessage = responseData?.message || (typeof err.response?.data === 'string' ? err.response.data : '알림 상태 업데이트에 실패했습니다.');
            throw new Error(errorMessage);
        }
    }


    /**
     * ③ 단일 알림 조회
     */
    static async getNotification(id: number): Promise<GenerationNotificationResponse> {
        try {
            const { data } = await apiClient.get<GenerationNotificationResponse>(
                `${this.BASE_PATH}/${id}`,
            );
            return data;
        } catch {
            throw new Error('알림 정보 조회에 실패했습니다.');
        }
    }

    /**
     * ④ 내 알림(요청 목록) 조회
     */
    static async getNotifications(
        page: number = 0,
        size: number = 10,
    ): Promise<GenerationNotificationListResponse> {
        try {
            const { data } = await apiClient.get<GenerationNotificationListResponse>(
                this.BASE_PATH,
                { params: { page, size } },
            );
            return data;
        } catch {
            throw new Error('알림 목록 조회에 실패했습니다.');
        }
    }
}

export * from '@/features/admin/services/GenerationNotificationService';
