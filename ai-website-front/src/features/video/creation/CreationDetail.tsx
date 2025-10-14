"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  X,
  Loader2,
  AlertTriangle,
  Calendar,
  Eye,
  Heart,
  Share2,
  Lock,
  RefreshCw,
  Globe,
  Download,
  ArrowUpToLine,
  CheckCircle,
  Edit2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVideoById, toggleVideoShare, renameVideo } from "../services/MyVideoService";
import { VideoDto } from "../types/Video";
import { formatDate } from "@/features/video/types/formatUtils";

interface CreationDetailProps {
  videoId: number;
  onBack: () => void;
  onVideoUpdate?: (updatedVideo: VideoDto) => void;
}

export default function CreationDetail({
  videoId,
  onBack,
  onVideoUpdate,
}: CreationDetailProps) {
  const router = useRouter();
  const [video, setVideo] = useState<VideoDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [hasUpscaled, setHasUpscaled] = useState(false);
  const [upscaledVideoUrl, setUpscaledVideoUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  // 제목 편집 관련 상태
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchVideoDetail = async () => {
      try {
        setIsLoading(true);
        console.log('[CreationDetail] 비디오 로딩 시작, videoId:', videoId);

        // MyVideoService의 getVideoById 함수 사용
        const videoData = await getVideoById(videoId);
        console.log('[CreationDetail] 비디오 로딩 성공:', {
          id: videoData.id,
          name: videoData.name,
          url: videoData.url,
          thumbnailUrl: videoData.thumbnailUrl
        });

        setVideo(videoData);
        setEditTitle(videoData.name || "");
        setIsSharing(videoData.share || false);
      } catch (err) {
        console.error('[CreationDetail] 비디오 로딩 실패:', {
          videoId,
          error: err
        });
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    if (videoId) {
      fetchVideoDetail();
    }
  }, [videoId]);

  // 제목 편집 시작
  const handleStartEditTitle = () => {
    setIsEditingTitle(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  };

  // 제목 편집 취소
  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
    setEditTitle(video?.name || "");
  };

  // 제목 저장
  const handleSaveTitle = async () => {
    if (!video?.id || !editTitle.trim()) {
      handleCancelEditTitle();
      return;
    }

    if (editTitle.trim() === video.name) {
      setIsEditingTitle(false);
      return;
    }

    try {
      setIsRenaming(true);
      const updatedVideo = await renameVideo(video.id, editTitle.trim());

      setVideo(updatedVideo);
      setIsEditingTitle(false);
      toast.success("영상 제목이 변경되었습니다");

      // 부모 컴포넌트에 업데이트된 비디오 정보 전달
      onVideoUpdate?.(updatedVideo);
    } catch (error) {
      console.error("제목 변경 실패:", error);
      toast.error("제목 변경에 실패했습니다");
      setEditTitle(video.name || "");
    } finally {
      setIsRenaming(false);
    }
  };

  // 엔터키 및 ESC 키 핸들링
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === "Escape") {
      handleCancelEditTitle();
    }
  };

  // 비디오 재사용 핸들러
  const handleReuseVideo = () => {
    if (!video) return;

    // 필요한 정보를 쿼리 파라미터로 인코딩
    const params = new URLSearchParams({
      prompt: video.prompt || "",
      imageUrl: video.thumbnailUrl || "",
      model: video.model || "luna",
    });

    // 영상 생성 페이지로 이동
    router.push(`/generation/video?${params.toString()}`);
  };

  // 공유 상태 토글 핸들러
  const handleToggleShare = async () => {
    if (!video || !video.id) return;

    try {
      // MyVideoService의 toggleVideoShare 함수 사용
      const updatedVideo = await toggleVideoShare(video.id, !isSharing);

      // API 응답에서 shared 필드를 확인하고 상태 업데이트
      const newSharingStatus = updatedVideo.share || false;
      setIsSharing(newSharingStatus);

      // 성공 메시지 표시
      const status = newSharingStatus ? "공개" : "비공개";
      toast.success(`영상이 ${status}로 설정되었습니다`);

      // 비디오 객체도 업데이트
      setVideo(updatedVideo);

      // 부모 컴포넌트에 업데이트된 비디오 정보 전달
      onVideoUpdate?.(updatedVideo);
    } catch (err) {
      console.error("Error updating share status:", err);
      toast.error("공유 상태를 변경하는데 실패했습니다");
    }
  };

  // 다운로드 핸들러
  const handleDownload = async () => {
    if (!video || !video.url || isDownloading) return;

    try {
      setIsDownloading(true);
      toast.loading("영상 다운로드 중...", { id: "download" });
      
      // 서버 사이드 프록시를 통해 다운로드
      const response = await fetch('/internal/download-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: video.url,
          fileName: `${video.name || "video"}.mp4`
        }),
      });

      if (!response.ok) {
        throw new Error("영상 다운로드에 실패했습니다");
      }

      toast.loading("파일 처리 중...", { id: "download" });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${video.name || "video"}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 메모리 정리
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success("영상 다운로드가 완료되었습니다", { id: "download" });
    } catch (error) {
      console.error("다운로드 오류:", error);
      toast.error("영상 다운로드에 실패했습니다", { id: "download" });
    } finally {
      setIsDownloading(false);
    }
  };

  // 업스케일링 처리 함수
  const handleUpscaleVideo = async () => {
    if (!video?.url) return;

    try {
      setIsUpscaling(true);
      setUpscaledVideoUrl("");

      const response = await fetch('/internal/video/upscaler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: video.url }),
      });

      if (!response.ok) {
        throw new Error(`업스케일링 요청 실패: ${response.status}`);
      }

      const result = await response.json();

      if (result.data?.video_upscaled) {
        setUpscaledVideoUrl(result.data.video_upscaled);
        setHasUpscaled(true);
        toast.success("비디오 업스케일링이 완료되었습니다!");
      } else {
        throw new Error("업스케일링된 비디오 URL을 받지 못했습니다");
      }
    } catch (error: unknown) {
      console.error("업스케일링 오류:", error);
      toast.error(error instanceof Error ? error.message : "업스케일링 중 오류가 발생했습니다");
    } finally {
      setIsUpscaling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-8 bg-black/40 backdrop-blur-xl rounded-lg border border-white/20">
        <Loader2 className="h-10 w-10 text-sky-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">작업물을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-black/40 backdrop-blur-xl rounded-lg border border-white/20">
        <div className="bg-red-500/20 text-red-400 rounded-full p-4 mb-4">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          오류가 발생했습니다
        </h3>
        <p className="text-red-400 mb-4 text-center">{error}</p>
        <Button onClick={onBack} variant="outline" className="gap-2 bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60">
          <X className="h-4 w-4" />
          돌아가기
        </Button>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="bg-black/40 backdrop-blur-xl w-full h-full max-h-[85vh] flex flex-col md:flex-row rounded-xl border border-white/20 overflow-hidden">
      {/* 왼쪽: 비디오 플레이어 */}
      <div className="md:w-3/5 bg-black flex items-center justify-center">
        <div className="w-full h-full flex items-center">
          <video
            src={upscaledVideoUrl || video?.url}
            controls
            className="w-full max-h-[70vh] object-contain"
            poster={video?.thumbnailUrl}
            autoPlay
            controlsList="nodownload"
          >
            브라우저가 비디오 태그를 지원하지 않습니다.
          </video>
        </div>
      </div>

      {/* 오른쪽: 비디오 정보 */}
      <div className="md:w-2/5 p-6 overflow-y-auto bg-black/40 backdrop-blur-xl border-l border-white/20">
        <div className="flex justify-between items-center mb-5">
          {/* 편집 가능한 제목 */}
          <div className="flex items-center gap-2 flex-1 mr-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  onBlur={handleSaveTitle}
                  className="flex-1 bg-black/60 text-white px-3 py-1 rounded border border-white/20 focus:outline-none focus:border-sky-500 text-xl font-bold"
                  disabled={isRenaming}
                />
                {isRenaming ? (
                  <Loader2 className="h-4 w-4 text-sky-500 animate-spin" />
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveTitle}
                    className="h-8 w-8 p-0 hover:bg-sky-500/20"
                  >
                    <Check className="h-4 w-4 text-sky-400" />
                  </Button>
                )}
              </div>
            ) : (
              <div
                onClick={handleStartEditTitle}
                className="flex items-center gap-2 cursor-pointer group flex-1"
              >
                <h2 className="text-xl font-bold text-white leading-tight group-hover:text-sky-400 transition-colors">
                  {video.name}
                </h2>
                <Edit2 className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full h-8 w-8 hover:bg-black/60 text-white flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-5">
          <div className="bg-black/40 backdrop-blur-xl p-4 rounded-lg border border-white/20">
            <h3 className="text-sm font-medium text-gray-400 mb-2">프롬프트</h3>
            <div className="max-h-[100px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-black/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
              <p className="text-white whitespace-pre-wrap text-sm pr-2">
                {video.prompt || "프롬프트 정보가 없습니다."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoCard
              label="모델"
              value={video.model || "정보 없음"}
              icon={
                <div className="w-6 h-6 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-400">
                  AI
                </div>
              }
            />
            <InfoCard
              label="모드"
              value={video.mode || "정보 없음"}
              icon={
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                  M
                </div>
              }
            />
            <InfoCard
              label="조회수"
              value={(video.clickCount || 0).toLocaleString()}
              icon={<Eye className="h-4 w-4 text-gray-400" />}
            />
            <InfoCard
              label="좋아요"
              value={(video.likeCount || 0).toLocaleString()}
              icon={<Heart className="h-4 w-4 text-gray-400" />}
            />
            <InfoCard
              label="생성일"
              value={formatDate(video.createdAt || "")}
              icon={<Calendar className="h-4 w-4 text-gray-400" />}
            />
            <InfoCard
              label="공유 상태"
              value={isSharing ? "공개" : "비공개"}
              icon={
                isSharing ? (
                  <Globe className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-400" />
                )
              }
            />
          </div>

          {/* 작업 버튼 영역 */}
          <div className="pt-5 border-t border-white/20 grid grid-cols-2 gap-3">
            <Button
              onClick={handleReuseVideo}
              className="py-2 gap-1.5 bg-sky-500 hover:bg-sky-600 text-white"
            >
              <RefreshCw className="h-4 w-4" />
              재사용하기
            </Button>
            <Button
              onClick={handleToggleShare}
              className={`py-2 gap-1.5 ${isSharing
                ? "bg-red-500 hover:bg-red-600"
                : "bg-sky-500 hover:bg-sky-600"
                } text-white`}
            >
              {isSharing ? (
                <>
                  <Lock className="h-4 w-4" />
                  비공개로 전환
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  공개로 전환
                </>
              )}
            </Button>
            <Button
              onClick={handleUpscaleVideo}
              disabled={isUpscaling || hasUpscaled}
              className={`py-2 gap-1.5 ${hasUpscaled
                ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                : "bg-sky-500/20 hover:bg-sky-500/30 text-white"
                } col-span-2 border border-white/10 relative`}
            >
              {isUpscaling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>업스케일링 중...</span>
                </>
              ) : hasUpscaled ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>업스케일링 완료</span>
                </>
              ) : (
                <>
                  <ArrowUpToLine className="h-4 w-4 mr-2" />
                  <span>고화질 업스케일링</span>
                  <span className="absolute right-3 text-sm text-red-400">-1 크레딧</span>
                </>
              )}
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              variant="outline"
              className={`py-2 gap-1.5 col-span-2 ${
                isDownloading 
                  ? "bg-sky-500/20 hover:bg-sky-500/20 text-sky-400 border-sky-500/50" 
                  : ""
              }`}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  다운로드 중...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  다운로드
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 정보 카드 컴포넌트
const InfoCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <div className="bg-black/40 backdrop-blur-xl p-3 rounded-lg border border-white/20">
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-sm font-medium text-gray-400">{label}</span>
    </div>
    <p className="text-sm text-white">{value}</p>
  </div>
);
