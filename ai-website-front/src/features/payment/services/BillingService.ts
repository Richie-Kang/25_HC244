import apiClient from '@/lib/api/apiClient';

export interface CreditChargeRequest {
    amount: number;
}

export interface CreditConsumeRequest {
    amount: number;
    reason: string;
}

export interface CreditResponse {
    currentCredit: number;
}

export interface CreditTransactionResponse {
    id: number;
    amount: number;
    reason: string;
    createdAt: string;
}

export const BillingService = {
    // 크레딧 충전
    chargeCredit: async (request: CreditChargeRequest): Promise<CreditResponse> => {
        const response = await apiClient.post<CreditResponse>('/credits/charge', request);
        return response.data;
    },

    // 크레딧 사용
    consumeCredit: async (request: CreditConsumeRequest): Promise<CreditResponse> => {
        const response = await apiClient.post<CreditResponse>('/credits/consume', request);
        return response.data;
    },

    // 현재 크레딧 조회
    getCurrentCredit: async (): Promise<CreditResponse> => {
        const response = await apiClient.get<CreditResponse>('/credits');
        return response.data;
    },

    // 크레딧 사용 내역 조회
    getCreditHistory: async (): Promise<CreditTransactionResponse[]> => {
        const response = await apiClient.get<CreditTransactionResponse[]>('/credits/history');
        return response.data;
    },
};
