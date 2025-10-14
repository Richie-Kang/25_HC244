import axios from 'axios';

// 환경변수에서 BASE_URL 가져오기 (또는 직접 설정)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080/api';

// API 클라이언트 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 모든 요청에 쿠키 포함
  timeout: 120000, // 타임아웃 2분으로 증가 (비디오 생성 작업 고려)
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 디버그 로깅 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 [API 요청] ${config.method?.toUpperCase()} ${config.url}`);
    }

    // multipart/form-data인 경우 Content-Type 헤더를 자동으로 설정하도록 함
    if (config.data instanceof FormData) {
      if (config.headers) {
        config.headers['Content-Type'] = 'multipart/form-data';
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    // 성공 응답 로깅 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 [API 응답] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    // 에러 처리 로직
    if (error.response) {
      // 서버가 응답을 반환한 경우
      console.error('API 응답 에러:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: typeof error.response.data === 'object'
          ? JSON.stringify(error.response.data).substring(0, 150)
          : String(error.response.data).substring(0, 150),
      });
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error('API 요청 에러: 서버로부터 응답이 없습니다', {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout,
        error: error.message,
      });
    } else {
      // 요청 설정 중에 에러가 발생한 경우
      console.error('API 설정 에러:', error.message);
    }

    // 401 Unauthorized 에러 처리
    if (error.response?.status === 401) {
      // 현재 요청 URL이 인증이 필요한 API인지 확인
      const url = error.config?.url || '';
      if (url.includes('/api/video') || url.includes('/my/') || url.includes('/admin/')) {
        // 서버 사이드에서는 리다이렉트를 하지 않고 에러만 반환
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;