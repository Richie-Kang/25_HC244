/* =======================================================================
   FashnImageSidebar.tsx         (← 기존 EditImageSidebar.tsx 를 교체)
   =======================================================================*/
"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import {
    Loader2,
    Settings,
    Sparkles,
    CheckCircle2,
    Zap,
} from "lucide-react";

import { BillingService } from "@/features/payment/services/BillingService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useCredit } from "@/features/payment/context/CreditContext";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  타입                                                               */
/* ------------------------------------------------------------------ */
export interface EditImageSettings {
    category: string;
    mode: string;
    garment_photo_type: string;
    moderation_level: string;
    seed: number;
    num_samples: number;
    segmentation_free: boolean;
    guidance_scale?: number;
    slot1?: { url: string; name: string };
    slot2?: { url: string; name: string };
    output_filename: string;
}

interface FileResponse {
    id: number;
    name: string;
    url: string;
}

interface EditImageSidebarProps {
    onGenerate: (settings: EditImageSettings) => void;
    isLoading: boolean;
    slot1Image: FileResponse | null;
    slot2Image: FileResponse | null;
}

/* ------------------------------------------------------------------ */
/*  상수                                                               */
/* ------------------------------------------------------------------ */
const DEFAULT_SETTINGS: EditImageSettings = {
    category: "auto",
    mode: "balanced",
    garment_photo_type: "auto",
    moderation_level: "permissive",
    seed: 42,
    num_samples: 1,
    segmentation_free: true,
    guidance_scale: 7.5,
    output_filename: "",
};

const CATEGORY_OPTIONS = [
    { value: "auto", label: "자동 감지", description: "AI가 의류 타입을 자동으로 판단합니다" },
    { value: "tops", label: "상의" },
    { value: "bottoms", label: "하의" },
    { value: "one-pieces", label: "원피스" },
];

const GARMENT_PHOTO_TYPE_OPTIONS = [
    { value: "auto", label: "자동 감지", description: "AI가 촬영 방식을 자동으로 판단합니다" },
    { value: "model", label: "모델 착용" },
    { value: "flat-lay", label: "평면 촬영" },
];

const MODE_OPTIONS = [
    { value: "performance", label: "빠른 생성", icon: Zap, color: "text-yellow-400" },
    { value: "balanced", label: "균형 잡힌 생성", icon: CheckCircle2, color: "text-green-400" },
    { value: "quality", label: "고품질 생성", icon: Sparkles, color: "text-purple-400" },
];

/* 유니크한 파일 이름 생성 */
const generateUniqueFileName = (originalName: string) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName?.includes(".")
        ? originalName.split(".").pop()
        : "png";
    return `fitting_${timestamp}_${random}.${extension}`;
};

/* =================================================================== */
/*  컴포넌트                                                            */
/* =================================================================== */
export default function FashnImageSidebar({
    onGenerate,
    isLoading,
    slot1Image,
    slot2Image,
}: EditImageSidebarProps) {
    const [settings, setSettings] = useState<EditImageSettings>(DEFAULT_SETTINGS);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const { credits, updateCredits } = useCredit();

    /* slot1 / slot2 변경 시 settings 에 반영 */
    useEffect(() => {
        setSettings(prev => ({
            ...prev,
            slot1: slot1Image ? { url: slot1Image.url, name: slot1Image.name } : undefined,
            slot2: slot2Image ? { url: slot2Image.url, name: slot2Image.name } : undefined,
        }));
    }, [slot1Image, slot2Image]);

    /* -------------------------------------------------------------- */
    /*  각종 핸들러                                                   */
    /* -------------------------------------------------------------- */
    const handleCategoryChange = (value: string) =>
        setSettings(prev => ({ ...prev, category: value }));

    const handleGarmentPhotoTypeChange = (value: string) =>
        setSettings(prev => ({ ...prev, garment_photo_type: value }));

    const handleGuidanceScaleChange = (value: number[]) =>
        setSettings(prev => ({ ...prev, guidance_scale: value[0] }));

    const handleSeedChange = (value: string) =>
        setSettings(prev => ({ ...prev, seed: parseInt(value) || 42 }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!settings.slot1) return toast.error("의류 이미지를 선택해주세요");
        if (!settings.slot2) return toast.error("모델 이미지를 선택해주세요");

        if (credits < 5) {
            toast.error("크레딧이 부족합니다. 크레딧을 충전해주세요.");
            return;
        }

        try {
            // 크레딧 소비 요청: UI 즉시 반영
            updateCredits(-5);
            try {
                await BillingService.consumeCredit({ amount: 5, reason: "가상 피팅 사용" });
            } catch {
                updateCredits(5); // 실패시 롤백
                throw new Error("크레딧 차감 실패");
            }

            /* 2. 고유 파일명 생성 */
            const uniqueFileName = generateUniqueFileName(settings.slot1.name);

            /* 3. 실행 */
            onGenerate({ ...settings, output_filename: uniqueFileName });
        } catch {
            toast.error("크레딧이 부족합니다. 크레딧을 충전해주세요.");
        }
    };

    /* 이미지 미리보기 */
    const DisplaySlotImage = ({
        label,
        image,
        slotNumber,
    }: {
        label: string;
        image?: { url: string; name: string };
        slotNumber: number;
    }) => (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">{label}</label>
                {image && (
                    <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        선택됨
                    </div>
                )}
            </div>
            {image ? (
                <div className="relative w-full h-32 border border-sky-500/30 rounded-lg overflow-hidden bg-black/20">
                    <Image
                        src={image.url}
                        alt={image.name}
                        fill
                        sizes="(max-width: 400px) 100vw"
                        className="object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-sky-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                        {slotNumber}
                    </div>
                </div>
            ) : (
                <div className="w-full h-32 flex flex-col items-center justify-center border border-dashed border-white/20 rounded-lg text-gray-400 text-sm bg-black/10">
                    <div className="w-8 h-8 border border-dashed border-white/30 rounded-full flex items-center justify-center mb-2 text-xs">
                        {slotNumber}
                    </div>
                    {label} 미선택
                </div>
            )}
            {image && (
                <p className="text-xs text-gray-400 truncate">{image.name}</p>
            )}
        </div>
    );

    /* =============================================================== */
    /*  JSX                                                            */
    /* =============================================================== */
    return (
        <div className="w-[400px] h-full bg-black/95 backdrop-blur-xl border-r border-white/20 flex flex-col overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)] z-10">
            {/* 헤더 */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                        <Settings className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">가상 피팅 설정</h2>
                        <p className="text-sm text-gray-400">최적의 결과를 위해 설정을 조정하세요</p>
                    </div>
                </div>
            </div>

            {/* 내용 스크롤 */}
            <ScrollArea className="flex-1">
                <div className="p-6">
                    <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* 선택된 이미지 미리보기 */}
                        <div className="space-y-4">
                            <DisplaySlotImage
                                label="의류 이미지"
                                image={settings.slot1}
                                slotNumber={1}
                            />
                            <DisplaySlotImage
                                label="모델 이미지"
                                image={settings.slot2}
                                slotNumber={2}
                            />
                        </div>

                        {/* 기본 설정 */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white">기본 설정</h3>

                            {/* 생성 모드 - 카드 스타일 */}
                            <div className="space-y-3">
                                <Label>생성 모드</Label>
                                <div className="grid gap-2">
                                    {MODE_OPTIONS.map((option) => {
                                        const Icon = option.icon;
                                        return (
                                            <div
                                                key={option.value}
                                                className={cn(
                                                    "relative cursor-pointer rounded-lg border p-3 transition-all duration-200",
                                                    settings.mode === option.value
                                                        ? "border-sky-500/50 bg-sky-500/10"
                                                        : "border-white/20 bg-black/20 hover:border-white/30 hover:bg-black/30"
                                                )}
                                                onClick={() => setSettings(prev => ({ ...prev, mode: option.value }))}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className={cn("h-4 w-4", option.color)} />
                                                    <span className="text-sm font-medium text-white">
                                                        {option.label}
                                                    </span>
                                                    {settings.mode === option.value && (
                                                        <CheckCircle2 className="h-4 w-4 text-sky-400 ml-auto" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 의류 카테고리 */}
                            <div className="space-y-2">
                                <Label>의류 카테고리</Label>
                                <select
                                    value={settings.category}
                                    onChange={e => handleCategoryChange(e.target.value)}
                                    className="w-full rounded-lg border border-white/20 bg-black/30 p-3 text-sm text-white focus:ring-2 focus:ring-sky-500/50 focus:outline-none"
                                >
                                    {CATEGORY_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                {settings.category === "auto" && (
                                    <p className="text-xs text-gray-400">
                                        {CATEGORY_OPTIONS.find(o => o.value === "auto")?.description}
                                    </p>
                                )}
                            </div>

                            {/* 의류 이미지 타입 */}
                            <div className="space-y-2">
                                <Label>의류 이미지 타입</Label>
                                <select
                                    value={settings.garment_photo_type}
                                    onChange={e => handleGarmentPhotoTypeChange(e.target.value)}
                                    className="w-full rounded-lg border border-white/20 bg-black/30 p-3 text-sm text-white focus:ring-2 focus:ring-sky-500/50 focus:outline-none"
                                >
                                    {GARMENT_PHOTO_TYPE_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                {settings.garment_photo_type === "auto" && (
                                    <p className="text-xs text-gray-400">
                                        {GARMENT_PHOTO_TYPE_OPTIONS.find(o => o.value === "auto")?.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 고급 설정 토글 */}
                        <div className="border-t border-white/10 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full text-gray-400 hover:text-white hover:bg-black/40"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                고급 설정 {showAdvanced ? '숨기기' : '보기'}
                            </Button>
                        </div>

                        {/* 고급 설정 */}
                        {showAdvanced && (
                            <div className="space-y-4 border border-white/10 rounded-lg p-4 bg-black/20">
                                <h4 className="text-sm font-medium text-white">고급 설정</h4>

                                {/* 콘텐츠 제한 */}
                                <div className="space-y-2">
                                    <Label>콘텐츠 제한</Label>
                                    <select
                                        value={settings.moderation_level}
                                        onChange={e => setSettings(prev => ({ ...prev, moderation_level: e.target.value }))}
                                        className="w-full rounded-lg border border-white/20 bg-black/30 p-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500/50 focus:outline-none"
                                    >
                                        <option value="none">없음</option>
                                        <option value="permissive">기본</option>
                                        <option value="conservative">엄격</option>
                                    </select>
                                </div>

                                {/* 세그멘테이션 */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="segmentation_free">세그멘테이션 비활성화</Label>
                                        <p className="text-xs text-gray-400 mt-1">인물 분석을 비활성화합니다</p>
                                    </div>
                                    <Switch
                                        id="segmentation_free"
                                        checked={settings.segmentation_free}
                                        onCheckedChange={checked =>
                                            setSettings(prev => ({ ...prev, segmentation_free: checked }))}
                                    />
                                </div>

                                {/* Guidance Scale */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Guidance Scale</Label>
                                        <span className="text-xs text-gray-400">{settings.guidance_scale}</span>
                                    </div>
                                    <Slider
                                        min={1}
                                        max={20}
                                        step={0.5}
                                        value={[settings.guidance_scale ?? 7.5]}
                                        onValueChange={handleGuidanceScaleChange}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-gray-400">프롬프트 반영 강도를 조절합니다</p>
                                </div>

                                {/* 시드값 */}
                                <div className="space-y-2">
                                    <Label htmlFor="seed">시드값</Label>
                                    <Input
                                        id="seed"
                                        type="number"
                                        value={settings.seed}
                                        onChange={e => handleSeedChange(e.target.value)}
                                        placeholder="42 (기본값)"
                                        className="border-white/20 bg-black/30 text-white placeholder:text-gray-400"
                                    />
                                    <p className="text-xs text-gray-400">같은 시드값으로 일관된 결과를 얻을 수 있습니다</p>
                                </div>

                                {/* 생성 수 */}
                                <div className="space-y-2">
                                    <Label htmlFor="num_samples">생성 수</Label>
                                    <Input
                                        id="num_samples"
                                        type="number"
                                        min={1}
                                        max={4}
                                        value={settings.num_samples}
                                        onChange={e =>
                                            setSettings(prev => ({
                                                ...prev,
                                                num_samples: parseInt(e.target.value) || 1,
                                            }))
                                        }
                                        className="border-white/20 bg-black/30 text-white placeholder:text-gray-400"
                                    />
                                    <p className="text-xs text-gray-400">한 번에 생성할 이미지의 수 (1-4)</p>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </ScrollArea>

            {/* 하단 생성 버튼 */}
            <div className="p-6 border-t border-white/10 bg-black/50 backdrop-blur-md">
                <div className="space-y-3">
                    {/* 크레딧 정보 */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">사용 가능한 크레딧</span>
                        <span className="text-white font-medium">{credits || 0}</span>
                    </div>

                    {/* 생성 버튼 */}
                    <Button
                        type="submit"
                        form="edit-form"
                        disabled={isLoading || !slot1Image || !slot2Image || (credits < 5)}
                        className={cn(
                            "w-full py-4 transition-all duration-300 font-medium text-base relative group",
                            isLoading
                                ? "bg-gray-600 cursor-not-allowed"
                                : (credits < 5 || !slot1Image || !slot2Image)
                                    ? "bg-gray-600 cursor-not-allowed"
                                    : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                        )}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                가상 피팅 생성 중...
                            </span>
                        ) : (
                            <>
                                <div className="flex items-center justify-center">
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    가상 피팅 시작하기
                                </div>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm bg-black/20 px-2 py-1 rounded">
                                    -5 크레딧
                                </div>
                            </>
                        )}
                    </Button>

                    {/* 상태 메시지 */}
                    {!slot1Image && (
                        <p className="text-xs text-center text-red-400">의류 이미지를 선택해주세요</p>
                    )}
                    {slot1Image && !slot2Image && (
                        <p className="text-xs text-center text-yellow-400">모델 이미지를 선택해주세요</p>
                    )}
                    {credits < 5 && (
                        <p className="text-xs text-center text-red-400">크레딧이 부족합니다. 충전이 필요합니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
