import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한 없음</h1>
        <p className="text-gray-600 mb-6">
          이 페이지에 접근할 수 있는 권한이 없습니다. 관리자 계정으로 로그인해주세요.
        </p>
        <div className="flex justify-center space-x-4">
          <Link 
            href="/" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            홈으로
          </Link>
          <Link 
            href="/login" 
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}