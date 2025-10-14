// 이미지 타입 정의 - 백엔드 모델에 맞게 수정
// 기존 ImageItem 타입 정의를 확장하세요
export interface ImageItem {
  id: number;
  fileName: string;
  url: string;
  thumbnailUrl: string;
  category?: string;
  fileSize: number;
  format: string;
  lastModified: string;
  prompt?: string;
  status: string;
  createdAt: string;
  creator: string;
}

export interface FilterOptions {
  search: string;
  categories: string[];
  size: string;
  sortBy: '최신순' | '오래된순';
}

export interface ImageUploadResponse {
  success: boolean;
  imageUrl: string;
  error?: string;
}

// 응답 타입 정의
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}