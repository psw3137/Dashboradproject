/**
 * API 서비스
 * 웹프레임워크백엔드 2조 - 매출/이용 패턴 통계 대시보드
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// 통계 API
// ============================================================================

/**
 * KPI 지표 조회
 */
export const getKPI = async () => {
  return await api.get('/statistics/kpi');
};

/**
 * 지역별 매출 통계
 */
export const getRevenueByRegion = async () => {
  return await api.get('/statistics/revenue-by-region');
};

/**
 * 연령대별 매출 통계
 */
export const getRevenueByAge = async () => {
  return await api.get('/statistics/revenue-by-age');
};

/**
 * 매출 추이
 */
export const getRevenueTrend = async () => {
  return await api.get('/statistics/revenue-trend');
};

/**
 * 고객 분포
 */
export const getCustomerDistribution = async () => {
  return await api.get('/statistics/customer-distribution');
};

/**
 * 히트맵 데이터
 */
export const getHeatmapData = async () => {
  return await api.get('/statistics/heatmap');
};

// ============================================================================
// 고객 API
// ============================================================================

/**
 * 고객 목록 조회
 * @param {Object} params - { page, limit, sort, order }
 */
export const getCustomers = async (params = {}) => {
  return await api.get('/customers', { params });
};

/**
 * 고객 상세 조회
 * @param {number} uid - 고객 ID
 */
export const getCustomerDetail = async (uid) => {
  return await api.get(`/customers/${uid}`);
};

/**
 * 고객 필터링
 * @param {Object} filters - 필터 조건
 */
export const filterCustomers = async (filters) => {
  return await api.post('/customers/filter', filters);
};

/**
 * 고객 검색 (UID)
 * @param {number} uid - 고객 ID
 */
export const searchCustomerByUID = async (uid) => {
  return await api.get('/customers/search/uid', { params: { q: uid } });
};

export default api;
