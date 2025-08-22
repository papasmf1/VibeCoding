import sys
import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
import time
import os
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QLabel, QLineEdit, QPushButton, 
                             QTextEdit, QTableWidget, QTableWidgetItem, 
                             QHeaderView, QMessageBox, QProgressBar, QSpinBox,
                             QGroupBox, QGridLayout, QFileDialog, QSplitter)
from PyQt5.QtCore import QThread, pyqtSignal, Qt
from PyQt5.QtGui import QFont, QIcon

class CrawlerThread(QThread):
    """
    크롤링 작업을 별도 스레드에서 실행하는 클래스
    """
    progress_signal = pyqtSignal(str)
    finished_signal = pyqtSignal(pd.DataFrame)
    error_signal = pyqtSignal(str)
    
    def __init__(self, max_pages=1):
        super().__init__()
        self.max_pages = max_pages
        self.is_running = True
    
    def run(self):
        try:
            all_stock_data = []
            
            for page in range(1, self.max_pages + 1):
                if not self.is_running:
                    break
                    
                self.progress_signal.emit(f"{page}페이지 크롤링 중...")
                
                url = f"https://finance.naver.com/sise/entryJongmok.naver?type=KPI200&page={page}"
                
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
                
                response = requests.get(url, headers=headers)
                response.encoding = 'euc-kr'
                
                soup = BeautifulSoup(response.text, 'html.parser')
                target_table = soup.find('table', {'class': 'type_1'})
                
                if not target_table:
                    self.progress_signal.emit(f"{page}페이지에서 테이블을 찾을 수 없습니다.")
                    continue
                
                rows = target_table.find_all('tr')
                page_stock_data = []
                
                for row in rows:
                    if not self.is_running:
                        break
                        
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
                            self.progress_signal.emit(f"종목 추가: {row_data[0]} - {row_data[1]}원")
                
                if page_stock_data:
                    all_stock_data.extend(page_stock_data)
                    self.progress_signal.emit(f"{page}페이지에서 {len(page_stock_data)}개 종목 데이터를 수집했습니다.")
                else:
                    self.progress_signal.emit(f"{page}페이지에서 종목 데이터를 찾을 수 없습니다.")
                
                # 페이지 간 딜레이
                time.sleep(1)
            
            if all_stock_data:
                df = pd.DataFrame(all_stock_data)
                self.finished_signal.emit(df)
            else:
                self.error_signal.emit("수집된 데이터가 없습니다.")
                
        except Exception as e:
            self.error_signal.emit(f"크롤링 중 오류 발생: {str(e)}")
    
    def stop(self):
        self.is_running = False

class Kospi200CrawlerGUI(QMainWindow):
    """
    코스피200 편입종목상위 크롤러 GUI 클래스
    """
    def __init__(self):
        super().__init__()
        self.crawler_thread = None
        self.current_data = None
        self.init_ui()
    
    def init_ui(self):
        """UI 초기화"""
        self.setWindowTitle('코스피200 편입종목상위 크롤러')
        self.setGeometry(100, 100, 1200, 800)
        
        # 중앙 위젯 설정
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # 메인 레이아웃
        main_layout = QVBoxLayout(central_widget)
        
        # 상단 검색 영역
        self.create_search_area(main_layout)
        
        # 크롤링 설정 영역
        self.create_crawler_settings(main_layout)
        
        # 진행 상황 표시 영역
        self.create_progress_area(main_layout)
        
        # 데이터 표시 영역 (테이블과 로그를 분할)
        self.create_data_display_area(main_layout)
        
        # 하단 버튼 영역
        self.create_button_area(main_layout)
    
    def create_search_area(self, parent_layout):
        """검색 영역 생성"""
        search_group = QGroupBox("종목 검색")
        search_layout = QHBoxLayout()
        
        # 검색 라벨
        search_label = QLabel("종목명:")
        search_label.setFont(QFont("Arial", 10))
        
        # 검색 입력창
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("검색할 종목명을 입력하세요 (예: 삼성전자)")
        self.search_input.setFont(QFont("Arial", 10))
        self.search_input.returnPressed.connect(self.search_stock)
        
        # 검색 버튼
        self.search_button = QPushButton("검색")
        self.search_button.setFont(QFont("Arial", 10))
        self.search_button.clicked.connect(self.search_stock)
        
        # 검색 결과 라벨
        self.search_result_label = QLabel("")
        self.search_result_label.setFont(QFont("Arial", 10))
        self.search_result_label.setStyleSheet("color: blue;")
        
        search_layout.addWidget(search_label)
        search_layout.addWidget(self.search_input)
        search_layout.addWidget(self.search_button)
        search_layout.addWidget(self.search_result_label)
        search_layout.addStretch()
        
        search_group.setLayout(search_layout)
        parent_layout.addWidget(search_group)
    
    def create_crawler_settings(self, parent_layout):
        """크롤러 설정 영역 생성"""
        settings_group = QGroupBox("크롤링 설정")
        settings_layout = QHBoxLayout()
        
        # 페이지 수 설정
        page_label = QLabel("크롤링할 페이지 수:")
        page_label.setFont(QFont("Arial", 10))
        
        self.page_spinbox = QSpinBox()
        self.page_spinbox.setRange(1, 20)
        self.page_spinbox.setValue(1)
        self.page_spinbox.setFont(QFont("Arial", 10))
        
        # 크롤링 버튼
        self.crawl_button = QPushButton("크롤링 시작")
        self.crawl_button.setFont(QFont("Arial", 10, QFont.Bold))
        self.crawl_button.clicked.connect(self.start_crawling)
        
        # 중지 버튼
        self.stop_button = QPushButton("중지")
        self.stop_button.setFont(QFont("Arial", 10))
        self.stop_button.clicked.connect(self.stop_crawling)
        self.stop_button.setEnabled(False)
        
        settings_layout.addWidget(page_label)
        settings_layout.addWidget(self.page_spinbox)
        settings_layout.addStretch()
        settings_layout.addWidget(self.crawl_button)
        settings_layout.addWidget(self.stop_button)
        
        settings_group.setLayout(settings_layout)
        parent_layout.addWidget(settings_group)
    
    def create_progress_area(self, parent_layout):
        """진행 상황 표시 영역 생성"""
        progress_group = QGroupBox("진행 상황")
        progress_layout = QVBoxLayout()
        
        # 진행 상황 텍스트
        self.progress_text = QTextEdit()
        self.progress_text.setMaximumHeight(100)
        self.progress_text.setFont(QFont("Consolas", 9))
        self.progress_text.setReadOnly(True)
        
        # 진행률 바
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        
        progress_layout.addWidget(self.progress_text)
        progress_layout.addWidget(self.progress_bar)
        
        progress_group.setLayout(progress_layout)
        parent_layout.addWidget(progress_group)
    
    def create_data_display_area(self, parent_layout):
        """데이터 표시 영역 생성"""
        # 분할 위젯 생성
        splitter = QSplitter(Qt.Horizontal)
        
        # 테이블 위젯
        self.table_widget = QTableWidget()
        self.table_widget.setFont(QFont("Arial", 9))
        self.table_widget.setAlternatingRowColors(True)
        
        # 로그 위젯
        log_group = QGroupBox("크롤링 로그")
        log_layout = QVBoxLayout()
        
        self.log_text = QTextEdit()
        self.log_text.setFont(QFont("Consolas", 9))
        self.log_text.setReadOnly(True)
        
        log_layout.addWidget(self.log_text)
        log_group.setLayout(log_layout)
        
        splitter.addWidget(self.table_widget)
        splitter.addWidget(log_group)
        splitter.setSizes([800, 400])  # 초기 크기 설정
        
        parent_layout.addWidget(splitter)
    
    def create_button_area(self, parent_layout):
        """하단 버튼 영역 생성"""
        button_layout = QHBoxLayout()
        
        # CSV 저장 버튼
        self.save_button = QPushButton("CSV 저장")
        self.save_button.setFont(QFont("Arial", 10))
        self.save_button.clicked.connect(self.save_to_csv)
        self.save_button.setEnabled(False)
        
        # 엑셀 저장 버튼
        self.excel_button = QPushButton("엑셀에 저장")
        self.excel_button.setFont(QFont("Arial", 10))
        self.excel_button.clicked.connect(self.save_to_excel)
        self.excel_button.setEnabled(False)
        
        # 테이블 새로고침 버튼
        self.refresh_button = QPushButton("테이블 새로고침")
        self.refresh_button.setFont(QFont("Arial", 10))
        self.refresh_button.clicked.connect(self.refresh_table)
        self.refresh_button.setEnabled(False)
        
        # 종료 버튼
        self.quit_button = QPushButton("종료")
        self.quit_button.setFont(QFont("Arial", 10))
        self.quit_button.clicked.connect(self.close)
        
        button_layout.addWidget(self.save_button)
        button_layout.addWidget(self.excel_button)
        button_layout.addWidget(self.refresh_button)
        button_layout.addStretch()
        button_layout.addWidget(self.quit_button)
        
        parent_layout.addLayout(button_layout)
    
    def search_stock(self):
        """종목 검색 기능"""
        search_term = self.search_input.text().strip()
        if not search_term:
            QMessageBox.warning(self, "경고", "검색할 종목명을 입력하세요.")
            return
        
        if self.current_data is None:
            QMessageBox.warning(self, "경고", "먼저 데이터를 크롤링해주세요.")
            return
        
        # 데이터에서 검색
        filtered_data = self.current_data[self.current_data['종목명'].str.contains(search_term, case=False, na=False)]
        
        if len(filtered_data) > 0:
            self.display_data(filtered_data)
            self.search_result_label.setText(f"'{search_term}' 검색 결과: {len(filtered_data)}개 종목")
        else:
            self.search_result_label.setText(f"'{search_term}' 검색 결과: 없음")
            QMessageBox.information(self, "검색 결과", f"'{search_term}'에 해당하는 종목을 찾을 수 없습니다.")
    
    def start_crawling(self):
        """크롤링 시작"""
        max_pages = self.page_spinbox.value()
        
        # UI 상태 변경
        self.crawl_button.setEnabled(False)
        self.stop_button.setEnabled(True)
        self.progress_bar.setVisible(True)
        self.progress_bar.setRange(0, max_pages)
        self.progress_bar.setValue(0)
        
        # 로그 초기화
        self.log_text.clear()
        self.progress_text.clear()
        self.log_text.append(f"크롤링 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # 크롤링 스레드 시작
        self.crawler_thread = CrawlerThread(max_pages)
        self.crawler_thread.progress_signal.connect(self.update_progress)
        self.crawler_thread.finished_signal.connect(self.crawling_finished)
        self.crawler_thread.error_signal.connect(self.crawling_error)
        self.crawler_thread.start()
    
    def stop_crawling(self):
        """크롤링 중지"""
        if self.crawler_thread and self.crawler_thread.isRunning():
            self.crawler_thread.stop()
            self.crawler_thread.wait()
            self.log_text.append("크롤링이 중지되었습니다.")
        
        # UI 상태 복원
        self.crawl_button.setEnabled(True)
        self.stop_button.setEnabled(False)
        self.progress_bar.setVisible(False)
    
    def update_progress(self, message):
        """진행 상황 업데이트"""
        self.progress_text.append(message)
        self.log_text.append(message)
        
        # 스크롤을 맨 아래로
        self.progress_text.verticalScrollBar().setValue(
            self.progress_text.verticalScrollBar().maximum()
        )
        self.log_text.verticalScrollBar().setValue(
            self.log_text.verticalScrollBar().maximum()
        )
    
    def crawling_finished(self, df):
        """크롤링 완료 처리"""
        self.current_data = df
        self.display_data(df)
        
        self.log_text.append(f"크롤링 완료: {len(df)}개 종목 데이터 수집")
        self.log_text.append(f"완료 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # UI 상태 복원
        self.crawl_button.setEnabled(True)
        self.stop_button.setEnabled(False)
        self.progress_bar.setVisible(False)
        
        # 버튼 활성화
        self.save_button.setEnabled(True)
        self.excel_button.setEnabled(True)
        self.refresh_button.setEnabled(True)
        
        QMessageBox.information(self, "완료", f"크롤링이 완료되었습니다.\n총 {len(df)}개 종목 데이터를 수집했습니다.")
    
    def crawling_error(self, error_message):
        """크롤링 오류 처리"""
        self.log_text.append(f"오류: {error_message}")
        
        # UI 상태 복원
        self.crawl_button.setEnabled(True)
        self.stop_button.setEnabled(False)
        self.progress_bar.setVisible(False)
        
        QMessageBox.critical(self, "오류", f"크롤링 중 오류가 발생했습니다:\n{error_message}")
    
    def display_data(self, df):
        """데이터를 테이블에 표시"""
        if df is None or df.empty:
            return
        
        # 테이블 설정
        self.table_widget.setRowCount(len(df))
        self.table_widget.setColumnCount(len(df.columns))
        self.table_widget.setHorizontalHeaderLabels(df.columns)
        
        # 데이터 채우기
        for i, row in df.iterrows():
            for j, value in enumerate(row):
                item = QTableWidgetItem(str(value))
                item.setTextAlignment(Qt.AlignCenter)
                self.table_widget.setItem(i, j, item)
        
        # 컬럼 크기 자동 조정
        header = self.table_widget.horizontalHeader()
        for i in range(len(df.columns)):
            header.setSectionResizeMode(i, QHeaderView.ResizeToContents)
    
    def save_to_csv(self):
        """CSV 파일로 저장"""
        if self.current_data is None:
            QMessageBox.warning(self, "경고", "저장할 데이터가 없습니다.")
            return
        
        # 파일 저장 다이얼로그
        filename, _ = QFileDialog.getSaveFileName(
            self, 
            "CSV 파일 저장", 
            f"kospi200_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
            "CSV Files (*.csv)"
        )
        
        if filename:
            try:
                self.current_data.to_csv(filename, index=False, encoding='utf-8-sig')
                QMessageBox.information(self, "저장 완료", f"데이터가 {filename}에 저장되었습니다.")
                self.log_text.append(f"CSV 파일 저장: {filename}")
            except Exception as e:
                QMessageBox.critical(self, "저장 오류", f"파일 저장 중 오류가 발생했습니다:\n{str(e)}")
    
    def save_to_excel(self):
        """엑셀 파일로 저장"""
        if self.current_data is None:
            QMessageBox.warning(self, "경고", "저장할 데이터가 없습니다.")
            return
        
        # 파일 저장 다이얼로그
        filename, _ = QFileDialog.getSaveFileName(
            self, 
            "엑셀 파일 저장", 
            f"kospi200_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx",
            "Excel Files (*.xlsx)"
        )
        
        if filename:
            try:
                # 엑셀 파일로 저장
                with pd.ExcelWriter(filename, engine='openpyxl') as writer:
                    # 메인 데이터 시트
                    self.current_data.to_excel(writer, sheet_name='코스피200_편입종목', index=False)
                    
                    # 워크시트 가져오기
                    worksheet = writer.sheets['코스피200_편입종목']
                    
                    # 컬럼 너비 자동 조정
                    for column in worksheet.columns:
                        max_length = 0
                        column_letter = column[0].column_letter
                        
                        for cell in column:
                            try:
                                if len(str(cell.value)) > max_length:
                                    max_length = len(str(cell.value))
                            except:
                                pass
                        
                        adjusted_width = min(max_length + 2, 50)  # 최대 50자로 제한
                        worksheet.column_dimensions[column_letter].width = adjusted_width
                    
                    # 헤더 스타일링
                    from openpyxl.styles import Font, PatternFill, Alignment
                    
                    header_font = Font(bold=True, color="FFFFFF")
                    header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
                    header_alignment = Alignment(horizontal="center", vertical="center")
                    
                    for cell in worksheet[1]:
                        cell.font = header_font
                        cell.fill = header_fill
                        cell.alignment = header_alignment
                    
                    # 요약 정보 시트 추가
                    summary_data = {
                        '항목': ['총 종목 수', '크롤링 시간', '데이터 수집일'],
                        '값': [
                            len(self.current_data),
                            datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                            datetime.now().strftime('%Y-%m-%d')
                        ]
                    }
                    
                    summary_df = pd.DataFrame(summary_data)
                    summary_df.to_excel(writer, sheet_name='요약정보', index=False)
                    
                    # 요약 시트 스타일링
                    summary_worksheet = writer.sheets['요약정보']
                    for column in summary_worksheet.columns:
                        max_length = 0
                        column_letter = column[0].column_letter
                        
                        for cell in column:
                            try:
                                if len(str(cell.value)) > max_length:
                                    max_length = len(str(cell.value))
                            except:
                                pass
                        
                        adjusted_width = min(max_length + 2, 30)
                        summary_worksheet.column_dimensions[column_letter].width = adjusted_width
                    
                    # 요약 시트 헤더 스타일링
                    for cell in summary_worksheet[1]:
                        cell.font = header_font
                        cell.fill = header_fill
                        cell.alignment = header_alignment
                
                QMessageBox.information(self, "저장 완료", f"데이터가 {filename}에 저장되었습니다.\n\n엑셀 파일에는 다음이 포함됩니다:\n- 코스피200_편입종목 시트: 상세 데이터\n- 요약정보 시트: 데이터 요약")
                self.log_text.append(f"엑셀 파일 저장: {filename}")
                
            except Exception as e:
                QMessageBox.critical(self, "저장 오류", f"엑셀 파일 저장 중 오류가 발생했습니다:\n{str(e)}")
                self.log_text.append(f"엑셀 저장 오류: {str(e)}")
    
    def refresh_table(self):
        """테이블 새로고침"""
        if self.current_data is not None:
            self.display_data(self.current_data)
            self.log_text.append("테이블이 새로고침되었습니다.")

def main():
    """메인 함수"""
    app = QApplication(sys.argv)
    app.setApplicationName("코스피200 편입종목상위 크롤러")
    
    # 폰트 설정
    font = QFont("Arial", 9)
    app.setFont(font)
    
    # GUI 창 생성 및 표시
    window = Kospi200CrawlerGUI()
    window.show()
    
    sys.exit(app.exec_())

if __name__ == "__main__":
    main() 