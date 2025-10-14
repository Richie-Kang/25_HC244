// components/navbar/DesktopNav.tsx
"use client";
import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "./UserMenu";

interface Props {
  isLoggedIn: boolean;
  email: string;
  nickname: string;
  credits: number | null;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (value: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  handleLogout: () => void;
  handleBadgeClick: () => void;
}

export const DesktopNav = ({
  isLoggedIn,
  email,
  nickname,
  credits,
  isDropdownOpen,
  setIsDropdownOpen,
  dropdownRef,
  handleLogout,
  handleBadgeClick,
}: Props) => {
  return (
    <nav className="hidden md:flex space-x-6 text-gray-300 items-center backdrop-blur-sm bg-white/5 px-6 py-2 rounded-full border border-white/10 shadow-lg">
      <Link
        href="/studio"
        className="hover:text-sky-500 hover:bg-white/10 px-3 py-1.5 rounded-full transition font-medium"
      >
        스튜디오
      </Link>
      <Link
        href="/blog/blogList"
        className="hover:text-sky-500 hover:bg-white/10 px-3 py-1.5 rounded-full transition"
      >
        블로그
      </Link>
      <Link
        href="/contact"
        className="hover:text-sky-500 hover:bg-white/10 px-3 py-1.5 rounded-full transition"
      >
        문의하기
      </Link>

      {isLoggedIn ? (
        <div className="relative flex items-center" ref={dropdownRef}>
          {credits !== null && (
            <Badge
              variant="outline"
              className="mr-2 px-2 py-0.5 text-sm font-medium capitalize bg-gradient-to-r from-sky-400/20 to-blue-500/20 border-sky-500/50 text-sky-400 cursor-pointer hover:bg-white/10 transition shadow-[0_0_10px_rgba(14,165,233,0.3)] animate-pulse"
              onClick={handleBadgeClick}
            >
              {credits.toLocaleString()}c
            </Badge>
          )}

          <UserMenu
            email={email}
            nickname={nickname}
            credits={credits}
            onLogout={handleLogout}
            onBadgeClick={handleBadgeClick}
            isOpen={isDropdownOpen}
            setOpen={setIsDropdownOpen}
          />
        </div>
      ) : (
        <>
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-white/5 transition shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="px-4 py-1.5 rounded-full bg-sky-500/20 backdrop-blur-md text-white hover:bg-sky-500/30 transition shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10"
          >
            회원가입
          </Link>
        </>
      )}
    </nav>
  );
};
