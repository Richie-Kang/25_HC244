"use client";

import { ImageItem } from "../../types/Image";
import ImageCard from "./ImageCard";
import EmptyState from "./EmptyState";

interface ImageGalleryProps {
    images: ImageItem[];
    onDownload: (e: React.MouseEvent, image: ImageItem) => void;
    isLoading: boolean;
    error: string | null;
}

export default function ImageGallery({ images, onDownload, isLoading, error }: ImageGalleryProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <svg
                    className="mx-auto h-12 w-12 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
                <h3 className="mt-2 text-xl font-medium text-white">
                    오류가 발생했습니다
                </h3>
                <p className="mt-1 text-gray-400">{error}</p>
            </div>
        );
    }

    if (images.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {images.map((image) => (
                <ImageCard
                    key={image.id}
                    image={image}
                    onDownload={onDownload}
                />
            ))}
        </div>
    );
} 