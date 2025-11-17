/**
 * MongoDB 데이터 Import 스크립트
 * 웹프레임워크백엔드 2조 - 매출/이용 패턴 통계 대시보드
 *
 * 사용법:
 * node utils/importData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Customer = require('../models/Customer');

const CUSTOMERS_FILE = path.join(__dirname, '../../cleaned_data/customers.json');

/**
 * MongoDB 연결
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error.message);
    process.exit(1);
  }
}

/**
 * 기존 데이터 삭제
 */
async function clearExistingData() {
  try {
    const count = await Customer.countDocuments();
    if (count > 0) {
      await Customer.deleteMany({});
      console.log(`🗑️  기존 데이터 삭제: ${count}개`);
    } else {
      console.log('📭 기존 데이터 없음');
    }
  } catch (error) {
    console.error('❌ 데이터 삭제 실패:', error.message);
    throw error;
  }
}

/**
 * JSON 파일에서 데이터 로드
 */
function loadCustomerData() {
  try {
    console.log(`📂 파일 로드 중: ${CUSTOMERS_FILE}`);

    if (!fs.existsSync(CUSTOMERS_FILE)) {
      throw new Error(`파일을 찾을 수 없습니다: ${CUSTOMERS_FILE}`);
    }

    const rawData = fs.readFileSync(CUSTOMERS_FILE, 'utf-8');
    const data = JSON.parse(rawData);

    console.log(`✅ 데이터 로드 성공: ${data.length}개 레코드`);
    return data;
  } catch (error) {
    console.error('❌ 파일 로드 실패:', error.message);
    throw error;
  }
}

/**
 * 데이터 변환 (정제된 데이터 → MongoDB 스키마)
 */
function transformData(data) {
  console.log('🔄 데이터 변환 중...');

  const transformed = data.map(item => ({
    uid: item.uid,
    region_city_group: item.region_city_group_kr || item.region_city_group,
    region_city_group_no: item.region_city_group_no,
    region_city: item.region_city_kr || item.region_city,
    age_group: item.age_group,
    age: item.age,
    visit_days: item.visit_days,
    total_duration_min: item.total_duration_min,
    avg_duration_min: item.avg_duration_min,
    total_payment_may: item.total_payment_may,
    retained_june: item.retained_june,
    retained_july: item.retained_july,
    retained_august: item.retained_august,
    retained_90: item.retained_90
  }));

  console.log(`✅ 데이터 변환 완료: ${transformed.length}개`);
  return transformed;
}

/**
 * MongoDB에 데이터 삽입
 */
async function insertData(data) {
  try {
    console.log('💾 MongoDB에 데이터 삽입 중...');

    // 배치 삽입 (성능 향상)
    const batchSize = 1000;
    let inserted = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      await Customer.insertMany(batch, { ordered: false });
      inserted += batch.length;

      const progress = Math.round((inserted / data.length) * 100);
      console.log(`📊 진행률: ${progress}% (${inserted}/${data.length})`);
    }

    console.log(`✅ 데이터 삽입 완료: ${inserted}개`);
    return inserted;
  } catch (error) {
    // 중복 키 에러는 무시 (일부 데이터가 이미 존재할 수 있음)
    if (error.code === 11000) {
      console.warn('⚠️  일부 중복 데이터 건너뜀');
    } else {
      console.error('❌ 데이터 삽입 실패:', error.message);
      throw error;
    }
  }
}

/**
 * 데이터 검증
 */
async function verifyData() {
  try {
    console.log('\n🔍 데이터 검증 중...');

    const totalCount = await Customer.countDocuments();
    console.log(`✅ 총 고객 수: ${totalCount.toLocaleString()}명`);

    const stats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total_payment_may' },
          avgRevenue: { $avg: '$total_payment_may' },
          avgVisits: { $avg: '$visit_days' }
        }
      }
    ]);

    if (stats.length > 0) {
      console.log(`💰 총 매출: ${stats[0].totalRevenue.toLocaleString()}원`);
      console.log(`📊 평균 객단가: ${Math.round(stats[0].avgRevenue).toLocaleString()}원`);
      console.log(`📅 평균 방문: ${stats[0].avgVisits.toFixed(2)}일`);
    }

    // 지역별 고객 수
    const regionStats = await Customer.aggregate([
      {
        $group: {
          _id: '$region_city_group',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    console.log('\n📍 상위 5개 지역:');
    regionStats.forEach((region, index) => {
      console.log(`   ${index + 1}. ${region._id}: ${region.count.toLocaleString()}명`);
    });

    console.log('\n✅ 데이터 검증 완료');
  } catch (error) {
    console.error('❌ 데이터 검증 실패:', error.message);
    throw error;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('  MongoDB 데이터 Import 스크립트');
  console.log('  웹프레임워크백엔드 2조');
  console.log('='.repeat(80) + '\n');

  try {
    // 1. MongoDB 연결
    await connectDB();

    // 2. 기존 데이터 삭제
    await clearExistingData();

    // 3. JSON 파일 로드
    const rawData = loadCustomerData();

    // 4. 데이터 변환
    const transformedData = transformData(rawData);

    // 5. MongoDB에 삽입
    await insertData(transformedData);

    // 6. 데이터 검증
    await verifyData();

    console.log('\n' + '='.repeat(80));
    console.log('🎉 Import 완료!');
    console.log('='.repeat(80) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Import 실패:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { connectDB, loadCustomerData, transformData, insertData, verifyData };
