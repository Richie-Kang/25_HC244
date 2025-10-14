"use client";

import { useState, useEffect } from "react";
import Sidebar, { FilterOptions } from "./sidebar";
import VideoDetail from "./videoDetail";
import {
  getSharedVideos,
  getSharedVideosNoLogin,
} from "../services/MyVideoService";
import { VideoDto, VideoItem } from "../types/Video";

export default function VideoReferencePage() {
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('popular');

  useEffect(() => {
    // 로그인 상태 확인
    const checkLoginStatus = () => {
      // 쿠키에서 로그인 토큰 확인 (auth-token 이름 추가)
      const cookies = document.cookie.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      }, {} as { [key: string]: string });

      // auth-token도 포함하여 확인
      const hasAuthToken =
        cookies.access_token ||
        cookies.jwt ||
        cookies["auth-token"] || // 쿠키에서 auth-token 확인
        localStorage.getItem("auth-token");

      return !!hasAuthToken;
    };

    const fetchVideos = async () => {
      try {
        setIsLoading(true);

        // 로그인 상태 확인
        const loggedIn = checkLoginStatus();

        // 로그인 상태에 따라 다른 MyVideoService 함수 호출
        const sharedVideos: VideoDto[] = loggedIn
          ? await getSharedVideos()
          : await getSharedVideosNoLogin();

        // 비디오 데이터 처리
        const sizes: Array<"small" | "medium" | "large"> = [
          "small",
          "medium",
          "large",
        ];

        // VideoDto를 VideoItem으로 매핑
        const initialProcessedVideos = sharedVideos.map((video, index) => ({
          id: video.id || 0,
          name: video.name || "제목 없음",
          thumbnailUrl: video.thumbnailUrl || "",
          url: video.url || "",
          creator: video.creator || "알 수 없음",
          size: sizes[index % sizes.length],
          aspectRatio: 1,
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
              });

              await metadataLoaded;

              let aspectRatio = 16 / 9;
              if (videoElement.videoWidth && videoElement.videoHeight) {
                aspectRatio =
                  videoElement.videoWidth / videoElement.videoHeight;
              }

              return {
                ...video,
                aspectRatio,
              };
            } catch (err) {
              console.error("비디오 메타데이터 로드 실패:", err);
              return video;
            }
          })
        );

        setVideos(videoList);
        setFilteredVideos(videoList);
      } catch (err) {
        console.error("비디오를 불러오는 중 오류 발생:", err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleFilterChange = (filters: FilterOptions) => {
    let result = [...videos];
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (video) =>
          video.name.toLowerCase().includes(searchLower) ||
          video.creator.toLowerCase().includes(searchLower)
      );
    }

    setFilteredVideos(result);
  };

  const handleSortChange = (newSortBy: 'latest' | 'popular') => {
    setSortBy(newSortBy);
    const sortedVideos = [...filteredVideos];

    if (newSortBy === 'latest') {
      sortedVideos.sort((a, b) => b.id - a.id);
    } else if (newSortBy === 'popular') {
      sortedVideos.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    }

    setFilteredVideos(sortedVideos);
  };

  const handleVideoClick = (videoId: number) => {
    setSelectedVideoId(videoId);
  };

  const handleBackToList = () => {
    setSelectedVideoId(null);
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <Sidebar onFilterChange={handleFilterChange} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {/* Sort Buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => handleSortChange('latest')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${sortBy === 'latest'
                ? 'bg-sky-500 text-white'
                : 'bg-black/40 text-gray-300 hover:bg-black/60'
                }`}
            >
              최신순
            </button>
            <button
              onClick={() => handleSortChange('popular')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${sortBy === 'popular'
                ? 'bg-sky-500 text-white'
                : 'bg-black/40 text-gray-300 hover:bg-black/60'
                }`}
            >
              인기순
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="mt-2 text-xl font-medium text-white">
                오류가 발생했습니다
              </h3>
              <p className="mt-1 text-gray-400">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-auto">
              {filteredVideos.map((video) => {
                const rowSpan = Math.ceil(12 / (video.aspectRatio || 1));

                return (
                  <div
                    key={video.id}
                    className="relative group rounded-lg overflow-hidden bg-black/40 backdrop-blur-xl border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-black/80 hover:border-white/30"
                    style={{
                      gridRowEnd: `span ${rowSpan}`,
                      minHeight: "180px",
                    }}
                    onClick={() => handleVideoClick(video.id)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
                    <div className="relative w-full h-full">
                      {/* 포인터 이벤트를 비디오로 전달하기 위해 썸네일 이미지에 pointer-events-none 적용 */}
                      <img
                        src={video.thumbnailUrl}
                        alt={video.name}
                        className="w-full h-full object-cover absolute inset-0 z-10 transition-opacity duration-300 group-hover:opacity-0 pointer-events-none"
                      />

                      <video
                        src={video.url}
                        className="w-full h-full object-cover absolute inset-0 z-0"
                        preload="auto"
                        muted
                        playsInline
                        loop
                        onLoadedMetadata={(e) =>
                          console.error("비디오 메타데이터 로드 실패:", e)
                        }
                        onError={(e) =>
                          console.error("비디오 로드 오류:", video.id, e)
                        }
                        onMouseEnter={(e) => {
                          const playPromise = e.currentTarget.play();
                          if (playPromise !== undefined) {
                            playPromise.catch((error) => {
                              console.error("비디오 재생 실패:", error);
                            });
                          }
                          e.currentTarget.parentElement
                            ?.querySelector("img")
                            ?.classList.add("opacity-0");
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                          e.currentTarget.parentElement
                            ?.querySelector("img")
                            ?.classList.remove("opacity-0");
                        }}
                      />

                      {/* 오버레이에도 pointer-events-none을 추가해 비디오가 hover 이벤트를 받을 수 있게 함 */}
                      <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="bg-black/40 rounded-full p-3 animate-fadeOut">
                          <svg
                            className="w-8 h-8 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300 z-20 pointer-events-none"></div>

                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white z-30">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-white truncate">
                              {video.name}
                            </h3>
                            <p className="text-sm text-gray-300 mt-0.5 truncate">
                              {video.creator}
                            </p>
                          </div>
                          <div className="flex items-center">
                            {video.liked ? (
                              <svg
                                className="w-5 h-5 fill-current text-red-500"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                            )}
                            <span className="ml-1 text-sm">
                              {video.likeCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredVideos.length === 0 && !isLoading && !error && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-xl font-medium text-gray-900">
                검색 결과가 없습니다
              </h3>
              <p className="mt-1 text-gray-500">
                다른 검색어나 필터를 시도해보세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 비디오 상세 정보 모달 */}
      {selectedVideoId !== null && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 bg-black/80 p-4"
          onClick={handleBackToList}
        >
          <div
            className="relative bg-black rounded-lg shadow-xl overflow-hidden w-full max-w-4xl mx-auto"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 shadow-md"
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
}
