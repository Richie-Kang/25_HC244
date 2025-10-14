"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  Upload,
  File,
  CloudUpload,
  X,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FolderService, FileResponse } from "./services/FolderService";
import { Card } from "@/components/ui/card";
import Masonry from "react-masonry-css";
import FolderImageDetail from "./FolderImageDetail";
import { createPortal } from "react-dom";

interface UploadResult {
  file: File;
  success: boolean;
  error?: string;
}

const FolderInPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");
  const folderName = searchParams.get("folderName");

  const [files, setFiles] = useState<FileResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [showUploadResults, setShowUploadResults] = useState(false);

  // 파일 삭제 관련 상태
  const [deleteFileId, setDeleteFileId] = useState<number | null>(null);
  const [isFileDeleteModalOpen, setIsFileDeleteModalOpen] = useState(false);

  // FolderImageDetail 관련 상태
  const [selectedImageFile, setSelectedImageFile] = useState<FileResponse | null>(null);
  const [showImageDetail, setShowImageDetail] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  const fetchFiles = useCallback(async () => {
    if (!folderId) return;

    try {
      setIsLoading(true);
      setError(null);
      const filesData = await FolderService.getFilesByFolder(Number(folderId));
      setFiles(filesData);
    } catch (error) {
      console.error("파일 로딩 오류:", error);
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNREFUSED') {
        setError("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
      } else if (error && typeof error === 'object' && 'response' in error && error.response) {
        const response = error.response as { status: number; statusText: string };
        setError(`서버 오류: ${response.status} - ${response.statusText}`);
      } else if (error && typeof error === 'object' && 'request' in error && error.request) {
        setError("서버로부터 응답을 받지 못했습니다. 네트워크 연결을 확인해주세요.");
      } else {
        setError("요청 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    if (folderId) {
      fetchFiles();
    }
  }, [folderId, fetchFiles]);

  // ESC 키 이벤트 리스너
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showImageDetail) {
        closeImageDetail();
      }
    };

    if (showImageDetail) {
      document.addEventListener('keydown', handleEscapeKey);
      // 모달 열릴 때 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      // 모달 닫힐 때 스크롤 복원
      document.body.style.overflow = 'unset';
    };
  }, [showImageDetail]);

  const handleBack = () => {
    router.push("/my/folder/my");
  };

  // 이미지 클릭 핸들러
  const handleImageClick = (file: FileResponse) => {
    // 이미지 파일인지 확인
    if (file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      setSelectedImageFile(file);
      setShowImageDetail(true);
    }
  };

  // FolderImageDetail 모달 닫기
  const closeImageDetail = () => {
    setShowImageDetail(false);
    setSelectedImageFile(null);
  };

  // 파일 업데이트 핸들러 (FolderImageDetail에서 파일 정보가 변경될 때)
  const handleFileUpdate = (updatedFile: FileResponse) => {
    // 업데이트된 파일 정보를 files 배열에 반영
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === updatedFile.id
          ? updatedFile
          : file
      )
    );
    // 선택된 파일도 업데이트
    setSelectedImageFile(updatedFile);
  };

  // 모달 배경 클릭 핸들러
  const handleModalBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeImageDetail();
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteFolder = async () => {
    if (!folderId) return;

    try {
      await FolderService.deleteFolder(Number(folderId));
      toast({ title: "성공", description: "폴더가 삭제되었습니다", duration: 3000 });
      router.push("/my/folder");
    } catch (error) {
      console.error("폴더 삭제 오류:", error);
      if (error && typeof error === 'object' && 'response' in error && error.response) {
        const response = error.response as { data?: { message?: string }; status?: number };
        if (response.status === 500) {
          toast({ title: "오류", description: "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", duration: 3000, variant: "destructive" });
        } else {
          toast({ title: "오류", description: "폴더 삭제에 실패했습니다: " + (response.data?.message || "알 수 없는 오류"), duration: 3000, variant: "destructive" });
        }
      } else if (error && typeof error === 'object' && 'request' in error) {
        toast({ title: "오류", description: "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.", duration: 3000, variant: "destructive" });
      } else {
        toast({ title: "오류", description: "폴더 삭제에 실패했습니다", duration: 3000, variant: "destructive" });
      }
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  // 파일 삭제 핸들러
  const handleFileDeleteClick = (fileId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // 이미지 클릭 이벤트 방지
    setDeleteFileId(fileId);
    setIsFileDeleteModalOpen(true);
  };

  const handleDeleteFile = async () => {
    if (!deleteFileId) return;

    try {
      const result = await FolderService.deleteFile(deleteFileId);
      if (result.success) {
        toast({
          title: "성공",
          description: "파일이 삭제되었습니다",
          duration: 3000
        });
        // 파일 목록에서 삭제된 파일 제거
        setFiles(prevFiles => prevFiles.filter(file => file.id !== deleteFileId));
      } else {
        toast({
          title: "오류",
          description: result.message || "파일 삭제에 실패했습니다",
          duration: 3000,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("파일 삭제 오류:", error);
      toast({
        title: "오류",
        description: "파일 삭제 중 오류가 발생했습니다",
        duration: 3000,
        variant: "destructive"
      });
    } finally {
      setIsFileDeleteModalOpen(false);
      setDeleteFileId(null);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!folderId || !event.target.files || event.target.files.length === 0) {
      return;
    }

    const files = Array.from(event.target.files);
    await handleMultipleFileUpload(files);

    // 파일 선택 후 같은 파일을 또 업로드하려면 value reset 필요
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmUpload = async () => {
    if (!folderId || !selectedFile) {
      return;
    }

    setIsUploading(true);
    setShowUploadModal(false);

    try {
      await FolderService.uploadFile(Number(folderId), selectedFile);
      toast({ title: "성공", description: `${selectedFile.name} 파일이 업로드되었습니다`, duration: 3000 });
      await fetchFiles(); // 파일 목록 새로고침
    } catch (error) {
      console.error("파일 업로드 오류:", error);
      if (error && typeof error === 'object' && 'response' in error && error.response) {
        const response = error.response as { data?: { message?: string }; message?: string };
        const errorMessage = response.data?.message || response.message || "알 수 없는 오류";
        console.error('업로드 에러 상세:', errorMessage);
        toast({ title: "오류", description: `파일 업로드에 실패했습니다: ${errorMessage}`, duration: 3000, variant: "destructive" });
      } else {
        toast({ title: "오류", description: "파일 업로드에 실패했습니다", duration: 3000, variant: "destructive" });
      }
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
  };

  /* ------------------- 드래그 앤 드롭 이벤트 핸들러 ------------------- */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 폴더가 있고, 실제 파일이 있을 때만 드롭존 표시
    if (folderId && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
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

    if (!folderId) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    await handleMultipleFileUpload(files);
  };

  /* ------------------- 다중 파일 업로드 ------------------- */
  const handleMultipleFileUpload = async (files: File[]) => {
    if (!folderId) return;

    // 파일 개수 제한
    if (files.length > 20) {
      toast({ title: "오류", description: "한 번에 최대 20개의 파일만 업로드할 수 있습니다.", duration: 3000, variant: "destructive" });
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
        await FolderService.uploadFile(Number(folderId), file);
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
      toast({ title: "성공", description: `${successCount}개의 파일이 업로드되었습니다`, duration: 3000 });
      await fetchFiles(); // 파일 목록 새로고침
    }

    if (errorCount > 0) {
      setUploadResults(results.filter(r => !r.success));
      setShowUploadResults(true);
    }

    setIsUploading(false);
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 max-w-6xl bg-black">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-black/60"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{folderName || "폴더"}</h1>
            <p className="text-gray-400">
              {files.length}개의 파일
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="파일 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/40 backdrop-blur-xl border-white/20 text-white w-64"
            />
          </div>
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              disabled={isUploading}
            />
            <Button
              className="bg-sky-500 hover:bg-sky-600 text-white"
              type="button"
              disabled={isUploading}
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  파일 업로드
                </>
              )}
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-black/60"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black/40 backdrop-blur-xl border-white/20">
              <DropdownMenuItem
                className="text-red-400 hover:bg-black/60"
                onClick={handleDeleteClick}
              >
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 파일 목록 */}
      <div
        className="relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        ref={dropZoneRef}
      >
        {/* 드래그 오버 시 드롭존 */}
        {isDragOver && (
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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Card className="p-4 border border-white/20 bg-black/40 backdrop-blur-xl">
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 mx-auto mb-2 text-sky-400 animate-spin" />
                  <p className="text-white">Loading files...</p>
                  <p className="text-sm text-gray-400">Please wait</p>
                </div>
              </div>
            </Card>
          </div>
        ) : error ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Card className="p-4 border border-white/20 bg-black/40 backdrop-blur-xl">
              <div className="flex flex-col items-center justify-center h-32">
                <div className="bg-red-500 text-red-500 rounded-full p-4 mb-4">
                  <AlertTriangle className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  오류가 발생했습니다
                </h3>
                <p className="text-red-500 mb-4">{error}</p>
                <Button
                  className="bg-sky-500 hover:bg-sky-600 text-white"
                  onClick={fetchFiles}
                >
                  다시 시도
                </Button>
              </div>
            </Card>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="p-8 border border-white/20 bg-black/40 backdrop-blur-xl max-w-md mx-auto">
              <div className="text-center">
                <div className="h-12 w-12 mx-auto mb-4 text-gray-400 flex items-center justify-center">
                  <Upload className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No files yet</h3>
                <p className="text-gray-400 mb-4">
                  Upload your first file to get started
                </p>
                <Button
                  className="bg-sky-500 hover:bg-sky-600 text-white"
                  onClick={() => fileInputRef.current?.click()}
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
              </div>
            </Card>
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
            {filteredFiles.map((file) => (
              <Card
                key={file.id}
                className="relative cursor-pointer overflow-hidden group mb-4 break-inside-avoid transition-all duration-300 border border-white/10 hover:border-sky-500/50 bg-black/40 backdrop-blur-xl hover:bg-black/60"
                onClick={() => handleImageClick(file)}
              >
                <div className="relative">
                  {file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                    <Image
                      src={file.url}
                      alt={file.name}
                      width={300}
                      height={200}
                      className="w-full h-auto object-cover"
                      sizes="(max-width: 500px) 100vw, (max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-48 bg-gray-800">
                      <File className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                  {/* 파일 삭제 버튼 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm"
                    onClick={(e) => handleFileDeleteClick(file.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-sm text-white truncate font-medium">
                      {file.name}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </Masonry>
        )}

        {/* 업로드 확인 모달 */}
        {showUploadModal && selectedFile && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">파일 업로드 확인</h3>
              <p className="text-gray-300 mb-4">
                다음 파일을 업로드하시겠습니까?<br />
                <span className="font-medium">{selectedFile.name}</span>
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="border-gray-600 text-black hover:bg-gray-700"
                  onClick={handleCancelUpload}
                >
                  취소
                </Button>
                <Button
                  className="bg-sky-500 hover:bg-sky-600 text-white"
                  onClick={handleConfirmUpload}
                >
                  업로드
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 폴더 삭제 확인 모달 */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">폴더 삭제 확인</h3>
              <p className="text-gray-300 mb-4">
                정말로 이 폴더를 삭제하시겠습니까?<br />
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="border-gray-600 text-black hover:bg-gray-700"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  취소
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleDeleteFolder}
                >
                  삭제
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 파일 삭제 확인 모달 */}
        {isFileDeleteModalOpen && deleteFileId && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">파일 삭제 확인</h3>
              <p className="text-gray-300 mb-4">
                정말로 이 파일을 삭제하시겠습니까?<br />
                <span className="font-medium text-white">
                  {files.find(f => f.id === deleteFileId)?.name}
                </span><br />
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="border-gray-600 text-black hover:bg-gray-700"
                  onClick={() => {
                    setIsFileDeleteModalOpen(false);
                    setDeleteFileId(null);
                  }}
                >
                  취소
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleDeleteFile}
                >
                  삭제
                </Button>
              </div>
            </div>
          </div>
        )}

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

      {/* 이미지 상세 모달 */}
      {showImageDetail && selectedImageFile && typeof window !== 'undefined' && createPortal(
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
              onClick={closeImageDetail}
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
              <FolderImageDetail
                file={selectedImageFile}
                folderName={folderName || undefined}
                onBack={closeImageDetail}
                onFileUpdate={handleFileUpdate}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default FolderInPage;
