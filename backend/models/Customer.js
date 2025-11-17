/**
 * Customer Model (고객 데이터 스키마)
 * 웹프레임워크백엔드 2조 - 매출/이용 패턴 통계 대시보드
 *
 * 참고: 요구사항 분석서 8.1 데이터베이스 스키마
 */

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  // 고객 고유 ID
  uid: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },

  // 지역 정보
  region_city_group: {
    type: String,
    required: true,
    index: true,
    description: '광역시도 (예: 서울, 경기도, 인천 등)'
  },

  region_city_group_no: {
    type: Number,
    description: '지역 그룹 번호'
  },

  region_city: {
    type: String,
    required: true,
    index: true,
    description: '시/군/구 (예: 서울, 용인, 성남 등)'
  },

  // 연령 정보
  age_group: {
    type: String,
    required: true,
    enum: ['Teens', 'Twenties', 'Thirties', 'Forties+'],
    index: true,
    description: '연령대 (10대, 20대, 30대, 40대 이상)'
  },

  age: {
    type: Number,
    required: true,
    min: 10,
    max: 100,
    description: '나이'
  },

  // 방문 및 이용 정보
  visit_days: {
    type: Number,
    required: true,
    min: 0,
    max: 31,
    description: '5월 방문 일수'
  },

  total_duration_min: {
    type: Number,
    required: true,
    min: 0,
    description: '총 이용 시간 (분)'
  },

  avg_duration_min: {
    type: Number,
    required: true,
    min: 0,
    description: '평균 이용 시간 (분)'
  },

  // 결제 정보
  total_payment_may: {
    type: Number,
    required: true,
    min: 0,
    index: true,
    description: '5월 총 결제 금액 (원)'
  },

  // 고객 유지율 (재방문 여부)
  retained_june: {
    type: Number,
    enum: [0, 1],
    default: 0,
    description: '6월 재방문 여부 (0: 미방문, 1: 방문)'
  },

  retained_july: {
    type: Number,
    enum: [0, 1],
    default: 0,
    description: '7월 재방문 여부 (0: 미방문, 1: 방문)'
  },

  retained_august: {
    type: Number,
    enum: [0, 1],
    default: 0,
    description: '8월 재방문 여부 (0: 미방문, 1: 방문)'
  },

  retained_90: {
    type: Number,
    enum: [0, 1],
    default: 0,
    index: true,
    description: '90일 이내 재방문 여부 (0: 미방문, 1: 방문)'
  }
}, {
  timestamps: true, // createdAt, updatedAt 자동 생성
  collection: 'customers'
});

// 복합 인덱스 (성능 최적화)
customerSchema.index({ region_city_group: 1, age_group: 1 });
customerSchema.index({ total_payment_may: -1 }); // 매출 내림차순
customerSchema.index({ visit_days: -1 }); // 방문 일수 내림차순

// 가상 필드: 1회 평균 결제 금액
customerSchema.virtual('avg_payment_per_visit').get(function() {
  return this.visit_days > 0 ? Math.round(this.total_payment_may / this.visit_days) : 0;
});

// 가상 필드: 고객 등급 계산
customerSchema.virtual('customer_grade').get(function() {
  if (this.total_payment_may >= 200000) return 'VIP';
  if (this.total_payment_may >= 100000) return 'Gold';
  if (this.total_payment_may >= 50000) return 'Silver';
  return 'Bronze';
});

// 가상 필드: 재방문 월 목록
customerSchema.virtual('retention_months').get(function() {
  const months = [];
  if (this.retained_june === 1) months.push('6월');
  if (this.retained_july === 1) months.push('7월');
  if (this.retained_august === 1) months.push('8월');
  return months;
});

// toJSON 옵션 설정 (가상 필드 포함)
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

// 정적 메서드: 전체 통계 계산
customerSchema.statics.getOverallStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        totalRevenue: { $sum: '$total_payment_may' },
        avgRevenue: { $avg: '$total_payment_may' },
        avgVisits: { $avg: '$visit_days' },
        totalDuration: { $sum: '$total_duration_min' },
        retainedCount: { $sum: '$retained_90' }
      }
    }
  ]);

  if (stats.length === 0) return null;

  const result = stats[0];
  return {
    totalCustomers: result.totalCustomers,
    totalRevenue: result.totalRevenue,
    avgRevenue: Math.round(result.avgRevenue),
    avgVisits: Math.round(result.avgVisits * 100) / 100,
    totalDuration: result.totalDuration,
    retentionRate: Math.round((result.retainedCount / result.totalCustomers) * 100 * 100) / 100
  };
};

// 정적 메서드: 지역별 통계
customerSchema.statics.getStatsByRegion = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$region_city_group',
        totalRevenue: { $sum: '$total_payment_may' },
        customerCount: { $sum: 1 },
        avgVisits: { $avg: '$visit_days' },
        avgRevenue: { $avg: '$total_payment_may' }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);
};

// 정적 메서드: 연령대별 통계
customerSchema.statics.getStatsByAgeGroup = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$age_group',
        totalRevenue: { $sum: '$total_payment_may' },
        customerCount: { $sum: 1 },
        avgVisits: { $avg: '$visit_days' },
        avgRevenue: { $avg: '$total_payment_may' }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
