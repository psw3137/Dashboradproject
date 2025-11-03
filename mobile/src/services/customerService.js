import api from '../config/api';

// 고객 목록 조회
export const getCustomers = async (page = 1, limit = 50) => {
  try {
    const response = await api.get('/customers', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 특정 고객 조회
export const getCustomerById = async (customerId) => {
  try {
    const response = await api.get(`/customers/${customerId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 고객 검색
export const searchCustomers = async (query) => {
  try {
    const response = await api.get(`/customers/search/${query}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 대시보드 통계
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 매출 분석
export const getRevenueAnalytics = async (startDate, endDate) => {
  try {
    const response = await api.get('/analytics/revenue', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 고객 세그멘테이션
export const getCustomerSegmentation = async () => {
  try {
    const response = await api.get('/analytics/segmentation');
    return response.data;
  } catch (error) {
    throw error;
  }
};
