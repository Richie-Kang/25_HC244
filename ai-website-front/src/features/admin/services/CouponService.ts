import apiClient from '@/lib/api/apiClient';

export interface CouponRequest {
    code: string;
    creditAmount: number;
    expiresAt: string; // ISO 8601 형식의 날짜 문자열 (YYYY-MM-DDTHH:mm:ss)
}

export interface CouponUseRequest {
    code: string;
}

export interface CouponResponse {
    success: boolean;
    message: string;
    code?: string;
    creditAmount?: number;
    expiresAt?: string;
}

export interface CouponDto {
    code: string;
    creditAmount: number;
    createdAt: string;
    expiresAt: string;
    expired: boolean;
    redemptionCount: number;
}

export interface CouponListResponse {
    success: boolean;
    message: string;
    coupons?: CouponDto[];
}

export class CouponService {
    private static BASE_URL = '/coupons';

    private static formatDateTime(dateString: string): string {
        // 날짜만 있는 경우 (YYYY-MM-DD) 시간을 23:59:59로 설정
        if (dateString.length === 10) {
            return `${dateString}T23:59:59`;
        }
        return dateString;
    }

    // 쿠폰 등록 (관리자 전용)
    static async registerCoupon(request: CouponRequest): Promise<CouponResponse> {
        const formattedRequest = {
            code: request.code.trim(),
            creditAmount: Number(request.creditAmount),
            expiresAt: this.formatDateTime(request.expiresAt)
        };

        const { data } = await apiClient.post<CouponResponse>(this.BASE_URL, formattedRequest);
        if (!data.success) {
            throw new Error(data.message);
        }
        return data;
    }

    // 모든 쿠폰 목록 조회 (관리자 전용)
    static async getAllCoupons(): Promise<CouponListResponse> {
        const { data } = await apiClient.get<CouponListResponse>(this.BASE_URL);
        if (!data.success) {
            throw new Error(data.message);
        }
        return data;
    }

    // 사용 가능한 쿠폰 목록 조회
    static async getAvailableCoupons(): Promise<CouponListResponse> {
        const { data } = await apiClient.get<CouponListResponse>(`${this.BASE_URL}/available`);
        if (!data.success) {
            throw new Error(data.message);
        }
        return data;
    }

    // 내 쿠폰 목록 조회
    static async getUserCoupons(): Promise<CouponListResponse> {
        const { data } = await apiClient.get<CouponListResponse>(`${this.BASE_URL}/my`);
        if (!data.success) {
            throw new Error(data.message);
        }
        return data;
    }

    // 쿠폰 사용
    static async useCoupon(code: string): Promise<CouponResponse> {
        const request: CouponUseRequest = {
            code: code.trim()
        };
        const { data } = await apiClient.post<CouponResponse>(`${this.BASE_URL}/use`, request);
        if (!data.success) {
            throw new Error(data.message);
        }
        return data;
    }

    // 쿠폰 해제 (관리자 전용)
    static async releaseCoupon(code: string): Promise<CouponResponse> {
        const request: CouponUseRequest = {
            code: code.trim()
        };
        const { data } = await apiClient.post<CouponResponse>(`${this.BASE_URL}/release`, request);
        if (!data.success) {
            throw new Error(data.message);
        }
        return data;
    }
}
