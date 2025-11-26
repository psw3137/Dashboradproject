/**
 * 고객 목록 페이지
 * 웹프레임워크백엔드 2조
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, filterCustomers } from '../services/api';
import { getCityKorean, getRegionKorean, getAgeGroupKorean, getCustomerGrade } from '../utils/formatters';
import '../styles/CustomerList.css';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 필터 상태
  const [filters, setFilters] = useState({
    region: '',
    ageGroup: '',
    minPayment: '',
    maxPayment: '',
    retained90: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('revenue');

  // 활성화된 필터 개수 계산
  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  useEffect(() => {
    loadCustomers();
  }, [currentPage, sortBy]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCustomers({
        page: currentPage,
        limit: 50,
        sort: sortBy,
        order: 'desc'
      });

      setCustomers(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('고객 목록 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // 빈 값 제거
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const response = await filterCustomers({
        ...cleanFilters,
        page: 1,
        limit: 50
      });

      setCustomers(response.data);
      setPagination(response.pagination);
      setCurrentPage(1);
    } catch (err) {
      console.error('필터링 실패:', err);
      setError('필터링에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterReset = () => {
    setFilters({
      region: '',
      ageGroup: '',
      minPayment: '',
      maxPayment: '',
      retained90: ''
    });
    setCurrentPage(1);
    loadCustomers();
  };

  // 필터 칩 제거 함수
  const removeFilter = (filterKey) => {
    setFilters(prev => ({ ...prev, [filterKey]: '' }));
  };

  // 필터 라벨 가져오기
  const getFilterLabel = (key, value) => {
    switch (key) {
      case 'region': return `지역: ${value}`;
      case 'ageGroup': return `연령대: ${getAgeGroupKorean(value)}`;
      case 'minPayment': return `최소매출: ${Number(value).toLocaleString()}원`;
      case 'maxPayment': return `최대매출: ${Number(value).toLocaleString()}원`;
      case 'retained90': return value === '1' ? '유지 고객' : '이탈 고객';
      default: return value;
    }
  };

  return (
    <div className="customer-list">
      <div className="page-header">
        <h2>고객 조회</h2>
        <p className="page-description">고객 목록을 조회하고 필터링할 수 있습니다</p>
      </div>

      {/* 필터링 패널 - 접힘/펼침 */}
      <div className="filter-panel">
        <div
          className="filter-header"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <div className="filter-title">
            <span className="filter-icon">🔍</span>
            <span>필터 옵션</span>
            {activeFilterCount > 0 && (
              <span className="filter-count">{activeFilterCount}</span>
            )}
          </div>
          <button type="button" className="filter-toggle">
            {isFilterOpen ? '접기 ▲' : '펼치기 ▼'}
          </button>
        </div>

        {/* 선택된 필터 칩 */}
        {activeFilterCount > 0 && (
          <div className="filter-chips">
            {Object.entries(filters).map(([key, value]) =>
              value && (
                <span key={key} className="filter-chip">
                  {getFilterLabel(key, value)}
                  <button
                    type="button"
                    className="chip-remove"
                    onClick={() => removeFilter(key)}
                  >
                    ×
                  </button>
                </span>
              )
            )}
            <button
              type="button"
              className="clear-all-btn"
              onClick={handleFilterReset}
            >
              전체 초기화
            </button>
          </div>
        )}

        {isFilterOpen && (
          <form onSubmit={handleFilterSubmit} className="filter-form">
            <div className="filter-row">
              <div className="filter-item">
                <label>📍 지역</label>
                <input
                  type="text"
                  name="region"
                  value={filters.region}
                  onChange={handleFilterChange}
                  placeholder="예: 서울특별시"
                />
              </div>

              <div className="filter-item">
                <label>👤 연령대</label>
                <select
                  name="ageGroup"
                  value={filters.ageGroup}
                  onChange={handleFilterChange}
                >
                  <option value="">전체</option>
                  <option value="Teens">10대</option>
                  <option value="Twenties">20대</option>
                  <option value="Thirties">30대</option>
                  <option value="Forties+">40대 이상</option>
                </select>
              </div>

              <div className="filter-item">
                <label>💰 최소 매출</label>
                <input
                  type="number"
                  name="minPayment"
                  value={filters.minPayment}
                  onChange={handleFilterChange}
                  placeholder="0"
                />
              </div>

              <div className="filter-item">
                <label>💰 최대 매출</label>
                <input
                  type="number"
                  name="maxPayment"
                  value={filters.maxPayment}
                  onChange={handleFilterChange}
                  placeholder="1000000"
                />
              </div>

              <div className="filter-item">
                <label>🔄 유지 여부</label>
                <select
                  name="retained90"
                  value={filters.retained90}
                  onChange={handleFilterChange}
                >
                  <option value="">전체</option>
                  <option value="1">유지</option>
                  <option value="0">이탈</option>
                </select>
              </div>
            </div>

            <div className="filter-actions">
              <button type="submit" className="btn btn-primary btn-large">
                🔍 필터 적용
              </button>
              <button type="button" onClick={handleFilterReset} className="btn btn-secondary">
                초기화
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 정렬 및 통계 */}
      <div className="list-controls">
        <div className="sort-controls">
          <label>정렬:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="revenue">💰 매출순</option>
            <option value="visits">📅 방문순</option>
            <option value="age">👤 나이순</option>
          </select>
        </div>

        {pagination && (
          <div className="list-stats">
            <span className="stats-icon">👥</span>
            총 <strong>{pagination.total.toLocaleString()}</strong>명의 고객
          </div>
        )}
      </div>

      {/* 고객 테이블 */}
      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="table-container">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>UID</th>
                  <th>지역</th>
                  <th>나이</th>
                  <th>방문</th>
                  <th>총 매출</th>
                  <th>등급</th>
                  <th>유지</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.uid}>
                    <td className="uid-cell">{customer.uid}</td>
                    <td>
                      <div className="location-cell">
                        <span className="region-name">{getCityKorean(customer.region_city)}</span>
                        <span className="region-sub">{getRegionKorean(customer.region_city_group)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="age-cell">
                        <span className="age-value">{customer.age}세</span>
                        <span className="age-group">{getAgeGroupKorean(customer.age_group)}</span>
                      </div>
                    </td>
                    <td className="visit-cell">{customer.visit_days}일</td>
                    <td className="revenue-cell">{customer.total_payment_may.toLocaleString()}원</td>
                    <td>
                      <span className={`badge badge-${getCustomerGrade(customer.total_payment_may).toLowerCase()}`}>
                        {getCustomerGrade(customer.total_payment_may)}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${customer.retained_90 === 1 ? 'retained' : 'churned'}`}>
                        {customer.retained_90 === 1 ? '✓' : '✗'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/customers/${customer.uid}`} className="btn-link">
                        상세
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary"
              >
                이전
              </button>

              <span className="page-info">
                {currentPage} / {pagination.totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages}
                className="btn btn-secondary"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerList;
