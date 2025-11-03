require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Retention = require('../models/Retention');

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

// Age group 결정 함수
const getAgeGroup = (age) => {
  if (age < 20) return 'Teens';
  if (age < 30) return 'Twenties';
  if (age < 40) return 'Thirties';
  return 'Forties+';
};

// CSV 파일 읽기 (통합 데이터)
const importData = async (filename = 'customer_cleaned.csv') => {
  const csvFilePath = path.join(__dirname, '../../data', filename);

  // CSV 파일 존재 확인
  if (!fs.existsSync(csvFilePath)) {
    console.error(`오류: CSV 파일을 찾을 수 없습니다: ${csvFilePath}`);
    console.log(`data 폴더에 ${filename} 파일을 넣어주세요.`);

    // 대체 파일 확인
    const altPath = path.join(__dirname, '../../data/data.csv');
    if (fs.existsSync(altPath)) {
      console.log('data.csv 파일을 찾았습니다. 이 파일을 사용합니다.');
      return importData('data.csv');
    }

    return null;
  }

  console.log(`${filename} 파일을 읽는 중...`);

  const customers = [];
  const retentions = [];
  let rowCount = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;

        // CSV 데이터를 Customer 모델 형식으로 변환
        const age = parseInt(row.age) || parseInt(row.Age) || 0;
        const uid = parseInt(row.uid) || parseInt(row.UID);

        const customer = {
          uid: uid,
          region_city_group: row.region_city_group || row.Region_City_Group || '',
          region_city: row.region_city || row.Region_City || '',
          age_group: row.age_group || row.Age_Group || getAgeGroup(age),
          age: age,
          visit_days: parseInt(row.visit_days) || parseInt(row.Visit_Days) || 0,
          total_duration_min: parseFloat(row.total_duration_min) || parseFloat(row.Total_Duration_Min) || 0,
          total_payment_may: parseFloat(row.total_payment_may) || parseFloat(row.Total_Payment_May) || 0
        };

        customers.push(customer);

        // 리텐션 데이터가 있는 경우
        if (row.retained_june !== undefined || row.Retained_June !== undefined) {
          const retention = {
            uid: uid,
            retained_june: row.retained_june === 'true' || row.retained_june === '1' || row.Retained_June === 'true' || row.Retained_June === '1' || parseInt(row.retained_june) === 1,
            retained_july: row.retained_july === 'true' || row.retained_july === '1' || row.Retained_July === 'true' || row.Retained_July === '1' || parseInt(row.retained_july) === 1,
            retained_august: row.retained_august === 'true' || row.retained_august === '1' || row.Retained_August === 'true' || row.Retained_August === '1' || parseInt(row.retained_august) === 1,
            retained_90: row.retained_90 === 'true' || row.retained_90 === '1' || row.Retained_90 === 'true' || row.Retained_90 === '1' || parseInt(row.retained_90) === 1
          };

          retentions.push(retention);
        }

        // 진행 상황 표시 (매 1000개마다)
        if (rowCount % 1000 === 0) {
          console.log(`읽은 행 수: ${rowCount}`);
        }
      })
      .on('end', async () => {
        console.log(`\n총 ${customers.length}개의 고객 데이터를 읽었습니다.`);
        if (retentions.length > 0) {
          console.log(`총 ${retentions.length}개의 리텐션 데이터를 읽었습니다.`);
        }
        resolve({ customers, retentions });
      })
      .on('error', (error) => {
        console.error('CSV 파일 읽기 오류:', error);
        reject(error);
      });
  });
};

// 고객 데이터를 데이터베이스에 저장
const saveCustomersToDatabase = async (customers) => {
  console.log('\n고객 데이터를 데이터베이스에 저장 중...');

  try {
    // 기존 데이터 삭제
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
      try {
        await Customer.insertMany(batch, { ordered: false });
        savedCount += batch.length;
      } catch (error) {
        if (error.code === 11000) {
          // 중복 키 오류 처리
          console.warn(`배치 ${Math.floor(i / batchSize) + 1}: 일부 중복 데이터 건너뜀`);
          savedCount += batch.length;
        } else {
          throw error;
        }
      }
      console.log(`진행 중... ${savedCount}/${customers.length} (${Math.round(savedCount/customers.length*100)}%)`);
    }

    console.log(`\n✓ 총 ${savedCount}개의 고객 데이터를 성공적으로 저장했습니다!`);
    return savedCount;
  } catch (error) {
    console.error('데이터 저장 중 오류 발생:', error.message);
    throw error;
  }
};

// 리텐션 데이터를 데이터베이스에 저장
const saveRetentionsToDatabase = async (retentions) => {
  if (!retentions || retentions.length === 0) {
    console.log('\n리텐션 데이터가 없습니다. 건너뜁니다.');
    return 0;
  }

  console.log('\n리텐션 데이터를 데이터베이스에 저장 중...');

  try {
    // 기존 데이터 삭제
    const existingCount = await Retention.countDocuments();
    if (existingCount > 0) {
      console.log(`기존 리텐션 데이터 ${existingCount}개를 발견했습니다.`);
      console.log('기존 데이터를 삭제하고 새 데이터를 임포트합니다...');
      await Retention.deleteMany({});
    }

    // 배치로 나누어 저장
    const batchSize = 1000;
    let savedCount = 0;

    for (let i = 0; i < retentions.length; i += batchSize) {
      const batch = retentions.slice(i, i + batchSize);
      try {
        await Retention.insertMany(batch, { ordered: false });
        savedCount += batch.length;
      } catch (error) {
        if (error.code === 11000) {
          console.warn(`배치 ${Math.floor(i / batchSize) + 1}: 일부 중복 데이터 건너뜀`);
          savedCount += batch.length;
        } else {
          throw error;
        }
      }
      console.log(`진행 중... ${savedCount}/${retentions.length} (${Math.round(savedCount/retentions.length*100)}%)`);
    }

    console.log(`\n✓ 총 ${savedCount}개의 리텐션 데이터를 성공적으로 저장했습니다!`);
    return savedCount;
  } catch (error) {
    console.error('리텐션 데이터 저장 중 오류 발생:', error.message);
    throw error;
  }
};

// 통계 출력
const printStatistics = async () => {
  console.log('\n=== 데이터베이스 통계 ===');

  // 고객 통계
  const customerStats = await Customer.aggregate([
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        totalPayment: { $sum: '$total_payment_may' },
        avgPayment: { $avg: '$total_payment_may' },
        totalVisitDays: { $sum: '$visit_days' },
        avgVisitDays: { $avg: '$visit_days' },
        totalDuration: { $sum: '$total_duration_min' },
        avgDuration: { $avg: '$total_duration_min' }
      }
    }
  ]);

  if (customerStats.length > 0) {
    const stats = customerStats[0];
    console.log('\n📊 고객 데이터:');
    console.log(`  총 고객 수: ${stats.totalCustomers.toLocaleString()}명`);
    console.log(`  총 결제액: ₩${Math.round(stats.totalPayment).toLocaleString()}`);
    console.log(`  평균 결제액: ₩${Math.round(stats.avgPayment).toLocaleString()}`);
    console.log(`  총 방문 일수: ${stats.totalVisitDays.toLocaleString()}일`);
    console.log(`  평균 방문 일수: ${stats.avgVisitDays.toFixed(2)}일`);
    console.log(`  평균 체류 시간: ${stats.avgDuration.toFixed(2)}분`);
  }

  // 지역별 통계
  const regionStats = await Customer.aggregate([
    {
      $group: {
        _id: '$region_city_group',
        count: { $sum: 1 },
        totalPayment: { $sum: '$total_payment_may' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  console.log('\n📍 상위 5개 지역:');
  regionStats.forEach((region, index) => {
    console.log(`  ${index + 1}. ${region._id}: ${region.count}명 (₩${Math.round(region.totalPayment).toLocaleString()})`);
  });

  // 연령대별 통계
  const ageStats = await Customer.aggregate([
    {
      $group: {
        _id: '$age_group',
        count: { $sum: 1 },
        avgPayment: { $avg: '$total_payment_may' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  console.log('\n👥 연령대별 분포:');
  ageStats.forEach((age) => {
    console.log(`  ${age._id}: ${age.count}명 (평균 ₩${Math.round(age.avgPayment).toLocaleString()})`);
  });

  // 리텐션 통계
  const retentionCount = await Retention.countDocuments();
  if (retentionCount > 0) {
    const retentionStats = await Retention.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          june: { $sum: { $cond: ['$retained_june', 1, 0] } },
          july: { $sum: { $cond: ['$retained_july', 1, 0] } },
          august: { $sum: { $cond: ['$retained_august', 1, 0] } },
          ninety: { $sum: { $cond: ['$retained_90', 1, 0] } }
        }
      }
    ]);

    if (retentionStats.length > 0) {
      const stats = retentionStats[0];
      console.log('\n📈 리텐션 통계:');
      console.log(`  총 데이터: ${stats.total.toLocaleString()}개`);
      console.log(`  6월 리텐션: ${stats.june.toLocaleString()}명 (${((stats.june / stats.total) * 100).toFixed(2)}%)`);
      console.log(`  7월 리텐션: ${stats.july.toLocaleString()}명 (${((stats.july / stats.total) * 100).toFixed(2)}%)`);
      console.log(`  8월 리텐션: ${stats.august.toLocaleString()}명 (${((stats.august / stats.total) * 100).toFixed(2)}%)`);
      console.log(`  90일 리텐션: ${stats.ninety.toLocaleString()}명 (${((stats.ninety / stats.total) * 100).toFixed(2)}%)`);
    }
  }
};

// 메인 실행 함수
const main = async () => {
  console.log('=== 데이터 임포트 시작 ===\n');

  try {
    // MongoDB 연결
    await connectDB();

    // CSV 파일 읽기
    const data = await importData('customer_cleaned.csv');
    if (!data) {
      throw new Error('데이터 파일을 찾을 수 없습니다.');
    }

    const { customers, retentions } = data;

    // 고객 데이터 저장
    await saveCustomersToDatabase(customers);

    // 리텐션 데이터 저장
    if (retentions && retentions.length > 0) {
      await saveRetentionsToDatabase(retentions);
    }

    // 통계 출력
    await printStatistics();

    console.log('\n=== 임포트 완료 ===');
    process.exit(0);
  } catch (error) {
    console.error('\n임포트 중 오류 발생:', error);
    process.exit(1);
  }
};

// 스크립트 실행
main();
