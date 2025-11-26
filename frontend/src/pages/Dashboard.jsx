/**
 * Dashboard 페이지
 * 웹프레임워크백엔드 2조
 */

import React, { useState, useEffect } from 'react';
import { getKPI, getRevenueByRegion, getCustomerDistribution } from '../services/api';
import KPICard from '../components/KPICard';
import RevenueByRegionChart from '../components/RevenueByRegionChart';
import CustomerDistributionChart from '../components/CustomerDistributionChart';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [kpiData, setKpiData] = useState(null);
  const [revenueByRegion, setRevenueByRegion] = useState(null);
  const [customerDistribution, setCustomerDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [kpi, region, distribution] = await Promise.all([
        getKPI(),
        getRevenueByRegion(),
        getCustomerDistribution(),
      ]);

      setKpiData(kpi.data);
      setRevenueByRegion(region.data);
      setCustomerDistribution(distribution.data);
    } catch (err) {
      console.error('대시보드 데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다. 서버가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">{error}</div>
        <button onClick={loadDashboardData} className="retry-button">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>매출/이용 패턴 통계 대시보드</h2>
        <p className="dashboard-subtitle">5월 데이터 기준</p>
      </div>

      {/* KPI 카드 섹션 */}
      {kpiData && (
        <div className="kpi-section">
          {/* 주요 KPI - 큰 사이즈 */}
          <KPICard
            title="총 매출"
            value={`${(kpiData.totalRevenue / 100000000).toFixed(1)}억원`}
            subtitle={`${kpiData.totalRevenue.toLocaleString()}원`}
            icon="💰"
            size="large"
            color="primary"
          />
          <KPICard
            title="총 고객 수"
            value={`${kpiData.totalCustomers.toLocaleString()}명`}
            subtitle="활성 고객"
            icon="👥"
            size="large"
            color="info"
          />
          {/* 보조 KPI - 일반 사이즈 */}
          <KPICard
            title="평균 객단가"
            value={`${(kpiData.arpu / 10000).toFixed(1)}만원`}
            subtitle={`${kpiData.arpu.toLocaleString()}원`}
            icon="💳"
            color="warning"
          />
          <KPICard
            title="평균 방문"
            value={`${kpiData.avgVisits}일`}
            subtitle="월 평균"
            icon="📅"
          />
          <KPICard
            title="전체 유지율"
            value={`${kpiData.retentionRate}%`}
            subtitle="90일 기준"
            icon="🔄"
            color="success"
          />
        </div>
      )}

      {/* 차트 섹션 */}
      <div className="charts-grid">
        {/* 지역별 매출 */}
        {revenueByRegion && (
          <div className="chart-container">
            <h3>지역별 매출</h3>
            <RevenueByRegionChart data={revenueByRegion} />
          </div>
        )}

        {/* 고객 분포 */}
        {customerDistribution && (
          <div className="chart-container">
            <h3>지역별 고객 분포</h3>
            <CustomerDistributionChart data={customerDistribution} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
