import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
from datetime import datetime
import re

def crawl_kospi200_top_stocks():
    """
    네이버 금융에서 코스피200의 편입종목상위 정보를 크롤링하는 함수 (최종 버전)
    """
    # 코스피200 편입종목상위 페이지 URL
    url = "https://finance.naver.com/sise/sise_market_sum.naver?page=1&sosok=0"
    
    # User-Agent 설정 (웹 브라우저로 인식되도록)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        print("네이버 금융에서 코스피200 편입종목상위 정보를 가져오는 중...")
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # HTTP 오류 체크
        
        # 한글 인코딩 설정
        response.encoding = 'euc-kr'
        
        # BeautifulSoup으로 HTML 파싱
        soup = BeautifulSoup(response.text, 'html.parser')
        
        print("페이지 구조를 분석하는 중...")
        
        # 편입종목상위 테이블 찾기
        target_table = soup.find('table', {'class': 'type_2'})
        
        if not target_table:
            print("'type_2' 클래스 테이블을 찾을 수 없어 다른 방법을 시도합니다...")
            # 모든 테이블 중에서 종목 데이터가 있는 테이블 찾기
            tables = soup.find_all('table')
            for table in tables:
                table_text = table.get_text()
                if '종목명' in table_text and '현재가' in table_text:
                    target_table = table
                    print("종목 데이터가 포함된 테이블을 찾았습니다.")
                    break
        
        if target_table:
            print("테이블에서 데이터를 추출하는 중...")
            rows = target_table.find_all('tr')
            
            top_stocks_data = []
            header_found = False
            
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 6:  # 최소 6개 컬럼이 있는 행만 처리
                    row_data = []
                    for cell in cells:
                        text = cell.get_text(strip=True)
                        if text:
                            row_data.append(text)
                    
                    # 헤더 행인지 확인
                    if not header_found and any(keyword in ' '.join(row_data) for keyword in ['순위', '종목명', '현재가']):
                        print(f"헤더 행 발견: {row_data}")
                        header_found = True
                        continue
                    
                    # 실제 종목 데이터인지 확인 (숫자로 시작하는 행)
                    if len(row_data) >= 6 and row_data[0] and any(char.isdigit() for char in row_data[0]):
                        try:
                            rank = int(row_data[0])
                            if 1 <= rank <= 200:  # 코스피200 범위
                                top_stocks_data.append(row_data)
                                print(f"종목 데이터 추가: {row_data[0]}위 - {row_data[1]} ({row_data[2]}원)")
                        except ValueError:
                            continue
            
            if top_stocks_data:
                # 데이터프레임 생성 (동적 컬럼 수 처리)
                max_cols = max(len(row) for row in top_stocks_data)
                print(f"최대 컬럼 수: {max_cols}")
                
                # 기본 컬럼명 정의
                base_columns = ['순위', '종목명', '현재가', '전일비', '등락률', '거래량', '거래대금', '시가총액', '상장주식수', '외국인비율', 'PER', 'ROE']
                
                # 실제 데이터에 맞게 컬럼명 조정
                if max_cols <= len(base_columns):
                    columns = base_columns[:max_cols]
                else:
                    # 추가 컬럼이 있는 경우
                    columns = base_columns + [f'컬럼{i+1}' for i in range(max_cols - len(base_columns))]
                
                # 모든 행을 동일한 길이로 맞추기
                normalized_data = []
                for row in top_stocks_data:
                    normalized_row = row + [''] * (max_cols - len(row))
                    normalized_data.append(normalized_row[:max_cols])
                
                df = pd.DataFrame(normalized_data, columns=columns)
                
                # 결과 출력
                print(f"\n=== 코스피200 편입종목상위 (크롤링 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}) ===")
                print(f"총 {len(df)}개 종목 데이터를 수집했습니다.")
                print("\n[상위 10개 종목]")
                print(df.head(10).to_string(index=False))
                
                # CSV 파일로 저장
                filename = f"kospi200_top_stocks_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                df.to_csv(filename, index=False, encoding='utf-8-sig')
                print(f"\n데이터가 {filename} 파일로 저장되었습니다.")
                
                return df
            else:
                print("종목 데이터를 찾을 수 없습니다.")
        else:
            print("편입종목상위 테이블을 찾을 수 없습니다.")
        
        # 페이지 구조 분석
        print("\n=== 페이지 구조 분석 ===")
        tables = soup.find_all('table')
        print(f"찾은 테이블 개수: {len(tables)}")
        
        for i, table in enumerate(tables[:3]):
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
        import traceback
        traceback.print_exc()
        return None

def crawl_kospi200_detail():
    """
    코스피200 상세 정보 페이지에서 편입종목 정보를 크롤링하는 함수
    """
    url = "https://finance.naver.com/sise/sise_index_detail.naver?code=KPI200"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        print("코스피200 상세 정보 페이지에서 편입종목 정보를 가져오는 중...")
        response = requests.get(url, headers=headers)
        response.encoding = 'euc-kr'
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 편입종목 테이블 찾기
        tables = soup.find_all('table')
        
        for table in tables:
            table_text = table.get_text()
            if '편입종목' in table_text or '종목명' in table_text:
                print("편입종목 테이블을 찾았습니다.")
                
                rows = table.find_all('tr')
                stock_data = []
                
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 3:
                        row_data = [cell.get_text(strip=True) for cell in cells if cell.get_text(strip=True)]
                        if len(row_data) >= 3 and row_data[0] and any(char.isdigit() for char in row_data[0]):
                            try:
                                rank = int(row_data[0])
                                if 1 <= rank <= 200:
                                    stock_data.append(row_data)
                            except ValueError:
                                continue
                
                if stock_data:
                    max_cols = max(len(row) for row in stock_data)
                    columns = ['순위', '종목명', '현재가', '전일비', '등락률', '거래량', '거래대금', '시가총액']
                    columns = columns[:max_cols]
                    
                    normalized_data = []
                    for row in stock_data:
                        normalized_row = row + [''] * (max_cols - len(row))
                        normalized_data.append(normalized_row[:max_cols])
                    
                    df = pd.DataFrame(normalized_data, columns=columns)
                    
                    print(f"\n=== 코스피200 편입종목 정보 (크롤링 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}) ===")
                    print(f"총 {len(df)}개 종목 데이터를 수집했습니다.")
                    print(df.head(10).to_string(index=False))
                    
                    filename = f"kospi200_detail_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                    df.to_csv(filename, index=False, encoding='utf-8-sig')
                    print(f"\n데이터가 {filename} 파일로 저장되었습니다.")
                    
                    return df
        
        print("편입종목 정보를 찾을 수 없습니다.")
        return None
        
    except Exception as e:
        print(f"오류 발생: {e}")
        return None

def main():
    """
    메인 함수
    """
    print("네이버 금융 코스피200 편입종목상위 크롤러 (최종 버전)")
    print("=" * 60)
    
    # 방법 1: 시가총액 상위 종목 크롤링
    print("\n[방법 1] 시가총액 상위 종목 크롤링")
    result1 = crawl_kospi200_top_stocks()
    
    if result1 is None:
        print("\n[방법 2] 코스피200 상세 정보 페이지 크롤링")
        result2 = crawl_kospi200_detail()
        
        if result2 is not None:
            print("\n크롤링이 성공적으로 완료되었습니다!")
        else:
            print("\n모든 방법으로 크롤링에 실패했습니다.")
    else:
        print("\n크롤링이 성공적으로 완료되었습니다!")

if __name__ == "__main__":
    main() 