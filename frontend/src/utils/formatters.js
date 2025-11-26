/**
 * 공통 포맷 유틸리티
 * 웹프레임워크백엔드 2조
 */

import { REGION_GROUP_MAPPING, CITY_NAME_MAPPING, AGE_GROUP_MAPPING, CUSTOMER_GRADE_THRESHOLDS } from '../constants/mappings';

/**
 * 광역시도 영문명을 한글로 변환
 * @param {string} region - 광역시도 영문명
 * @returns {string} 한글 광역시도명
 */
export const getRegionKorean = (region) => {
  return REGION_GROUP_MAPPING[region] || region;
};

/**
 * 도시 영문명을 한글로 변환
 * @param {string} city - 도시 영문명
 * @returns {string} 한글 도시명
 */
export const getCityKorean = (city) => {
  return CITY_NAME_MAPPING[city] || city;
};

/**
 * 연령대 영문명을 한글로 변환
 * @param {string} ageGroup - 연령대 영문명
 * @returns {string} 한글 연령대명
 */
export const getAgeGroupKorean = (ageGroup) => {
  return AGE_GROUP_MAPPING[ageGroup] || ageGroup;
};

/**
 * 광역시도명의 짧은 형태로 변환 (특별시, 광역시 등 제거)
 * @param {string} region - 광역시도 영문명
 * @returns {string} 짧은 형태의 한글 지역명
 */
export const getShortRegionName = (region) => {
  const name = getRegionKorean(region);
  return name
    .replace('특별시', '')
    .replace('광역시', '')
    .replace('특별자치시', '')
    .replace('특별자치도', '')
    .replace('도', '');
};

/**
 * 고객 등급 계산
 * @param {number} totalPayment - 총 결제 금액
 * @returns {string} 고객 등급 (VIP, Gold, Silver, Bronze)
 */
export const getCustomerGrade = (totalPayment) => {
  if (totalPayment >= CUSTOMER_GRADE_THRESHOLDS.VIP) return 'VIP';
  if (totalPayment >= CUSTOMER_GRADE_THRESHOLDS.Gold) return 'Gold';
  if (totalPayment >= CUSTOMER_GRADE_THRESHOLDS.Silver) return 'Silver';
  return 'Bronze';
};

/**
 * 1회 평균 결제 금액 계산
 * @param {number} totalPayment - 총 결제 금액
 * @param {number} visitDays - 방문 일수
 * @returns {number} 1회 평균 결제 금액
 */
export const getAvgPaymentPerVisit = (totalPayment, visitDays) => {
  return visitDays > 0 ? Math.round(totalPayment / visitDays) : 0;
};

/**
 * 매출 금액 포맷팅 (억원, 만원 단위)
 * @param {number} revenue - 매출 금액
 * @returns {string} 포맷된 매출 문자열
 */
export const formatRevenue = (revenue) => {
  if (revenue >= 100000000) {
    return `${(revenue / 100000000).toFixed(2)}억원`;
  } else if (revenue >= 10000) {
    return `${(revenue / 10000).toFixed(0)}만원`;
  } else {
    return `${revenue.toLocaleString()}원`;
  }
};
