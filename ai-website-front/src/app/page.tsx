"use client";

import { useRouter } from "next/navigation";
// Layers (다양한 모델), MousePointerClick (쉬운 사용성), Star (큐레이션/최적화) 등 새로운 아이콘 추가
import { ArrowRight, Sparkles, Briefcase, Layers, MousePointerClick, Star } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/studio");
  };

  const handleCustomModelInquiry = () => {
    router.push("/contact");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-pink-500/10 opacity-50" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />

        <div className="relative px-4 py-20 md:py-32">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Trynic
                </span>
              </h1>
              {/* 플랫폼 정체성을 '통합 플랫폼'으로 명확화 */}
              <p className="text-xl md:text-2xl text-gray-300 font-light">
                All-in-One AI 영상 생성 플랫폼
              </p>
            </div>

            {/* 헤드라인을 '선택'과 '쉬운 사용성'으로 변경 */}
            <div className="mb-12 max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                최고의 AI 영상 모델들을 <span className="text-sky-400">한 곳에서 선택</span>하고,
                <br />
                복잡한 프롬프트 없이 <span className="text-purple-400">감각적인 숏폼 광고</span>를 제작하세요.
              </h2>
            </div>

            <div className="mb-16">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleGetStarted}
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-sky-500 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-sky-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-[0_8px_30px_rgb(14,165,233,0.3)]"
                >
                  스튜디오 바로가기
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                {/* 버튼 문구를 '제휴 및 문의'로 변경 */}
                <button
                  onClick={handleCustomModelInquiry}
                  className="group inline-flex items-center px-8 py-4 bg-black/40 backdrop-blur-xl border-2 border-white/20 text-white text-lg font-semibold rounded-full hover:bg-white/10 hover:border-sky-400/50 transition-all duration-300 transform hover:scale-105 shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
                >
                  제휴 및 문의
                  <Briefcase className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              왜 <span className="text-sky-400">Trynic</span>인가?
            </h3>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              여러 AI 서비스를 찾아 헤매는 데 시간을 낭비하지 마세요.
              <br className="hidden md:block" />
              Trynic은 최고의 도구들을 모아 가장 쉬운 영상 제작 경험을 제공합니다.
            </p>
          </div>

          {/* 새로운 핵심가치 3가지를 반영한 Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-sky-500/30 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-sky-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-8 h-8 text-sky-400" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-4">스마트한 AI 모델 선택</h4>
              <p className="text-gray-400 leading-relaxed">
                Kling, Veo, Pixverse 등 최신 AI 모델들을 직접 선택하거나, <span className="text-sky-400 font-semibold">Auto-Select</span> 기능으로 이미지와 프롬프트에 최적화된 모델을 자동으로 추천받아 최상의 결과물을 만드세요.
              </p>
            </div>

            <div className="group p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-purple-500/30 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MousePointerClick className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-4">직관적인 인터페이스</h4>
              <p className="text-gray-400 leading-relaxed">
                더 이상 복잡한 프롬프트와 씨름하지 마세요. 만들고 싶은 영상과 유사한 이미지나 키워드만으로 원하는 결과물을 얻을 수 있습니다.
              </p>
            </div>

            <div className="group p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-pink-500/30 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500/20 to-sky-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 text-pink-400" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-4">패션 콘텐츠 최적화</h4>
              <p className="text-gray-400 leading-relaxed">
                최신 패션 트렌드와 스타일에 맞는 수많은 레퍼런스와 템플릿을 제공하여, 당신의 아이디어를 가장 손쉽게 현실로 만듭니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works Section */}
      <div className="py-20 px-4 bg-gradient-to-b from-transparent to-black/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              단 4단계로 <span className="text-sky-400">패션 영상을 제작</span>하세요
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-sky-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                1
              </div>
              <h4 className="text-xl font-bold text-white mb-4">제품 및 레퍼런스 업로드</h4>
              <p className="text-gray-400">
                영상으로 만들고 싶은 제품 이미지와 원하는 스타일의 레퍼런스(이미지, 영상)를 업로드하세요.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                2
              </div>
              <h4 className="text-xl font-bold text-white mb-4">영상 레퍼런스 탐색 및 선택</h4>
              <p className="text-gray-400">
                영상 레퍼런스 갤러리에서 원하는 스타일과 분위기의 영상을 탐색하고 선택하세요.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                3
              </div>
              <h4 className="text-xl font-bold text-white mb-4">이미지 업로드 및 모델 최적화</h4>
              <p className="text-gray-400">
                영상 생성 페이지에서 자신의 이미지를 업로드하고, 프롬프트를 조정하세요. Auto-Select 기능이 자동으로 최적의 AI 모델을 추천합니다.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                4
              </div>
              <h4 className="text-xl font-bold text-white mb-4">AI 영상 생성</h4>
              <p className="text-gray-400">
                최적화된 설정으로 AI가 자동으로 숏폼 광고 영상을 몇 분 안에 생성합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            지금 <span className="text-sky-400">Trynic</span>으로
            <br />
            가장 스마트하게 AI 영상을 제작해보세요
          </h3>
          <p className="text-xl text-gray-400 mb-8">
            무료 체험으로 최고의 AI 모델들을 한 곳에서 경험하세요.
          </p>
          <button
            onClick={handleGetStarted}
            className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-sky-500 to-purple-600 text-white text-xl font-semibold rounded-full hover:from-sky-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-[0_8px_30px_rgb(14,165,233,0.3)]"
          >
            무료로 시작하기
            <Sparkles className="ml-3 w-6 h-6 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}