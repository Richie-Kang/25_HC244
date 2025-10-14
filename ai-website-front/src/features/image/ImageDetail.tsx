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
    FileImage,
    Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageById, toggleImageShare, renameImage } from "./services/MyImageService";
import { ImageItem } from "./types/Image";
import { formatDate } from "@/features/video/types/formatUtils";

interface ImageDetailProps {
    imageId: number;
    onBack: () => void;
    onImageUpdate?: (updatedImage: ImageItem) => void;
}

export default function ImageDetail({
    imageId,
    onBack,
    onImageUpdate,
}: ImageDetailProps) {
    const router = useRouter();
    const [image, setImage] = useState<ImageItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [isUpscaling, setIsUpscaling] = useState(false);
    const [hasUpscaled, setHasUpscaled] = useState(false);
    const [upscaledImageUrl, setUpscaledImageUrl] = useState("");

    // 제목 편집 관련 상태
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchImageDetail = async () => {
            try {
                setIsLoading(true);
                console.log('[ImageDetail] 이미지 로딩 시작, imageId:', imageId);

                // MyImageService의 getImageById 함수 사용
                const imageData = await getImageById(imageId);
                console.log('[ImageDetail] 이미지 로딩 성공:', {
                    id: imageData.id,
                    fileName: imageData.fileName,
                    url: imageData.url,
                    thumbnailUrl: imageData.thumbnailUrl
                });

                setImage(imageData);
                setEditTitle(imageData.fileName || "");
                setIsSharing(imageData.status === 'PUBLIC' || false);
            } catch (err) {
                console.error('[ImageDetail] 이미지 로딩 실패:', {
                    imageId,
                    error: err
                });
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        if (imageId) {
            fetchImageDetail();
        }
    }, [imageId]);

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
        setEditTitle(image?.fileName || "");
    };

    // 제목 저장
    const handleSaveTitle = async () => {
        if (!image?.id || !editTitle.trim()) {
            handleCancelEditTitle();
            return;
        }

        if (editTitle.trim() === image.fileName) {
            setIsEditingTitle(false);
            return;
        }

        try {
            setIsRenaming(true);
            const updatedImage = await renameImage(image.id, editTitle.trim());

            setImage(updatedImage);
            setIsEditingTitle(false);
            toast.success("이미지 제목이 변경되었습니다");

            // 부모 컴포넌트에 업데이트된 이미지 정보 전달
            onImageUpdate?.(updatedImage);
        } catch (error) {
            console.error("제목 변경 실패:", error);
            toast.error("제목 변경에 실패했습니다");
            setEditTitle(image.fileName || "");
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

    // 이미지 재사용 핸들러
    const handleReuseImage = () => {
        if (!image) return;

        // 필요한 정보를 쿼리 파라미터로 인코딩
        const params = new URLSearchParams({
            prompt: image.prompt || "",
            imageUrl: image.url || "",
            category: image.category || "",
        });

        // 이미지 생성 페이지로 이동
        router.push(`/generation/image?${params.toString()}`);
    };

    // 공유 상태 토글 핸들러
    const handleToggleShare = async () => {
        if (!image || !image.id) return;

        try {
            // MyImageService의 toggleImageShare 함수 사용
            const updatedImage = await toggleImageShare(image.id, !isSharing);

            // API 응답에서 status 필드를 확인하고 상태 업데이트
            const newSharingStatus = updatedImage.status === 'PUBLIC';
            setIsSharing(newSharingStatus);

            // 성공 메시지 표시
            const status = newSharingStatus ? "공개" : "비공개";
            toast.success(`이미지가 ${status}로 설정되었습니다`);

            // 이미지 객체도 업데이트
            setImage(updatedImage);

            // 부모 컴포넌트에 업데이트된 이미지 정보 전달
            onImageUpdate?.(updatedImage);
        } catch (err) {
            console.error("Error updating share status:", err);
            toast.error("공유 상태를 변경하는데 실패했습니다");
        }
    };

    // 다운로드 핸들러
    const handleDownload = async () => {
        if (!image || !image.url) return;

        const imageUrl = upscaledImageUrl || image.url;
        const fileName = `${image.fileName || "image"}.${image.format || "jpg"}`;

        console.log("다운로드 시작:", { imageUrl, fileName });

        // 방법 1: fetch를 통한 blob 다운로드 시도
        try {
            console.log("방법 1: fetch를 통한 다운로드 시도");

            const response = await fetch(imageUrl, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
            });

            console.log("fetch 응답:", response.status, response.statusText);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            console.log("blob 생성 성공:", blob.size, "bytes");

            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = fileName;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(blobUrl);
            toast.success("이미지 다운로드가 완료되었습니다");
            return;
        } catch (error) {
            console.error("방법 1 실패:", error);
        }

        // 방법 2: canvas를 통한 다운로드 시도
        try {
            console.log("방법 2: canvas를 통한 다운로드 시도");

            const img = new Image();
            img.crossOrigin = 'anonymous';

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageUrl;
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            ctx?.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    const blobUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = blobUrl;
                    link.download = fileName;
                    link.style.display = 'none';

                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    window.URL.revokeObjectURL(blobUrl);
                    toast.success("이미지 다운로드가 완료되었습니다");
                } else {
                    throw new Error("Canvas에서 blob 생성 실패");
                }
            }, `image/${image.format || 'jpeg'}`, 1.0);
            return;
        } catch (error) {
            console.error("방법 2 실패:", error);
        }

        // 방법 3: 프록시를 통한 다운로드 시도
        try {
            console.log("방법 3: 프록시를 통한 다운로드 시도");

            const response = await fetch('/internal/download-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl, fileName }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = fileName;
                link.style.display = 'none';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                window.URL.revokeObjectURL(blobUrl);
                toast.success("이미지 다운로드가 완료되었습니다");
                return;
            }
        } catch (error) {
            console.error("방법 3 실패:", error);
        }

        // 방법 4: 마지막 대안 - 새 탭에서 열기
        console.log("방법 4: 새 탭에서 열기");
        toast.error("다운로드 방법을 찾지 못했습니다. 새 탭에서 이미지를 엽니다.");
        window.open(imageUrl, '_blank');
    };

    // 업스케일링 처리 함수
    const handleUpscaleImage = async () => {
        if (!image?.url) return;

        try {
            setIsUpscaling(true);
            setUpscaledImageUrl("");

            const response = await fetch('/internal/image/upscaler', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl: image.url }),
            });

            if (!response.ok) {
                throw new Error(`업스케일링 요청 실패: ${response.status}`);
            }

            const result = await response.json();

            if (result.data?.image_upscaled) {
                setUpscaledImageUrl(result.data.image_upscaled);
                setHasUpscaled(true);
                toast.success("이미지 업스케일링이 완료되었습니다!");
            } else {
                throw new Error("업스케일링된 이미지 URL을 받지 못했습니다");
            }
        } catch (error: unknown) {
            console.error("업스케일링 오류:", error);
            toast.error(error instanceof Error ? error.message : "업스케일링 중 오류가 발생했습니다");
        } finally {
            setIsUpscaling(false);
        }
    };

    // 파일 크기를 MB 단위로 포맷
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 MB';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-full p-8 bg-black/40 backdrop-blur-xl rounded-lg border border-white/20">
                <Loader2 className="h-10 w-10 text-sky-500 animate-spin mb-4" />
                <p className="text-gray-400 font-medium">이미지를 불러오는 중...</p>
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

    if (!image) return null;

    return (
        <div className="bg-black/40 backdrop-blur-xl w-full h-full max-h-[85vh] flex flex-col md:flex-row rounded-xl border border-white/20 overflow-hidden">
            {/* 왼쪽: 이미지 표시 */}
            <div className="md:w-3/5 bg-black flex items-center justify-center">
                <div className="w-full h-full flex items-center p-4">
                    <img
                        src={upscaledImageUrl || image?.url}
                        alt={image?.fileName || "이미지"}
                        className="w-full max-h-[70vh] object-contain rounded-lg"
                        style={{ imageRendering: "auto" }}
                    />
                </div>
            </div>

            {/* 오른쪽: 이미지 정보 */}
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
                                    {image.fileName}
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
                    {image.prompt && (
                        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-lg border border-white/20">
                            <h3 className="text-sm font-medium text-gray-400 mb-2">프롬프트</h3>
                            <div className="max-h-[100px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-black/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                                <p className="text-white whitespace-pre-wrap text-sm pr-2">
                                    {image.prompt}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <InfoCard
                            label="포맷"
                            value={image.format?.toUpperCase() || "정보 없음"}
                            icon={<FileImage className="h-4 w-4 text-sky-400" />}
                        />
                        <InfoCard
                            label="카테고리"
                            value={image.category || "정보 없음"}
                            icon={<Palette className="h-4 w-4 text-purple-400" />}
                        />
                        <InfoCard
                            label="파일 크기"
                            value={formatFileSize(image.fileSize || 0)}
                            icon={
                                <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-xs">
                                    B
                                </div>
                            }
                        />
                        <InfoCard
                            label="생성일"
                            value={formatDate(image.createdAt || "")}
                            icon={<Calendar className="h-4 w-4 text-gray-400" />}
                        />
                        <InfoCard
                            label="생성자"
                            value={image.creator || "정보 없음"}
                            icon={
                                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-xs">
                                    U
                                </div>
                            }
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
                            onClick={handleReuseImage}
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
                            onClick={handleUpscaleImage}
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
                            variant="outline"
                            className="py-2 gap-1.5 col-span-2"
                        >
                            <Download className="h-4 w-4" />
                            다운로드
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
