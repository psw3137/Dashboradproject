const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// 모든 고객 조회 (페이지네이션 지원)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const customers = await Customer.find()
      .sort({ registrationDate: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Customer.countDocuments();

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

// 특정 고객 조회
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOne({ customerId: req.params.id });

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
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const customers = await Customer.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
        { customerId: { $regex: searchQuery, $options: 'i' } }
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

// 고객 정보 업데이트
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { customerId: req.params.id },
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
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ customerId: req.params.id });

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
