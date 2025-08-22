import sys
import requests
from bs4 import BeautifulSoup
import time
import urllib.parse
import pandas as pd
from datetime import datetime
from PyQt5.QtWidgets import (QApplication, QMainWindow, QVBoxLayout, QHBoxLayout, 
                             QWidget, QLineEdit, QPushButton, QListWidget, QLabel, 
                             QProgressBar, QSpinBox, QCheckBox, QMessageBox, QTextEdit)
from PyQt5.QtCore import QThread, pyqtSignal, Qt
from PyQt5.QtGui import QFont

class CrawlerThread(QThread):
    """크롤링을 백그라운드에서 실행하는 스레드"""
    progress_updated = pyqtSignal(str)  # 진행상황 업데이트 신호
    result_ready = pyqtSignal(list)     # 결과 준비 완료 신호
    finished_crawling = pyqtSignal()    # 크롤링 완료 신호
    
    def __init__(self, search_keyword="", max_pages=10):
        super().__init__()
        self.search_keyword = search_keyword
        self.max_pages = max_pages
        self.is_running = True
    
    def run(self):
        """크롤링 실행"""
        base_url = "https://www.clien.net/service/board/sold"
        all_titles = []
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        self.progress_updated.emit(f"{'검색어: ' + self.search_keyword if self.search_keyword else '전체 매물'} 크롤링 시작...")
        
        for page in range(1, self.max_pages + 1):
            if not self.is_running:
                break
                
            try:
                # URL 구성
                if self.search_keyword:
                    params = {
                        'sk': 'title',
                        'sv': self.search_keyword,
                        'po': str(page)
                    }
                    url = base_url + "?" + urllib.parse.urlencode(params)
                else:
                    url = f"{base_url}?po={page}"
                
                self.progress_updated.emit(f"페이지 {page}/{self.max_pages} 크롤링 중...")
                
                response = requests.get(url, headers=headers)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # 여러 방법으로 제목 요소 찾기
                titles = soup.find_all('span', class_='subject_fixed')
                if not titles:
                    titles = soup.find_all('a', class_='list_subject')
                if not titles:
                    titles = soup.select('td.post_subject a')
                if not titles:
                    # 추가 시도
                    titles = soup.select('a[href*="/service/board/sold/"]')
                
                page_titles = []
                for title in titles:
                    title_text = title.get_text(strip=True)
                    if title_text and title_text not in [t['title'] for t in all_titles]:
                        page_titles.append({
                            'title': title_text,
                            'page': page
                        })
                
                all_titles.extend(page_titles)
                self.progress_updated.emit(f"페이지 {page}: {len(page_titles)}개 매물 발견")
                
                time.sleep(1)  # 서버 부하 방지
                
            except Exception as e:
                self.progress_updated.emit(f"페이지 {page} 오류: {str(e)}")
                continue
        
        self.result_ready.emit(all_titles)
        self.finished_crawling.emit()
    
    def stop(self):
        """크롤링 중지"""
        self.is_running = False

class ClienMarketGUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.crawler_thread = None
        self.results = []
        self.init_ui()
    
    def init_ui(self):
        """UI 초기화"""
        self.setWindowTitle('클리앙 중고장터 크롤링 프로그램')
        self.setGeometry(100, 100, 800, 600)
        
        # 중앙 위젯 설정
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # 메인 레이아웃
        main_layout = QVBoxLayout()
        central_widget.setLayout(main_layout)
        
        # 제목
        title_label = QLabel('클리앙 중고장터 크롤링 프로그램')
        title_label.setAlignment(Qt.AlignCenter)
        title_font = QFont()
        title_font.setPointSize(16)
        title_font.setBold(True)
        title_label.setFont(title_font)
        main_layout.addWidget(title_label)
        
        # 검색 영역
        search_layout = QHBoxLayout()
        
        # 검색어 입력
        search_layout.addWidget(QLabel('검색어:'))
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText('검색할 키워드를 입력하세요 (비워두면 전체 검색)')
        self.search_input.returnPressed.connect(self.start_crawling)
        search_layout.addWidget(self.search_input)
        
        # 페이지 수 설정
        search_layout.addWidget(QLabel('페이지 수:'))
        self.page_spinbox = QSpinBox()
        self.page_spinbox.setMinimum(1)
        self.page_spinbox.setMaximum(50)
        self.page_spinbox.setValue(10)
        search_layout.addWidget(self.page_spinbox)
        
        # 검색 버튼
        self.search_button = QPushButton('검색 시작')
        self.search_button.clicked.connect(self.start_crawling)
        search_layout.addWidget(self.search_button)
        
        # 중지 버튼
        self.stop_button = QPushButton('중지')
        self.stop_button.clicked.connect(self.stop_crawling)
        self.stop_button.setEnabled(False)
        search_layout.addWidget(self.stop_button)
        
        main_layout.addLayout(search_layout)
        
        # 진행 상황 표시
        self.progress_text = QTextEdit()
        self.progress_text.setMaximumHeight(100)
        self.progress_text.setReadOnly(True)
        main_layout.addWidget(QLabel('진행 상황:'))
        main_layout.addWidget(self.progress_text)
        
        # 결과 리스트
        main_layout.addWidget(QLabel('검색 결과:'))
        self.result_list = QListWidget()
        main_layout.addWidget(self.result_list)
        
        # 하단 정보 영역
        bottom_layout = QHBoxLayout()
        
        self.result_count_label = QLabel('총 0개 매물')
        bottom_layout.addWidget(self.result_count_label)
        
        bottom_layout.addStretch()
        
        # 파일 저장 버튼들
        # 텍스트 파일 저장 버튼
        self.save_txt_button = QPushButton('TXT 저장')
        self.save_txt_button.clicked.connect(self.save_results_txt)
        self.save_txt_button.setEnabled(False)
        bottom_layout.addWidget(self.save_txt_button)
        
        # Excel 파일 저장 버튼
        self.save_excel_button = QPushButton('Excel 저장')
        self.save_excel_button.clicked.connect(self.save_results_excel)
        self.save_excel_button.setEnabled(False)
        bottom_layout.addWidget(self.save_excel_button)
        
        main_layout.addLayout(bottom_layout)
    
    def start_crawling(self):
        """크롤링 시작"""
        if self.crawler_thread and self.crawler_thread.isRunning():
            return
        
        search_keyword = self.search_input.text().strip()
        max_pages = self.page_spinbox.value()
        
        # UI 상태 변경
        self.search_button.setEnabled(False)
        self.stop_button.setEnabled(True)
        self.save_txt_button.setEnabled(False)
        self.save_excel_button.setEnabled(False)
        self.result_list.clear()
        self.progress_text.clear()
        self.result_count_label.setText('총 0개 매물')
        
        # 크롤링 스레드 시작
        self.crawler_thread = CrawlerThread(search_keyword, max_pages)
        self.crawler_thread.progress_updated.connect(self.update_progress)
        self.crawler_thread.result_ready.connect(self.display_results)
        self.crawler_thread.finished_crawling.connect(self.crawling_finished)
        self.crawler_thread.start()
    
    def stop_crawling(self):
        """크롤링 중지"""
        if self.crawler_thread:
            self.crawler_thread.stop()
            self.crawler_thread.wait()
        self.crawling_finished()
    
    def update_progress(self, message):
        """진행 상황 업데이트"""
        self.progress_text.append(message)
        # 스크롤을 맨 아래로
        scrollbar = self.progress_text.verticalScrollBar()
        scrollbar.setValue(scrollbar.maximum())
    
    def display_results(self, results):
        """결과 표시"""
        self.results = results
        self.result_list.clear()
        
        for i, item in enumerate(results, 1):
            list_item = f"{i:3d}. [{item['page']}페이지] {item['title']}"
            self.result_list.addItem(list_item)
        
        self.result_count_label.setText(f'총 {len(results)}개 매물')
        # 결과가 있으면 저장 버튼들 활성화
        if results:
            self.save_txt_button.setEnabled(True)
            self.save_excel_button.setEnabled(True)
    
    def crawling_finished(self):
        """크롤링 완료 처리"""
        self.search_button.setEnabled(True)
        self.stop_button.setEnabled(False)
        self.update_progress("크롤링 완료!")
    
    def save_results_txt(self):
        """결과를 텍스트 파일로 저장"""
        if not self.results:
            QMessageBox.warning(self, '경고', '저장할 결과가 없습니다.')
            return
        
        try:
            search_keyword = self.search_input.text().strip()
            if search_keyword:
                filename = f"clien_market_{search_keyword.replace(' ', '_')}.txt"
            else:
                filename = "clien_market_all.txt"
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write("클리앙 중고장터 매물 제목 목록\n")
                if search_keyword:
                    f.write(f"검색어: {search_keyword}\n")
                f.write(f"크롤링 일시: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write("=" * 50 + "\n\n")
                
                for i, item in enumerate(self.results, 1):
                    f.write(f"{i:3d}. [{item['page']}페이지] {item['title']}\n")
                
                f.write(f"\n총 {len(self.results)}개 매물")
            
            QMessageBox.information(self, '저장 완료', f"결과가 '{filename}' 파일로 저장되었습니다.")
            
        except Exception as e:
            QMessageBox.critical(self, '오류', f'TXT 파일 저장 중 오류 발생: {str(e)}')
    
    def save_results_excel(self):
        """결과를 Excel 파일로 저장"""
        if not self.results:
            QMessageBox.warning(self, '경고', '저장할 결과가 없습니다.')
            return
        
        try:
            # 데이터프레임 생성
            data = []
            for i, item in enumerate(self.results, 1):
                data.append({
                    '번호': i,
                    '매물 제목': item['title'],
                    '페이지': item['page'],
                    '크롤링 일시': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                })
            
            df = pd.DataFrame(data)
            
            # 검색어에 따른 파일명 생성
            search_keyword = self.search_input.text().strip()
            if search_keyword:
                filename = f"clien_market_{search_keyword.replace(' ', '_')}.xlsx"
            else:
                filename = "clien_market_all.xlsx"
            
            # Excel 파일로 저장
            with pd.ExcelWriter(filename, engine='openpyxl') as writer:
                # 메인 데이터 시트
                df.to_excel(writer, sheet_name='매물목록', index=False)
                
                # 요약 정보 시트
                summary_data = {
                    '항목': ['검색어', '총 매물 수', '크롤링 페이지 수', '크롤링 일시'],
                    '내용': [
                        search_keyword if search_keyword else '전체 검색',
                        len(self.results),
                        self.page_spinbox.value(),
                        datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    ]
                }
                summary_df = pd.DataFrame(summary_data)
                summary_df.to_excel(writer, sheet_name='크롤링정보', index=False)
                
                # 페이지별 통계 시트
                page_stats = {}
                for item in self.results:
                    page = item['page']
                    if page in page_stats:
                        page_stats[page] += 1
                    else:
                        page_stats[page] = 1
                
                stats_data = {
                    '페이지': list(page_stats.keys()),
                    '매물 수': list(page_stats.values())
                }
                stats_df = pd.DataFrame(stats_data)
                stats_df.to_excel(writer, sheet_name='페이지별통계', index=False)
            
            QMessageBox.information(self, '저장 완료', f"결과가 '{filename}' 파일로 저장되었습니다.\n\n시트 구성:\n- 매물목록: 전체 매물 리스트\n- 크롤링정보: 검색 조건 및 요약\n- 페이지별통계: 페이지별 매물 수")
            
        except Exception as e:
            QMessageBox.critical(self, '오류', f'Excel 파일 저장 중 오류 발생: {str(e)}')

def main():
    app = QApplication(sys.argv)
    window = ClienMarketGUI()
    window.show()
    sys.exit(app.exec_())

if __name__ == '__main__':
    main()