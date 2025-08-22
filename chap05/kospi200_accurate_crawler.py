import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
import time

def crawl_kospi200_entry_stocks():
    """
    네이버 금융에서 코스피200 편입종목상위 정보를 정확히 크롤링하는 함수
    """
    # 코스피200 편입종목 페이지 URL
    url = "https://finance.naver.com/sise/entryJongmok.naver?type=KPI200&page=1"
    
    # User-Agent 설정
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        print("네이버 금융에서 코스피200 편입종목상위 정보를 가져오는 중...")
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # 한글 인코딩 설정
        response.encoding = 'euc-kr'
        
        # BeautifulSoup으로 HTML 파싱
        soup = BeautifulSoup(response.text, 'html.parser')
        
        print("편입종목상위 테이블을 찾는 중...")
        
        # 'type_1' 클래스를 가진 테이블 찾기 (제공된 HTML 구조에 맞춤)
        target_table = soup.find('table', {'class': 'type_1'})
        
        if not target_table:
            print("'type_1' 클래스 테이블을 찾을 수 없습니다.")
            return None
        
        print("테이블에서 데이터를 추출하는 중...")
        
        # 테이블의 모든 행 찾기
        rows = target_table.find_all('tr')
        
        stock_data = []
        
        for row in rows:
            # td와 th 셀 찾기
            cells = row.find_all(['td', 'th'])
            
            # 최소 7개 컬럼이 있는 행만 처리 (제공된 HTML 구조에 맞춤)
            if len(cells) >= 7:
                row_data = []
                
                for cell in cells:
                    # 셀 내의 텍스트 추출 (링크 텍스트 포함)
                    cell_text = cell.get_text(strip=True)
                    if cell_text:
                        row_data.append(cell_text)
                
                # 헤더 행인지 확인 (종목별, 현재가, 전일비 등이 포함된 행)
                if any(keyword in ' '.join(row_data) for keyword in ['종목별', '현재가', '전일비', '등락률']):
                    print(f"헤더 행 발견: {row_data}")
                    continue
                
                # 빈 행이나 구분선 행 건너뛰기
                if len(row_data) < 7 or not row_data[0]:
                    continue
                
                # 실제 종목 데이터인지 확인 (종목명이 있는 행)
                if len(row_data) >= 7 and row_data[0]:
                    # 종목명, 현재가, 전일비, 등락률, 거래량, 거래대금, 시가총액 순서
                    stock_info = {
                        '종목명': row_data[0],
                        '현재가': row_data[1],
                        '전일비': row_data[2],
                        '등락률': row_data[3],
                        '거래량': row_data[4],
                        '거래대금': row_data[5],
                        '시가총액': row_data[6]
                    }
                    
                    stock_data.append(stock_info)
                    print(f"종목 데이터 추가: {row_data[0]} - {row_data[1]}원 ({row_data[3]})")
        
        if stock_data:
            # 데이터프레임 생성
            df = pd.DataFrame(stock_data)
            
            # 결과 출력
            print(f"\n=== 코스피200 편입종목상위 (크롤링 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}) ===")
            print(f"총 {len(df)}개 종목 데이터를 수집했습니다.")
            print("\n[수집된 종목 목록]")
            print(df.to_string(index=False))
            
            # CSV 파일로 저장
            filename = f"kospi200_entry_stocks_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            df.to_csv(filename, index=False, encoding='utf-8-sig')
            print(f"\n데이터가 {filename} 파일로 저장되었습니다.")
            
            return df
        else:
            print("종목 데이터를 찾을 수 없습니다.")
            return None
            
    except requests.RequestException as e:
        print(f"네트워크 오류: {e}")
        return None
    except Exception as e:
        print(f"오류 발생: {e}")
        import traceback
        traceback.print_exc()
        return None

def crawl_multiple_pages(max_pages=5):
    """
    여러 페이지의 코스피200 편입종목 정보를 크롤링하는 함수
    """
    all_stock_data = []
    
    for page in range(1, max_pages + 1):
        print(f"\n=== {page}페이지 크롤링 중... ===")
        
        url = f"https://finance.naver.com/sise/entryJongmok.naver?type=KPI200&page={page}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        try:
            response = requests.get(url, headers=headers)
            response.encoding = 'euc-kr'
            
            soup = BeautifulSoup(response.text, 'html.parser')
            target_table = soup.find('table', {'class': 'type_1'})
            
            if not target_table:
                print(f"{page}페이지에서 테이블을 찾을 수 없습니다.")
                continue
            
            rows = target_table.find_all('tr')
            page_stock_data = []
            
            for row in rows:
                cells = row.find_all(['td', 'th'])
                
                if len(cells) >= 7:
                    row_data = []
                    for cell in cells:
                        cell_text = cell.get_text(strip=True)
                        if cell_text:
                            row_data.append(cell_text)
                    
                    # 헤더 행 건너뛰기
                    if any(keyword in ' '.join(row_data) for keyword in ['종목별', '현재가', '전일비', '등락률']):
                        continue
                    
                    # 실제 종목 데이터
                    if len(row_data) >= 7 and row_data[0]:
                        stock_info = {
                            '페이지': page,
                            '종목명': row_data[0],
                            '현재가': row_data[1],
                            '전일비': row_data[2],
                            '등락률': row_data[3],
                            '거래량': row_data[4],
                            '거래대금': row_data[5],
                            '시가총액': row_data[6]
                        }
                        
                        page_stock_data.append(stock_info)
            
            if page_stock_data:
                all_stock_data.extend(page_stock_data)
                print(f"{page}페이지에서 {len(page_stock_data)}개 종목 데이터를 수집했습니다.")
            else:
                print(f"{page}페이지에서 종목 데이터를 찾을 수 없습니다.")
            
            # 페이지 간 딜레이 (서버 부하 방지)
            time.sleep(1)
            
        except Exception as e:
            print(f"{page}페이지 크롤링 중 오류 발생: {e}")
            continue
    
    if all_stock_data:
        # 데이터프레임 생성
        df = pd.DataFrame(all_stock_data)
        
        # 결과 출력
        print(f"\n=== 코스피200 편입종목상위 (전체 {max_pages}페이지) ===")
        print(f"총 {len(df)}개 종목 데이터를 수집했습니다.")
        print("\n[상위 20개 종목]")
        print(df.head(20).to_string(index=False))
        
        # CSV 파일로 저장
        filename = f"kospi200_all_pages_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        df.to_csv(filename, index=False, encoding='utf-8-sig')
        print(f"\n전체 데이터가 {filename} 파일로 저장되었습니다.")
        
        return df
    else:
        print("수집된 데이터가 없습니다.")
        return None

def main():
    """
    메인 함수
    """
    print("네이버 금융 코스피200 편입종목상위 크롤러 (정확한 버전)")
    print("=" * 60)
    
    # 사용자 선택
    print("\n크롤링 옵션을 선택하세요:")
    print("1. 첫 번째 페이지만 크롤링")
    print("2. 여러 페이지 크롤링 (기본 5페이지)")
    
    choice = input("\n선택 (1 또는 2): ").strip()
    
    if choice == "2":
        try:
            max_pages = int(input("크롤링할 페이지 수 (기본값: 5): ") or "5")
            result = crawl_multiple_pages(max_pages)
        except ValueError:
            print("잘못된 입력입니다. 기본값 5페이지로 진행합니다.")
            result = crawl_multiple_pages(5)
    else:
        result = crawl_kospi200_entry_stocks()
    
    if result is not None:
        print("\n크롤링이 성공적으로 완료되었습니다!")
    else:
        print("\n크롤링에 실패했습니다.")

if __name__ == "__main__":
    main() 