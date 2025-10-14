import apiClient from '@/lib/api/apiClient';

export interface FolderRequest {
  name: string;
}

export interface FolderResponse {
  id: number;
  name: string;
  path: string;
}

export interface FileResponse {
  id: number;
  name: string;
  url: string;
}

export const FolderService = {
  // 폴더 생성
  createFolder: async (folderRequest: FolderRequest): Promise<FolderResponse> => {
    const response = await apiClient.post<FolderResponse>('/folders', folderRequest);
    return response.data;
  },

  // 폴더 목록 조회
  getFolders: async (): Promise<FolderResponse[]> => {
    const response = await apiClient.get<FolderResponse[]>('/folders');
    return response.data;
  },

  // 폴더 삭제
  deleteFolder: async (folderId: number): Promise<{ success: boolean; message?: string }> => {
    try {
      await apiClient.delete(`/folders/${folderId}`);
      return { success: true };
    } catch (error) {
      console.error('폴더 삭제 에러:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '폴더 삭제에 실패했습니다'
      };
    }
  },

  // 폴더 내 파일 목록 조회
  getFilesByFolder: async (folderId: number): Promise<FileResponse[]> => {
    const response = await apiClient.get<FileResponse[]>(`/files/folder/${folderId}`);
    return response.data;
  },

  // 파일 업로드
  uploadFile: async (folderId: number, file: File): Promise<FileResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post<FileResponse>(
        `/files/upload/${folderId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },

        }
      );
      console.log('파일 업로드 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('파일 업로드 에러:', error);
      throw error;
    }
  },

  // 파일 삭제
  deleteFile: async (fileId: number): Promise<{ success: boolean; message?: string }> => {
    try {
      await apiClient.delete(`/files/${fileId}`);
      return { success: true };
    } catch (error) {
      console.error('파일 삭제 에러:', error);

      // HTTP 상태 코드에 따른 에러 처리
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 404) {
          return {
            success: false,
            message: '파일을 찾을 수 없습니다'
          };
        } else if (axiosError.response?.status === 403) {
          return {
            success: false,
            message: '파일 삭제 권한이 없습니다'
          };
        }
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : '파일 삭제에 실패했습니다'
      };
    }
  },
};
