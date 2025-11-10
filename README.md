# 매출/이용 패턴 통계 대시보드

**웹프레임워크백엔드 2조**

관리자를 위한 데이터 분석 대시보드입니다. 22,478명의 고객 데이터를 기반으로 매출 분석, KPI 지표, 고객 조회 기능을 제공합니다.

## 📊 프로젝트 개요

- **데이터**: 22,478명 고객, 총 매출 13.3억원 (5월 기준)
- **기간**: 2024년
- **팀**: 웹프레임워크백엔드 2조

### 팀원

| 이름 | 학번 | 역할 |
|------|------|------|
| 박선우 | 2021243096 | Frontend Developer - 차트 시각화 |
| 송재경 | 2021243112 | Frontend Developer - UI/UX |
| 윤보석 | 2023243089 | Backend Developer - API 개발 |
| 이태석 | 2021243071 | Full-stack Developer - 통합 |

---

## 🎯 주요 기능

### 1. 대시보드
- KPI 지표 (총 매출, 고객 수, 평균 객단가, 유지율)
- 매출 추이 차트
- 지역별 매출 분석
- 고객 분포 차트

### 2. 고객 조회
- 페이지네이션을 통한 고객 목록
- 다중 조건 필터링 (지역, 연령대, 매출, 유지율)
- 정렬 기능
- 고객 상세 정보 조회

### 3. 상세 분석
- 연령대별 매출 통계
- 지역 x 연령대 교차 분석 (히트맵)

---

## 🛠 기술 스택

### Frontend
- **React** 18.2 - UI 프레임워크
- **Vite** - 빌드 도구
- **Chart.js** - 차트 라이브러리
- **React Router** - 라우팅
- **Axios** - HTTP 클라이언트

### Backend
- **Node.js** 16+
- **Express.js** 4.18 - 웹 프레임워크
- **MongoDB** 6.0+ - 데이터베이스
- **Mongoose** 8.0 - ODM

### Tools
- **Git/GitHub** - 버전 관리
- **Python** - 데이터 정제

---

## 📦 설치 및 실행

### 사전 요구사항

- Node.js 16 이상
- MongoDB 6.0 이상
- Python 3.8 이상 (데이터 정제용)

### 1. 저장소 클론

```bash
git clone <repository-url>
cd Dashboradproject
```

### 2. MongoDB 설치 및 실행

#### Ubuntu/Linux
```bash
sudo systemctl start mongod
```

#### macOS (Homebrew)
```bash
brew services start mongodb-community
```

#### Windows
MongoDB 서비스를 시작하거나 `mongod` 명령 실행

### 3. 데이터 정제

```bash
# Python 의존성 설치
pip install pandas numpy

# 데이터 정제 스크립트 실행
python data_cleaning.py
```

정제된 데이터는 `cleaned_data/` 폴더에 생성됩니다.

### 4. 백엔드 설정

```bash
cd backend

# 의존성 설치
npm install

# 환경 변수 확인 (.env 파일이 생성되어 있음)
# 필요시 MongoDB URI 수정

# MongoDB에 데이터 import
node utils/importData.js

# 서버 실행
npm run dev
```

백엔드 서버는 `http://localhost:5000`에서 실행됩니다.

### 5. 프론트엔드 설정

새 터미널을 열고:

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

---

## 📁 프로젝트 구조

```
Dashboradproject/
├── backend/                    # 백엔드 코드
│   ├── config/                 # 설정 파일
│   │   └── database.js        # MongoDB 연결
│   ├── models/                 # Mongoose 모델
│   │   └── Customer.js        # 고객 스키마
│   ├── routes/                 # API 라우트
│   │   ├── statistics.js      # 통계 API
│   │   └── customers.js       # 고객 API
│   ├── utils/                  # 유틸리티
│   │   └── importData.js      # 데이터 import 스크립트
│   ├── .env                    # 환경 변수
│   ├── package.json
│   └── server.js               # Express 서버
│
├── frontend/                   # 프론트엔드 코드
│   ├── src/
│   │   ├── components/        # React 컴포넌트
│   │   │   ├── Header.jsx
│   │   │   ├── KPICard.jsx
│   │   │   ├── RevenueTrendChart.jsx
│   │   │   ├── RevenueByRegionChart.jsx
│   │   │   └── CustomerDistributionChart.jsx
│   │   ├── pages/             # 페이지 컴포넌트
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CustomerList.jsx
│   │   │   ├── CustomerDetail.jsx
│   │   │   └── Analytics.jsx
│   │   ├── services/          # API 서비스
│   │   │   └── api.js
│   │   ├── styles/            # CSS 파일
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── data.csv                    # 원본 데이터
├── data_cleaning.py            # 데이터 정제 스크립트
├── cleaned_data/               # 정제된 데이터 (자동 생성)
│   ├── customers.json
│   ├── statistics.json
│   └── metadata.json
├── 요구사항_분석서.md
└── README.md
```

---

## 🔌 API 엔드포인트

### 통계 API

- `GET /api/statistics/kpi` - KPI 지표 조회
- `GET /api/statistics/revenue-by-region` - 지역별 매출 통계
- `GET /api/statistics/revenue-by-age` - 연령대별 매출 통계
- `GET /api/statistics/revenue-trend` - 매출 추이
- `GET /api/statistics/customer-distribution` - 고객 분포
- `GET /api/statistics/heatmap` - 지역 x 연령대 교차 분석

### 고객 API

- `GET /api/customers` - 고객 목록 조회 (페이지네이션)
- `GET /api/customers/:uid` - 고객 상세 조회
- `POST /api/customers/filter` - 고객 필터링

자세한 API 명세는 [backend/README.md](backend/README.md)를 참고하세요.

---

## 📊 데이터 통계

### 전체 통계
- 총 고객 수: 22,478명
- 총 매출: 1,331,828,231원 (약 13.3억)
- 평균 객단가: 59,250원
- 평균 방문: 4.24일
- 90일 유지율: 46.26%

### 고객 분포
- 10대: 49.8% (11,196명)
- 20대: 34.4% (7,723명)
- 30대: 8.5% (1,911명)
- 40대 이상: 7.3% (1,648명)

### 지역 분포 (Top 3)
- 서울: 36.0% (8,082명, 매출 4.4억)
- 경기: 25.7% (5,779명)
- 전북: 6.2% (1,401명)

---

## 🎨 화면 구성

### 1. 대시보드
- KPI 카드 (5개)
- 매출 추이 선형 그래프
- 지역별 매출 가로 막대 그래프
- 고객 분포 파이 차트

### 2. 고객 조회
- 필터링 패널 (지역, 연령대, 매출, 유지율)
- 고객 목록 테이블 (UID, 지역, 연령, 매출, 등급)
- 페이지네이션
- 정렬 기능

### 3. 고객 상세
- 기본 정보 (UID, 지역, 연령)
- 이용 정보 (방문, 이용시간)
- 결제 정보 (총 매출, 평균 매출, 등급)
- 유지 정보 (6,7,8월 재방문, 90일 유지)

### 4. 상세 분석
- 연령대별 매출 차트
- 연령대별 통계 테이블
- 지역 x 연령대 교차 분석 테이블

---

## 🧪 테스트

### API 테스트 (Postman 또는 curl)

```bash
# Health Check
curl http://localhost:5000/health

# KPI 조회
curl http://localhost:5000/api/statistics/kpi

# 고객 목록 조회
curl http://localhost:5000/api/customers?page=1&limit=10

# 고객 상세 조회
curl http://localhost:5000/api/customers/6626

# 고객 필터링
curl -X POST http://localhost:5000/api/customers/filter \
  -H "Content-Type: application/json" \
  -d '{"region":"서울특별시","ageGroup":"Twenties"}'
```

---

## 🚀 배포

### 백엔드 배포 (예: Heroku, AWS)

1. MongoDB Atlas 설정
2. 환경 변수 설정 (`MONGODB_URI`, `PORT`)
3. 빌드 및 배포

### 프론트엔드 배포 (예: Vercel, Netlify)

```bash
cd frontend
npm run build
```

`dist/` 폴더를 배포

---

## 📝 개발 로그

### Phase 1: 기획 및 분석 (완료)
- ✅ 요구사항 분석서 작성
- ✅ 데이터 분석 및 정제 계획 수립

### Phase 2: 설계 (완료)
- ✅ 시스템 아키텍처 설계
- ✅ DB 스키마 설계
- ✅ API 명세서 작성

### Phase 3: 개발 (완료)
- ✅ MongoDB 스키마 구현
- ✅ 백엔드 API 개발
- ✅ 프론트엔드 컴포넌트 개발
- ✅ 차트 시각화 구현

### Phase 4: 테스트 및 마무리 (진행 중)
- 🔄 통합 테스트
- 🔄 버그 수정
- 🔄 최종 문서화

---

## 🐛 알려진 이슈

- MongoDB가 실행되지 않은 경우 백엔드 서버 실행 실패
- 대량 데이터 필터링 시 성능 이슈 가능 (인덱스로 최적화 필요)

---

## 🔮 향후 개발 계획

- [ ] 관리자 로그인 기능
- [ ] 데이터 내보내기 (CSV/Excel)
- [ ] 실시간 데이터 업데이트
- [ ] 다크 모드
- [ ] 모바일 앱 (React Native)
- [ ] 월별 데이터 비교 기능

---

## 📚 참고 자료

- [MongoDB 공식 문서](https://docs.mongodb.com/)
- [Express.js 가이드](https://expressjs.com/)
- [React 공식 문서](https://react.dev/)
- [Chart.js 문서](https://www.chartjs.org/)

---

## 📄 라이센스

MIT License

---

## 👥 기여

웹프레임워크백엔드 2조

- 박선우 (2021243096) - 월별 매출 추이, 지역/연령별 매출 분석
- 송재경 (2021243112) - 고객 이용 비율 그래프, UI/UX
- 윤보석 (2023243089) - KPI 지표 API, 통계 계산
- 이태석 (2021243071) - 고객 조회 API, 필터링 기능, 통합

---

## 📞 문의

프로젝트 관련 문의사항은 팀원에게 연락하거나 GitHub Issue를 생성해주세요.
