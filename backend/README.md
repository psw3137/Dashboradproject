# 매출/이용 패턴 통계 대시보드 - Backend API

웹프레임워크백엔드 2조

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [설치 및 실행](#설치-및-실행)
3. [API 엔드포인트](#api-엔드포인트)
4. [환경 설정](#환경-설정)

---

## 프로젝트 개요

관리자용 대시보드 백엔드 API입니다.

### 기술 스택

- **Node.js** v16+
- **Express.js** v4.18+
- **MongoDB** v6.0+
- **Mongoose** v8.0+

### 주요 기능

- KPI 지표 조회
- 지역별/연령대별 매출 통계
- 고객 목록 조회 및 필터링
- 고객 상세 정보 조회

---

## 설치 및 실행

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 입력합니다:

```env
MONGODB_URI=mongodb://localhost:27017/golf_dashboard
PORT=5000
NODE_ENV=development
```

### 3. MongoDB 실행

MongoDB가 로컬에 설치되어 있어야 합니다.

```bash
# MongoDB 서비스 시작 (Ubuntu/Linux)
sudo systemctl start mongod

# MongoDB 서비스 시작 (macOS with Homebrew)
brew services start mongodb-community
```

### 4. 데이터 정제 및 Import

#### 4-1. Python 데이터 정제 스크립트 실행

```bash
cd ..
python data_cleaning.py
```

정제된 데이터는 `cleaned_data/customers.json`에 저장됩니다.

#### 4-2. MongoDB에 데이터 Import

```bash
cd backend
node utils/importData.js
```

### 5. 서버 실행

#### 개발 모드 (nodemon)

```bash
npm run dev
```

#### 프로덕션 모드

```bash
npm start
```

서버는 `http://localhost:5000`에서 실행됩니다.

---

## API 엔드포인트

### 기본 정보

- **Base URL**: `http://localhost:5000/api`
- **Response Format**: JSON
- **Status Codes**:
  - `200 OK` - 성공
  - `400 Bad Request` - 잘못된 요청
  - `404 Not Found` - 리소스 없음
  - `500 Internal Server Error` - 서버 오류

---

### 1. 통계 API (`/api/statistics`)

#### 1.1 KPI 지표 조회

```http
GET /api/statistics/kpi
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 1331828231,
    "totalCustomers": 22478,
    "arpu": 59250,
    "avgVisits": 4.24,
    "retentionRate": 46.26
  }
}
```

#### 1.2 지역별 매출 통계

```http
GET /api/statistics/revenue-by-region
```

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "region": "서울특별시",
      "revenue": 441716600,
      "customers": 8082,
      "avgVisits": 4.1,
      "avgRevenue": 54653
    }
  ]
}
```

#### 1.3 연령대별 매출 통계

```http
GET /api/statistics/revenue-by-age
```

#### 1.4 매출 추이

```http
GET /api/statistics/revenue-trend
```

#### 1.5 고객 분포

```http
GET /api/statistics/customer-distribution
```

#### 1.6 히트맵 데이터 (지역 x 연령대)

```http
GET /api/statistics/heatmap
```

---

### 2. 고객 API (`/api/customers`)

#### 2.1 고객 목록 조회

```http
GET /api/customers?page=1&limit=50&sort=revenue&order=desc
```

**Query Parameters:**
- `page` (optional): 페이지 번호 (default: 1)
- `limit` (optional): 페이지당 개수 (default: 50)
- `sort` (optional): 정렬 기준 (revenue, visits, age)
- `order` (optional): 정렬 순서 (asc, desc)

**응답 예시:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 22478,
    "totalPages": 450,
    "hasMore": true
  }
}
```

#### 2.2 고객 상세 조회

```http
GET /api/customers/:uid
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "uid": 6626,
    "region_city_group": "서울특별시",
    "region_city": "서울",
    "age_group": "Thirties",
    "age": 38,
    "visit_days": 30,
    "total_payment_may": 914000,
    "avgPaymentPerVisit": 30467,
    "customerGrade": "VIP",
    "isRetained": true,
    "retentionMonths": ["6월", "7월"]
  }
}
```

#### 2.3 고객 필터링

```http
POST /api/customers/filter
```

**Request Body:**
```json
{
  "region": "서울특별시",
  "ageGroup": "Twenties",
  "minPayment": 50000,
  "maxPayment": 200000,
  "retained90": 1,
  "page": 1,
  "limit": 50
}
```

**응답 예시:**
```json
{
  "success": true,
  "filters": {...},
  "data": [...],
  "statistics": {
    "count": 125,
    "totalRevenue": 15000000,
    "avgRevenue": 120000,
    "avgVisits": 5.2,
    "retentionRate": 52.8
  },
  "pagination": {...}
}
```

---

## 환경 설정

### 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `MONGODB_URI` | MongoDB 연결 URI | `mongodb://localhost:27017/golf_dashboard` |
| `PORT` | 서버 포트 | `5000` |
| `NODE_ENV` | 실행 환경 | `development` |

### MongoDB 인덱스

다음 인덱스가 자동으로 생성됩니다:

- `uid` (unique)
- `region_city_group`
- `age_group`
- `total_payment_may` (descending)
- `retained_90`
- `{region_city_group, age_group}` (compound)

---

## 디렉토리 구조

```
backend/
├── config/
│   └── database.js         # MongoDB 연결 설정
├── models/
│   └── Customer.js          # Customer 스키마
├── routes/
│   ├── statistics.js        # 통계 API 라우트
│   └── customers.js         # 고객 API 라우트
├── utils/
│   └── importData.js        # 데이터 Import 스크립트
├── .env                     # 환경 변수
├── .env.example             # 환경 변수 예시
├── package.json
├── server.js                # Express 서버 메인 파일
└── README.md
```

---

## 개발 팀

**웹프레임워크백엔드 2조**

- 박선우 (2021243096) - Frontend Developer
- 송재경 (2021243112) - Frontend Developer
- 윤보석 (2023243089) - Backend Developer
- 이태석 (2021243071) - Full-stack Developer

---

## 라이센스

MIT License
