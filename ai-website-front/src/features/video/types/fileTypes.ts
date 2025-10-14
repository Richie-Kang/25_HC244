// types/fileTypes.ts
export type FileItem = {
  id: string;
  name: string;
  type: "folder" | "video" | "image";
  fileUrl?: string;
  created: Date;
  children?: FileItem[];
  isLoading?: boolean;
};

export interface FileResponse {
  id: string;
  name: string;
  size: number;
  contentType: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export type FolderSidebarProps = {
  files?: FileItem[];
  onFileSelect?: (file: FileItem) => void;
  onDownload?: (file: FileItem) => void;
  onDelete?: (file: FileItem) => void;
  // VideoGenerationPage에서 구현한 콜백. +아이콘 클릭 시 호출
  onAddReferenceImage?: (file: FileItem) => void;
  activeTab?: "image" | "text";
  selectedEndpoint: string;
  quality: "standard" | "high";
  style: "realistic" | "creative";
  onEndpointChange: React.Dispatch<React.SetStateAction<string>>;
  onQualityChange: React.Dispatch<React.SetStateAction<"standard" | "high">>;
  onStyleChange: React.Dispatch<React.SetStateAction<"realistic" | "creative">>;
  className?: string;
};
