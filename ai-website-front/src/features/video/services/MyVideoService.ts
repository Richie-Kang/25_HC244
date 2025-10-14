import apiClient from '@/lib/api/apiClient';
import { VideoDto, VideoCreateRequest } from '../types/Video';

/**
 * 특정 ID의 비디오 조회
 * @param id 비디오 ID
 */
export const getVideoById = async (id: number): Promise<VideoDto> => {
  try {
    console.log(`[MyVideoService] 비디오 조회 시작, ID: ${id}`);
    const response = await apiClient.get<VideoDto>(`/my/videos/${id}`);
    console.log(`[MyVideoService] 비디오 조회 성공, ID: ${id}`, {
      videoId: response.data.id,
      name: response.data.name,
      url: response.data.url ? '있음' : '없음',
      thumbnailUrl: response.data.thumbnailUrl ? '있음' : '없음'
    });
    return response.data;
  } catch (error) {
    // 에러는 모든 환경에서 로깅 (중요 에러 추적용)
    console.error(`[오류] ID ${id}의 비디오 조회 실패:`, error);
    throw error;
  }
};

/**
 * 공유된 비디오 상세 조회 (현재 사용자의 좋아요 상태 포함)
 * @param id 비디오 ID
 */
export const getSharedVideoById = async (id: number): Promise<VideoDto> => {
  try {
    const response = await apiClient.get<VideoDto>(`/videos/shared/${id}`);
    return response.data;
  } catch (error) {
    console.error(`[오류] 공유된 비디오 ID ${id} 조회 실패:`, error);
    throw error;
  }
};

/**
 * 사용자 비디오 목록 조회
 */
export const getUserVideos = async (): Promise<VideoDto[]> => {
  try {
    const response = await apiClient.get<VideoDto[]>('/my/videos/user');
    return response.data;
  } catch (error) {
    // 중요 에러만 로깅
    console.error('[오류] 사용자 비디오 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 좋아요한 비디오 목록 조회
 */
export const getLikedVideos = async (): Promise<VideoDto[]> => {
  try {
    const response = await apiClient.get<VideoDto[]>('/videos/like/my');
    return response.data;
  } catch (error) {
    // 중요 에러만 로깅
    console.error('[오류] 좋아요한 비디오 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 공유된 비디오 목록 조회 (로그인 필요)
 */
export const getSharedVideos = async (): Promise<VideoDto[]> => {
  try {
    const response = await apiClient.get<VideoDto[]>('/videos/shared');
    return response.data;
  } catch (error) {
    // 중요 에러만 로깅
    console.error('[오류] 공유된 비디오 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 공유된 비디오 목록 조회 (로그인 불필요)
 */
export const getSharedVideosNoLogin = async (): Promise<VideoDto[]> => {
  try {
    const response = await apiClient.get<VideoDto[]>('/videos/shared/no-login');
    return response.data;
  } catch (error) {
    // 중요 에러만 로깅
    console.error('[오류] 공유된 비디오 목록(비로그인) 조회 실패:', error);
    throw error;
  }
};

/**
 * 비디오 타입 기준 조회
 * @param type 비디오 타입 (VIDEO, IMAGE, TEXT)
 */
export const getVideosByType = async (type: string): Promise<VideoDto[]> => {
  try {
    const response = await apiClient.get<VideoDto[]>(`/my/videos/type/${type.toUpperCase()}`);
    return response.data;
  } catch (error) {
    // 중요 에러만 로깅
    console.error(`[오류] 타입 ${type}의 비디오 목록 조회 실패:`, error);
    throw error;
  }
};

/**
 * 비디오 공유 상태 토글
 * @param id 비디오 ID
 * @param share 공유 상태 (true/false)
 */
export const toggleVideoShare = async (id: number, share: boolean): Promise<VideoDto> => {
  try {
    const response = await apiClient.patch<VideoDto>(`/my/videos/${id}/share?share=${share}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[정보] 비디오 ID ${id} 공유 상태 변경: ${share}`);
    }
    return response.data;
  } catch (error) {
    // 중요 에러만 로깅
    console.error(`[오류] 비디오 ID ${id} 공유 상태 변경 실패:`, error);
    throw error;
  }
};

/**
 * 비디오 좋아요 상태 업데이트
 * @param id 비디오 ID
 * @param like 좋아요 상태 (true/false)
 */
export const updateVideoLike = async (id: number, like: boolean): Promise<VideoDto> => {
  try {
    const response = await apiClient.patch<VideoDto>(`/videos/like/${id}?like=${like}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[정보] 비디오 ID ${id} 좋아요 상태 변경: ${like}`);
    }
    return response.data;
  } catch (error) {
    // 중요 에러만 로깅
    console.error(`[오류] 비디오 ID ${id} 좋아요 상태 변경 실패:`, error);
    throw error;
  }
};

/**
 * 비디오 이름 변경
 * @param id 비디오 ID
 * @param newName 새로운 비디오 이름
 */
export const renameVideo = async (id: number, newName: string): Promise<VideoDto> => {
  try {
    const response = await apiClient.patch<VideoDto>(`/my/videos/${id}/rename`, {
      name: newName
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[정보] 비디오 ID ${id} 이름 변경 성공: ${newName}`);
    }
    return response.data;
  } catch (error) {
    // 중요 에러만 로깅
    console.error(`[오류] 비디오 ID ${id} 이름 변경 실패:`, error);
    throw error;
  }
};

/**
 * 비디오 저장
 * @param data 비디오 데이터
 * @param videoFile 비디오 파일
 * @param referenceFile 참조 파일 (선택적)
 */
export const saveVideo = async (
  data: VideoCreateRequest,
  videoFile: File,
  referenceFile?: File
): Promise<VideoDto> => {
  try {
    const formData = new FormData();

    // 비디오 파일 추가
    formData.append('videoFile', videoFile);

    // 참조 파일이 있는 경우 추가
    if (referenceFile) {
      formData.append('referenceFile', referenceFile);
    }

    // DTO를 FormData에 추가
    formData.append(
      'data',
      new Blob([JSON.stringify(data)], { type: 'application/json' })
    );

    if (process.env.NODE_ENV !== 'production') {
      console.log('[정보] 비디오 업로드 시작', {
        videoName: data.videoName,
        videoSize: videoFile.size,
        referenceFile: referenceFile ? true : false,
      });
    }

    // API 요청
    const response = await apiClient.post<VideoDto>('/my/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('[정보] 비디오 업로드 성공', { id: response.data.id });
    }

    return response.data;
  } catch (error) {
    // 중요 에러만 로깅
    console.error('[오류] 비디오 저장 실패:', error);
    throw error;
  }
};