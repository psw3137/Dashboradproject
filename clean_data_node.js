/**
 * Node.js 데이터 정제 스크립트
 * CSV 파일을 읽어서 JSON으로 변환
 */

const fs = require('fs');
const path = require('path');

// 지역명 영문 → 한글 매핑
const REGION_MAPPING = {
  'Seoul': '서울특별시',
  'Gyeonggi-do': '경기도',
  'Incheon': '인천광역시',
  'Busan': '부산광역시',
  'Daegu': '대구광역시',
  'Daejeon': '대전광역시',
  'Gwangju': '광주광역시',
  'Ulsan': '울산광역시',
  'Gangwon-do': '강원도',
  'Chungcheongbuk-do': '충청북도',
  'Chungcheongnam-do': '충청남도',
  'Jeollabuk-do': '전라북도',
  'Jeollanam-do': '전라남도',
  'Gyeongsangbuk-do': '경상북도',
  'Gyeongsangnam-do': '경상남도',
  'Jeju-do': '제주특별자치도'
};

const CITY_MAPPING = {
  'Seoul': '서울',
  'Yongin': '용인',
  'Seongnam': '성남',
  'Ansan': '안산',
  'Anyang': '안양',
  'Suwon': '수원',
  'Goyang': '고양',
  'Siheung': '시흥',
  'Uijeongbu': '의정부',
  'Bucheon': '부천',
  'Gimpo': '김포',
  'Gunpo': '군포',
  'Incheon': '인천',
  'Daegu': '대구',
  'Daejeon': '대전',
  'Busan': '부산',
  'Gwangju': '광주',
  'Ulsan': '울산',
  'Cheonan': '천안',
  'Sejong': '세종',
  'Jeju': '제주'
};

console.log('📂 CSV 파일 읽기 중...');

// CSV 파일 읽기
const csvData = fs.readFileSync('data.csv', 'utf-8');
const lines = csvData.split('\n');
const headers = lines[0].replace('\ufeff', '').split(','); // BOM 제거

console.log(`✅ ${lines.length - 1}개 행 로드 완료`);
console.log('🔄 데이터 변환 중...');

const customers = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const values = line.split(',');

  if (values.length !== headers.length) continue;

  const customer = {
    uid: parseInt(values[0]),
    region_city_group: REGION_MAPPING[values[1]] || values[1],
    region_city_group_no: parseInt(values[2]),
    region_city: CITY_MAPPING[values[3]] || values[3],
    age_group: values[4],
    age: parseInt(values[5]),
    visit_days: parseInt(values[6]),
    total_duration_min: parseInt(values[7]),
    avg_duration_min: parseInt(values[8]),
    total_payment_may: parseInt(values[9]),
    retained_june: parseInt(values[10]),
    retained_july: parseInt(values[11]),
    retained_august: parseInt(values[12]),
    retained_90: parseInt(values[13])
  };

  customers.push(customer);
}

console.log(`✅ ${customers.length}개 고객 데이터 변환 완료`);

// 디렉토리 생성
if (!fs.existsSync('cleaned_data')) {
  fs.mkdirSync('cleaned_data');
  console.log('📁 cleaned_data 디렉토리 생성');
}

// JSON 파일로 저장
const outputPath = path.join('cleaned_data', 'customers.json');
fs.writeFileSync(outputPath, JSON.stringify(customers, null, 2));

console.log(`💾 저장 완료: ${outputPath}`);
console.log(`📊 통계:`);
console.log(`   - 총 고객 수: ${customers.length.toLocaleString()}명`);

const totalRevenue = customers.reduce((sum, c) => sum + c.total_payment_may, 0);
const avgRevenue = totalRevenue / customers.length;

console.log(`   - 총 매출: ${totalRevenue.toLocaleString()}원`);
console.log(`   - 평균 객단가: ${Math.round(avgRevenue).toLocaleString()}원`);
console.log('\n✅ 데이터 정제 완료!');
