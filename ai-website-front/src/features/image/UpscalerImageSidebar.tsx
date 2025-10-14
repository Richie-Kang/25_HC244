"use client";

import { useState, useEffect, FormEvent, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
    Loader2,
    Settings,
    Sparkles,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { BillingService } from "@/features/payment/services/BillingService";
import { useCredit } from "@/features/payment/context/CreditContext";

export interface UpscalerImageSettings {
    prompt: string;
    upscale_factor: number;
    negative_prompt: string;
    creativity: number;
    resemblance: number;
    guidance_scale: number;
    num_inference_steps: number;
    seed?: number;
    enable_safety_checker: boolean;
    image?: {
        url: string;
        name: string;
    };
}

interface FileResponse {
    id: number;
    name: string;
    url: string;
}

interface UpscalerImageSidebarProps {
    onUpscale: (settings: UpscalerImageSettings) => void;
    isLoading: boolean;
    selectedImage: FileResponse | null;
    isDragOver?: boolean;
    onDragEnter?: (e: React.DragEvent) => void;
    onDragLeave?: (e: React.DragEvent) => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
}

const DEFAULT_SETTINGS: UpscalerImageSettings = {
    prompt: "masterpiece, best quality, highres",
    upscale_factor: 2,
    negative_prompt: "(worst quality, low quality, normal quality:2)",
    creativity: 0.35,
    resemblance: 0.6,
    guidance_scale: 4,
    num_inference_steps: 18,
    enable_safety_checker: true,
};

const UPSCALE_FACTOR_OPTIONS = [
    { value: 1, label: "1x (원본 크기)" },
    { value: 2, label: "2x (2배 확대)" },
    { value: 3, label: "3x (3배 확대)" },
    { value: 4, label: "4x (4배 확대)" },
];

const UpscalerImageSidebar = forwardRef<HTMLDivElement, UpscalerImageSidebarProps>(({
    onUpscale,
    isLoading,
    selectedImage,
    isDragOver,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
}, ref) => {
    const [settings, setSettings] = useState<UpscalerImageSettings>(DEFAULT_SETTINGS);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const { updateCredits } = useCredit();

    // 부모 컴포넌트에서 selectedImage 변경 시마다 settings에 반영
    useEffect(() => {
        setSettings((prev) => ({
            ...prev,
            image: selectedImage
                ? { url: selectedImage.url, name: selectedImage.name }
                : undefined,
        }));
    }, [selectedImage]);

    // 권장 업스케일 배율 계산
    const getRecommendedUpscaleFactor = (upscaleFactor: number): { factor: number; warning?: string } => {
        // 기본 이미지 크기 추정 (실제로는 서버에서 확인)
        // 여기서는 일반적인 고해상도 이미지 기준으로 계산
        const estimatedMegapixels = 16; // 4096x4096 기준
        const maxMegapixels = 32;

        const maxPossibleFactor = Math.sqrt(maxMegapixels / estimatedMegapixels);

        if (upscaleFactor > maxPossibleFactor) {
            const recommendedFactor = Math.floor(maxPossibleFactor * 10) / 10;
            return {
                factor: recommendedFactor,
                warning: `선택한 배율이 너무 높습니다. 권장 배율: ${recommendedFactor}x`
            };
        }

        return { factor: upscaleFactor };
    };

    const { factor: recommendedFactor, warning: upscaleWarning } = getRecommendedUpscaleFactor(settings.upscale_factor);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!settings.image) {
            toast.error("업스케일링할 이미지를 선택해주세요");
            return;
        }

        try {
            // 크레딧 소비 요청: UI 즉시 반영
            updateCredits(-3);
            try {
                await BillingService.consumeCredit({
                    amount: 3,
                    reason: "이미지 업스케일링 사용"
                });
            } catch {
                updateCredits(3); // 실패시 롤백
                throw new Error("크레딧 차감 실패");
            }

            // 크레딧 소비 성공 시 업스케일링 실행
            onUpscale(settings);
        } catch {
            // 크레딧 부족 등의 에러 처리
            toast.error("크레딧이 부족합니다. 크레딧을 충전해주세요.");
            return;
        }
    };

    // 선택된 이미지를 표시하는 컴포넌트
    const DisplaySelectedImage = ({
        label,
        image,
    }: {
        label: string;
        image?: { url: string; name: string };
    }) => {
        return (
            <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                    {label}
                </label>
                {image ? (
                    <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                        <Image
                            src={image.url}
                            alt={image.name}
                            fill
                            sizes="(max-width: 400px) 100vw"
                            className="object-contain"
                            unoptimized
                        />
                    </div>
                ) : (
                    <div className="w-full h-48 flex items-center justify-center border border-dashed border-white/20 rounded-lg text-gray-400 text-sm">
                        이미지를 선택해주세요
                    </div>
                )}
            </div>
        );
    };

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
            <ScrollArea className="flex-1">
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5" id="upscale-form">
                        <div className="space-y-4">
                            {/* 선택된 이미지 표시 */}
                            <DisplaySelectedImage label="업스케일링할 이미지" image={settings.image} />
                        </div>

                        {/* 고급 설정 토글 버튼 */}
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                                className="w-full flex items-center justify-between p-3 bg-black/30 backdrop-blur-md border border-white/10 rounded-lg hover:bg-black/40 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Settings className="h-4 w-4 text-sky-500" />
                                    <span className="text-sm font-medium text-white">고급 설정</span>
                                </div>
                                {isAdvancedOpen ? (
                                    <ChevronUp className="h-4 w-4 text-white" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-white" />
                                )}
                            </button>
                        </div>

                        {/* 고급 설정 내용 */}
                        {isAdvancedOpen && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                                {/* 프롬프트 입력 */}
                                <div className="space-y-2">
                                    <Label>프롬프트</Label>
                                    <textarea
                                        value={settings.prompt}
                                        onChange={(e) => setSettings(prev => ({ ...prev, prompt: e.target.value }))}
                                        className="w-full rounded-lg border border-white/20 bg-black/30 backdrop-blur-md p-2.5 text-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 focus:outline-none text-white resize-none"
                                        rows={3}
                                        placeholder="이미지 품질을 향상시킬 프롬프트를 입력하세요"
                                    />
                                </div>

                                {/* 네거티브 프롬프트 입력 */}
                                <div className="space-y-2">
                                    <Label>네거티브 프롬프트</Label>
                                    <textarea
                                        value={settings.negative_prompt}
                                        onChange={(e) => setSettings(prev => ({ ...prev, negative_prompt: e.target.value }))}
                                        className="w-full rounded-lg border border-white/20 bg-black/30 backdrop-blur-md p-2.5 text-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 focus:outline-none text-white resize-none"
                                        rows={2}
                                        placeholder="원하지 않는 요소들을 입력하세요"
                                    />
                                </div>

                                {/* 업스케일 배율 선택 */}
                                <div className="space-y-2">
                                    <Label>업스케일 배율</Label>
                                    <select
                                        value={settings.upscale_factor}
                                        onChange={(e) => setSettings(prev => ({ ...prev, upscale_factor: Number(e.target.value) }))}
                                        className="w-full rounded-lg border border-white/20 bg-black/30 backdrop-blur-md p-2.5 text-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 focus:outline-none text-white"
                                    >
                                        {UPSCALE_FACTOR_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {upscaleWarning && (
                                        <p className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
                                            ⚠️ {upscaleWarning}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400">
                                        큰 이미지의 경우 배율이 자동으로 조정될 수 있습니다
                                    </p>
                                </div>

                                {/* 창의성 슬라이더 */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>창의성</Label>
                                        <span className="text-sm text-white font-medium">{settings.creativity}</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={settings.creativity}
                                            onChange={(e) => setSettings(prev => ({ ...prev, creativity: Number(e.target.value) }))}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                                            style={{
                                                background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${settings.creativity * 100}%, #374151 ${settings.creativity * 100}%, #374151 100%)`
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        높을수록 원본에서 더 많이 변화합니다
                                    </p>
                                </div>

                                {/* 유사성 슬라이더 */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>유사성</Label>
                                        <span className="text-sm text-white font-medium">{settings.resemblance}</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={settings.resemblance}
                                            onChange={(e) => setSettings(prev => ({ ...prev, resemblance: Number(e.target.value) }))}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                                            style={{
                                                background: `linear-gradient(to right, #10b981 0%, #10b981 ${settings.resemblance * 100}%, #374151 ${settings.resemblance * 100}%, #374151 100%)`
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        높을수록 원본 이미지와 유사하게 유지됩니다
                                    </p>
                                </div>

                                {/* 가이던스 스케일 */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>가이던스 스케일</Label>
                                        <span className="text-sm text-white font-medium">{settings.guidance_scale}</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="1"
                                            max="20"
                                            step="0.5"
                                            value={settings.guidance_scale}
                                            onChange={(e) => setSettings(prev => ({ ...prev, guidance_scale: Number(e.target.value) }))}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                                            style={{
                                                background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((settings.guidance_scale - 1) / 19) * 100}%, #374151 ${((settings.guidance_scale - 1) / 19) * 100}%, #374151 100%)`
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        프롬프트를 얼마나 엄격하게 따를지 결정합니다
                                    </p>
                                </div>

                                {/* 추론 단계 */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>추론 단계</Label>
                                        <span className="text-sm text-white font-medium">{settings.num_inference_steps}</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="10"
                                            max="50"
                                            step="1"
                                            value={settings.num_inference_steps}
                                            onChange={(e) => setSettings(prev => ({ ...prev, num_inference_steps: Number(e.target.value) }))}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                                            style={{
                                                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((settings.num_inference_steps - 10) / 40) * 100}%, #374151 ${((settings.num_inference_steps - 10) / 40) * 100}%, #374151 100%)`
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        더 많은 단계는 더 나은 품질을 제공하지만 시간이 더 걸립니다
                                    </p>
                                </div>

                                {/* 시드 입력 */}
                                <div className="space-y-2">
                                    <Label>시드 (선택사항)</Label>
                                    <input
                                        type="number"
                                        value={settings.seed || ''}
                                        onChange={(e) => setSettings(prev => ({
                                            ...prev,
                                            seed: e.target.value ? Number(e.target.value) : undefined
                                        }))}
                                        className="w-full rounded-lg border border-white/20 bg-black/30 backdrop-blur-md p-2.5 text-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 focus:outline-none text-white"
                                        placeholder="랜덤 시드 사용"
                                    />
                                    <p className="text-xs text-gray-400">
                                        같은 시드는 같은 결과를 생성합니다
                                    </p>
                                </div>

                                {/* 안전 검사기 */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="safety_checker"
                                            checked={settings.enable_safety_checker}
                                            onCheckedChange={(checked) =>
                                                setSettings((prev) => ({ ...prev, enable_safety_checker: checked }))
                                            }
                                        />
                                        <Label htmlFor="safety_checker">안전 검사기</Label>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        부적절한 콘텐츠를 필터링합니다
                                    </p>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </ScrollArea>

            <div className="p-3 border-t border-white/10 bg-black/30 backdrop-blur-md">
                <Button
                    type="submit"
                    form="upscale-form"
                    className="w-full py-3 bg-sky-500/30 backdrop-blur-md hover:bg-sky-500/40 text-white transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/20 hover:border-sky-500/50 hover:scale-[1.02] font-medium text-base relative"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            <span>업스케일링 중...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <Sparkles className="mr-2 h-5 w-5" />
                            <span>업스케일링하기</span>
                            <span className="absolute right-3 text-sm text-red-400">-3 크레딧</span>
                        </div>
                    )}
                </Button>
            </div>
        </div>
    );
});

UpscalerImageSidebar.displayName = "UpscalerImageSidebar";

export default UpscalerImageSidebar;
