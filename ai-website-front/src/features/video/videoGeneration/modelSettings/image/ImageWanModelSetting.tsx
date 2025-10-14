// modelSettings/image/ImageWanModelSetting.tsx
import React from "react";
import { ModelSettingBase } from "../ModelSettingBase";
import { ModelSettingProps, ImageWanModelSettings } from "../../../videoGeneration/types/modelSettingTypes";

export class ImageWanModelSetting extends ModelSettingBase {
  renderSettings({ updateSettings, currentSettings }: ModelSettingProps): React.ReactNode {
    const settings = currentSettings as ImageWanModelSettings;

    return (
      <div className="space-y-4">
        {this.renderDescription(
          "WAN Pro - 강력한 이미지 투 비디오 변환. 고품질 6초 1080p 영상을 30fps로 생성합니다."
        )}

        {/* 시드 설정 - 선택 사항 */}
        <div>
          <label className="block text-xs font-medium text-white mb-1">
            시드 값 (선택사항)
          </label>
          <input
            type="number"
            value={settings.seed || ""}
            onChange={(e) =>
              updateSettings({
                seed: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            placeholder="시드 값 입력 (비워두면 랜덤 생성)"
            className="w-full rounded-lg border border-white/10 bg-black/30 backdrop-blur-md p-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder:text-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            동일한 시드로 비슷한 결과를 재생성할 수 있습니다. 값을 비워두면 자동 생성됩니다.
          </p>
        </div>

        {/* 안전 검사기 설정 */}
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableSafetyChecker ?? true}
              onChange={(e) =>
                updateSettings({ enableSafetyChecker: e.target.checked })
              }
              className="rounded border-white/10 text-sky-500 focus:ring-sky-500 bg-black/30"
            />
            <span className="text-xs font-medium text-white">
              안전 검사기 활성화
            </span>
          </label>
          <p className="text-xs text-gray-400 mt-1 pl-6">
            부적절한 콘텐츠 생성 방지를 위한 필터링 (기본값: 활성화)
          </p>
        </div>

        {/* 모델 정보 섹션 */}
        <div className="rounded-lg bg-sky-500/10 p-3 border border-sky-500/20">
          <h4 className="text-xs font-medium text-sky-400 mb-1">WAN Pro 모델 정보</h4>
          <p className="text-xs text-gray-300">
            • 고정: 6초 길이의 1080p 고화질 영상<br />
            • 고정: 30 FPS의 부드러운 움직임<br />
            • 최적화된 화질과 안정적인 생성<br />
            • 간결하고 명확한 프롬프트에서 최상의 결과<br />
            • 비율 및 해상도는 모델에서 자동 결정됨
          </p>
        </div>
      </div>
    );
  }
}
