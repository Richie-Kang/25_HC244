import apiClient from '../../../lib/api/apiClient';
import { LoginRequest, LoginResponse } from '../types/User';

/**
 * 이메일/비밀번호 로그인 함수
 * @param credentials 로그인 정보 (이메일, 비밀번호)
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/users/login', credentials);
    return response.data;
  } catch (error) {
    console.error('로그인에 실패했습니다:', error);
    throw error;
  }
};

/**
 * Google 로그인 URL 반환 함수
 */
export const getGoogleLoginUrl = (): string => {
  // apiClient의 baseURL 사용
  return `${apiClient.defaults.baseURL}/auth/google`;
};

/**
 * 현재 사용자 인증 상태를 확인하는 함수
 * @returns 인증된 사용자 정보 또는 인증되지 않음 상태
 */
interface AuthCheckResponse {
  isAuthenticated: boolean;
  email?: string;
  id?: number;
  nickname?: string;
  role?: string;
  createdAt?: string;
}

export const getCurrentUser = async (): Promise<AuthCheckResponse> => {
  try {
    const response = await apiClient.get<AuthCheckResponse>('/auth/me');

    // 정상 응답인 경우
    return {
      isAuthenticated: true,
      email: response.data.email,
      id: response.data.id,
      nickname: response.data.nickname,
      role: response.data.role,
      createdAt: response.data.createdAt
    };
  } catch (error) {
    console.error('사용자 인증 확인 실패:', error);

    // 인증 실패 시 기본 응답
    return {
      isAuthenticated: false
    };
  }
};

// 기존 코드에 추가

/**
 * 사용자 로그아웃 함수
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
    // 쿠키는 자동으로 삭제됨 (서버에서 처리)
  } catch (error) {
    console.error('로그아웃 처리 중 오류 발생:', error);
    throw error;
  }
};