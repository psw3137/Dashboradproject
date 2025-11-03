const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Retention = require('../models/Retention');

// 대시보드 통계
router.get('/dashboard', async (req, res) => {
  try {
    // 총 고객 수
    const totalCustomers = await Customer.countDocuments();

    // 총 매출 및 평균
    const paymentStats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total_payment_may' },
          avgPayment: { $avg: '$total_payment_may' },
          totalVisitDays: { $sum: '$visit_days' },
          avgVisitDays: { $avg: '$visit_days' },
          avgDuration: { $avg: '$total_duration_min' }
        }
      }
    ]);

    // 지역별 분포 (상위 10개)
    const regionDistribution = await Customer.aggregate([
      {
        $group: {
          _id: '$region_city_group',
          count: { $sum: 1 },
          totalPayment: { $sum: '$total_payment_may' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 연령대별 분포
    const ageGroupDistribution = await Customer.aggregate([
      {
        $group: {
          _id: '$age_group',
          count: { $sum: 1 },
          avgPayment: { $avg: '$total_payment_may' },
          totalPayment: { $sum: '$total_payment_may' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 상위 고객 (결제액 기준)
    const topCustomers = await Customer.find()
      .sort({ total_payment_may: -1 })
      .limit(10)
      .select('uid region_city_group region_city age_group visit_days total_payment_may');

    // 고객 등급 분포 (동적 계산)
    const customerTiers = await Customer.aggregate([
      {
        $project: {
          tier: {
            $switch: {
              branches: [
                { case: { $gte: ['$total_payment_may', 500000] }, then: 'Diamond' },
                { case: { $gte: ['$total_payment_may', 300000] }, then: 'Platinum' },
                { case: { $gte: ['$total_payment_may', 150000] }, then: 'Gold' },
                { case: { $gte: ['$total_payment_may', 50000] }, then: 'Silver' }
              ],
              default: 'Bronze'
            }
          }
        }
      },
      {
        $group: {
          _id: '$tier',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalCustomers,
          totalRevenue: paymentStats[0]?.totalRevenue || 0,
          avgPayment: paymentStats[0]?.avgPayment || 0,
          totalVisitDays: paymentStats[0]?.totalVisitDays || 0,
          avgVisitDays: paymentStats[0]?.avgVisitDays || 0,
          avgDuration: paymentStats[0]?.avgDuration || 0
        },
        regionDistribution,
        ageGroupDistribution,
        customerTiers,
        topCustomers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '대시보드 데이터를 가져오는 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 지역별 분석
router.get('/by-region', async (req, res) => {
  try {
    const regionStats = await Customer.aggregate([
      {
        $group: {
          _id: '$region_city_group',
          totalCustomers: { $sum: 1 },
          totalPayment: { $sum: '$total_payment_may' },
          avgPayment: { $avg: '$total_payment_may' },
          totalVisitDays: { $sum: '$visit_days' },
          avgVisitDays: { $avg: '$visit_days' },
          avgDuration: { $avg: '$total_duration_min' }
        }
      },
      { $sort: { totalPayment: -1 } }
    ]);

    res.json({
      success: true,
      data: regionStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '지역별 분석 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 연령대별 분석
router.get('/by-age-group', async (req, res) => {
  try {
    const ageStats = await Customer.aggregate([
      {
        $group: {
          _id: '$age_group',
          totalCustomers: { $sum: 1 },
          totalPayment: { $sum: '$total_payment_may' },
          avgPayment: { $avg: '$total_payment_may' },
          avgAge: { $avg: '$age' },
          totalVisitDays: { $sum: '$visit_days' },
          avgVisitDays: { $avg: '$visit_days' }
        }
      },
      { $sort: { totalPayment: -1 } }
    ]);

    res.json({
      success: true,
      data: ageStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '연령대별 분석 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 결제액 분포 분석 (세그멘테이션)
router.get('/payment-distribution', async (req, res) => {
  try {
    const paymentSegments = await Customer.aggregate([
      {
        $bucket: {
          groupBy: '$total_payment_may',
          boundaries: [0, 50000, 100000, 200000, 300000, 500000, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            avgVisitDays: { $avg: '$visit_days' },
            avgDuration: { $avg: '$total_duration_min' }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: paymentSegments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '결제액 분포 분석 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 방문 빈도 분석
router.get('/visit-frequency', async (req, res) => {
  try {
    const visitSegments = await Customer.aggregate([
      {
        $bucket: {
          groupBy: '$visit_days',
          boundaries: [0, 1, 3, 5, 10, 20, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            avgPayment: { $avg: '$total_payment_may' },
            totalPayment: { $sum: '$total_payment_may' }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: visitSegments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '방문 빈도 분석 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 지역 x 연령대 교차 분석
router.get('/region-age-matrix', async (req, res) => {
  try {
    const matrixData = await Customer.aggregate([
      {
        $group: {
          _id: {
            region: '$region_city_group',
            ageGroup: '$age_group'
          },
          count: { $sum: 1 },
          avgPayment: { $avg: '$total_payment_may' },
          totalPayment: { $sum: '$total_payment_may' }
        }
      },
      { $sort: { totalPayment: -1 } }
    ]);

    res.json({
      success: true,
      data: matrixData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '교차 분석 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// RFM 분석 (Recency, Frequency, Monetary)
router.get('/rfm-analysis', async (req, res) => {
  try {
    const rfmData = await Customer.aggregate([
      {
        $project: {
          uid: 1,
          region_city_group: 1,
          age_group: 1,
          frequency: '$visit_days',
          monetary: '$total_payment_may',
          avgPerVisit: {
            $cond: [
              { $eq: ['$visit_days', 0] },
              0,
              { $divide: ['$total_payment_may', '$visit_days'] }
            ]
          }
        }
      },
      { $sort: { monetary: -1 } },
      { $limit: 100 }
    ]);

    res.json({
      success: true,
      data: rfmData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'RFM 분석 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;
