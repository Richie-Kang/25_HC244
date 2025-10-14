// 비디오 데이터 타입 정의
export interface VideoDto {
  id?: number;
  name: string;
  url?: string;
  thumbnailUrl?: string;
  prompt?: string;
  model?: string;
  createdAt?: string;
  mode?: string;
  share?: boolean;
  liked?: boolean;
  likeCount?: number;
  clickCount?: number;
  creator?: string;
}

export interface VideoItem {
  id: number;
  name: string;
  thumbnailUrl: string;
  url: string;
  creator: string;
  size?: "small" | "medium" | "large";
  aspectRatio?: number;
  likeCount?: number;
  liked?: boolean;
}

// 비디오 생성 요청 데이터
export interface VideoCreateRequest {
  videoName: string;
  prompt: string;
  endpoint: string;
  model: string;
  videoUrl: string;
  mode?: 'TEXT' | 'IMAGE';
  referenceUrl?: string;
}

// 비디오 공유 상태 업데이트 요청
export interface VideoShareRequest {
  id: number;
  share: boolean;
}

// 비디오 좋아요 상태 업데이트 요청 
export interface VideoLikeRequest {
  id: number;
  like: boolean;
}