"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadImageAPI } from "../../services/fileService";
import { GenerationNotificationService } from '@/features/admin/services/GenerationNotificationService';
import { AspectRatioType, DurationType } from "../types/modelSettingTypes";
import { FileResponse } from "../../types/fileTypes";

export type SidebarFormData = {
  prompt: string;
  imageFile: File | null;
  aspectRatio: AspectRatioType;
  duration: DurationType;
  endpoint: string;
  quality: "standard" | "high";
  style: "realistic" | "creative" | "anime" | "3d_animation" | "clay" | "comic" | "cyberpunk";
  fileUrl?: string;
  cameraControl?: string;
  advancedCameraControl?: boolean;
  seed?: number;
  resolution?: string;
  numFrames?: number;
  framesPerSecond?: number;
  numInferenceSteps?: number;
  enableSafetyChecker?: boolean;
  enablePromptExpansion?: boolean;
  negative_prompt?: string;
  autoSelectNotificationId?: number | null;
};

// updateSettings 함수의 파라미터 타입을 정의
interface SettingsUpdate {
  endpoint?: string;
  aspectRatio?: AspectRatioType;
  duration?: DurationType | "5" | "8";
  cameraControl?: string;
  seed?: number;
  resolution?: string;
  numFrames?: number;
  framesPerSecond?: number;
  numInferenceSteps?: number;
  enableSafetyChecker?: boolean;
  enablePromptExpansion?: boolean;
  negative_prompt?: string;
  style?: "anime" | "3d_animation" | "clay" | "comic" | "cyberpunk";
}

export interface UseVideoSidebarProps {
  onSubmit: (data: SidebarFormData) => void;
  onTabChange: (tab: "image" | "text" | "video") => void;
  referenceImageFile?: File | null;
  referenceImageUrl?: string;
  referencePrompt?: string;
  referenceModel?: string;
  onNotifyProcessing?: (notification: { title: string; thumbnailUrl: string }) => Promise<unknown> | void;
}

export function useVideoSidebar({
  onSubmit,
  onTabChange,
  referenceImageFile,
  referenceImageUrl,
  referencePrompt,
  referenceModel,
  onNotifyProcessing,
}: UseVideoSidebarProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"image" | "text" | "video">("image");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("16:9");
  const [duration, setDuration] = useState<DurationType>("5s");
  const [endpoint, setEndpoint] = useState(
    referenceModel || "auto"
  );
  const quality: "standard" | "high" = "standard";
  const [style, setStyle] = useState<"realistic" | "creative" | "anime" | "3d_animation" | "clay" | "comic" | "cyberpunk">("realistic");
  const [imageChanged, setImageChanged] = useState(false);
  const [cameraControl, setCameraControl] = useState<string>("down_back");
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [resolution, setResolution] = useState<string>("720p");
  const [numFrames, setNumFrames] = useState<number>(129);
  const [framesPerSecond, setFramesPerSecond] = useState<number>(16);
  const [numInferenceSteps, setNumInferenceSteps] = useState<number>(30);
  const [enableSafetyChecker, setEnableSafetyChecker] = useState<boolean>(true);
  const [enablePromptExpansion, setEnablePromptExpansion] = useState<boolean>(true);
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [pixverseStyle, setPixverseStyle] = useState<"anime" | "3d_animation" | "clay" | "comic" | "cyberpunk" | "">("anime");

  // Auto-Select 모드에서 생성된 알림 ID 저장
  const [autoSelectNotificationId, setAutoSelectNotificationId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 상위에서 전달받은 참조 프롬프트와 모델 반영
  useEffect(() => {
    if (referencePrompt) {
      setPrompt(referencePrompt);
    }
    if (referenceModel) {
      setEndpoint(referenceModel);
      // referenceModel이 "hunyuan"이면 video 탭으로 전환, 그렇지 않으면 image 탭으로 전환
      if (referenceModel === "hunyuan") {
        setActiveTab("video");
        onTabChange("video");
      } else {
        setActiveTab("image");
        onTabChange("image");
      }
    }
  }, [referencePrompt, referenceModel, onTabChange]);

  // 상위에서 referenceImageFile 또는 referenceImageUrl이 변경되면 상태에 반영
  useEffect(() => {
    const timerId: NodeJS.Timeout = setTimeout(() => setImageChanged(false), 3000);
    if (referenceImageFile || referenceImageUrl) {
      if (referenceImageFile) {
        setImageFile(referenceImageFile);
        const objectURL = URL.createObjectURL(referenceImageFile);
        setPreviewUrl(objectURL);
        setFileUrl("");
      } else if (referenceImageUrl) {
        setImageFile(null);
        setPreviewUrl(referenceImageUrl);
        setFileUrl(referenceImageUrl);
      }
      setImageChanged(true);
      return () => clearTimeout(timerId);
    }
  }, [referenceImageFile, referenceImageUrl]);

  // 초기 duration 설정 (한 번만 실행)
  useEffect(() => {
    setDuration("5s"); // 초기값만 설정
  }, []); // 빈 의존성 배열로 한 번만 실행

  // endpoint 또는 activeTab이 변경될 때 aspectRatio 기본값 조정 (duration은 제외)
  useEffect(() => {
    let defaultAspectRatio: AspectRatioType = "16:9";

    if (activeTab === "image") {
      switch (endpoint) {
        case "veo2":
          defaultAspectRatio = "9:16"; // Veo2 이미지 모드 기본 비율
          break;
        case "kling":
          defaultAspectRatio = "16:9"; // Kling 이미지 모드 기본 비율 (예시)
          break;
        case "pixverse":
          defaultAspectRatio = "16:9"; // Pixverse 기본 비율
          // Pixverse 기본 스타일을 항상 "anime"로 설정
          setPixverseStyle("anime");
          break;
        // 다른 이미지 모델에 대한 기본값 추가
      }
    } else if (activeTab === "text") {
      switch (endpoint) {
        case "veo2":
          defaultAspectRatio = "16:9"; // Veo2 텍스트 모드 기본 비율 (예시)
          break;
        // 다른 텍스트 모델에 대한 기본값 추가
      }
    } else if (activeTab === "video") {
      // 비디오 탭 모델에 대한 기본값 (예: hunyuan)
      switch (endpoint) {
        case "hunyuan":
          defaultAspectRatio = "16:9";
          break;
      }
    }

    // aspectRatio는 항상 업데이트하지만, duration은 사용자가 변경한 적이 없을 때만 기본값으로 설정
    setAspectRatio(defaultAspectRatio);
  }, [endpoint, activeTab]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setFileUrl("");
    setImageChanged(true);
    setTimeout(() => setImageChanged(false), 3000);
  };

  const updateSettings = (settings: SettingsUpdate) => {
    console.log('[updateSettings] 호출됨:', settings);
    if (settings.endpoint !== undefined) {
      setEndpoint(settings.endpoint);
      // endpoint가 pixverse로 변경될 때 기본 스타일 설정
      if (settings.endpoint === "pixverse" && !pixverseStyle) {
        setPixverseStyle("anime");
      }
    }
    if (settings.aspectRatio !== undefined) setAspectRatio(settings.aspectRatio);
    if (settings.duration !== undefined) {
      // Pixverse duration 값을 DurationType으로 변환
      if (settings.duration === "5") {
        setDuration("5s");
      } else if (settings.duration === "8") {
        setDuration("8s");
      } else {
        setDuration(settings.duration as DurationType);
      }
    }
    if (settings.cameraControl !== undefined) setCameraControl(settings.cameraControl);
    if (settings.seed !== undefined) setSeed(settings.seed);
    if (settings.resolution !== undefined) setResolution(settings.resolution);
    if (settings.numFrames !== undefined) setNumFrames(settings.numFrames);
    if (settings.framesPerSecond !== undefined) setFramesPerSecond(settings.framesPerSecond);
    if (settings.numInferenceSteps !== undefined) setNumInferenceSteps(settings.numInferenceSteps);
    if (settings.enableSafetyChecker !== undefined) setEnableSafetyChecker(settings.enableSafetyChecker);
    if (settings.enablePromptExpansion !== undefined) setEnablePromptExpansion(settings.enablePromptExpansion);
    if (settings.negative_prompt !== undefined) setNegativePrompt(settings.negative_prompt);
    if (settings.style !== undefined) {
      console.log('[updateSettings] style 변경:', settings.style, '현재 pixverseStyle:', pixverseStyle);
      setPixverseStyle(settings.style);
      setStyle(settings.style); // 일반 style 상태도 업데이트
    }
  };

  // 더 이상 ref를 사용하지 않고 직접 상태 변수 사용

  // 폼 제출 핸들러 (업스케일링 옵션은 제거됨)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-Select 모드일 때 모델 추천 받기
    if (endpoint === "auto") {
      if (!previewUrl && !fileUrl) {
        toast({
          title: "이미지 필요",
          description: "Auto-Select 모드를 사용하려면 참조 이미지가 필요합니다.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // 즉시 실제 영상 생성 알림 생성 (onNotifyProcessing 콜백 호출)
      if (onNotifyProcessing) {
        try {
          console.log('[Auto-Select] 알림 생성 중...');
          // 영상 생성 알림 생성 신호 전송
          const createdNotification = await onNotifyProcessing({
            title: `영상 생성 (${new Date().toLocaleTimeString()})`,
            thumbnailUrl: fileUrl || previewUrl || '',
          });

          // 생성된 알림 ID 저장
          if (createdNotification && typeof createdNotification === 'object' && 'id' in createdNotification) {
            const notificationId = (createdNotification as { id: number }).id;
            setAutoSelectNotificationId(notificationId);
            console.log('[Auto-Select] 알림 생성 완료, ID:', notificationId);
          } else {
            console.warn('[Auto-Select] 알림 생성은 완료되었지만 ID를 찾을 수 없음:', createdNotification);
          }
        } catch (error) {
          console.error('[Auto-Select] 알림 생성 실패:', error);
        }
      } else {
        console.warn('[Auto-Select] onNotifyProcessing 콜백이 없습니다');
      }

      // 즉시 알림 생성 (토스트)
      toast({
        title: "비디오 생성 시작",
        description: "비디오 생성이 시작되었습니다. 완료되면 알림을 보내드립니다.",
        duration: 5000,
      });

      // 알림 벨 이벤트 트리거 (즉시 실행)
      setTimeout(() => {
        console.log('[Auto-Select] 알림 벨 이벤트 트리거');
        window.dispatchEvent(new CustomEvent('open-notification-bell'));
      }, 1000);

      try {
        toast({
          title: "모델 분석 중",
          description: "AI가 최적의 모델과 설정을 분석하고 있습니다...",
          duration: 3000,
        });

        const imageUrl = fileUrl || previewUrl;
        const response = await fetch('/internal/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: imageUrl,
            existingPrompt: prompt,
            mode: 'model-recommendation'
          }),
        });

        if (!response.ok) {
          throw new Error('모델 추천 API 호출 실패');
        }

        const recommendation = await response.json();

        if (recommendation.model && recommendation.settings) {
          // UI의 endpoint는 "auto"로 유지하고, 추천된 설정만 내부적으로 적용
          // setEndpoint(recommendation.model); // 이 줄을 제거하여 UI 변경 방지

          // 추천된 설정들을 내부 상태에 적용 (UI에는 반영되지 않음)
          if (recommendation.settings.aspectRatio) setAspectRatio(recommendation.settings.aspectRatio);
          if (recommendation.settings.duration) {
            // duration 값 변환 처리
            const durationValue = recommendation.settings.duration;
            if (durationValue === "5" || durationValue === "8") {
              setDuration(`${durationValue}s` as DurationType);
            } else {
              setDuration(durationValue);
            }
          }
          if (recommendation.settings.cameraControl) setCameraControl(recommendation.settings.cameraControl);
          if (recommendation.settings.seed !== undefined) setSeed(recommendation.settings.seed);
          if (recommendation.settings.resolution) setResolution(recommendation.settings.resolution);
          if (recommendation.settings.numFrames !== undefined) setNumFrames(recommendation.settings.numFrames);
          if (recommendation.settings.framesPerSecond !== undefined) setFramesPerSecond(recommendation.settings.framesPerSecond);
          if (recommendation.settings.numInferenceSteps !== undefined) setNumInferenceSteps(recommendation.settings.numInferenceSteps);
          if (recommendation.settings.enableSafetyChecker !== undefined) setEnableSafetyChecker(recommendation.settings.enableSafetyChecker);
          if (recommendation.settings.enablePromptExpansion !== undefined) setEnablePromptExpansion(recommendation.settings.enablePromptExpansion);
          if (recommendation.settings.negative_prompt) setNegativePrompt(recommendation.settings.negative_prompt);
          if (recommendation.settings.style) setPixverseStyle(recommendation.settings.style);
          if (recommendation.settings.i2vStability !== undefined) {
            // i2vStability 설정이 있으면 처리 (HUNYUAN 모델용)
          }

          toast({
            title: "모델 선택 완료",
            description: `${recommendation.model.toUpperCase()} 모델이 선택되었습니다. 영상 생성을 시작합니다.`,
            duration: 3000,
          });

          // 추천된 설정으로 제출 (endpoint는 추천된 모델명으로 전달)
          // 이때 onSubmit은 이미 생성된 알림을 업데이트하는 형태로 처리됨
          const finalDuration = recommendation.settings.duration ?
            (recommendation.settings.duration === "5" || recommendation.settings.duration === "8" ?
              `${recommendation.settings.duration}s` as DurationType :
              recommendation.settings.duration) :
            duration;
          console.log(`[useVideoSidebar] Auto-Select 모드 submit - endpoint: ${recommendation.model}, duration: ${finalDuration} (타입: ${typeof finalDuration})`);
          onSubmit({
            prompt: prompt,
            imageFile: imageFile,
            aspectRatio: recommendation.settings.aspectRatio || aspectRatio,
            duration: finalDuration,
            endpoint: recommendation.model, // 여기서만 추천된 모델명 사용
            quality,
            style: recommendation.model === "pixverse" ? (recommendation.settings.style || "anime") : style,
            fileUrl: fileUrl,
            cameraControl: recommendation.settings.cameraControl || cameraControl,
            seed: recommendation.settings.seed,
            resolution: recommendation.settings.resolution,
            numFrames: recommendation.settings.numFrames,
            framesPerSecond: recommendation.settings.framesPerSecond,
            numInferenceSteps: recommendation.settings.numInferenceSteps,
            enableSafetyChecker: recommendation.settings.enableSafetyChecker,
            enablePromptExpansion: recommendation.settings.enablePromptExpansion,
            negative_prompt: recommendation.settings.negative_prompt,
            // Auto-Select 모드에서 생성된 알림 ID 전달
            autoSelectNotificationId: autoSelectNotificationId,
          });
          return;
        }
      } catch (error) {
        console.error('Auto-Select 오류:', error);
        toast({
          title: "모델 추천 실패",
          description: "기본 모델로 진행합니다. 다시 시도해주세요.",
          variant: "destructive",
          duration: 3000,
        });
        // 실패 시 기본 모델(kling)로 설정하되, UI는 여전히 "auto" 유지
        // setEndpoint("kling"); // 이 줄도 제거하여 UI 변경 방지

        // 실패 시에도 기본 설정으로 제출
        // 이때도 이미 생성된 알림을 업데이트하는 형태로 처리됨
        onSubmit({
          prompt: prompt,
          imageFile: imageFile,
          aspectRatio,
          duration,
          endpoint: "kling", // 실패 시 기본값으로 kling 사용
          quality,
          style,
          fileUrl: fileUrl,
          cameraControl,
          seed,
          resolution,
          numFrames,
          framesPerSecond,
          numInferenceSteps,
          enableSafetyChecker,
          enablePromptExpansion,
          negative_prompt: negativePrompt,
          // Auto-Select 모드에서 생성된 알림 ID 전달
          autoSelectNotificationId: autoSelectNotificationId,
        });
        return;
      }
    }

    // 일반 모드일 때는 기존 로직 사용
    if (endpoint !== "auto") {
      console.log(`[useVideoSidebar] 일반 모드 submit - endpoint: ${endpoint}, duration: ${duration} (타입: ${typeof duration})`);
      onSubmit({
        prompt: prompt,
        imageFile: imageFile,
        aspectRatio,
        duration,
        endpoint,
        quality,
        style: endpoint === "pixverse" ? (pixverseStyle || "anime") : style,
        fileUrl: fileUrl,
        cameraControl,
        seed: endpoint === "hunyuan" || endpoint === "wan" ? seed : undefined,
        resolution: endpoint === "hunyuan" ? resolution : undefined,
        numFrames: endpoint === "hunyuan" ? numFrames : undefined,
        enableSafetyChecker: endpoint === "wan" ? enableSafetyChecker : undefined,
        negative_prompt: endpoint === "pixverse" ? negativePrompt : undefined,
      });
    }
  };

  // 탭 전환 핸들러
  const handleTabSelection = (tab: "image" | "text" | "video") => {
    setActiveTab(tab);
    onTabChange(tab);
    // endpoint 기본값 설정 로직은 endpoint, activeTab 의존 useEffect로 이동
  };

  const selectImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const response: FileResponse = await uploadImageAPI(file);
          setFileUrl(response.url);
          setImageFile(null);
          setPreviewUrl(response.url);
          setImageChanged(true);
          setTimeout(() => setImageChanged(false), 3000);
          toast({
            title: "이미지 업로드 성공",
            description: "이미지가 성공적으로 업로드되었습니다.",
            duration: 3000,
          });
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({
            title: "이미지 업로드 실패",
            description: "이미지 업로드 중 오류가 발생했습니다.",
            variant: "destructive",
            duration: 3000,
          });
        }
      }
    };
    input.click();
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl("");
    setFileUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setImageChanged(false);
  };

  const updatePromptWithGemini = async () => {
    if (!previewUrl && !imageFile) {
      toast({
        title: "이미지 필요",
        description: "프롬프트 생성을 위해 이미지를 먼저 업로드해주세요.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsPromptLoading(true);
    try {
      // 이미지 URL 사용
      const imageUrl = fileUrl || previewUrl;

      const response = await fetch('/internal/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          existingPrompt: prompt ?? "" // 프롬프트가 비어있어도 빈 문자열 전달
        }),
      });

      if (!response.ok) {
        let errorMessage = '프롬프트 생성 중 오류가 발생했습니다.';
        let errorDetails = '';

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          errorDetails = errorData.details || '';
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorDetails = `응답 상태: ${response.status} ${response.statusText}`;
        }

        throw new Error(`${errorMessage}\n${errorDetails}`);
      }

      const responseData = await response.json();

      if (responseData.generated_prompt) {
        setPrompt(responseData.generated_prompt);
        toast({
          title: "프롬프트 생성 완료",
          description: "Gemini API로부터 프롬프트를 성공적으로 생성했습니다.",
          duration: 3000,
        });
      } else {
        throw new Error('API 응답에 프롬프트 데이터가 없습니다.');
      }
    } catch (error: unknown) {
      console.error('Gemini API Error:', {
        error,
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        stack: error instanceof Error ? error.stack : undefined
      });

      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "프롬프트 수정 중 오류가 발생했습니다.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsPromptLoading(false);
    }
  };

  return {
    prompt,
    setPrompt,
    imageFile,
    previewUrl,
    fileUrl,
    activeTab,
    aspectRatio,
    duration,
    endpoint,
    quality,
    style,
    imageChanged,
    cameraControl,
    seed,
    resolution,
    numFrames,
    framesPerSecond,
    numInferenceSteps,
    enableSafetyChecker,
    enablePromptExpansion,
    isPromptLoading,
    negativePrompt,
    pixverseStyle,
    fileInputRef,
    handleImageChange,
    updateSettings,
    handleSubmit,
    handleTabSelection,
    selectImage,
    removeImage,
    updatePromptWithGemini,
  };
}
