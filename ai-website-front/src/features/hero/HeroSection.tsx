"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Camera, Sparkles, Video, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

type CategoryItem = {
  title: string;
  subtitle: string;
  value: string;
  icon: React.ReactNode;
  label?: string;
  leftImage?: string;
  rightImage?: string;
};

const CategoryBox = ({
  items,
  onSelect,
}: {
  items: CategoryItem[];
  onSelect: (item: CategoryItem) => void;
}) => {
  const videoGeneration = items.find(
    (item) => item.value === "video-generation"
  );
  const imageEdit = items.find((item) => item.value === "image-edit");
  const videoReference = items.find((item) => item.value === "video-reference");
  const otherImageItems = items.filter((item) =>
    item.value.includes("image") && item.value !== "image-edit"
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full mt-8">
      {/* First Row */}
      {videoGeneration && (
        <div className="col-span-1 sm:col-span-2 md:col-span-2">
          <Card
            className="cursor-pointer transition-all duration-500 overflow-hidden group relative border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl min-h-[280px] hover:scale-[1.02] hover:shadow-2xl"
            onClick={() => onSelect(videoGeneration)}
          >


            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-center mb-6 flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-300/30 rounded-2xl flex items-center justify-center shadow-lg">
                    <Video className="w-8 h-8 text-blue-300" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-purple-300" />
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-300/30 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-purple-300" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <CardTitle className="text-xl font-bold text-white mb-2">
                  {videoGeneration.title}
                </CardTitle>
                <p className="text-sm text-gray-300">
                  {videoGeneration.subtitle}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {imageEdit && (
        <div className="col-span-1 sm:col-span-2 md:col-span-2">
          <Card
            className="cursor-pointer transition-all duration-500 overflow-hidden group relative border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl min-h-[280px] hover:scale-[1.02] hover:shadow-2xl"
            onClick={() => onSelect(imageEdit)}
          >


            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-center mb-6 flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-rose-500/20 to-pink-500/20 backdrop-blur-sm border border-rose-300/30 rounded-2xl flex items-center justify-center shadow-lg">
                    <Camera className="w-8 h-8 text-rose-300" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-pink-300" />
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500/20 to-violet-500/20 backdrop-blur-sm border border-pink-300/30 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-pink-300" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <CardTitle className="text-xl font-bold text-white mb-2">
                  {imageEdit.title}
                </CardTitle>
                <p className="text-sm text-gray-300">
                  {imageEdit.subtitle}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Second Row */}
      {videoReference && (
        <div className="col-span-1">
          <Card
            className="cursor-pointer transition-all h-full duration-500 overflow-hidden group relative border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover:scale-[1.02] hover:shadow-2xl"
            onClick={() => onSelect(videoReference)}
          >


            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-center mb-4 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm border border-emerald-300/30 rounded-xl flex items-center justify-center shadow-lg">
                    <Camera className="w-6 h-6 text-emerald-300" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-cyan-300" />
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-300/30 rounded-xl flex items-center justify-center shadow-lg">
                    <Video className="w-6 h-6 text-cyan-300" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <CardTitle className="text-lg font-bold text-white mb-1">
                  {videoReference.title}
                </CardTitle>
                <p className="text-xs text-gray-300">
                  {videoReference.subtitle}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {otherImageItems.map((item, index) => (
        <div key={index} className="col-span-1">
          <Card
            className="cursor-pointer transition-all duration-500 overflow-hidden group relative border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl h-full hover:scale-[1.02] hover:shadow-2xl"
            onClick={() => onSelect(item)}
          >
            <div className="p-4 h-full flex flex-col justify-center">
              <div className="text-center">
                <CardTitle className="text-lg font-bold text-white mb-1">
                  {item.title}
                </CardTitle>
                <p className="text-xs text-gray-300">{item.subtitle}</p>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};

const HeroSection = () => {
  const router = useRouter();

  const categories: CategoryItem[] = [
    {
      title: "AI 영상 제작",
      subtitle: "나만의 영상을 손쉽게 만들어보세요",
      value: "video-generation",
      icon: <Video className="w-7 h-7" />,
      label: "인기 기능",
    },
    {
      title: "옷 수정",
      subtitle: "이미지 속 옷을 수정해보세요",
      value: "image-edit",
      icon: <Camera className="w-6 h-6 text-rose-300" />,
      label: "최고 품질",
    },
    {
      title: "이미지 업스케일링",
      subtitle: "이미지 해상도를 개선해보세요",
      value: "image-upscaler",
      icon: null,
      label: "베타 기능",
    },
    {
      title: "영상 갤러리",
      subtitle: "고품질 영상 모음집",
      value: "image-video-reference",
      icon: null,
      label: "베타 기능",
    },

    {
      title: "이미지 갤러리",
      subtitle: "AI 생성 이미지 모음",
      value: "image-reference",
      icon: null,
      label: "베타 기능",
    },
  ];

  const handleCategorySelect = (item: CategoryItem) => {
    const routes: Record<string, string> = {
      "image-generation": "/generation/image",
      "video-generation": "/generation/video",
      "image-reference": "/reference/image",
      "video-reference": "/reference/video/main",
      "image-video-reference": "/reference/video/main",
      "image-edit": "/image/edit",
      "image-upscaler": "/image/upscaler",
    };
    router.push(routes[item.value]);
  };

  return (
    <div className="py-10 md:py-16 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-left mb-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
            창작을 시작하세요
          </h1>
        </div>

        <CategoryBox items={categories} onSelect={handleCategorySelect} />
      </div>
    </div>
  );
};

export default HeroSection;
