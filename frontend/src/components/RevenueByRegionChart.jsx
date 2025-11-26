/**
 * 지역별 매출 차트 컴포넌트
 * 웹프레임워크백엔드 2조
 */

import React from 'react';
import { getRegionKorean, getShortRegionName } from '../utils/formatters';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RevenueByRegionChart = ({ data }) => {
  // 상위 10개 지역 표시
  const topRegions = data.slice(0, 10);

  // 그라디언트 색상 배열 (진한 보라 → 연한 보라)
  const barColors = [
    'rgba(102, 126, 234, 0.9)',
    'rgba(118, 75, 162, 0.85)',
    'rgba(102, 126, 234, 0.8)',
    'rgba(118, 75, 162, 0.75)',
    'rgba(102, 126, 234, 0.7)',
    'rgba(118, 75, 162, 0.65)',
    'rgba(102, 126, 234, 0.6)',
    'rgba(118, 75, 162, 0.55)',
    'rgba(102, 126, 234, 0.5)',
    'rgba(118, 75, 162, 0.45)',
  ];

  const chartData = {
    labels: topRegions.map(item => getShortRegionName(item.region)),
    datasets: [
      {
        label: '매출',
        data: topRegions.map(item => item.revenue),
        backgroundColor: barColors,
        borderColor: barColors.map(c => c.replace(/[\d.]+\)$/, '1)')),
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
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
            return getRegionKorean(topRegions[context[0].dataIndex].region);
          },
          label: function(context) {
            const revenue = context.parsed.x;
            const customers = topRegions[context.dataIndex].customers;
            const billions = (revenue / 100000000).toFixed(2);
            return [
              `매출: ${billions}억원`,
              `고객 수: ${customers.toLocaleString()}명`
            ];
          }
        }
      }
    },
    scales: {
      x: {
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
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 12, weight: '500' },
          color: '#333',
        },
      }
    }
  };

  return (
    <div style={{ height: '320px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default RevenueByRegionChart;
