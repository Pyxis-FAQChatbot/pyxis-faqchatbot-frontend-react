import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie } from "react-chartjs-2";
import Chart from "react-apexcharts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { marketApi } from "../api/marketApi";
import { calculateAgePercentage } from "../utils/calculateAgePercentage";
import { getPeakHourFormatted, getThreeHourlyTotals } from "../utils/calculatePeakHour";
import { getTopIndustries } from "../utils/calculateTopIndustries";
import PyxisLogoSimple from "../assets/pyxis_logo_simple.svg";

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
      tooltip: {
        enabled: false
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
        enabled: false,
      },
      followCursor: true,
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
          type: "darken",
          value: 0.10,
        }
      },
    },
  };

  return (
    <div className="w-full overflow-hidden">
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="heatmap"
        height={300}
      />
    </div>
  );
}
/*
// Market.jsx의 상단에 추가할 함수
const normalizeMarkdownNewlines = (text) => {
  if (!text) return '';
  // 연속된 줄바꿈(빈 줄)은 유지하되, 단일 줄바꿈은 공백으로 변환
  return text
  .split('\n\n')           // 빈 줄로 분할
  .map(paragraph => 
    paragraph.replace(/\n/g, ' ').trim()  // 각 문단 내 단일 \n을 공백으로
  )
  .filter(p => p.length > 0) // 빈 문단 제거
  .join('\n\n');            // 빈 줄로 재결합
};
*/

export default function MarketAnalysis({ location = '신사' }) {
  const [ageData, setAgeData] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [industryData, setIndustryData] = useState(null);
  const [llmMessage, setLlmMessage] = useState(null);
  const [llmExpanded, setLlmExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadTimeout, setLoadTimeout] = useState(false);

  // API 데이터 조회
  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const fetchMarketData = async () => {
      setLoading(true);
      setError(null);
      setLoadTimeout(false);
      setLlmMessage(null);
      
      // 3초 후에도 데이터가 안 오면 타임아웃 표시
      timeoutId = setTimeout(() => {
        if (isMounted) {
          setLoadTimeout(true);
        }
      }, 3000);

      try {
        const [ageRes, hourRes, shopRes] = await Promise.all([
          marketApi.mkAgePath(location),
          marketApi.mkHourPath(location),
          marketApi.mkShopPath(location),
        ]);
        
        if (isMounted) {
          setAgeData(ageRes);
          setHourlyData(hourRes);
          setIndustryData(shopRes);
          setLoadTimeout(false);
          clearTimeout(timeoutId);
        }

        // LLM 인사이트 조회
        try {
          const insightRes = await marketApi.mkInsightPath(location);
          if (isMounted && insightRes?.insight) {
            setLlmMessage(insightRes.insight);
          }
        } catch (llmErr) {
          console.error('LLM 인사이트 조회 실패:', llmErr);
        }
      } catch (err) {
        if (isMounted) {
          console.error('마켓 데이터 조회 실패:', err);
          setError(err);
          setLoadTimeout(true);
          clearTimeout(timeoutId);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (location) {
      fetchMarketData();
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [location]);

  // 연령대 데이터 처리
  const rawAgeData = ageData?.data ? calculateAgePercentage(ageData) : null;

  // 시간대 데이터 처리
  const peakHourValue = hourlyData ? getPeakHourFormatted(hourlyData) : null;

  // 업종 데이터 처리
  const topIndustries = industryData ? getTopIndustries(industryData) : null;

  // 주요 소비층 찾기 (가장 높은 백분율)
  const maxAgeIndex = rawAgeData ? rawAgeData.indexOf(Math.max(...rawAgeData)) : -1;
  const topAgeGroup = rawAgeData ? generateAgeLabel(maxAgeIndex) : "조회없음";
  const topAgePercentage = rawAgeData ? rawAgeData[maxAgeIndex] : "";

  const industries = topIndustries;

  const summaryStats = [
    { icon: "🕖", label: "방문 많은 시간", value: peakHourValue || "조회없음" },
    { icon: "🧍‍♂️", label: "주요 소비층", value: ageData?.data && ageData.data.length > 0 ? `${topAgeGroup}(${topAgePercentage}%)` : "조회없음" },
    { icon: "🏆", label: "경쟁 치열 업종", value: topIndustries && topIndustries.length > 0 ? topIndustries[0]?.name : "조회없음" },
  ];

  const maxIndustry = topIndustries && topIndustries.length > 0 ? Math.max(...industries.map(i => i.count)) : 0;
  
  // label과 color를 생성하며 변환
  const ages = rawAgeData ? rawAgeData.map((value, index) => ({
    key: `age_${index}`,
    label: generateAgeLabel(index),
    value: value,
    color: AGE_COLORS[index],
  })) : [];

  // 최대값 찾기 (범례 표시용)
  const maxAgeValue = ages.length > 0 ? Math.max(...ages.map(a => a.value)) : 0;
  const maxAgeItem = ages.length > 0 ? ages.find(a => a.value === maxAgeValue) : null;

  // Chart.js 데이터 설정
  const chartData = rawAgeData ? {
    labels: ages.map(a => a.label),
    datasets: [
      {
        data: ages.map(a => a.value),
        backgroundColor: ages.map(a => a.color),
        borderColor: "#FFFFFF",
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  } : {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderColor: "#FFFFFF",
        borderWidth: 2,
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
      {/* 0) LLM 메시지 */}
      {/* -------------------------------- */}
      <div className="bg-gradient-to-br from-indigo-700 to-blue-500 via-indigo-650 rounded-3xl p-6 shadow-sm border border-blue-600 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4 text-amber-200 flex items-center gap-3">
          <img 
            src={PyxisLogoSimple} 
            alt="Pyxis Logo" 
            className="w-6 h-6 flex-shrink-0"
          />
          AI 추천 전략
        </h3>

        {llmMessage ? (
          <div>
            <div
              ref={(el) => {
                if (el && !llmExpanded) {
                  const lineHeight = parseInt(window.getComputedStyle(el).lineHeight);
                  const height = el.offsetHeight;
                  const lines = Math.ceil(height / lineHeight);
                  if (lines > 3 && !llmMessage?.split?.('\\n')?.some?.(line => line.length > 80)) {
                    // 실제 높이로 계산한 줄 수가 3을 초과하면 더보기 표시
                  }
                }
              }}
              className={`text-sm text-white transition-all duration-300 overflow-hidden break-words ${!llmExpanded ? 'line-clamp-3' : ''}`}
            >
              <div className="markdown-strategy max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {normalizeMarkdownNewlines(llmMessage)}
                </ReactMarkdown>
              </div>
            </div>
            {llmMessage && llmExpanded === false && (
              <button
                onClick={() => setLlmExpanded(true)}
                className="mt-3 flex items-center gap-1 text-white hover:text-slate-200 text-sm font-medium transition-colors"
              >
                <span>더보기</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            )}
            {llmMessage && llmExpanded === true && (
              <button
                onClick={() => setLlmExpanded(false)}
                className="mt-3 flex items-center gap-1 text-white hover:text-slate-200 text-sm font-medium transition-colors"
              >
                <span>접기</span>
                <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <p className="text-white mt-3">분석 중입니다...</p>
          </div>
        )}
      </div>

      {/* -------------------------------- */}
      {/* 1) 상권 요약 카드 */}
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

      {/* -------------------------------- */}
      {/* 2) 업종 TOP 5 */}
      {/* -------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{location}동 업종 TOP 5</h3>

        {industries && industries.length > 0 && industries.some(i => i.count > 0) ? (
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
        ) : (
          <div className="h-60 flex items-center justify-center">
            <p className="text-slate-500 dark:text-slate-400">업종정보가 없습니다</p>
          </div>
        )}
      </div>

      {/* -------------------------------- */}
      {/* 3) 연령대별 매출 비중 - 도넛그래프 */}
      {/* -------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white">연령대별 매출 비중</h3>

        {ageData?.data && ageData.data.length > 0 ? (
          <>
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
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="w-full max-w-2xl h-80 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="15"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold text-slate-400 dark:text-slate-500">?</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 범례 대신 메시지 */}
            <div className="text-center mb-6">
              <p className="text-slate-500 dark:text-slate-400">연령대별 정보가 없습니다.</p>
            </div>
          </>
        )}
      </div>

      {/* -------------------------------- */}
      {/* 4) 시간대별 유동인구 히트맵 */}
      {/* -------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
          시간대별 유동인구 히트맵
        </h3>

        {hourlyData?.data && getThreeHourlyTotals(hourlyData).length > 0 ? (
          <HourlyHeatmap data={getThreeHourlyTotals(hourlyData)} />
        ) : hourlyData?.data && hourlyData.data.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            유동인구 정보가 없습니다
          </div>
        ) : loadTimeout ? (
          <div className="text-center py-8 text-slate-500">
            유동인구 정보를 불러올 수 없습니다
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            데이터를 로드하는 중입니다...
          </div>
        )}
      </div>
    </section>
  );
}
