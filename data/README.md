# 고객 데이터 폴더

이 폴더에 고객 데이터 CSV 파일을 업로드해주세요.

## 📁 파일 배치

`customers.csv` 파일을 이 폴더에 넣어주세요:

```
/data/customers.csv
```

## 📋 CSV 파일 형식

CSV 파일은 다음과 같은 헤더를 포함해야 합니다:

```csv
customerId,name,email,phone,street,city,state,zipCode,country,dateOfBirth,registrationDate,lastPurchaseDate,totalPurchases,totalSpent,customerTier,status,newsletter,smsNotifications,notes
```

### 필수 컬럼 설명

- **customerId**: 고유 고객 ID (예: CUST000001)
- **name**: 고객 이름
- **email**: 이메일 주소
- **phone**: 전화번호
- **street**: 거리 주소
- **city**: 도시
- **state**: 주/도
- **zipCode**: 우편번호
- **country**: 국가
- **dateOfBirth**: 생년월일 (YYYY-MM-DD)
- **registrationDate**: 가입일 (YYYY-MM-DD)
- **lastPurchaseDate**: 마지막 구매일 (YYYY-MM-DD)
- **totalPurchases**: 총 구매 횟수 (숫자)
- **totalSpent**: 총 구매 금액 (숫자)
- **customerTier**: 고객 등급 (Bronze, Silver, Gold, Platinum, Diamond)
- **status**: 상태 (Active, Inactive, Suspended)
- **newsletter**: 뉴스레터 구독 (true/false)
- **smsNotifications**: SMS 알림 (true/false)
- **notes**: 메모 (선택사항)

## 📝 예시

```csv
customerId,name,email,phone,street,city,state,zipCode,country,dateOfBirth,registrationDate,lastPurchaseDate,totalPurchases,totalSpent,customerTier,status,newsletter,smsNotifications,notes
CUST000001,김민준,minj1@gmail.com,010-1234-5678,강남대로 123,서울,서울특별시,12345,대한민국,1990-01-15,2020-05-10,2024-10-20,25,1500000,Gold,Active,true,false,VIP 고객
CUST000002,이서연,seoyeon2@naver.com,010-9876-5432,테헤란로 456,서울,서울특별시,54321,대한민국,1985-03-22,2019-08-15,2024-11-01,50,3000000,Platinum,Active,true,true,재구매율 높음
```

## 🚀 데이터 임포트 방법

1. CSV 파일을 이 폴더에 배치
2. 백엔드 폴더로 이동: `cd backend`
3. 임포트 스크립트 실행: `npm run import-data`

## ⚠️ 주의사항

- CSV 파일은 UTF-8 인코딩이어야 합니다
- customerId는 고유해야 합니다 (중복 불가)
- 날짜 형식은 YYYY-MM-DD를 사용하세요
- 금액 및 구매 횟수는 숫자만 입력하세요
- 22,478개의 레코드를 포함해야 합니다

## 📞 문제가 있나요?

CSV 파일 형식이나 임포트에 문제가 있다면 프로젝트 루트의 README.md를 참고하세요.
