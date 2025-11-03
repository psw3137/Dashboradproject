require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Customer = require('../models/Customer');

// MongoDB 연결
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB 연결 성공');
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

// CSV 파일 임포트
const importCustomers = async () => {
  const csvFilePath = path.join(__dirname, '../../data/customers.csv');

  // CSV 파일 존재 확인
  if (!fs.existsSync(csvFilePath)) {
    console.error(`오류: CSV 파일을 찾을 수 없습니다: ${csvFilePath}`);
    console.log('data 폴더에 customers.csv 파일을 넣어주세요.');
    process.exit(1);
  }

  console.log('CSV 파일을 읽는 중...');

  const customers = [];
  let rowCount = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;

        // CSV 데이터를 Customer 모델 형식으로 변환
        const customer = {
          customerId: row.customerId,
          name: row.name,
          email: row.email,
          phone: row.phone,
          address: {
            street: row.street,
            city: row.city,
            state: row.state,
            zipCode: row.zipCode,
            country: row.country || '대한민국'
          },
          dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : undefined,
          registrationDate: row.registrationDate ? new Date(row.registrationDate) : new Date(),
          lastPurchaseDate: row.lastPurchaseDate ? new Date(row.lastPurchaseDate) : undefined,
          totalPurchases: parseInt(row.totalPurchases) || 0,
          totalSpent: parseFloat(row.totalSpent) || 0,
          customerTier: row.customerTier || 'Bronze',
          status: row.status || 'Active',
          preferences: {
            newsletter: row.newsletter === 'true' || row.newsletter === true,
            smsNotifications: row.smsNotifications === 'true' || row.smsNotifications === true
          },
          notes: row.notes || ''
        };

        customers.push(customer);

        // 진행 상황 표시 (매 1000개마다)
        if (rowCount % 1000 === 0) {
          console.log(`읽은 행 수: ${rowCount}`);
        }
      })
      .on('end', async () => {
        console.log(`\n총 ${customers.length}개의 고객 데이터를 읽었습니다.`);
        resolve(customers);
      })
      .on('error', (error) => {
        console.error('CSV 파일 읽기 오류:', error);
        reject(error);
      });
  });
};

// 데이터베이스에 저장
const saveToDatabase = async (customers) => {
  console.log('\n데이터베이스에 저장 중...');

  try {
    // 기존 데이터 삭제 (선택사항)
    const existingCount = await Customer.countDocuments();
    if (existingCount > 0) {
      console.log(`기존 고객 데이터 ${existingCount}개를 발견했습니다.`);
      console.log('기존 데이터를 삭제하고 새 데이터를 임포트합니다...');
      await Customer.deleteMany({});
    }

    // 배치로 나누어 저장 (메모리 효율성)
    const batchSize = 1000;
    let savedCount = 0;

    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);
      await Customer.insertMany(batch, { ordered: false });
      savedCount += batch.length;
      console.log(`진행 중... ${savedCount}/${customers.length} (${Math.round(savedCount/customers.length*100)}%)`);
    }

    console.log(`\n✓ 총 ${savedCount}개의 고객 데이터를 성공적으로 저장했습니다!`);
  } catch (error) {
    if (error.code === 11000) {
      console.error('중복 데이터 오류: 일부 고객 ID가 이미 존재합니다.');
    } else {
      console.error('데이터 저장 중 오류 발생:', error.message);
    }
    throw error;
  }
};

// 메인 실행 함수
const main = async () => {
  console.log('=== 고객 데이터 임포트 시작 ===\n');

  try {
    // MongoDB 연결
    await connectDB();

    // CSV 파일 읽기
    const customers = await importCustomers();

    // 데이터베이스에 저장
    await saveToDatabase(customers);

    console.log('\n=== 임포트 완료 ===');

    // 통계 출력
    const stats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalRevenue: { $sum: '$totalSpent' },
          avgSpent: { $avg: '$totalSpent' }
        }
      }
    ]);

    if (stats.length > 0) {
      console.log('\n=== 데이터베이스 통계 ===');
      console.log(`총 고객 수: ${stats[0].totalCustomers.toLocaleString()}명`);
      console.log(`총 매출: ₩${stats[0].totalRevenue.toLocaleString()}`);
      console.log(`평균 구매액: ₩${Math.round(stats[0].avgSpent).toLocaleString()}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n임포트 중 오류 발생:', error);
    process.exit(1);
  }
};

// 스크립트 실행
main();
