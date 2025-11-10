/**
 * MongoDB 데이터베이스 연결 설정
 * 웹프레임워크백엔드 2조 - 매출/이용 패턴 통계 대시보드
 */

const mongoose = require('mongoose');

/**
 * MongoDB 연결 함수
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 6.0 이상에서는 useNewUrlParser, useUnifiedTopology가 기본값
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// MongoDB 연결 이벤트 리스너
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// 프로세스 종료 시 연결 종료
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('📴 MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;
