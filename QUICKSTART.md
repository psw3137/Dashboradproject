# 🚀 빠른 시작 가이드

## 📋 사전 준비

✅ Node.js v16 이상  
✅ MongoDB (로컬) 또는 MongoDB Atlas (클라우드)  
✅ npm 또는 yarn

## 1️⃣ 프로젝트 클론 및 설치

```bash
git clone <repository-url>
cd Dashboradproject

# 백엔드 의존성 설치
cd backend
npm install

# 모바일 의존성 설치 (선택)
cd ../mobile
npm install
```

## 2️⃣ 환경 변수 설정

```bash
cd backend
cp .env.example .env
```

`.env` 파일 편집:

```env
# MongoDB Atlas 사용 (권장)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sales_analytics?retryWrites=true&w=majority&appName=Cluster0

# 또는 로컬 MongoDB
MONGODB_URI=mongodb://localhost:27017/sales_analytics
```

## 3️⃣ MongoDB Atlas 설정 (클라우드 사용 시)

1. https://www.mongodb.com/cloud/atlas 접속
2. 무료 계정 생성 및 클러스터 생성
3. **Network Access** → **Add IP Address** → **Allow Access from Anywhere**
4. **Database Access** → 사용자 생성
5. 연결 문자열 복사하여 `.env`에 붙여넣기

## 4️⃣ 데이터 임포트

### JSON 파일 임포트 (권장)

```bash
cd backend
npm run import
```

### CSV 파일 임포트

```bash
npm run import-data
```

**임포트 결과 예시:**
```
✓ 고객 데이터 임포트 완료: 22,478개
✓ 리텐션 데이터 임포트 완료: 22,478개
✓ Customer 인덱스 생성 완료
✓ Retention 인덱스 생성 완료

📊 총 고객 수: 22,478명
💰 총 결제액: ₩1,234,567,890
```

## 5️⃣ 서버 실행

```bash
# 개발 모드 (nodemon)
npm run dev

# 프로덕션 모드
npm start
```

서버 실행 확인:
- http://localhost:5000
- http://localhost:5000/api/customers
- http://localhost:5000/api/analytics/dashboard

## 6️⃣ 모바일 앱 실행 (선택)

```bash
cd mobile
npm start

# 또는
npm run android  # Android
npm run ios      # iOS
npm run web      # 웹 브라우저
```

## 📚 API 엔드포인트

### 고객 API (`/api/customers`)
- `GET /` - 모든 고객 조회
- `GET /:uid` - 특정 고객 조회
- `GET /search/query?q=서울` - 고객 검색
- `GET /region/:region` - 지역별 고객
- `GET /age-group/:ageGroup` - 연령대별 고객

### 분석 API (`/api/analytics`)
- `GET /dashboard` - 대시보드 통계
- `GET /by-region` - 지역별 분석
- `GET /by-age-group` - 연령대별 분석
- `GET /payment-distribution` - 결제액 분포
- `GET /rfm-analysis` - RFM 분석

### 리텐션 API (`/api/retention`)
- `GET /stats` - 리텐션 전체 통계
- `GET /rate/:month` - 월별 리텐션 율
- `GET /analysis/cohort` - 코호트 분석
- `GET /analysis/by-region` - 지역별 리텐션

## 🔧 문제 해결

### MongoDB 연결 오류
```bash
# 로컬 MongoDB 시작
sudo systemctl start mongodb

# 또는 Docker
docker run -d -p 27017:27017 mongo
```

### MongoDB Atlas 연결 오류
- IP 화이트리스트 확인
- 사용자 이름/비밀번호 확인
- 네트워크 연결 확인

### 데이터 임포트 오류
- CSV/JSON 파일이 `/data` 폴더에 있는지 확인
- MongoDB가 실행 중인지 확인
- `.env` 파일의 MONGODB_URI 확인

## 📞 도움말

문제가 발생하면 README.md를 참고하거나 이슈를 등록해주세요.
