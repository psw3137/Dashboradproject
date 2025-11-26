/**
 * 고객 분포 차트 컴포넌트 (파이 차트)
 * 웹프레임워크백엔드 2조
 */

import React from 'react';
import { getRegionKorean, getShortRegionName } from '../utils/formatters';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const CustomerDistributionChart = ({ data }) => {
  // 상위 8개 지역만 표시, 나머지는 "기타"로 묶음
  const topRegions = data.slice(0, 8);
  const otherRegions = data.slice(8);
  const otherCount = otherRegions.reduce((sum, item) => sum + item.count, 0);
  const otherPercentage = otherRegions.reduce((sum, item) => sum + item.percentage, 0);

  const displayData = [...topRegions];
  if (otherCount > 0) {
    displayData.push({
      region: '기타',
      count: otherCount,
      percentage: otherPercentage
    });
  }

  // 세련된 색상 팔레트
  const colors = [
    'rgba(102, 126, 234, 0.85)',   // 보라
    'rgba(118, 75, 162, 0.85)',    // 진보라
    'rgba(0, 200, 83, 0.85)',      // 초록
    'rgba(0, 188, 212, 0.85)',     // 청록
    'rgba(255, 193, 7, 0.85)',     // 노랑
    'rgba(255, 87, 34, 0.85)',     // 주황
    'rgba(233, 30, 99, 0.85)',     // 핑크
    'rgba(63, 81, 181, 0.85)',     // 인디고
    'rgba(158, 158, 158, 0.85)',   // 회색 (기타)
  ];

  const chartData = {
    labels: displayData.map(item => item.region === '기타' ? '기타' : getShortRegionName(item.region)),
    datasets: [
      {
        label: '고객 수',
        data: displayData.map(item => item.count),
        backgroundColor: colors,
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 11, weight: '500' },
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 46, 0.95)',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: function(context) {
            const item = displayData[context[0].dataIndex];
            return item.region === '기타' ? '기타 지역' : getRegionKorean(item.region);
          },
          label: function(context) {
            const item = displayData[context.dataIndex];
            return [
              `고객 수: ${item.count.toLocaleString()}명`,
              `비율: ${item.percentage.toFixed(1)}%`
            ];
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '320px' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default CustomerDistributionChart;
