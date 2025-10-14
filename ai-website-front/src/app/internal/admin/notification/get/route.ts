import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// GET 요청 처리
export async function GET(request: Request) {
  try {
    // URL 파라미터 추출
    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "0";
    const size = url.searchParams.get("size") || "10";

    // 환경 변수에서 백엔드 URL 가져오기
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      throw new Error("환경 변수 NEXT_PUBLIC_BASE_URL이 설정되지 않았습니다.");
    }

    const apiUrl = `${baseUrl}/internal/admin/notifications?page=${page}&size=${size}`;

    // 쿠키 가져오기
    const cookieStore = await cookies();
    const allCookiesArray = cookieStore.getAll();

    // JWT 쿠키 찾기
    const jwtCookie = allCookiesArray.find(
      (c) => c.name === "auth-token"
    );

    // 쿠키를 하나의 문자열로 구성
    const cookieHeader = allCookiesArray
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    // 헤더 구성
    const headers: HeadersInit = {
      Cookie: cookieHeader,
    };

    // JWT 토큰이 있으면 Authorization 헤더에 추가
    if (jwtCookie) {
      headers["Authorization"] = `Bearer ${jwtCookie.value}`;
    }

    // 스프링 백엔드로 요청 전송
    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
      credentials: "include", // 쿠키 포함
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("백엔드 에러 응답:", errorText);
      throw new Error(`백엔드 에러: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("API 에러:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      {
        message: "알림 목록 조회 실패",
        error: error instanceof Error ? error.message : "알 수 없는 오류"
      },
      { status: 500 }
    );
  }
}