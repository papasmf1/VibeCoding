import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from urllib.request import urlretrieve
import os

# 한글 폰트 설정 (Windows 환경)
plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False

def download_titanic_data():
    """타이타닉 데이터셋을 다운로드합니다."""
    url = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
    filename = "titanic.csv"
    
    if not os.path.exists(filename):
        print("타이타닉 데이터셋을 다운로드 중...")
        urlretrieve(url, filename)
        print("다운로드 완료!")
    else:
        print("데이터셋이 이미 존재합니다.")
    
    return filename

def analyze_survival_by_gender():
    """성별에 따른 생존율을 분석하고 시각화합니다."""
    # 데이터 다운로드
    filename = download_titanic_data()
    
    # 데이터 로드
    df = pd.read_csv(filename)
    
    print("데이터셋 정보:")
    print(f"총 승객 수: {len(df)}")
    print(f"생존자 수: {df['Survived'].sum()}")
    print(f"전체 생존율: {df['Survived'].mean():.2%}")
    print("\n성별 분포:")
    print(df['Sex'].value_counts())
    
    # 성별 생존율 계산
    survival_by_gender = df.groupby('Sex')['Survived'].agg(['count', 'sum', 'mean']).round(4)
    survival_by_gender.columns = ['총 인원', '생존자 수', '생존율']
    
    print("\n성별 생존율 분석:")
    print(survival_by_gender)
    
    # 시각화
    create_survival_chart(df, survival_by_gender)
    
    return df, survival_by_gender

def create_survival_chart(df, survival_data):
    """생존율을 바차트로 시각화합니다."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
    
    # 1. 성별 생존율 바차트
    genders = ['Female', 'Male']
    survival_rates = [survival_data.loc['female', '생존율'], survival_data.loc['male', '생존율']]
    colors = ['#FF6B6B', '#4ECDC4']
    
    bars1 = ax1.bar(genders, survival_rates, color=colors, alpha=0.8, edgecolor='black', linewidth=1)
    ax1.set_title('성별 생존율', fontsize=16, fontweight='bold', pad=20)
    ax1.set_ylabel('생존율', fontsize=12)
    ax1.set_ylim(0, 1)
    
    # 바 위에 퍼센트 표시
    for bar, rate in zip(bars1, survival_rates):
        height = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2., height + 0.01,
                f'{rate:.1%}', ha='center', va='bottom', fontweight='bold', fontsize=12)
    
    # 2. 성별 생존자/사망자 분포
    survival_counts = df.groupby(['Sex', 'Survived']).size().unstack(fill_value=0)
    
    x = np.arange(len(survival_counts.index))
    width = 0.35
    
    bars2 = ax2.bar(x - width/2, survival_counts[0], width, label='사망', color='#FF6B6B', alpha=0.7)
    bars3 = ax2.bar(x + width/2, survival_counts[1], width, label='생존', color='#4ECDC4', alpha=0.7)
    
    ax2.set_title('성별 생존자/사망자 분포', fontsize=16, fontweight='bold', pad=20)
    ax2.set_ylabel('인원 수', fontsize=12)
    ax2.set_xticks(x)
    ax2.set_xticklabels(['Female', 'Male'])
    ax2.legend()
    
    # 바 위에 숫자 표시
    for bars in [bars2, bars3]:
        for bar in bars:
            height = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width()/2., height + 1,
                    f'{int(height)}', ha='center', va='bottom', fontweight='bold')
    
    plt.tight_layout()
    plt.show()
    
    # 추가 통계 정보 출력
    print("\n=== 상세 통계 ===")
    print(f"여성 생존율: {survival_data.loc['female', '생존율']:.2%}")
    print(f"남성 생존율: {survival_data.loc['male', '생존율']:.2%}")
    print(f"생존율 차이: {abs(survival_data.loc['female', '생존율'] - survival_data.loc['male', '생존율']):.2%}")

def additional_analysis(df):
    """추가 분석을 수행합니다."""
    print("\n=== 추가 분석 ===")
    
    # 클래스별 성별 생존율
    class_gender_survival = df.groupby(['Pclass', 'Sex'])['Survived'].mean().unstack()
    print("\n클래스별 성별 생존율:")
    print(class_gender_survival)
    
    # 나이대별 생존율 (성별 구분)
    df['AgeGroup'] = pd.cut(df['Age'], bins=[0, 20, 40, 60, 100], labels=['0-20', '21-40', '41-60', '60+'])
    age_gender_survival = df.groupby(['AgeGroup', 'Sex'])['Survived'].mean().unstack()
    print("\n나이대별 성별 생존율:")
    print(age_gender_survival)

if __name__ == "__main__":
    try:
        # 메인 분석 실행
        df, survival_data = analyze_survival_by_gender()
        
        # 추가 분석 실행
        additional_analysis(df)
        
        print("\n분석이 완료되었습니다!")
        
    except Exception as e:
        print(f"오류가 발생했습니다: {e}")
        print("인터넷 연결을 확인해주세요.") 