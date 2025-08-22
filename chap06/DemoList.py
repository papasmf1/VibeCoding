import os

# 현재 디렉토리의 파일 및 폴더 목록을 가져옵니다.
items = os.listdir('.')

print("현재 폴더의 파일 목록:")

# 목록에서 파일만 필터링하여 출력합니다.
for item in items:
    if os.path.isfile(item):
        print(item)
