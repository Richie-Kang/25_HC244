"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import VideoDetail from "@/features/video/videoReference/videoDetail";
import { getLikedVideos } from "../services/MyVideoService";
import type { VideoDto } from "../types/Video";
import { PageContainer } from "@/components/common/PageContainer";
import Image from "next/image";

const MyLikedPage = () => {
  const [likedVideos, setLikedVideos] = useState<VideoDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);

  // 좋아요한 비디오 목록 가져오기
  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getLikedVideos();
        setLikedVideos(data);
      } catch (err) {
        console.error("좋아요한 비디오 목록 조회 오류:", err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedVideos();
  }, []);

  // 비디오 클릭 핸들러 - 상세 정보 모달 표시
  const handleVideoClick = (videoId: number) => {
    setSelectedVideoId(videoId);
  };

  // 목록으로 돌아가기 핸들러
  const handleBackToList = () => {
    setSelectedVideoId(null);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <div className="bg-red-500/20 text-red-400 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            오류가 발생했습니다
          </h3>
          <p className="text-red-400 mb-4">{error}</p>
          <Button
            className="bg-sky-500 hover:bg-sky-600 text-white"
            onClick={() => window.location.reload()}
          >
            다시 시도
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (likedVideos.length === 0) {
    return (
      <PageContainer
        title="좋아요"
      >
        <div className="text-center py-12">
          <div className="bg-sky-500/20 text-sky-400 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <Heart className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            좋아요한 작업물이 없습니다
          </h3>
          <p className="text-gray-400 mb-4 max-w-md mx-auto">
            작업물을 좋아요하면 여기에 표시됩니다
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="좋아요"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {likedVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => handleVideoClick(video.id!)}
            className="bg-black/20 backdrop-blur-sm rounded-lg border border-white/10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.02] hover:bg-black/40 hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden group"
          >
            <div className="relative aspect-video overflow-hidden rounded-t-lg">
              <Image
                src={video.thumbnailUrl || "/placeholder-video.svg"}
                alt={video.name}
                width={320}
                height={180}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="p-3">
              <h3 className="font-medium text-sm line-clamp-1 text-white mb-1">
                {video.name}
              </h3>
              <p className="text-xs text-gray-400 mb-2 line-clamp-1">
                {/* creator 필드가 없는 경우 대비 */}
                {video.creator || ""}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center">
                  <span>{video.clickCount || 0} 조회</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 비디오 상세 정보 모달 */}
      {selectedVideoId !== null && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={handleBackToList}
        >
          <div
            className="relative bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden w-full max-w-4xl mx-auto animate-in zoom-in-95 duration-300"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white shadow-md hover:bg-black/60 transition-colors border border-white/20"
              onClick={handleBackToList}
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="h-full overflow-y-auto">
              <VideoDetail
                videoId={selectedVideoId}
                videoBasicInfo={{
                  id: selectedVideoId,
                  name: likedVideos.find(video => video.id === selectedVideoId)?.name || '',
                  thumbnailUrl: likedVideos.find(video => video.id === selectedVideoId)?.thumbnailUrl || '',
                  creator: likedVideos.find(video => video.id === selectedVideoId)?.creator || ''
                }}
              />
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default MyLikedPage;
