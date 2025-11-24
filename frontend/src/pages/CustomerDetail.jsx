/**
 * 고객 상세 페이지
 * 웹프레임워크백엔드 2조
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomerDetail } from '../services/api';
import '../styles/CustomerDetail.css';

// 지역명 영문 → 한글 매핑
const CITY_NAME_MAPPING = {
  'Seoul': '서울', 'Yongin': '용인', 'Seongnam': '성남', 'Ansan': '안산',
  'Anyang': '안양', 'Suwon': '수원', 'Goyang': '고양', 'Siheung': '시흥',
  'Uijeongbu': '의정부', 'Bucheon': '부천', 'Gimpo': '김포', 'Gunpo': '군포',
  'Hanam': '하남', 'Pocheon': '포천', 'Pyeongtaek': '평택', 'Incheon': '인천',
  'Daegu': '대구', 'Daejeon': '대전', 'Busan': '부산', 'Ulsan': '울산',
  'Gwangju': '광주', 'Sejong': '세종', 'Cheonan': '천안', 'Asan': '아산',
  'Nonsan': '논산', 'Cheongju': '청주', 'Chungju': '충주', 'Jeonju': '전주',
  'Iksan': '익산', 'Gunsan': '군산', 'Gyeongsan': '경산', 'Gumi': '구미',
  'Andong': '안동', 'Changwon': '창원', 'Gimhae': '김해', 'Yangsan': '양산',
  'Donghae': '동해', 'Wonju': '원주', 'Sokcho': '속초', 'Taebaek': '태백',
  'Chuncheon': '춘천', 'Gangwon': '강원', 'Jeju': '제주'
};

// 광역시도 한글 매핑
const REGION_GROUP_MAPPING = {
  'Seoul': '서울특별시', 'Gyeonggi-do': '경기도', 'Incheon': '인천광역시',
  'Busan': '부산광역시', 'Daegu': '대구광역시', 'Daejeon': '대전광역시',
  'Gwangju': '광주광역시', 'Ulsan': '울산광역시', 'Sejong': '세종특별자치시',
  'Gangwon-do': '강원도', 'Chungcheongbuk-do': '충청북도', 'Chungcheongnam-do': '충청남도',
  'Jeollabuk-do': '전라북도', 'Jeollanam-do': '전라남도', 'Gyeongsangbuk-do': '경상북도',
  'Gyeongsangnam-do': '경상남도', 'Jeju': '제주특별자치도'
};

// 연령대 한글 매핑
const AGE_GROUP_MAPPING = {
  'Teens': '10대', 'Twenties': '20대', 'Thirties': '30대', 'Forties+': '40대 이상'
};

// 매핑 함수들
const getCityKorean = (city) => CITY_NAME_MAPPING[city] || city;
const getRegionKorean = (region) => REGION_GROUP_MAPPING[region] || region;
const getAgeGroupKorean = (ageGroup) => AGE_GROUP_MAPPING[ageGroup] || ageGroup;

const CustomerDetail = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCustomerDetail();
  }, [uid]);

  const loadCustomerDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCustomerDetail(uid);
      setCustomer(response.data);
    } catch (err) {
      console.error('고객 상세 조회 실패:', err);
      setError('고객 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/customers')} className="btn btn-primary">
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  if (!customer) {
    return <div className="error">고객을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="customer-detail">
      <div className="detail-header">
        <h2>고객 상세 정보</h2>
        <button onClick={() => navigate('/customers')} className="btn btn-secondary">
          목록으로
        </button>
      </div>

      <div className="detail-grid">
        {/* 기본 정보 */}
        <div className="detail-card">
          <h3>기본 정보</h3>
          <div className="detail-item">
            <label>UID</label>
            <value>{customer.uid}</value>
          </div>
          <div className="detail-item">
            <label>지역</label>
            <value>{getRegionKorean(customer.region_city_group)}</value>
          </div>
          <div className="detail-item">
            <label>도시</label>
            <value>{getCityKorean(customer.region_city)}</value>
          </div>
          <div className="detail-item">
            <label>연령대</label>
            <value>{getAgeGroupKorean(customer.age_group)}</value>
          </div>
          <div className="detail-item">
            <label>나이</label>
            <value>{customer.age}세</value>
          </div>
        </div>

        {/* 이용 정보 */}
        <div className="detail-card">
          <h3>이용 정보</h3>
          <div className="detail-item">
            <label>5월 방문 일수</label>
            <value>{customer.visit_days}일</value>
          </div>
          <div className="detail-item">
            <label>총 이용 시간</label>
            <value>{customer.total_duration_min}분 ({Math.floor(customer.total_duration_min / 60)}시간)</value>
          </div>
          <div className="detail-item">
            <label>평균 이용 시간</label>
            <value>{customer.avg_duration_min}분</value>
          </div>
          <div className="detail-item">
            <label>1회 평균 이용시간</label>
            <value>{Math.round(customer.total_duration_min / customer.visit_days)}분</value>
          </div>
        </div>

        {/* 결제 정보 */}
        <div className="detail-card">
          <h3>결제 정보</h3>
          <div className="detail-item">
            <label>5월 총 결제</label>
            <value className="highlight">{customer.total_payment_may.toLocaleString()}원</value>
          </div>
          <div className="detail-item">
            <label>1회 평균 결제</label>
            <value>{customer.avgPaymentPerVisit.toLocaleString()}원</value>
          </div>
          <div className="detail-item">
            <label>고객 등급</label>
            <value>
              <span className={`badge badge-${customer.customerGrade.toLowerCase()}`}>
                {customer.customerGrade}
              </span>
            </value>
          </div>
        </div>

        {/* 유지 정보 */}
        <div className="detail-card">
          <h3>고객 유지 정보</h3>
          <div className="detail-item">
            <label>6월 재방문</label>
            <value>
              <span className={customer.retained_june === 1 ? 'status-yes' : 'status-no'}>
                {customer.retained_june === 1 ? '✓ 방문' : '✗ 미방문'}
              </span>
            </value>
          </div>
          <div className="detail-item">
            <label>7월 재방문</label>
            <value>
              <span className={customer.retained_july === 1 ? 'status-yes' : 'status-no'}>
                {customer.retained_july === 1 ? '✓ 방문' : '✗ 미방문'}
              </span>
            </value>
          </div>
          <div className="detail-item">
            <label>8월 재방문</label>
            <value>
              <span className={customer.retained_august === 1 ? 'status-yes' : 'status-no'}>
                {customer.retained_august === 1 ? '✓ 방문' : '✗ 미방문'}
              </span>
            </value>
          </div>
          <div className="detail-item">
            <label>90일 유지 여부</label>
            <value>
              <span className={customer.isRetained ? 'status-yes' : 'status-no'}>
                {customer.isRetained ? '✓ 유지' : '✗ 이탈'}
              </span>
            </value>
          </div>
          {customer.retentionMonths && customer.retentionMonths.length > 0 && (
            <div className="detail-item">
              <label>재방문 월</label>
              <value>{customer.retentionMonths.join(', ')}</value>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
