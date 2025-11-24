/**
 * 고객 목록 페이지
 * 웹프레임워크백엔드 2조
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, filterCustomers } from '../services/api';
import '../styles/CustomerList.css';

// 지역명 영문 → 한글 매핑
const CITY_NAME_MAPPING = {
  // 서울
  'Seoul': '서울',
  // 경기도
  'Yongin': '용인',
  'Seongnam': '성남',
  'Ansan': '안산',
  'Anyang': '안양',
  'Suwon': '수원',
  'Goyang': '고양',
  'Siheung': '시흥',
  'Uijeongbu': '의정부',
  'Bucheon': '부천',
  'Gimpo': '김포',
  'Gunpo': '군포',
  'Hanam': '하남',
  'Pocheon': '포천',
  'Pyeongtaek': '평택',
  // 인천
  'Incheon': '인천',
  // 대구
  'Daegu': '대구',
  // 대전
  'Daejeon': '대전',
  // 부산
  'Busan': '부산',
  // 울산
  'Ulsan': '울산',
  // 광주
  'Gwangju': '광주',
  // 세종
  'Sejong': '세종',
  // 충청남도
  'Cheonan': '천안',
  'Asan': '아산',
  'Nonsan': '논산',
  // 충청북도
  'Cheongju': '청주',
  'Chungju': '충주',
  // 전라북도
  'Jeonju': '전주',
  'Iksan': '익산',
  'Gunsan': '군산',
  // 경상북도
  'Gyeongsan': '경산',
  'Gumi': '구미',
  'Andong': '안동',
  // 경상남도
  'Changwon': '창원',
  'Gimhae': '김해',
  'Yangsan': '양산',
  // 강원도
  'Donghae': '동해',
  'Wonju': '원주',
  'Sokcho': '속초',
  'Taebaek': '태백',
  'Chuncheon': '춘천',
  'Gangwon': '강원',
  // 제주
  'Jeju': '제주'
};

// 광역시도 한글 매핑
const REGION_GROUP_MAPPING = {
  'Seoul': '서울특별시',
  'Gyeonggi-do': '경기도',
  'Incheon': '인천광역시',
  'Busan': '부산광역시',
  'Daegu': '대구광역시',
  'Daejeon': '대전광역시',
  'Gwangju': '광주광역시',
  'Ulsan': '울산광역시',
  'Sejong': '세종특별자치시',
  'Gangwon-do': '강원도',
  'Chungcheongbuk-do': '충청북도',
  'Chungcheongnam-do': '충청남도',
  'Jeollabuk-do': '전라북도',
  'Jeollanam-do': '전라남도',
  'Gyeongsangbuk-do': '경상북도',
  'Gyeongsangnam-do': '경상남도',
  'Jeju': '제주특별자치도'
};

// 연령대 한글 매핑
const AGE_GROUP_MAPPING = {
  'Teens': '10대',
  'Twenties': '20대',
  'Thirties': '30대',
  'Forties+': '40대 이상'
};

// 매핑 함수들
const getCityKorean = (city) => CITY_NAME_MAPPING[city] || city;
const getRegionKorean = (region) => REGION_GROUP_MAPPING[region] || region;
const getAgeGroupKorean = (ageGroup) => AGE_GROUP_MAPPING[ageGroup] || ageGroup;
const getAgeKorean = (age) => `${age}세`;

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const getGrade = (payment) => {
    if (payment >= 200000) return 'VIP';
    if (payment >= 100000) return 'Gold';
    if (payment >= 50000) return 'Silver';
    return 'Bronze';
  };

  return (
    <div className="customer-list">
      <h2>고객 조회</h2>

      {/* 필터링 패널 */}
      <div className="filter-panel">
        <form onSubmit={handleFilterSubmit} className="filter-form">
          <div className="filter-row">
            <div className="filter-item">
              <label>지역</label>
              <input
                type="text"
                name="region"
                value={filters.region}
                onChange={handleFilterChange}
                placeholder="예: 서울특별시"
              />
            </div>

            <div className="filter-item">
              <label>연령대</label>
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
              <label>최소 매출</label>
              <input
                type="number"
                name="minPayment"
                value={filters.minPayment}
                onChange={handleFilterChange}
                placeholder="0"
              />
            </div>

            <div className="filter-item">
              <label>최대 매출</label>
              <input
                type="number"
                name="maxPayment"
                value={filters.maxPayment}
                onChange={handleFilterChange}
                placeholder="1000000"
              />
            </div>

            <div className="filter-item">
              <label>유지 여부</label>
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
            <button type="submit" className="btn btn-primary">필터 적용</button>
            <button type="button" onClick={handleFilterReset} className="btn btn-secondary">
              초기화
            </button>
          </div>
        </form>
      </div>

      {/* 정렬 및 통계 */}
      <div className="list-controls">
        <div className="sort-controls">
          <label>정렬:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="revenue">매출순</option>
            <option value="visits">방문순</option>
            <option value="age">나이순</option>
          </select>
        </div>

        {pagination && (
          <div className="list-stats">
            총 {pagination.total.toLocaleString()}명의 고객
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
                  <th>도시</th>
                  <th>연령대</th>
                  <th>나이</th>
                  <th>방문 일수</th>
                  <th>총 매출</th>
                  <th>등급</th>
                  <th>유지</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.uid}>
                    <td>{customer.uid}</td>
                    <td>{getRegionKorean(customer.region_city_group)}</td>
                    <td>{getCityKorean(customer.region_city)}</td>
                    <td>{getAgeGroupKorean(customer.age_group)}</td>
                    <td>{getAgeKorean(customer.age)}</td>
                    <td>{customer.visit_days}일</td>
                    <td>{customer.total_payment_may.toLocaleString()}원</td>
                    <td>
                      <span className={`badge badge-${getGrade(customer.total_payment_may).toLowerCase()}`}>
                        {getGrade(customer.total_payment_may)}
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
