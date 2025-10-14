export interface ImageGenerationSettings {
    prompt: string;
    endpoint: string;
    width: number;
    height: number;
    guidanceScale: number;
    numInferenceSteps: number;
    numOutputs: number;
    modelId: string;
    negativePrompt?: string;
    imageFile?: File;
}

export interface GeneratedImage {
    url: string;
    prompt: string;
    endpoint: string;
    width: number;
    height: number;
    guidanceScale: number;
    numInferenceSteps: number;
    modelId: string;
    negativePrompt?: string;
    referenceImage?: string;
}

export interface ImageSidebarProps {
    onSubmit: (settings: ImageGenerationSettings) => void;
    onTabChange: (tab: string) => void;
    activeTab: string;
    referenceImage?: string;
    prompt?: string;
    isLoading?: boolean;
}

export type ImageGenerationStatus = 'idle' | 'generating' | 'success' | 'error'; 