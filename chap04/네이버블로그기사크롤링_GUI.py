import sys
import requests
from bs4 import BeautifulSoup
import time
from PyQt5.QtWidgets import (QApplication, QMainWindow, QVBoxLayout, QHBoxLayout, 
                             QWidget, QPushButton, QLineEdit, QTextEdit, QLabel, 
                             QProgressBar, QMessageBox, QSplitter, QFrame)
from PyQt5.QtCore import QThread, pyqtSignal, Qt
from PyQt5.QtGui import QFont, QIcon
import urllib.parse

class ScrapingWorker(QThread):
    """크롤링 작업을 별도 스레드에서 실행하는 클래스"""
    finished = pyqtSignal(list)
    error = pyqtSignal(str)
    progress = pyqtSignal(str)

    def __init__(self, search_query):
        super().__init__()
        self.search_query = search_query

    def run(self):
        try:
            self.progress.emit("크롤링을 시작합니다...")
            
            # 검색어를 URL 인코딩
            encoded_query = urllib.parse.quote(self.search_query)
            url = f"https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query={encoded_query}"
            
            self.progress.emit("네이버 서버에 요청을 보내는 중...")
            
            # 크롤링 실행
            titles = self.crawl_naver_blog_titles(url)
            
            if titles:
                self.progress.emit(f"총 {len(titles)}개의 블로그 제목을 찾았습니다.")
                self.finished.emit(titles)
            else:
                self.error.emit("블로그 제목을 찾을 수 없습니다.\n네이버의 구조가 변경되었거나 봇 차단이 있을 수 있습니다.")
                
        except Exception as e:
            self.error.emit(f"크롤링 중 오류가 발생했습니다: {str(e)}")

    def crawl_naver_blog_titles(self, query_url):
        """네이버 블로그 검색 결과에서 제목을 크롤링하는 함수"""
        try:
            # 헤더 설정 (봇 차단 방지)
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            self.progress.emit("HTML 데이터를 분석하는 중...")
            
            # 요청 보내기
            response = requests.get(query_url, headers=headers)
            response.raise_for_status()
            
            # BeautifulSoup으로 HTML 파싱
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 블로그 제목 요소 찾기
            blog_titles = []
            
            # 실제 네이버 블로그 검색 결과의 제목 선택자들
            title_elements = soup.select('.title_area a.title_link')
            
            if not title_elements:
                title_elements = soup.select('a.title_link')
            
            if not title_elements:
                title_elements = soup.select('.view_wrap .title_area a')
            
            if not title_elements:
                title_elements = soup.select('li.bx:not([class*="power_content"]) .title_area a')

            # 제목 텍스트 추출
            for element in title_elements:
                title_text = element.get_text(strip=True)
                if title_text and title_text not in blog_titles:
                    blog_titles.append(title_text)
            
            # 광고 제목 제거
            filtered_titles = []
            for title in blog_titles:
                if not any(ad_word in title.lower() for ad_word in ['광고', '무료출강', '자격증']):
                    filtered_titles.append(title)
            
            return filtered_titles
            
        except requests.RequestException as e:
            raise Exception(f"요청 오류: {e}")
        except Exception as e:
            raise Exception(f"파싱 오류: {e}")

class NaverBlogScrapingGUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.init_ui()
        self.worker = None

    def init_ui(self):
        """UI 초기화"""
        self.setWindowTitle("네이버 블로그 제목 크롤링")
        self.setGeometry(100, 100, 800, 600)
        
        # 중앙 위젯 설정
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # 메인 레이아웃
        main_layout = QVBoxLayout(central_widget)
        main_layout.setSpacing(10)
        main_layout.setContentsMargins(20, 20, 20, 20)
        
        # 제목 라벨
        title_label = QLabel("네이버 블로그 제목 크롤링")
        title_label.setFont(QFont("Arial", 16, QFont.Bold))
        title_label.setAlignment(Qt.AlignCenter)
        title_label.setStyleSheet("color: #2c3e50; margin-bottom: 10px;")
        main_layout.addWidget(title_label)
        
        # 구분선
        line = QFrame()
        line.setFrameShape(QFrame.HLine)
        line.setFrameShadow(QFrame.Sunken)
        main_layout.addWidget(line)
        
        # 검색 입력 영역
        search_layout = QHBoxLayout()
        
        search_label = QLabel("검색어:")
        search_label.setFont(QFont("Arial", 10))
        search_label.setMinimumWidth(60)
        search_layout.addWidget(search_label)
        
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("검색할 키워드를 입력하세요 (예: ChatGPT사용법)")
        self.search_input.setFont(QFont("Arial", 10))
        self.search_input.setStyleSheet("""
            QLineEdit {
                padding: 8px;
                border: 2px solid #bdc3c7;
                border-radius: 5px;
                font-size: 12px;
            }
            QLineEdit:focus {
                border-color: #3498db;
            }
        """)
        self.search_input.returnPressed.connect(self.start_scraping)
        search_layout.addWidget(self.search_input)
        
        self.search_button = QPushButton("크롤링 시작")
        self.search_button.setFont(QFont("Arial", 10, QFont.Bold))
        self.search_button.setStyleSheet("""
            QPushButton {
                background-color: #3498db;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 5px;
                font-size: 12px;
            }
            QPushButton:hover {
                background-color: #2980b9;
            }
            QPushButton:pressed {
                background-color: #21618c;
            }
            QPushButton:disabled {
                background-color: #bdc3c7;
            }
        """)
        self.search_button.clicked.connect(self.start_scraping)
        search_layout.addWidget(self.search_button)
        
        main_layout.addLayout(search_layout)
        
        # 진행 상태 표시
        self.progress_label = QLabel("대기 중...")
        self.progress_label.setFont(QFont("Arial", 9))
        self.progress_label.setStyleSheet("color: #7f8c8d; margin-top: 5px;")
        main_layout.addWidget(self.progress_label)
        
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setStyleSheet("""
            QProgressBar {
                border: 2px solid #bdc3c7;
                border-radius: 5px;
                text-align: center;
            }
            QProgressBar::chunk {
                background-color: #3498db;
                border-radius: 3px;
            }
        """)
        main_layout.addWidget(self.progress_bar)
        
        # 결과 표시 영역
        results_label = QLabel("크롤링 결과:")
        results_label.setFont(QFont("Arial", 12, QFont.Bold))
        results_label.setStyleSheet("color: #2c3e50; margin-top: 10px;")
        main_layout.addWidget(results_label)
        
        self.results_text = QTextEdit()
        self.results_text.setFont(QFont("Arial", 10))
        self.results_text.setStyleSheet("""
            QTextEdit {
                border: 2px solid #bdc3c7;
                border-radius: 5px;
                padding: 10px;
                background-color: #f8f9fa;
            }
        """)
        self.results_text.setPlaceholderText("여기에 크롤링된 블로그 제목들이 표시됩니다...")
        main_layout.addWidget(self.results_text)
        
        # 하단 버튼 영역
        button_layout = QHBoxLayout()
        
        self.clear_button = QPushButton("결과 지우기")
        self.clear_button.setFont(QFont("Arial", 9))
        self.clear_button.setStyleSheet("""
            QPushButton {
                background-color: #e74c3c;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 3px;
            }
            QPushButton:hover {
                background-color: #c0392b;
            }
        """)
        self.clear_button.clicked.connect(self.clear_results)
        button_layout.addWidget(self.clear_button)
        
        button_layout.addStretch()
        
        self.save_button = QPushButton("결과 저장")
        self.save_button.setFont(QFont("Arial", 9))
        self.save_button.setStyleSheet("""
            QPushButton {
                background-color: #27ae60;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 3px;
            }
            QPushButton:hover {
                background-color: #229954;
            }
        """)
        self.save_button.clicked.connect(self.save_results)
        button_layout.addWidget(self.save_button)
        
        main_layout.addLayout(button_layout)
        
        # 기본 검색어 설정
        self.search_input.setText("ChatGPT사용법")

    def start_scraping(self):
        """크롤링 시작"""
        search_query = self.search_input.text().strip()
        
        if not search_query:
            QMessageBox.warning(self, "경고", "검색어를 입력해주세요.")
            return
        
        # UI 상태 변경
        self.search_button.setEnabled(False)
        self.search_button.setText("크롤링 중...")
        self.progress_bar.setVisible(True)
        self.progress_bar.setRange(0, 0)  # 무한 진행바
        self.results_text.clear()
        
        # 워커 스레드 시작
        self.worker = ScrapingWorker(search_query)
        self.worker.finished.connect(self.on_scraping_finished)
        self.worker.error.connect(self.on_scraping_error)
        self.worker.progress.connect(self.on_progress_update)
        self.worker.start()

    def on_progress_update(self, message):
        """진행 상태 업데이트"""
        self.progress_label.setText(message)

    def on_scraping_finished(self, titles):
        """크롤링 완료 처리"""
        self.reset_ui_state()
        
        if titles:
            result_text = f"총 {len(titles)}개의 블로그 제목을 찾았습니다:\n\n"
            for i, title in enumerate(titles, 1):
                result_text += f"{i}. {title}\n"
            
            self.results_text.setText(result_text)
            self.progress_label.setText(f"크롤링 완료! {len(titles)}개의 제목을 찾았습니다.")
        else:
            self.results_text.setText("검색 결과가 없습니다.")
            self.progress_label.setText("검색 결과 없음")

    def on_scraping_error(self, error_message):
        """크롤링 오류 처리"""
        self.reset_ui_state()
        QMessageBox.critical(self, "오류", error_message)
        self.progress_label.setText("오류 발생")

    def reset_ui_state(self):
        """UI 상태 초기화"""
        self.search_button.setEnabled(True)
        self.search_button.setText("크롤링 시작")
        self.progress_bar.setVisible(False)

    def clear_results(self):
        """결과 지우기"""
        self.results_text.clear()
        self.progress_label.setText("대기 중...")

    def save_results(self):
        """결과 저장"""
        content = self.results_text.toPlainText()
        if not content:
            QMessageBox.information(self, "알림", "저장할 내용이 없습니다.")
            return
        
        try:
            filename = f"네이버블로그제목_{time.strftime('%Y%m%d_%H%M%S')}.txt"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            QMessageBox.information(self, "저장 완료", f"결과가 {filename} 파일에 저장되었습니다.")
        except Exception as e:
            QMessageBox.critical(self, "저장 오류", f"파일 저장 중 오류가 발생했습니다: {str(e)}")

def main():
    app = QApplication(sys.argv)
    app.setStyle('Fusion')  # 모던한 스타일 적용
    
    window = NaverBlogScrapingGUI()
    window.show()
    
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()