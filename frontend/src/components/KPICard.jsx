/**
 * KPI Card 컴포넌트
 * 웹프레임워크백엔드 2조
 */

import React from 'react';
import '../styles/KPICard.css';

const KPICard = ({ title, value, subtitle, icon, trend }) => {
  return (
    <div className="kpi-card">
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-content">
        <div className="kpi-title">{title}</div>
        <div className="kpi-value">{value}</div>
        {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
        {trend && (
          <div className={`kpi-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
