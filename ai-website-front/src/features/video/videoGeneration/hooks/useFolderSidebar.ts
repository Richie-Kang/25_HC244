// hooks/useFolderSidebar.ts
import { useState, useEffect } from "react";
import { FileItem } from "../../types/fileTypes";
import { toast } from "react-hot-toast";
import { FolderService } from "@/features/folder/services/FolderService";
import type { FolderResponse } from "@/features/folder/services/FolderService";

export function useFolderSidebar() {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("myFolder");

  // 폴더 목록 조회 - FolderService의 getFolders 함수 사용
  const fetchFolders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // FolderService의 getFolders 함수 사용
      const folders = await FolderService.getFolders();

      // FolderService에서 반환하는 Folder[] 타입을 FileItem[] 타입으로 변환
      const formattedData: FileItem[] = folders.map((folder: FolderResponse) => ({
        id: folder.id.toString(),
        name: folder.name || "이름 없는 폴더",
        type: "folder",
        created: new Date(), // createdAt 대신 created 사용, Date 객체 사용
        children: [] // 초기에는 빈 배열로 설정 (폴더 확장 시 로드)
      }));

      setFiles(formattedData);
    } catch (error) {
      console.error("폴더 로딩 오류:", error);
      setError(error instanceof Error ? error.message : String(error));
      toast.error("폴더 목록을 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  // 특정 폴더의 파일 목록 조회 - FolderService의 getFilesByFolder 함수 사용
  const fetchFolderFiles = async (folderId: string) => {
    const folder = files.find((f) => f.id === folderId);
    if (folder && folder.children && folder.children.length > 0) {
      return; // 이미 로드된 폴더는 다시 로드하지 않음
    }

    setLoadingFolders((prev) => new Set(prev).add(folderId));

    try {
      // FolderService의 getFilesByFolder 함수 사용 (문자열 ID를 숫자로 변환)
      const folderItems = await FolderService.getFilesByFolder(parseInt(folderId, 10));

      // FolderService에서 반환하는 FileResponse[] 타입을 FileItem[] 타입으로 변환
      const fileItems = folderItems.map((file) => {
        const fileName = file.name || "이름 없는 파일";
        const fileExt = fileName.split(".").pop()?.toLowerCase() || "";
        const fileType = ["mp4", "mov", "avi", "wmv", "webm"].includes(fileExt)
          ? "video"
          : ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileExt)
            ? "image"
            : "video";

        return {
          id: file.id.toString(),
          name: fileName,
          type: fileType as "video" | "image",
          fileUrl: file.url,
          created: new Date(), // createdAt 필드가 없으므로 현재 시간으로 설정
        };
      });

      // 폴더 상태 업데이트
      setFiles((prevFiles) =>
        prevFiles.map((folder) =>
          folder.id === folderId ? { ...folder, children: fileItems } : folder
        )
      );
    } catch (error) {
      console.error(`폴더 ID: ${folderId} 파일 목록 로딩 오류:`, error);
      toast.error("파일 목록을 불러오는데 실패했습니다");
    } finally {
      setLoadingFolders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(folderId);
        return newSet;
      });
    }
  };

  // 폴더 확장/축소
  const toggleFolder = async (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
      await fetchFolderFiles(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  return {
    expandedFolders,
    files,
    isLoading,
    error,
    loadingFolders,
    selectedImageId,
    setSelectedImageId,
    activeTab,
    setActiveTab,
    fetchFolders,
    fetchFolderFiles,
    toggleFolder,
  };
}
