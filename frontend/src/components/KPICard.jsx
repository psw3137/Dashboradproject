/**
 * KPI Card 컴포넌트
 * 웹프레임워크백엔드 2조
 */

import React from 'react';
import '../styles/KPICard.css';

const KPICard = ({ title, value, subtitle, icon, trend, size = 'normal', color }) => {
  const cardClass = `kpi-card kpi-card-${size} ${color ? `kpi-card-${color}` : ''}`;

  return (
    <div className={cardClass}>
      <div className="kpi-header">
        <div className="kpi-icon">{icon}</div>
        <div className="kpi-title">{title}</div>
      </div>
      <div className="kpi-body">
        <div className="kpi-value">{value}</div>
        {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
      </div>
      {trend !== undefined && (
        <div className="kpi-footer">
          <div className={`kpi-trend ${trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral'}`}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}% 전월 대비
          </div>
        </div>
      )}
    </div>
  );
};

export default KPICard;
