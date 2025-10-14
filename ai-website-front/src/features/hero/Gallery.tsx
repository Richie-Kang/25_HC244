"use client";

import { useState, useEffect } from "react";
import { Download, Loader2, Heart } from "lucide-react";
import {
  getSharedVideos,
  getSharedVideosNoLogin,
  updateVideoLike,
} from "../video/services/MyVideoService";
import { VideoDto, VideoItem } from "../video/types/Video";
import VideoDetail from "../video/videoReference/videoDetail";
import Image from "next/image";

const VideoGallery = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [view] = useState<"grid" | "masonry">("masonry");
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      // 로그인 상태 확인
      const checkLoginStatus = () => {
        // 쿠키에서 로그인 토큰 확인
        const cookies = document.cookie.split(";").reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split("=");
          acc[key] = value;
          return acc;
        }, {} as { [key: string]: string });

        const hasAuthToken =
          cookies.access_token ||
          cookies.jwt ||
          cookies["auth-token"] ||
          localStorage.getItem("auth-token");

        const loggedIn = !!hasAuthToken;
        setIsLoggedIn(loggedIn);
        return loggedIn;
      };

      // 로그인 상태에 따라 다른 API 호출
      const loggedIn = checkLoginStatus();
      const videoData: VideoDto[] = loggedIn
        ? await getSharedVideos()
        : await getSharedVideosNoLogin();

      // 비디오 데이터 처리
      const sizes: Array<"small" | "medium" | "large"> = [
        "small",
        "medium",
        "large",
      ];

      // VideoDto를 VideoItem으로 매핑
      const initialProcessedVideos = videoData.map((video, index) => ({
        id: video.id || 0,
        name: video.name || "제목 없음",
        thumbnailUrl: video.thumbnailUrl || "",
        url: video.url || "",
        creator: video.creator || "알 수 없음",
        size: sizes[index % sizes.length],
        aspectRatio: 16 / 9, // 기본값
        likeCount: video.likeCount || 0,
        liked: video.liked || false,
      }));

      // 비디오 메타데이터로 실제 비율 계산
      const videoList = await Promise.all(
        initialProcessedVideos.map(async (video) => {
          try {
            const videoElement = document.createElement("video");
            videoElement.src = video.url;

            const metadataLoaded = new Promise<void>((resolve) => {
              videoElement.onloadedmetadata = () => resolve();
              videoElement.onerror = () => resolve();
              // 10초 후 타임아웃
              setTimeout(() => resolve(), 10000);
            });

            await metadataLoaded;

            let aspectRatio = 16 / 9;
            if (videoElement.videoWidth && videoElement.videoHeight) {
              aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
            }

            return {
              ...video,
              aspectRatio,
            };
          } catch (err) {
            console.warn(`비디오 메타데이터 로드 실패: ${video.name}`, err);
            return video;
          }
        })
      );

      setVideos(videoList);
    } catch (error) {
      console.error("비디오 가져오기 실패", error);
      setError("비디오를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleVideoClick = (videoId: number) => {
    setSelectedVideoId(videoId);
  };

  const handleBackToList = () => {
    setSelectedVideoId(null);
  };

  const getAspectRatio = (aspectRatio: number) => {
    return Math.ceil((1 / aspectRatio) * 10);
  };

  const handleLikeClick = async (videoId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // 비디오 클릭 이벤트 전파 방지

    if (!isLoggedIn) {
      // 로그인하지 않은 경우 처리
      alert("좋아요를 누르려면 로그인이 필요합니다.");
      return;
    }

    try {
      const updatedVideo = await updateVideoLike(videoId, !videos.find(v => v.id === videoId)?.liked);
      setVideos(prevVideos =>
        prevVideos.map(video =>
          video.id === videoId
            ? { ...video, liked: updatedVideo.liked, likeCount: updatedVideo.likeCount }
            : video
        )
      );
    } catch (error) {
      console.error("좋아요 업데이트 실패:", error);
    }
  };

  return (
    <div className="w-full bg-black">
      {/* 상단 컨트롤 영역 */}
      <div className="px-4 mb-8">
        <div>
          <h2 className="text-lg font-bold mb-2 flex items-center text-white">
            <span className="inline-block w-1.5 h-4 bg-sky-500 mr-3 rounded-full"></span>
            레퍼런스 비디오
          </h2>
        </div>
      </div>

      {/* 로딩, 에러, 또는 비디오 표시 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md mb-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10">
            <Loader2 className="h-10 w-10 text-sky-500 animate-spin" />
          </div>
          <p className="text-sky-500 font-medium">
            비디오를 불러오는 중입니다...
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl mb-4 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <p className="text-red-400">{error}</p>
          </div>
          <button
            onClick={fetchVideos}
            className="px-6 py-2 bg-sky-500/20 backdrop-blur-md text-white rounded-full hover:bg-sky-500/30 transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <>
          {videos.length > 0 ? (
            <div
              className={`
                ${view === "masonry"
                  ? "columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5"
                  : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
                }
                px-4
              `}
            >
              {videos.map((video, index) => {
                if (!video.url) return null;

                return (
                  <div
                    key={index}
                    className={`
                      relative group overflow-hidden rounded-xl mb-5 cursor-pointer
                      ${view === "grid" ? "" : "break-inside-avoid"}
                      transform transition duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1
                      bg-black/30 backdrop-blur-md border border-white/10
                    `}
                    style={
                      view === "grid"
                        ? {
                          gridRowEnd: `span ${getAspectRatio(
                            video.aspectRatio || 16 / 9
                          )}`,
                        }
                        : {}
                    }
                    onClick={() => handleVideoClick(video.id)}
                  >
                    <div className="relative aspect-auto overflow-hidden rounded-xl">
                      {/* 썸네일 이미지 */}
                      <Image
                        src={video.thumbnailUrl || "/placeholder.svg"}
                        alt={video.name}
                        width={500}
                        height={300}
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                      />

                      {/* 비디오 요소 */}
                      <video
                        src={video.url}
                        className="w-full h-full object-cover absolute inset-0 z-0"
                        preload="auto"
                        muted
                        playsInline
                        loop
                        onMouseEnter={(e) => {
                          const playPromise = e.currentTarget.play();
                          if (playPromise !== undefined) {
                            playPromise.catch((error) => {
                              console.error("비디오 재생 실패:", error);
                            });
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />

                      {/* 그라데이션 오버레이 */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent text-white z-30">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-sm font-medium text-white truncate">
                              {video.name}
                            </h3>
                            <p className="text-xs text-gray-400">
                              {video.creator}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => handleLikeClick(video.id, e)}
                              className="flex items-center space-x-1"
                            >
                              <Heart
                                className={`w-4 h-4 ${video.liked ? "text-red-500 fill-red-500" : "text-gray-400"
                                  }`}
                              />
                              <span className="text-xs text-gray-400">
                                {video.likeCount || 0}
                              </span>
                            </button>
                            <Download className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl mb-4 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <p className="text-gray-400">표시할 비디오가 없습니다.</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* 비디오 상세 정보 모달 */}
      {selectedVideoId !== null && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 bg-black/90 backdrop-blur-sm p-4"
          onClick={handleBackToList}
        >
          <div
            className="relative bg-black/30 backdrop-blur-md rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden w-full max-w-4xl mx-auto border border-white/10"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              onClick={handleBackToList}
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
              <VideoDetail
                videoId={selectedVideoId}
                videoBasicInfo={videos.find((v) => v.id === selectedVideoId)!}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
