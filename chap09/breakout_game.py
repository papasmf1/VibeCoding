import pygame
import sys
import random
import os

pygame.init()

WIDTH = 800
HEIGHT = 600
FPS = 60

BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
ORANGE = (255, 165, 0)
YELLOW = (255, 255, 0)
PURPLE = (128, 0, 128)

def load_korean_font(size=36):
    font_paths = [
        '/System/Library/Fonts/AppleSDGothicNeo.ttc',
        '/System/Library/Fonts/Helvetica.ttc',
        '/Library/Fonts/Arial Unicode.ttf',
        '/System/Library/Fonts/PingFang.ttc',
        '/usr/share/fonts/truetype/nanum/NanumGothic.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    ]
    
    for font_path in font_paths:
        if os.path.exists(font_path):
            try:
                return pygame.font.Font(font_path, size)
            except:
                continue
    
    try:
        return pygame.font.Font(pygame.font.get_default_font(), size)
    except:
        return pygame.font.Font(None, size)

class Paddle:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.width = 100
        self.height = 10
        self.speed = 8
        self.rect = pygame.Rect(x, y, self.width, self.height)
    
    def move_left(self):
        if self.x > 0:
            self.x -= self.speed
            self.rect.x = self.x
    
    def move_right(self):
        if self.x < WIDTH - self.width:
            self.x += self.speed
            self.rect.x = self.x
    
    def draw(self, screen):
        pygame.draw.rect(screen, WHITE, self.rect)

class Ball:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.radius = 10
        self.speed_x = random.choice([-4, 4])
        self.speed_y = -4
        self.rect = pygame.Rect(x - self.radius, y - self.radius, 
                               self.radius * 2, self.radius * 2)
    
    def move(self):
        self.x += self.speed_x
        self.y += self.speed_y
        self.rect.x = self.x - self.radius
        self.rect.y = self.y - self.radius
        
        if self.x <= self.radius or self.x >= WIDTH - self.radius:
            self.speed_x = -self.speed_x
        
        if self.y <= self.radius:
            self.speed_y = -self.speed_y
    
    def draw(self, screen):
        pygame.draw.circle(screen, WHITE, (int(self.x), int(self.y)), self.radius)
    
    def reset(self):
        self.x = WIDTH // 2
        self.y = HEIGHT // 2
        self.speed_x = random.choice([-4, 4])
        self.speed_y = -4

class Block:
    def __init__(self, x, y, color):
        self.x = x
        self.y = y
        self.width = 75
        self.height = 30
        self.color = color
        self.rect = pygame.Rect(x, y, self.width, self.height)
        self.destroyed = False
    
    def draw(self, screen):
        if not self.destroyed:
            pygame.draw.rect(screen, self.color, self.rect)
            pygame.draw.rect(screen, BLACK, self.rect, 2)

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption("블럭깨기")
        self.clock = pygame.time.Clock()
        
        self.paddle = Paddle(WIDTH // 2 - 50, HEIGHT - 50)
        self.ball = Ball(WIDTH // 2, HEIGHT // 2)
        self.blocks = []
        self.score = 0
        self.lives = 3
        self.font = load_korean_font(36)
        
        self.create_blocks()
    
    def create_blocks(self):
        colors = [RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE]
        for row in range(6):
            for col in range(10):
                x = col * 80 + 5
                y = row * 35 + 50
                color = colors[row % len(colors)]
                block = Block(x, y, color)
                self.blocks.append(block)
    
    def handle_collisions(self):
        if self.ball.rect.colliderect(self.paddle.rect):
            self.ball.speed_y = -abs(self.ball.speed_y)
            hit_pos = (self.ball.x - self.paddle.x) / self.paddle.width
            self.ball.speed_x = (hit_pos - 0.5) * 8
        
        for block in self.blocks:
            if not block.destroyed and self.ball.rect.colliderect(block.rect):
                block.destroyed = True
                self.ball.speed_y = -self.ball.speed_y
                self.score += 10
                break
    
    def check_game_over(self):
        if self.ball.y > HEIGHT:
            self.lives -= 1
            if self.lives > 0:
                self.ball.reset()
            else:
                return True
        
        active_blocks = [block for block in self.blocks if not block.destroyed]
        if not active_blocks:
            return True
        
        return False
    
    def draw(self):
        self.screen.fill(BLACK)
        
        self.paddle.draw(self.screen)
        self.ball.draw(self.screen)
        
        for block in self.blocks:
            block.draw(self.screen)
        
        score_text = self.font.render(f"점수: {self.score}", True, WHITE)
        lives_text = self.font.render(f"생명: {self.lives}", True, WHITE)
        self.screen.blit(score_text, (10, 10))
        self.screen.blit(lives_text, (10, 50))
        
        pygame.display.flip()
    
    def run(self):
        running = True
        
        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
            
            keys = pygame.key.get_pressed()
            if keys[pygame.K_LEFT]:
                self.paddle.move_left()
            if keys[pygame.K_RIGHT]:
                self.paddle.move_right()
            
            self.ball.move()
            self.handle_collisions()
            
            if self.check_game_over():
                game_over_text = self.font.render("게임 오버! 스페이스바를 누르면 재시작", True, WHITE)
                text_rect = game_over_text.get_rect(center=(WIDTH//2, HEIGHT//2))
                self.screen.blit(game_over_text, text_rect)
                pygame.display.flip()
                
                waiting = True
                while waiting:
                    for event in pygame.event.get():
                        if event.type == pygame.QUIT:
                            pygame.quit()
                            sys.exit()
                        if event.type == pygame.KEYDOWN:
                            if event.key == pygame.K_SPACE:
                                self.__init__()
                                waiting = False
            
            self.draw()
            self.clock.tick(FPS)
        
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = Game()
    game.run()