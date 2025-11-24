/**
 * 매출 추이 차트 컴포넌트
 * 웹프레임워크백엔드 2조
 */

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevenueTrendChart = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: '매출',
        data: data.data,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 13,
            weight: '600',
          },
          padding: 20,
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
        displayColors: false,
        callbacks: {
          title: function(context) {
            return `${context[0].label}`;
          },
          label: function(context) {
            const value = context.parsed.y;
            const billions = (value / 100000000).toFixed(2);
            return `매출: ${billions}억원 (${value.toLocaleString()}원)`;
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
          font: { size: 12, weight: '500' },
          color: '#666',
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

  return (
    <div style={{ height: '280px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RevenueTrendChart;
