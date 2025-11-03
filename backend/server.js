require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');

// 데이터베이스 연결
connectDB();

const app = express();

// 미들웨어
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '판매 분석 대시보드 API',
    version: '1.0.0',
    status: 'running'
  });
});

// API 라우트
app.use('/api/customers', require('./routes/customers'));
app.use('/api/analytics', require('./routes/analytics'));

// 404 에러 핸들링
app.use((req, res) => {
  res.status(404).json({ message: '요청하신 리소스를 찾을 수 없습니다.' });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: '서버 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`환경: ${process.env.NODE_ENV}`);
});
