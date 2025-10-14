// 파일 관련 타입 정의

// 파일 데이터 인터페이스
export interface FileData {
  id: number;
  name?: string;         // fileName에 해당
  url?: string;         // fileUrl에 해당
}

// 파일 업로드 응답 인터페이스
export interface FileUploadResponse {
  id: number;
  name: string;
  url: string;
  createdAt: string;
  folderId: number;
}

// 파일 삭제 응답 인터페이스
export interface FileDeleteResponse {
  success: boolean;
  message: string;
}
