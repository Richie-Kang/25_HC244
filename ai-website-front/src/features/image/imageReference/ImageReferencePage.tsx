"use client";

import { useState, useEffect } from "react";
import { ImageItem } from "../types/Image";
import { getImages, downloadImage } from "../services/ImageService";
import { useImageFilter } from "../hooks/useImageFilter";
import Sidebar from "./Sidebar";
import ImageGallery from "../components/gallery/ImageGallery";

export default function ImageReferencePage() {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { filteredImages, setFilters } = useImageFilter(images);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                setIsLoading(true);
                const fetchedImages = await getImages();
                setImages(fetchedImages);
            } catch (err) {
                setError((err as Error).message);
                console.error("Error fetching images:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages();
    }, []);

    const handleDownload = async (e: React.MouseEvent, image: ImageItem) => {
        e.stopPropagation();
        try {
            await downloadImage(image.url, image.fileName);
        } catch (error) {
            console.error("Error downloading image:", error);
        }
    };

    return (
        <div className="flex h-screen bg-black">
            <Sidebar onFilterChange={setFilters} />
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-8">
                    <ImageGallery
                        images={filteredImages}
                        onDownload={handleDownload}
                        isLoading={isLoading}
                        error={error}
                    />
                </div>
            </div>
        </div>
    );
} 