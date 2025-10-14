"use client";

import { useState, useEffect, useRef } from "react";
import { FolderService } from "../../features/folder/services/FolderService";
import type {
    FolderResponse,
    FileResponse,
} from "../../features/folder/services/FolderService";
import FashnInlineSettings, {
    type EditImageSettings,
} from "./components/FashnInlineSettings";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Upload,
    Loader2,
    AlertTriangle,
    CloudUpload,
    CheckCircle,
    X,
    ArrowRight,
    Info,
    Folder,
    ArrowLeft,
    ImageIcon,
    Plus,
    MoreHorizontal,
    Download,
    RotateCcw,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadFashnImage } from "./services/ImageService";
import { GenerationNotificationService } from "@/features/admin/services/GenerationNotificationService";
import { useAuth } from "@/features/user/AuthContext";

interface UploadResult {
    file: File;
    success: boolean;
    error?: string;
}

type Step = 'images' | 'settings' | 'generate' | 'result';

export default function EditImagePage() {
    const { id: userId } = useAuth();
    const [currentStep, setCurrentStep] = useState<Step>('images');
    const [folders, setFolders] = useState<FolderResponse[]>([]);
    
    // 의류용 상태
    const [garmentFiles, setGarmentFiles] = useState<FileResponse[]>([]);
    const [currentGarmentFolder, setCurrentGarmentFolder] = useState<FolderResponse | null>(null);
    const [isGarmentLoading, setIsGarmentLoading] = useState(false);
    
    // 모델용 상태
    const [modelFiles, setModelFiles] = useState<FileResponse[]>([]);
    const [currentModelFolder, setCurrentModelFolder] = useState<FolderResponse | null>(null);
    const [isModelLoading, setIsModelLoading] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
    const [showUploadResults, setShowUploadResults] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [folderNameError, setFolderNameError] = useState<string | null>(null);
    const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState<number | null>(null);

    const [slot1Image, setSlot1Image] = useState<FileResponse | null>(null);
    const [slot2Image, setSlot2Image] = useState<FileResponse | null>(null);
    const [isFittingLoading, setIsFittingLoading] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [imageLoadError, setImageLoadError] = useState<string | null>(null);

    const dropZoneRef = useRef<HTMLDivElement>(null);

    const steps = [
        { id: 'images', label: '이미지 선택', description: '의류와 모델 이미지를 선택하세요' },
        { id: 'settings', label: '설정', description: '생성 옵션을 설정하세요' },
        { id: 'generate', label: '생성', description: '가상 피팅을 실행하세요' },
        { id: 'result', label: '완료', description: '가상 피팅 결과를 확인하세요' },
    ];

    useEffect(() => {
        if (userId) {
            loadFiles();
        }
    }, [userId]);

    const loadFiles = async () => {
        try {
            setIsLoading(true);
            const folderResponse = await FolderService.getFolders();
            if (folderResponse.length > 0) {
                setFolders(folderResponse);
            } else {
                try {
                    const newFolder = await FolderService.createFolder({ name: 'My Images' });
                    setFolders([newFolder]);
                } catch (error) {
                    console.error("기본 폴더 생성 실패:", error);
                }
            }
        } catch (e) {
            console.error("파일 로딩 실패:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchGarmentFiles = async (folderId: number) => {
        try {
            setIsGarmentLoading(true);
            const filesData = await FolderService.getFilesByFolder(folderId);
            setGarmentFiles(filesData);
        } catch (error) {
            console.error("의류 파일 로딩 오류:", error);
            toast.error("의류 파일 목록을 불러오는데 실패했습니다");
        } finally {
            setIsGarmentLoading(false);
        }
    };

    const fetchModelFiles = async (folderId: number) => {
        try {
            setIsModelLoading(true);
            const filesData = await FolderService.getFilesByFolder(folderId);
            setModelFiles(filesData);
        } catch (error) {
            console.error("모델 파일 로딩 오류:", error);
            toast.error("모델 파일 목록을 불러오는데 실패했습니다");
        } finally {
            setIsModelLoading(false);
        }
    };

    const createFolder = async () => {
        const trimmedName = newFolderName.trim();

        if (!trimmedName) {
            toast.error("폴더 이름을 입력해주세요");
            return;
        }

        if (trimmedName.length > 20) {
            toast.error("폴더 이름은 20자를 초과할 수 없습니다");
            return;
        }

        try {
            const newFolder = await FolderService.createFolder({ name: trimmedName });
            setFolders(prev => [...prev, newFolder]);
            toast.success("폴더가 생성되었습니다");
            setIsCreateFolderOpen(false);
            setNewFolderName("");
            setFolderNameError(null);
        } catch (err) {
            console.error(err);
            toast.error("폴더 생성에 실패했습니다");
        }
    };

    const handleDeleteClick = (folderId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setFolderToDelete(folderId);
        setIsDeleteFolderOpen(true);
    };

    const deleteFolder = async () => {
        if (!folderToDelete) return;

        try {
            const result = await FolderService.deleteFolder(folderToDelete);
            if (result.success) {
                setFolders(prev => prev.filter(folder => folder.id !== folderToDelete));
                toast.success("폴더가 삭제되었습니다");

                if (currentGarmentFolder?.id === folderToDelete) {
                    setCurrentGarmentFolder(null);
                    setGarmentFiles([]);
                }
                if (currentModelFolder?.id === folderToDelete) {
                    setCurrentModelFolder(null);
                    setModelFiles([]);
                }
            } else {
                toast.error(result.message || "폴더 삭제에 실패했습니다");
            }
        } catch (error) {
            console.error("폴더 삭제 오류:", error);
            toast.error("폴더 삭제에 실패했습니다");
        } finally {
            setIsDeleteFolderOpen(false);
            setFolderToDelete(null);
        }
    };

    const handleFileUpload = async (files: File[], targetFolder: FolderResponse, isGarmentFolder: boolean) => {
        if (files.length === 0) return;

        // 파일 개수 제한
        if (files.length > 20) {
            toast.error("한 번에 최대 20개의 파일만 업로드할 수 있습니다.");
            return;
        }

        setIsUploading(true);
        const results: UploadResult[] = [];

        for (const file of files) {
            // 이미지 파일인지 확인
            if (!file.type.startsWith('image/')) {
                results.push({
                    file,
                    success: false,
                    error: '이미지 파일만 업로드 가능합니다'
                });
                continue;
            }

            // 지원하지 않는 이미지 형식 확인 (JPG, PNG만 지원)
            const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            const supportedExtensions = ['.jpg', '.jpeg', '.png'];
            const fileName = file.name.toLowerCase();
            const isSupported = supportedTypes.includes(file.type) ||
                supportedExtensions.some(ext => fileName.endsWith(ext));

            if (!isSupported) {
                results.push({
                    file,
                    success: false,
                    error: '지원하지 않는 형식입니다. JPG, PNG 형식만 사용 가능합니다'
                });
                continue;
            }

            try {
                const resp = await FolderService.uploadFile(targetFolder.id, file);
                if (isGarmentFolder) {
                    setGarmentFiles((prev) => [...prev, resp]);
                } else {
                    setModelFiles((prev) => [...prev, resp]);
                }
                results.push({
                    file,
                    success: true
                });
            } catch (error) {
                console.error(`파일 업로드 오류 (${file.name}):`, error);
                results.push({
                    file,
                    success: false,
                    error: '업로드에 실패했습니다'
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const errorCount = results.filter(r => !r.success).length;

        if (successCount > 0) {
            toast.success(`${successCount}개의 파일이 업로드되었습니다`);
        }

        if (errorCount > 0) {
            setUploadResults(results.filter(r => !r.success));
            setShowUploadResults(true);
        }

        setIsUploading(false);
    };

    const handleSelectImage = (file: FileResponse, slotType: '의류' | '모델') => {
        if (slotType === '의류') {
            setSlot1Image(file);
            toast.success("의류 이미지가 선택되었습니다");
        } else {
            setSlot2Image(file);
            toast.success("모델 이미지가 선택되었습니다");
        }
    };

    const handleGenerate = async (settings: EditImageSettings) => {
        setIsFittingLoading(true);
        setCurrentStep('generate');

        let notificationId: number | null = null;
        if (slot2Image?.url && userId) {
            try {
                const notification = await GenerationNotificationService.createNotification({
                    title: "가상 피팅하기",
                    thumbnailUrl: slot2Image.url,
                });
                notificationId = notification.id;
                window.dispatchEvent(new Event('open-notification-bell'));

                try {
                    await GenerationNotificationService.updateNotification(notificationId, {
                        status: 'PROCESSING',
                        userId: String(userId),
                        thumbnailUrl: slot2Image.url,
                    });
                    setTimeout(() => {
                        window.dispatchEvent(new Event('open-notification-bell'));
                    }, 200);
                } catch (updateError) {
                    console.error("알림 처리 중 상태 업데이트 실패:", updateError);
                }
            } catch (e) {
                console.error("알림 생성 실패:", e);
            }
        }

        try {
            if (!settings.slot1?.url || !settings.slot2?.url)
                throw new Error("의류 이미지와 모델 이미지를 모두 선택해주세요.");

            const fd = new FormData();
            fd.append("model_image_url", settings.slot2.url);
            fd.append("garment_image_url", settings.slot1.url);

            // API 문서에 맞춘 파라미터 직접 전달
            fd.append("category", settings.category);
            fd.append("mode", settings.mode);
            fd.append("garment_photo_type", settings.garment_photo_type);
            fd.append("moderation_level", settings.moderation_level);
            fd.append("seed", String(settings.seed));
            fd.append("num_samples", String(settings.num_samples));
            fd.append("segmentation_free", String(settings.segmentation_free));
            fd.append("output_format", settings.output_format);

            console.log("⭐ fetch 시작 - FormData 내용:");
            for (const [key, value] of fd.entries()) {
                console.log(`  ${key}: ${value}`);
            }

            const res = await fetch("/internal/image/edit/fashn", {
                method: "POST",
                body: fd,
            });

            console.log("⭐ fetch 완료 - 응답 받음");
            console.log("=== 가상 피팅 응답 분석 ===");
            console.log("응답 상태:", res.status, res.ok);
            console.log("응답 헤더:", Object.fromEntries(res.headers.entries()));

            // 응답 텍스트를 먼저 확인
            const responseText = await res.text();
            console.log("응답 원본 텍스트:", responseText);

            let data;
            try {
                data = JSON.parse(responseText);
                console.log("파싱된 JSON 데이터:", data);
            } catch (parseError) {
                console.error("JSON 파싱 실패:", parseError);
                throw new Error("서버 응답을 파싱할 수 없습니다: " + responseText);
            }

            // 디버깅용 로그
            console.log("data.success:", data.success);
            console.log("data.imageUrl:", data.imageUrl);
            console.log("data.imageUrl 타입:", typeof data.imageUrl);
            console.log("data의 모든 키:", Object.keys(data));

            if (!res.ok || !data.success || !data.imageUrl) {
                const errorMessage = data.error || `HTTP ${res.status}: 가상 피팅 요청이 실패했습니다.`;
                console.error("가상 피팅 실패:", errorMessage);
                throw new Error(errorMessage);
            }

            const resultUrl =
                typeof data.imageUrl === "string" ? data.imageUrl : data.imageUrl.url;

            if (!resultUrl)
                throw new Error("가상 피팅 결과 이미지 URL을 확인할 수 없습니다.");

            // 결과 이미지 설정 및 로딩 상태 관리
            setResultImage(resultUrl);
            setIsImageLoading(true);
            setImageLoadError(null);
            setIsFittingLoading(false); // 성공 시 로딩 상태 해제
            setCurrentStep('result');

            // 이미지가 실제로 로드될 때까지 기다리기
            try {
                await verifyImageLoad(resultUrl);
            } catch (error) {
                console.warn("이미지 사전 로드 실패 (결과 표시에는 영향 없음):", error);
                // 이미지 사전 로드가 실패해도 결과 화면은 표시
                setIsImageLoading(false);
            }

            toast.success("가상 피팅이 완료되었습니다!");

            // 결과 이미지 업로드 시도 (실패해도 전체 프로세스에 영향 안 줌)
            try {
                console.log("📤 결과 이미지 업로드 시도:", { resultUrl, userId });
                const uploadResp = await uploadFashnImage(resultUrl, userId || undefined);
                console.log("✅ 결과 이미지 업로드 완료:", uploadResp);
                await loadFiles(); // 업로드 성공 시에만 파일 목록 새로고침
                toast.success("결과 이미지가 'fashn' 폴더에 저장되었습니다!");
            } catch (uploadError) {
                console.error("❌ 결과 이미지 업로드 실패:", uploadError);
                // 업로드 실패 원인을 더 자세히 로깅
                if (uploadError instanceof Error) {
                    console.error("업로드 에러 메시지:", uploadError.message);
                    console.error("업로드 에러 스택:", uploadError.stack);
                }
                // 업로드 실패 시 사용자에게 알림 (옵션)
                // toast.error("결과 이미지 저장에 실패했습니다. 다운로드 버튼을 이용해 수동으로 저장하세요.");
            }

            if (notificationId && userId) {
                try {
                    console.log("📢 알림 완료 상태 업데이트 시도:", { notificationId, userId, resultUrl });
                    await GenerationNotificationService.updateNotification(notificationId, {
                        status: 'COMPLETED',
                        userId: String(userId),
                        thumbnailUrl: resultUrl,
                    });
                    console.log("✅ 가상 피팅 완료 알림 업데이트 성공:", notificationId);
                    setTimeout(() => {
                        window.dispatchEvent(new Event('open-notification-bell'));
                    }, 500);
                } catch (e) {
                    console.error("❌ 가상 피팅 완료 알림 상태 업데이트 실패:", e);
                    // 알림 업데이트 실패 원인을 더 자세히 로깅
                    if (e instanceof Error) {
                        console.error("알림 업데이트 에러 메시지:", e.message);
                        console.error("알림 업데이트 에러 스택:", e.stack);
                    }
                }
            }
        } catch (err: unknown) {
            console.error("가상 피팅 실패:", err);
            let msg = "가상 피팅에 실패했습니다";
            if (err instanceof Error) {
                msg = err.message;
                console.error("가상 피팅 에러 메시지:", err.message);
                console.error("가상 피팅 에러 스택:", err.stack);
            }
            toast.error(msg);
            setIsFittingLoading(false); // 실패 시에만 로딩 상태 해제
            setCurrentStep('settings'); // 실패 시 설정 단계로 돌아가기

            if (notificationId && userId) {
                try {
                    console.log("📢 알림 실패 상태 업데이트 시도:", { notificationId, userId, errorMessage: msg });
                    await GenerationNotificationService.updateNotification(notificationId, {
                        status: 'FAILED',
                        userId: String(userId),
                        errorMessage: msg,
                    });
                    console.log("✅ 가상 피팅 실패 알림 업데이트 성공:", notificationId);
                    setTimeout(() => {
                        window.dispatchEvent(new Event('open-notification-bell'));
                    }, 500);
                } catch (e) {
                    console.error("❌ 가상 피팅 실패 알림 상태 업데이트 실패:", e);
                    if (e instanceof Error) {
                        console.error("실패 알림 업데이트 에러 메시지:", e.message);
                        console.error("실패 알림 업데이트 에러 스택:", e.stack);
                    }
                }
            }
        }
    };

    const getCurrentStepIndex = () => {
        return steps.findIndex(step => step.id === currentStep);
    };

    const canProceedToNext = () => {
        if (currentStep === 'images') return !!slot1Image && !!slot2Image;
        if (currentStep === 'settings') return !!slot1Image && !!slot2Image;
        return false;
    };

    const handleDownload = async () => {
        if (!resultImage) return;

        try {
            const response = await fetch(resultImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `virtual-fitting-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("이미지가 다운로드되었습니다!");
        } catch (error) {
            console.error("다운로드 실패:", error);
            toast.error("다운로드에 실패했습니다");
        }
    };

    const verifyImageLoad = (imageUrl: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const img = document.createElement('img');
            let retryCount = 0;
            const maxRetries = 10;
            const retryDelay = 3000; // 3초마다 재시도

            const tryLoad = () => {
                img.onload = () => {
                    console.log("✅ 이미지 로드 성공:", imageUrl);
                    setIsImageLoading(false);
                    resolve(undefined);
                };

                img.onerror = () => {
                    retryCount++;
                    console.log(`❌ 이미지 로드 실패 (${retryCount}/${maxRetries}):`, imageUrl);

                    if (retryCount >= maxRetries) {
                        setIsImageLoading(false);
                        setImageLoadError("이미지 로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
                        reject(new Error("이미지 로드 실패"));
                        return;
                    }

                    // 재시도
                    setTimeout(() => {
                        console.log(`🔄 이미지 로드 재시도 (${retryCount + 1}/${maxRetries})`);
                        // 캐시 방지를 위해 타임스탬프 추가
                        img.src = `${imageUrl}?t=${Date.now()}`;
                    }, retryDelay);
                };

                // 초기 로드 시도
                img.src = imageUrl;
            };

            tryLoad();
        });
    };

    const handleRestart = () => {
        setCurrentStep('images');
        setSlot1Image(null);
        setSlot2Image(null);
        setResultImage(null);
        setCurrentGarmentFolder(null);
        setCurrentModelFolder(null);
        setGarmentFiles([]);
        setModelFiles([]);
        setIsImageLoading(false);
        setImageLoadError(null);
    };

    return (
        <div className="flex h-screen bg-black overflow-hidden fixed inset-0 pt-16">
            {/* 메인 콘텐츠 */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* 상단 헤더 */}
                <div className="bg-black/90 backdrop-blur-xl border-b border-white/10 p-4">
                    {/* 진행 단계 */}
                    <div className="flex items-center justify-center space-x-6">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <button
                                        onClick={() => {
                                            // 완료된 단계나 현재 단계까지만 이동 가능
                                            if (index <= getCurrentStepIndex()) {
                                                setCurrentStep(step.id as Step);
                                            }
                                        }}
                                        className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                                            index < getCurrentStepIndex()
                                                ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                                                : index === getCurrentStepIndex()
                                                    ? "bg-sky-500 text-white cursor-default"
                                                    : "bg-gray-600 text-gray-300 cursor-not-allowed",
                                            index <= getCurrentStepIndex() ? "hover:scale-110" : ""
                                        )}
                                        disabled={index > getCurrentStepIndex()}
                                    >
                                        {index < getCurrentStepIndex() ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : (
                                            index + 1
                                        )}
                                    </button>
                                    <span className={cn(
                                        "mt-1.5 text-xs font-medium",
                                        index <= getCurrentStepIndex() ? "text-white" : "text-gray-400"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <ArrowRight className={cn(
                                        "h-4 w-4 mx-3 mt-[-20px]",
                                        index < getCurrentStepIndex() ? "text-green-500" : "text-gray-600"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 메인 콘텐츠 영역 */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {/* 내 폴더 및 이미지 선택 섹션 */}
                        {currentStep === 'images' && (
                            <div className="space-y-6 mb-8">
                                {/* 상단 선택 상태 */}
                                <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-sky-400" />
                                        선택 상태
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="flex items-center justify-between p-4 bg-black/30 border border-white/10 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                                <span className="text-white font-medium">의류 이미지</span>
                                            </div>
                                            <div className={cn(
                                                "text-sm px-3 py-1 rounded",
                                                slot1Image ? "bg-green-500/20 text-green-400" : "bg-gray-600/20 text-gray-400"
                                            )}>
                                                {slot1Image ? "선택됨" : "미선택"}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-black/30 border border-white/10 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                                <span className="text-white font-medium">모델 이미지</span>
                                            </div>
                                            <div className={cn(
                                                "text-sm px-3 py-1 rounded",
                                                slot2Image ? "bg-green-500/20 text-green-400" : "bg-gray-600/20 text-gray-400"
                                            )}>
                                                {slot2Image ? "선택됨" : "미선택"}
                                            </div>
                                        </div>
                                    </div>
                                    {slot1Image && slot2Image && (
                                        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                                            <span className="text-green-400 font-medium">✓ 모든 이미지 선택 완료! 다음 단계로 진행하세요.</span>
                                        </div>
                                    )}
                                </div>

                                {/* 폴더 선택 및 이미지 영역 */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* 의류 이미지 영역 */}
                                    <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                                의류 이미지 선택
                                            </h3>
                                            {!currentGarmentFolder && (
                                                <div className="text-sm text-gray-400">
                                                    의류가 있는 폴더를 선택하세요
                                                </div>
                                            )}
                                        </div>

                                        {!currentGarmentFolder ? (
                                            /* 의류 폴더 목록 */
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-sm text-gray-300">내 폴더</span>
                                                    <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                새 폴더
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="bg-black/40 backdrop-blur-xl border-white/20">
                                                            <DialogHeader>
                                                                <DialogTitle className="text-white">새 폴더 만들기</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <Label htmlFor="folderName" className="text-white">
                                                                        폴더 이름
                                                                    </Label>
                                                                    <Input
                                                                        id="folderName"
                                                                        value={newFolderName}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            setNewFolderName(value);
                                                                            if (value.toLowerCase() === "upload") {
                                                                                setFolderNameError("upload라는 이름의 폴더는 생성할 수 없습니다.");
                                                                            } else {
                                                                                setFolderNameError(null);
                                                                            }
                                                                        }}
                                                                        className={`mt-1 bg-black/40 backdrop-blur-xl border-white/20 text-white ${folderNameError ? "border-red-500" : ""}`}
                                                                        placeholder="폴더 이름을 입력하세요 (최대 20자)"
                                                                        maxLength={20}
                                                                    />
                                                                    {folderNameError && (
                                                                        <p className="text-red-500 text-sm mt-1">
                                                                            {folderNameError}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <DialogFooter>
                                                                    <Button
                                                                        variant="outline"
                                                                        className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30"
                                                                        onClick={() => {
                                                                            setIsCreateFolderOpen(false);
                                                                            setNewFolderName("");
                                                                            setFolderNameError(null);
                                                                        }}
                                                                    >
                                                                        취소
                                                                    </Button>
                                                                    <Button
                                                                        className="bg-sky-500 hover:bg-sky-600 text-white"
                                                                        onClick={createFolder}
                                                                        disabled={!!folderNameError || !newFolderName.trim()}
                                                                    >
                                                                        만들기
                                                                    </Button>
                                                                </DialogFooter>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>

                                                {isLoading ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                                                    </div>
                                                ) : folders.length > 0 ? (
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {folders.map((folder) => (
                                                            <Card
                                                                key={folder.id}
                                                                className="group p-3 border border-white/10 bg-black/30 hover:bg-black/20 hover:border-purple-500/50 transition-all duration-300 cursor-pointer relative"
                                                                onClick={() => {
                                                                    setCurrentGarmentFolder(folder);
                                                                    fetchGarmentFiles(folder.id);
                                                                }}
                                                            >
                                                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-5 w-5 text-white hover:bg-black/60"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <MoreHorizontal className="h-3 w-3" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent className="bg-black/40 backdrop-blur-xl border-white/20">
                                                                            <DropdownMenuItem
                                                                                className="text-red-400 hover:bg-black/60"
                                                                                onClick={(e) => handleDeleteClick(folder.id, e)}
                                                                            >
                                                                                삭제
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                                <div className="flex flex-col items-center">
                                                                    <Folder className="w-6 h-6 text-purple-400 mb-1 group-hover:text-purple-300" />
                                                                    <span className="text-xs text-gray-300 text-center truncate w-full">
                                                                        {folder.name}
                                                                    </span>
                                                                </div>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-6">
                                                        <p className="text-gray-400 text-sm">폴더가 없습니다</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* 의류 이미지 목록 */
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-white hover:bg-black/60"
                                                            onClick={() => {
                                                                setCurrentGarmentFolder(null);
                                                                setGarmentFiles([]);
                                                            }}
                                                        >
                                                            <ArrowLeft className="h-3 w-3" />
                                                        </Button>
                                                        <span className="text-sm font-medium text-white">
                                                            {currentGarmentFolder.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            id="garment-file-upload"
                                                            type="file"
                                                            accept="image/jpeg,image/jpg,image/png"
                                                            multiple
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                if (e.target.files && currentGarmentFolder) {
                                                                    handleFileUpload(Array.from(e.target.files), currentGarmentFolder, true);
                                                                }
                                                                e.target.value = "";
                                                            }}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-2 py-1"
                                                            disabled={isUploading}
                                                            onClick={() => document.getElementById('garment-file-upload')?.click()}
                                                        >
                                                            <Upload className="h-3 w-3 mr-1" />
                                                            업로드
                                                        </Button>
                                                    </div>
                                                </div>

                                                {isGarmentLoading ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                                                    </div>
                                                ) : garmentFiles.length > 0 ? (
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        {garmentFiles.map((file) => {
                                                            const isSelected = slot1Image?.id === file.id;

                                                            return (
                                                                <Card
                                                                    key={file.id}
                                                                    className={cn(
                                                                        "relative cursor-pointer overflow-hidden group transition-all duration-300 aspect-square",
                                                                        isSelected
                                                                            ? "border-purple-500/50 ring-2 ring-purple-500/30 bg-purple-500/10"
                                                                            : "border-white/10 hover:border-purple-500/30 bg-black/20"
                                                                    )}
                                                                    onClick={() => handleSelectImage(file, '의류')}
                                                                >
                                                                    <div className="relative w-full h-full">
                                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                        <img
                                                                            src={file.url}
                                                                            alt={file.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                                                                        {/* 선택 표시 */}
                                                                        {isSelected && (
                                                                            <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                                                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* 파일명 */}
                                                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                                                                            <p className="text-xs text-white truncate">
                                                                                {file.name}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </Card>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
                                                        <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                                                        <p className="text-gray-400 text-sm mb-2">의류 이미지가 없습니다</p>
                                                        <Button
                                                            className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-3 py-1"
                                                            onClick={() => document.getElementById('garment-file-upload')?.click()}
                                                            disabled={isUploading}
                                                        >
                                                            <Upload className="h-3 w-3 mr-1" />
                                                            업로드
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* 모델 이미지 영역 */}
                                    <div className="bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                                모델 이미지 선택
                                            </h3>
                                            {!currentModelFolder && (
                                                <div className="text-sm text-gray-400">
                                                    모델이 있는 폴더를 선택하세요
                                                </div>
                                            )}
                                        </div>

                                        {!currentModelFolder ? (
                                            /* 모델 폴더 목록 */
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-sm text-gray-300">내 폴더</span>
                                                    <Button 
                                                        size="sm" 
                                                        className="bg-green-500 hover:bg-green-600 text-white"
                                                        onClick={() => setIsCreateFolderOpen(true)}
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        새 폴더
                                                    </Button>
                                                </div>

                                                {isLoading ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <Loader2 className="h-6 w-6 animate-spin text-green-400" />
                                                    </div>
                                                ) : folders.length > 0 ? (
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {folders.map((folder) => (
                                                            <Card
                                                                key={folder.id}
                                                                className="group p-3 border border-white/10 bg-black/30 hover:bg-black/20 hover:border-green-500/50 transition-all duration-300 cursor-pointer relative"
                                                                onClick={() => {
                                                                    setCurrentModelFolder(folder);
                                                                    fetchModelFiles(folder.id);
                                                                }}
                                                            >
                                                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-5 w-5 text-white hover:bg-black/60"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <MoreHorizontal className="h-3 w-3" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent className="bg-black/40 backdrop-blur-xl border-white/20">
                                                                            <DropdownMenuItem
                                                                                className="text-red-400 hover:bg-black/60"
                                                                                onClick={(e) => handleDeleteClick(folder.id, e)}
                                                                            >
                                                                                삭제
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                                <div className="flex flex-col items-center">
                                                                    <Folder className="w-6 h-6 text-green-400 mb-1 group-hover:text-green-300" />
                                                                    <span className="text-xs text-gray-300 text-center truncate w-full">
                                                                        {folder.name}
                                                                    </span>
                                                                </div>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-6">
                                                        <p className="text-gray-400 text-sm">폴더가 없습니다</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* 모델 이미지 목록 */
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-white hover:bg-black/60"
                                                            onClick={() => {
                                                                setCurrentModelFolder(null);
                                                                setModelFiles([]);
                                                            }}
                                                        >
                                                            <ArrowLeft className="h-3 w-3" />
                                                        </Button>
                                                        <span className="text-sm font-medium text-white">
                                                            {currentModelFolder.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            id="model-file-upload"
                                                            type="file"
                                                            accept="image/jpeg,image/jpg,image/png"
                                                            multiple
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                if (e.target.files && currentModelFolder) {
                                                                    handleFileUpload(Array.from(e.target.files), currentModelFolder, false);
                                                                }
                                                                e.target.value = "";
                                                            }}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1"
                                                            disabled={isUploading}
                                                            onClick={() => document.getElementById('model-file-upload')?.click()}
                                                        >
                                                            <Upload className="h-3 w-3 mr-1" />
                                                            업로드
                                                        </Button>
                                                    </div>
                                                </div>

                                                {isModelLoading ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <Loader2 className="h-6 w-6 animate-spin text-green-400" />
                                                    </div>
                                                ) : modelFiles.length > 0 ? (
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        {modelFiles.map((file) => {
                                                            const isSelected = slot2Image?.id === file.id;

                                                            return (
                                                                <Card
                                                                    key={file.id}
                                                                    className={cn(
                                                                        "relative cursor-pointer overflow-hidden group transition-all duration-300 aspect-square",
                                                                        isSelected
                                                                            ? "border-green-500/50 ring-2 ring-green-500/30 bg-green-500/10"
                                                                            : "border-white/10 hover:border-green-500/30 bg-black/20"
                                                                    )}
                                                                    onClick={() => handleSelectImage(file, '모델')}
                                                                >
                                                                    <div className="relative w-full h-full">
                                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                        <img
                                                                            src={file.url}
                                                                            alt={file.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                                                                        {/* 선택 표시 */}
                                                                        {isSelected && (
                                                                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                                                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* 파일명 */}
                                                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                                                                            <p className="text-xs text-white truncate">
                                                                                {file.name}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </Card>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
                                                        <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                                                        <p className="text-gray-400 text-sm mb-2">모델 이미지가 없습니다</p>
                                                        <Button
                                                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1"
                                                            onClick={() => document.getElementById('model-file-upload')?.click()}
                                                            disabled={isUploading}
                                                        >
                                                            <Upload className="h-3 w-3 mr-1" />
                                                            업로드
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 하단 가이드 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                                        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            효과적인 이미지
                                        </h3>
                                        <ul className="text-xs text-gray-300 space-y-1">
                                            <li>• <span className="text-purple-400">의류:</span> 평면 촬영, 깔끔한 배경</li>
                                            <li>• <span className="text-green-400">모델:</span> 전신, 정면 포즈</li>
                                            <li>• 명확한 경계선</li>
                                        </ul>
                                    </div>

                                    <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                                        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            피해야 할 이미지
                                        </h3>
                                        <ul className="text-xs text-gray-300 space-y-1">
                                            <li>• 복잡한 배경/패턴</li>
                                            <li>• 흐릿하거나 어두운 이미지</li>
                                            <li>• 다수의 인물/의류</li>
                                        </ul>
                                    </div>

                                    <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                                        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                            <Info className="w-4 h-4 text-blue-400" />
                                            사용 방법
                                        </h3>
                                        <ul className="text-xs text-gray-300 space-y-1">
                                            <li>1. 좌측에서 의류 이미지 선택</li>
                                            <li>2. 우측에서 모델 이미지 선택</li>
                                            <li>3. 두 이미지 모두 선택 후 진행</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 설정 단계 */}
                        {currentStep === 'settings' && (
                            <div className="space-y-6 mb-8">
                                <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                            </svg>
                                            생성 설정
                                        </h3>
                                        <div className="text-sm text-gray-400">
                                            옵션을 설정하고 가상 피팅을 생성하세요
                                        </div>
                                    </div>

                                    {/* 선택된 이미지 미리보기 */}
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-black/30 border border-white/10 rounded p-2">
                                            <h4 className="text-white text-sm font-medium mb-1">선택된 의류</h4>
                                            {slot1Image ? (
                                                <div className="aspect-[3/2] rounded overflow-hidden bg-black/20">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={slot1Image.url}
                                                        alt={slot1Image.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="aspect-[3/2] rounded bg-black/20 border border-dashed border-gray-600 flex items-center justify-center">
                                                    <span className="text-gray-500 text-sm text-center px-1">의류 미선택</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-black/30 border border-white/10 rounded p-2">
                                            <h4 className="text-white text-sm font-medium mb-1">선택된 모델</h4>
                                            {slot2Image ? (
                                                <div className="aspect-[3/2] rounded overflow-hidden bg-black/20">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={slot2Image.url}
                                                        alt={slot2Image.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="aspect-[3/2] rounded bg-black/20 border border-dashed border-gray-600 flex items-center justify-center">
                                                    <span className="text-gray-500 text-sm text-center px-1">모델 미선택</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 설정 컴포넌트 삽입 */}
                                    <FashnInlineSettings
                                        onGenerate={handleGenerate}
                                        isLoading={isFittingLoading}
                                        slot1Image={slot1Image}
                                        slot2Image={slot2Image}
                                    />
                                </div>
                            </div>
                        )}

                        {/* 생성 중 단계 */}
                        {currentStep === 'generate' && (
                            <div className="space-y-6 mb-8">
                                <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                                    <div className="text-center py-12">
                                        <Loader2 className="h-16 w-16 mx-auto mb-4 text-sky-400 animate-spin" />
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            가상 피팅 생성 중...
                                        </h3>
                                        <p className="text-gray-400 mb-4">
                                            AI가 의류를 모델에 맞춰 피팅하고 있습니다.<br />
                                            이 과정은 약 15-30초 정도 소요됩니다.
                                        </p>
                                        <div className="text-sm text-gray-500">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div>
                                                이미지 분석 및 피팅 진행 중
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 결과 단계 */}
                        {currentStep === 'result' && resultImage && (
                            <div className="space-y-6 mb-8">
                                <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                                    <div className="text-center mb-6">
                                        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-400" />
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            가상 피팅 완료!
                                        </h3>
                                        <p className="text-gray-400">
                                            결과 이미지를 확인하고 다운로드하세요.
                                        </p>
                                    </div>

                                    {/* 결과 이미지 및 원본 이미지 비교 */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* 선택한 의류 */}
                                        <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                                            <h4 className="text-white font-medium mb-3 text-center">선택한 의류</h4>
                                            {slot1Image && (
                                                <div className="aspect-square rounded-lg overflow-hidden bg-black/20">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={slot1Image.url}
                                                        alt={slot1Image.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* 결과 이미지 */}
                                        <div className="bg-black/30 border border-green-500/30 rounded-lg p-4">
                                            <h4 className="text-white font-medium mb-3 text-center flex items-center justify-center gap-2">
                                                <Sparkles className="h-5 w-5 text-green-400" />
                                                가상 피팅 결과
                                            </h4>
                                            <div className="aspect-square rounded-lg overflow-hidden bg-black/20 relative">
                                                {isImageLoading ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                                        <Loader2 className="h-12 w-12 text-sky-400 animate-spin mb-4" />
                                                        <p className="text-white text-sm text-center">
                                                            이미지를 불러오는 중...<br />
                                                            <span className="text-gray-400 text-xs">잠시만 기다려주세요</span>
                                                        </p>
                                                    </div>
                                                ) : imageLoadError ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                                        <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
                                                        <p className="text-red-400 text-sm text-center mb-4">
                                                            {imageLoadError}
                                                        </p>
                                                        <Button
                                                            onClick={async () => {
                                                                if (resultImage) {
                                                                    setIsImageLoading(true);
                                                                    setImageLoadError(null);
                                                                    try {
                                                                        await verifyImageLoad(resultImage);
                                                                    } catch (error) {
                                                                        console.error("재시도 실패:", error);
                                                                    }
                                                                }
                                                            }}
                                                            className="bg-sky-500 hover:bg-sky-600 text-white"
                                                            size="sm"
                                                        >
                                                            <RotateCcw className="h-4 w-4 mr-2" />
                                                            다시 시도
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={resultImage}
                                                            alt="가상 피팅 결과"
                                                            className="w-full h-full object-cover"
                                                            onLoad={() => {
                                                                console.log("🖼️ 결과 이미지 렌더링 완료");
                                                                setIsImageLoading(false);
                                                            }}
                                                            onError={() => {
                                                                console.error("🖼️ 결과 이미지 렌더링 실패");
                                                                setImageLoadError("이미지를 표시할 수 없습니다.");
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                                            <Button
                                                                onClick={handleDownload}
                                                                className="bg-green-500 hover:bg-green-600 text-white"
                                                                size="sm"
                                                            >
                                                                <Download className="h-4 w-4 mr-2" />
                                                                다운로드
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* 선택한 모델 */}
                                        <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                                            <h4 className="text-white font-medium mb-3 text-center">선택한 모델</h4>
                                            {slot2Image && (
                                                <div className="aspect-square rounded-lg overflow-hidden bg-black/20">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={slot2Image.url}
                                                        alt={slot2Image.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 액션 버튼들 */}
                                    <div className="flex justify-center gap-4 mt-8">
                                        <Button
                                            onClick={handleDownload}
                                            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3"
                                        >
                                            <Download className="h-5 w-5 mr-2" />
                                            이미지 다운로드
                                        </Button>
                                        <Button
                                            onClick={handleRestart}
                                            variant="outline"
                                            className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 px-8 py-3"
                                        >
                                            <RotateCcw className="h-5 w-5 mr-2" />
                                            새로 시작하기
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 하단 네비게이션 */}
                        {currentStep !== 'generate' && currentStep !== 'result' && (
                            <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
                                <Button
                                    variant="outline"
                                    className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60"
                                    onClick={() => {
                                        const currentIndex = getCurrentStepIndex();
                                        if (currentIndex > 0) {
                                            setCurrentStep(steps[currentIndex - 1].id as Step);
                                        }
                                    }}
                                    disabled={getCurrentStepIndex() === 0}
                                >
                                    이전 단계
                                </Button>

                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Info className="h-4 w-4" />
                                    {currentStep === 'images' && '의류와 모델 이미지를 모두 선택하세요'}
                                    {currentStep === 'settings' && '설정을 조정하고 생성하세요'}
                                </div>

                                <Button
                                    className="bg-sky-500 hover:bg-sky-600 text-white"
                                    onClick={() => {
                                        const currentIndex = getCurrentStepIndex();
                                        if (currentIndex < steps.length - 1) {
                                            setCurrentStep(steps[currentIndex + 1].id as Step);
                                        }
                                    }}
                                    disabled={!canProceedToNext() || getCurrentStepIndex() === steps.length - 1}
                                >
                                    다음 단계
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 폴더 삭제 확인 다이얼로그 */}
            <Dialog open={isDeleteFolderOpen} onOpenChange={setIsDeleteFolderOpen}>
                <DialogContent className="bg-black/40 backdrop-blur-xl border-white/20">
                    <DialogHeader>
                        <DialogTitle className="text-white">폴더 삭제 확인</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-white">
                            정말로 이 폴더를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </p>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30"
                                onClick={() => setIsDeleteFolderOpen(false)}
                            >
                                취소
                            </Button>
                            <Button
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={deleteFolder}
                            >
                                삭제
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 업로드 에러 다이얼로그 */}
            <Dialog open={showUploadResults} onOpenChange={setShowUploadResults}>
                <DialogContent className="bg-black/40 backdrop-blur-xl border-white/20 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                            업로드 오류
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-white text-sm">
                            다음 파일들이 업로드되지 않았습니다:
                        </p>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                            {uploadResults.map((result, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-2 p-2 bg-red-500/10 rounded border border-red-500/20"
                                >
                                    <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">
                                            {result.file.name}
                                        </p>
                                        <p className="text-xs text-red-400">
                                            {result.error}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <DialogFooter>
                            <Button
                                className="bg-sky-500 hover:bg-sky-600 text-white"
                                onClick={() => {
                                    setShowUploadResults(false);
                                    setUploadResults([]);
                                }}
                            >
                                확인
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 업로드 중 로딩 오버레이 */}
            {isUploading && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg p-8">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 mx-auto mb-4 text-sky-400 animate-spin" />
                            <h3 className="text-lg font-semibold text-white mb-2">
                                이미지 업로드 중...
                            </h3>
                            <p className="text-gray-400">
                                잠시만 기다려주세요
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 