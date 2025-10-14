"use client";

import { useState } from "react";

interface SidebarProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  search: string;
  categories: string[];
  duration: string;
}

// 사이드바 카테고리 데이터
const categories = [
  "모든 비디오",
  // 카테고리 예시 제거됨
];

const durations = ["모든 길이", "짧은 영상", "중간 길이", "긴 영상"];

export default function Sidebar({ onFilterChange }: SidebarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    categories: [],
    duration: "모든 길이",
  });

  // 변경: 초기값을 true로 설정하여 사이드바가 기본적으로 닫힌 상태로 시작
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, search: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];

    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDurationChange = (duration: string) => {
    const newFilters = { ...filters, duration };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div
      className={`bg-black/40 backdrop-blur-xl h-full ${isCollapsed ? "w-16" : "w-64"
        } flex flex-col border-r border-white/20 transition-all duration-300`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/20 flex items-center justify-between">
        {!isCollapsed && <h2 className="text-xl font-semibold text-white">필터</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-white/10 text-white"
        >
          {isCollapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="비디오 검색..."
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-gray-400"
                value={filters.search}
                onChange={handleSearchChange}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Categories Section */}
          <div className="mb-6">
            <button
              className="flex items-center justify-between w-full text-left font-medium mb-2 text-white"
              onClick={() => toggleSection("categories")}
            >
              <span>카테고리</span>
              <svg
                className={`h-5 w-5 transition-transform ${activeSection === "categories" ? "rotate-180" : ""
                  }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {activeSection === "categories" && (
              <div className="space-y-2 ml-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={category}
                      checked={filters.categories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="h-4 w-4 text-sky-500 border-white/20 rounded focus:ring-sky-500 bg-black/40"
                    />
                    <label
                      htmlFor={category}
                      className="ml-2 text-sm text-gray-300"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Duration Section */}
          <div className="mb-6">
            <button
              className="flex items-center justify-between w-full text-left font-medium mb-2 text-white"
              onClick={() => toggleSection("duration")}
            >
              <span>영상 길이</span>
              <svg
                className={`h-5 w-5 transition-transform ${activeSection === "duration" ? "rotate-180" : ""
                  }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {activeSection === "duration" && (
              <div className="space-y-2 ml-2">
                {durations.map((duration) => (
                  <div key={duration} className="flex items-center">
                    <input
                      type="radio"
                      id={duration}
                      name="duration"
                      checked={filters.duration === duration}
                      onChange={() => handleDurationChange(duration)}
                      className="h-4 w-4 text-sky-500 border-white/20 focus:ring-sky-500 bg-black/40"
                    />
                    <label
                      htmlFor={duration}
                      className="ml-2 text-sm text-gray-300"
                    >
                      {duration}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
