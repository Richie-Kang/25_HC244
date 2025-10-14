export const getSimpleSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024 * 1024) return '작은 크기';
    if (sizeInBytes < 5 * 1024 * 1024) return '중간 크기';
    return '큰 크기';
};

export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}; 