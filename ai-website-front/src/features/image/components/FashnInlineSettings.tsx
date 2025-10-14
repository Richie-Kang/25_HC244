"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Loader2, Sparkles, Settings, Palette, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FileResponse } from "@/features/folder/services/FolderService";

export interface EditImageSettings {
    slot1: { url: string; id: number } | null;
    slot2: { url: string; id: number } | null;
    category: string;
    mode: string;
    garment_photo_type: string;
    moderation_level: string;
    seed: number;
    num_samples: number;
    segmentation_free: boolean;
    output_format: string;
}

interface FashnInlineSettingsProps {
    onGenerate: (settings: EditImageSettings) => Promise<void>;
    isLoading: boolean;
    slot1Image: FileResponse | null;
    slot2Image: FileResponse | null;
}

export default function FashnInlineSettings({
    onGenerate,
    isLoading,
    slot1Image,
    slot2Image
}: FashnInlineSettingsProps) {
    const [category, setCategory] = useState("auto");
    const [mode, setMode] = useState("balanced");
    const [garmentPhotoType, setGarmentPhotoType] = useState("auto");
    const [moderationLevel, setModerationLevel] = useState("permissive");
    const [seed, setSeed] = useState([42]); // fal-ai 문서의 기본값에 맞춤
    const [numSamples, setNumSamples] = useState([1]);
    const [segmentationFree, setSegmentationFree] = useState(true);
    const [outputFormat, setOutputFormat] = useState("png");

    const handleGenerate = async () => {
        if (!slot1Image || !slot2Image) return;

        const settings: EditImageSettings = {
            slot1: { url: slot1Image.url, id: slot1Image.id },
            slot2: { url: slot2Image.url, id: slot2Image.id },
            category,
            mode,
            garment_photo_type: garmentPhotoType,
            moderation_level: moderationLevel,
            seed: seed[0],
            num_samples: numSamples[0],
            segmentation_free: segmentationFree,
            output_format: outputFormat,
        };

        await onGenerate(settings);
    };

    const generateRandomSeed = () => {
        setSeed([Math.floor(Math.random() * 1000000)]);
    };

    const isDisabled = !slot1Image || !slot2Image || isLoading;

    return (
        <div className="space-y-4">
            {/* 생성 모드 선택 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card
                    className={cn(
                        "p-3 cursor-pointer transition-all border-2",
                        mode === "quality"
                            ? "border-green-500 bg-green-500/10"
                            : "border-white/20 hover:border-green-500/50"
                    )}
                    onClick={() => setMode("quality")}
                >
                    <div className="text-center">
                        <Sparkles className="h-6 w-6 mx-auto mb-1 text-green-400" />
                        <h3 className="text-sm font-medium text-white mb-1">고품질</h3>
                        <p className="text-xs text-gray-400">최고 품질의 결과물</p>
                    </div>
                </Card>

                <Card
                    className={cn(
                        "p-3 cursor-pointer transition-all border-2",
                        mode === "balanced"
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-white/20 hover:border-blue-500/50"
                    )}
                    onClick={() => setMode("balanced")}
                >
                    <div className="text-center">
                        <Settings className="h-6 w-6 mx-auto mb-1 text-blue-400" />
                        <h3 className="text-sm font-medium text-white mb-1">균형</h3>
                        <p className="text-xs text-gray-400">품질과 속도의 균형</p>
                    </div>
                </Card>

                <Card
                    className={cn(
                        "p-3 cursor-pointer transition-all border-2",
                        mode === "performance"
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-white/20 hover:border-orange-500/50"
                    )}
                    onClick={() => setMode("performance")}
                >
                    <div className="text-center">
                        <Zap className="h-6 w-6 mx-auto mb-1 text-orange-400" />
                        <h3 className="text-sm font-medium text-white mb-1">빠른 생성</h3>
                        <p className="text-xs text-gray-400">빠른 생성 속도</p>
                    </div>
                </Card>
            </div>

            {/* 설정 옵션들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 기본 설정 */}
                <Card className="p-4 bg-black/30 border border-white/10">
                    <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                        <Palette className="h-4 w-4 text-blue-400" />
                        기본 설정
                    </h3>

                    <div className="space-y-3">
                        <div>
                            <Label className="text-white text-xs">의류 카테고리</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="mt-1 h-8 text-sm bg-black/40 border-white/20 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 border-white/20">
                                    <SelectItem value="auto" className="text-white focus:bg-white/10 focus:text-white">자동 감지</SelectItem>
                                    <SelectItem value="tops" className="text-white focus:bg-white/10 focus:text-white">상의</SelectItem>
                                    <SelectItem value="bottoms" className="text-white focus:bg-white/10 focus:text-white">하의</SelectItem>
                                    <SelectItem value="one-pieces" className="text-white focus:bg-white/10 focus:text-white">원피스</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-white text-xs">사진 타입</Label>
                            <Select value={garmentPhotoType} onValueChange={setGarmentPhotoType}>
                                <SelectTrigger className="mt-1 h-8 text-sm bg-black/40 border-white/20 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 border-white/20">
                                    <SelectItem value="auto" className="text-white focus:bg-white/10 focus:text-white">자동 감지</SelectItem>
                                    <SelectItem value="model" className="text-white focus:bg-white/10 focus:text-white">모델 착용</SelectItem>
                                    <SelectItem value="flat-lay" className="text-white focus:bg-white/10 focus:text-white">평면 촬영</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-white text-xs">조정 수준</Label>
                            <Select value={moderationLevel} onValueChange={setModerationLevel}>
                                <SelectTrigger className="mt-1 h-8 text-sm bg-black/40 border-white/20 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 border-white/20">
                                    <SelectItem value="none" className="text-white focus:bg-white/10 focus:text-white">없음</SelectItem>
                                    <SelectItem value="permissive" className="text-white focus:bg-white/10 focus:text-white">관대함</SelectItem>
                                    <SelectItem value="conservative" className="text-white focus:bg-white/10 focus:text-white">보수적</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-white text-xs">출력 형식</Label>
                            <Select value={outputFormat} onValueChange={setOutputFormat}>
                                <SelectTrigger className="mt-1 h-8 text-sm bg-black/40 border-white/20 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 border-white/20">
                                    <SelectItem value="png" className="text-white focus:bg-white/10 focus:text-white">PNG (고품질)</SelectItem>
                                    <SelectItem value="jpeg" className="text-white focus:bg-white/10 focus:text-white">JPEG (빠름)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* 고급 설정 */}
                <Card className="p-4 bg-black/30 border border-white/10">
                    <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                        <Settings className="h-4 w-4 text-purple-400" />
                        고급 설정
                    </h3>

                    <div className="space-y-3">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <Label className="text-white text-xs">시드 값</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={generateRandomSeed}
                                    className="text-xs text-blue-400 hover:text-blue-300 h-6 px-2"
                                >
                                    랜덤
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <Slider
                                    value={seed}
                                    onValueChange={setSeed}
                                    max={1000000}
                                    min={0}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="text-xs text-gray-400 text-center">
                                    {seed[0]}
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label className="text-white text-xs mb-1 block">생성 개수</Label>
                            <div className="space-y-1">
                                <Slider
                                    value={numSamples}
                                    onValueChange={setNumSamples}
                                    max={4}
                                    min={1}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="text-xs text-gray-400 text-center">
                                    {numSamples[0]}개
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <Label className="text-white text-xs">자동 분할</Label>
                            <Switch
                                checked={segmentationFree}
                                onCheckedChange={setSegmentationFree}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* 생성 버튼 */}
            <div className="flex justify-center pt-2">
                <Button
                    onClick={handleGenerate}
                    disabled={isDisabled}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 text-base font-medium min-w-[180px]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            생성 중...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            가상 피팅 생성
                        </>
                    )}
                </Button>
            </div>

            {/* 상태 메시지 */}
            {isDisabled && !isLoading && (
                <div className="text-center">
                    <p className="text-gray-400 text-xs">
                        {!slot1Image && !slot2Image && "의류와 모델 이미지를 선택해주세요"}
                        {!slot1Image && slot2Image && "의류 이미지를 선택해주세요"}
                        {slot1Image && !slot2Image && "모델 이미지를 선택해주세요"}
                    </p>
                </div>
            )}
        </div>
    );
} 