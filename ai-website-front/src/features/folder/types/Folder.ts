// 폴더 관련 타입 정의

// 폴더 인터페이스 정의
export interface Folder {
  id: number;
  name: string;
  creator?: string;
  createdAt?: string;
  updatedAt?: string;
  itemCount?: number;
}

// 폴더 아이템 인터페이스 정의
export interface FolderItem {
  id: number;
  folderId: number;
  itemId: number;
  itemType: string;
  createdAt?: string;
  // 추가 필드 (백엔드 응답에 따라 확장 가능)
  name?: string;
  thumbnailUrl?: string;
  url?: string;
}

// 폴더 생성 요청 인터페이스
export interface CreateFolderRequest {
  name: string;
}

// 폴더 업데이트 요청 인터페이스
export interface UpdateFolderRequest {
  name: string;
}

// 폴더 아이템 추가 요청 인터페이스
export interface AddItemRequest {
  itemId: number;
  itemType: string;
}