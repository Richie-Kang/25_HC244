"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const SearchImage = () => {
    const searchParams = useSearchParams();
    const query = searchParams ? searchParams.get("query") : "";
    const category = searchParams ? searchParams.get("category") : "";

    interface SearchResult {
        url: string;
        name: string;
        width: number;
        height: number;
    }

    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

    useEffect(() => {
        const fetchSearchResults = async () => {
            setIsLoading(true); // 로딩 시작
            try {
                let apiUrl = "http://localhost:8080/api/images/search";
                if (query) {
                    apiUrl += `?imageName=${query}`;
                } else if (category) {
                    apiUrl += `?category=${category}`;
                }

                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error("Failed to fetch images");
                }

                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.error("Error fetching search results:", error);
            } finally {
                setIsLoading(false); // 로딩 종료
            }
        };

        if (query || category) {
            fetchSearchResults();
        }
    }, [query, category]);

    return (
        <section className="px-4 pt-6 pb-12 bg-black text-white md:px-16 md:pt-12 md:pb-14">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">
                    검색 결과{" "}
                    <span className="text-sky-500">
                        {query ? `"${query}"` : category ? `"${category}"` : ""}
                    </span>
                </h1>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-gray-400">검색 중...</p>
                        </div>
                    </div>
                ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {searchResults.map((result, index) => (
                            <div
                                key={index}
                                className="relative bg-black/40 backdrop-blur-xl rounded-lg overflow-hidden border border-white/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 group hover:scale-[1.02] hover:bg-black/80 hover:border-white/30"
                                style={{
                                    gridRowEnd: `span ${Math.ceil((result.height / result.width) * 10)}`,
                                }}
                            >
                                <img
                                    src={result.url}
                                    alt={result.name}
                                    className="w-full h-full object-cover rounded-lg transition-all duration-300 ease-in-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></div>
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <p className="text-white font-semibold group-hover:text-sky-500 transition-colors duration-300">{result.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
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
                            다른 검색어를 시도해보세요.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default SearchImage;
