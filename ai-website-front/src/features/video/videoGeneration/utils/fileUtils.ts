// utils/fileUtils.ts
import { FileItem } from "../../types/fileTypes";

export function mapFileData(data: unknown): FileItem[] {
  return Array.isArray(data)
    ? data.map((file) => {
      const fileName = file.fileName || file.name || "이름 없는 파일";
      const fileExt = fileName.split(".").pop()?.toLowerCase() || "";
      const fileType = ["mp4", "mov", "avi", "wmv", "webm"].includes(fileExt)
        ? "video"
        : ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileExt)
          ? "image"
          : "video";
      return {
        id: file.id?.toString() || `file-${Math.random()}`,
        name: fileName,
        type: fileType as "video" | "image",
        fileUrl: file.fileUrl,
        created: new Date(file.createdAt || Date.now()),
      };
    })
    : [];
}

export function mapFolderData(data: unknown): FileItem[] {
  return Array.isArray(data)
    ? data.map((folder) => ({
      id: folder.id?.toString() || `folder-${Math.random()}`,
      name: folder.name || "이름 없는 폴더",
      type: "folder",
      created: new Date(folder.createdAt || Date.now()),
      children: Array.isArray(folder.files)
        ? mapFileData(folder.files)
        : [],
    }))
    : [];
}
