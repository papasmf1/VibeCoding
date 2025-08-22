"""
타이타닉호 데이터셋을 이용한 성별 생존율 분석
- 데이터 다운로드 및 클렌징
- 남성과 여성의 생존율 계산
- 바 차트로 시각화
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from urllib.request import urlretrieve
import os
import platform

# 한글 폰트 설정 (matplotlib에서 한글 표시를 위해)
import matplotlib.font_manager as fm

def setup_korean_font():
    """한글 폰트 설정 함수"""
    system = platform.system()
    
    if system == 'Windows':
        # Windows에서 확실히 작동하는 한글 폰트 설정
        try:
            # Windows 시스템 폰트 경로에서 직접 폰트 로드
            import os
            windows_fonts_path = "C:/Windows/Fonts/"
            
            # 맑은 고딕 폰트 파일들
            malgun_fonts = [
                "malgun.ttf",  # 맑은 고딕
                "malgunbd.ttf",  # 맑은 고딕 Bold
                "gulim.ttc",   # 굴림
                "dotum.ttc"    # 돋움
            ]
            
            font_found = False
            for font_file in malgun_fonts:
                font_path = os.path.join(windows_fonts_path, font_file)
                if os.path.exists(font_path):
                    # 폰트 등록
                    fm.fontManager.addfont(font_path)
                    if "malgun" in font_file:
                        plt.rcParams['font.family'] = 'Malgun Gothic'
                        print(f"✅ 한글 폰트 설정 성공: Malgun Gothic (직접 로드)")
                    elif "gulim" in font_file:
                        plt.rcParams['font.family'] = 'Gulim'
                        print(f"✅ 한글 폰트 설정 성공: Gulim (직접 로드)")
                    elif "dotum" in font_file:
                        plt.rcParams['font.family'] = 'Dotum'
                        print(f"✅ 한글 폰트 설정 성공: Dotum (직접 로드)")
                    font_found = True
                    break
            
            if not font_found:
                # 시스템 폰트에서 검색
                plt.rcParams['font.family'] = 'Malgun Gothic'
                print(f"✅ 한글 폰트 설정: Malgun Gothic (시스템 기본)")
                
        except Exception as e:
            print(f"⚠️ 폰트 설정 중 오류: {e}")
            # 최후의 수단: 기본 설정
            plt.rcParams['font.family'] = ['Malgun Gothic', 'DejaVu Sans', 'sans-serif']
            print("✅ 기본 한글 폰트로 설정")
    else:
        # macOS나 Linux의 경우
        if system == 'Darwin':  # macOS
            font_candidates = ['AppleGothic', 'Arial Unicode MS']
        else:  # Linux
            font_candidates = ['NanumGothic', 'UnDotum', 'DejaVu Sans']
        
        available_fonts = [f.name for f in fm.fontManager.ttflist]
        
        for font in font_candidates:
            if font in available_fonts:
                plt.rcParams['font.family'] = font
                print(f"✅ 한글 폰트 설정: {font}")
                break
        else:
            print("⚠️ 한글 폰트를 찾을 수 없어 기본 폰트를 사용합니다.")
    
    plt.rcParams['axes.unicode_minus'] = False  # 마이너스 기호 깨짐 방지
    
    # 폰트 캐시 새로고침
    try:
        fm._rebuild()
    except:
        pass

# 한글 폰트 설정 실행
setup_korean_font()

def download_titanic_data():
    """타이타닉 데이터셋을 다운로드하는 함수"""
    try:
        # Seaborn에 내장된 타이타닉 데이터 사용
        df = sns.load_dataset('titanic')
        print("✅ 타이타닉 데이터셋을 성공적으로 로드했습니다!")
        print(f"데이터 크기: {df.shape[0]}행 {df.shape[1]}열")
        return df
    except Exception as e:
        print(f"❌ 데이터 로드 실패: {e}")
        return None

def explore_data(df):
    """데이터 탐색 함수"""
    print("\n" + "="*50)
    print("📊 데이터 탐색")
    print("="*50)
    
    print("\n🔍 데이터 기본 정보:")
    print(df.info())
    
    print("\n📋 데이터 미리보기 (상위 5행):")
    print(df.head())
    
    print("\n🔢 기본 통계:")
    print(df.describe())
    
    print("\n❓ 결측값 현황:")
    missing_data = df.isnull().sum()
    print(missing_data[missing_data > 0])
    
    return df

def clean_data(df):
    """데이터 클렌징 함수"""
    print("\n" + "="*50)
    print("🧹 데이터 클렌징")
    print("="*50)
    
    # 원본 데이터 복사
    df_clean = df.copy()
    
    print(f"클렌징 전 데이터 크기: {df_clean.shape}")
    
    # 1. Age 열의 결측값을 중앙값으로 채우기
    if df_clean['age'].isnull().sum() > 0:
        median_age = df_clean['age'].median()
        df_clean['age'].fillna(median_age, inplace=True)
        print(f"✅ Age 결측값 {df['age'].isnull().sum()}개를 중앙값 {median_age:.1f}로 채웠습니다.")
    
    # 2. Embarked 열의 결측값을 최빈값으로 채우기
    if df_clean['embarked'].isnull().sum() > 0:
        mode_embarked = df_clean['embarked'].mode()[0]
        df_clean['embarked'].fillna(mode_embarked, inplace=True)
        print(f"✅ Embarked 결측값 {df['embarked'].isnull().sum()}개를 최빈값 '{mode_embarked}'로 채웠습니다.")
    
    # 3. Deck 열이 있다면 결측값이 많으므로 삭제 (선택적)
    if 'deck' in df_clean.columns:
        missing_deck_ratio = df_clean['deck'].isnull().sum() / len(df_clean)
        if missing_deck_ratio > 0.7:  # 70% 이상 결측값이면 삭제
            df_clean.drop('deck', axis=1, inplace=True)
            print(f"✅ Deck 열 삭제 (결측값 비율: {missing_deck_ratio:.1%})")
    
    print(f"클렌징 후 데이터 크기: {df_clean.shape}")
    
    # 클렌징 후 결측값 확인
    remaining_missing = df_clean.isnull().sum()
    if remaining_missing.sum() > 0:
        print("\n⚠️ 남은 결측값:")
        print(remaining_missing[remaining_missing > 0])
    else:
        print("✅ 모든 결측값이 처리되었습니다!")
    
    return df_clean

def calculate_survival_rates(df):
    """성별 생존율 계산 함수"""
    print("\n" + "="*50)
    print("📈 성별 생존율 계산")
    print("="*50)
    
    # 성별별 생존율 계산
    survival_by_sex = df.groupby('sex')['survived'].agg(['count', 'sum', 'mean']).round(3)
    survival_by_sex.columns = ['총인원', '생존자수', '생존율']
    
    print("\n📊 성별 생존율 통계:")
    print(survival_by_sex)
    
    # 퍼센트로 변환
    survival_rates = df.groupby('sex')['survived'].mean() * 100
    
    print("\n💫 성별 생존율 요약:")
    for sex, rate in survival_rates.items():
        print(f"  {sex.upper()}: {rate:.1f}%")
    
    return survival_rates, survival_by_sex

def create_survival_chart(survival_rates, survival_stats):
    """생존율 바 차트 생성 함수"""
    print("\n" + "="*50)
    print("📊 차트 생성")
    print("="*50)
    
    # 한글 폰트 강제 설정
    from matplotlib import font_manager
    
    # Windows 시스템에서 한글 폰트 직접 로드
    try:
        font_path = "C:/Windows/Fonts/malgun.ttf"
        if os.path.exists(font_path):
            prop = font_manager.FontProperties(fname=font_path)
        else:
            # 대체 폰트
            prop = font_manager.FontProperties(family='Malgun Gothic')
    except:
        prop = font_manager.FontProperties(family='Arial')
    
    # 그래프 스타일 설정
    plt.style.use('default')
    
    # 서브플롯 생성 (2개의 차트)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
    
    # 첫 번째 차트: 생존율 바 차트
    colors = ['#FF6B6B', '#4ECDC4']  # 여성: 핑크, 남성: 청록
    sex_labels = {'female': '여성', 'male': '남성'}
    
    bars1 = ax1.bar([sex_labels[sex] for sex in survival_rates.index], 
                   survival_rates.values, 
                   color=colors, 
                   alpha=0.8,
                   edgecolor='black',
                   linewidth=1.2)
    
    # 바 위에 수치 표시
    for bar, rate in zip(bars1, survival_rates.values):
        height = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2., height + 1,
                f'{rate:.1f}%', ha='center', va='bottom', 
                fontsize=12, fontweight='bold')
    
    # 제목과 라벨에 폰트 속성 적용
    ax1.set_title('타이타닉호 성별 생존율', fontsize=16, fontweight='bold', pad=20, fontproperties=prop)
    ax1.set_ylabel('생존율 (%)', fontsize=12, fontproperties=prop)
    ax1.set_ylim(0, 100)
    ax1.grid(axis='y', alpha=0.3)
    
    # x축 라벨에 폰트 적용
    ax1.set_xticklabels([sex_labels[sex] for sex in survival_rates.index], fontproperties=prop)
    
    # 두 번째 차트: 생존자 수 vs 전체 인원
    x_pos = np.arange(len(survival_stats))
    width = 0.35
    
    bars2 = ax2.bar(x_pos - width/2, survival_stats['총인원'], width, 
                   label='전체 인원', color='lightgray', alpha=0.8)
    bars3 = ax2.bar(x_pos + width/2, survival_stats['생존자수'], width, 
                   label='생존자', color='green', alpha=0.8)
    
    # 바 위에 수치 표시
    for bars in [bars2, bars3]:
        for bar in bars:
            height = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width()/2., height + 5,
                    f'{int(height)}', ha='center', va='bottom', fontsize=10)
    
    # 제목과 라벨에 폰트 속성 적용
    ax2.set_title('성별 전체 인원 vs 생존자 수', fontsize=16, fontweight='bold', pad=20, fontproperties=prop)
    ax2.set_ylabel('인원 수', fontsize=12, fontproperties=prop)
    ax2.set_xlabel('성별', fontsize=12, fontproperties=prop)
    ax2.set_xticks(x_pos)
    ax2.set_xticklabels([sex_labels[sex] for sex in survival_stats.index], fontproperties=prop)
    
    # 범례에 폰트 적용
    legend = ax2.legend(prop=prop)
    ax2.grid(axis='y', alpha=0.3)
    
    plt.tight_layout()
    
    # 차트 저장
    chart_filename = 'titanic_survival_analysis.png'
    plt.savefig(chart_filename, dpi=300, bbox_inches='tight')
    print(f"✅ 차트가 '{chart_filename}' 파일로 저장되었습니다.")
    
    plt.show()

def print_summary(survival_rates, survival_stats):
    """분석 결과 요약 출력"""
    print("\n" + "="*60)
    print("📋 분석 결과 요약")
    print("="*60)
    
    total_passengers = survival_stats['총인원'].sum()
    total_survivors = survival_stats['생존자수'].sum()
    overall_survival_rate = (total_survivors / total_passengers) * 100
    
    print(f"\n🚢 전체 승객 수: {total_passengers:,}명")
    print(f"💚 전체 생존자 수: {total_survivors:,}명")
    print(f"📊 전체 생존율: {overall_survival_rate:.1f}%")
    
    print("\n👩‍👨‍👧‍👦 성별 생존율 비교:")
    for sex in survival_stats.index:
        korean_sex = '여성' if sex == 'female' else '남성'
        rate = survival_rates[sex]
        survivors = survival_stats.loc[sex, '생존자수']
        total = survival_stats.loc[sex, '총인원']
        print(f"  {korean_sex}: {rate:.1f}% ({survivors}/{total}명)")
    
    # 생존율 차이 계산
    female_rate = survival_rates['female']
    male_rate = survival_rates['male']
    rate_difference = female_rate - male_rate
    
    print(f"\n📈 여성과 남성의 생존율 차이: {rate_difference:.1f}%p")
    
    if rate_difference > 0:
        print("💡 결론: 여성의 생존율이 남성보다 높았습니다.")
    else:
        print("💡 결론: 남성의 생존율이 여성보다 높았습니다.")

def main():
    """메인 실행 함수"""
    print("🚢 타이타닉호 생존율 분석 시작!")
    print("="*60)
    
    try:
        # 1. 데이터 다운로드
        df = download_titanic_data()
        if df is None:
            return
        
        # 2. 데이터 탐색
        df = explore_data(df)
        
        # 3. 데이터 클렌징
        df_clean = clean_data(df)
        
        # 4. 생존율 계산
        survival_rates, survival_stats = calculate_survival_rates(df_clean)
        
        # 5. 차트 생성
        create_survival_chart(survival_rates, survival_stats)
        
        # 6. 결과 요약
        print_summary(survival_rates, survival_stats)
        
        print("\n🎉 분석이 완료되었습니다!")
        
    except Exception as e:
        print(f"❌ 분석 중 오류가 발생했습니다: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
