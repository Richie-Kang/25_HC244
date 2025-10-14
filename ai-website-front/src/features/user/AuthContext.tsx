// src/components/context/AuthContext.tsx
"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { getCurrentUser, logout as logoutService } from "./services/UserService"; // UserService import

export interface AuthContextType {
  isLoggedIn: boolean;
  email: string;
  token: string | null;
  userRole: string;
  nickname: string;
  id: number | null;
  createdAt: string | null;
  login: (
    email: string,
    token: string,
    role?: string,
    nickname?: string
  ) => void;
  logout: () => void;
}

const defaultContextValue: AuthContextType = {
  isLoggedIn: false,
  email: "",
  token: null,
  userRole: "",
  nickname: "",
  id: null,
  createdAt: null,
  login: () => { },
  logout: () => { },
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState("");
  const [nickname, setNickname] = useState("");
  const [id, setId] = useState<number | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  // 환경 확인
  const isProd = process.env.NODE_ENV === 'production';

  // 쿠키에서 값을 읽는 유틸리티 함수
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift();
    }
    return "";
  };

  // 초기화: 쿠키와 로컬 스토리지에서 로그인 정보 복원
  useEffect(() => {
    // 백엔드 API를 통해 현재 인증 상태 확인
    const checkAuthStatus = async () => {
      try {
        // UserService의 getCurrentUser 함수 호출
        const authData = await getCurrentUser();

        if (authData.isAuthenticated) {
          setEmail(authData.email || "");
          setUserRole(authData.role || "");
          setNickname(authData.nickname || "");
          setId(authData.id || null);
          setCreatedAt(authData.createdAt || null);
          setIsLoggedIn(true);

          // 로컬 스토리지에도 저장 (선택적)
          localStorage.setItem("email", authData.email || "");
          localStorage.setItem("userRole", authData.role || "");
          localStorage.setItem("nickname", authData.nickname || "");
        } else {
          // 인증 실패 처리
          clearUserData();
          console.log("인증되지 않은 상태 (API 응답)");
        }
      } catch (error) {
        console.error("인증 상태 확인 중 오류:", error);
        clearUserData();
      }
    };

    // 개발 환경에서는 쿠키를 먼저 확인
    if (!isProd) {
      const roleCookie = getCookie("userRole");

      // 로컬 스토리지 확인
      const storedEmail = localStorage.getItem("email");
      const storedToken = localStorage.getItem("token");
      const storedNickname = localStorage.getItem("nickname");

      // 쿠키나 로컬 스토리지에 정보가 있으면 해당 정보 사용
      if (roleCookie || (storedEmail && storedToken)) {
        if (storedEmail) setEmail(storedEmail);
        if (storedToken) setToken(storedToken);
        if (roleCookie) setUserRole(roleCookie);
        if (storedNickname) setNickname(storedNickname);
        setIsLoggedIn(true);
      }
    }

    // 배포 환경이거나 개발 환경에서도 항상 API로 최신 상태 확인
    checkAuthStatus();
  }, [isProd]);

  // 사용자 데이터 초기화 함수
  const clearUserData = () => {
    // 상태 초기화
    setEmail("");
    setToken(null);
    setIsLoggedIn(false);
    setUserRole("");
    setNickname("");
    setId(null);
    setCreatedAt(null);

    // localStorage 데이터 삭제
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("nickname");

    // sessionStorage 데이터 삭제
    sessionStorage.clear();

    // 쿠키 삭제 (클라이언트에서 접근 가능한 쿠키만)
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  };

  const login = (
    email: string,
    token: string,
    role: string = "",
    nickname: string = ""
  ) => {
    setEmail(email);
    setToken(token);
    setIsLoggedIn(true);
    setUserRole(role);
    setNickname(nickname);

    // 로컬 스토리지에도 저장
    localStorage.setItem("email", email);
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("nickname", nickname);
  };

  const logout = async () => {
    try {
      // 로그아웃 API 호출
      await logoutService();
    } catch (error) {
      console.error("로그아웃 처리 중 오류:", error);
    }

    // 상태 및 모든 클라이언트 저장소 초기화
    clearUserData();
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        email,
        token,
        userRole,
        nickname,
        id,
        createdAt,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
