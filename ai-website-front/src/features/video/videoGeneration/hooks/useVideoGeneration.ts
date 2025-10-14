import { useCredit } from "@/features/payment/context/CreditContext";
import { BillingService } from "@/features/payment/services/BillingService";
import { VideoApiService } from "../../../../app/internal/video/services/falService";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ReadonlyURLSearchParams } from "next/navigation";
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuth } from "@/features/user/AuthContext";
import { AspectRatioType, ResolutionType, DurationType } from '../types/modelSettingTypes';
import { GenerationNotificationService } from '@/features/admin/services/GenerationNotificationService';
import { useVideoWebSocket } from "@/app/providers";

interface VideoGenerationData {
  prompt: string;
  aspectRatio: string;
  duration: string;
  quality?: string;
  style?: string;
  endpoint: string;
  imageFile?: File | null;
  fileUrl?: string;
  upscaling?: boolean;
  cameraControl?: string;
  seed?: number;
  resolution?: string;
  numFrames?: number;
  negative_prompt?: string;
  cfg_scale?: number;
  autoSelectNotificationId?: number;
}

interface FileItem {
  fileUrl: string;
  name: string;
}

interface UseVideoGenerationProps {
  searchParams?: ReadonlyURLSearchParams | null;
}

export default function useVideoGeneration({ searchParams }: UseVideoGenerationProps = {}) {
  const { updateCredits } = useCredit();
  const router = useRouter();
  const { id: userId } = useAuth();
  
  // 영상 생성용 WebSocket 연결
  const { connectForVideoGeneration, isConnected } = useVideoWebSocket();

  // 영상 생성 및 저장 관련 상태
  const [videoUrl, setVideoUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [upscaledVideoUrl, setUpscaledVideoUrl] = useState("");

  // 사이드바 및 폴더 관련 상태
  const [activeTab, setActiveTab] = useState<"video" | "image" | "text">("image");
  const [selectedEndpoint, setSelectedEndpoint] = useState("luna");
  const [quality, setQuality] = useState<"standard" | "high">("standard");
  const [style, setStyle] = useState<"realistic" | "creative">("realistic");

  // 참조 이미지 및 프롬프트 관련 상태
  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState("");
  const [referencePrompt, setReferencePrompt] = useState("");
  const [referenceModel, setReferenceModel] = useState("");

  const { toast } = useToast();

  // URL 쿼리 파라미터 처리
  useEffect(() => {
    if (searchParams) {
      const prompt = searchParams.get("prompt");
      const imageUrl = searchParams.get("imageUrl");
      const model = searchParams.get("model");

      if (prompt) setReferencePrompt(prompt);
      if (imageUrl) setReferenceImageUrl(imageUrl);
      if (model) {
        setReferenceModel(model);
        setSelectedEndpoint(model);
      }
    }
  }, [searchParams]);

  // VideoSidebar에서 전달받은 데이터로 영상 생성 요청
  const handleSidebarSubmit = async (data: VideoGenerationData) => {
    console.log(`🎯 [비디오 생성] handleSidebarSubmit 시작:`, {
      endpoint: data.endpoint,
      activeTab,
      hasImageFile: !!data.imageFile,
      hasFileUrl: !!data.fileUrl,
      prompt: data.prompt?.substring(0, 50) + '...',
      userId: userId?.toString() || 'none'
    });

    setErrorMessage("");
    setVideoUrl("");
    setUpscaledVideoUrl("");

    try {
      if (!userId) {
        toast({
          title: "오류",
          description: "사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      // 영상 생성용 웹소켓 연결
      await connectForVideoGeneration();
      console.log('🔗 [비디오 생성] 웹소켓 연결 완료');

      // 현재 크레딧 확인
      const creditResponse = await BillingService.getCurrentCredit();
      if (creditResponse.currentCredit < 10) {
        toast({
          title: "크레딧 부족",
          description: "크레딧이 부족합니다. 크레딧을 충전해주세요.",
          variant: "destructive",
        });
        router.push("/payment");
        return;
      }

      // 크레딧 소비 요청: UI 즉시 반영
      updateCredits(-10);
      try {
        await BillingService.consumeCredit({
          amount: 10,
          reason: "비디오 생성"
        });
      } catch (err) {
        // 실패시 롤백
        updateCredits(10);
        throw err;
      }

      // 이미지 처리
      let imageBase64 = "";
      if (data.imageFile) {
        try {
          imageBase64 = await readFileAsBase64(data.imageFile);
        } catch (error) {
          console.error("Error reading file as Base64:", error);
          toast({
            title: "오류",
            description: "이미지 파일을 처리하는 중 오류가 발생했습니다.",
            variant: "destructive",
          });
          return;
        }
      }

      // 이미지 URL 검증
      const imageUrl = imageBase64 || data.fileUrl || '';
      
      if (!imageUrl) {
        console.error(`❌ [비디오 생성] ${data.endpoint} API 호출 불가: 이미지 URL이 없습니다.`);
        toast({
          title: "오류",
          description: "이미지 정보가 없어 비디오 생성을 시작할 수 없습니다.",
          variant: "destructive",
        });
        return;
      }

      // 🎯 Spring Boot에 알림을 먼저 생성하고 notificationId 받기
      let notificationId = '';
      try {
        const notification = await GenerationNotificationService.createNotification({
          title: `${data.endpoint} 모델로 영상 생성 중`,
          thumbnailUrl: imageUrl.startsWith('data:') ? '' : imageUrl,
          mediaCount: 1,
        });
        notificationId = notification.id.toString();
        console.log(`✅ [알림 생성] Spring Boot 알림 생성 완료 - ID: ${notificationId}`);
        
        // 알림 생성됨을 알리는 이벤트 발생
        window.dispatchEvent(new CustomEvent('open-notification-bell'));
      } catch (notificationError) {
        console.error("❌ [알림 생성] Spring Boot 알림 생성 실패:", notificationError);
        toast({
          title: "오류", 
          description: "알림 생성에 실패했습니다. 영상 생성을 계속 진행합니다.",
          variant: "destructive",
        });
        // 알림 생성 실패해도 영상 생성은 계속 진행
      }

      console.log(`🚀 [비디오 생성] VideoApiService 요청 전송 중:`, {
        endpoint: data.endpoint,
        userId: userId?.toString() || 'none',
        notificationId: notificationId || 'none',
        hasImageUrl: !!imageUrl,
        imageUrlLength: imageUrl.length,
        prompt: data.prompt?.substring(0, 50) + '...',
        seed: data.seed,
        duration: data.duration,
        aspectRatio: data.aspectRatio
      });

      // VideoApiService를 사용한 모델별 요청
      let result;
      
      switch (data.endpoint) {
        case "hunyuan":
          result = await VideoApiService.createHunyuanVideo({
            userId: userId.toString(),
            prompt: data.prompt,
            imageUrl,
            notificationId: notificationId,
            seed: data.seed,
            aspect_ratio: data.aspectRatio as AspectRatioType,
            resolution: data.resolution as ResolutionType,
            num_frames: data.numFrames,
            i2v_stability: true,
          });
          break;
          
        case "kling":
          result = await VideoApiService.createKlingVideo({
            userId: userId.toString(),
            prompt: data.prompt,
            imageUrl,
            notificationId: notificationId,
            seed: data.seed,
            duration: data.duration as "5s" | "10s",
            negative_prompt: data.negative_prompt || "blur, distort, and low quality",
            cfg_scale: data.cfg_scale || 0.5,
          });
          break;
          
        case "veo2":
          result = await VideoApiService.createVeo2Video({
            userId: userId.toString(),
            prompt: data.prompt,
            imageUrl,
            notificationId: notificationId,
            seed: data.seed,
            aspect_ratio: data.aspectRatio as AspectRatioType,
            duration: data.duration as DurationType,
          });
          break;
          
        case "pixverse":
          const pixverseDuration = data.duration.replace('s', '') as "5" | "8";
          result = await VideoApiService.createPixverseVideo({
            userId: userId.toString(),
            prompt: data.prompt,
            imageUrl,
            notificationId: notificationId,
            seed: data.seed,
            aspect_ratio: data.aspectRatio as AspectRatioType,
            resolution: data.resolution as ResolutionType,
            duration: pixverseDuration,
            negative_prompt: data.negative_prompt,
            style: data.style as "anime" | "3d_animation" | "clay" | "comic" | "cyberpunk",
          });
          break;
          
        case "wan":
          result = await VideoApiService.createWanVideo({
            userId: userId.toString(),
            prompt: data.prompt,
            imageUrl,
            notificationId: notificationId,
            seed: data.seed || Math.floor(Math.random() * 1000000),
            enableSafetyChecker: true,
          });
          break;
          
        default:
          throw new Error(`지원하지 않는 모델: ${data.endpoint}`);
      }

      // 응답 처리 (작업 ID 기반)
      console.log(`✅ [비디오 생성] VideoApiService 응답:`, result);
      
      if (result && result.jobId) {
        // 성공적으로 작업이 시작됨
        toast({
          title: "영상 생성 시작",
          description: `비디오 생성 작업이 시작되었습니다. 작업 ID: ${result.jobId}`,
        });
        
        console.log(`✅ [비디오 생성] 작업 시작됨 - 모델: ${data.endpoint}, 작업 ID: ${result.jobId}, 알림 ID: ${notificationId}`);
        
        // WebSocket을 통해 실시간으로 완료 알림을 받을 예정
        toast({
          title: "진행 중",
          description: "영상 생성 요청이 처리 중입니다. 완료되면 알림을 받게 됩니다.",
        });
      } else {
        throw new Error('작업 ID를 받지 못했습니다.');
      }

    } catch (error: unknown) {
      console.error("비디오 생성 전체 플로우 오류:", error);
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류 발생";
      setErrorMessage(errorMessage);
      toast({
        title: "오류",
        description: `영상 처리 중 오류: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  // 업스케일링 처리 함수
  const handleUpscaleVideo = async () => {
    if (!videoUrl) return;

    try {
      setIsUpscaling(true);

      const response = await fetch('/internal/video/upscaler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        throw new Error(`업스케일링 요청 실패: ${response.status}`);
      }

      const result = await response.json();

      if (result.data?.video_upscaled) {
        setUpscaledVideoUrl(result.data.video_upscaled);
        toast({
          title: "완료",
          description: "비디오 업스케일링이 완료되었습니다",
        });
      } else {
        throw new Error("업스케일링된 비디오 URL을 받지 못했습니다");
      }
    } catch (error) {
      console.error("업스케일링 오류:", error);
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "업스케일링 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setIsUpscaling(false);
    }
  };

  const handleTabChange = (tab: "video" | "image" | "text") => {
    if (tab === "image" || tab === "text") {
      setActiveTab(tab);
    }
  };

  const handleAddReferenceImage = async (fileItem: FileItem) => {
    setReferenceImageUrl(fileItem.fileUrl);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImageFile(file);
      setReferenceImageUrl(URL.createObjectURL(file));
    }
  };

  const selectImage = () => {
    document.getElementById("imageInput")?.click();
  };

  const removeImage = () => {
    setReferenceImageFile(null);
    setReferenceImageUrl("");
  };

  // Base64 변환 함수
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to Base64'));
        }
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsDataURL(file);
    });
  };

  return {
    videoUrl,
    errorMessage,
    isUpscaling,
    upscaledVideoUrl,
    activeTab,
    selectedEndpoint,
    quality,
    style,
    referenceImageFile,
    referenceImageUrl,
    referencePrompt,
    referenceModel,
    isConnected,
    handleSidebarSubmit,
    handleUpscaleVideo,
    handleTabChange,
    handleAddReferenceImage,
    handleImageChange,
    selectImage,
    removeImage,
    setSelectedEndpoint,
    setQuality,
    setStyle,
    setReferencePrompt
  };
} 