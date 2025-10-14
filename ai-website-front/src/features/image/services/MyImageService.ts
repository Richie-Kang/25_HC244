import apiClient from '@/lib/api/apiClient';
import { ImageItem } from '../types/Image';

/**
 * 특정 ID의 이미지 조회
 * @param id 이미지 ID
 */
export const getImageById = async (id: number): Promise<ImageItem> => {
    try {
        console.log(`[MyImageService] 이미지 조회 시작, ID: ${id}`);
        const response = await apiClient.get<ImageItem>(`/my/images/${id}`);
        console.log(`[MyImageService] 이미지 조회 성공, ID: ${id}`, {
            imageId: response.data.id,
            fileName: response.data.fileName,
            url: response.data.url ? '있음' : '없음',
            thumbnailUrl: response.data.thumbnailUrl ? '있음' : '없음'
        });
        return response.data;
    } catch (error) {
        console.error(`[오류] ID ${id}의 이미지 조회 실패:`, error);
        throw error;
    }
};

/**
 * 사용자의 모든 이미지 목록 조회
 */
export const getMyImages = async (): Promise<ImageItem[]> => {
    try {
        const response = await apiClient.get<ImageItem[]>('/my/images');
        return response.data;
    } catch (error) {
        console.error('[오류] 내 이미지 목록 조회 실패:', error);
        throw error;
    }
};

/**
 * 이미지 공유 상태 토글
 * @param id 이미지 ID
 * @param share 공유 여부
 */
export const toggleImageShare = async (id: number, share: boolean): Promise<ImageItem> => {
    try {
        console.log(`[MyImageService] 이미지 공유 상태 변경 시작, ID: ${id}, 공유: ${share}`);
        const response = await apiClient.patch<ImageItem>(`/my/images/${id}/share`, { share });
        console.log(`[MyImageService] 이미지 공유 상태 변경 성공, ID: ${id}`, {
            newShareStatus: response.data.status
        });
        return response.data;
    } catch (error) {
        console.error(`[오류] ID ${id}의 이미지 공유 상태 변경 실패:`, error);
        throw error;
    }
};

/**
 * 이미지 이름 변경
 * @param id 이미지 ID
 * @param fileName 새로운 파일명
 */
export const renameImage = async (id: number, fileName: string): Promise<ImageItem> => {
    try {
        console.log(`[MyImageService] 이미지 이름 변경 시작, ID: ${id}, 새 이름: ${fileName}`);
        const response = await apiClient.patch<ImageItem>(`/my/images/${id}/rename`, { fileName });
        console.log(`[MyImageService] 이미지 이름 변경 성공, ID: ${id}`);
        return response.data;
    } catch (error) {
        console.error(`[오류] ID ${id}의 이미지 이름 변경 실패:`, error);
        throw error;
    }
};

/**
 * 이미지 삭제
 * @param id 이미지 ID
 */
export const deleteMyImage = async (id: number): Promise<void> => {
    try {
        console.log(`[MyImageService] 이미지 삭제 시작, ID: ${id}`);
        await apiClient.delete(`/my/images/${id}`);
        console.log(`[MyImageService] 이미지 삭제 성공, ID: ${id}`);
    } catch (error) {
        console.error(`[오류] ID ${id}의 이미지 삭제 실패:`, error);
        throw error;
    }
};

/**
 * 카테고리별 내 이미지 목록 조회
 * @param category 이미지 카테고리
 */
export const getMyImagesByCategory = async (category: string): Promise<ImageItem[]> => {
    try {
        const response = await apiClient.get<ImageItem[]>(`/my/images/category/${category}`);
        return response.data;
    } catch (error) {
        console.error(`[오류] 카테고리 ${category}의 내 이미지 목록 조회 실패:`, error);
        throw error;
    }
}; 