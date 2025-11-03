const express = require('express');
const router = express.Router();
const Retention = require('../models/Retention');
const Customer = require('../models/Customer');

// 리텐션 전체 통계
router.get('/stats', async (req, res) => {
  try {
    const stats = await Retention.getRetentionFunnel();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '리텐션 통계를 가져오는 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 월별 리텐션 율
router.get('/rate/:month', async (req, res) => {
  try {
    const month = req.params.month;
    const stats = await Retention.getRetentionRate(month);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '리텐션 율을 계산하는 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 리텐션 패턴별 조회
router.get('/pattern', async (req, res) => {
  try {
    const pattern = {};

    if (req.query.june !== undefined) {
      pattern.june = req.query.june === 'true';
    }
    if (req.query.july !== undefined) {
      pattern.july = req.query.july === 'true';
    }
    if (req.query.august !== undefined) {
      pattern.august = req.query.august === 'true';
    }
    if (req.query.ninety !== undefined) {
      pattern.ninety = req.query.ninety === 'true';
    }

    const retentions = await Retention.findByRetentionPattern(pattern);

    res.json({
      success: true,
      data: retentions,
      count: retentions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '리텐션 패턴 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 특정 고객의 리텐션 정보
router.get('/customer/:uid', async (req, res) => {
  try {
    const retention = await Retention.findOne({ uid: parseInt(req.params.uid) });

    if (!retention) {
      return res.status(404).json({
        success: false,
        message: '해당 고객의 리텐션 정보를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: retention
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '리텐션 정보를 가져오는 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 리텐션 X 고객 정보 조인 분석
router.get('/analysis/cohort', async (req, res) => {
  try {
    // 리텐션과 고객 정보를 조인하여 분석
    const cohortAnalysis = await Retention.aggregate([
      {
        $lookup: {
          from: 'customers',
          localField: 'uid',
          foreignField: 'uid',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $group: {
          _id: {
            region: '$customer.region_city_group',
            ageGroup: '$customer.age_group'
          },
          totalCustomers: { $sum: 1 },
          retainedJune: {
            $sum: { $cond: ['$retained_june', 1, 0] }
          },
          retainedJuly: {
            $sum: { $cond: ['$retained_july', 1, 0] }
          },
          retainedAugust: {
            $sum: { $cond: ['$retained_august', 1, 0] }
          },
          retained90: {
            $sum: { $cond: ['$retained_90', 1, 0] }
          },
          avgPayment: { $avg: '$customer.total_payment_may' },
          avgVisitDays: { $avg: '$customer.visit_days' }
        }
      },
      {
        $project: {
          _id: 1,
          totalCustomers: 1,
          retainedJune: 1,
          retainedJuly: 1,
          retainedAugust: 1,
          retained90: 1,
          avgPayment: 1,
          avgVisitDays: 1,
          juneRate: {
            $multiply: [
              { $divide: ['$retainedJune', '$totalCustomers'] },
              100
            ]
          },
          julyRate: {
            $multiply: [
              { $divide: ['$retainedJuly', '$totalCustomers'] },
              100
            ]
          },
          augustRate: {
            $multiply: [
              { $divide: ['$retainedAugust', '$totalCustomers'] },
              100
            ]
          },
          ninetyDayRate: {
            $multiply: [
              { $divide: ['$retained90', '$totalCustomers'] },
              100
            ]
          }
        }
      },
      { $sort: { totalCustomers: -1 } }
    ]);

    res.json({
      success: true,
      data: cohortAnalysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '코호트 분석 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 지역별 리텐션 분석
router.get('/analysis/by-region', async (req, res) => {
  try {
    const regionRetention = await Retention.aggregate([
      {
        $lookup: {
          from: 'customers',
          localField: 'uid',
          foreignField: 'uid',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $group: {
          _id: '$customer.region_city_group',
          totalCustomers: { $sum: 1 },
          retainedJune: {
            $sum: { $cond: ['$retained_june', 1, 0] }
          },
          retainedJuly: {
            $sum: { $cond: ['$retained_july', 1, 0] }
          },
          retainedAugust: {
            $sum: { $cond: ['$retained_august', 1, 0] }
          },
          retained90: {
            $sum: { $cond: ['$retained_90', 1, 0] }
          }
        }
      },
      {
        $project: {
          region: '$_id',
          totalCustomers: 1,
          juneRate: {
            $multiply: [
              { $divide: ['$retainedJune', '$totalCustomers'] },
              100
            ]
          },
          julyRate: {
            $multiply: [
              { $divide: ['$retainedJuly', '$totalCustomers'] },
              100
            ]
          },
          augustRate: {
            $multiply: [
              { $divide: ['$retainedAugust', '$totalCustomers'] },
              100
            ]
          },
          ninetyDayRate: {
            $multiply: [
              { $divide: ['$retained90', '$totalCustomers'] },
              100
            ]
          }
        }
      },
      { $sort: { totalCustomers: -1 } }
    ]);

    res.json({
      success: true,
      data: regionRetention
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '지역별 리텐션 분석 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 연령대별 리텐션 분석
router.get('/analysis/by-age-group', async (req, res) => {
  try {
    const ageRetention = await Retention.aggregate([
      {
        $lookup: {
          from: 'customers',
          localField: 'uid',
          foreignField: 'uid',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $group: {
          _id: '$customer.age_group',
          totalCustomers: { $sum: 1 },
          retainedJune: {
            $sum: { $cond: ['$retained_june', 1, 0] }
          },
          retainedJuly: {
            $sum: { $cond: ['$retained_july', 1, 0] }
          },
          retainedAugust: {
            $sum: { $cond: ['$retained_august', 1, 0] }
          },
          retained90: {
            $sum: { $cond: ['$retained_90', 1, 0] }
          }
        }
      },
      {
        $project: {
          ageGroup: '$_id',
          totalCustomers: 1,
          juneRate: {
            $multiply: [
              { $divide: ['$retainedJune', '$totalCustomers'] },
              100
            ]
          },
          julyRate: {
            $multiply: [
              { $divide: ['$retainedJuly', '$totalCustomers'] },
              100
            ]
          },
          augustRate: {
            $multiply: [
              { $divide: ['$retainedAugust', '$totalCustomers'] },
              100
            ]
          },
          ninetyDayRate: {
            $multiply: [
              { $divide: ['$retained90', '$totalCustomers'] },
              100
            ]
          }
        }
      },
      { $sort: { totalCustomers: -1 } }
    ]);

    res.json({
      success: true,
      data: ageRetention
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '연령대별 리텐션 분석 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 이탈 고객 분석 (churned customers)
router.get('/analysis/churned', async (req, res) => {
  try {
    // 6월에는 유지되었지만 7월에 이탈한 고객
    const churned = await Retention.find({
      retained_june: true,
      retained_july: false
    }).populate({
      path: 'uid',
      model: 'Customer',
      select: 'uid region_city_group age_group total_payment_may visit_days'
    });

    res.json({
      success: true,
      data: churned,
      count: churned.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '이탈 고객 분석 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;
