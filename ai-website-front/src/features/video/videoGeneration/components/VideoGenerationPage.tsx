"use client";

import React, { Suspense, useState, useRef } from "react";
import VideoSidebar from "./VideoSidebar";
import VideoGenerationFolder from "./VideoGenerationFolder";
import { useVideoGeneration } from "../hooks";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { SidebarFormData } from "../hooks/useVideoSidebar";
import { GenerationNotificationService } from '@/features/admin/services/GenerationNotificationService';

// 로딩 컴포넌트
function LoadingComponent() {
  return <div className="p-4 text-white">로딩 중...</div>;
}

// 실제 비디오 생성 페이지 내용을 담당하는 컴포넌트
function VideoGenerationContent() {
  const searchParams = useSearchParams();

  // 드래그 앤 드롭 상태 관리
  const [isSidebarDragOver, setIsSidebarDragOver] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const {
    videoUrl,
    isUpscaling,
    upscaledVideoUrl,
    referenceImageFile,
    referenceImageUrl,
    referencePrompt,
    referenceModel,
    handleSidebarSubmit,
    handleUpscaleVideo,
    handleTabChange,
    handleAddReferenceImage,
  } = useVideoGeneration({ searchParams });

  // handleSidebarSubmit 함수 호출을 위한 래퍼 함수
  const handleVideoSidebarSubmit = (data: SidebarFormData) => {
    // SidebarFormData를 VideoGenerationData로 변환 (null을 undefined로 변환)
    const convertedData = {
      ...data,
      autoSelectNotificationId: data.autoSelectNotificationId ?? undefined
    };
    handleSidebarSubmit(convertedData);
    // 영상 생성 시작 알림
    toast.success("영상 생성이 시작되었습니다. 생성이 완료되면 알림으로 알려드리겠습니다.", {
      duration: 5000,
    });
  };

  // Auto-Select 모드에서 즉시 알림 생성 콜백
  const handleNotifyProcessing = async (notificationData: { title: string; thumbnailUrl: string }) => {
    try {
      console.log('[VideoGenerationPage] 알림 생성 요청:', notificationData);
      const notification = await GenerationNotificationService.createNotification({
        title: notificationData.title,
        thumbnailUrl: notificationData.thumbnailUrl,
      });
      console.log('[VideoGenerationPage] 알림 생성 완료:', notification);

      // 알림 벨 열기 신호 전송 (약간 지연)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-notification-bell'));
      }, 500);

      return notification;
    } catch (error) {
      console.error('[VideoGenerationPage] 알림 생성 실패:', error);
      throw error;
    }
  };

  // 이미지 선택 핸들러
  const handleSelectImage = (fileUrl: string, fileName: string) => {
    handleAddReferenceImage({ fileUrl, name: fileName });
  };

  /* ------------------------------------------------------------------
     사이드바 드래그 앤 드롭 핸들러
  ------------------------------------------------------------------ */
  const handleSidebarDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSidebarDragOver(true);
  };

  const handleSidebarDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 사이드바를 완전히 벗어날 때만 isDragOver를 false로 설정
    if (!sidebarRef.current?.contains(e.relatedTarget as Node)) {
      setIsSidebarDragOver(false);
    }
  };

  const handleSidebarDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSidebarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSidebarDragOver(false);

    try {
      const imageData = e.dataTransfer.getData("application/json");
      if (imageData) {
        const { url, name } = JSON.parse(imageData);
        handleAddReferenceImage({ fileUrl: url, name });
        toast.success("참조 이미지로 설정되었습니다");
      }
    } catch (error) {
      console.error("드롭 처리 오류:", error);
      toast.error("이미지 설정에 실패했습니다");
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden fixed inset-0 pt-16">
      <VideoSidebar
        ref={sidebarRef}
        onSubmit={handleVideoSidebarSubmit}
        onTabChange={handleTabChange}
        referenceImageFile={referenceImageFile}
        referenceImageUrl={referenceImageUrl}
        referencePrompt={referencePrompt}
        referenceModel={referenceModel}
        onNotifyProcessing={handleNotifyProcessing}
        isLoading={false}
        isDragOver={isSidebarDragOver}
        onDragEnter={handleSidebarDragEnter}
        onDragLeave={handleSidebarDragLeave}
        onDragOver={handleSidebarDragOver}
        onDrop={handleSidebarDrop}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <VideoGenerationFolder
          onSelectImage={handleSelectImage}
          isSidebarDragOver={isSidebarDragOver}
          onSidebarDragEnter={handleSidebarDragEnter}
          onSidebarDragLeave={handleSidebarDragLeave}
          onSidebarDragOver={handleSidebarDragOver}
          onSidebarDrop={handleSidebarDrop}
          sidebarRef={sidebarRef}
        />
      </div>
    </div>
  );
}

// 메인 비디오 생성 페이지 컴포넌트
export default function VideoGenerationPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <VideoGenerationContent />
    </Suspense>
  );
}
