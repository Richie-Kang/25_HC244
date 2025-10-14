"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Video, Plus, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreationDetail from "./CreationDetail";
import { getUserVideos, getVideosByType } from "../services/MyVideoService";
import { VideoDto } from "../types/Video";
import { createPortal } from "react-dom";

type VideoType = "ALL" | "IMAGE" | "VIDEO" | "TEXT";

// 날짜 포맷팅 함수
const formatDateKey = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // 오늘
  if (date.toDateString() === today.toDateString()) {
    return "오늘";
  }
  // 어제
  if (date.toDateString() === yesterday.toDateString()) {
    return "어제";
  }
  // 그 외
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

// 날짜별 그룹화된 비디오 타입
interface GroupedVideos {
  [dateKey: string]: {
    displayDate: string;
    videos: VideoDto[];
    rawDate: string; // 정렬용 원본 날짜
  };
}

export default function CreationPage() {
  const [videos, setVideos] = useState<VideoDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<VideoType>("ALL");
  const [showModal, setShowModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      setIsLoading(true);

      let data: VideoDto[];

      if (selectedFilter === "ALL") {
        data = await getUserVideos();
      } else {
        data = await getVideosByType(selectedFilter.toLowerCase());
      }

      // 최신순으로 정렬 (createdAt 기준 내림차순)
      const sortedData = Array.isArray(data) ? data.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // 내림차순 정렬 (최신이 먼저)
      }) : [];

      setVideos(sortedData);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("작업물을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilter]);

  // 날짜별로 비디오 그룹화
  const groupedVideos = useMemo((): GroupedVideos => {
    const groups: GroupedVideos = {};

    videos.forEach(video => {
      if (!video.createdAt) return;

      const date = new Date(video.createdAt);
      const dateKey = date.toDateString(); // 고유 키
      const displayDate = formatDateKey(video.createdAt);

      if (!groups[dateKey]) {
        groups[dateKey] = {
          displayDate,
          videos: [],
          rawDate: video.createdAt
        };
      }

      groups[dateKey].videos.push(video);
    });

    // 각 날짜 그룹 내에서도 최신순 정렬
    Object.keys(groups).forEach(dateKey => {
      groups[dateKey].videos.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    });

    return groups;
  }, [videos]);

  // 날짜 키를 최신순으로 정렬
  const sortedDateKeys = useMemo(() => {
    return Object.keys(groupedVideos).sort((a, b) => {
      const dateA = new Date(groupedVideos[a].rawDate).getTime();
      const dateB = new Date(groupedVideos[b].rawDate).getTime();
      return dateB - dateA; // 최신 날짜가 먼저
    });
  }, [groupedVideos]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // ESC 키 이벤트 리스너
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showModal) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscapeKey);
      // 모달 열릴 때 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      // 모달 닫힐 때 스크롤 복원
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const handleVideoClick = (videoId: number, event: React.MouseEvent) => {
    setSelectedVideoId(videoId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVideoId(null);
  };

  // 비디오 업데이트 핸들러
  const handleVideoUpdate = useCallback((updatedVideo: VideoDto) => {
    setVideos(prevVideos =>
      prevVideos.map(video =>
        video.id === updatedVideo.id ? updatedVideo : video
      )
    );
  }, []);

  // 모달 배경 클릭 핸들러
  const handleModalBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div className="h-full flex flex-col bg-black relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">내 작업물</h1>
        </div>
        <Link href="/generation/video">
          <Button className="bg-sky-500 hover:bg-sky-600 text-white">
             새 작업
          </Button>
        </Link>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-sky-500 animate-spin mb-3" />
              <p className="text-gray-400 text-sm">작업물을 불러오는 중...</p>
            </div>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-black/40 backdrop-blur-xl rounded-xl border border-white/20 p-12 text-center">
            <div className="bg-sky-500/20 text-sky-500 rounded-full p-4 mb-4">
              <Video className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              작업물이 없습니다
            </h3>
            <p className="text-gray-400 mb-5 max-w-md">
              새로운 영상이나 이미지를 생성해보세요!
            </p>
            <Link href="/generation/video">
              <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                새 작업 시작하기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDateKeys.map((dateKey) => {
              const group = groupedVideos[dateKey];
              return (
                <div key={dateKey} className="space-y-4">
                  {/* 날짜 헤더 */}
                  <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">
                      {group.displayDate}
                    </h2>
                    <span className="text-sm text-gray-400">
                      ({group.videos.length}개)
                    </span>
                  </div>

                  {/* 해당 날짜의 비디오 그리드 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {group.videos.map((video) => (
                      <div
                        key={video.id}
                        className="overflow-hidden transition-all cursor-pointer bg-black/40 backdrop-blur-xl rounded-lg border border-white/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.02] hover:bg-black/80 hover:border-white/30 group"
                        onClick={(e) => handleVideoClick(video.id!, e)}
                      >
                        <div className="aspect-[4/3] bg-black/60 relative overflow-hidden">
                          {/* 호버 시 제목 표시 */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10 p-4">
                            <div className="text-center">
                              <h3 className="text-white font-medium text-base line-clamp-2">
                                {video.name}
                              </h3>
                            </div>
                          </div>
                          <video
                            src={video.url}
                            className="w-full h-full object-cover"
                            poster={
                              video.thumbnailUrl || "/video-thumbnail-placeholder.jpg"
                            }
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>

                          {/* 공유 상태 표시 (우상단) */}
                          <div className="absolute top-2 right-2">
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${video.share
                                ? "bg-emerald-500"
                                : "bg-gray-500"
                                }`}
                              title={video.share ? "공개" : "비공개"}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 비디오 상세 모달 */}
      {showModal && selectedVideoId && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 flex justify-center items-center z-50 bg-black/90 backdrop-blur-sm p-4"
          onClick={handleModalBackgroundClick}
        >
          <div
            className="relative bg-black/30 backdrop-blur-md rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden w-full max-w-4xl mx-auto border border-white/10"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              onClick={closeModal}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="h-full overflow-y-auto">
              <CreationDetail
                videoId={selectedVideoId}
                onBack={closeModal}
                onVideoUpdate={handleVideoUpdate}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
