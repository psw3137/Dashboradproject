# 매출/이용 패턴 통계 대시보드

웹프레임워크백엔드 2조 - 스크린 골프 매출 및 이용 패턴 분석 대시보드

## 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
  - [필수 요구사항](#필수-요구사항)
  - [설치 방법](#설치-방법)
  - [환경 변수 설정](#환경-변수-설정)
  - [실행 방법](#실행-방법)
- [API 엔드포인트](#-api-엔드포인트)
- [데이터베이스 스키마](#-데이터베이스-스키마)
- [프로젝트 구조](#-프로젝트-구조)
- [개발 가이드](#-개발-가이드)

---

## 프로젝트 개요

스크린 골프장의 고객 데이터를 기반으로 매출 현황, 고객 분포, 이용 패턴 등을 시각화하여 제공하는 풀스택 대시보드 웹 애플리케이션입니다.

### 프로젝트 목표

- 5월 고객 이용 데이터를 기반으로 매출 및 이용 패턴 분석
- 지역별, 연령대별 고객 분포 및 매출 시각화
- 고객 유지율(90일 재방문) 분석
- 직관적인 대시보드 UI 제공

### 데이터 기준

- **기간**: 2024년 5월 데이터
- **고객 수**: 약 10,000명
- **분석 지표**: 매출, 방문 일수, 이용 시간, 재방문 여부

---

## 주요 기능

### 1. 대시보드 (Dashboard)

| 기능 | 설명 |
|------|------|
| KPI 카드 | 총 매출, 고객 수, 평균 객단가, 평균 방문 일수, 90일 유지율 |
| 매출 추이 차트 | 주차별 매출 추이 시각화 (Line Chart) |
| 지역별 매출 차트 | 상위 10개 지역 매출 비교 (Bar Chart) |
| 고객 분포 차트 | 지역별 고객 비율 (Pie Chart) |

### 2. 고객 조회 (Customer List)

| 기능 | 설명 |
|------|------|
| 고객 목록 | 페이지네이션 지원 (50명/페이지) |
| 정렬 | 매출순, 방문순, 나이순 정렬 |
| 필터링 | 지역, 연령대, 매출 범위, 유지 여부 필터 |
| 상세 보기 | 개별 고객 상세 정보 조회 |

### 3. 상세 분석 (Analytics)

| 기능 | 설명 |
|------|------|
| 연령대별 분석 | 연령대별 매출, 고객 수, 유지율 비교 |
| 교차 분석 | 지역 x 연령대 히트맵 데이터 |

### 4. 한글 지원

- 모든 지역명 한글 표시 (서울특별시, 경기도 등)
- 연령대 한글 표시 (10대, 20대, 30대, 40대 이상)
- 나이 표시 형식 (23세, 35세 등)

---

## 기술 스택

### Backend

| 기술 | 버전 | 설명 |
|------|------|------|
| Node.js | 18+ | JavaScript 런타임 |
| Express.js | 4.18.2 | 웹 프레임워크 |
| MongoDB | 6.0+ | NoSQL 데이터베이스 |
| Mongoose | 8.0.0 | MongoDB ODM |
| dotenv | 16.3.1 | 환경 변수 관리 |
| cors | 2.8.5 | CORS 처리 |
| nodemon | 3.0.1 | 개발 서버 자동 재시작 |

### Frontend

| 기술 | 버전 | 설명 |
|------|------|------|
| React | 18.2.0 | UI 라이브러리 |
| Vite | 5.0.0 | 빌드 도구 |
| React Router DOM | 6.20.0 | 클라이언트 라우팅 |
| Axios | 1.6.0 | HTTP 클라이언트 |
| Chart.js | 4.4.0 | 차트 라이브러리 |
| react-chartjs-2 | 5.2.0 | Chart.js React 래퍼 |

### Database

| 기술 | 설명 |
|------|------|
| MongoDB Atlas | 클라우드 MongoDB 서비스 |

---

## 시작하기

### 필수 요구사항

- **Node.js** 18.0.0 이상
- **npm** 9.0.0 이상
- **MongoDB** 6.0 이상 (로컬) 또는 MongoDB Atlas 계정

### 설치 방법

#### 1. 저장소 클론

```bash
git clone https://github.com/psw3137/Dashboradproject.git
cd Dashboradproject
```

#### 2. Backend 의존성 설치

```bash
cd backend
npm install
```

#### 3. Frontend 의존성 설치

```bash
cd ../frontend
npm install
```

### 환경 변수 설정

#### Backend (.env)

`backend/.env` 파일을 생성하고 다음 내용을 입력합니다:

```env
# MongoDB 연결 설정
MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/database

# 서버 포트
PORT=5000

# Node 환경
NODE_ENV=development
```

#### Frontend (.env)

`frontend/.env` 파일을 생성합니다 (선택사항):

```env
VITE_API_URL=http://localhost:5000
```

### 실행 방법

#### 개발 모드

**Backend 실행** (터미널 1):
```bash
cd backend
npm run dev
```

**Frontend 실행** (터미널 2):
```bash
cd frontend
npm run dev
```

#### 프로덕션 빌드

```bash
# Frontend 빌드
cd frontend
npm run build
```

### 접속 URL

| 서비스 | URL |
|--------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |

---

## API 엔드포인트

### 기본 정보

- **Base URL**: `http://localhost:5000`
- **Content-Type**: `application/json`

### 통계 API (`/api/statistics`)

| Method | Endpoint | 설명 | 응답 예시 |
|--------|----------|------|----------|
| GET | `/kpi` | KPI 지표 조회 | `{ totalRevenue, totalCustomers, arpu, avgVisits, retentionRate }` |
| GET | `/revenue-by-region` | 지역별 매출 | `[{ region, revenue, customers, avgVisits }]` |
| GET | `/revenue-by-age` | 연령대별 매출 | `[{ ageGroup, revenue, customers, retentionRate }]` |
| GET | `/revenue-trend` | 매출 추이 (주차별) | `{ labels, data, details }` |
| GET | `/customer-distribution` | 고객 분포 | `[{ region, count, percentage }]` |
| GET | `/heatmap` | 교차 분석 데이터 | `[{ region, ageGroup, revenue, customers }]` |

### 고객 API (`/api/customers`)

| Method | Endpoint | 설명 | 파라미터 |
|--------|----------|------|----------|
| GET | `/` | 고객 목록 | `page`, `limit`, `sort`, `order` |
| GET | `/:uid` | 고객 상세 조회 | `uid` (path) |
| POST | `/filter` | 조건별 필터링 | `region`, `ageGroup`, `minPayment`, `maxPayment`, `retained90` |
| GET | `/search/uid` | UID 검색 | `q` (query) |

### 응답 형식

```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 10000,
    "totalPages": 200,
    "hasMore": true
  }
}
```

### 에러 응답

```json
{
  "success": false,
  "message": "에러 메시지",
  "error": "상세 에러 내용"
}
```

---

## 데이터베이스 스키마

### Customer Collection

| 필드 | 타입 | 필수 | 설명 | 예시 |
|------|------|------|------|------|
| `uid` | Number | O | 고객 고유 ID | 12345 |
| `region_city_group` | String | O | 광역시도 | "Gyeonggi-do" |
| `region_city_group_no` | Number | X | 지역 그룹 번호 | 2 |
| `region_city` | String | O | 시/군/구 | "Seongnam" |
| `age_group` | String | O | 연령대 | "Twenties" |
| `age` | Number | O | 나이 | 25 |
| `visit_days` | Number | O | 5월 방문 일수 | 7 |
| `total_duration_min` | Number | O | 총 이용 시간 (분) | 1200 |
| `avg_duration_min` | Number | O | 평균 이용 시간 (분) | 171 |
| `total_payment_may` | Number | O | 5월 총 결제 금액 | 150000 |
| `retained_june` | Number | X | 6월 재방문 여부 (0/1) | 1 |
| `retained_july` | Number | X | 7월 재방문 여부 (0/1) | 0 |
| `retained_august` | Number | X | 8월 재방문 여부 (0/1) | 1 |
| `retained_90` | Number | X | 90일 유지 여부 (0/1) | 1 |

### 인덱스

```javascript
// 단일 인덱스
{ uid: 1 }                    // 고유 인덱스
{ region_city_group: 1 }      // 지역 검색
{ age_group: 1 }              // 연령대 검색
{ total_payment_may: -1 }     // 매출 정렬
{ retained_90: 1 }            // 유지 여부 필터

// 복합 인덱스
{ region_city_group: 1, age_group: 1 }  // 교차 분석
```

### 연령대 (age_group) 값

| 값 | 한글 표시 | 나이 범위 |
|----|----------|----------|
| `Teens` | 10대 | 10-19세 |
| `Twenties` | 20대 | 20-29세 |
| `Thirties` | 30대 | 30-39세 |
| `Forties+` | 40대 이상 | 40세 이상 |

### 고객 등급 기준

| 등급 | 기준 |
|------|------|
| VIP | 20만원 이상 |
| Gold | 10만원 이상 |
| Silver | 5만원 이상 |
| Bronze | 5만원 미만 |

---

## 프로젝트 구조

```
Dashboradproject/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB 연결 설정
│   ├── models/
│   │   └── Customer.js          # 고객 스키마 정의
│   ├── routes/
│   │   ├── customers.js         # 고객 API 라우트
│   │   └── statistics.js        # 통계 API 라우트
│   ├── server.js                # Express 서버 진입점
│   ├── package.json
│   └── .env.example             # 환경 변수 예시
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx               # 네비게이션 헤더
│   │   │   ├── KPICard.jsx              # KPI 카드 컴포넌트
│   │   │   ├── RevenueTrendChart.jsx    # 매출 추이 차트
│   │   │   ├── RevenueByRegionChart.jsx # 지역별 매출 차트
│   │   │   └── CustomerDistributionChart.jsx # 고객 분포 차트
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx            # 대시보드 페이지
│   │   │   ├── CustomerList.jsx         # 고객 목록 페이지
│   │   │   ├── CustomerDetail.jsx       # 고객 상세 페이지
│   │   │   └── Analytics.jsx            # 상세 분석 페이지
│   │   ├── services/
│   │   │   └── api.js                   # API 호출 함수
│   │   ├── styles/                      # CSS 스타일
│   │   ├── App.jsx                      # 라우터 설정
│   │   └── main.jsx                     # React 진입점
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── data.csv                     # 원본 CSV 데이터
├── data_cleaning.py             # 데이터 정제 스크립트
├── .gitignore
└── README.md
```

---

## 개발 가이드

### 코드 컨벤션

#### JavaScript/React

- **명명 규칙**: camelCase (변수, 함수), PascalCase (컴포넌트)
- **파일명**: PascalCase.jsx (컴포넌트), camelCase.js (유틸리티)
- **주석**: JSDoc 스타일 사용

#### CSS

- **클래스명**: kebab-case (예: `.kpi-card`, `.chart-container`)
- **파일 구조**: 페이지/컴포넌트별 CSS 파일 분리

### 새 API 엔드포인트 추가

1. `backend/routes/`에 라우트 파일 생성 또는 수정
2. `backend/server.js`에 라우트 등록
3. `frontend/src/services/api.js`에 API 호출 함수 추가

```javascript
// backend/routes/example.js
router.get('/example', async (req, res) => {
  try {
    const data = await Customer.find({});
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

### 새 페이지 추가

1. `frontend/src/pages/`에 페이지 컴포넌트 생성
2. `frontend/src/App.jsx`에 라우트 추가
3. `frontend/src/components/Header.jsx`에 네비게이션 링크 추가

### 데이터 정제

CSV 데이터를 MongoDB에 적재하기 전 정제:

```bash
python data_cleaning.py
```

정제 작업:
- 지역명 영문 → 한글 변환
- 파생 변수 생성 (객단가, 고객 등급)
- 결측치 및 이상치 처리
- JSON 형식으로 저장

### Git 브랜치 전략

- `main`: 프로덕션 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발 브랜치

---

## 팀원

**웹프레임워크백엔드 2조**

- 박선우 (2021243096) - Frontend Developer
- 송재경 (2021243112) - Frontend Developer
- 윤보석 (2023243089) - Backend Developer
- 이태석 (2021243071) - Full-stack Developer
  
---

## 라이선스

MIT License

Copyright (c) 2024 웹프레임워크백엔드 2조
