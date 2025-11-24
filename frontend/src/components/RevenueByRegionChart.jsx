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

// 광역시도 한글 매핑
const REGION_GROUP_MAPPING = {
  'Seoul': '서울특별시', 'Gyeonggi-do': '경기도', 'Incheon': '인천광역시',
  'Busan': '부산광역시', 'Daegu': '대구광역시', 'Daejeon': '대전광역시',
  'Gwangju': '광주광역시', 'Ulsan': '울산광역시', 'Sejong': '세종특별자치시',
  'Gangwon-do': '강원도', 'Chungcheongbuk-do': '충청북도', 'Chungcheongnam-do': '충청남도',
  'Jeollabuk-do': '전라북도', 'Jeollanam-do': '전라남도', 'Gyeongsangbuk-do': '경상북도',
  'Gyeongsangnam-do': '경상남도', 'Jeju': '제주특별자치도'
};

const getRegionKorean = (region) => REGION_GROUP_MAPPING[region] || region;

const RevenueByRegionChart = ({ data }) => {
  // 상위 10개 지역만 표시
  const topRegions = data.slice(0, 10);

  const chartData = {
    labels: topRegions.map(item => getRegionKorean(item.region)),
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
