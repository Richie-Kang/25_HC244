"use client";

import React, { useState, useEffect } from "react";
import { Input } from "../../components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "../../components/ui/pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import { UserManagementService, type UserManagementResponse } from "./services/UserManagementService";

const MemberCheck = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserManagementResponse | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [size] = useState(20);

  // 회원 목록을 가져오는 함수
  const fetchMembers = async (page: number = 0, direction: string = "") => {
    setLoading(true);
    try {
      const data = await UserManagementService.getUserList({
        page,
        size,
        direction: direction as 'next' | 'prev' | undefined
      });
      setUserData(data);
    } catch (error) {
      console.error("회원 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setEmail(searchValue);

    // 디바운싱 처리: 타이핑 중지 후 500ms 후에 검색 실행
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const newTimeout = setTimeout(() => {
      // 실제 서비스에서는 이메일 검색 API를 호출해야 함
      // 현재 백엔드 API에 이메일 검색 파라미터가 없어서 일단은 페이지 초기화만 수행
      fetchMembers(0, "");
    }, 500);

    setSearchTimeout(newTimeout);
  };

  const handlePageChange = (page: number) => {
    fetchMembers(page);
  };

  const handlePrevious = () => {
    if (userData?.hasPrevious) {
      fetchMembers(userData.currentPage - 1, "prev");
    }
  };

  const handleNext = () => {
    if (userData?.hasNext) {
      fetchMembers(userData.currentPage + 1, "next");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block mb-1 font-semibold">이메일 검색</label>
        <Input
          type="email"
          value={email}
          onChange={handleSearch}
          placeholder="이메일로 검색"
          className="w-full"
        />
      </div>
      <div className="border p-4 rounded">
        <h2 className="text-xl font-bold mb-4">회원 목록</h2>
        {loading ? (
          <div className="py-4 text-center">로딩 중...</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>사용자명</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userData?.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.nickname}</TableCell>
                  </TableRow>
                ))}
                {(!userData?.users || userData.users.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      회원이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {userData && (
              <div className="mt-4 flex justify-between items-center">
                <div>
                  총 {userData.totalElements}명 | {userData.currentPage + 1} /{" "}
                  {userData.totalPages} 페이지
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={handlePrevious}
                        className={
                          !userData.hasPrevious
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {Array.from(
                      { length: Math.min(5, userData.totalPages) },
                      (_, i) => {
                        // 현재 페이지 중심으로 표시할 페이지 번호 계산
                        let pageNum = userData.currentPage + i - 2;
                        // 페이지 번호가 범위를 벗어나면 조정
                        if (pageNum < 0) pageNum = i;
                        if (pageNum >= userData.totalPages)
                          pageNum = userData.totalPages - 5 + i;

                        if (pageNum >= 0 && pageNum < userData.totalPages) {
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                isActive={pageNum === userData.currentPage}
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum + 1}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        return null;
                      }
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={handleNext}
                        className={
                          !userData.hasNext
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MemberCheck;
