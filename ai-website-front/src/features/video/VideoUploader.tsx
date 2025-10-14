"use client";
import React, { useState } from "react";
import { saveVideo } from './services/MyVideoService';
import { VideoCreateRequest } from './types/Video';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const VideoUploader = () => {
  const [aiVideo, setAiVideo] = useState<File | null>(null);
  const [aiVideoName, setAiVideoName] = useState("");
  const [modeFile, setModeFile] = useState<File | null>(null); // 추가 파일 (이미지/영상)
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("veo2"); // 기본 모델 설정
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // 비디오 파일 타입 확인
      if (selectedFile.type.startsWith("video/")) {
        setAiVideo(selectedFile);
      } else {
        alert("비디오 파일만 업로드할 수 있습니다.");
      }
    }
  };

  const handleModeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setModeFile(e.target.files[0]);
    }
  };

  const handleVideoNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAiVideoName(e.target.value);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
  };

  const handleUpload = async () => {
    if (!aiVideo || !aiVideoName || !prompt) {
      alert("영상 파일, 영상 이름, 프롬프트를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setShowAlert(true);
    try {
      const videoRequest: VideoCreateRequest = {
        videoName: aiVideoName,
        prompt: prompt,
        endpoint: model,
        model: model,
        videoUrl: URL.createObjectURL(aiVideo)
      };

      const result = await saveVideo(videoRequest, aiVideo, modeFile || undefined);
      alert("영상 업로드 성공");
      setAiVideo(null);
      setAiVideoName("");
      setPrompt("");
      setModeFile(null);
      setShowAlert(false);
      console.log("저장된 영상 정보:", result);
    } catch (error) {
      if (error instanceof Error) {
        alert(`업로드 실패: ${error.message}`);
      } else {
        alert("알 수 없는 에러가 발생했습니다.");
      }
      console.error("업로드 중 에러 발생:", error);
      setShowAlert(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded relative">
      {showAlert && (
        <Alert className="mb-4">
          <AlertTitle>영상 생성 시작</AlertTitle>
          <AlertDescription>
            영상이 생성되면 알림으로 알려드리겠습니다. 잠시만 기다려주세요.
          </AlertDescription>
        </Alert>
      )}
      {/* 로딩 팝업 */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-center text-lg font-semibold">업로드 중...</p>
            <div className="mt-4 flex justify-center">
              <div className="loader w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">영상 파일</label>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
          className="block w-full"
        />
        {aiVideo && (
          <p className="mt-1 text-sm text-gray-500">
            선택된 파일: {aiVideo.name}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          추가 파일 (선택사항)
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleModeFileChange}
          className="block w-full"
        />
        {modeFile && (
          <p className="mt-1 text-sm text-gray-500">
            선택된 파일: {modeFile.name}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">영상 이름</label>
        <input
          type="text"
          value={aiVideoName}
          onChange={handleVideoNameChange}
          className="block w-full border rounded p-2"
          placeholder="영상 이름을 입력하세요"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">모델</label>
        <select
          value={model}
          onChange={handleModelChange}
          className="block w-full border rounded p-2"
        >
          <option value="veo2">Veo2</option>
          <option value="luna">Luna</option>
          <option value="kling">Kling</option>
          <option value="wan">Wan</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">프롬프트</label>
        <textarea
          value={prompt}
          onChange={handlePromptChange}
          className="block w-full border rounded p-2 h-32"
          placeholder="영상 생성에 사용된 프롬프트를 입력하세요"
        />
      </div>

      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        업로드
      </button>
    </div>
  );
};

export default VideoUploader;
