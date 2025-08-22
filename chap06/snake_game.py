
import pygame
import random
import sys

# --- 초기화 ---
pygame.init()

# --- 화면 설정 ---
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("파란 뱀 게임")

# --- 색상 정의 ---
BLUE = (0, 0, 255)
RED = (255, 0, 0)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

# --- 게임 설정 ---
BLOCK_SIZE = 20
SNAKE_SPEED = 15

clock = pygame.time.Clock()
font = pygame.font.SysFont("malgungothic", 35)

# --- 함수 정의 ---

def draw_grid():
    """배경에 격자를 그립니다 (선택 사항)"""
    for x in range(0, SCREEN_WIDTH, BLOCK_SIZE):
        pygame.draw.line(screen, (240, 240, 240), (x, 0), (x, SCREEN_HEIGHT))
    for y in range(0, SCREEN_HEIGHT, BLOCK_SIZE):
        pygame.draw.line(screen, (240, 240, 240), (0, y), (SCREEN_WIDTH, y))

def draw_snake(snake_list):
    """뱀을 화면에 그립니다."""
    for segment in snake_list:
        pygame.draw.rect(screen, BLUE, segment)

def draw_apple(apple_pos):
    """사과를 화면에 그립니다."""
    pygame.draw.rect(screen, RED, apple_pos)

def show_score(score):
    """점수를 화면에 표시합니다."""
    score_text = font.render(f"점수: {score}", True, BLACK)
    screen.blit(score_text, [10, 10])

def game_over_screen(score):
    """게임 오버 화면을 표시합니다."""
    screen.fill(WHITE)
    game_over_text = font.render("게임 오버!", True, BLACK)
    final_score_text = font.render(f"최종 점수: {score}", True, BLACK)
    restart_text = font.render("다시 시작하려면 'R' 키를 누르세요.", True, BLACK)

    screen.blit(game_over_text, (SCREEN_WIDTH / 2 - game_over_text.get_width() / 2, SCREEN_HEIGHT / 3))
    screen.blit(final_score_text, (SCREEN_WIDTH / 2 - final_score_text.get_width() / 2, SCREEN_HEIGHT / 2))
    screen.blit(restart_text, (SCREEN_WIDTH / 2 - restart_text.get_width() / 2, SCREEN_HEIGHT * 2 / 3))
    pygame.display.flip()

    waiting = True
    while waiting:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_r:
                    waiting = False
                if event.key == pygame.K_q:
                    pygame.quit()
                    sys.exit()


def game_loop():
    """메인 게임 루프"""
    game_over = False
    game_exit = False

    # 뱀 초기 위치 및 상태
    lead_x = SCREEN_WIDTH / 2
    lead_y = SCREEN_HEIGHT / 2
    lead_x_change = 0
    lead_y_change = 0
    snake_list = []
    snake_length = 1

    # 사과 초기 위치
    apple_x = round(random.randrange(0, SCREEN_WIDTH - BLOCK_SIZE) / BLOCK_SIZE) * BLOCK_SIZE
    apple_y = round(random.randrange(0, SCREEN_HEIGHT - BLOCK_SIZE) / BLOCK_SIZE) * BLOCK_SIZE
    apple = pygame.Rect(apple_x, apple_y, BLOCK_SIZE, BLOCK_SIZE)

    score = 0

    while not game_exit:

        while game_over:
            game_over_screen(score)
            # 게임 오버 화면에서 빠져나오면 게임을 재시작
            game_loop()

        # --- 이벤트 처리 ---
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                game_exit = True
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_LEFT and lead_x_change == 0:
                    lead_x_change = -BLOCK_SIZE
                    lead_y_change = 0
                elif event.key == pygame.K_RIGHT and lead_x_change == 0:
                    lead_x_change = BLOCK_SIZE
                    lead_y_change = 0
                elif event.key == pygame.K_UP and lead_y_change == 0:
                    lead_y_change = -BLOCK_SIZE
                    lead_x_change = 0
                elif event.key == pygame.K_DOWN and lead_y_change == 0:
                    lead_y_change = BLOCK_SIZE
                    lead_x_change = 0

        # --- 게임 로직 ---

        # 뱀 위치 업데이트
        lead_x += lead_x_change
        lead_y += lead_y_change

        # 벽 충돌 확인
        if lead_x >= SCREEN_WIDTH or lead_x < 0 or lead_y >= SCREEN_HEIGHT or lead_y < 0:
            game_over = True

        # 뱀 머리 생성
        snake_head = pygame.Rect(lead_x, lead_y, BLOCK_SIZE, BLOCK_SIZE)
        snake_list.append(snake_head)

        # 뱀 길이 조절
        if len(snake_list) > snake_length:
            del snake_list[0]

        # 뱀 자기 자신과 충돌 확인
        for segment in snake_list[:-1]:
            if segment == snake_head:
                game_over = True

        # 사과와 충돌 확인
        if snake_head.colliderect(apple):
            apple_x = round(random.randrange(0, SCREEN_WIDTH - BLOCK_SIZE) / BLOCK_SIZE) * BLOCK_SIZE
            apple_y = round(random.randrange(0, SCREEN_HEIGHT - BLOCK_SIZE) / BLOCK_SIZE) * BLOCK_SIZE
            apple.topleft = (apple_x, apple_y)
            snake_length += 1
            score += 10

        # --- 그리기 ---
        screen.fill(WHITE)
        # draw_grid() # 격자 표시를 원하면 주석 해제
        draw_apple(apple)
        draw_snake(snake_list)
        show_score(score)

        pygame.display.flip()

        # --- 게임 속도 조절 ---
        clock.tick(SNAKE_SPEED)

    pygame.quit()
    sys.exit()

if __name__ == '__main__':
    game_loop()
