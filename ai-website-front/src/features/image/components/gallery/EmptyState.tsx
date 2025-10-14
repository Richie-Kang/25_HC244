export default function EmptyState() {
    return (
        <div className="text-center py-12">
            <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <h3 className="mt-2 text-xl font-medium text-white">
                검색 결과가 없습니다
            </h3>
            <p className="mt-1 text-gray-400">
                다른 검색어나 필터를 시도해보세요.
            </p>
        </div>
    );
} 