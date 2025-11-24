"""
데이터 정제 스크립트 (Data Cleaning Script)
웹프레임워크백엔드 2조 - 매출/이용 패턴 통계 대시보드

목적:
1. data.csv 파일 읽기
2. 지역명 영문 → 한글 변환
3. 파생 변수 생성 (객단가, 고객 등급 등)
4. 정제된 데이터를 JSON 형식으로 저장
"""

import pandas as pd
import numpy as np
import json
from datetime import datetime

# ============================================================================
# 1. 설정 및 매핑 테이블
# ============================================================================

# 지역명 영문 → 한글 매핑
CITY_NAME_MAPPING = {
    # 서울
    'Seoul': '서울',

    # 경기도
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
    'Hanam': '하남',
    'Pocheon': '포천',
    'Pyeongtaek': '평택',
    '화성': '화성',
    '의왕': '의왕',
    '오산': '오산',
    '구리': '구리',

    # 인천
    'Incheon': '인천',

    # 대구
    'Daegu': '대구',

    # 대전
    'Daejeon': '대전',

    # 부산
    'Busan': '부산',

    # 울산
    'Ulsan': '울산',

    # 광주
    'Gwangju': '광주',

    # 세종
    'Sejong': '세종',

    # 충청남도
    'Cheonan': '천안',
    'Asan': '아산',
    'Nonsan': '논산',
    '서산': '서산',

    # 충청북도
    'Cheongju': '청주',
    'Chungju': '충주',
    '진천': '진천',
    '옥천': '옥천',

    # 전라북도
    'Jeonju': '전주',
    'Iksan': '익산',
    'Gunsan': '군산',

    # 전라남도
    '해남': '해남',

    # 경상북도
    'Gyeongsan': '경산',
    'Gumi': '구미',
    'Andong': '안동',
    '봉화': '봉화',
    '칠곡': '칠곡',
    '대영': '대영',

    # 경상남도
    'Changwon': '창원',
    'Gimhae': '김해',
    'Yangsan': '양산',
    '사천': '사천',

    # 강원도
    'Donghae': '동해',
    'Wonju': '원주',
    'Sokcho': '속초',
    'Taebaek': '태백',
    'Chuncheon': '춘천',
    'Gangwon': '강원',

    # 제주
    'Jeju': '제주'
}

# 광역시도 한글 매핑
REGION_GROUP_MAPPING = {
    'Seoul': '서울특별시',
    'Gyeonggi-do': '경기도',
    'Incheon': '인천광역시',
    'Busan': '부산광역시',
    'Daegu': '대구광역시',
    'Daejeon': '대전광역시',
    'Gwangju': '광주광역시',
    'Ulsan': '울산광역시',
    'Sejong': '세종특별자치시',
    'Gangwon-do': '강원도',
    'Chungcheongbuk-do': '충청북도',
    'Chungcheongnam-do': '충청남도',
    'Jeollabuk-do': '전라북도',
    'Jeollanam-do': '전라남도',
    'Gyeongsangbuk-do': '경상북도',
    'Gyeongsangnam-do': '경상남도',
    'Jeju': '제주특별자치도'
}

# 연령대 한글 매핑 (선택적)
AGE_GROUP_MAPPING = {
    'Teens': '10대',
    'Twenties': '20대',
    'Thirties': '30대',
    'Forties+': '40대 이상'
}

# ============================================================================
# 2. 데이터 로드 및 검증
# ============================================================================

def load_data(file_path):
    """CSV 파일 읽기"""
    print("=" * 80)
    print("📂 데이터 로드 중...")
    print("=" * 80)
    
    try:
        df = pd.read_csv(file_path)
        print(f"✅ 성공: {len(df):,}개 레코드 로드")
        print(f"   컬럼: {len(df.columns)}개")
        return df
    except Exception as e:
        print(f"❌ 오류: {e}")
        return None

def validate_data(df):
    """데이터 유효성 검증"""
    print("\n" + "=" * 80)
    print("🔍 데이터 유효성 검증")
    print("=" * 80)
    
    issues = []
    
    # 1. 결측치 확인
    missing = df.isnull().sum()
    if missing.sum() > 0:
        issues.append(f"결측치 발견: {missing[missing > 0].to_dict()}")
    else:
        print("✅ 결측치 없음")
    
    # 2. 중복 확인
    duplicates = df.duplicated().sum()
    if duplicates > 0:
        issues.append(f"중복 행 {duplicates}개 발견")
    else:
        print("✅ 중복 데이터 없음")
    
    # 3. 매출 0원 고객
    zero_payment = len(df[df['total_payment_may'] == 0])
    print(f"⚠️  매출 0원 고객: {zero_payment}명 ({zero_payment/len(df)*100:.2f}%)")
    
    # 4. 음수 값 확인
    numeric_cols = ['age', 'visit_days', 'total_duration_min', 'total_payment_may']
    for col in numeric_cols:
        if (df[col] < 0).any():
            issues.append(f"{col}에 음수 값 존재")
    
    if len(issues) == 0:
        print("✅ 모든 검증 통과")
    else:
        print("\n⚠️  발견된 이슈:")
        for issue in issues:
            print(f"   - {issue}")
    
    return len(issues) == 0

# ============================================================================
# 3. 데이터 정제
# ============================================================================

def clean_region_names(df):
    """지역명 영문 → 한글 변환"""
    print("\n" + "=" * 80)
    print("🗺️  지역명 변환 중...")
    print("=" * 80)
    
    df = df.copy()
    
    # 1. 광역시도 변환
    df['region_city_group_kr'] = df['region_city_group'].map(REGION_GROUP_MAPPING)
    converted_groups = df['region_city_group_kr'].notna().sum()
    print(f"✅ 광역시도 변환: {converted_groups}/{len(df)}개")
    
    # 2. 시/군/구 변환
    df['region_city_kr'] = df['region_city'].map(CITY_NAME_MAPPING)
    
    # 매핑되지 않은 지역명 확인
    not_mapped = df[df['region_city_kr'].isna()]['region_city'].unique()
    if len(not_mapped) > 0:
        print(f"⚠️  매핑되지 않은 지역: {len(not_mapped)}개")
        print(f"   {list(not_mapped)[:10]}")  # 처음 10개만 출력
        # 매핑되지 않은 것은 원본 유지
        df['region_city_kr'] = df['region_city_kr'].fillna(df['region_city'])
    else:
        print("✅ 모든 시/군/구 변환 완료")
    
    # 3. 연령대 변환 (선택)
    df['age_group_kr'] = df['age_group'].map(AGE_GROUP_MAPPING)
    
    return df

def create_derived_features(df):
    """파생 변수 생성"""
    print("\n" + "=" * 80)
    print("🔧 파생 변수 생성 중...")
    print("=" * 80)
    
    df = df.copy()
    
    # 1. 1회 평균 결제금액 (객단가)
    df['payment_per_visit'] = (df['total_payment_may'] / df['visit_days']).replace([np.inf], 0)
    df['payment_per_visit'] = df['payment_per_visit'].fillna(0).round(0).astype(int)
    print(f"✅ 객단가(payment_per_visit) 생성")
    
    # 2. 고객 등급 (Customer Grade)
    def calculate_grade(payment):
        if payment >= 200000:
            return 'VIP'
        elif payment >= 100000:
            return 'Gold'
        elif payment >= 50000:
            return 'Silver'
        else:
            return 'Bronze'
    
    df['customer_grade'] = df['total_payment_may'].apply(calculate_grade)
    print(f"✅ 고객 등급(customer_grade) 생성")
    grade_dist = df['customer_grade'].value_counts()
    for grade, count in grade_dist.items():
        print(f"   - {grade}: {count:,}명 ({count/len(df)*100:.2f}%)")
    
    # 3. 활성 고객 여부 (5일 이상 방문)
    df['is_active'] = (df['visit_days'] >= 5).astype(int)
    active_count = df['is_active'].sum()
    print(f"✅ 활성 고객(is_active) 생성: {active_count:,}명 ({active_count/len(df)*100:.2f}%)")
    
    # 4. 이탈 고객 여부 (90일 유지 안됨)
    df['is_churned'] = (df['retained_90'] == 0).astype(int)
    churned_count = df['is_churned'].sum()
    print(f"✅ 이탈 고객(is_churned) 생성: {churned_count:,}명 ({churned_count/len(df)*100:.2f}%)")
    
    # 5. 방문 빈도 카테고리
    def visit_category(days):
        if days == 1:
            return '1회'
        elif days <= 3:
            return '2~3회'
        elif days <= 7:
            return '4~7회'
        elif days <= 14:
            return '8~14회'
        else:
            return '15회 이상'
    
    df['visit_category'] = df['visit_days'].apply(visit_category)
    print(f"✅ 방문 빈도(visit_category) 생성")
    
    return df

def remove_outliers(df, remove=False):
    """이상치 처리"""
    print("\n" + "=" * 80)
    print("📊 이상치 분석")
    print("=" * 80)
    
    # 이상치 통계만 출력 (제거하지 않음)
    extreme_payment = len(df[df['total_payment_may'] > 500000])
    extreme_visits = len(df[df['visit_days'] > 25])
    extreme_duration = len(df[df['total_duration_min'] > 10000])
    
    print(f"📌 이상치 현황:")
    print(f"   - 50만원 이상 결제: {extreme_payment}명")
    print(f"   - 25일 이상 방문: {extreme_visits}명")
    print(f"   - 10,000분 이상 이용: {extreme_duration}명")
    
    if remove:
        print("\n⚠️  이상치 제거 수행...")
        original_len = len(df)
        df = df[
            (df['total_payment_may'] <= 500000) &
            (df['visit_days'] <= 25) &
            (df['total_duration_min'] <= 10000)
        ]
        removed = original_len - len(df)
        print(f"   제거된 레코드: {removed}개")
        print(f"   남은 레코드: {len(df)}개")
    else:
        print("\n✅ 이상치 유지 (제거하지 않음)")
    
    return df

# ============================================================================
# 4. 통계 생성
# ============================================================================

def generate_statistics(df):
    """주요 통계 생성"""
    print("\n" + "=" * 80)
    print("📈 통계 생성 중...")
    print("=" * 80)
    
    stats = {}
    
    # 전체 통계
    stats['overall'] = {
        'total_customers': int(len(df)),
        'total_revenue': int(df['total_payment_may'].sum()),
        'avg_revenue': int(df['total_payment_may'].mean()),
        'median_revenue': int(df['total_payment_may'].median()),
        'avg_visits': round(float(df['visit_days'].mean()), 2),
        'retention_rate_90': round(float(df['retained_90'].mean() * 100), 2)
    }
    
    # 지역별 통계
    stats['by_region'] = []
    for region in df['region_city_group_kr'].unique():
        region_df = df[df['region_city_group_kr'] == region]
        stats['by_region'].append({
            'region': region,
            'customers': int(len(region_df)),
            'revenue': int(region_df['total_payment_may'].sum()),
            'avg_revenue': int(region_df['total_payment_may'].mean()),
            'avg_visits': round(float(region_df['visit_days'].mean()), 2)
        })
    stats['by_region'] = sorted(stats['by_region'], key=lambda x: x['revenue'], reverse=True)
    
    # 연령대별 통계
    stats['by_age_group'] = []
    for age_group in df['age_group_kr'].unique():
        age_df = df[df['age_group_kr'] == age_group]
        stats['by_age_group'].append({
            'age_group': age_group,
            'customers': int(len(age_df)),
            'revenue': int(age_df['total_payment_may'].sum()),
            'avg_revenue': int(age_df['total_payment_may'].mean()),
            'retention_rate': round(float(age_df['retained_90'].mean() * 100), 2)
        })
    
    # 고객 등급별 통계
    stats['by_grade'] = []
    for grade in ['VIP', 'Gold', 'Silver', 'Bronze']:
        grade_df = df[df['customer_grade'] == grade]
        if len(grade_df) > 0:
            stats['by_grade'].append({
                'grade': grade,
                'customers': int(len(grade_df)),
                'revenue': int(grade_df['total_payment_may'].sum()),
                'percentage': round(float(len(grade_df) / len(df) * 100), 2)
            })
    
    print("✅ 통계 생성 완료")
    print(f"   - 전체 통계")
    print(f"   - 지역별 통계: {len(stats['by_region'])}개 지역")
    print(f"   - 연령대별 통계: {len(stats['by_age_group'])}개 그룹")
    print(f"   - 고객 등급별 통계: {len(stats['by_grade'])}개 등급")
    
    return stats

# ============================================================================
# 5. 저장
# ============================================================================

def save_to_json(df, stats, output_dir='./cleaned_data'):
    """정제된 데이터를 JSON으로 저장"""
    import os
    
    print("\n" + "=" * 80)
    print("💾 데이터 저장 중...")
    print("=" * 80)
    
    # 디렉토리 생성
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"✅ 디렉토리 생성: {output_dir}")
    
    # 1. 전체 데이터 저장
    customers_file = f"{output_dir}/customers.json"
    df_json = df.to_dict('records')
    with open(customers_file, 'w', encoding='utf-8') as f:
        json.dump(df_json, f, ensure_ascii=False, indent=2)
    print(f"✅ 고객 데이터 저장: {customers_file} ({len(df):,}개)")
    
    # 2. 통계 데이터 저장
    stats_file = f"{output_dir}/statistics.json"
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    print(f"✅ 통계 데이터 저장: {stats_file}")
    
    # 3. 메타데이터 저장
    metadata = {
        'generated_at': datetime.now().isoformat(),
        'total_records': len(df),
        'columns': list(df.columns),
        'data_summary': {
            'total_revenue': int(df['total_payment_may'].sum()),
            'total_customers': len(df),
            'date_range': '2024년 5월'
        }
    }
    metadata_file = f"{output_dir}/metadata.json"
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print(f"✅ 메타데이터 저장: {metadata_file}")
    
    # 4. 요약 리포트 저장
    report_file = f"{output_dir}/cleaning_report.txt"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("=" * 80 + "\n")
        f.write("데이터 정제 리포트\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"생성 일시: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"원본 데이터: data.csv\n")
        f.write(f"총 레코드 수: {len(df):,}개\n")
        f.write(f"총 컬럼 수: {len(df.columns)}개\n\n")
        
        f.write("주요 통계:\n")
        f.write(f"  - 총 매출: {stats['overall']['total_revenue']:,}원\n")
        f.write(f"  - 총 고객: {stats['overall']['total_customers']:,}명\n")
        f.write(f"  - 평균 객단가: {stats['overall']['avg_revenue']:,}원\n")
        f.write(f"  - 평균 방문: {stats['overall']['avg_visits']}일\n")
        f.write(f"  - 90일 유지율: {stats['overall']['retention_rate_90']}%\n\n")
        
        f.write("정제 작업:\n")
        f.write("  ✅ 지역명 한글 변환\n")
        f.write("  ✅ 연령대 한글 변환\n")
        f.write("  ✅ 파생 변수 생성 (객단가, 고객등급 등)\n")
        f.write("  ✅ 통계 생성\n")
    
    print(f"✅ 정제 리포트 저장: {report_file}")
    print("\n" + "=" * 80)
    print("🎉 모든 작업 완료!")
    print("=" * 80)
    print(f"\n저장된 파일:")
    print(f"  1. {customers_file}")
    print(f"  2. {stats_file}")
    print(f"  3. {metadata_file}")
    print(f"  4. {report_file}")

def save_to_csv(df, output_file='./cleaned_data/customers_cleaned.csv'):
    """정제된 데이터를 CSV로 저장"""
    df.to_csv(output_file, index=False, encoding='utf-8-sig')
    print(f"✅ CSV 저장: {output_file}")

# ============================================================================
# 6. 메인 실행
# ============================================================================

def main():
    """메인 실행 함수"""
    print("\n")
    print("╔" + "=" * 78 + "╗")
    print("║" + " " * 20 + "데이터 정제 스크립트" + " " * 20 + "       ║")
    print("║" + " " * 15 + "웹프레임워크백엔드 2조" + " " * 15 + "       ║")
    print("╚" + "=" * 78 + "╝")
    print("\n")
    
    # 1. 데이터 로드
    df = load_data('/mnt/project/data.csv')
    if df is None:
        return
    
    # 2. 데이터 검증
    validate_data(df)
    
    # 3. 지역명 변환
    df = clean_region_names(df)
    
    # 4. 파생 변수 생성
    df = create_derived_features(df)
    
    # 5. 이상치 분석 (제거하지 않음)
    df = remove_outliers(df, remove=False)
    
    # 6. 통계 생성
    stats = generate_statistics(df)
    
    # 7. 저장
    save_to_json(df, stats)
    save_to_csv(df)
    
    print("\n✨ 정제 완료! MongoDB 또는 애플리케이션에서 사용할 수 있습니다.\n")

if __name__ == "__main__":
    main()
