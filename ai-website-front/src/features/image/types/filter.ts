export interface FilterOptions {
    search: string;
    categories: string[];
    size: string;
    sortBy: 'latest' | 'oldest' | string;
}

export type SortOption = '최신순' | '오래된순';
export type SizeOption = '모든 크기' | '작은 크기' | '중간 크기' | '큰 크기'; 