import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
from datetime import datetime
import re

def crawl_kospi200_top_stocks():
    """
    네이버 금융에서 코스피200의 편입종목상위 정보를 크롤링하는 함수 (개선된 버전)
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
        
        print("페이지 구조를 분석하는 중...")
        
        # 모든 테이블 찾기
        tables = soup.find_all('table')
        print(f"페이지에서 찾은 테이블 개수: {len(tables)}")
        
        # 편입종목상위 테이블 찾기
        top_stocks_data = []
        
        # 방법 1: 특정 클래스나 ID로 테이블 찾기
        target_table = None
        
        # 'type_1' 클래스를 가진 테이블 찾기
        target_table = soup.find('table', {'class': 'type_1'})
        if target_table:
            print("'type_1' 클래스 테이블을 찾았습니다.")
        
        # 'type_2' 클래스를 가진 테이블 찾기
        if not target_table:
            target_table = soup.find('table', {'class': 'type_2'})
            if target_table:
                print("'type_2' 클래스 테이블을 찾았습니다.")
        
        # 'type_3' 클래스를 가진 테이블 찾기
        if not target_table:
            target_table = soup.find('table', {'class': 'type_3'})
            if target_table:
                print("'type_3' 클래스 테이블을 찾았습니다.")
        
        # 방법 2: 테이블 내용으로 편입종목상위 테이블 식별
        if not target_table:
            print("클래스로 테이블을 찾을 수 없어 내용으로 검색합니다...")
            for i, table in enumerate(tables):
                table_text = table.get_text()
                if '편입종목상위' in table_text or '종목명' in table_text:
                    target_table = table
                    print(f"테이블 {i+1}에서 편입종목상위 관련 내용을 찾았습니다.")
                    break
        
        # 방법 3: 모든 테이블을 순회하며 종목 데이터가 있는 테이블 찾기
        if not target_table:
            print("모든 테이블을 검사하여 종목 데이터를 찾습니다...")
            for i, table in enumerate(tables):
                rows = table.find_all('tr')
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 4:
                        cell_texts = [cell.get_text(strip=True) for cell in cells]
                        # 종목명과 현재가가 있는 행인지 확인
                        if any('종목명' in text for text in cell_texts) or \
                           (len(cell_texts) >= 3 and 
                            any(char.isdigit() for char in cell_texts[0] if cell_texts[0]) and
                            any(char.isdigit() for char in cell_texts[2] if len(cell_texts) > 2 and cell_texts[2])):
                            target_table = table
                            print(f"테이블 {i+1}에서 종목 데이터를 찾았습니다.")
                            break
                    if target_table:
                        break
                if target_table:
                    break
        
        # 찾은 테이블에서 데이터 추출
        if target_table:
            print("테이블에서 데이터를 추출하는 중...")
            rows = target_table.find_all('tr')
            
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 3:
                    row_data = []
                    for cell in cells:
                        text = cell.get_text(strip=True)
                        if text:
                            row_data.append(text)
                    
                    # 헤더 행인지 확인
                    if any(keyword in ' '.join(row_data) for keyword in ['순위', '종목명', '현재가', '전일비', '등락률']):
                        print(f"헤더 행 발견: {row_data}")
                        continue
                    
                    # 실제 종목 데이터인지 확인 (숫자로 시작하는 행)
                    if len(row_data) >= 3 and row_data[0] and any(char.isdigit() for char in row_data[0]):
                        # 순위가 1-200 범위인지 확인
                        try:
                            rank = int(row_data[0])
                            if 1 <= rank <= 200:
                                top_stocks_data.append(row_data)
                                print(f"종목 데이터 추가: {row_data[:3]}...")  # 처음 3개 항목만 출력
                        except ValueError:
                            continue
        
        # 방법 4: 다른 URL 시도
        if not top_stocks_data:
            print("편입종목상위 데이터를 찾을 수 없어 다른 URL을 시도합니다...")
            
            # 코스피200 종목별 시세 페이지 시도
            alternative_urls = [
                "https://finance.naver.com/sise/sise_index_detail.naver?code=KPI200",
                "https://finance.naver.com/sise/sise_market_sum.naver?page=1&sosok=0",
                "https://finance.naver.com/sise/sise_rise.naver"
            ]
            
            for alt_url in alternative_urls:
                print(f"대체 URL 시도: {alt_url}")
                try:
                    response = requests.get(alt_url, headers=headers)
                    response.encoding = 'euc-kr'
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    tables = soup.find_all('table')
                    for table in tables:
                        rows = table.find_all('tr')
                        for row in rows:
                            cells = row.find_all(['td', 'th'])
                            if len(cells) >= 4:
                                row_data = [cell.get_text(strip=True) for cell in cells if cell.get_text(strip=True)]
                                if len(row_data) >= 4 and row_data[0] and any(char.isdigit() for char in row_data[0]):
                                    try:
                                        rank = int(row_data[0])
                                        if 1 <= rank <= 200:
                                            top_stocks_data.append(row_data)
                                    except ValueError:
                                        continue
                    
                    if top_stocks_data:
                        print(f"대체 URL에서 데이터를 찾았습니다: {alt_url}")
                        break
                        
                except Exception as e:
                    print(f"대체 URL 접근 실패: {e}")
                    continue
        
        if top_stocks_data:
            # 데이터프레임 생성
            max_cols = max(len(row) for row in top_stocks_data)
            columns = ['순위', '종목명', '현재가', '전일비', '등락률', '거래량', '거래대금', '시가총액', '상장주식수', '외국인비율']
            columns = columns[:max_cols]
            
            # 모든 행을 동일한 길이로 맞추기
            normalized_data = []
            for row in top_stocks_data:
                normalized_row = row + [''] * (max_cols - len(row))
                normalized_data.append(normalized_row[:max_cols])
            
            df = pd.DataFrame(normalized_data, columns=columns)
            
            # 결과 출력
            print(f"\n=== 코스피200 편입종목상위 (크롤링 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}) ===")
            print(f"총 {len(df)}개 종목 데이터를 수집했습니다.")
            print(df.head(10).to_string(index=False))  # 처음 10개만 출력
            
            # CSV 파일로 저장
            filename = f"kospi200_top_stocks_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            df.to_csv(filename, index=False, encoding='utf-8-sig')
            print(f"\n데이터가 {filename} 파일로 저장되었습니다.")
            
            return df
        else:
            print("편입종목상위 데이터를 찾을 수 없습니다.")
            print("\n=== 페이지 구조 분석 결과 ===")
            print("찾은 테이블 개수:", len(tables))
            
            # 각 테이블의 구조 출력
            for i, table in enumerate(tables[:5]):  # 처음 5개 테이블만 확인
                print(f"\n테이블 {i+1}:")
                rows = table.find_all('tr')
                print(f"  행 개수: {len(rows)}")
                if rows:
                    first_row = rows[0]
                    cells = first_row.find_all(['td', 'th'])
                    print(f"  첫 번째 행의 셀 개수: {len(cells)}")
                    if cells:
                        cell_texts = [cell.get_text(strip=True) for cell in cells]
                        print(f"  첫 번째 행 내용: {cell_texts}")
            
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
    print("네이버 금융 코스피200 편입종목상위 크롤러 (개선된 버전)")
    print("=" * 60)
    
    # 크롤링 실행
    result = crawl_kospi200_top_stocks()
    
    if result is not None:
        print("\n크롤링이 성공적으로 완료되었습니다!")
    else:
        print("\n크롤링에 실패했습니다.")

if __name__ == "__main__":
    main() 