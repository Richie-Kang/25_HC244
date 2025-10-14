import React from "react";
import { ModelSettingBase } from "../ModelSettingBase";
import { ModelSettingProps, ImagePixverseModelSettings, AspectRatioType, ResolutionType } from "../../../videoGeneration/types/modelSettingTypes";

export class ImagePixverseModelSetting extends ModelSettingBase {
    renderSettings({ updateSettings, currentSettings }: ModelSettingProps) {
        const settings = currentSettings as ImagePixverseModelSettings;

        // 디버깅을 위한 로그 (개발 환경에서만)
        if (process.env.NODE_ENV === 'development') {
            console.log('[Pixverse Settings] 전체:', settings);
            console.log('[Pixverse Settings] style:', settings.style);
            console.log('[Pixverse Settings] style 타입:', typeof settings.style);
        }

        return (
            <>
                <div>
                    <label className="block text-xs font-medium text-white mb-1">
                        비율
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {["16:9", "9:16", "1:1"].map((ratio) => (
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
                                    onChange={() => updateSettings({ aspectRatio: ratio as AspectRatioType })}
                                    className="sr-only"
                                />
                                {ratio === "16:9" && (
                                    <div
                                        className={`w-3 h-2 border bg-transparent ${settings.aspectRatio === "16:9"
                                            ? "border-sky-500"
                                            : "border-white/30"
                                            }`}
                                    ></div>
                                )}
                                {ratio === "9:16" && (
                                    <div
                                        className={`w-2 h-3 border bg-transparent ${settings.aspectRatio === "9:16"
                                            ? "border-sky-500"
                                            : "border-white/30"
                                            }`}
                                    ></div>
                                )}
                                {ratio === "1:1" && (
                                    <div
                                        className={`w-3 h-3 border bg-transparent ${settings.aspectRatio === "1:1"
                                            ? "border-sky-500"
                                            : "border-white/30"
                                            }`}
                                    ></div>
                                )}
                                <span>{ratio}</span>
                            </label>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {["4:3", "3:4"].map((ratio) => (
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
                                    onChange={() => updateSettings({ aspectRatio: ratio as AspectRatioType })}
                                    className="sr-only"
                                />
                                {ratio === "4:3" && (
                                    <div
                                        className={`w-3 h-2.5 border bg-transparent ${settings.aspectRatio === "4:3"
                                            ? "border-sky-500"
                                            : "border-white/30"
                                            }`}
                                    ></div>
                                )}
                                {ratio === "3:4" && (
                                    <div
                                        className={`w-2.5 h-3 border bg-transparent ${settings.aspectRatio === "3:4"
                                            ? "border-sky-500"
                                            : "border-white/30"
                                            }`}
                                    ></div>
                                )}
                                <span>{ratio}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-xs font-medium text-white mb-1">
                        해상도
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {["720p", "1080p"].map((res) => (
                            <label
                                key={res}
                                className={`flex items-center justify-center py-2 rounded border cursor-pointer text-xs transition-all duration-200 transform hover:scale-105 ${settings.resolution === res
                                    ? "bg-sky-500/20 border-sky-500 text-sky-500"
                                    : "border-white/10 text-gray-300 hover:bg-white/5 hover:border-sky-500/30"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="resolution"
                                    value={res}
                                    checked={settings.resolution === res}
                                    onChange={(e) => updateSettings({ resolution: e.target.value as ResolutionType })}
                                    className="sr-only"
                                />
                                {res}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-xs font-medium text-white mb-1">
                        길이
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {["5", "8"].map((dur) => {
                            // duration 값이 "5s" 형태일 수 있으므로 비교할 때 숫자 부분만 추출
                            const currentDurationValue = settings.duration?.toString().replace('s', '');
                            const isSelected = currentDurationValue === dur;

                            // 디버깅을 위한 로그 (개발 환경에서만)
                            if (process.env.NODE_ENV === 'development') {
                                console.log(`[Duration Check] dur: ${dur}, currentDurationValue: ${currentDurationValue}, isSelected: ${isSelected}, original: ${settings.duration}`);
                            }

                            return (
                                <label
                                    key={dur}
                                    className={`flex items-center justify-center py-2 rounded border cursor-pointer text-xs transition-all duration-200 transform hover:scale-105 ${isSelected
                                        ? "bg-sky-500/20 border-sky-500 text-sky-500"
                                        : "border-white/10 text-gray-300 hover:bg-white/5 hover:border-sky-500/30"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="duration"
                                        value={dur}
                                        checked={isSelected}
                                        onChange={(e) => updateSettings({ duration: e.target.value as "5" | "8" })}
                                        className="sr-only"
                                    />
                                    {dur}초
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-xs font-medium text-white mb-1">
                        스타일
                    </label>
                    <select
                        value={settings.style || "anime"}
                        onChange={(e) => {
                            console.log('[Pixverse Style] 변경 시도:', e.target.value);
                            console.log('[Pixverse Style] 현재 settings.style:', settings.style);
                            console.log('[Pixverse Style] updateSettings 함수:', updateSettings);
                            updateSettings({ style: e.target.value as "anime" | "3d_animation" | "clay" | "comic" | "cyberpunk" });
                        }}
                        className="w-full p-2 bg-black/30 backdrop-blur-md border border-white/10 rounded-lg text-xs text-white focus:border-sky-500 focus:outline-none"
                    >
                        <option value="anime">애니메 (기본)</option>
                        <option value="3d_animation">3D 애니메이션</option>
                        <option value="clay">클레이 애니메이션</option>
                        <option value="comic">코믹</option>
                        <option value="cyberpunk">사이버펑크</option>
                    </select>
                </div>

                <div className="mt-4">
                    <label className="block text-xs font-medium text-white mb-1">
                        네거티브 프롬프트 (선택사항)
                    </label>
                    <textarea
                        value={settings.negative_prompt || ""}
                        onChange={(e) => updateSettings({ negative_prompt: e.target.value })}
                        placeholder="제외하고 싶은 요소들을 입력하세요"
                        className="w-full p-2 bg-black/30 backdrop-blur-md border border-white/10 rounded-lg text-xs text-white focus:border-sky-500 focus:outline-none resize-none"
                        rows={2}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        예: blurry, low quality, distorted, pixelated
                    </p>
                </div>

                {this.renderDescription(
                    "Pixverse는 고품질 이미지-비디오 변환을 제공합니다. 다양한 스타일과 해상도 옵션으로 창의적인 영상을 만들어보세요."
                )}
            </>
        );
    }
}
