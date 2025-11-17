/**
 * 고객 API 라우트
 * 웹프레임워크백엔드 2조 - 매출/이용 패턴 통계 대시보드
 *
 * 엔드포인트:
 * - GET /api/customers - 고객 목록 조회 (페이지네이션)
 * - GET /api/customers/:uid - 특정 고객 상세 조회
 * - POST /api/customers/filter - 조건별 고객 필터링
 */

const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

/**
 * GET /api/customers
 * 고객 목록 조회 (페이지네이션)
 *
 * Query Parameters:
 * - page: 페이지 번호 (default: 1)
 * - limit: 페이지당 개수 (default: 50)
 * - sort: 정렬 기준 (revenue, visits, age) (default: revenue)
 * - order: 정렬 순서 (asc, desc) (default: desc)
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const sortField = req.query.sort || 'total_payment_may';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // 정렬 필드 매핑
    const sortMapping = {
      'revenue': 'total_payment_may',
      'visits': 'visit_days',
      'age': 'age'
    };

    const actualSortField = sortMapping[sortField] || sortField;

    // 고객 목록 조회
    const customers = await Customer
      .find({})
      .sort({ [actualSortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // 전체 고객 수
    const total = await Customer.countDocuments();

    res.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    console.error('고객 목록 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '고객 목록 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

/**
 * GET /api/customers/:uid
 * 특정 고객 상세 조회
 */
router.get('/:uid', async (req, res) => {
  try {
    const uid = parseInt(req.params.uid);

    if (isNaN(uid)) {
      return res.status(400).json({
        success: false,
        message: 'UID는 숫자여야 합니다.'
      });
    }

    const customer = await Customer.findOne({ uid }).lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: '고객을 찾을 수 없습니다.'
      });
    }

    // 추가 계산 필드
    const avgPaymentPerVisit = customer.visit_days > 0
      ? Math.round(customer.total_payment_may / customer.visit_days)
      : 0;

    let customerGrade = 'Bronze';
    if (customer.total_payment_may >= 200000) customerGrade = 'VIP';
    else if (customer.total_payment_may >= 100000) customerGrade = 'Gold';
    else if (customer.total_payment_may >= 50000) customerGrade = 'Silver';

    const retentionMonths = [];
    if (customer.retained_june === 1) retentionMonths.push('6월');
    if (customer.retained_july === 1) retentionMonths.push('7월');
    if (customer.retained_august === 1) retentionMonths.push('8월');

    res.json({
      success: true,
      data: {
        ...customer,
        avgPaymentPerVisit,
        customerGrade,
        isRetained: customer.retained_90 === 1,
        retentionMonths
      }
    });
  } catch (error) {
    console.error('고객 상세 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '고객 상세 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

/**
 * POST /api/customers/filter
 * 조건별 고객 필터링
 *
 * Request Body:
 * - region: 지역 (region_city_group)
 * - city: 도시 (region_city)
 * - ageGroup: 연령대
 * - minAge: 최소 나이
 * - maxAge: 최대 나이
 * - minPayment: 최소 매출
 * - maxPayment: 최대 매출
 * - minVisits: 최소 방문 일수
 * - maxVisits: 최대 방문 일수
 * - retained90: 90일 유지 여부 (0 or 1)
 * - page: 페이지 번호
 * - limit: 페이지당 개수
 */
router.post('/filter', async (req, res) => {
  try {
    const {
      region,
      city,
      ageGroup,
      minAge,
      maxAge,
      minPayment,
      maxPayment,
      minVisits,
      maxVisits,
      retained90,
      page = 1,
      limit = 50
    } = req.body;

    // 쿼리 빌더
    const query = {};

    if (region) {
      query.region_city_group = region;
    }

    if (city) {
      query.region_city = city;
    }

    if (ageGroup) {
      query.age_group = ageGroup;
    }

    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = parseInt(minAge);
      if (maxAge) query.age.$lte = parseInt(maxAge);
    }

    if (minPayment || maxPayment) {
      query.total_payment_may = {};
      if (minPayment) query.total_payment_may.$gte = parseInt(minPayment);
      if (maxPayment) query.total_payment_may.$lte = parseInt(maxPayment);
    }

    if (minVisits || maxVisits) {
      query.visit_days = {};
      if (minVisits) query.visit_days.$gte = parseInt(minVisits);
      if (maxVisits) query.visit_days.$lte = parseInt(maxVisits);
    }

    if (retained90 !== undefined && retained90 !== null && retained90 !== '') {
      query.retained_90 = parseInt(retained90);
    }

    // 페이지네이션
    const skip = (page - 1) * limit;

    // 고객 조회
    const customers = await Customer
      .find(query)
      .sort({ total_payment_may: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 전체 고객 수 (필터링된)
    const total = await Customer.countDocuments(query);

    // 통계 계산
    const stats = await Customer.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total_payment_may' },
          avgRevenue: { $avg: '$total_payment_may' },
          avgVisits: { $avg: '$visit_days' },
          retainedCount: { $sum: '$retained_90' }
        }
      }
    ]);

    const statistics = stats.length > 0 ? {
      count: stats[0].count,
      totalRevenue: stats[0].totalRevenue,
      avgRevenue: Math.round(stats[0].avgRevenue),
      avgVisits: Math.round(stats[0].avgVisits * 100) / 100,
      retentionRate: Math.round((stats[0].retainedCount / stats[0].count) * 100 * 100) / 100
    } : {
      count: 0,
      totalRevenue: 0,
      avgRevenue: 0,
      avgVisits: 0,
      retentionRate: 0
    };

    res.json({
      success: true,
      filters: req.body,
      data: customers,
      statistics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    console.error('고객 필터링 에러:', error);
    res.status(500).json({
      success: false,
      message: '고객 필터링 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

/**
 * GET /api/customers/search/uid
 * UID로 고객 검색
 */
router.get('/search/uid', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: '검색어를 입력해주세요.'
      });
    }

    const uid = parseInt(q);

    if (isNaN(uid)) {
      return res.status(400).json({
        success: false,
        message: 'UID는 숫자여야 합니다.'
      });
    }

    const customer = await Customer.findOne({ uid }).lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: '고객을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('고객 검색 에러:', error);
    res.status(500).json({
      success: false,
      message: '고객 검색 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;
