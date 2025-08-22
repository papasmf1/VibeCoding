# demoClass.py 

# 클래스 정의
class Developer:
    def __init__(self, name, language):
        self.name = name
        self.language = language

    def display_info(self):
        print(f"Developer Name: {self.name}, Language: {self.language}")

# 인스턴스 생성
dev = Developer("전우치", "Python")
dev.display_info()