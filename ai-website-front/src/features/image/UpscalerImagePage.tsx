"use client";

import { useState, useEffect, useRef } from "react";
import { FolderService } from '../../features/folder/services/FolderService';
import type { FolderResponse, FileResponse } from '../../features/folder/services/FolderService';
import { uploadUpscalerImage } from './services/ImageService';
import UpscalerImageSidebar, { type UpscalerImageSettings } from "./UpscalerImageSidebar";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Folder,
    Upload,
    Loader2,
    AlertTriangle,
    MoreHorizontal,
    ArrowLeft,
    Plus,
    CheckCircle,
    ImageIcon,
    CloudUpload,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import Masonry from "react-masonry-css";
import { useAuth } from "@/features/user/AuthContext";

interface UploadResult {
    file: File;
    success: boolean;
    error?: string;
}

export default function UpscalerImagePage() {
    const { id: userId } = useAuth();
    const [folders, setFolders] = useState<FolderResponse[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<FolderResponse | null>(null);
    const [files, setFiles] = useState<FileResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState<number | null>(null);
    const [folderNameError, setFolderNameError] = useState<string | null>(null);
    const [folderError, setFolderError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
    const [showUploadResults, setShowUploadResults] = useState(false);

    // 업스케일링할 이미지
    const [selectedImage, setSelectedImage] = useState<FileResponse | null>(null);

    // 업스케일링 로딩 상태
    const [isUpscalingLoading, setIsUpscalingLoading] = useState(false);

    // 사이드바 드래그 오버 상태
    const [isSidebarDragOver, setIsSidebarDragOver] = useState(false);

    // 드래그 중인 이미지 ID
    const [draggingImageId, setDraggingImageId] = useState<number | null>(null);

    /** 드래그 앤 드롭 ref */
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (userId) {
            loadFolders();
        }
    }, [userId]);

    useEffect(() => {
        if (selectedFolder) {
            loadFiles(selectedFolder.id);
        }
    }, [selectedFolder]);

    const loadFolders = async () => {
        try {
            setIsLoading(true);
            setFolderError(null);
            const response = await FolderService.getFolders();
            setFolders(response);
            if (response.length > 0) {
                setSelectedFolder(response[0]);
            }
        } catch (error) {
            console.error("폴더 로딩 실패:", error);
            setFolderError("폴더 목록을 불러오는데 실패했습니다");
        } finally {
            setIsLoading(false);
        }
    };

    const loadFiles = async (folderId: number) => {
        try {
            setIsLoading(true);
            setFolderError(null);
            const response = await FolderService.getFilesByFolder(folderId);
            setFiles(response);
        } catch (error) {
            console.error("파일 로딩 실패:", error);
            setFolderError("파일 목록을 불러오는데 실패했습니다");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedFolder || !event.target.files || event.target.files.length === 0) return;

        const files = Array.from(event.target.files);
        await handleMultipleFileUpload(files);
    };

    /* ------------------------------------------------------------------
       드래그 앤 드롭 이벤트 핸들러
    ------------------------------------------------------------------ */
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // 웹사이트 내 이미지 드래그인지 확인 (JSON 데이터가 있으면 내부 이미지)
        const hasInternalImageData = e.dataTransfer.types.includes("application/json");

        // 폴더가 있고, 외부 파일 드래그이며, 실제 파일이 있을 때만 드롭존 표시
        if (selectedFolder && !hasInternalImageData && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            // 실제 파일인지 확인 (kind가 'file'인 항목이 있는지)
            const hasFiles = Array.from(e.dataTransfer.items).some(item => item.kind === 'file');
            if (hasFiles) {
                setIsDragOver(true);
            }
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // 드롭존을 완전히 벗어날 때만 isDragOver를 false로 설정
        if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
            setIsDragOver(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (!selectedFolder) return;

        // 웹사이트 내 이미지 드래그인지 확인
        const internalImageData = e.dataTransfer.getData("application/json");
        if (internalImageData) {
            // 내부 이미지는 업로드하지 않음
            return;
        }

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        await handleMultipleFileUpload(files);
    };

    /* ------------------------------------------------------------------
       다중 파일 업로드
    ------------------------------------------------------------------ */
    const handleMultipleFileUpload = async (files: File[]) => {
        if (!selectedFolder) return;

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

            try {
                const response = await FolderService.uploadFile(selectedFolder.id, file);
                setFiles((prev) => [...prev, response]);
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

        // 결과 처리
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
            await FolderService.createFolder({ name: trimmedName });
            await loadFolders();
            toast.success("폴더가 생성되었습니다");
            setIsCreateFolderOpen(false);
            setNewFolderName("");
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
            await FolderService.deleteFolder(folderToDelete);
            setFolders((prev) => prev.filter((folder) => folder.id !== folderToDelete));
            toast.success("폴더가 삭제되었습니다");
            if (selectedFolder?.id === folderToDelete) {
                setSelectedFolder(null);
                setFiles([]);
            }
        } catch (error) {
            console.error("폴더 삭제 오류:", error);
            if (error && typeof error === "object" && "response" in error && error.response) {
                const response = error.response as { data?: { message?: string }; status?: number };
                if (response.status === 500) {
                    toast.error("서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                } else {
                    toast.error("폴더 삭제에 실패했습니다: " + (response.data?.message || "알 수 없는 오류"));
                }
            } else if (error && typeof error === "object" && "request" in error) {
                toast.error("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
            } else {
                toast.error("폴더 삭제에 실패했습니다");
            }
        } finally {
            setIsDeleteFolderOpen(false);
            setFolderToDelete(null);
        }
    };

    const handleSelectImage = (file: FileResponse) => {
        // 이미 선택된 이미지를 다시 클릭하면 선택 해제
        if (selectedImage && selectedImage.id === file.id) {
            setSelectedImage(null);
            toast.success("이미지 선택이 해제되었습니다");
            return;
        }

        // 새로운 이미지 선택
        setSelectedImage(file);
        toast.success("업스케일링할 이미지로 선택되었습니다");
    };

    const handleUpscale = async (settings: UpscalerImageSettings) => {
        setIsUpscalingLoading(true);
        try {
            const response = await fetch("/internal/image/upscaler", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    image_url: settings.image?.url,
                    prompt: settings.prompt,
                    upscale_factor: settings.upscale_factor,
                    negative_prompt: settings.negative_prompt,
                    creativity: settings.creativity,
                    resemblance: settings.resemblance,
                    guidance_scale: settings.guidance_scale,
                    num_inference_steps: settings.num_inference_steps,
                    seed: settings.seed,
                    enable_safety_checker: settings.enable_safety_checker,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "업스케일링 실패");
            }

            const result = await response.json();
            console.log("업스케일링 결과:", result);

            // 배율 조정 메시지가 있으면 사용자에게 알림
            if (result.message) {
                toast.success(result.message, { duration: 5000 });
            }

            // 결과 이미지를 upscaler 폴더에 저장
            if (result.image?.url) {
                try {
                    const uploadResult = await uploadUpscalerImage(result.image.url);
                    console.log("업스케일링 이미지 저장 완료:", uploadResult);
                    toast.success("업스케일링된 이미지가 저장되었습니다!");

                    // 선택된 이미지 초기화
                    setSelectedImage(null);

                    // 현재 폴더가 선택되어 있으면 파일 목록 새로고침
                    if (selectedFolder) {
                        await loadFiles(selectedFolder.id);
                    }
                } catch (uploadError) {
                    console.error("업스케일링 이미지 저장 실패:", uploadError);
                    toast.error("업스케일링은 완료되었지만 이미지 저장에 실패했습니다.");
                }
            } else {
                toast.success("이미지 업스케일링이 완료되었습니다!");
            }
        } catch (error) {
            console.error("업스케일링 실패:", error);
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("이미지 업스케일링에 실패했습니다");
            }
        } finally {
            setIsUpscalingLoading(false);
        }
    };

    /* ------------------------------------------------------------------
       이미지 드래그 앤 드롭 핸들러 (사이드바로)
    ------------------------------------------------------------------ */
    const handleImageDragStart = (e: React.DragEvent, file: FileResponse) => {
        e.dataTransfer.setData("application/json", JSON.stringify(file));
        e.dataTransfer.effectAllowed = "copy";
        setDraggingImageId(file.id);
    };

    const handleImageDragEnd = () => {
        setDraggingImageId(null);
    };

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
        setDraggingImageId(null);

        try {
            const fileData = e.dataTransfer.getData("application/json");
            if (fileData) {
                const file: FileResponse = JSON.parse(fileData);
                setSelectedImage(file);
                toast.success("참조 이미지로 설정되었습니다");
            }
        } catch (error) {
            console.error("드롭 처리 오류:", error);
            toast.error("이미지 설정에 실패했습니다");
        }
    };

    // 폴더/파일 목록 필터링
    const filteredFiles = files.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredFolders = folders.filter((folder) =>
        folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-black overflow-hidden fixed inset-0 pt-16">
            <UpscalerImageSidebar
                onUpscale={handleUpscale}
                isLoading={isUpscalingLoading}
                selectedImage={selectedImage}
                isDragOver={isSidebarDragOver}
                onDragEnter={handleSidebarDragEnter}
                onDragLeave={handleSidebarDragLeave}
                onDragOver={handleSidebarDragOver}
                onDrop={handleSidebarDrop}
                ref={sidebarRef}
            />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="container mx-auto p-6 max-w-7xl flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6 flex-shrink-0">
                        <div className="flex items-center gap-4">
                            {selectedFolder && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-black/60"
                                    onClick={() => setSelectedFolder(null)}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {selectedFolder ? selectedFolder.name : "내 폴더"}
                                </h1>
                                <p className="text-gray-400">
                                    {selectedFolder ? `${files.length}개의 이미지` : "업스케일링할 이미지를 선택하세요"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">

                            {!selectedFolder ? (
                                <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-sky-500 hover:bg-sky-600 text-white">
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
                                                    className={`mt-1 bg-black/40 backdrop-blur-xl border-white/20 text-white ${folderNameError ? "border-red-500" : ""
                                                        }`}
                                                    placeholder="폴더 이름을 입력하세요 (최대 20자)"
                                                    maxLength={20}
                                                />
                                                {folderNameError && (
                                                    <p className="text-red-500 text-sm mt-1">{folderNameError}</p>
                                                )}
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    variant="outline"
                                                    className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30"
                                                    onClick={() => setIsCreateFolderOpen(false)}
                                                >
                                                    취소
                                                </Button>
                                                <Button
                                                    className="bg-sky-500 hover:bg-sky-600 text-white"
                                                    onClick={createFolder}
                                                    disabled={!!folderNameError}
                                                >
                                                    만들기
                                                </Button>
                                            </DialogFooter>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        accept="image/*"
                                        multiple
                                        disabled={isUploading}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className={`cursor-pointer ${isUploading ? "opacity-50" : ""}`}
                                    >
                                        <Button
                                            className="bg-sky-500 hover:bg-sky-600 text-white"
                                            disabled={isUploading}
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    업로드 중...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    이미지 업로드
                                                </>
                                            )}
                                        </Button>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div
                        className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/40 transition-colors duration-200 pr-2 relative"
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        ref={dropZoneRef}
                    >
                        {/* 드래그 오버 시 드롭존 */}
                        {isDragOver && selectedFolder && (
                            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                                <div className="border-2 border-dashed border-sky-400 rounded-lg p-12 bg-sky-500/10 backdrop-blur-xl">
                                    <div className="text-center">
                                        <CloudUpload className="h-16 w-16 mx-auto mb-4 text-sky-400" />
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            이미지를 여기에 드롭하세요
                                        </h3>
                                        <p className="text-gray-300">
                                            여러 이미지를 한번에 업로드할 수 있습니다
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                            {/* ----------- 로그인 확인 ----------- */}
                            {!userId ? (
                                <div className="col-span-full flex items-center justify-center h-full min-h-[400px]">
                                    <div className="text-center">
                                        <div className="border border-white/20 bg-black/40 backdrop-blur-xl rounded-lg p-12 max-w-md mx-auto">
                                            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                                            <h3 className="text-xl font-semibold text-white mb-2">
                                                로그인이 필요합니다
                                            </h3>
                                            <p className="text-gray-400 mb-6">
                                                이미지 업스케일링 기능을 사용하려면<br />
                                                먼저 로그인해주세요
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : isLoading ? (
                                <Card className="p-4 border border-white/20 bg-black/40 backdrop-blur-xl">
                                    <div className="flex items-center justify-center h-32">
                                        <div className="text-center">
                                            <Loader2 className="h-10 w-10 mx-auto mb-2 text-sky-400 animate-spin" />
                                            <p className="text-white">로딩 중...</p>
                                            <p className="text-sm text-gray-400">잠시만 기다려주세요</p>
                                        </div>
                                    </div>
                                </Card>
                            ) : folderError ? (
                                <Card className="p-4 border border-white/20 bg-black/40 backdrop-blur-xl">
                                    <div className="flex flex-col items-center justify-center h-32">
                                        <div className="bg-red-500/20 text-red-400 rounded-full p-4 mb-4">
                                            <AlertTriangle className="h-10 w-10" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-2">
                                            오류가 발생했습니다
                                        </h3>
                                        <p className="text-red-400 text-center mb-4">{folderError}</p>
                                        <Button
                                            onClick={selectedFolder ? () => loadFiles(selectedFolder.id) : loadFolders}
                                            className="bg-sky-500 hover:bg-sky-600 text-white"
                                        >
                                            <Loader2 className="w-4 h-4 mr-2" />
                                            다시 시도
                                        </Button>
                                    </div>
                                </Card>
                            ) : !selectedFolder ? (
                                filteredFolders.map((folder) => (
                                    <Card
                                        key={folder.id}
                                        className="group p-6 border border-white/10 bg-black/40 backdrop-blur-xl hover:bg-black/30 hover:backdrop-blur-2xl hover:border-sky-500/50 transition-all duration-300 cursor-pointer relative overflow-hidden"
                                        onClick={() => setSelectedFolder(folder)}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="relative flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <Folder className="h-6 w-6 text-sky-400 group-hover:text-sky-300 transition-colors duration-300" />
                                                <div>
                                                    <h3 className="font-medium text-white group-hover:text-white/90 transition-colors duration-300">
                                                        {folder.name}
                                                    </h3>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-white hover:bg-black/60 relative z-10"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
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
                                    </Card>
                                ))
                            ) : filteredFiles.length === 0 ? (
                                /* -------- 빈 폴더 placeholder -------- */
                                <div className="col-span-full flex items-center justify-center h-full min-h-[400px]">
                                    <div className="text-center">
                                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 max-w-md mx-auto">
                                            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                                            <h3 className="text-xl font-semibold text-white mb-2">
                                                아직 이미지가 없습니다
                                            </h3>
                                            <p className="text-gray-400 mb-6">
                                                이미지를 드래그 앤 드롭하거나<br />
                                                업로드 버튼을 사용해 이미지를 추가하세요
                                            </p>
                                            <Button
                                                className="bg-sky-500 hover:bg-sky-600 text-white"
                                                onClick={() => document.getElementById("file-upload")?.click()}
                                                disabled={isUploading}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                이미지 선택
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Masonry
                                    breakpointCols={{
                                        default: 4,
                                        1100: 3,
                                        700: 2,
                                        500: 1
                                    }}
                                    className="my-masonry-grid col-span-full"
                                    columnClassName="my-masonry-grid_column"
                                >
                                    {filteredFiles.map((file) => {
                                        const isSelected = selectedImage && selectedImage.id === file.id;
                                        const isDragging = draggingImageId === file.id;

                                        return (
                                            <Card
                                                key={file.id}
                                                className={cn(
                                                    "relative cursor-pointer overflow-hidden group mb-4 break-inside-avoid",
                                                    "transition-all duration-300",
                                                    isSelected ? "border-sky-500/50" : "border-white/10",
                                                    "border hover:border-sky-500/50",
                                                    "bg-black/40 backdrop-blur-xl hover:bg-black/60",
                                                    isDragging && "opacity-50 scale-95 border-sky-400"
                                                )}
                                                onClick={() => handleSelectImage(file)}
                                                draggable
                                                onDragStart={(e) => handleImageDragStart(e, file)}
                                                onDragEnd={handleImageDragEnd}
                                            >
                                                <div className="relative">
                                                    <Image
                                                        src={file.url}
                                                        alt={file.name}
                                                        width={300}
                                                        height={200}
                                                        className="w-full h-auto object-cover"
                                                        sizes="(max-width: 500px) 100vw, (max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw"
                                                        unoptimized
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                                        <p className="text-sm text-white truncate font-medium">
                                                            {file.name}
                                                        </p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2 bg-sky-500 text-white text-xs rounded-full px-2 py-1 flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" />
                                                            선택됨
                                                        </div>
                                                    )}
                                                    {/* 드래그 가능 표시 */}
                                                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        드래그하여 참조 이미지로 설정
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </Masonry>
                            )}
                        </div>
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
                        <div className="flex justify-end gap-2">
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
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 업로드 에러 결과 다이얼로그 */}
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
                        <div className="flex justify-end">
                            <Button
                                className="bg-sky-500 hover:bg-sky-600 text-white"
                                onClick={() => {
                                    setShowUploadResults(false);
                                    setUploadResults([]);
                                }}
                            >
                                확인
                            </Button>
                        </div>
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
