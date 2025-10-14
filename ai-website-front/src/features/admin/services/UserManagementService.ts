import apiClient from '@/lib/api/apiClient';

// 요청 타입 정의
export interface UserManagementRequest {
    page?: number;
    size?: number;
    direction?: 'next' | 'prev';
}

// 사용자 타입 정의
export interface User {
    id: number;
    email: string;
    username: string;
    nickname: string;
    role: string;
    createdAt: string;
    // 필요한 다른 사용자 필드들...
}

// 응답 타입 정의
export interface UserManagementResponse {
    users: User[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export class UserManagementService {
    private static readonly BASE_URL = '/admin/users';

    /**
     * 사용자 목록을 페이지네이션과 함께 조회합니다.
     * @param request 페이지네이션 및 방향 정보
     * @returns 사용자 목록 및 페이지네이션 정보
     */
    static async getUserList(request: UserManagementRequest = {}): Promise<UserManagementResponse> {
        const { page = 0, size = 20, direction } = request;

        try {
            const response = await apiClient.get<UserManagementResponse>(this.BASE_URL, {
                params: {
                    page,
                    size,
                    direction,
                },
            });

            return response.data;
        } catch (error) {
            // 에러 처리는 apiClient의 인터셉터에서 기본적으로 처리됩니다.
            throw error;
        }
    }
}
