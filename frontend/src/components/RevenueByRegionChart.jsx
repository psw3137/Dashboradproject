/**
 * 지역별 매출 차트 컴포넌트
 * 웹프레임워크백엔드 2조
 */

import React from 'react';
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
  // 상위 10개 지역만 표시
  const topRegions = data.slice(0, 10);

  const chartData = {
    labels: topRegions.map(item => item.region),
    datasets: [
      {
        label: '매출 (원)',
        data: topRegions.map(item => item.revenue),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // 가로 막대 차트
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const revenue = context.parsed.x;
            const customers = topRegions[context.dataIndex].customers;
            return [
              `매출: ${revenue.toLocaleString()}원`,
              `고객 수: ${customers.toLocaleString()}명`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return (value / 100000000).toFixed(1) + '억';
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '400px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default RevenueByRegionChart;
