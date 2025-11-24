/**
 * 통계 API 라우트
 * 웹프레임워크백엔드 2조 - 매출/이용 패턴 통계 대시보드
 *
 * 엔드포인트:
 * - GET /api/statistics/kpi - KPI 지표 조회
 * - GET /api/statistics/revenue-by-region - 지역별 매출 통계
 * - GET /api/statistics/revenue-by-age - 연령대별 매출 통계
 * - GET /api/statistics/revenue-trend - 매출 추이
 * - GET /api/statistics/customer-distribution - 고객 분포
 */

const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

/**
 * GET /api/statistics/kpi
 * KPI 지표 조회
 *
 * 응답:
 * - totalRevenue: 총 매출
 * - totalCustomers: 총 고객 수
 * - arpu: 평균 객단가
 * - avgVisits: 평균 방문 일수
 * - retentionRate: 90일 유지율
 */
router.get('/kpi', async (req, res) => {
  try {
    const stats = await Customer.getOverallStats();

    if (!stats) {
      return res.status(404).json({
        success: false,
        message: '통계 데이터가 없습니다.'
      });
    }

    res.json({
      success: true,
      data: {
        totalRevenue: stats.totalRevenue,
        totalCustomers: stats.totalCustomers,
        arpu: stats.avgRevenue,
        avgVisits: stats.avgVisits,
        retentionRate: stats.retentionRate
      }
    });
  } catch (error) {
    console.error('KPI 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: 'KPI 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

/**
 * GET /api/statistics/revenue-by-region
 * 지역별 매출 통계
 */
router.get('/revenue-by-region', async (req, res) => {
  try {
    const stats = await Customer.getStatsByRegion();

    const formattedData = stats.map(item => ({
      region: item._id,
      revenue: item.totalRevenue,
      customers: item.customerCount,
      avgVisits: Math.round(item.avgVisits * 100) / 100,
      avgRevenue: Math.round(item.avgRevenue)
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('지역별 통계 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '지역별 통계 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

/**
 * GET /api/statistics/revenue-by-age
 * 연령대별 매출 통계
 */
router.get('/revenue-by-age', async (req, res) => {
  try {
    const stats = await Customer.getStatsByAgeGroup();

    const formattedData = stats.map(item => ({
      ageGroup: item._id,
      revenue: item.totalRevenue,
      customers: item.customerCount,
      avgVisits: Math.round(item.avgVisits * 100) / 100,
      avgRevenue: Math.round(item.avgRevenue),
      retentionRate: item.retentionRate
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('연령대별 통계 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '연령대별 통계 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

/**
 * GET /api/statistics/revenue-trend
 * 매출 추이 (주차별 또는 일별)
 * @query type - 'weekly' (기본값) 또는 'daily'
 */
router.get('/revenue-trend', async (req, res) => {
  try {
    const { type = 'weekly' } = req.query;

    if (type === 'daily') {
      // 일별 매출 (방문일수 1~31일 기준)
      const stats = await Customer.aggregate([
        {
          $group: {
            _id: '$visit_days',
            revenue: { $sum: '$total_payment_may' },
            customers: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const labels = stats.map(item => `${item._id}일`);
      const data = stats.map(item => item.revenue);

      res.json({
        success: true,
        data: {
          type: 'daily',
          labels,
          data,
          details: stats
        }
      });
    } else {
      // 주차별 매출 (기본)
      const stats = await Customer.aggregate([
        {
          $addFields: {
            week: {
              $cond: [
                { $lte: ['$visit_days', 7] }, 1,
                { $cond: [
                  { $lte: ['$visit_days', 14] }, 2,
                  { $cond: [
                    { $lte: ['$visit_days', 21] }, 3,
                    4
                  ]}
                ]}
              ]
            }
          }
        },
        {
          $group: {
            _id: '$week',
            revenue: { $sum: '$total_payment_may' },
            customers: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const labels = stats.map(item => `${item._id}주차`);
      const data = stats.map(item => item.revenue);

      res.json({
        success: true,
        data: {
          type: 'weekly',
          labels,
          data,
          details: stats
        }
      });
    }
  } catch (error) {
    console.error('매출 추이 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '매출 추이 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

/**
 * GET /api/statistics/customer-distribution
 * 고객 분포 (지역별 비율)
 */
router.get('/customer-distribution', async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const distribution = await Customer.aggregate([
      {
        $group: {
          _id: '$region_city_group',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const formattedData = distribution.map(item => ({
      region: item._id,
      count: item.count,
      percentage: Math.round((item.count / totalCustomers) * 100 * 100) / 100
    }));

    res.json({
      success: true,
      data: formattedData,
      total: totalCustomers
    });
  } catch (error) {
    console.error('고객 분포 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '고객 분포 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

/**
 * GET /api/statistics/heatmap
 * 지역 x 연령대 교차 분석 (히트맵용)
 * 매출 기준 내림차순 정렬
 */
router.get('/heatmap', async (req, res) => {
  try {
    const heatmapData = await Customer.aggregate([
      {
        $group: {
          _id: {
            region: '$region_city_group',
            ageGroup: '$age_group'
          },
          revenue: { $sum: '$total_payment_may' },
          customers: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }  // 매출 기준 내림차순 정렬
    ]);

    const formattedData = heatmapData.map(item => ({
      region: item._id.region,
      ageGroup: item._id.ageGroup,
      revenue: item.revenue,
      customers: item.customers
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('히트맵 데이터 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '히트맵 데이터 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;
