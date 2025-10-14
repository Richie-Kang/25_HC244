"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import {
    X,
    Edit2,
    Check,
    Loader2,
    Download,
    FileImage,
    Calendar,
    FolderOpen,
    ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileResponse } from "./services/FolderService";

interface FolderImageDetailProps {
    file: FileResponse;
    folderName?: string;
    onBack: () => void;
    onFileUpdate?: (updatedFile: FileResponse) => void;
}

export default function FolderImageDetail({
    file,
    folderName,
    onBack,
    onFileUpdate,
}: FolderImageDetailProps) {
    // 제목 편집 관련 상태
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState(file.name || "");
    const [isRenaming, setIsRenaming] = useState(false);
    const titleInputRef = useRef<HTMLInputElement>(null);

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
        setEditTitle(file.name || "");
    };

    // 제목 저장 (실제 API 호출 없이 로컬 상태만 업데이트)
    const handleSaveTitle = async () => {
        if (!editTitle.trim()) {
            handleCancelEditTitle();
            return;
        }

        if (editTitle.trim() === file.name) {
            setIsEditingTitle(false);
            return;
        }

        try {
            setIsRenaming(true);

            // 실제 API 호출 대신 로컬 상태 업데이트
            // TODO: 실제 파일명 변경 API가 있다면 여기에 추가
            const updatedFile = { ...file, name: editTitle.trim() };

            setIsEditingTitle(false);
            toast.success("파일명이 변경되었습니다");

            // 부모 컴포넌트에 업데이트된 파일 정보 전달
            onFileUpdate?.(updatedFile);
        } catch (error) {
            console.error("파일명 변경 실패:", error);
            toast.error("파일명 변경에 실패했습니다");
            setEditTitle(file.name || "");
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

    // 다운로드 핸들러
    const handleDownload = async () => {
        if (!file.url) return;

        const imageUrl = file.url;
        const fileName = file.name || 'image';

        try {
            console.log("프록시를 통한 다운로드 시도");

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
                toast.success("다운로드가 완료되었습니다");
                return;
            } else {
                throw new Error(`다운로드 API 응답 오류: ${response.status}`);
            }
        } catch (error) {
            console.error("다운로드 실패:", error);
            toast.error("다운로드에 실패했습니다");
        }
    };

    // 파일 포맷 추출
    const getFileFormat = () => {
        return file.name.split('.').pop()?.toUpperCase() || "UNKNOWN";
    };

    // 파일 크기를 MB 단위로 포맷 (FileResponse에 size가 없으므로 표시하지 않음)
    const formatFileSize = () => {
        return "알 수 없음";
    };

    return (
        <div className="bg-black/40 backdrop-blur-xl w-full h-full max-h-[85vh] flex flex-col md:flex-row rounded-xl border border-white/20 overflow-hidden">
            {/* 왼쪽: 이미지 표시 */}
            <div className="md:w-3/5 bg-black flex items-center justify-center">
                <div className="w-full h-full flex items-center p-4">
                    <img
                        src={file.url}
                        alt={file.name || "이미지"}
                        className="w-full max-h-[70vh] object-contain rounded-lg"
                        style={{ imageRendering: "auto" }}
                    />
                </div>
            </div>

            {/* 오른쪽: 파일 정보 */}
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
                                    {file.name}
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
                    <div className="grid grid-cols-2 gap-4">
                        <InfoCard
                            label="포맷"
                            value={getFileFormat()}
                            icon={<FileImage className="h-4 w-4 text-sky-400" />}
                        />
                        <InfoCard
                            label="폴더"
                            value={folderName || "알 수 없음"}
                            icon={<FolderOpen className="h-4 w-4 text-purple-400" />}
                        />
                        <InfoCard
                            label="파일 크기"
                            value={formatFileSize()}
                            icon={
                                <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-xs">
                                    B
                                </div>
                            }
                        />
                        <InfoCard
                            label="파일 ID"
                            value={file.id.toString()}
                            icon={
                                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-xs">
                                    #
                                </div>
                            }
                        />
                    </div>

                    {/* 작업 버튼 영역 */}
                    <div className="pt-5 border-t border-white/20 grid grid-cols-1 gap-3">
                        <Button
                            onClick={handleDownload}
                            className="py-2 gap-1.5 bg-sky-500 hover:bg-sky-600 text-white"
                        >
                            <Download className="h-4 w-4" />
                            다운로드
                        </Button>
                        <Button
                            onClick={onBack}
                            className="py-2 gap-1.5 bg-white text-black hover:bg-gray-200 border-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            폴더로 돌아가기
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