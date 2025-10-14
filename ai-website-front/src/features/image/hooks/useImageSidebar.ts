import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface ImageSubmitData {
    prompt: string;
    imageFile: File | null;
    endpoint: string;
    width: number;
    height: number;
    numOutputs: number;
    guidanceScale: number;
    seed?: number;
    enableSafetyChecker?: boolean;
    enablePromptExpansion?: boolean;
}

interface ImageSettings {
    endpoint?: string;
    width?: number;
    height?: number;
    numOutputs?: number;
    guidanceScale?: number;
    seed?: number;
    enableSafetyChecker?: boolean;
    enablePromptExpansion?: boolean;
}

interface UseImageSidebarProps {
    onSubmit: (data: ImageSubmitData) => void;
    onTabChange: (tab: string) => void;
    referenceImageFile?: File | null;
    referenceImageUrl?: string;
    referencePrompt?: string;
    referenceModel?: string;
}

export function useImageSidebar({
    onSubmit,
    onTabChange,
    referenceImageFile,
    referenceImageUrl,
    referencePrompt,
    referenceModel,
}: UseImageSidebarProps) {
    const [activeTab, setActiveTab] = useState<"image" | "text">("image");
    const [prompt, setPrompt] = useState(referencePrompt || "");
    const [endpoint, setEndpoint] = useState(referenceModel || "sdxl");
    const [imageFile, setImageFile] = useState<File | null>(referenceImageFile || null);
    const [imageChanged, setImageChanged] = useState(false);

    // 설정 상태
    const [width, setWidth] = useState(512);
    const [height, setHeight] = useState(512);
    const [numOutputs, setNumOutputs] = useState(1);
    const [guidanceScale, setGuidanceScale] = useState(7.5);
    const [seed, setSeed] = useState(-1);
    const [enableSafetyChecker, setEnableSafetyChecker] = useState(true);
    const [enablePromptExpansion, setEnablePromptExpansion] = useState(true);

    useEffect(() => {
        if (referenceImageFile) {
            setImageFile(referenceImageFile);
            setImageChanged(true);
        } else if (referenceImageUrl) {
            setImageChanged(true);
        }
    }, [referenceImageFile, referenceImageUrl]);

    const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrompt(e.target.value);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("파일 크기는 10MB를 초과할 수 없습니다.");
                return;
            }
            setImageFile(file);
            setImageChanged(true);
        }
    };

    const handleTabSelection = (tab: "image" | "text") => {
        setActiveTab(tab);
        onTabChange(tab);
        if (!referenceModel || tab !== (referenceModel === "sdxl" ? "image" : "text")) {
            setEndpoint(tab === "image" ? "sdxl" : "sd-1.5");
        }
    };

    const updateSettings = (settings: ImageSettings) => {
        if (settings.endpoint !== undefined) setEndpoint(settings.endpoint);
        if (settings.width !== undefined) setWidth(settings.width);
        if (settings.height !== undefined) setHeight(settings.height);
        if (settings.numOutputs !== undefined) setNumOutputs(settings.numOutputs);
        if (settings.guidanceScale !== undefined) setGuidanceScale(settings.guidanceScale);
        if (settings.seed !== undefined) setSeed(settings.seed);
        if (settings.enableSafetyChecker !== undefined) setEnableSafetyChecker(settings.enableSafetyChecker);
        if (settings.enablePromptExpansion !== undefined) setEnablePromptExpansion(settings.enablePromptExpansion);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        toast.success("이미지 생성이 시작되었습니다. 완료되면 알림을 보내드립니다.", {
            duration: 5000,
        });

        onSubmit({
            prompt,
            imageFile,
            endpoint,
            width,
            height,
            numOutputs,
            guidanceScale,
            seed: endpoint === "sdxl" ? seed : undefined,
            enableSafetyChecker: endpoint === "sdxl" ? enableSafetyChecker : undefined,
            enablePromptExpansion: endpoint === "sdxl" ? enablePromptExpansion : undefined,
        });
    };

    const currentSettings = {
        width,
        height,
        numOutputs,
        guidanceScale,
        seed,
        enableSafetyChecker,
        enablePromptExpansion,
    };

    return {
        activeTab,
        prompt,
        endpoint,
        imageFile,
        imageChanged,
        handlePromptChange,
        handleImageChange,
        handleTabSelection,
        handleSubmit,
        updateSettings,
        currentSettings,
    };
} 