/**
 * API 응답의 시간대별 유동인구 데이터에서 가장 높은 시간대를 찾는 함수
 * @param {Object} responseData - API 응답 데이터 { dong, data: [{ hour, visitor_sum }, ...] }
 * @returns {Object} 가장 높은 시간대 정보 { hour: string, timeLabel: string, visitor_sum: number }
 *                   또는 null (데이터가 없을 경우)
 *
 * @example
 * const response = {
 *   dong: "신사동",
 *   data: [
 *     { hour: "2025-10-13 09:00", visitor_sum: 1532 },
 *     { hour: "2025-10-13 10:00", visitor_sum: 1821 },
 *     { hour: "2025-10-13 11:00", visitor_sum: 2014 }
 *   ]
 * };
 * const peakHour = getPeakHour(response);
 * // Returns: { hour: "2025-10-13 11:00", timeLabel: "11:00", visitor_sum: 2014 }
 */
export function getPeakHour(responseData) {
  if (!responseData?.data || responseData.data.length === 0) {
    return null;
  }

  // 시간대별로 방문자 합계 계산 (날짜 제외)
  const hourlyTotals = {};

  responseData.data.forEach((item) => {
    if (!item.hour || item.visitor_sum === undefined) {
      return;
    }

    // hour에서 시간 부분만 추출 (HH:00 형식)
    // "2025-10-13 09:00" => "09:00"
    const timePart = item.hour.split(" ")[1];

    if (timePart) {
      hourlyTotals[timePart] = (hourlyTotals[timePart] || 0) + item.visitor_sum;
    }
  });

  // 가장 높은 시간대 찾기
  let peakTime = null;
  let maxVisitors = -1;

  Object.entries(hourlyTotals).forEach(([time, total]) => {
    if (total > maxVisitors) {
      maxVisitors = total;
      peakTime = time;
    }
  });

  if (peakTime === null) {
    return null;
  }

  return {
    hour: peakTime,
    timeLabel: peakTime,
    visitor_sum: maxVisitors,
  };
}

/**
 * 시간대별 유동인구를 전체 집계한 데이터 반환 (날짜 제외)
 * @param {Object} responseData - API 응답 데이터
 * @returns {Array} 시간대별 합계 배열 [{ time: "09:00", total: 1532 }, ...]
 *                  시간순으로 정렬됨
 *
 * @example
 * const hourlyData = getHourlyTotals(response);
 * // Returns: [
 * //   { time: "09:00", total: 1532 },
 * //   { time: "10:00", total: 1821 },
 * //   { time: "11:00", total: 2014 }
 * // ]
 */
export function getHourlyTotals(responseData) {
  if (!responseData?.data || responseData.data.length === 0) {
    return [];
  }

  const hourlyTotals = {};

  responseData.data.forEach((item) => {
    if (!item.hour || item.visitor_sum === undefined) {
      return;
    }

    const timePart = item.hour.split(" ")[1];
    if (timePart) {
      hourlyTotals[timePart] = (hourlyTotals[timePart] || 0) + item.visitor_sum;
    }
  });

  // 시간순으로 정렬
  return Object.entries(hourlyTotals)
    .map(([time, total]) => ({
      time,
      total,
    }))
    .sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * 방문 많은 시간을 포맷된 문자열로 반환 (예: "19시")
 * @param {Object} responseData - API 응답 데이터
 * @returns {string|null} 포맷된 시간 문자열 또는 null
 *
 * @example
 * const timeString = getPeakHourFormatted(response);
 * // Returns: "11시"
 */
export function getPeakHourFormatted(responseData) {
  const peakHour = getPeakHour(responseData);
  if (!peakHour) {
    return null;
  }

  // "11:00" => "11시"
  const hour = peakHour.hour.split(":")[0];
  return `${hour}시`;
}
