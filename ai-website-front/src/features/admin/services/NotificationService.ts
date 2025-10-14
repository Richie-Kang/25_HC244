import apiClient from '@/lib/api/apiClient';

// 알림 요청 인터페이스
export interface NotificationRequest {
    title: string;
    content: string;
    target: string;
    specificUserId?: string;
}

// 알림 응답 인터페이스
export interface NotificationResponse {
    id: number;
    title: string;
    content: string;
    target: string;
    createdAt: string;
}

// 알림 목록 응답 인터페이스
export interface NotificationListResponse {
    notifications: NotificationResponse[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

// 알림 전송 응답 인터페이스
export interface NotificationSendResponse {
    success: boolean;
    message: string;
}

// 알림 서비스 클래스
export class NotificationService {
    private static readonly BASE_PATH = '/admin/notifications';

    // 알림 전송
    static async sendNotification(request: NotificationRequest): Promise<NotificationSendResponse> {
        try {
            const response = await apiClient.post<NotificationSendResponse>(`${this.BASE_PATH}/send`, request);
            return response.data;
        } catch {
            throw new Error('알림 전송에 실패했습니다.');
        }
    }

    // 알림 목록 조회
    static async getNotifications(page: number = 0, size: number = 10): Promise<NotificationListResponse> {
        try {
            const response = await apiClient.get<NotificationListResponse>(this.BASE_PATH, {
                params: { page, size }
            });
            return response.data;
        } catch {
            throw new Error('알림 목록 조회에 실패했습니다.');
        }
    }

    // 오늘의 알림 개수 조회
    static async getTodayNotificationsCount(): Promise<number> {
        try {
            const response = await apiClient.get<number>(`${this.BASE_PATH}/count/today`);
            return response.data;
        } catch {
            throw new Error('오늘의 알림 개수 조회에 실패했습니다.');
        }
    }

    // 특정 알림 읽음 처리
    static async markAsRead(id: number): Promise<NotificationResponse> {
        try {
            const response = await apiClient.put<NotificationResponse>(`${this.BASE_PATH}/${id}/read`);
            return response.data;
        } catch {
            throw new Error('알림 읽음 처리에 실패했습니다.');
        }
    }

    // 모든 알림 읽음 처리
    static async markAllAsRead(): Promise<NotificationSendResponse> {
        try {
            const response = await apiClient.put<NotificationSendResponse>(`${this.BASE_PATH}/read-all`);
            return response.data;
        } catch {
            throw new Error('전체 알림 읽음 처리에 실패했습니다.');
        }
    }
}
