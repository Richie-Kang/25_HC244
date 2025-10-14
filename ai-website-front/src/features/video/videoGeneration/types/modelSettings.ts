export interface BaseModelSettings {
    numFrames?: number;
    framesPerSecond?: number;
    numInferenceSteps?: number;
    enableSafetyChecker?: boolean;
    enablePromptExpansion?: boolean;
    i2vStability?: number;
}

export interface ImageHunyuanModelSettings extends BaseModelSettings {
    numFrames: number;
    numInferenceSteps: number;
    enableSafetyChecker: boolean;
    enablePromptExpansion: boolean;
    i2vStability: number;
}

export interface ImageWanModelSettings extends BaseModelSettings {
    numFrames: number;
    framesPerSecond: number;
    numInferenceSteps: number;
    enableSafetyChecker: boolean;
    enablePromptExpansion: boolean;
}

export interface ImageKlingModelSettings extends BaseModelSettings {
    numFrames: number;
    framesPerSecond: number;
    numInferenceSteps: number;
}

export type ModelSettings = ImageHunyuanModelSettings | ImageWanModelSettings | ImageKlingModelSettings; 