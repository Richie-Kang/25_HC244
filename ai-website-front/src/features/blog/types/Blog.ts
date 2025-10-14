// 블로그 인터페이스 정의
export interface Blog {
  id: number;
  title: string;
  subtitle: string;
  author: string;
  content: string;
  image: string;
  date: string;
}

// 블로그 생성 시 사용할 타입
export interface CreateBlogDto {
  title: string;
  subtitle: string;
  author: string;
  content: string;
  image?: File;
}

// 응답 타입 정의
export interface BlogResponse {
  data: Blog | Blog[];
  status: number;
  message?: string;
}