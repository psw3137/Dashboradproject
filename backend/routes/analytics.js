const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// 대시보드 통계
router.get('/dashboard', async (req, res) => {
  try {
    // 총 고객 수
    const totalCustomers = await Customer.countDocuments();

    // 활성 고객 수
    const activeCustomers = await Customer.countDocuments({ status: 'Active' });

    // 총 매출
    const totalRevenue = await Customer.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalSpent' }
        }
      }
    ]);

    // 평균 구매액
    const averagePurchase = await Customer.aggregate([
      {
        $group: {
          _id: null,
          average: { $avg: '$totalSpent' }
        }
      }
    ]);

    // 고객 등급별 분포
    const customersByTier = await Customer.aggregate([
      {
        $group: {
          _id: '$customerTier',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 월별 신규 고객
    const monthlyNewCustomers = await Customer.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$registrationDate' },
            month: { $month: '$registrationDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // 상위 고객 (구매액 기준)
    const topCustomers = await Customer.find()
      .sort({ totalSpent: -1 })
      .limit(10)
      .select('customerId name email totalSpent totalPurchases customerTier');

    res.json({
      success: true,
      data: {
        overview: {
          totalCustomers,
          activeCustomers,
          totalRevenue: totalRevenue[0]?.total || 0,
          averagePurchase: averagePurchase[0]?.average || 0
        },
        customersByTier,
        monthlyNewCustomers,
        topCustomers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '분석 데이터를 가져오는 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 매출 분석
router.get('/revenue', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = {};
    if (startDate || endDate) {
      matchStage.lastPurchaseDate = {};
      if (startDate) matchStage.lastPurchaseDate.$gte = new Date(startDate);
      if (endDate) matchStage.lastPurchaseDate.$lte = new Date(endDate);
    }

    const pipeline = [];
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      {
        $group: {
          _id: {
            year: { $year: '$lastPurchaseDate' },
            month: { $month: '$lastPurchaseDate' }
          },
          totalRevenue: { $sum: '$totalSpent' },
          totalPurchases: { $sum: '$totalPurchases' },
          customerCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    );

    const revenueData = await Customer.aggregate(pipeline);

    res.json({
      success: true,
      data: revenueData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '매출 분석 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 고객 세그멘테이션
router.get('/segmentation', async (req, res) => {
  try {
    // 구매액 기준 세그멘테이션
    const spendingSegments = await Customer.aggregate([
      {
        $bucket: {
          groupBy: '$totalSpent',
          boundaries: [0, 100, 500, 1000, 5000, 10000, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            avgSpent: { $avg: '$totalSpent' }
          }
        }
      }
    ]);

    // 구매 빈도 세그멘테이션
    const frequencySegments = await Customer.aggregate([
      {
        $bucket: {
          groupBy: '$totalPurchases',
          boundaries: [0, 1, 5, 10, 20, 50, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            avgPurchases: { $avg: '$totalPurchases' }
          }
        }
      }
    ]);

    // 지역별 분포
    const locationDistribution = await Customer.aggregate([
      {
        $group: {
          _id: '$address.state',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalSpent' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      success: true,
      data: {
        spendingSegments,
        frequencySegments,
        locationDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '세그멘테이션 분석 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;
