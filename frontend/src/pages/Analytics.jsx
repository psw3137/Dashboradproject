/**
 * 상세 분석 페이지
 * 웹프레임워크백엔드 2조
 */

import React, { useState, useEffect } from 'react';
import { getRevenueByAge, getHeatmapData } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import '../styles/Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
const getRegionKorean = (region) => REGION_GROUP_MAPPING[region] || region;
const getAgeGroupKorean = (ageGroup) => AGE_GROUP_MAPPING[ageGroup] || ageGroup;

const Analytics = () => {
  const [revenueByAge, setRevenueByAge] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ageData, heatmap] = await Promise.all([
        getRevenueByAge(),
        getHeatmapData(),
      ]);

      setRevenueByAge(ageData.data);
      setHeatmapData(heatmap.data);
    } catch (err) {
      console.error('분석 데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 연령대별 색상
  const ageColors = [
    'rgba(102, 126, 234, 0.85)',
    'rgba(118, 75, 162, 0.85)',
    'rgba(0, 188, 212, 0.85)',
    'rgba(255, 152, 0, 0.85)',
  ];

  const getAgeChartData = () => {
    if (!revenueByAge) return null;

    return {
      labels: revenueByAge.map(item => getAgeGroupKorean(item.ageGroup)),
      datasets: [
        {
          label: '매출',
          data: revenueByAge.map(item => item.revenue),
          backgroundColor: ageColors,
          borderColor: ageColors.map(c => c.replace('0.85', '1')),
          borderWidth: 1,
          borderRadius: 6,
          barThickness: 60,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 46, 0.95)',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: function(context) {
            return getAgeGroupKorean(revenueByAge[context[0].dataIndex].ageGroup);
          },
          label: function(context) {
            const item = revenueByAge[context.dataIndex];
            const billions = (item.revenue / 100000000).toFixed(2);
            return [
              `매출: ${billions}억원`,
              `고객 수: ${item.customers.toLocaleString()}명`,
              `평균 매출: ${Math.round(item.avgRevenue).toLocaleString()}원`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 13, weight: '600' },
          color: '#333',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
        },
        ticks: {
          font: { size: 12 },
          color: '#666',
          callback: function(value) {
            return (value / 100000000).toFixed(1) + '억';
          }
        }
      }
    }
  };

  // Summary 계산
  const getSummary = () => {
    if (!revenueByAge) return null;
    const totalRevenue = revenueByAge.reduce((sum, item) => sum + item.revenue, 0);
    const totalCustomers = revenueByAge.reduce((sum, item) => sum + item.customers, 0);
    const avgRetention = (revenueByAge.reduce((sum, item) => sum + item.retentionRate, 0) / revenueByAge.length).toFixed(1);
    const bestAge = revenueByAge.reduce((best, item) => item.revenue > best.revenue ? item : best, revenueByAge[0]);
    return { totalRevenue, totalCustomers, avgRetention, bestAge };
  };

  // 매출 포맷팅 함수
  const formatRevenue = (revenue) => {
    if (revenue >= 100000000) {
      return `${(revenue / 100000000).toFixed(2)}억원`;
    } else if (revenue >= 10000) {
      return `${(revenue / 10000).toFixed(0)}만원`;
    } else {
      return `${revenue.toLocaleString()}원`;
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const summary = getSummary();

  return (
    <div className="analytics">
      <div className="page-header">
        <h2>상세 분석</h2>
        <p className="page-description">연령대별, 지역별 상세 매출 분석</p>
      </div>

      {/* Summary 카드 */}
      {summary && (
        <div className="summary-section">
          <div className="summary-card">
            <div className="summary-icon">💰</div>
            <div className="summary-content">
              <div className="summary-label">분석 대상 총 매출</div>
              <div className="summary-value">{(summary.totalRevenue / 100000000).toFixed(1)}억원</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">👥</div>
            <div className="summary-content">
              <div className="summary-label">분석 대상 고객</div>
              <div className="summary-value">{summary.totalCustomers.toLocaleString()}명</div>
            </div>
          </div>
          <div className="summary-card highlight">
            <div className="summary-icon">🏆</div>
            <div className="summary-content">
              <div className="summary-label">최고 매출 연령대</div>
              <div className="summary-value">{getAgeGroupKorean(summary.bestAge.ageGroup)}</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🔄</div>
            <div className="summary-content">
              <div className="summary-label">평균 유지율</div>
              <div className="summary-value">{summary.avgRetention}%</div>
            </div>
          </div>
        </div>
      )}

      {/* 분석 섹션들을 2열 그리드로 배치 */}
      <div className="analytics-sections-grid">
        {/* 연령대별 매출 차트 */}
        {revenueByAge && (
          <div className="analytics-section">
            <div className="section-header">
              <h3>연령대별 매출 차트</h3>
            </div>
            <div className="chart-container" style={{ height: '350px' }}>
              <Bar data={getAgeChartData()} options={chartOptions} />
            </div>
          </div>
        )}

        {/* 연령대별 통계 테이블 */}
        {revenueByAge && (
          <div className="analytics-section">
            <div className="section-header">
              <h3>연령대별 상세 통계</h3>
            </div>
            <div className="stats-table">
              <table>
                <thead>
                  <tr>
                    <th>연령대</th>
                    <th>고객 수</th>
                    <th>총 매출</th>
                    <th>유지율</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueByAge.map((item, index) => (
                    <tr key={item.ageGroup}>
                      <td>
                        <span className="age-badge" style={{ backgroundColor: ageColors[index] }}>
                          {getAgeGroupKorean(item.ageGroup)}
                        </span>
                      </td>
                      <td><strong>{item.customers.toLocaleString()}</strong>명</td>
                      <td className="revenue-cell">{formatRevenue(item.revenue)}</td>
                      <td>
                        <span className={`retention-badge ${item.retentionRate >= 50 ? 'high' : 'low'}`}>
                          {item.retentionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 히트맵 데이터 테이블 - 전체 너비 */}
        {heatmapData && (
          <div className="analytics-section full-width">
            <div className="section-header">
              <h3>지역 x 연령대 교차 분석</h3>
              <span className="section-badge">매출 상위 15개</span>
            </div>
            <div className="heatmap-container">
              <table className="heatmap-table">
                <thead>
                  <tr>
                    <th>순위</th>
                    <th>지역</th>
                    <th>연령대</th>
                    <th>고객 수</th>
                    <th>매출</th>
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.slice(0, 15).map((item, index) => (
                    <tr key={index} className={index < 3 ? 'top-rank' : ''}>
                      <td>
                        <span className={`rank-badge rank-${index < 3 ? index + 1 : 'default'}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td>{getRegionKorean(item.region)}</td>
                      <td>{getAgeGroupKorean(item.ageGroup)}</td>
                      <td><strong>{item.customers.toLocaleString()}</strong>명</td>
                      <td className="revenue-cell">{formatRevenue(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
