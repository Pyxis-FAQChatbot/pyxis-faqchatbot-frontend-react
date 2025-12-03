import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie } from "react-chartjs-2";
import Chart from "react-apexcharts";
import { marketApi } from "../api/marketApi";
import { calculateAgePercentage } from "../utils/calculateAgePercentage";
import { getPeakHourFormatted, getThreeHourlyTotals } from "../utils/calculatePeakHour";
import { getTopIndustries } from "../utils/calculateTopIndustries";

// 도넛 중앙에 툴팁을 표시하는 커스텀 플러그인
const centerTooltipPlugin = {
  id: 'centerTooltip',
  afterDatasetsDraw(chart) {
    try {
      const { ctx, chartArea, data } = chart;
      
      // 차트 상태에서 활성 요소 확인
      if (!chart.tooltip || chart.tooltip.opacity === 0) return;

      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      // 툴팁에서 텍스트 가져오기
      const body = chart.tooltip.body || [];
      const title = chart.tooltip.title || [];
      
      if (body.length === 0 || title.length === 0) return;

      const labelText = title[0] || '';
      const valueText = (body[0].lines[0] || '') + '%';
      
      // 활성화된 요소의 색상 가져오기
      const activeElement = chart.tooltip._active[0];
      const dataIndex = activeElement ? activeElement.index : 0;
      const bgColor = data.datasets[0].backgroundColor[dataIndex] || '#6366F1';

      // 텍스트 렌더링
      ctx.save();
      ctx.fillStyle = bgColor; // 그래프 색상으로 텍스트 색상 설정
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;

      ctx.font = 'bold 14px Arial';
      ctx.fillText(labelText, centerX, centerY - 12);

      ctx.font = 'bold 24px Arial';
      ctx.fillText(valueText, centerX, centerY + 14);

      ctx.restore();
    } catch (e) {
      console.error('Tooltip rendering error:', e);
    }
  }
};

// Chart.js 플러그인 등록 (한 번만 실행됨)
if (!ChartJS.registry.elements.get("arc")) {
  ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels, centerTooltipPlugin);
}

// 색상 팔레트 (10대~60대 이상, 6개 범위 - 다양한 색조)
const AGE_COLORS = [
  "#fc2626ff", // 10대 - 빨강
  "#fa8f1cff", // 20대 - 주황
  "#ff1f96ff", // 30대 - 진분홍
  "#1ac932ff", // 40대 - 초록
  "#2a7ff7ff", // 50대 - 파랑
  "#9b40fcff", // 60대 이상 - 보라
];

// 연령대 라벨 생성 함수
function generateAgeLabel(index) {
  const ageRanges = [
    "10대", "20대", "30대", "40대", "50대", "60대 이상"
  ];
  return ageRanges[index] || `범위 오류`;
}

// 시간대별 유동인구 히트맵 컴포넌트
function HourlyHeatmap({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-slate-500">데이터 없음</div>;
  }

  // 모든 시간대 추출 및 정렬
  const allPeriods = [];
  data.forEach((dateData) => {
    dateData.periods.forEach((p) => {
      if (!allPeriods.find((period) => period === p.period)) {
        allPeriods.push(p.period);
      }
    });
  });
  allPeriods.sort((a, b) => {
    const aStart = parseInt(a.split("-")[0]);
    const bStart = parseInt(b.split("-")[0]);
    return aStart - bStart;
  });

  // 각 시간대를 시리즈로 변환 (Y축이 시간대)
  const chartSeries = allPeriods.map((period) => ({
    name: period,
    data: data.map((dateData) => {
      const periodData = dateData.periods.find((p) => p.period === period);
      return periodData ? periodData.total : 0;
    }),
  }));

  // 모든 데이터 값 수집
  const allValues = data.flatMap((d) => d.periods.map((p) => p.total));
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);

  // 요일만 추출
  const dateLabels = data.map((dateData) => dateData.dayOfWeek);

  const chartOptions = {
    chart: {
      type: "heatmap",
      sparkline: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      animations: {
        enabled: false,
      },
      stacked: false,
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.8,
        radius: 0,
        useFillColorAsStroke: false,
        colorScale: {
          ranges: [
            {
              from: minValue,
              to: Math.ceil((minValue + maxValue) / 3),
              color: "#90CAF9",
              name: "낮음",
            },
            {
              from: Math.ceil((minValue + maxValue) / 3),
              to: Math.ceil((2 * (minValue + maxValue)) / 3),
              color: "#FFB74D",
              name: "중간",
            },
            {
              from: Math.ceil((2 * (minValue + maxValue)) / 3),
              to: maxValue,
              color: "#EF5350",
              name: "높음",
            },
          ],
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "category",
      categories: dateLabels,
      labels: {
        style: {
          fontSize: "12px",
          fontWeight: 500,
        },
      },
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
      },
      crosshairs: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          fontWeight: 600,
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: "light",
      fixed: {
        enabled: true,
        position: "topLeft",
      },
      y: {
        formatter: (value) => `${value.toLocaleString()} 명`,
      },
    },
    grid: {
      padding: {
        right: 20,
        left: 20,
        top: 10,
        bottom: 10,
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    states: {
      hover: {
        filter: {
          type: "none",
        },
      },
    },
  };

  return (
    <div className="w-full overflow-x-auto">
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="heatmap"
        height={300}
      />
    </div>
  );
}

export default function MarketAnalysis({ location = '신사' }) {
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
  const rawAgeData = ageData ? calculateAgePercentage(ageData) : [18,17,17,16,16,16];

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
    { icon: "🏆", label: "경쟁 치열 업종", value: industries[0]?.name || "카페" },
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
    cutout: '60%', // 도넛 형태 (중앙 60% 비움)
    layout: {
      padding: 20, // 라벨 없으므로 패딩 감소
    },
    plugins: {
      legend: {
        display: false, // 플러그인 범례 숨김 (아래에 커스텀 범례 표시)
      },
      tooltip: {
        enabled: false, // 툴팁 활성화 (데이터만 수집)
        external: () => {}, // 기본 렌더링 완전 비활성화
      },
      datalabels: {
        display: false, // 라벨 제거
      },
      centerTooltip: {}, // 커스텀 플러그인 활성화
    },
    onHover: (event, activeElements) => {
      // 호버 상태 시 cursor를 pointer로 변경
      event.native.target.style.cursor = activeElements.length > 0 ? "pointer" : "default";
    },
  };

  return (
    <section className="pb-20 space-y-6">
      {/* -------------------------------- */}
      {/* 1) 연령대별 매출 비중 - 원그래프 */}
      {/* -------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white">연령대별 매출 비중</h3>

        <div className="flex justify-center mb-6">
          <div className="w-full max-w-2xl">
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* 범례 */}
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          {ages.map((age, idx) => (
            <div key={age.key} className="flex flex-col items-center">
              <div
                className="w-4 h-4 rounded-full mb-2"
                style={{ backgroundColor: age.color }}
              ></div>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{age.label}</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">{age.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------------------- */}
      {/* 2) 시간대별 유동인구 히트맵 */}
      {/* -------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
          시간대별 유동인구 히트맵
        </h3>

        {hourlyData && getThreeHourlyTotals(hourlyData).length > 0 ? (
          <HourlyHeatmap data={getThreeHourlyTotals(hourlyData)} />
        ) : (
          <div className="text-center py-8 text-slate-500">
            데이터를 로드하는 중입니다...
          </div>
        )}
      </div>

      {/* -------------------------------- */}
      {/* 3) 업종 TOP 5 */}
      {/* -------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{location}동 업종 TOP 5</h3>

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
