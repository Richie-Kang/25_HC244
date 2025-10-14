// types/modelSettingTypes.ts

export interface ModelSettings {
  aspectRatio: "16:9" | "9:16" | "1:1";
  duration: "5s" | "10s";
  cameraControl: "down_back" | "forward_up" | "right_turn_forward" | "left_turn_forward";
}

export interface ModelSettingProps {
  updateSettings: (settings: Partial<ModelSettings>) => void;
  currentSettings: ModelSettings;
}
