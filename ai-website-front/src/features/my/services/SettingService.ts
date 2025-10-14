import apiClient from '@/lib/api/apiClient';
import { ProfileResponse } from '@/features/my/types/Filter';

// 프로필 설정 관련 API 서비스
export const settingService = {
  /**
   * 사용자 닉네임 변경
   * @param nickname 변경할 새로운 닉네임
   * @returns ProfileResponse 객체
   */
  updateNickname: async (nickname: string): Promise<ProfileResponse> => {
    try {
      // 닉네임과 연관된 비디오의 creator 필드도 함께 업데이트
      const response = await apiClient.put<ProfileResponse>('/profile/nickname-with-videos', { nickname });

      // 서버에서 30일 제한 에러를 보내는 경우 처리
      if (response.data.message?.includes('30일')) {
        return {
          success: false,
          message: '닉네임은 변경 후 30일이 지나야 다시 변경할 수 있습니다.'
        };
      }

      return response.data;
    } catch (err: unknown) {
      console.error("Error updating user settings:", err);
      throw new Error(
        (err instanceof Error ? err.message : "Unknown error") ||
        "Failed to update user settings"
      );
    }
  }
}