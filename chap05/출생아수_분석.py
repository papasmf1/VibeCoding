import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from matplotlib import font_manager, rc

# 한글 폰트 설정
import matplotlib.font_manager as fm
from matplotlib import rc

# 맑은고딕 폰트 설정
font_path = 'C:/Windows/Fonts/malgun.ttf'  # 맑은고딕 폰트 경로
font_prop = fm.FontProperties(fname=font_path)

# 전역 폰트 설정
rc('font', family=font_prop.get_name())
rc('axes', unicode_minus=False)

def load_and_clean_birth_data():
    """
    출생아수 데이터를 로드하고 클랜징하는 함수
    """
    # 데이터 로드
    df = pd.read_excel('출생아수__합계출산율__자연증가_등_20250719100131.xlsx')
    
    print("원본 데이터 형태:", df.shape)
    print("원본 데이터 미리보기:")
    print(df.head())
    
    # 출생아수(명) 행만 추출
    birth_data = df[df['기본항목별'] == '출생아수(명)'].copy()
    
    if birth_data.empty:
        print("출생아수 데이터를 찾을 수 없습니다.")
        return None
    
    # 데이터 전치 (년도가 컬럼이 되도록)
    birth_data_transposed = birth_data.T
    
    # 첫 번째 행을 컬럼명으로 설정
    birth_data_transposed.columns = birth_data_transposed.iloc[0]
    birth_data_transposed = birth_data_transposed.iloc[1:]
    
    # 인덱스를 년도로 설정 (2024 p) 처리)
    birth_data_transposed.index.name = '년도'
    # 2024 p)를 2024로 변경
    birth_data_transposed.index = birth_data_transposed.index.str.replace(' p)', '').astype(int)
    
    # 출생아수(명) 컬럼만 선택
    birth_series = birth_data_transposed['출생아수(명)'].astype(float)
    
    # 1970년부터 2024년까지 필터링
    birth_series = birth_series[(birth_series.index >= 1970) & (birth_series.index <= 2024)]
    
    print(f"전체 데이터 범위: {birth_series.index.min()}년 ~ {birth_series.index.max()}년")
    print(f"총 {len(birth_series)}개 연도 데이터")
    
    print("\n클랜징된 데이터:")
    print(birth_series.head())
    print(birth_series.tail())
    
    return birth_series

def create_birth_rate_line_plot(birth_series):
    """
    출생아수 라인 그래프를 생성하는 함수
    """
    plt.figure(figsize=(15, 8))
    
    # 그래프 스타일 설정
    plt.style.use('seaborn-v0_8')
    
    # 맑은고딕 폰트 설정
    font_path = 'C:/Windows/Fonts/malgun.ttf'
    font_prop = fm.FontProperties(fname=font_path)
    
    # 라인 그래프 그리기
    plt.plot(birth_series.index, birth_series.values, 
             marker='o', linewidth=3, markersize=6, 
             color='#2E86AB', alpha=0.8)
    
    # 그래프 꾸미기
    plt.title('대한민국 출생아수 추이 (1970-2024)', 
              fontsize=20, fontweight='bold', pad=20, fontproperties=font_prop)
    plt.xlabel('년도', fontsize=14, fontweight='bold', fontproperties=font_prop)
    plt.ylabel('출생아수 (명)', fontsize=14, fontweight='bold', fontproperties=font_prop)
    
    # 격자 설정
    plt.grid(True, alpha=0.3, linestyle='--')
    
    # x축 눈금 설정 (5년마다)
    plt.xticks(range(1970, 2025, 5), rotation=45)
    
    # y축 눈금 설정
    plt.yticks(fontsize=12)
    
    # 주요 시점 표시
    # 1970년대 베이비붐
    plt.annotate('베이비붐\n(1970-1975)', 
                xy=(1972, birth_series[1972]), 
                xytext=(1975, 1200000),
                arrowprops=dict(arrowstyle='->', color='red', lw=2),
                fontsize=12, fontweight='bold', color='red', fontproperties=font_prop)
    
    # 2000년대 초반
    plt.annotate('2000년대\n초반', 
                xy=(2000, birth_series[2000]), 
                xytext=(2002, 600000),
                arrowprops=dict(arrowstyle='->', color='orange', lw=2),
                fontsize=12, fontweight='bold', color='orange', fontproperties=font_prop)
    
    # 2020년대 급감
    plt.annotate('급감\n(2020년대)', 
                xy=(2020, birth_series[2020]), 
                xytext=(2015, 300000),
                arrowprops=dict(arrowstyle='->', color='darkred', lw=2),
                fontsize=12, fontweight='bold', color='darkred', fontproperties=font_prop)
    
    # 통계 정보 추가
    stats_text = f"""
    최고점: {birth_series.max():,.0f}명 ({birth_series.idxmax()}년)
    최저점: {birth_series.min():,.0f}명 ({birth_series.idxmin()}년)
    2024년: {birth_series[2024]:,.0f}명 (예상)
    """
    plt.text(0.02, 0.98, stats_text, transform=plt.gca().transAxes, 
             fontsize=11, verticalalignment='top', fontproperties=font_prop,
             bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.8))
    
    plt.tight_layout()
    plt.show()
    
    return plt

def create_detailed_analysis(birth_series):
    """
    상세 분석 및 추가 시각화
    """
    print("\n=== 출생아수 상세 분석 ===")
    print(f"전체 기간 평균: {birth_series.mean():,.0f}명")
    print(f"1970년대 평균: {birth_series[(birth_series.index >= 1970) & (birth_series.index < 1980)].mean():,.0f}명")
    print(f"1980년대 평균: {birth_series[(birth_series.index >= 1980) & (birth_series.index < 1990)].mean():,.0f}명")
    print(f"1990년대 평균: {birth_series[(birth_series.index >= 1990) & (birth_series.index < 2000)].mean():,.0f}명")
    print(f"2000년대 평균: {birth_series[(birth_series.index >= 2000) & (birth_series.index < 2010)].mean():,.0f}명")
    print(f"2010년대 평균: {birth_series[(birth_series.index >= 2010) & (birth_series.index < 2020)].mean():,.0f}명")
    print(f"2020년대 평균: {birth_series[(birth_series.index >= 2020) & (birth_series.index <= 2024)].mean():,.0f}명")
    
    # 변화율 계산
    annual_change = birth_series.pct_change() * 100
    
    # 가장 큰 감소율
    max_decrease = annual_change.min()
    max_decrease_year = annual_change.idxmin()
    print(f"\n가장 큰 감소율: {max_decrease:.1f}% ({max_decrease_year}년)")
    
    # 가장 큰 증가율
    max_increase = annual_change.max()
    max_increase_year = annual_change.idxmax()
    print(f"가장 큰 증가율: {max_increase:.1f}% ({max_increase_year}년)")
    
    # 2024년 대비 1970년 변화율
    change_1970_to_2024 = ((birth_series[2024] - birth_series[1970]) / birth_series[1970]) * 100
    print(f"1970년 대비 2024년 변화율: {change_1970_to_2024:.1f}%")

def main():
    """
    메인 실행 함수
    """
    print("대한민국 출생아수 데이터 분석을 시작합니다...")
    
    # 데이터 로드 및 클랜징
    birth_series = load_and_clean_birth_data()
    
    if birth_series is None:
        print("데이터 로드에 실패했습니다.")
        return
    
    # 라인 그래프 생성
    plt = create_birth_rate_line_plot(birth_series)
    
    # 상세 분석
    create_detailed_analysis(birth_series)
    
    # 그래프 저장
    plt.savefig('대한민국_출생아수_추이_1970_2024.png', 
                dpi=300, bbox_inches='tight', facecolor='white')
    print("\n그래프가 '대한민국_출생아수_추이_1970_2024.png'로 저장되었습니다.")
    
    print("\n분석이 완료되었습니다!")

if __name__ == "__main__":
    main() 