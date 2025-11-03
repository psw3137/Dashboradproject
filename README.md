# 판매 분석 대시보드 (Sales Analytics Dashboard)

22,478명의 실제 고객 데이터를 활용한 판매 분석 대시보드 프로젝트입니다.

## 📋 프로젝트 구조

```
Dashboradproject/
├── backend/              # Node.js + Express + MongoDB 백엔드
│   ├── config/          # 데이터베이스 설정
│   ├── models/          # MongoDB 모델
│   ├── routes/          # API 라우트
│   ├── scripts/         # 유틸리티 스크립트
│   ├── server.js        # 메인 서버 파일
│   └── package.json
├── mobile/              # React Native 모바일 앱
│   ├── src/
│   │   ├── screens/    # 화면 컴포넌트
│   │   ├── services/   # API 서비스
│   │   └── config/     # 설정 파일
│   ├── App.js
│   └── package.json
└── data/                # CSV 데이터 파일 위치
    └── customers.csv    # 고객 데이터 (여기에 업로드하세요!)
```

## 🚀 시작하기

### 1. 사전 요구사항

- Node.js (v16 이상)
- MongoDB (로컬 또는 클라우드)
- npm 또는 yarn
- Expo CLI (모바일 앱 실행용)

### 2. CSV 데이터 파일 준비 ⭐ 중요!

**고객 데이터 CSV 파일을 `/data` 폴더에 넣어주세요:**

```bash
# CSV 파일을 data 폴더에 복사
cp /path/to/your/customers.csv ./data/customers.csv
```

#### CSV 파일 형식

CSV 파일은 다음 컬럼들을 포함해야 합니다:

```csv
customerId,name,email,phone,street,city,state,zipCode,country,dateOfBirth,registrationDate,lastPurchaseDate,totalPurchases,totalSpent,customerTier,status,newsletter,smsNotifications,notes
```

**예시:**
```csv
CUST000001,김민준,minj1@gmail.com,010-1234-5678,강남대로 123,서울,서울특별시,12345,대한민국,1990-01-15,2020-05-10,2024-10-20,25,1500000,Gold,Active,true,false,VIP 고객
```

### 3. 백엔드 설정

```bash
# backend 폴더로 이동
cd backend

# 의존성 설치
npm install

# MongoDB 연결 설정 확인 (.env 파일)
# .env 파일이 이미 생성되어 있습니다. 필요시 MongoDB URI를 수정하세요.

# MongoDB가 실행 중인지 확인
# 로컬: mongod
# 또는 MongoDB Atlas 등 클라우드 서비스 사용

# CSV 데이터를 MongoDB로 임포트
npm run import-data

# 서버 실행
npm start

# 또는 개발 모드로 실행 (nodemon)
npm run dev
```

백엔드 서버는 `http://localhost:5000`에서 실행됩니다.

#### API 엔드포인트

- `GET /api/customers` - 모든 고객 조회 (페이지네이션)
- `GET /api/customers/:id` - 특정 고객 조회
- `GET /api/customers/search/:query` - 고객 검색
- `GET /api/analytics/dashboard` - 대시보드 통계
- `GET /api/analytics/revenue` - 매출 분석
- `GET /api/analytics/segmentation` - 고객 세그멘테이션

### 4. 모바일 앱 설정

```bash
# mobile 폴더로 이동
cd mobile

# 의존성 설치
npm install

# Expo 앱 실행
npm start

# 또는 특정 플랫폼에서 실행
npm run android  # Android
npm run ios      # iOS
npm run web      # 웹 브라우저
```

#### API URL 설정

모바일 앱에서 백엔드 API에 연결하려면 `mobile/src/config/api.js` 파일의 `API_BASE_URL`을 수정하세요:

```javascript
// 로컬 개발 환경
const API_BASE_URL = 'http://localhost:5000/api';

// 또는 실제 기기에서 테스트 시 (내 컴퓨터의 IP 주소 사용)
const API_BASE_URL = 'http://192.168.x.x:5000/api';
```

## 📊 주요 기능

### 백엔드
- ✅ RESTful API
- ✅ MongoDB를 사용한 데이터 저장
- ✅ 22,478명의 고객 데이터 관리
- ✅ 고객 검색 및 필터링
- ✅ 판매 분석 및 통계
- ✅ 고객 세그멘테이션
- ✅ CSV 데이터 임포트 기능

### 모바일 앱
- ✅ 대시보드 (주요 지표)
- ✅ 고객 목록 및 검색
- ✅ 고객 등급별 분포 차트
- ✅ 상위 고객 목록
- ✅ 반응형 UI

## 🗄️ 데이터베이스 스키마

### Customer Model

```javascript
{
  customerId: String,          // 고객 ID
  name: String,                // 이름
  email: String,               // 이메일
  phone: String,               // 전화번호
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  dateOfBirth: Date,           // 생년월일
  registrationDate: Date,      // 가입일
  lastPurchaseDate: Date,      // 마지막 구매일
  totalPurchases: Number,      // 총 구매 횟수
  totalSpent: Number,          // 총 구매 금액
  customerTier: String,        // 고객 등급 (Bronze, Silver, Gold, Platinum, Diamond)
  status: String,              // 상태 (Active, Inactive, Suspended)
  preferences: {
    newsletter: Boolean,
    smsNotifications: Boolean
  },
  notes: String
}
```

## 🔧 환경 변수 설정

`backend/.env` 파일:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sales_analytics
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

## 📱 스크린샷

### 대시보드
- 총 고객 수, 활성 고객 수
- 총 매출, 평균 구매액
- 고객 등급 분포 (파이 차트)
- 상위 고객 목록

### 고객 목록
- 검색 기능
- 고객 정보 카드
- 고객 등급 및 상태 표시
- 구매 통계

## 🛠️ 기술 스택

### 백엔드
- Node.js
- Express.js
- MongoDB + Mongoose
- csv-parser
- CORS
- dotenv

### 모바일
- React Native
- Expo
- React Navigation
- Axios
- react-native-chart-kit
- react-native-svg

## 📝 스크립트 명령어

### 백엔드
```bash
npm start          # 서버 실행
npm run dev        # 개발 모드 실행 (nodemon)
npm run import-data # CSV 데이터 임포트
```

### 모바일
```bash
npm start          # Expo 시작
npm run android    # Android에서 실행
npm run ios        # iOS에서 실행
npm run web        # 웹에서 실행
```

## 🚨 문제 해결

### CSV 파일을 찾을 수 없다는 오류
```bash
# data 폴더에 customers.csv 파일이 있는지 확인
ls -la data/

# CSV 파일이 없다면 data 폴더에 복사
cp /path/to/customers.csv ./data/
```

### MongoDB 연결 오류
```bash
# MongoDB가 실행 중인지 확인
sudo systemctl status mongodb  # Linux
brew services list             # macOS

# MongoDB 시작
sudo systemctl start mongodb   # Linux
brew services start mongodb    # macOS
```

### 모바일 앱에서 API 연결 안 됨
- 실제 기기에서 테스트하는 경우, `mobile/src/config/api.js`의 `API_BASE_URL`을 컴퓨터의 IP 주소로 변경
- 백엔드 서버가 실행 중인지 확인
- 방화벽 설정 확인

## 📄 라이선스

MIT

## 👥 기여

기여는 언제나 환영합니다! Pull Request를 보내주세요.

## 📧 문의

문제가 발생하거나 질문이 있으시면 이슈를 등록해주세요.