"use client";

import { ImageGenerationSettings } from '../types/imageGeneration';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ImageSidebarProps {
    settings: ImageGenerationSettings;
    onSettingsChange: (settings: ImageGenerationSettings) => void;
}

export function ImageSidebar({ settings, onSettingsChange }: ImageSidebarProps) {
    const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSettingsChange({ ...settings, prompt: e.target.value });
    };

    const handleNegativePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSettingsChange({ ...settings, negativePrompt: e.target.value });
    };

    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSettingsChange({ ...settings, width: Number(e.target.value) });
    };

    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSettingsChange({ ...settings, height: Number(e.target.value) });
    };

    const handleNumOutputsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSettingsChange({ ...settings, numOutputs: Number(e.target.value) });
    };

    const handleGuidanceScaleChange = (value: number[]) => {
        onSettingsChange({ ...settings, guidanceScale: value[0] });
    };

    return (
        <div className="w-80 border-r border-white/10 bg-black/40 backdrop-blur-xl p-6 overflow-y-auto">
            <Card className="bg-black/40 border-white/10">
                <div className="space-y-6 p-6">
                    <div className="space-y-2">
                        <Label>프롬프트</Label>
                        <Input
                            value={settings.prompt}
                            onChange={handlePromptChange}
                            placeholder="이미지를 설명해주세요..."
                            className="bg-black/40 border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>네거티브 프롬프트</Label>
                        <Input
                            value={settings.negativePrompt}
                            onChange={handleNegativePromptChange}
                            placeholder="제외할 요소를 설명해주세요..."
                            className="bg-black/40 border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>이미지 크기</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs">너비</Label>
                                <Input
                                    type="number"
                                    value={settings.width}
                                    onChange={handleWidthChange}
                                    min={256}
                                    max={1024}
                                    step={64}
                                    className="bg-black/40 border-white/10"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">높이</Label>
                                <Input
                                    type="number"
                                    value={settings.height}
                                    onChange={handleHeightChange}
                                    min={256}
                                    max={1024}
                                    step={64}
                                    className="bg-black/40 border-white/10"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>생성할 이미지 수</Label>
                        <Input
                            type="number"
                            value={settings.numOutputs}
                            onChange={handleNumOutputsChange}
                            min={1}
                            max={4}
                            className="bg-black/40 border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>가이던스 스케일 ({settings.guidanceScale})</Label>
                        <Slider
                            value={[settings.guidanceScale]}
                            onValueChange={handleGuidanceScaleChange}
                            min={1}
                            max={20}
                            step={0.1}
                            className="bg-black/40"
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
} 