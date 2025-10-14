"use client";

import { ImageGenerationSettings } from '../types/imageGeneration';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ModelSettingProps {
    settings: ImageGenerationSettings;
    onSettingsChange: (settings: ImageGenerationSettings) => void;
}

const AVAILABLE_MODELS = [
    { id: 'sdxl', name: 'Stable Diffusion XL' },
    { id: 'sd-1.5', name: 'Stable Diffusion 1.5' },
    { id: 'sd-2.1', name: 'Stable Diffusion 2.1' },
] as const;

export function ModelSetting({ settings, onSettingsChange }: ModelSettingProps) {
    const handleModelChange = (modelId: string) => {
        onSettingsChange({ ...settings, modelId });
    };

    return (
        <Card className="m-6 p-4 bg-black/40 border-white/10">
            <div className="space-y-2">
                <Label>모델 선택</Label>
                <Select
                    value={settings.modelId || AVAILABLE_MODELS[0].id}
                    onValueChange={handleModelChange}
                >
                    <SelectTrigger className="bg-black/40 border-white/10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {AVAILABLE_MODELS.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                                {model.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </Card>
    );
} 