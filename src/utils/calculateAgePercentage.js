/**
 * API 응답의 연령대별 매출 데이터를 정수 백분율로 변환
 * @param {Object} responseData - API 응답 데이터 { dong, data: [{ year_quarter, age_10_amount, ... }] }
 * @param {number} quarterIndex - 데이터 배열 인덱스 (기본값: 0, 최신 분기)
 * @returns {Array} 연령대별 백분율 배열 [age_10%, age_20%, age_30%, age_40%, age_50%, age_60%]
 *
 * @example
 * const response = {
 *   dong: "신사동",
 *   data: [{
 *     year_quarter: "20241",
 *     age_10_amount: 120394000,
 *     age_20_amount: 520394000,
 *     age_30_amount: 830394000,
 *     age_40_amount: 760394000,
 *     age_50_amount: 630394000,
 *     age_60_amount: 230394000
 *   }]
 * };
 * const percentages = calculateAgePercentage(response);
 * // Returns: [3, 14, 23, 21, 17, 6] (반올림된 정수 백분율)
 */
export function calculateAgePercentage(responseData, quarterIndex = 0) {
  if (!responseData?.data || responseData.data.length === 0) {
    return [0, 0, 0, 0, 0, 0];
  }

  const quarterData = responseData.data[quarterIndex];
  if (!quarterData) {
    return [0, 0, 0, 0, 0, 0];
  }

  // 각 연령대별 매출액 추출
  const ageAmounts = [
    quarterData.age_10_amount || 0,
    quarterData.age_20_amount || 0,
    quarterData.age_30_amount || 0,
    quarterData.age_40_amount || 0,
    quarterData.age_50_amount || 0,
    quarterData.age_60_amount || 0,
  ];

  // 총 매출액 계산
  const totalAmount = ageAmounts.reduce((sum, amount) => sum + amount, 0);

  // 0으로 나누는 것을 방지
  if (totalAmount === 0) {
    return [0, 0, 0, 0, 0, 0];
  }

  // 각 연령대별 백분율 계산 (반올림하여 정수로)
  const percentages = ageAmounts.map((amount) => {
    const percentage = (amount / totalAmount) * 100;
    return Math.round(percentage);
  });

  // 반올림으로 인한 합계 오차 조정 (합계가 100이 되도록)
  const percentageSum = percentages.reduce((sum, p) => sum + p, 0);
  if (percentageSum !== 100) {
    const difference = 100 - percentageSum;
    const maxIndex = percentages.indexOf(Math.max(...percentages));
    percentages[maxIndex] += difference;
  }

  return percentages;
}

/**
 * 특정 분기의 연령대별 매출 백분율 데이터를 가져오는 헬퍼 함수
 * @param {Object} responseData - API 응답 데이터
 * @param {string} yearQuarter - 조회할 분기 (예: "20241")
 * @returns {Array|null} 연령대별 백분율 배열 또는 null (해당 분기 미존재 시)
 */
export function calculateAgePercentageByQuarter(responseData, yearQuarter) {
  if (!responseData?.data) {
    return null;
  }

  const quarterIndex = responseData.data.findIndex(
    (item) => item.year_quarter === yearQuarter
  );

  if (quarterIndex === -1) {
    return null;
  }

  return calculateAgePercentage(responseData, quarterIndex);
}

/**
 * 여러 분기의 연령대별 평균 백분율 계산
 * @param {Object} responseData - API 응답 데이터
 * @returns {Array} 전체 기간 연령대별 평균 백분율
 */
export function calculateAverageAgePercentage(responseData) {
  if (!responseData?.data || responseData.data.length === 0) {
    return [0, 0, 0, 0, 0, 0];
  }

  const allPercentages = responseData.data.map((_, index) =>
    calculateAgePercentage(responseData, index)
  );

  // 각 연령대별 평균 계산
  const averagePercentages = [0, 1, 2, 3, 4, 5].map((ageIndex) => {
    const sum = allPercentages.reduce((acc, percentages) => acc + percentages[ageIndex], 0);
    return Math.round(sum / allPercentages.length);
  });

  // 반올림 오차 조정
  const sum = averagePercentages.reduce((acc, p) => acc + p, 0);
  if (sum !== 100) {
    const difference = 100 - sum;
    const maxIndex = averagePercentages.indexOf(Math.max(...averagePercentages));
    averagePercentages[maxIndex] += difference;
  }

  return averagePercentages;
}
