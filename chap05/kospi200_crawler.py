import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
from datetime import datetime

def crawl_kospi200_top_stocks():
    """
    네이버 금융에서 코스피200의 편입종목상위 정보를 크롤링하는 함수
    """
    url = "https://finance.naver.com/sise/sise_index.naver?code=KPI200"
    
    # User-Agent 설정 (웹 브라우저로 인식되도록)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        print("네이버 금융에서 코스피200 정보를 가져오는 중...")
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # HTTP 오류 체크
        
        # 한글 인코딩 설정
        response.encoding = 'euc-kr'
        
        # BeautifulSoup으로 HTML 파싱
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 코스피200 편입종목상위 테이블 찾기
        # 네이버 금융의 구조에 따라 테이블을 찾습니다
        tables = soup.find_all('table')
        
        top_stocks_data = []
        
        # 편입종목상위 테이블 찾기 (일반적으로 첫 번째 테이블이 편입종목상위)
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 4:  # 최소 4개 컬럼이 있는 행만 처리
                    row_data = []
                    for cell in cells:
                        text = cell.get_text(strip=True)
                        if text:  # 빈 텍스트가 아닌 경우만 추가
                            row_data.append(text)
                    
                    if len(row_data) >= 4 and any(char.isdigit() for char in row_data[0] if row_data[0]):
                        # 숫자로 시작하는 행 (실제 종목 데이터)
                        top_stocks_data.append(row_data)
        
        if not top_stocks_data:
            # 다른 방법으로 테이블 찾기 시도
            print("기본 방법으로 테이블을 찾을 수 없어 다른 방법을 시도합니다...")
            
            # 특정 클래스나 ID로 테이블 찾기
            table = soup.find('table', {'class': 'type_1'})
            if table:
                rows = table.find_all('tr')
                for row in rows[1:]:  # 헤더 제외
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 4:
                        row_data = [cell.get_text(strip=True) for cell in cells if cell.get_text(strip=True)]
                        if row_data and len(row_data) >= 4:
                            top_stocks_data.append(row_data)
        
        if top_stocks_data:
            # 데이터프레임 생성
            columns = ['순위', '종목명', '현재가', '전일비', '등락률', '거래량', '거래대금', '시가총액']
            df = pd.DataFrame(top_stocks_data, columns=columns[:len(top_stocks_data[0])])
            
            # 결과 출력
            print(f"\n=== 코스피200 편입종목상위 (크롤링 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}) ===")
            print(df.to_string(index=False))
            
            # CSV 파일로 저장
            filename = f"kospi200_top_stocks_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            df.to_csv(filename, index=False, encoding='utf-8-sig')
            print(f"\n데이터가 {filename} 파일로 저장되었습니다.")
            
            return df
        else:
            print("편입종목상위 데이터를 찾을 수 없습니다.")
            print("페이지 구조를 확인해보겠습니다...")
            
            # 페이지 구조 확인
            print("\n=== 페이지 구조 분석 ===")
            print("찾은 테이블 개수:", len(tables))
            for i, table in enumerate(tables[:3]):  # 처음 3개 테이블만 확인
                print(f"테이블 {i+1}:")
                rows = table.find_all('tr')
                print(f"  행 개수: {len(rows)}")
                if rows:
                    first_row = rows[0]
                    cells = first_row.find_all(['td', 'th'])
                    print(f"  첫 번째 행의 셀 개수: {len(cells)}")
                    if cells:
                        print(f"  첫 번째 행 내용: {[cell.get_text(strip=True) for cell in cells]}")
            
            return None
            
    except requests.RequestException as e:
        print(f"네트워크 오류: {e}")
        return None
    except Exception as e:
        print(f"오류 발생: {e}")
        return None

def main():
    """
    메인 함수
    """
    print("네이버 금융 코스피200 편입종목상위 크롤러")
    print("=" * 50)
    
    # 크롤링 실행
    result = crawl_kospi200_top_stocks()
    
    if result is not None:
        print("\n크롤링이 성공적으로 완료되었습니다!")
    else:
        print("\n크롤링에 실패했습니다.")

if __name__ == "__main__":
    main() 