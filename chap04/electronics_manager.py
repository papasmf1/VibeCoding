import sys
import sqlite3
import warnings

# PyQt5 deprecation 경고 무시
warnings.filterwarnings("ignore", category=DeprecationWarning, module="PyQt5")

from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QTableWidget, QTableWidgetItem, 
                             QPushButton, QLineEdit, QLabel, QMessageBox, 
                             QHeaderView, QDialog, QFormLayout, QDialogButtonBox)
from PyQt5.QtCore import Qt

class ProductDialog(QDialog):
    def __init__(self, parent=None, product_data=None):
        super().__init__(parent)
        self.setWindowTitle("제품 정보")
        self.setModal(True)
        self.resize(300, 150)
        
        layout = QFormLayout()
        
        self.prod_id_edit = QLineEdit()
        self.prod_name_edit = QLineEdit()
        self.prod_price_edit = QLineEdit()
        
        if product_data:
            self.prod_id_edit.setText(str(product_data[0]))
            self.prod_id_edit.setEnabled(False)  # ID는 수정 불가
            self.prod_name_edit.setText(product_data[1])
            self.prod_price_edit.setText(str(product_data[2]))
        
        layout.addRow("제품 ID:", self.prod_id_edit)
        layout.addRow("제품명:", self.prod_name_edit)
        layout.addRow("가격:", self.prod_price_edit)
        
        buttons = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        
        layout.addRow(buttons)
        self.setLayout(layout)
    
    def get_data(self):
        return {
            'id': int(self.prod_id_edit.text()) if self.prod_id_edit.text() else None,
            'name': self.prod_name_edit.text(),
            'price': int(self.prod_price_edit.text()) if self.prod_price_edit.text() else 0
        }

class ElectronicsManager(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("전자제품 관리 시스템")
        self.setGeometry(100, 100, 800, 600)
        
        # 데이터베이스 초기화
        self.init_database()
        
        # UI 초기화
        self.init_ui()
        
        # 데이터 로드
        self.load_data()
    
    def init_database(self):
        """데이터베이스 및 테이블 초기화"""
        self.conn = sqlite3.connect('electronics.db')
        cursor = self.conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Products (
                prodID INTEGER PRIMARY KEY,
                prodName TEXT NOT NULL,
                prodPrice INTEGER NOT NULL
            )
        ''')
        self.conn.commit()
    
    def init_ui(self):
        """UI 구성"""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # 메인 레이아웃
        main_layout = QVBoxLayout()
        
        # 상단 버튼 영역
        button_layout = QHBoxLayout()
        
        self.add_btn = QPushButton("추가")
        self.edit_btn = QPushButton("수정")
        self.delete_btn = QPushButton("삭제")
        self.search_btn = QPushButton("검색")
        self.refresh_btn = QPushButton("새로고침")
        
        # 검색 입력창
        self.search_edit = QLineEdit()
        self.search_edit.setPlaceholderText("제품명으로 검색...")
        
        button_layout.addWidget(self.add_btn)
        button_layout.addWidget(self.edit_btn)
        button_layout.addWidget(self.delete_btn)
        button_layout.addWidget(QLabel("검색:"))
        button_layout.addWidget(self.search_edit)
        button_layout.addWidget(self.search_btn)
        button_layout.addWidget(self.refresh_btn)
        button_layout.addStretch()
        
        # 테이블 위젯
        self.table = QTableWidget()
        self.table.setColumnCount(3)
        self.table.setHorizontalHeaderLabels(["제품 ID", "제품명", "가격"])
        
        # 테이블 헤더 크기 조정
        header = self.table.horizontalHeader()
        header.setSectionResizeMode(0, QHeaderView.ResizeToContents)
        header.setSectionResizeMode(1, QHeaderView.Stretch)
        header.setSectionResizeMode(2, QHeaderView.ResizeToContents)
        
        # 레이아웃 구성
        main_layout.addLayout(button_layout)
        main_layout.addWidget(self.table)
        
        central_widget.setLayout(main_layout)
        
        # 버튼 이벤트 연결
        self.add_btn.clicked.connect(self.add_product)
        self.edit_btn.clicked.connect(self.edit_product)
        self.delete_btn.clicked.connect(self.delete_product)
        self.search_btn.clicked.connect(self.search_products)
        self.refresh_btn.clicked.connect(self.load_data)
        self.search_edit.returnPressed.connect(self.search_products)
    
    def load_data(self):
        """데이터베이스에서 모든 제품 데이터 로드"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT prodID, prodName, prodPrice FROM Products ORDER BY prodID")
        products = cursor.fetchall()
        
        self.populate_table(products)
    
    def populate_table(self, products):
        """테이블에 데이터 표시"""
        self.table.setRowCount(len(products))
        
        for row, product in enumerate(products):
            self.table.setItem(row, 0, QTableWidgetItem(str(product[0])))
            self.table.setItem(row, 1, QTableWidgetItem(product[1]))
            self.table.setItem(row, 2, QTableWidgetItem(f"{product[2]:,}원"))
    
    def add_product(self):
        """제품 추가"""
        dialog = ProductDialog(self)
        if dialog.exec_() == QDialog.Accepted:
            data = dialog.get_data()
            
            if not data['name']:
                QMessageBox.warning(self, "경고", "제품명을 입력해주세요.")
                return
            
            try:
                cursor = self.conn.cursor()
                if data['id']:
                    cursor.execute(
                        "INSERT INTO Products (prodID, prodName, prodPrice) VALUES (?, ?, ?)",
                        (data['id'], data['name'], data['price'])
                    )
                else:
                    cursor.execute(
                        "INSERT INTO Products (prodName, prodPrice) VALUES (?, ?)",
                        (data['name'], data['price'])
                    )
                self.conn.commit()
                self.load_data()
                QMessageBox.information(self, "성공", "제품이 추가되었습니다.")
            except sqlite3.IntegrityError:
                QMessageBox.warning(self, "오류", "이미 존재하는 제품 ID입니다.")
            except Exception as e:
                QMessageBox.critical(self, "오류", f"제품 추가 중 오류가 발생했습니다: {str(e)}")
    
    def edit_product(self):
        """제품 수정"""
        current_row = self.table.currentRow()
        if current_row < 0:
            QMessageBox.warning(self, "경고", "수정할 제품을 선택해주세요.")
            return
        
        prod_id = int(self.table.item(current_row, 0).text())
        prod_name = self.table.item(current_row, 1).text()
        prod_price = int(self.table.item(current_row, 2).text().replace("원", "").replace(",", ""))
        
        dialog = ProductDialog(self, (prod_id, prod_name, prod_price))
        if dialog.exec_() == QDialog.Accepted:
            data = dialog.get_data()
            
            if not data['name']:
                QMessageBox.warning(self, "경고", "제품명을 입력해주세요.")
                return
            
            try:
                cursor = self.conn.cursor()
                cursor.execute(
                    "UPDATE Products SET prodName = ?, prodPrice = ? WHERE prodID = ?",
                    (data['name'], data['price'], prod_id)
                )
                self.conn.commit()
                self.load_data()
                QMessageBox.information(self, "성공", "제품이 수정되었습니다.")
            except Exception as e:
                QMessageBox.critical(self, "오류", f"제품 수정 중 오류가 발생했습니다: {str(e)}")
    
    def delete_product(self):
        """제품 삭제"""
        current_row = self.table.currentRow()
        if current_row < 0:
            QMessageBox.warning(self, "경고", "삭제할 제품을 선택해주세요.")
            return
        
        prod_id = int(self.table.item(current_row, 0).text())
        prod_name = self.table.item(current_row, 1).text()
        
        reply = QMessageBox.question(
            self, "확인", 
            f"'{prod_name}' 제품을 삭제하시겠습니까?",
            QMessageBox.Yes | QMessageBox.No
        )
        
        if reply == QMessageBox.Yes:
            try:
                cursor = self.conn.cursor()
                cursor.execute("DELETE FROM Products WHERE prodID = ?", (prod_id,))
                self.conn.commit()
                self.load_data()
                QMessageBox.information(self, "성공", "제품이 삭제되었습니다.")
            except Exception as e:
                QMessageBox.critical(self, "오류", f"제품 삭제 중 오류가 발생했습니다: {str(e)}")
    
    def search_products(self):
        """제품 검색"""
        search_text = self.search_edit.text().strip()
        
        if not search_text:
            self.load_data()
            return
        
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT prodID, prodName, prodPrice FROM Products WHERE prodName LIKE ? ORDER BY prodID",
            (f"%{search_text}%",)
        )
        products = cursor.fetchall()
        
        self.populate_table(products)
        
        if not products:
            QMessageBox.information(self, "검색 결과", "검색 결과가 없습니다.")
    
    def closeEvent(self, event):
        """애플리케이션 종료 시 데이터베이스 연결 해제"""
        self.conn.close()
        event.accept()

def main():
    app = QApplication(sys.argv)
    window = ElectronicsManager()
    window.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()