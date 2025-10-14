import { useState, useEffect } from 'react';
import { ImageItem } from '../types/Image';
import { FilterOptions } from '../types/filter';
import { getSimpleSize } from '../utils/fileUtils';

export function useImageFilter(images: ImageItem[]) {
    const [filteredImages, setFilteredImages] = useState<ImageItem[]>(images);
    const [filters, setFilters] = useState<FilterOptions>({
        search: '',
        categories: [],
        size: '모든 크기',
        sortBy: '최신순'
    });

    useEffect(() => {
        let filtered = [...images];

        // 검색어 필터링
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(
                (image) =>
                    image.fileName.toLowerCase().includes(searchLower) ||
                    image.category?.toLowerCase().includes(searchLower)
            );
        }

        // 카테고리 필터링
        if (filters.categories.length > 0 && !filters.categories.includes('모든 이미지')) {
            filtered = filtered.filter((image) =>
                image.category ? filters.categories.includes(image.category) : false
            );
        }

        // 크기 필터링
        if (filters.size !== '모든 크기') {
            filtered = filtered.filter(
                (image) => getSimpleSize(image.fileSize) === filters.size
            );
        }

        // 정렬
        if (filters.sortBy === '최신순') {
            filtered = filtered.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        } else if (filters.sortBy === '오래된순') {
            filtered = filtered.sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
        }

        setFilteredImages(filtered);
    }, [images, filters]);

    return {
        filteredImages,
        filters,
        setFilters
    };
} 