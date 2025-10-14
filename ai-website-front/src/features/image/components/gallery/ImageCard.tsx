"use client";

import { ImageItem } from "../../types/Image";
import { useAuth } from "@/features/user/AuthContext";
import { useRouter } from "next/navigation";

interface ImageCardProps {
    image: ImageItem;
    onDownload: (e: React.MouseEvent, image: ImageItem) => void;
}

export default function ImageCard({ image, onDownload }: ImageCardProps) {
    const router = useRouter();
    const { isLoggedIn } = useAuth();

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            router.push("/login");
            return;
        }
        onDownload(e, image);
    };

    return (
        <div className="mb-4 break-inside-avoid bg-black/40 backdrop-blur-xl rounded-lg border border-white/20 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 group relative hover:scale-[1.02] hover:bg-black/80 hover:border-white/30">
            <div className="relative">
                <img
                    src={image.url}
                    alt={image.fileName}
                    className="w-full object-cover"
                    loading="lazy"
                />
                {/* 호버 시 표시되는 그라데이션 효과 */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></div>

                {/* 왼쪽 하단 파일명과 다운로드 버튼 */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium truncate group-hover:text-sky-500 transition-colors duration-300">
                        {image.fileName.split('.').slice(0, -1).join('.')}
                    </span>
                    <button
                        onClick={handleDownload}
                        className="bg-sky-500 hover:bg-sky-600 rounded-full p-1.5 ml-2 transition-colors"
                        title="다운로드 (로그인 필요)"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
} 