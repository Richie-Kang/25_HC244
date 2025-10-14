"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Video,
  Image as ImageIcon,
  FileText,
  Users,
  Bell,
  Menu,
  ChevronRight,
  Settings,
  LogOut,
} from "lucide-react";

// 관리자 메뉴 아이템 정의
const menuItems = [
  { href: "/admin", label: "대시보드", icon: <Home className="w-5 h-5" /> },
  {
    href: "/admin/video",
    label: "비디오 업로드",
    icon: <Video className="w-5 h-5" />,
  },
  {
    href: "/admin/image",
    label: "이미지 업로드",
    icon: <ImageIcon className="w-5 h-5" />,
  },
  {
    href: "/admin/blog",
    label: "블로그 작성",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    href: "/admin/member",
    label: "회원 관리",
    icon: <Users className="w-5 h-5" />,
  },
  {
    href: "/admin/notification",
    label: "알림 보내기",
    icon: <Bell className="w-5 h-5" />,
  },
  {
    href: "/admin/coupon",
    label: "쿠폰",
    icon: <Bell className="w-5 h-5" />,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="min-h-screen flex bg-gray-50">
      {/* 사이드바 */}
      <aside
        style={{ width: collapsed ? "80px" : "240px" }}
        className="bg-white border-r border-gray-200 shadow-sm flex flex-col z-10 transition-all duration-300"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div
            className={`font-bold text-xl text-sky-600 ${collapsed ? "hidden" : "flex"
              }`}
          >
            관리자 콘솔
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:translate-x-1 ${isActive
                          ? "bg-sky-50 text-sky-600"
                          : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <div
                        className={isActive ? "text-sky-500" : "text-gray-500"}
                      >
                        {item.icon}
                      </div>
                      {!collapsed && (
                        <span
                          className={`font-medium ${isActive ? "text-sky-600" : ""
                            }`}
                        >
                          {item.label}
                        </span>
                      )}
                      {!collapsed && isActive && (
                        <ChevronRight className="w-4 h-4 ml-auto text-sky-500" />
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 mt-auto border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors hover:-translate-y-0.5">
            <Settings className="w-5 h-5 text-gray-500" />
            {!collapsed && <span className="font-medium">설정</span>}
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-700 transition-colors hover:-translate-y-0.5">
            <LogOut className="w-5 h-5 text-red-500" />
            {!collapsed && <span className="font-medium">로그아웃</span>}
          </div>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* 상단 헤더 */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-10">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {menuItems.find((item) => item.href === pathname)?.label ||
                  "관리자 페이지"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-sky-50 text-sky-600 px-3 py-1.5 rounded-full text-sm font-medium transition-transform hover:scale-105">
                <span className="w-2 h-2 bg-sky-500 rounded-full mr-2"></span>
                관리자 모드
              </div>
            </div>
          </div>
        </header>

        {/* 메인 컨텐츠 영역 */}
        <main className="flex-1 p-6 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 overflow-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/80 p-6">
            {children}
          </div>
        </main>
      </div>
    </section>
  );
}
