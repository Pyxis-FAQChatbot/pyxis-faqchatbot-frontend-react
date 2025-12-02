import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie } from "react-chartjs-2";
import { marketApi } from "../api/marketApi";
import { calculateAgePercentage } from "../utils/calculateAgePercentage";
import { getPeakHourFormatted } from "../utils/calculatePeakHour";
import { getTopIndustries } from "../utils/calculateTopIndustries";

// Chart.js 플러그인 등록 (한 번만 실행됨)
if (!ChartJS.registry.elements.get("arc")) {
  ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);
}

// 색상 팔레트 (10대~60대 이상, 6개 범위)
const AGE_COLORS = [
  "#E0E7FF", // 10대
  "#C7D2FE", // 20대
  "#A5B4FC", // 30대
  "#818CF8", // 40대
  "#6366F1", // 50대
  "#4F46E5", // 60대 이상
];

// 연령대 라벨 생성 함수
function generateAgeLabel(index) {
  const ageRanges = [
    "10대", "20대", "30대", "40대", "50대", "60대 이상"
  ];
  return ageRanges[index] || `범위 오류`;
}

export default function MarketAnalysis({ location = '신사동' }) {
  const [ageData, setAgeData] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [industryData, setIndustryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API 데이터 조회
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ageRes, hourRes, shopRes] = await Promise.all([
          marketApi.mkAgePath(location),
          marketApi.mkHourPath(location),
          marketApi.mkShopPath(location),
        ]);
        
        setAgeData(ageRes);
        setHourlyData(hourRes);
        setIndustryData(shopRes);
      } catch (err) {
        console.error('마켓 데이터 조회 실패:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchMarketData();
    }
  }, [location]);

  // 연령대 데이터 처리
  const rawAgeData = ageData ? calculateAgePercentage(ageData) : [8, 22, 35, 20, 12, 3];

  // 시간대 데이터 처리
  const peakHourValue = hourlyData ? getPeakHourFormatted(hourlyData) : "19시";

  // 업종 데이터 처리
  const topIndustries = industryData ? getTopIndustries(industryData) : [
    { name: "카페", count: 421 },
    { name: "한식", count: 312 },
    { name: "미용", count: 228 },
    { name: "의류", count: 150 },
    { name: "제과제빵", count: 84 },
  ];

  // 주요 소비층 찾기 (가장 높은 백분율)
  const maxAgeIndex = rawAgeData.indexOf(Math.max(...rawAgeData));
  const topAgeGroup = generateAgeLabel(maxAgeIndex);
  const topAgePercentage = rawAgeData[maxAgeIndex];

  const industries = topIndustries;

  const summaryStats = [
    { icon: "🕖", label: "방문 많은 시간", value: peakHourValue },
    { icon: "🧍‍♂️", label: "주요 소비층", value: `${topAgeGroup}(${topAgePercentage}%)` },
    { icon: "🏆", label: "경쟁 치열 업종", value: "카페/베이커리" },
  ];

  const maxIndustry = Math.max(...industries.map(i => i.count));
  
  // label과 color를 생성하며 변환
  const ages = rawAgeData.map((value, index) => ({
    key: `age_${index}`,
    label: generateAgeLabel(index),
    value: value,
    color: AGE_COLORS[index],
  }));

  // 최대값 찾기 (범례 표시용)
  const maxAgeValue = Math.max(...ages.map(a => a.value));
  const maxAgeItem = ages.find(a => a.value === maxAgeValue);

  // Chart.js 데이터 설정
  const chartData = {
    labels: ages.map(a => a.label),
    datasets: [
      {
        data: ages.map(a => a.value),
        backgroundColor: ages.map(a => a.color),
        borderColor: "#FFFFFF",
        borderWidth: 2,
        hoverOffset: 15, // 호버 시 섹션이 15px 바깥으로 이동 (커짐)
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    layout: {
      padding: 60, // 라벨이 보이기 위한 충분한 패딩
    },
    plugins: {
      legend: {
        display: false, // 범례 숨김
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 14,
        },
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.parsed}%`;
          },
        },
      },
      datalabels: {
        color: "#374151",
        font: {
          size: 12,
          weight: "bold",
        },
        formatter: (value, context) => {
          return `${context.chart.data.labels[context.dataIndex]}\n${value}%`;
        },
        anchor: "end",
        align: "end",
        offset: 2, // end 위치에서 약간 떨어지게
      },
    },
    onHover: (event, activeElements) => {
      // 호버 상태 시 cursor를 pointer로 변경
      event.native.target.style.cursor = activeElements.length > 0 ? "pointer" : "default";
    },
  };

  return (
    <section className="px-4 pb-20 space-y-6">
      {/* -------------------------------- */}
      {/* 1) 연령대별 매출 비중 - 원그래프 */}
      {/* -------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white">연령대별 매출 비중</h3>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* -------------------------------- */}
      {/* 2) 2×2 방문·매출 인사이트 */}
      {/* -------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
          방문건수 vs 매출 인사이트
        </h3>

        <div className="grid grid-cols-2 gap-3 text-center text-sm">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
            <p className="font-bold text-indigo-600 dark:text-indigo-400">매출↑ 방문↑</p>
            <p className="text-slate-600 dark:text-slate-400">충성 고객↑</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
            <p className="font-bold text-purple-600 dark:text-purple-400">매출↓ 방문↑</p>
            <p className="text-slate-600 dark:text-slate-400">가성비형 소비자↑</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="font-bold text-blue-600 dark:text-blue-400">매출↑ 방문↓</p>
            <p className="text-slate-600 dark:text-slate-400">객단가 높은 소비자</p>
          </div>
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="font-bold text-slate-600 dark:text-slate-400">매출↓ 방문↓</p>
            <p className="text-slate-500 dark:text-slate-500">저활성 소비</p>
          </div>
        </div>
      </div>

      {/* -------------------------------- */}
      {/* 3) 업종 TOP 5 */}
      {/* -------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{location} 업종 TOP 5</h3>

        <div className="space-y-4">
          {industries.map(item => (
            <div key={item.name}>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
                <span className="text-slate-600 dark:text-slate-400">{item.count}개</span>
              </div>

              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                <div
                  className="h-2 rounded-full bg-indigo-500"
                  style={{
                    width: `${(item.count / maxIndustry) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------------------- */}
      {/* 4) 상권 요약 카드 */}
      {/* -------------------------------- */}
      <div className="space-y-3">
        {summaryStats.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 flex items-start gap-3"
          >
            <span className="text-3xl">{item.icon}</span>
            <div className="flex-1">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{item.label}</p>
              <p className="font-bold text-indigo-700 dark:text-indigo-400">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
