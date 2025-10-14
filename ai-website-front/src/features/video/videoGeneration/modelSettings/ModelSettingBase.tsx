// modelSettings/ModelSettingBase.tsx
import React from "react";
import { Info } from "lucide-react";
import { ModelSettingProps } from "../types/modelSettingTypes";

export abstract class ModelSettingBase {
  abstract renderSettings(props: ModelSettingProps): React.ReactNode;

  // 모델 설명 표시 헬퍼 메소드
  protected renderDescription(description: string) {
    return (
      <div className="mt-1 p-2 bg-black/30 backdrop-blur-md border border-white/10 rounded-lg flex items-start gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        <Info className="h-4 w-4 text-sky-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-300">{description}</p>
      </div>
    );
  }
}
