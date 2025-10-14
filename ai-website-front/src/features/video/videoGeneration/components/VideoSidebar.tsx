"use client";

import React, { forwardRef } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import {
  Upload,
  CheckCircle,
  Loader2,
  Film,
  Image as ImageIcon,
  Sparkles,
  Settings,
  Zap,
  Palette,
  Camera,
  Wand2,
} from "lucide-react";
import ModelSetting from "./ModelSetting";
import { SidebarFormData, useVideoSidebar } from "../hooks/useVideoSidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatioType, ResolutionType } from "../types/modelSettingTypes";
import { useToast } from "@/hooks/use-toast";

export type VideoSidebarProps = {
  onSubmit: (data: SidebarFormData) => void;
  onTabChange: (tab: "image" | "text" | "video") => void;
  referenceImageFile?: File | null;
  referenceImageUrl?: string;
  referencePrompt?: string;
  referenceModel?: string;
  onNotifyProcessing?: (notification: { title: string; thumbnailUrl: string }) => Promise<unknown> | void;
  isLoading?: boolean;
  isDragOver?: boolean;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
};

const VideoSidebar = forwardRef<HTMLDivElement, VideoSidebarProps>((props, ref) => {
  const {
    onSubmit,
    onTabChange,
    referenceImageFile,
    referenceImageUrl,
    referencePrompt,
    referenceModel,
    onNotifyProcessing,
    isLoading,
    isDragOver,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
  } = props;

  const {
    prompt,
    setPrompt,
    previewUrl,
    activeTab,
    aspectRatio,
    duration,
    endpoint,
    imageChanged,
    seed,
    resolution,
    numFrames,
    numInferenceSteps,
    framesPerSecond,
    enablePromptExpansion,
    negativePrompt,
    pixverseStyle,
    updateSettings,
    handleSubmit,
    handleImageChange,
    handleTabSelection,
    selectImage,
    removeImage,
    fileInputRef,
    isPromptLoading,
    updatePromptWithGemini,
  } = useVideoSidebar({
    onSubmit,
    onTabChange,
    referenceImageFile,
    referenceImageUrl,
    referencePrompt,
    referenceModel,
    onNotifyProcessing,
  });

  const { toast } = useToast();

  return (
    <div
      ref={ref}
      className="w-[400px] h-full bg-black/90 backdrop-blur-xl border-r border-white/20 flex flex-col overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)] z-10 relative"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* 드래그 오버 시 드롭존 오버레이 */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-sky-500/20 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-sky-400">
          <div className="text-center p-8">
            <div className="bg-sky-500/20 rounded-full p-6 mx-auto mb-4 w-fit">
              <Sparkles className="h-12 w-12 text-sky-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              참조 이미지로 설정
            </h3>
            <p className="text-gray-300">
              이미지를 여기에 드롭하세요
            </p>
          </div>
        </div>
      )}
      <ScrollArea className="flex-1 [&_.simplebar-scrollbar]:bg-black [&_.simplebar-scrollbar]:hover:bg-black/80 [&_.simplebar-scrollbar]:before:bg-black [&_.simplebar-scrollbar]:before:hover:bg-black/80 [&_.simplebar-scrollbar]:w-1 [&_.simplebar-scrollbar]:rounded-full">
        <div className="p-6">
          {/* 탭 선택 영역 */}
          <div className="mb-6">
            <Tabs
              value={activeTab}
              onValueChange={() => { }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-transparent">
                <TabsTrigger
                  value="image"
                  onClick={() => handleTabSelection("image")}
                  className={`flex items-center justify-center py-2 px-4 hover:text-white/70 data-[state=active]:bg-transparent transition-all relative after:absolute after:bottom-0 after:left-1/2 after:right-1/2 after:h-0.5 after:bg-sky-500 data-[state=active]:after:left-0 data-[state=active]:after:right-0 after:transition-all after:duration-300 ${activeTab === "image" ? "!font-bold !text-sky-400 data-[state=active]:!text-sky-400" : "text-white/70"}`}
                >
                  IMAGE
                </TabsTrigger>
                <TabsTrigger
                  value="video"
                  onClick={e => {
                    e.preventDefault();
                    toast({
                      title: "VIDEO 모드",
                      description: "곧 업데이트 예정입니다!",
                      duration: 3000,
                    });
                  }}
                  className={`flex items-center justify-center py-2 px-4 hover:text-white/70 data-[state=active]:bg-transparent transition-all relative after:absolute after:bottom-0 after:left-1/2 after:right-1/2 after:h-0.5 after:bg-sky-500 data-[state=active]:after:left-0 data-[state=active]:after:right-0 after:transition-all after:duration-300 ${activeTab === "video" ? "!font-bold !text-sky-400 data-[state=active]:!text-sky-400" : "text-white/70"}`}
                >
                  VIDEO
                </TabsTrigger>
                <TabsTrigger
                  value="text"
                  onClick={e => {
                    e.preventDefault();
                    toast({
                      title: "TEXT 모드",
                      description: "곧 업데이트 예정입니다!",
                      duration: 3000,
                    });
                  }}
                  className={`flex items-center justify-center py-2 px-4 hover:text-white/70 data-[state=active]:bg-transparent transition-all relative after:absolute after:bottom-0 after:left-1/2 after:right-1/2 after:h-0.5 after:bg-sky-500 data-[state=active]:after:left-0 data-[state=active]:after:right-0 after:transition-all after:duration-300 ${activeTab === "text" ? "!font-bold !text-sky-400 data-[state=active]:!text-sky-400" : "text-white/70"}`}
                >
                  TEXT
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" id="video-form">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white block">
                프롬프트
              </label>
              <textarea
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={[
                  "동작: 어떻게 움직이는지",
                  "스타일: 원하는 영상 스타일",
                  "카메라: 카메라 움직임 (선택)",
                  "분위기: 원하는 무드 (선택)"
                ].join('\n')}
                rows={6}
                className="w-full rounded-lg border border-white/20 bg-black/30 backdrop-blur-md p-3 text-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 focus:outline-none resize-y transition-colors placeholder:text-gray-400 text-white"
              />
              <p className="text-xs text-gray-400">
                각 요소를 상세하게 설명할수록 더 좋은 결과가 나옵니다
              </p>
            </div>

            {activeTab === "image" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white">
                    참조 이미지
                  </label>
                  {imageChanged && (
                    <span className="text-sky-500 text-xs flex items-center animate-pulse">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      변경됨
                    </span>
                  )}
                </div>

                {previewUrl ? (
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <div
                        className={`relative w-full h-48 border rounded-lg overflow-hidden cursor-pointer transition-all duration-300 group ${imageChanged
                          ? "ring-2 ring-sky-500 shadow-lg border-sky-500/50"
                          : "border-white/20 hover:border-sky-500/50"
                          }`}
                      >
                        <Image
                          src={previewUrl}
                          alt="참조 이미지"
                          fill
                          className="object-contain"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs font-medium px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
                            우클릭하여 메뉴 열기
                          </p>
                        </div>
                        {imageChanged && (
                          <div className="absolute top-2 right-2 bg-sky-500 text-white text-xs rounded-full p-1">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-40 bg-black/80 backdrop-blur-md border border-white/10">
                      <ContextMenuItem onClick={selectImage} className="gap-2 text-white hover:bg-white/10">
                        <ImageIcon className="h-4 w-4" />
                        이미지 변경
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={removeImage}
                        className="gap-2 text-red-400 hover:bg-white/10"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        이미지 삭제
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ) : (
                  <div
                    className="w-full h-48 border border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors border-white/20 hover:border-sky-500/50 group"
                    onClick={selectImage}
                  >
                    <div className="w-16 h-16 rounded-full bg-sky-500/20 backdrop-blur-md flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="h-7 w-7 text-sky-500" />
                    </div>
                    <p className="text-sm font-medium text-white mb-1">
                      이미지 추가하기
                    </p>
                    <p className="text-xs text-gray-400">
                      클릭하여 이미지 선택
                    </p>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={updatePromptWithGemini}
                  disabled={!previewUrl || isPromptLoading}
                  className={`w-full mt-2 py-2 transition-all duration-300 border flex items-center justify-center gap-2 ${previewUrl
                    ? "bg-sky-500/20 hover:bg-sky-500/30 text-white border-white/10 hover:border-sky-500/50"
                    : "bg-black/30 text-gray-400 border-white/10 cursor-not-allowed"
                    }`}
                >
                  {isPromptLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>프롬프트 수정 중...</span>
                    </>
                  ) : (
                    <span>이미지에 맞게 프롬프트 변경</span>
                  )}
                </Button>
                <p className="text-xs text-amber-500/80 mt-1.5">
                  이미지와 프롬프트가 어울리지 않을 경우, 전체 문장이 이미지 중심으로 조정될 수 있습니다.
                </p>
              </div>
            )}

            {activeTab === "video" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white">
                    참조 비디오
                  </label>
                  {imageChanged && (
                    <span className="text-sky-500 text-xs flex items-center animate-pulse">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      변경됨
                    </span>
                  )}
                </div>

                <div
                  className="w-full h-48 border border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors border-white/20 hover:border-sky-500/50 group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 rounded-full bg-sky-500/20 backdrop-blur-md flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Film className="h-7 w-7 text-sky-500" />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">
                    비디오 추가하기
                  </p>
                </div>

                <input
                  type="file"
                  accept="video/*"
                  onChange={handleImageChange}
                  className="hidden"
                  ref={fileInputRef}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-white block">
                AI 모델 선택
              </label>
              <Select
                value={endpoint}
                onValueChange={(value) => updateSettings({ endpoint: value })}
              >
                <SelectTrigger className="w-full rounded-lg border border-white/20 bg-black/30 backdrop-blur-md p-2.5 text-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 focus:outline-none text-white hover:border-sky-400/50 transition-colors">
                  <SelectValue placeholder="AI 모델을 선택하세요">
                    {endpoint === "auto" && "Auto-Select"}
                    {endpoint === "kling" && "KLING"}
                    {endpoint === "wan" && "WAN"}
                    {endpoint === "veo2" && "VEO2"}
                    {endpoint === "pixverse" && "PIXVERSE"}
                    {endpoint === "hunyuan" && "HUNYUAN"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl z-50 min-w-[280px]">
                  <SelectItem
                    value="auto"
                    className="text-white hover:bg-sky-500/20 focus:bg-sky-500/20 border-b border-white/10 p-2 cursor-pointer"
                  >
                    <div className="flex flex-col items-start text-left w-full">
                      <div className="font-medium text-white">Auto-Select</div>
                      <div className="text-xs text-gray-400 mt-0.5">AI가 최적의 모델을 자동 선택</div>
                    </div>
                  </SelectItem>
                  {activeTab === "image" ? (
                    <>
                      <SelectItem
                        value="kling"
                        className="text-white hover:bg-white/10 focus:bg-white/10 border-b border-white/10 p-2 cursor-pointer"
                      >
                        <div className="flex flex-col items-start text-left w-full">
                          <div className="font-medium text-white">KLING</div>
                          <div className="text-xs text-gray-400 mt-0.5">고품질 비디오 생성 전문</div>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="wan"
                        className="text-white hover:bg-white/10 focus:bg-white/10 border-b border-white/10 p-2 cursor-pointer"
                      >
                        <div className="flex flex-col items-start text-left w-full">
                          <div className="font-medium text-white">WAN</div>
                          <div className="text-xs text-gray-400 mt-0.5">빠른 속도와 안정성</div>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="veo2"
                        className="text-white hover:bg-white/10 focus:bg-white/10 border-b border-white/10 p-2 cursor-pointer"
                      >
                        <div className="flex flex-col items-start text-left w-full">
                          <div className="font-medium text-white">VEO2</div>
                          <div className="text-xs text-gray-400 mt-0.5">구글의 차세대 비디오 모델</div>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="pixverse"
                        className="text-white hover:bg-white/10 focus:bg-white/10 p-2 cursor-pointer"
                      >
                        <div className="flex flex-col items-start text-left w-full">
                          <div className="font-medium text-white">PIXVERSE</div>
                          <div className="text-xs text-gray-400 mt-0.5">창의적 스타일과 애니메이션</div>
                        </div>
                      </SelectItem>
                    </>
                  ) : activeTab === "video" ? (
                    <>
                      <SelectItem
                        value="hunyuan"
                        className="text-white hover:bg-white/10 focus:bg-white/10 p-2 cursor-pointer"
                      >
                        <div className="flex flex-col items-start text-left w-full">
                          <div className="font-medium text-white">HUNYUAN</div>
                          <div className="text-xs text-gray-400 mt-0.5">현실과 가상 스타일 자유 전환</div>
                        </div>
                      </SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem
                        value="veo2"
                        className="text-white hover:bg-white/10 focus:bg-white/10 p-2 cursor-pointer"
                      >
                        <div className="flex flex-col items-start text-left w-full">
                          <div className="font-medium text-white">VEO2</div>
                          <div className="text-xs text-gray-400 mt-0.5">구글의 차세대 비디오 모델</div>
                        </div>
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>

              {/* Auto-Select 가이드 */}
              {endpoint === "auto" && (
                <div className="mt-2 p-3 bg-sky-500/10 border border-sky-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-sky-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-xs text-sky-300">
                      <p className="font-medium mb-1">🎯 스마트 모델 선택 모드</p>
                      <ul className="space-y-1 text-sky-300/80">
                        <li>• 프롬프트와 참조 이미지를 AI가 분석</li>
                        <li>• 최적의 모델과 세부 설정을 자동 선택</li>
                        <li>• 모델 선택의 부담 없이 최고의 결과 획득</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 모델 설정 컴포넌트 */}
            {endpoint !== "auto" && (
              <div className="border border-white/10 rounded-lg p-4 bg-black/30 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <h3 className="text-sm font-medium text-white mb-3 flex items-center">
                  <svg
                    className="h-4 w-4 mr-1.5 text-sky-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  모델 세부 설정
                </h3>
                <ModelSetting
                  endpoint={endpoint}
                  mode={activeTab}
                  updateSettings={updateSettings}
                  currentSettings={{
                    aspectRatio: aspectRatio as AspectRatioType,
                    duration: endpoint === "pixverse" ? duration.replace('s', '') as "5" | "8" : duration,
                    resolution: resolution as ResolutionType,
                    seed,
                    ...(endpoint === "pixverse" && {
                      style: pixverseStyle || "anime",
                      negative_prompt: negativePrompt,
                    }),
                  }}
                />
              </div>
            )}

          </form>
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-white/10 bg-black/30 backdrop-blur-md">
        <Button
          type="submit"
          form="video-form"
          className="w-full py-3 bg-sky-500/30 backdrop-blur-md hover:bg-sky-500/40 text-white transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/20 hover:border-sky-500/50 hover:scale-[1.02] font-medium text-base relative"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>영상 생성 중...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Film className="mr-2 h-5 w-5" />
              <span>영상 생성하기</span>
              <span className="absolute right-3 text-sm text-red-400">-10 크레딧</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
});

VideoSidebar.displayName = "VideoSidebar";

export default VideoSidebar;
