import requests
from bs4 import BeautifulSoup
import time

def crawl_naver_blog_titles(query_url):
    """
    네이버 블로그 검색 결과에서 제목을 크롤링하는 함수
    """
    try:
        # 헤더 설정 (봇 차단 방지)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # 요청 보내기
        response = requests.get(query_url, headers=headers)
        response.raise_for_status()  # HTTP 오류 확인
        
        # BeautifulSoup으로 HTML 파싱
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 블로그 제목 요소 찾기
        blog_titles = []
        
        # 네이버 블로그 결과의 제목 선택자
        title_elements = soup.select('a.title_link')
        
        if not title_elements:
            # 다른 선택자 시도
            title_elements = soup.select('.view_wrap .title_area a')
        
        if not title_elements:
            # 또 다른 선택자 시도
            title_elements = soup.select('.blog_title')
        
        for element in title_elements:
            title = element.get_text(strip=True)
            if title:
                blog_titles.append(title)
        
        return blog_titles
        
    except requests.RequestException as e:
        print(f"요청 오류: {e}")
        return []
    except Exception as e:
        print(f"크롤링 오류: {e}")
        return []

def main():
    # 검색 URL
    url = "https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query=ChatGPT%EC%82%AC%EC%9A%A9%EB%B2%95&ackey=7xsmprgv"
    
    print("네이버 블로그 제목 크롤링을 시작합니다...")
    
    # 크롤링 실행
    titles = crawl_naver_blog_titles(url)
    
    if titles:
        print(f"\n총 {len(titles)}개의 블로그 제목을 찾았습니다:\n")
        for i, title in enumerate(titles, 1):
            print(f"{i}. {title}")
    else:
        print("블로그 제목을 찾을 수 없습니다.")
        print("네이버의 구조가 변경되었거나 봇 차단이 있을 수 있습니다.")

if __name__ == "__main__":
    main()