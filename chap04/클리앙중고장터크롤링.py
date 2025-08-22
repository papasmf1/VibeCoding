import requests
from bs4 import BeautifulSoup
import time
import urllib.parse

def crawl_clien_market(search_keyword="", max_pages=10):
    """클리앙 중고장터의 매물 제목을 크롤링하는 함수"""
    
    base_url = "https://www.clien.net/service/board/sold"
    all_titles = []
    
    # 헤더 설정 (웹사이트에서 차단을 방지하기 위해)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    print(f"{'검색어: ' + search_keyword if search_keyword else '전체 매물'} 크롤링 시작...")
    print(f"총 {max_pages}페이지를 크롤링합니다.")
    print("-" * 60)
    
    for page in range(1, max_pages + 1):
        try:
            # URL 구성
            if search_keyword:
                # 검색어가 있는 경우
                params = {
                    'sk': 'title',  # 제목 검색
                    'sv': search_keyword,
                    'po': str(page)
                }
                url = base_url + "?" + urllib.parse.urlencode(params)
            else:
                # 전체 매물 조회
                url = f"{base_url}?po={page}"
            
            print(f"페이지 {page} 크롤링 중...")
            
            # 웹페이지 요청
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            # HTML 파싱
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 매물 제목 요소 찾기
            titles = soup.find_all('span', class_='subject_fixed')
            
            if not titles:
                # 다른 클래스명으로 시도
                titles = soup.find_all('a', class_='list_subject')
            
            if not titles:
                # 또 다른 클래스명으로 시도
                titles = soup.select('td.post_subject a')
            
            page_titles = []
            for title in titles:
                title_text = title.get_text(strip=True)
                if title_text and title_text not in [t['title'] for t in all_titles]:
                    page_titles.append({
                        'title': title_text,
                        'page': page
                    })
            
            all_titles.extend(page_titles)
            print(f"페이지 {page}: {len(page_titles)}개 매물 발견")
            
            # 페이지 간 요청 간격 (서버 부하 방지)
            time.sleep(1)
            
        except requests.RequestException as e:
            print(f"페이지 {page} 요청 중 오류 발생: {e}")
            continue
        except Exception as e:
            print(f"페이지 {page} 크롤링 중 오류 발생: {e}")
            continue
    
    # 결과 출력
    print("\n" + "=" * 60)
    print(f"크롤링 완료! 총 {len(all_titles)}개 매물 발견")
    print("=" * 60)
    
    for i, item in enumerate(all_titles, 1):
        print(f"{i:3d}. [{item['page']}페이지] {item['title']}")
    
    return all_titles

def save_to_file(titles, search_keyword="", filename=None):
    """크롤링한 제목을 텍스트 파일로 저장"""
    try:
        if filename is None:
            if search_keyword:
                filename = f"clien_market_{search_keyword.replace(' ', '_')}.txt"
            else:
                filename = "clien_market_all.txt"
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("클리앙 중고장터 매물 제목 목록\n")
            if search_keyword:
                f.write(f"검색어: {search_keyword}\n")
            f.write("=" * 50 + "\n\n")
            
            for i, item in enumerate(titles, 1):
                f.write(f"{i:3d}. [{item['page']}페이지] {item['title']}\n")
            
            f.write(f"\n총 {len(titles)}개 매물")
        
        print(f"\n결과가 '{filename}' 파일로 저장되었습니다.")
    except Exception as e:
        print(f"파일 저장 중 오류 발생: {e}")

def get_search_input():
    """사용자로부터 검색 조건을 입력받는 함수"""
    print("=" * 60)
    print("          클리앙 중고장터 크롤링 프로그램")
    print("=" * 60)
    
    # 검색어 입력
    search_keyword = input("검색할 키워드를 입력하세요 (전체 검색은 엔터): ").strip()
    
    # 페이지 수 입력
    while True:
        try:
            pages = input("크롤링할 페이지 수를 입력하세요 (기본값: 10): ").strip()
            if not pages:
                pages = 10
            else:
                pages = int(pages)
            
            if pages <= 0:
                print("1 이상의 숫자를 입력해주세요.")
                continue
            elif pages > 50:
                confirm = input("50페이지 이상은 시간이 오래 걸립니다. 계속하시겠습니까? (y/n): ")
                if confirm.lower() not in ['y', 'yes', '예']:
                    continue
            
            break
        except ValueError:
            print("올바른 숫자를 입력해주세요.")
    
    return search_keyword, pages

if __name__ == "__main__":
    try:
        # 사용자 입력 받기
        search_keyword, max_pages = get_search_input()
        
        print(f"\n크롤링을 시작합니다...")
        if search_keyword:
            print(f"검색어: '{search_keyword}'")
        print(f"페이지 수: {max_pages}")
        
        # 크롤링 실행
        titles = crawl_clien_market(search_keyword, max_pages)
        
        if titles:
            # 파일로 저장할지 선택
            save_choice = input("\n결과를 파일로 저장하시겠습니까? (y/n): ")
            if save_choice.lower() in ['y', 'yes', '예']:
                save_to_file(titles, search_keyword)
        else:
            print("크롤링된 제목이 없습니다.")
        
        print("\n크롤링 완료!")
        
    except KeyboardInterrupt:
        print("\n사용자가 프로그램을 중단했습니다.")
    except Exception as e:
        print(f"프로그램 실행 중 오류 발생: {e}")