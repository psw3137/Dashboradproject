import pandas as pd
import json

# CSV 파일 읽기
df = pd.read_csv('/mnt/user-data/uploads/data.csv')

print(f"원본 데이터: {len(df)}건")

# 1. 쓸모없는 컬럼 제거
columns_to_drop = ['region_city_group_no', 'avg_duration_min']
df = df.drop(columns=columns_to_drop)

# 2. 결제액 0원 데이터 제거 (선택적 - 주석 처리)
# df = df[df['total_payment_may'] > 0]

print(f"정제 후 데이터: {len(df)}건")

# 3. 고객 메인 정보 (customers collection)
customers = df[[
    'uid', 'region_city_group', 'region_city', 'age_group', 'age',
    'visit_days', 'total_duration_min', 'total_payment_may'
]].copy()

# 4. 유지율 정보 (retention collection)
retention = df[[
    'uid', 'retained_june', 'retained_july', 'retained_august', 'retained_90'
]].copy()

# JSON 형식으로 저장 (MongoDB import용)
customers_json = customers.to_dict('records')
retention_json = retention.to_dict('records')

# 파일로 저장
with open('customers_cleaned.json', 'w', encoding='utf-8') as f:
    json.dump(customers_json, f, ensure_ascii=False, indent=2)

with open('retention_data.json', 'w', encoding='utf-8') as f:
    json.dump(retention_json, f, ensure_ascii=False, indent=2)

print("\n✅ 정제 완료!")
print(f"  - customers_cleaned.json: {len(customers_json)}건")
print(f"  - retention_data.json: {len(retention_json)}건")

# 통계 정보 출력
print("\n📊 정제된 데이터 통계:")
print(f"  - 평균 결제액: {customers['total_payment_may'].mean():,.0f}원")
print(f"  - 평균 방문일: {customers['visit_days'].mean():.1f}일")
print(f"  - 지역 수: {customers['region_city_group'].nunique()}개")
print(f"  - 연령대: {customers['age_group'].value_counts().to_dict()}")
