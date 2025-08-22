import pygame
import sys
import random

# 초기화
pygame.init()

# 색상 정의
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
ORANGE = (255, 165, 0)
YELLOW = (255, 255, 0)
PURPLE = (128, 0, 128)

# 화면 설정
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("블럭깨기 게임")

# 게임 변수
clock = pygame.time.Clock()
FPS = 60

class Paddle:
    def __init__(self):
        self.width = 100
        self.height = 15
        self.x = SCREEN_WIDTH // 2 - self.width // 2
        self.y = SCREEN_HEIGHT - 50
        self.speed = 8
        
    def move(self, direction):
        if direction == "left" and self.x > 0:
            self.x -= self.speed
        elif direction == "right" and self.x < SCREEN_WIDTH - self.width:
            self.x += self.speed
    
    def draw(self, surface):
        pygame.draw.rect(surface, BLUE, (self.x, self.y, self.width, self.height))
    
    def get_rect(self):
        return pygame.Rect(self.x, self.y, self.width, self.height)

class Ball:
    def __init__(self):
        self.radius = 10
        self.x = SCREEN_WIDTH // 2
        self.y = SCREEN_HEIGHT // 2
        self.speed_x = random.choice([-5, 5])
        self.speed_y = -5
        
    def move(self):
        self.x += self.speed_x
        self.y += self.speed_y
        
        # 벽과 충돌
        if self.x <= self.radius or self.x >= SCREEN_WIDTH - self.radius:
            self.speed_x = -self.speed_x
        if self.y <= self.radius:
            self.speed_y = -self.speed_y
    
    def draw(self, surface):
        pygame.draw.circle(surface, RED, (int(self.x), int(self.y)), self.radius)
    
    def get_rect(self):
        return pygame.Rect(self.x - self.radius, self.y - self.radius, 
                          self.radius * 2, self.radius * 2)
    
    def reset(self):
        self.x = SCREEN_WIDTH // 2
        self.y = SCREEN_HEIGHT // 2
        self.speed_x = random.choice([-5, 5])
        self.speed_y = -5

class Block:
    def __init__(self, x, y, color):
        self.width = 75
        self.height = 30
        self.x = x
        self.y = y
        self.color = color
        self.destroyed = False
    
    def draw(self, surface):
        if not self.destroyed:
            pygame.draw.rect(surface, self.color, (self.x, self.y, self.width, self.height))
            pygame.draw.rect(surface, BLACK, (self.x, self.y, self.width, self.height), 2)
    
    def get_rect(self):
        return pygame.Rect(self.x, self.y, self.width, self.height)

def create_blocks():
    blocks = []
    colors = [RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE]
    
    for row in range(6):
        for col in range(10):
            x = col * 80 + 5
            y = row * 35 + 50
            color = colors[row % len(colors)]
            blocks.append(Block(x, y, color))
    
    return blocks

def check_collision(ball, paddle):
    ball_rect = ball.get_rect()
    paddle_rect = paddle.get_rect()
    
    if ball_rect.colliderect(paddle_rect):
        # 패들과 충돌 시 각도 조정
        ball.speed_y = -abs(ball.speed_y)
        
        # 패들의 어느 부분에 맞았는지에 따라 각도 변경
        hit_pos = (ball.x - paddle.x) / paddle.width
        ball.speed_x = (hit_pos - 0.5) * 10

def main():
    paddle = Paddle()
    ball = Ball()
    blocks = create_blocks()
    
    score = 0
    lives = 3
    font = pygame.font.Font(None, 36)
    
    running = True
    
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
        
        # 키 입력 처리
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            paddle.move("left")
        if keys[pygame.K_RIGHT]:
            paddle.move("right")
        
        # 공 이동
        ball.move()
        
        # 패들과 공 충돌 체크
        check_collision(ball, paddle)
        
        # 블럭과 공 충돌 체크
        ball_rect = ball.get_rect()
        for block in blocks:
            if not block.destroyed and ball_rect.colliderect(block.get_rect()):
                block.destroyed = True
                ball.speed_y = -ball.speed_y
                score += 10
                break
        
        # 공이 바닥에 떨어졌을 때
        if ball.y > SCREEN_HEIGHT:
            lives -= 1
            if lives <= 0:
                # 게임 오버
                print(f"게임 오버! 최종 점수: {score}")
                running = False
            else:
                ball.reset()
        
        # 모든 블럭이 깨졌을 때
        if all(block.destroyed for block in blocks):
            print(f"게임 클리어! 최종 점수: {score}")
            running = False
        
        # 화면 그리기
        screen.fill(WHITE)
        
        # 패들 그리기
        paddle.draw(screen)
        
        # 공 그리기
        ball.draw(screen)
        
        # 블럭 그리기
        for block in blocks:
            block.draw(screen)
        
        # UI 그리기
        score_text = font.render(f"점수: {score}", True, BLACK)
        lives_text = font.render(f"생명: {lives}", True, BLACK)
        screen.blit(score_text, (10, 10))
        screen.blit(lives_text, (10, 50))
        
        pygame.display.flip()
        clock.tick(FPS)
    
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()