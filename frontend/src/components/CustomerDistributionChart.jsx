/**
 * 고객 분포 차트 컴포넌트 (파이 차트)
 * 웹프레임워크백엔드 2조
 */

import React from 'react';
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

  const colors = [
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
    'rgba(199, 199, 199, 0.6)',
    'rgba(83, 102, 255, 0.6)',
    'rgba(155, 155, 155, 0.6)',
  ];

  const chartData = {
    labels: displayData.map(item => item.region),
    datasets: [
      {
        label: '고객 수',
        data: displayData.map(item => item.count),
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('0.6', '1')),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const item = displayData[context.dataIndex];
            return [
              `${item.region}`,
              `고객 수: ${item.count.toLocaleString()}명`,
              `비율: ${item.percentage.toFixed(2)}%`
            ];
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '400px' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default CustomerDistributionChart;
