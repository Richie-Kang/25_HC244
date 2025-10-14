import { ImageItem, ApiResponse } from '../types/Image';
import apiClient from '@/lib/api/apiClient';


/**
 * 모든 이미지 목록을 가져오는 함수
 * @returns 이미지 목록
 */
export const getImages = async (): Promise<ImageItem[]> => {
  try {
    const response = await apiClient.get<ImageItem[]>('/images');
    return response.data;
  } catch (error) {
    console.error('이미지 목록을 가져오는데 실패했습니다:', error);
    throw error;
  }
};

/**
 * Fashn 폴더에 이미지를 업로드하는 함수
 * @param imageUrl 업로드할 이미지 URL
 * @param userId 사용자 ID
 * @returns 업로드된 파일 정보
 */
export const uploadFashnImage = async (imageUrl: string, userId?: string | number): Promise<ApiResponse<ImageItem>> => {
  try {
    console.log('📤 Fashn 업로드 시도 - URL:', imageUrl, 'userId:', userId);

    // 기존 방식으로 시도
    const uploadResponse = await apiClient.post<ApiResponse<ImageItem>>(
      '/files/upload/fashn',
      { imageUrl }
    );
    console.log('✅ Fashn 업로드 성공 (기존 방식):', uploadResponse.data);
    return uploadResponse.data;
  } catch (error) {
    console.error('❌ Fashn 업로드 실패 (기존 방식):', error);

    // 에러 로그 자세히 출력
    if (error instanceof Error) {
      console.error('기존 업로드 에러 메시지:', error.message);
      console.error('기존 업로드 에러 스택:', error.stack);
    }

    console.warn('🔄 기존 Fashn 업로드 실패, 폴더 시스템으로 저장 시도');

    // 기존 방식이 실패하면 폴더 시스템을 사용하여 저장
    if (userId) {
      try {
        return await uploadImageToFashnFolder(imageUrl, userId);
      } catch (folderError) {
        console.error('❌ 폴더 시스템 저장도 실패:', folderError);
        if (folderError instanceof Error) {
          console.error('폴더 저장 에러 메시지:', folderError.message);
          console.error('폴더 저장 에러 스택:', folderError.stack);
        }
        throw folderError;
      }
    } else {
      console.error('❌ 사용자 ID가 없어 폴더 저장을 할 수 없습니다.');
      throw new Error('사용자 ID가 없어 결과 이미지를 저장할 수 없습니다.');
    }
  }
};

/**
 * 폴더 시스템을 사용하여 Fashn 결과 이미지를 저장하는 함수
 * @param imageUrl 저장할 이미지 URL
 * @param userId 사용자 ID
 * @returns 저장된 파일 정보
 */
const uploadImageToFashnFolder = async (imageUrl: string, userId: string | number): Promise<ApiResponse<ImageItem>> => {
  try {
    console.log('📂 폴더 시스템으로 Fashn 이미지 저장 시도:', { imageUrl, userId });

    // FolderService를 동적 import
    const { FolderService } = await import('../../folder/services/FolderService');

    // 사용자의 폴더 목록 가져오기
    console.log('📁 사용자 폴더 목록 조회 중...');
    const folders = await FolderService.getFolders();
    console.log('📁 조회된 폴더 목록:', folders);

    // "fashn" 폴더 찾기 또는 생성 (서버와 동일한 이름 사용)
    let fashnFolder = folders.find(folder => folder.name === 'fashn');

    if (!fashnFolder) {
      console.log('📁 fashn 폴더가 없어 새로 생성합니다...');
      // fashn 폴더가 없으면 생성
      fashnFolder = await FolderService.createFolder({
        name: 'fashn'
      });
      console.log('✅ fashn 폴더 생성 완료:', fashnFolder);
    } else {
      console.log('✅ 기존 fashn 폴더 찾음:', fashnFolder);
    }

    // 이미지 다운로드
    console.log('⬇️ 이미지 다운로드 시작:', imageUrl);

    // URL이 유효한지 먼저 확인
    try {
      const url = new URL(imageUrl);
      console.log('✅ URL 유효성 검사 통과:', url.href);
    } catch (urlError) {
      console.error('❌ 잘못된 URL:', imageUrl);
      throw new Error(`잘못된 이미지 URL: ${imageUrl}`);
    }

    // Next.js internal route를 사용하여 이미지 다운로드
    const response = await fetch('/internal/download-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: imageUrl,
        fileName: `virtual-fitting-${Date.now()}.png`
      })
    });

    if (!response.ok) {
      console.error('❌ 이미지 다운로드 실패:', {
        status: response.status,
        statusText: response.statusText,
        url: imageUrl
      });
      throw new Error(`이미지 다운로드 실패: HTTP ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    console.log('✅ 이미지 다운로드 완료:', { size: blob.size, type: blob.type });

    // Blob을 File 객체로 변환
    const fileName = `virtual-fitting-${Date.now()}.png`;
    const file = new File([blob], fileName, { type: 'image/png' });
    console.log('📄 파일 객체 생성:', { name: file.name, size: file.size, type: file.type });

    // 폴더에 파일 업로드
    console.log('📤 폴더에 파일 업로드 시작...');
    const uploadedFile = await FolderService.uploadFile(fashnFolder.id, file);
    console.log('✅ 폴더 업로드 완료:', uploadedFile);

    // ApiResponse 형태로 반환
    const result = {
      data: {
        id: uploadedFile.id,
        fileName: uploadedFile.name,
        url: uploadedFile.url,
        thumbnailUrl: uploadedFile.url, // 썸네일은 동일한 URL 사용
        category: 'fashn',
        fileSize: file.size, // 실제 파일 크기 사용
        format: 'png',
        lastModified: new Date().toISOString(),
        status: 'completed',
        createdAt: new Date().toISOString(),
        creator: String(userId)
      } as ImageItem,
      message: '가상 피팅 결과가 저장되었습니다.',
      status: 200
    };

    console.log('✅ 최종 반환 결과:', result);
    return result;
  } catch (error) {
    console.error('❌ 폴더 시스템 저장 실패:', error);
    if (error instanceof Error) {
      console.error('폴더 저장 세부 에러:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw new Error(`폴더 시스템을 통한 이미지 저장 실패: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Upscaler 폴더에 이미지를 업로드하는 함수
 * @param imageUrl 업로드할 이미지 URL
 * @returns 업로드된 파일 정보
 */
export const uploadUpscalerImage = async (imageUrl: string): Promise<ApiResponse<ImageItem>> => {
  try {
    const uploadResponse = await apiClient.post<ApiResponse<ImageItem>>(
      '/files/upload/upscaler',
      { imageUrl }
    );
    return uploadResponse.data;
  } catch (error) {
    console.error('Upscaler 이미지 업로드에 실패했습니다:', error);
    throw error;
  }
};

/**
 * 카테고리별 이미지 목록을 가져오는 함수
 * @param category 이미지 카테고리
 * @returns 필터링된 이미지 목록
 */
export const getImagesByCategory = async (category: string): Promise<ImageItem[]> => {
  try {
    const response = await apiClient.get<ImageItem[]>(`/images?category=${category}`);
    return response.data;
  } catch (error) {
    console.error(`카테고리 ${category}의 이미지를 가져오는데 실패했습니다:`, error);
    throw error;
  }
};

/**
 * 여러 이미지를 업로드하는 함수
 * @param files 업로드할 파일 목록
 * @param category 이미지 카테고리
 * @returns 업로드 결과
 */
export const uploadImages = async (files: File[], category: string): Promise<ApiResponse<ImageItem[]>> => {
  const formData = new FormData();

  // 파일 추가
  files.forEach(file => {
    formData.append('images', file);
  });

  // 카테고리 추가
  formData.append('category', category);

  const response = await apiClient.post<ApiResponse<ImageItem[]>>('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

/**
 * 이미지를 삭제하는 함수
 * @param imageId 삭제할 이미지 ID
 * @returns 삭제 결과
 */
export const deleteImage = async (imageId: number): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.delete<ApiResponse<void>>(`/images/${imageId}`);
    return response.data;
  } catch (error) {
    console.error(`이미지 ID ${imageId} 삭제에 실패했습니다:`, error);
    throw error;
  }
};

export async function downloadImage(imageUrl: string, fileName: string) {
  try {
    // Next.js internal route를 사용하여 이미지 다운로드
    const response = await fetch('/internal/download-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: imageUrl,
        fileName: fileName
      })
    });

    if (!response.ok) {
      throw new Error('이미지 다운로드에 실패했습니다.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}