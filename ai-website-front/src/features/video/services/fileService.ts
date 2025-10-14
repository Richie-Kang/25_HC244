// services/fileService.ts
import { FileItem, FileResponse } from "../types/fileTypes";
import { mapFolderData, mapFileData } from "../videoGeneration/utils/fileUtils";
import apiClient from "@/lib/api/apiClient";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/webp"
];

function isImageFile(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase());
}

export async function fetchFoldersAPI(): Promise<FileItem[]> {
  try {
    const { data } = await apiClient.get("/my/folder");

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[정보] 폴더 목록 조회 성공: ${Array.isArray(data) ? data.length : 0}개 폴더`);
    }

    return mapFolderData(data);
  } catch (error) {
    console.error("[오류] 폴더 목록 조회 실패:", error);
    throw new Error("폴더 목록 조회에 실패했습니다.");
  }
}

export async function fetchFolderFilesAPI(folderId: string): Promise<FileItem[]> {
  try {
    const { data } = await apiClient.get(`/files/folder/${folderId}`);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[정보] 폴더(ID: ${folderId}) 파일 목록 조회 성공: ${Array.isArray(data) ? data.length : 0}개 파일`);
    }

    return mapFileData(data);
  } catch (error) {
    console.error(`[오류] 폴더(ID: ${folderId}) 파일 목록 조회 실패:`, error);
    throw new Error("파일 목록 조회에 실패했습니다.");
  }
}

export async function uploadImageAPI(image: File): Promise<FileResponse> {
  try {
    // 이미지 파일 검증
    if (!isImageFile(image)) {
      const errorMsg = "지원하지 않는 이미지 형식입니다. (지원 형식: JPG, PNG, GIF, BMP, WEBP)";
      console.error(`[오류] ${errorMsg} - 파일 타입: ${image.type}`);
      throw new Error(errorMsg);
    }

    const formData = new FormData();
    formData.append("image", image);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[정보] 이미지 업로드 시작: ${image.name} (${Math.round(image.size / 1024)}KB)`);
    }

    const { data } = await apiClient.post<FileResponse>("/files/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[정보] 이미지 업로드 성공: ${data.name}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[오류] 이미지 업로드 실패:`, error);
      throw error;
    }
    console.error("[오류] 이미지 업로드 중 알 수 없는 오류 발생:", error);
    throw new Error("이미지 업로드에 실패했습니다.");
  }
}

export async function uploadFileAPI(file: File, folderId: string): Promise<FileResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[정보] 파일 업로드 시작: ${file.name} (${Math.round(file.size / 1024)}KB), 폴더: ${folderId}`);
    }

    const { data } = await apiClient.post<FileResponse>(`/files/upload/${folderId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[정보] 파일 업로드 성공: ${data.name}`);
    }

    return data;
  } catch (error) {
    console.error(`[오류] 폴더(ID: ${folderId})에 파일 업로드 실패:`, error);
    throw new Error("파일 업로드에 실패했습니다.");
  }
}
