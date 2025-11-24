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

  const getAgeChartData = () => {
    if (!revenueByAge) return null;

    return {
      labels: revenueByAge.map(item => getAgeGroupKorean(item.ageGroup)),
      datasets: [
        {
          label: '매출 (원)',
          data: revenueByAge.map(item => item.revenue),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
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
        callbacks: {
          label: function(context) {
            const item = revenueByAge[context.dataIndex];
            return [
              `매출: ${item.revenue.toLocaleString()}원`,
              `고객 수: ${item.customers.toLocaleString()}명`,
              `평균 매출: ${item.avgRevenue.toLocaleString()}원`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return (value / 100000000).toFixed(1) + '억';
          }
        }
      }
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="analytics">
      <h2>상세 분석</h2>

      {/* 연령대별 매출 차트 */}
      {revenueByAge && (
        <div className="analytics-section">
          <h3>연령대별 매출 분석</h3>
          <div className="chart-container" style={{ height: '400px' }}>
            <Bar data={getAgeChartData()} options={chartOptions} />
          </div>

          {/* 연령대별 통계 테이블 */}
          <div className="stats-table">
            <table>
              <thead>
                <tr>
                  <th>연령대</th>
                  <th>고객 수</th>
                  <th>총 매출</th>
                  <th>평균 매출</th>
                  <th>평균 방문</th>
                  <th>유지율</th>
                </tr>
              </thead>
              <tbody>
                {revenueByAge.map((item) => (
                  <tr key={item.ageGroup}>
                    <td>{getAgeGroupKorean(item.ageGroup)}</td>
                    <td>{item.customers.toLocaleString()}명</td>
                    <td>{item.revenue.toLocaleString()}원</td>
                    <td>{item.avgRevenue.toLocaleString()}원</td>
                    <td>{item.avgVisits}일</td>
                    <td>{item.retentionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 히트맵 데이터 테이블 */}
      {heatmapData && (
        <div className="analytics-section">
          <h3>지역 x 연령대 교차 분석</h3>
          <div className="heatmap-container">
            <table className="heatmap-table">
              <thead>
                <tr>
                  <th>지역</th>
                  <th>연령대</th>
                  <th>고객 수</th>
                  <th>매출</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.slice(0, 20).map((item, index) => (
                  <tr key={index}>
                    <td>{getRegionKorean(item.region)}</td>
                    <td>{getAgeGroupKorean(item.ageGroup)}</td>
                    <td>{item.customers.toLocaleString()}명</td>
                    <td>{item.revenue.toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
