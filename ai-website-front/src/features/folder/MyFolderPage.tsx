"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Folder,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import { FolderService, FolderResponse } from "./services/FolderService";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/common/PageContainer";

const MyFolderPage = () => {
  const [folders, setFolders] = useState<FolderResponse[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 1) 마운트 시 폴더 목록 불러오기
  useEffect(() => {
    fetchFolders();
  }, []);

  // 2) 폴더 목록 조회 API - FolderService 사용
  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // FolderService의 getFolders 함수 호출
      const data = await FolderService.getFolders();
      setFolders(data);
    } catch (error) {
      console.error("폴더 로딩 오류:", error);
      setError(
        (error as Error).message || "폴더 목록을 불러오는데 실패했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 3) 폴더 생성 - FolderService 사용
  const createFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("폴더 이름을 입력해주세요");
      return;
    }

    try {
      await FolderService.createFolder({ name: newFolderName });
      await fetchFolders();
      toast.success("폴더가 생성되었습니다");
      setIsCreateFolderOpen(false);
      setNewFolderName("");
    } catch (err) {
      console.error(err);
      toast.error("폴더 생성에 실패했습니다");
    }
  };

  // 폴더 생성 취소
  const cancelCreateFolder = () => {
    setIsCreateFolderOpen(false);
    setNewFolderName("");
  };

  // 4) 폴더 삭제 - FolderService 사용
  const deleteFolder = async (folderId: number) => {
    try {
      const result = await FolderService.deleteFolder(folderId);
      if (result.success) {
        setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
        toast.success("폴더가 삭제되었습니다");
      } else {
        toast.error(result.message || "폴더 삭제에 실패했습니다");
      }
    } catch (error) {
      console.error("폴더 삭제 오류:", error);
      toast.error("폴더 삭제에 실패했습니다");
    }
  };

  const handleFolderClick = (folderId: number, folderName: string) => {
    router.push(`/my/folder/in?folderId=${folderId}&folderName=${encodeURIComponent(folderName)}`);
  };

  const createFolderButton = (
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
            <Label htmlFor="folderName" className="text-white">폴더 이름</Label>
            <Input
              id="folderName"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="mt-1 bg-black/40 backdrop-blur-xl border-white/20 text-white"
              placeholder="폴더 이름을 입력하세요"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30"
              onClick={cancelCreateFolder}
            >
              취소
            </Button>
            <Button
              className="bg-sky-500 hover:bg-sky-600 text-white"
              onClick={createFolder}
            >
              만들기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <div className="bg-red-500/20 text-red-400 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            오류가 발생했습니다
          </h3>
          <p className="text-red-400 mb-4">{error}</p>
          <Button
            className="bg-sky-500 hover:bg-sky-600 text-white"
            onClick={() => window.location.reload()}
          >
            다시 시도
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="내 폴더"
      description="작업물을 폴더로 관리하세요"
      action={createFolderButton}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {folders.map((folder) => (
          <Card
            key={folder.id}
            className="p-4 border border-white/20 bg-black/40 backdrop-blur-xl hover:border-white/30 transition-all duration-300 cursor-pointer"
            onClick={() => handleFolderClick(folder.id, folder.name)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Folder className="h-6 w-6 text-sky-400" />
                <div>
                  <h3 className="font-medium text-white">{folder.name}</h3>

                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-black/60"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/40 backdrop-blur-xl border-white/20">
                  <DropdownMenuItem
                    className="text-red-400 hover:bg-black/60"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFolder(folder.id);
                    }}
                  >
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};

export default MyFolderPage;
