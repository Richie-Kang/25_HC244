// components/ModelSetting.tsx
"use client";

import { ModelSettingFactory } from "../modelSettings/ModelSettingFactory";
import { ModelSettings } from "../types/modelSettingTypes";

interface ModelSettingProps {
  endpoint: string;
  mode: "image" | "text" | "video";
  updateSettings: (settings: Partial<ModelSettings>) => void;
  currentSettings: ModelSettings;
}

export default function ModelSetting({
  endpoint,
  mode,
  updateSettings,
  currentSettings,
}: ModelSettingProps) {
  const modelSetting = ModelSettingFactory.getModelSetting(endpoint, mode);
  return modelSetting.renderSettings({ updateSettings, currentSettings });
}
