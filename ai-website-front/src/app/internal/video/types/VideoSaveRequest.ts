/**
 * 비디오 저장 요청 타입
 */
export interface VideoSaveRequest {
    /** 비디오 생성 시 사용된 프롬프트 */
    prompt: string;

    /** 사용된 엔드포인트 (API 경로) */
    endpoint: string;

    /** 사용된 모델 이름 */
    model: string;

    /** 비디오 이름 */
    videoName: string;

    /** 생성된 비디오 URL */
    videoUrl: string;

    /** 참조 이미지 URL (옵션) */
    referenceUrl?: string;

    /** 활성 탭 (생성 방식) */
    activeTab?: 'video' | 'image' | 'text';

    /** 생성 요청 ID (FAL.ai가 생성한 요청 ID) */
    falRequestId?: string;

    /** 내부 요청 ID */
    requestId?: string;

    /** 알림 ID */
    notificationId?: number;
} 