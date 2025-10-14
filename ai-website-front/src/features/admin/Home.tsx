"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Label,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  FileText,
  Video,
  Image as ImageIcon,
  ArrowUpRight,
} from "lucide-react";

// 애니메이션 효과
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.7 },
};

// 1. 주간 개요 차트 데이터
const weeklyChartData = [
  { name: "1주차", visitors: 120, members: 40, inquiries: 10 },
  { name: "2주차", visitors: 150, members: 60, inquiries: 15 },
  { name: "3주차", visitors: 200, members: 75, inquiries: 20 },
  { name: "4주차", visitors: 250, members: 90, inquiries: 25 },
];

// 2. 파이 차트 데이터 & 설정
const pieChartData = [
  { browser: "Chrome", visitors: 275, fill: "#3b82f6" },
  { browser: "Safari", visitors: 200, fill: "#10b981" },
  { browser: "Firefox", visitors: 287, fill: "#f59e0b" },
  { browser: "Edge", visitors: 173, fill: "#8b5cf6" },
  { browser: "기타", visitors: 190, fill: "#6b7280" },
];

// 3. 인터랙티브 차트 데이터
const interactiveChartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
];

// 4. 계정 성장세 차트 데이터
const growthChartData = [
  { date: "1월", users: 1200 },
  { date: "2월", users: 1900 },
  { date: "3월", users: 2300 },
  { date: "4월", users: 3200 },
  { date: "5월", users: 4100 },
  { date: "6월", users: 5800 },
];

export default function Home() {
  // 요약 통계 데이터
  const summaryStats = [
    {
      title: "총 방문자",
      value: "12,486",
      change: "+15.3%",
      icon: <Users className="w-5 h-5" />,
      color: "bg-sky-500",
    },
    {
      title: "총 회원 수",
      value: "2,758",
      change: "+7.2%",
      icon: <FileText className="w-5 h-5" />,
      color: "bg-emerald-500",
    },
    {
      title: "생성된 영상",
      value: "8,549",
      change: "+22.5%",
      icon: <Video className="w-5 h-5" />,
      color: "bg-amber-500",
    },
    {
      title: "생성된 이미지",
      value: "32,294",
      change: "+31.8%",
      icon: <ImageIcon className="w-5 h-5" />,
      color: "bg-purple-500",
    },
  ];

  // 파이 차트: 전체 방문자 수 계산
  const totalPieVisitors = React.useMemo(() => {
    return pieChartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  // 인터랙티브 차트: 활성 차트와 총합 계산
  const [activeChart, setActiveChart] = React.useState<"desktop" | "mobile">(
    "desktop"
  );
  const interactiveTotals = React.useMemo(() => {
    return {
      desktop: interactiveChartData.reduce(
        (acc, curr) => acc + curr.desktop,
        0
      ),
      mobile: interactiveChartData.reduce((acc, curr) => acc + curr.mobile, 0),
    };
  }, []);

  return (
    <motion.div {...fadeIn} className="space-y-8">
      {/* 상단 요약 통계 카드 */}
      <motion.div
        {...fadeIn}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {summaryStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-600 text-sm font-medium">
                    {stat.title}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center text-white`}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-emerald-600 font-medium flex items-center">
                  {stat.change} <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </span>
                <span className="text-gray-500">지난 달 대비</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 계정 성장세 차트 */}
      <motion.div
        {...fadeIn}
        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">계정 성장세</h2>
            <p className="text-gray-600 text-sm">2024년 상반기 회원가입 추이</p>
          </div>
          <div className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-sm font-medium">
            <span className="mr-1">+</span>
            132%
          </div>
        </div>

        <div className="h-72">
          <ChartContainer
            config={{ users: { label: "회원 수", color: "#0ea5e9" } }}
            className="w-full h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthChartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <ChartTooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#0ea5e9"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </motion.div>

      {/* 주간 개요 및 디바이스 통계 */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
        {/* 주간 개요 차트 */}
        <motion.div
          {...fadeIn}
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-2">주간 추이</h2>
          <p className="text-gray-600 text-sm mb-5">
            주별 방문자, 회원가입, 문의 현황
          </p>

          <div className="h-64">
            <ChartContainer
              config={{
                visitors: { label: "방문자 수", color: "#0ea5e9" },
                members: { label: "회원 수", color: "#10b981" },
                inquiries: { label: "문의 글", color: "#f43f5e" },
              }}
              className="w-full h-full"
            >
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="visitors" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="members" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inquiries" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </motion.div>

        {/* 브라우저 통계 파이 차트 */}
        <motion.div
          {...fadeIn}
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            브라우저 통계
          </h2>
          <p className="text-gray-600 text-sm mb-5">
            사용자 접속 브라우저 분석
          </p>

          <div className="h-64 flex flex-col items-center justify-center">
            <ChartContainer
              config={{
                visitors: { label: "방문자" },
                Chrome: { label: "Chrome", color: "#3b82f6" },
                Safari: { label: "Safari", color: "#10b981" },
                Firefox: { label: "Firefox", color: "#f59e0b" },
                Edge: { label: "Edge", color: "#8b5cf6" },
                기타: { label: "기타", color: "#6b7280" },
              }}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={pieChartData}
                  dataKey="visitors"
                  nameKey="browser"
                  innerRadius={60}
                  outerRadius={80}
                  strokeWidth={2}
                  stroke="#fff"
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="text-2xl font-bold text-gray-900"
                            >
                              {totalPieVisitors.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 22}
                              className="text-sm text-gray-500"
                            >
                              접속자
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {pieChartData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm px-2 py-1 rounded-md"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <span className="text-gray-700">{item.browser}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 모바일 vs 데스크톱 통계 */}
      <motion.div
        {...fadeIn}
        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex flex-col md:flex-row border-b border-gray-100">
          <div className="flex flex-1 flex-col p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              접속 디바이스 분석
            </h2>
            <p className="text-gray-600 text-sm">
              최근 10일간 디바이스별 접속 통계
            </p>
          </div>
          <div className="flex border-t md:border-t-0 md:border-l border-gray-100">
            {(["desktop", "mobile"] as const).map((key) => (
              <button
                key={key}
                data-active={activeChart === key}
                className="relative flex flex-1 flex-col gap-1 px-6 py-4 text-left border-l first:border-l-0 data-[active=true]:bg-sky-50 data-[active=true]:text-sky-600"
                onClick={() => setActiveChart(key)}
              >
                <span className="text-xs text-gray-500">
                  {key === "desktop" ? "데스크톱" : "모바일"}
                </span>
                <span className="text-lg font-bold leading-none">
                  {interactiveTotals[key].toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="h-72">
            <ChartContainer
              config={{
                desktop: { label: "데스크톱", color: "#0ea5e9" },
                mobile: { label: "모바일", color: "#8b5cf6" },
              }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={interactiveChartData}
                  margin={{ left: 12, right: 12 }}
                >
                  <CartesianGrid vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    stroke="#9ca3af"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <YAxis stroke="#9ca3af" />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-[150px]"
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                          });
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey={activeChart}
                    fill={activeChart === "desktop" ? "#0ea5e9" : "#8b5cf6"}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
