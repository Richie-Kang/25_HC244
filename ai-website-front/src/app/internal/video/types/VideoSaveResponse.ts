/**
 * 비디오 저장 응답 타입
 */
export interface VideoSaveResponse {
    /** 저장된 비디오 ID */
    id: number;

    /** 저장 성공 여부 */
    success: boolean;

    /** 비디오 URL */
    videoUrl: string;

    /** 썸네일 URL */
    thumbnailUrl?: string;

    /** 생성 날짜 */
    createdAt: string;

    /** 저장 메시지 */
    message?: string;
} 