"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    RefreshCw,
    Folder,
    ArrowLeft,
    Plus,
    Upload,
    MoreHorizontal,
    Loader2,
    AlertTriangle,
    ImageIcon,
    CloudUpload,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    FolderService,
    FolderResponse,
    FileResponse,
} from "@/features/folder/services/FolderService";
import { toast } from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Masonry from "react-masonry-css";
import axios from "axios";
import { useAuth } from "@/features/user/AuthContext";

interface VideoGenerationFolderProps {
    onSelectImage: (fileUrl: string, fileName: string) => void;
    isSidebarDragOver?: boolean;
    onSidebarDragEnter?: (e: React.DragEvent) => void;
    onSidebarDragLeave?: (e: React.DragEvent) => void;
    onSidebarDragOver?: (e: React.DragEvent) => void;
    onSidebarDrop?: (e: React.DragEvent) => void;
    sidebarRef?: React.RefObject<HTMLDivElement | null>;
}

interface UploadResult {
    file: File;
    success: boolean;
    error?: string;
}

// axios 에러 타입 가드 직접 구현
function isAxiosError(
    error: unknown
): error is { response?: { status?: number }; isAxiosError: boolean } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'isAxiosError' in error &&
        typeof (error as { isAxiosError?: unknown }).isAxiosError === 'boolean'
    );
}

export default function VideoGenerationFolder({
    onSelectImage,
    isSidebarDragOver,
    onSidebarDragEnter,
    onSidebarDragLeave,
    onSidebarDragOver,
    onSidebarDrop,
    sidebarRef,
}: VideoGenerationFolderProps) {
    const { id: userId } = useAuth();
    const [folders, setFolders] = useState<FolderResponse[]>([]);
    const [files, setFiles] = useState<FileResponse[]>([]);
    const [currentFolder, setCurrentFolder] = useState<FolderResponse | null>(
        null,
    );
    const [isLoadingFolder, setIsLoadingFolder] = useState(true);
    const [folderError, setFolderError] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState("");
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState<number | null>(null);
    const [folderNameError, setFolderNameError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
    const [showUploadResults, setShowUploadResults] = useState(false);
    const [draggingImageId, setDraggingImageId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    /* ------------------- 1) 마운트 시 폴더 목록 불러오기 ------------------- */
    useEffect(() => {
        if (userId) {
            fetchFolders();
        }
    }, [userId]);

    /* ------------------- 2) 폴더 목록 조회 ------------------- */
    const fetchFolders = async () => {
        try {
            setIsLoadingFolder(true);
            setFolderError(null);
            const data = await FolderService.getFolders();
            setFolders(data);
        } catch (error: unknown) {
            // 인증 실패(401) 시에는 아무 메시지도 띄우지 않고 빈 화면만 보여줌
            if (isAxiosError(error) && error.response?.status === 401) {
                setFolders([]);
                // setFolderError(null); // 에러 메시지 상태도 설정하지 않음
            } else {
                console.error("폴더 로딩 오류:", error);
                setFolderError("폴더 목록을 불러오는데 실패했습니다");
            }
        } finally {
            setIsLoadingFolder(false);
        }
    };

    /* ------------------- 3) 폴더 내 파일 조회 ------------------- */
    const fetchFiles = async (folderId: number) => {
        try {
            setIsLoadingFolder(true);
            setFolderError(null);
            const filesData = await FolderService.getFilesByFolder(folderId);
            setFiles(filesData);
        } catch (error: unknown) {
            // 인증 실패(401) 시에는 아무 메시지도 띄우지 않고 빈 화면만 보여줌
            if (isAxiosError(error) && error.response?.status === 401) {
                setFiles([]);
                // setFolderError(null);
            } else {
                console.error("파일 로딩 오류:", error);
                setFolderError("파일 목록을 불러오는데 실패했습니다");
            }
        } finally {
            setIsLoadingFolder(false);
        }
    };

    /* ------------------- 4) 폴더 클릭 핸들러 ------------------- */
    const handleFolderClick = async (folder: FolderResponse) => {
        setCurrentFolder(folder);
        await fetchFiles(folder.id);
    };

    /* ------------------- 5) 뒤로가기 핸들러 ------------------- */
    const handleBack = () => {
        setCurrentFolder(null);
        setFiles([]);
    };

    /* ------------------- 6) 이미지를 참조 이미지로 설정 ------------------- */
    const handleSetReferenceImage = (file: FileResponse) => {
        onSelectImage(file.url, file.name);
        toast.success("참조 이미지로 설정되었습니다");
    };

    /* ------------------- 이미지 드래그 앤 드롭 핸들러 (사이드바로) ------------------- */
    const handleImageDragStart = (e: React.DragEvent, file: FileResponse) => {
        e.dataTransfer.setData("application/json", JSON.stringify({
            url: file.url,
            name: file.name
        }));
        e.dataTransfer.effectAllowed = "copy";
        setDraggingImageId(file.id);
    };

    const handleImageDragEnd = () => {
        setDraggingImageId(null);
    };

    /* ------------------- 7) 폴더 생성 ------------------- */
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
            await fetchFolders();
            toast.success("폴더가 생성되었습니다");
            setIsCreateFolderOpen(false);
            setNewFolderName("");
        } catch (err) {
            console.error(err);
            toast.error("폴더 생성에 실패했습니다");
        }
    };

    /* ------------------- 8) 폴더 삭제 ------------------- */
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
                setFolders((prev) =>
                    prev.filter((folder) => folder.id !== folderToDelete),
                );
                toast.success("폴더가 삭제되었습니다");

                if (currentFolder?.id === folderToDelete) {
                    setCurrentFolder(null);
                    setFiles([]);
                    handleBack();
                }
            } else {
                toast.error(result.message || "폴더 삭제에 실패했습니다");
            }
        } catch (error) {
            console.error("폴더 삭제 오류:", error);
            if (
                error &&
                typeof error === "object" &&
                "response" in error &&
                error.response
            ) {
                const response = error.response as {
                    data?: { message?: string };
                    status?: number;
                };
                if (response.status === 500) {
                    toast.error("서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                } else {
                    toast.error(
                        "폴더 삭제에 실패했습니다: " +
                        (response.data?.message || "알 수 없는 오류"),
                    );
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

    /* ------------------- 9) 파일 업로드 ------------------- */
    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (
            !currentFolder ||
            !event.target.files ||
            event.target.files.length === 0
        ) {
            return;
        }

        const file = event.target.files[0];
        setIsUploading(true);

        try {
            await FolderService.uploadFile(currentFolder.id, file);
            toast.success(`${file.name} 파일이 업로드되었습니다`);
            await fetchFiles(currentFolder.id);
        } catch (error) {
            console.error("파일 업로드 오류:", error);
            toast.error("파일 업로드에 실패했습니다");
        } finally {
            setIsUploading(false);
            /** 파일 선택 후 같은 파일을 또 업로드하려면 value reset 필요 */
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    /* ------------------- 10) 드래그 앤 드롭 이벤트 핸들러 ------------------- */
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // 웹사이트 내 이미지 드래그인지 확인 (JSON 데이터가 있으면 내부 이미지)
        const hasInternalImageData = e.dataTransfer.types.includes("application/json");

        // 폴더가 있고, 외부 파일 드래그이며, 실제 파일이 있을 때만 드롭존 표시
        if (currentFolder && !hasInternalImageData && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
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

        if (!currentFolder) return;

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

    /* ------------------- 11) 다중 파일 업로드 ------------------- */
    const handleMultipleFileUpload = async (files: File[]) => {
        if (!currentFolder) return;

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
                await FolderService.uploadFile(currentFolder.id, file);
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
            await fetchFiles(currentFolder.id);
        }

        if (errorCount > 0) {
            setUploadResults(results.filter(r => !r.success));
            setShowUploadResults(true);
        }

        setIsUploading(false);
    };

    /* ------------------- 12) 파일 입력에서 다중 파일 처리 ------------------- */
    const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!currentFolder || !event.target.files || event.target.files.length === 0) {
            return;
        }

        const files = Array.from(event.target.files);
        await handleMultipleFileUpload(files);

        // 파일 선택 후 같은 파일을 또 업로드하려면 value reset 필요
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* ------------------------------------------------------------------
          헤더
      ------------------------------------------------------------------ */}
            <div className="container mx-auto py-8 px-6 max-w-7xl flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        {currentFolder && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-black/60"
                                onClick={handleBack}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {currentFolder ? currentFolder.name : "내 폴더"}
                            </h1>
                            <p className="text-gray-400">
                                {currentFolder
                                    ? `${files.length}개의 이미지`
                                    : "참조 이미지로 사용할 이미지를 선택하세요"}
                            </p>
                        </div>
                    </div>

                    {/* ----------------------- 헤더 우측 버튼 영역 ----------------------- */}
                    <div className="flex items-center gap-2">
                        {!currentFolder ? (
                            /* -------- 폴더 목록 화면: 새 폴더 -------- */
                            <Dialog
                                open={isCreateFolderOpen}
                                onOpenChange={setIsCreateFolderOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                                        <Plus className="h-4 w-4 mr-2" />
                                        새 폴더
                                    </Button>
                                </DialogTrigger>

                                <DialogContent className="bg-black/40 backdrop-blur-xl border-white/20">
                                    <DialogHeader>
                                        <DialogTitle className="text-white">
                                            새 폴더 만들기
                                        </DialogTitle>
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
                                                        setFolderNameError(
                                                            "upload라는 이름의 폴더는 생성할 수 없습니다.",
                                                        );
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
                                                <p className="text-red-500 text-sm mt-1">
                                                    {folderNameError}
                                                </p>
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
                            /* -------- 폴더 내부 화면: 이미지 업로드 -------- */
                            <>
                                {/* 숨겨진 file input */}
                                <input
                                    id="file-upload"
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    disabled={isUploading}
                                    onChange={handleFileInputChange}
                                />

                                {/* 업로드 버튼(라벨 대신 직접 click 호출) */}
                                <Button
                                    className="bg-sky-500 hover:bg-sky-600 text-white"
                                    disabled={isUploading}
                                    onClick={() =>
                                        !isUploading && fileInputRef.current?.click()
                                    }
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
                            </>
                        )}
                    </div>
                </div>

                {/* ------------------------------------------------------------------
            목록(폴더 / 파일 카드)
        ------------------------------------------------------------------ */}
                <div
                    className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/40 transition-colors duration-200 relative"
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    ref={dropZoneRef}
                >
                    {/* 드래그 오버 시 드롭존 */}
                    {isDragOver && currentFolder && (
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

                    {/* -------- 로그인 확인 -------- */}
                    {!userId ? (
                        <div className="flex items-center justify-center h-full min-h-[400px]">
                            <div className="text-center">
                                <div className="border border-white/20 bg-black/40 backdrop-blur-xl rounded-lg p-12 max-w-md mx-auto">
                                    <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        로그인이 필요합니다
                                    </h3>
                                    <p className="text-gray-400 mb-6">
                                        비디오 생성 기능을 사용하려면<br />
                                        먼저 로그인해주세요
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : /* -------- 로딩 -------- */
                        isLoadingFolder ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                                <Card className="p-4 border border-white/20 bg-black/40 backdrop-blur-xl">
                                    <div className="flex items-center justify-center h-32">
                                        <div className="text-center">
                                            <Loader2 className="h-10 w-10 mx-auto mb-2 text-sky-400 animate-spin" />
                                            <p className="text-white">로딩 중...</p>
                                            <p className="text-sm text-gray-400">잠시만 기다려주세요</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            /* -------- 오류 -------- */
                        ) : folderError ? (
                            // 인증 실패(401)로 인한 빈 배열이면 아무것도 렌더링하지 않음
                            (folders.length === 0 && files.length === 0)
                                ? null
                                : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
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
                                                    onClick={
                                                        currentFolder
                                                            ? () => fetchFiles(currentFolder.id)
                                                            : fetchFolders
                                                    }
                                                    className="bg-sky-500 hover:bg-sky-600 text-white"
                                                >
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    다시 시도
                                                </Button>
                                            </div>
                                        </Card>
                                    </div>
                                )

                            /* -------- 폴더 목록 -------- */
                        ) : !currentFolder ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                                {folders.map((folder) => (
                                    <Card
                                        key={folder.id}
                                        className="group p-6 border border-white/10 bg-black/40 backdrop-blur-xl hover:bg-black/30 hover:border-sky-500/50 transition-all duration-300 cursor-pointer relative overflow-hidden"
                                        onClick={() => handleFolderClick(folder)}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <Folder className="h-6 w-6 text-sky-400 group-hover:text-sky-300" />
                                                <div>
                                                    <h3 className="font-medium text-white">
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
                                ))}
                            </div>

                            /* -------- 폴더 내부 파일 목록 -------- */
                        ) : files.length === 0 ? (
                            /* -------- 빈 폴더 placeholder -------- */
                            <div className="flex items-center justify-center h-full min-h-[400px]">
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
                                            onClick={() => fileInputRef.current?.click()}
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
                                className="my-masonry-grid"
                                columnClassName="my-masonry-grid_column"
                            >
                                {files.map((file) => {
                                    const isDragging = draggingImageId === file.id;

                                    return (
                                        <Card
                                            key={file.id}
                                            className={cn(
                                                "relative cursor-pointer overflow-hidden group mb-4 break-inside-avoid",
                                                "transition-all duration-300",
                                                "border border-white/10 hover:border-sky-500/50",
                                                "bg-black/40 backdrop-blur-xl hover:bg-black/60",
                                                isDragging && "opacity-50 scale-95 border-sky-400"
                                            )}
                                            onClick={() => handleSetReferenceImage(file)}
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

            {/* ------------------------------------------------------------------
          폴더 삭제 확인 다이얼로그
      ------------------------------------------------------------------ */}
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

            {/* ------------------------------------------------------------------
          업로드 에러 결과 다이얼로그
      ------------------------------------------------------------------ */}
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

            {/* ------------------------------------------------------------------
          업로드 중 로딩 오버레이
      ------------------------------------------------------------------ */}
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
