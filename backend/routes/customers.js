const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// 모든 고객 조회 (페이지네이션 및 필터링 지원)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // 필터링 옵션
    const filter = {};
    if (req.query.region_city_group) {
      filter.region_city_group = req.query.region_city_group;
    }
    if (req.query.age_group) {
      filter.age_group = req.query.age_group;
    }
    if (req.query.min_payment) {
      filter.total_payment_may = { $gte: parseFloat(req.query.min_payment) };
    }

    const customers = await Customer.find(filter)
      .sort({ total_payment_may: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Customer.countDocuments(filter);

    res.json({
      success: true,
      data: customers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCustomers: total,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '고객 데이터를 가져오는 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 특정 고객 조회 (UID 기준)
router.get('/:uid', async (req, res) => {
  try {
    const customer = await Customer.findOne({ uid: parseInt(req.params.uid) });

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
    res.status(500).json({
      success: false,
      message: '고객 데이터를 가져오는 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 고객 검색
router.get('/search/query', async (req, res) => {
  try {
    const searchQuery = req.query.q;
    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: '검색어를 입력해주세요.'
      });
    }

    const customers = await Customer.find({
      $or: [
        { uid: isNaN(searchQuery) ? -1 : parseInt(searchQuery) },
        { region_city: { $regex: searchQuery, $options: 'i' } },
        { region_city_group: { $regex: searchQuery, $options: 'i' } }
      ]
    }).limit(50);

    res.json({
      success: true,
      data: customers,
      count: customers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '검색 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 새 고객 생성
router.post('/', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();

    res.status(201).json({
      success: true,
      message: '고객이 성공적으로 생성되었습니다.',
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '고객 생성 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 지역별 고객 조회
router.get('/region/:region', async (req, res) => {
  try {
    const region = req.params.region;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const customers = await Customer.find({ region_city_group: region })
      .sort({ total_payment_may: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Customer.countDocuments({ region_city_group: region });

    res.json({
      success: true,
      data: customers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCustomers: total,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '지역별 고객 데이터를 가져오는 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 연령대별 고객 조회
router.get('/age-group/:ageGroup', async (req, res) => {
  try {
    const ageGroup = req.params.ageGroup;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const customers = await Customer.find({ age_group: ageGroup })
      .sort({ total_payment_may: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Customer.countDocuments({ age_group: ageGroup });

    res.json({
      success: true,
      data: customers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCustomers: total,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '연령대별 고객 데이터를 가져오는 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 고가치 고객 조회
router.get('/high-value/list', async (req, res) => {
  try {
    const minPayment = parseFloat(req.query.min) || 100000;
    const customers = await Customer.findHighValueCustomers(minPayment);

    res.json({
      success: true,
      data: customers,
      count: customers.length,
      minPayment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '고가치 고객 데이터를 가져오는 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 지역과 연령대로 고객 조회
router.get('/filter/region-age', async (req, res) => {
  try {
    const { region, age_group } = req.query;

    if (!region || !age_group) {
      return res.status(400).json({
        success: false,
        message: '지역과 연령대를 모두 지정해주세요.'
      });
    }

    const customers = await Customer.findByRegionAndAge(region, age_group);

    res.json({
      success: true,
      data: customers,
      count: customers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '필터링 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 고객 정보 업데이트
router.put('/:uid', async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { uid: parseInt(req.params.uid) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: '고객을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '고객 정보가 업데이트되었습니다.',
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '업데이트 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 고객 삭제
router.delete('/:uid', async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ uid: parseInt(req.params.uid) });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: '고객을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '고객이 삭제되었습니다.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;
