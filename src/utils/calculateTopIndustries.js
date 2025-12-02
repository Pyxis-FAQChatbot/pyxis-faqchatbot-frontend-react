/**
 * API 응답의 업종 데이터에서 상위 5개 업종을 추출하는 함수
 * @param {Object} responseData - API 응답 데이터 { dong, data: [{ category, cnt }, ...] }
 * @returns {Array} 상위 5개 업종 배열 [{ name: string, count: number }, ...]
 *                  내림차순으로 정렬됨
 *
 * @example
 * const response = {
 *   dong: "신사동",
 *   data: [
 *     { category: "한식음식점", cnt: 123 },
 *     { category: "커피전문점", cnt: 88 },
 *     { category: "의류", cnt: 51 },
 *     { category: "미용실", cnt: 45 },
 *     { category: "편의점", cnt: 42 },
 *     { category: "제과제빵", cnt: 30 }
 *   ]
 * };
 * const topIndustries = getTopIndustries(response);
 * // Returns: [
 * //   { name: "한식음식점", count: 123 },
 * //   { name: "커피전문점", count: 88 },
 * //   { name: "의류", count: 51 },
 * //   { name: "미용실", count: 45 },
 * //   { name: "편의점", count: 42 }
 * // ]
 */
export function getTopIndustries(responseData, limit = 5) {
  if (!responseData?.data || responseData.data.length === 0) {
    return [];
  }

  // 데이터를 count 기준으로 내림차순 정렬 후 상위 5개 추출
  const sorted = [...responseData.data]
    .sort((a, b) => (b.cnt || 0) - (a.cnt || 0))
    .slice(0, limit);

  // category와 cnt를 name과 count로 변환
  return sorted.map((item) => ({
    name: item.category,
    count: item.cnt,
  }));
}

/**
 * 업종 데이터를 Market 컴포넌트용으로 포맷하는 함수
 * @param {Object} responseData - API 응답 데이터
 * @param {number} limit - 추출할 업종 수 (기본값: 5)
 * @returns {Array} 포맷된 업종 배열 [{ name: string, count: number }, ...]
 *
 * @example
 * const formattedData = formatIndustriesForDisplay(response);
 */
export function formatIndustriesForDisplay(responseData, limit = 5) {
  return getTopIndustries(responseData, limit);
}

/**
 * 업종별 점포 수의 총합 계산
 * @param {Object} responseData - API 응답 데이터
 * @returns {number} 전체 업종 수
 *
 * @example
 * const total = getTotalIndustryCount(response);
 * // Returns: 379
 */
export function getTotalIndustryCount(responseData) {
  if (!responseData?.data || responseData.data.length === 0) {
    return 0;
  }

  return responseData.data.reduce((sum, item) => sum + (item.cnt || 0), 0);
}

/**
 * 특정 업종의 점포 수 조회
 * @param {Object} responseData - API 응답 데이터
 * @param {string} categoryName - 조회할 업종명
 * @returns {number|null} 업종 수 또는 null (해당 업종 미존재 시)
 *
 * @example
 * const coffeeCount = getIndustryCount(response, "커피전문점");
 * // Returns: 88
 */
export function getIndustryCount(responseData, categoryName) {
  if (!responseData?.data) {
    return null;
  }

  const industry = responseData.data.find((item) => item.category === categoryName);
  return industry ? industry.cnt : null;
}
