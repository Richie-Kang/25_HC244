/**
 * 바이트 수를 사람이 읽기 쉬운 형식으로 변환합니다
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * ISO 날짜 문자열을 보기 좋은 형식으로 변환합니다
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  
  // 유효하지 않은 날짜인 경우
  if (isNaN(date.getTime())) {
    return '날짜 없음';
  }
  
  // 한국 시간 형식으로 포맷팅
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
