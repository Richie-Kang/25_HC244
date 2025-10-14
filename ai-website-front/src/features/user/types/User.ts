export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  // 필요한 다른 사용자 정보가 있다면 추가
}

export interface User {
  id?: number;
  email: string;
  name?: string;
  role: string;
  nickname?: string;
}

export interface AuthCheckResponse {
  isAuthenticated: boolean;
  email?: string;
  role?: string;
  nickname?: string;
}