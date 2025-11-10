/**
 * Express 서버 메인 파일
 * 웹프레임워크백엔드 2조 - 매출/이용 패턴 통계 대시보드
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Express 앱 초기화
const app = express();

// 환경 변수
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// MongoDB 연결
connectDB();

// 미들웨어
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 파싱

// 요청 로깅 미들웨어 (개발 환경)
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API 라우트
app.use('/api/statistics', require('./routes/statistics'));
app.use('/api/customers', require('./routes/customers'));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '매출/이용 패턴 통계 대시보드 API',
    version: '1.0.0',
    team: '웹프레임워크백엔드 2조',
    endpoints: {
      statistics: '/api/statistics',
      customers: '/api/customers'
    }
  });
});

// Health Check 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 에러 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API 엔드포인트를 찾을 수 없습니다.',
    path: req.path
  });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || '서버 오류가 발생했습니다.',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Server is running!');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log('='.repeat(50));
});

module.exports = app;
