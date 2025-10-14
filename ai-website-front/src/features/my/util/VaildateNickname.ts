// 닉네임 유효성 검사를 위한 유틸리티

// 닉네임 검증 결과 인터페이스
export interface NicknameValidationResult {
  isValid: boolean;
  message: string;
}

// 유효하지 않은 닉네임 리스트 (실제 서비스에 맞게 확장 필요)
const INAPPROPRIATE_WORDS = [
  '관리자', 'admin', 'administrator',
  '운영자', 'operator', 'staff',
  // 비속어나 기타 부적절한 단어들 추가
];

// 닉네임 유효성 검사 함수
export const validateNickname = (nickname: string): NicknameValidationResult => {
  // 1. 길이 체크 (3-20자 사이)
  if (nickname.length < 3) {
    return {
      isValid: false,
      message: '닉네임은 3자 이상이어야 합니다.'
    };
  }
  
  if (nickname.length > 20) {
    return {
      isValid: false,
      message: '닉네임은 20자 이하여야 합니다.'
    };
  }

  // 2. 특수문자 체크 (알파벳, 숫자, 한글, 밑줄, 하이픈만 허용)
  const specialCharRegex = /^[a-zA-Z0-9가-힣_-]+$/;
  if (!specialCharRegex.test(nickname)) {
    return {
      isValid: false,
      message: '닉네임은 알파벳, 숫자, 한글, 밑줄(_), 하이픈(-) 만 포함할 수 있습니다.'
    };
  }

  // 3. 부적절한 단어 체크
  const lowerNickname = nickname.toLowerCase();
  for (const word of INAPPROPRIATE_WORDS) {
    if (lowerNickname.includes(word.toLowerCase())) {
      return {
        isValid: false,
        message: '닉네임에 부적절한 단어가 포함되어 있습니다.'
      };
    }
  }

  // 모든 검사를 통과하면 유효한 닉네임
  return {
    isValid: true,
    message: '유효한 닉네임입니다.'
  };
};