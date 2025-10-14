import React from "react";
import { Info } from "lucide-react";
import { ModelSettingBase } from "../ModelSettingBase";
import { ModelSettingProps, ImageKlingModelSettings } from "../../../videoGeneration/types/modelSettingTypes";

export class ImageKlingModelSetting extends ModelSettingBase {
  renderSettings({ updateSettings, currentSettings }: ModelSettingProps) {
    const settings = currentSettings as ImageKlingModelSettings;

    return (
      <>
        <div className="mt-4">
          <label className="block text-xs font-medium text-white mb-1">
            길이
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["5s", "10s"].map((dur) => (
              <label
                key={dur}
                className={`flex items-center justify-center py-2 rounded border cursor-pointer text-xs ${settings.duration === dur
                  ? "bg-sky-500/20 border-sky-500 text-sky-500"
                  : "border-white/10 text-gray-300 hover:bg-white/5"
                  }`}
              >
                <input
                  type="radio"
                  name="duration"
                  value={dur}
                  checked={settings.duration === dur}
                  onChange={(e) => updateSettings({ duration: e.target.value as "5s" | "10s" })}
                  className="sr-only"
                />
                {dur}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-white mb-2">
            네거티브 프롬프트
          </label>
          <textarea
            value={settings.negative_prompt || "blur, distort, and low quality"}
            onChange={(e) => updateSettings({ negative_prompt: e.target.value })}
            placeholder="원하지 않는 요소들을 설명하세요"
            rows={3}
            className="w-full rounded-lg border border-white/20 bg-black/30 backdrop-blur-md p-2 text-xs focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 focus:outline-none resize-y transition-colors placeholder:text-gray-400 text-white"
          />
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-white mb-2">
            CFG Scale: {settings.cfg_scale || 0.5}
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={settings.cfg_scale || 0.5}
            onChange={(e) => updateSettings({ cfg_scale: parseFloat(e.target.value) })}
            className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0.1 (자유로운)</span>
            <span>1.0 (정확한)</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            값이 높을수록 프롬프트를 더 정확히 따릅니다
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-white mb-1">
            해상도
          </label>
          <div className="p-2 bg-black/30 backdrop-blur-md border border-white/10 rounded-lg">
            <p className="text-xs text-gray-300">
              1080p (자동 설정)
            </p>
          </div>
        </div>

        {this.renderDescription(
          "Kling 2.1 Master: 최고급 이미지-비디오 변환 모델. 뛰어난 움직임의 유연성과 영화적 비주얼, 프롬프트 정확도를 제공합니다."
        )}
      </>
    );
  }
}
