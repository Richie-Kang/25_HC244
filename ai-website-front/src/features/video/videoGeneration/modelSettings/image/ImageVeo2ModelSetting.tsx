import React from "react";
import { ModelSettingBase } from "../ModelSettingBase";
import { ModelSettingProps, ImageVeo2ModelSettings, AspectRatioType } from "../../../videoGeneration/types/modelSettingTypes";

export class ImageVeo2ModelSetting extends ModelSettingBase {
    renderSettings({ updateSettings, currentSettings }: ModelSettingProps): React.ReactNode {
        const settings = currentSettings as ImageVeo2ModelSettings;

        return (
            <div className="space-y-4">
                {this.renderDescription(
                    "Veo2 모델을 사용한 자연스러운 이미지 애니메이션 생성"
                )}

                {/* 비율 설정 */}
                <div>
                    <label className="block text-xs font-medium text-white mb-1">
                        비율
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(["auto", "auto_prefer_portrait", "16:9", "9:16"] as AspectRatioType[]).map((ratio) => (
                            <label
                                key={ratio}
                                className={`flex items-center justify-between w-full py-2 px-3 rounded-lg border cursor-pointer text-xs transition-transform duration-200 transform hover:scale-105 ${settings.aspectRatio === ratio
                                    ? "border-sky-500 bg-sky-500/20 text-sky-500"
                                    : "border-white/10 text-gray-300 hover:bg-white/5"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="aspectRatio"
                                    value={ratio}
                                    checked={settings.aspectRatio === ratio}
                                    onChange={(e) =>
                                        updateSettings({ aspectRatio: e.target.value as AspectRatioType })
                                    }
                                    className="sr-only"
                                />
                                {ratio === "16:9" ? (
                                    <div
                                        className={`w-3 h-2 border ${settings.aspectRatio === "16:9"
                                            ? "border-sky-500"
                                            : "border-white/30"
                                            }`}
                                    />
                                ) : ratio === "9:16" ? (
                                    <div
                                        className={`w-2 h-3 border ${settings.aspectRatio === "9:16"
                                            ? "border-sky-500"
                                            : "border-white/30"
                                            }`}
                                    />
                                ) : (
                                    <div
                                        className={`w-2.5 h-2.5 border ${settings.aspectRatio === ratio
                                            ? "border-sky-500"
                                            : "border-white/30"
                                            }`}
                                    />
                                )}
                                <span>{ratio.replace("_", " ")}</span>
                            </label>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        720p 해상도로 출력됩니다
                    </p>
                </div>

                {/* 영상 길이 설정 */}
                <div>
                    <label className="block text-xs font-medium text-white mb-1">
                        길이
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                        {["5s", "6s", "7s", "8s"].map((dur) => (
                            <label
                                key={dur}
                                className={`flex items-center justify-center py-1 rounded border cursor-pointer text-xs ${settings.duration === dur
                                    ? "bg-sky-500/20 border-sky-500 text-sky-500"
                                    : "border-white/10 text-gray-300 hover:bg-white/5"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="duration"
                                    value={dur}
                                    checked={settings.duration === dur}
                                    onChange={(e) => updateSettings({ duration: e.target.value as "5s" | "6s" | "7s" | "8s" })}
                                    className="sr-only"
                                />
                                {dur}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
} 