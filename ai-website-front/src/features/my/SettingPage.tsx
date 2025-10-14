"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Bell,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lock,
  CreditCard,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../user/AuthContext";
import { settingService } from "./services/SettingService";
import { useToast } from "@/hooks/use-toast";
import { validateNickname } from "./util/VaildateNickname"; // 닉네임 유효성 검사 유틸리티 import
import { PageContainer } from "@/components/common/PageContainer";
import Link from "next/link";

const SettingPage = () => {
  const { nickname: userNickname, login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [nickname, setNickname] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null); // 유효성 검사 오류 메시지 상태
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setNickname(userNickname);
  }, [userNickname]);

  // 닉네임이 변경될 때마다 유효성 검사
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNickname = e.target.value;
    setNickname(newNickname);

    // 닉네임이 비어있으면 유효성 오류 메시지를 표시하지 않음
    if (!newNickname.trim()) {
      setValidationError(null);
      return;
    }

    // 현재 닉네임과 같으면 유효성 검사 스킵
    if (newNickname === userNickname) {
      setValidationError(null);
      return;
    }

    // 닉네임 유효성 검사
    const validationResult = validateNickname(newNickname);
    if (!validationResult.isValid) {
      setValidationError(validationResult.message);
    } else {
      setValidationError(null);
    }
  };

  const handleSave = async () => {
    // 닉네임 유효성 재검사
    const validationResult = validateNickname(nickname);
    if (!validationResult.isValid) {
      setValidationError(validationResult.message);
      toast({
        title: "닉네임 유효성 오류",
        description: validationResult.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSaveSuccess(false);

    try {
      if (nickname !== userNickname) {
        const response = await settingService.updateNickname(nickname);

        if (response.success) {
          login("", "", "", nickname);

          setSaveSuccess(true);
          toast({
            title: "닉네임 변경 성공",
            description: "닉네임이 성공적으로 변경되었습니다. 다음 변경은 30일 후에 가능합니다.",
          });

          // 페이지 새로고침하여 업데이트된 정보 표시
          window.location.reload();
        } else {
          if (response.message?.includes("30일")) {
            toast({
              title: "닉네임 변경 제한",
              description: "닉네임은 변경 후 30일이 지나야 다시 변경할 수 있습니다.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "닉네임 변경 실패",
              description: response.message || "닉네임 변경에 실패했습니다.",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error("닉네임 변경 중 오류 발생:", error);
      toast({
        title: "오류 발생",
        description: "닉네임 변경 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (saveSuccess) {
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    }
  };

  return (
    <PageContainer
      title="설정"
      description="계정 설정을 관리하세요"
    >
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="bg-black/40 backdrop-blur-xl border border-white/20">
          <TabsTrigger value="account" className="data-[state=active]:bg-black/60 data-[state=active]:text-white text-gray-400">
            <User className="h-4 w-4 mr-2" />
            계정
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-black/60 data-[state=active]:text-white text-gray-400">
            <Lock className="h-4 w-4 mr-2" />
            보안
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-black/60 data-[state=active]:text-white text-gray-400">
            <Bell className="h-4 w-4 mr-2" />
            알림
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-black/60 data-[state=active]:text-white text-gray-400">
            <CreditCard className="h-4 w-4 mr-2" />
            결제
          </TabsTrigger>
          <TabsTrigger value="help" className="data-[state=active]:bg-black/60 data-[state=active]:text-white text-gray-400">
            <HelpCircle className="h-4 w-4 mr-2" />
            도움말
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card className="p-6 border border-white/20 bg-black/40 backdrop-blur-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">프로필 정보</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nickname" className="text-white">닉네임</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={handleNicknameChange}
                  className="mt-1 bg-black/40 backdrop-blur-xl border-white/20 text-white"
                />
                {validationError && (
                  <div className="flex items-center text-red-500 text-sm mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={
                    isLoading ||
                    nickname === userNickname ||
                    !nickname.trim() ||
                    !!validationError
                  }
                  className="bg-sky-500 hover:bg-sky-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      저장됨
                    </>
                  ) : (
                    "저장"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="p-6 border border-white/20 bg-black/40 backdrop-blur-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">비밀번호 변경</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-white">현재 비밀번호</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 bg-black/40 backdrop-blur-xl border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-white">새 비밀번호</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 bg-black/40 backdrop-blur-xl border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-white">새 비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 bg-black/40 backdrop-blur-xl border-white/20 text-white"
                />
              </div>
              <div className="flex justify-end">
                <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                  비밀번호 변경
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6 border border-white/20 bg-black/40 backdrop-blur-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">알림 설정</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">이메일 알림</h3>
                  <p className="text-sm text-gray-400">계정 관련 이메일 알림을 받습니다</p>
                </div>
                <Button variant="outline" className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30">
                  설정
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">푸시 알림</h3>
                  <p className="text-sm text-gray-400">디바이스에서 푸시 알림을 받습니다</p>
                </div>
                <Button variant="outline" className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30">
                  설정
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card className="p-6 border border-white/20 bg-black/40 backdrop-blur-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">결제 정보</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">결제 수단</h3>
                  <p className="text-sm text-gray-400">결제 수단을 관리합니다</p>
                </div>
                <Button variant="outline" className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30">
                  관리
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">결제 내역</h3>
                  <p className="text-sm text-gray-400">결제 내역을 확인합니다</p>
                </div>
                <Button variant="outline" className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30">
                  보기
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="space-y-6">
          <Card className="p-6 border border-white/20 bg-black/40 backdrop-blur-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">도움말 및 지원</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">고객 지원</h3>
                  <p className="text-sm text-gray-400">문제 해결을 위한 고객 지원 센터입니다</p>
                </div>
                <Link href="/contact">
                  <Button variant="outline" className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30">
                    문의하기
                  </Button>
                </Link>
              </div>
              <Separator className="my-4 bg-white/10" />
              <div>
                <h3 className="font-medium text-white mb-3">법적 문서</h3>
                <div className="space-y-3">
                  <Link
                    href="/terms"
                    className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/20 hover:bg-black/40 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-white">이용약관</h4>
                      <p className="text-sm text-gray-400">서비스 이용에 대한 약관을 확인합니다</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                  <Link
                    href="/privacy"
                    className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/20 hover:bg-black/40 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-white">개인정보처리방침</h4>
                      <p className="text-sm text-gray-400">개인정보 수집 및 이용에 대한 안내를 확인합니다</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default SettingPage;
