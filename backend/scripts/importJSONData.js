require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Retention = require('../models/Retention');

// MongoDB 연결
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB 연결 성공');
  } catch (error) {
    console.error('✗ MongoDB 연결 실패:', error.message);
    console.error('\nMongoDB가 실행 중인지 확인하세요:');
    console.error('  - Linux/Mac: sudo systemctl start mongodb');
    console.error('  - Docker: docker run -d -p 27017:27017 mongo');
    process.exit(1);
  }
};

// JSON 파일 읽기
const readJSONFile = (filename) => {
  const filePath = path.join(__dirname, '../../data', filename);

  if (!fs.existsSync(filePath)) {
    console.error(`✗ 파일을 찾을 수 없습니다: ${filePath}`);
    return null;
  }

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data);
    console.log(`✓ ${filename} 파일 읽기 완료 (${parsed.length.toLocaleString()}개 레코드)`);
    return parsed;
  } catch (error) {
    console.error(`✗ ${filename} 파일 읽기 오류:`, error.message);
    return null;
  }
};

// 기존 컬렉션 삭제
const dropCollections = async () => {
  console.log('\n기존 컬렉션 삭제 중...');

  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (collectionNames.includes('customers')) {
      await Customer.collection.drop();
      console.log('✓ customers 컬렉션 삭제 완료');
    }

    if (collectionNames.includes('retentions')) {
      await Retention.collection.drop();
      console.log('✓ retentions 컬렉션 삭제 완료');
    }
  } catch (error) {
    // 컬렉션이 없으면 에러가 발생하지만 무시해도 됨
    if (error.code !== 26) {  // NamespaceNotFound
      console.warn('컬렉션 삭제 경고:', error.message);
    }
  }
};

// 고객 데이터 임포트
const importCustomers = async (customersData) => {
  console.log('\n고객 데이터 임포트 중...');

  if (!customersData || customersData.length === 0) {
    console.error('✗ 고객 데이터가 없습니다.');
    return 0;
  }

  try {
    const batchSize = 1000;
    let imported = 0;

    for (let i = 0; i < customersData.length; i += batchSize) {
      const batch = customersData.slice(i, i + batchSize);
      await Customer.insertMany(batch, { ordered: false });
      imported += batch.length;

      const progress = Math.round((imported / customersData.length) * 100);
      console.log(`  진행: ${imported.toLocaleString()}/${customersData.length.toLocaleString()} (${progress}%)`);
    }

    console.log(`✓ 고객 데이터 임포트 완료: ${imported.toLocaleString()}개`);
    return imported;
  } catch (error) {
    if (error.code === 11000) {
      console.warn('⚠ 일부 중복 데이터가 발견되었습니다.');
    } else {
      console.error('✗ 고객 데이터 임포트 오류:', error.message);
      throw error;
    }
  }
};

// 리텐션 데이터 임포트
const importRetentions = async (retentionsData) => {
  console.log('\n리텐션 데이터 임포트 중...');

  if (!retentionsData || retentionsData.length === 0) {
    console.log('  리텐션 데이터를 건너뜁니다.');
    return 0;
  }

  try {
    const batchSize = 1000;
    let imported = 0;

    for (let i = 0; i < retentionsData.length; i += batchSize) {
      const batch = retentionsData.slice(i, i + batchSize);
      await Retention.insertMany(batch, { ordered: false });
      imported += batch.length;

      const progress = Math.round((imported / retentionsData.length) * 100);
      console.log(`  진행: ${imported.toLocaleString()}/${retentionsData.length.toLocaleString()} (${progress}%)`);
    }

    console.log(`✓ 리텐션 데이터 임포트 완료: ${imported.toLocaleString()}개`);
    return imported;
  } catch (error) {
    if (error.code === 11000) {
      console.warn('⚠ 일부 중복 데이터가 발견되었습니다.');
    } else {
      console.error('✗ 리텐션 데이터 임포트 오류:', error.message);
      throw error;
    }
  }
};

// 인덱스 생성
const createIndexes = async () => {
  console.log('\n인덱스 생성 중...');

  try {
    await Customer.createIndexes();
    console.log('✓ Customer 인덱스 생성 완료');

    await Retention.createIndexes();
    console.log('✓ Retention 인덱스 생성 완료');
  } catch (error) {
    console.error('✗ 인덱스 생성 오류:', error.message);
  }
};

// 임포트 검증
const verifyImport = async () => {
  console.log('\n=== 임포트 검증 ===');

  // 고객 수 확인
  const customerCount = await Customer.countDocuments();
  console.log(`\n📊 총 고객 수: ${customerCount.toLocaleString()}명`);

  // 샘플 고객 데이터
  const sampleCustomers = await Customer.find().limit(3);
  console.log('\n샘플 고객 데이터:');
  sampleCustomers.forEach((c, i) => {
    console.log(`  ${i + 1}. UID: ${c.uid}, 지역: ${c.region_city_group}, 연령대: ${c.age_group}, 결제액: ₩${c.total_payment_may.toLocaleString()}`);
  });

  // 지역별 통계
  const regionStats = await Customer.aggregate([
    { $group: { _id: '$region_city_group', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  console.log('\n📍 상위 5개 지역:');
  regionStats.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r._id}: ${r.count.toLocaleString()}명`);
  });

  // 연령대별 통계
  const ageStats = await Customer.aggregate([
    { $group: { _id: '$age_group', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  console.log('\n👥 연령대별 분포:');
  ageStats.forEach(a => {
    console.log(`  ${a._id}: ${a.count.toLocaleString()}명`);
  });

  // 결제 통계
  const paymentStats = await Customer.aggregate([
    {
      $group: {
        _id: null,
        totalPayment: { $sum: '$total_payment_may' },
        avgPayment: { $avg: '$total_payment_may' },
        maxPayment: { $max: '$total_payment_may' },
        minPayment: { $min: '$total_payment_may' }
      }
    }
  ]);

  if (paymentStats.length > 0) {
    const stats = paymentStats[0];
    console.log('\n💰 결제 통계:');
    console.log(`  총 결제액: ₩${Math.round(stats.totalPayment).toLocaleString()}`);
    console.log(`  평균 결제액: ₩${Math.round(stats.avgPayment).toLocaleString()}`);
    console.log(`  최대 결제액: ₩${Math.round(stats.maxPayment).toLocaleString()}`);
    console.log(`  최소 결제액: ₩${Math.round(stats.minPayment).toLocaleString()}`);
  }

  // 리텐션 통계
  const retentionCount = await Retention.countDocuments();
  if (retentionCount > 0) {
    console.log(`\n📈 총 리텐션 데이터: ${retentionCount.toLocaleString()}개`);

    const retentionStats = await Retention.aggregate([
      {
        $group: {
          _id: null,
          june: { $sum: { $cond: ['$retained_june', 1, 0] } },
          july: { $sum: { $cond: ['$retained_july', 1, 0] } },
          august: { $sum: { $cond: ['$retained_august', 1, 0] } },
          ninety: { $sum: { $cond: ['$retained_90', 1, 0] } }
        }
      }
    ]);

    if (retentionStats.length > 0) {
      const stats = retentionStats[0];
      console.log('\n리텐션 율:');
      console.log(`  6월: ${((stats.june / retentionCount) * 100).toFixed(2)}% (${stats.june.toLocaleString()}명)`);
      console.log(`  7월: ${((stats.july / retentionCount) * 100).toFixed(2)}% (${stats.july.toLocaleString()}명)`);
      console.log(`  8월: ${((stats.august / retentionCount) * 100).toFixed(2)}% (${stats.august.toLocaleString()}명)`);
      console.log(`  90일: ${((stats.ninety / retentionCount) * 100).toFixed(2)}% (${stats.ninety.toLocaleString()}명)`);
    }
  }

  // 인덱스 확인
  const customerIndexes = await Customer.collection.indexes();
  console.log(`\n🔍 Customer 컬렉션 인덱스: ${customerIndexes.length}개`);

  const retentionIndexes = await Retention.collection.indexes();
  console.log(`🔍 Retention 컬렉션 인덱스: ${retentionIndexes.length}개`);
};

// 메인 함수
const main = async () => {
  console.log('=== MongoDB 데이터 임포트 시작 ===\n');

  try {
    // MongoDB 연결
    await connectDB();

    // JSON 파일 읽기
    console.log('\nJSON 파일 읽기 중...');
    const customersData = readJSONFile('customers_cleaned.json');
    const retentionsData = readJSONFile('retention_data.json');

    if (!customersData) {
      throw new Error('고객 데이터 파일을 찾을 수 없습니다.');
    }

    // 기존 컬렉션 삭제
    await dropCollections();

    // 데이터 임포트
    await importCustomers(customersData);

    if (retentionsData) {
      await importRetentions(retentionsData);
    }

    // 인덱스 생성
    await createIndexes();

    // 검증
    await verifyImport();

    console.log('\n=== 임포트 완료! ===\n');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ 임포트 실패:', error.message);
    process.exit(1);
  }
};

// 실행
main();
