// components/blog/BlogList.tsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getBlogList } from "./services/BlogService";
import { Blog } from "./types/Blog";

const BlogList = () => {
  const [blogPosts, setBlogPosts] = useState<Blog[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        // BlogService를 사용하여 데이터 가져오기
        const data = await getBlogList();
        setBlogPosts(data);
      } catch (err) {
        console.error(err);
        setError("블로그 데이터를 가져오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  if (loading) {
    return (
      <div className="py-32 flex justify-center items-center bg-black">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400 font-medium">
            콘텐츠를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-32 flex justify-center items-center bg-black">
        <div className="text-center p-8 bg-black/40 backdrop-blur-xl rounded-lg border border-white/20 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-500/20 text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            오류가 발생했습니다
          </h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 md:py-28 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            AI 영상 제작의 <span className="text-sky-400">인사이트</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <div
              key={post.id || index}
              className="transform transition-all duration-300 hover:-translate-y-2"
            >
              <Link
                href={`/blog/blogSection/${post.id}`}
                className="block h-full"
              >
                <div className="bg-black/40 backdrop-blur-xl rounded-xl overflow-hidden border border-white/20 h-full group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.02] hover:bg-black/80 hover:border-white/30 transition-all duration-500">
                  <div className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/20 rounded-bl-full -translate-y-8 translate-x-8 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-700 ease-in-out z-0"></div>
                    {post.image && (
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-6 relative">

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors duration-300">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 mb-4 line-clamp-2">
                      {post.subtitle}
                    </p>
                    <div className="flex justify-between items-center text-sm mt-auto pt-4 border-t border-white/10">
                      <span className="text-gray-300 font-medium">
                        {post.author}
                      </span>
                      <span className="text-gray-400">
                        {post.date
                          ? new Date(post.date).toLocaleDateString("ko-KR")
                          : "날짜 없음"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {blogPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">작성된 블로그 포스트가 없습니다.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogList;
