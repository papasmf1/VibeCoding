import pygame
import random
import sys

# 게임 초기화
pygame.init()

# 색상 정의
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
CYAN = (0, 255, 255)
BLUE = (0, 0, 255)
ORANGE = (255, 165, 0)
YELLOW = (255, 255, 0)
GREEN = (0, 255, 0)
PURPLE = (128, 0, 128)
RED = (255, 0, 0)
GRAY = (128, 128, 128)

# 게임 설정
BOARD_WIDTH = 10
BOARD_HEIGHT = 20
CELL_SIZE = 30
BOARD_X = 50
BOARD_Y = 50

SCREEN_WIDTH = BOARD_WIDTH * CELL_SIZE + 200
SCREEN_HEIGHT = BOARD_HEIGHT * CELL_SIZE + 100

# 테트리스 블록 정의
SHAPES = [
    [['.....',
      '..#..',
      '.###.',
      '.....',
      '.....'],
     ['.....',
      '.#...',
      '.##..',
      '.#...',
      '.....'],
     ['.....',
      '.....',
      '.###.',
      '..#..',
      '.....'],
     ['.....',
      '..#..',
      '.##..',
      '..#..',
      '.....']],
    [['.....',
      '.....',
      '.##..',
      '.##..',
      '.....']],
    [['.....',
      '.....',
      '.#...',
      '.###.',
      '.....'],
     ['.....',
      '.....',
      '.##..',
      '.#...',
      '.#...'],
     ['.....',
      '.....',
      '.###.',
      '...#.',
      '.....'],
     ['.....',
      '.....',
      '..#..',
      '..#..',
      '.##..']],
    [['.....',
      '.....',
      '...#.',
      '.###.',
      '.....'],
     ['.....',
      '.....',
      '.#...',
      '.#...',
      '.##..'],
     ['.....',
      '.....',
      '.###.',
      '.#...',
      '.....'],
     ['.....',
      '.....',
      '.##..',
      '..#..',
      '..#..']],
    [['.....',
      '.....',
      '.##..',
      '..##.',
      '.....'],
     ['.....',
      '.....',
      '..#..',
      '.##..',
      '.#...']],
    [['.....',
      '.....',
      '..##.',
      '.##..',
      '.....'],
     ['.....',
      '.....',
      '.#...',
      '.##..',
      '..#..']],
    [['.....',
      '.....',
      '.###.',
      '.###.',
      '.....']]
]

SHAPE_COLORS = [CYAN, YELLOW, PURPLE, GREEN, RED, BLUE, ORANGE]

class Piece:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.shape = random.choice(SHAPES)
        self.color = SHAPE_COLORS[SHAPES.index(self.shape)]
        self.rotation = 0

    def get_rotated_shape(self):
        return self.shape[self.rotation % len(self.shape)]

    def rotate(self):
        self.rotation += 1

class Tetris:
    def __init__(self):
        self.board = [[BLACK for _ in range(BOARD_WIDTH)] for _ in range(BOARD_HEIGHT)]
        self.current_piece = self.new_piece()
        self.score = 0
        self.level = 1
        self.lines_cleared = 0
        self.fall_time = 0
        self.fall_speed = 500  # 밀리초

    def new_piece(self):
        return Piece(BOARD_WIDTH // 2 - 2, 0)

    def valid_move(self, piece, dx, dy, rotation=None):
        if rotation is None:
            rotation = piece.rotation
        
        shape = piece.shape[rotation % len(piece.shape)]
        
        for y, row in enumerate(shape):
            for x, cell in enumerate(row):
                if cell == '#':
                    new_x = piece.x + x + dx
                    new_y = piece.y + y + dy
                    
                    if (new_x < 0 or new_x >= BOARD_WIDTH or 
                        new_y >= BOARD_HEIGHT or
                        (new_y >= 0 and self.board[new_y][new_x] != BLACK)):
                        return False
        return True

    def place_piece(self, piece):
        shape = piece.get_rotated_shape()
        for y, row in enumerate(shape):
            for x, cell in enumerate(row):
                if cell == '#':
                    board_x = piece.x + x
                    board_y = piece.y + y
                    if board_y >= 0:
                        self.board[board_y][board_x] = piece.color

    def clear_lines(self):
        lines_to_clear = []
        for y in range(BOARD_HEIGHT):
            if all(cell != BLACK for cell in self.board[y]):
                lines_to_clear.append(y)

        for y in lines_to_clear:
            del self.board[y]
            self.board.insert(0, [BLACK for _ in range(BOARD_WIDTH)])

        lines_cleared = len(lines_to_clear)
        self.lines_cleared += lines_cleared
        self.score += lines_cleared * 100 * self.level
        self.level = self.lines_cleared // 10 + 1
        self.fall_speed = max(50, 500 - (self.level - 1) * 50)

    def game_over(self):
        return not self.valid_move(self.current_piece, 0, 0)

    def update(self, dt):
        self.fall_time += dt
        if self.fall_time >= self.fall_speed:
            if self.valid_move(self.current_piece, 0, 1):
                self.current_piece.y += 1
            else:
                self.place_piece(self.current_piece)
                self.clear_lines()
                self.current_piece = self.new_piece()
            self.fall_time = 0

    def move_piece(self, dx):
        if self.valid_move(self.current_piece, dx, 0):
            self.current_piece.x += dx

    def rotate_piece(self):
        new_rotation = self.current_piece.rotation + 1
        if self.valid_move(self.current_piece, 0, 0, new_rotation):
            self.current_piece.rotate()

    def drop_piece(self):
        while self.valid_move(self.current_piece, 0, 1):
            self.current_piece.y += 1
        self.place_piece(self.current_piece)
        self.clear_lines()
        self.current_piece = self.new_piece()

def draw_board(screen, tetris):
    # 게임 보드 그리기
    for y in range(BOARD_HEIGHT):
        for x in range(BOARD_WIDTH):
            rect = pygame.Rect(BOARD_X + x * CELL_SIZE, BOARD_Y + y * CELL_SIZE, 
                             CELL_SIZE, CELL_SIZE)
            pygame.draw.rect(screen, tetris.board[y][x], rect)
            pygame.draw.rect(screen, WHITE, rect, 1)

    # 현재 떨어지는 블록 그리기
    if tetris.current_piece:
        shape = tetris.current_piece.get_rotated_shape()
        for y, row in enumerate(shape):
            for x, cell in enumerate(row):
                if cell == '#':
                    rect = pygame.Rect(BOARD_X + (tetris.current_piece.x + x) * CELL_SIZE,
                                     BOARD_Y + (tetris.current_piece.y + y) * CELL_SIZE,
                                     CELL_SIZE, CELL_SIZE)
                    pygame.draw.rect(screen, tetris.current_piece.color, rect)
                    pygame.draw.rect(screen, WHITE, rect, 1)

def draw_info(screen, tetris, font):
    info_x = BOARD_X + BOARD_WIDTH * CELL_SIZE + 20
    
    score_text = font.render(f"Score: {tetris.score}", True, WHITE)
    screen.blit(score_text, (info_x, BOARD_Y))
    
    level_text = font.render(f"Level: {tetris.level}", True, WHITE)
    screen.blit(level_text, (info_x, BOARD_Y + 30))
    
    lines_text = font.render(f"Lines: {tetris.lines_cleared}", True, WHITE)
    screen.blit(lines_text, (info_x, BOARD_Y + 60))
    
    # 조작법 안내
    controls = [
        "Controls:",
        "← → : Move",
        "↑ : Rotate", 
        "↓ : Drop",
        "ESC : Quit"
    ]
    
    for i, text in enumerate(controls):
        control_text = font.render(text, True, WHITE)
        screen.blit(control_text, (info_x, BOARD_Y + 120 + i * 25))

def main():
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption("테트리스 게임")
    clock = pygame.time.Clock()
    font = pygame.font.Font(None, 24)
    
    tetris = Tetris()
    
    running = True
    while running:
        dt = clock.tick(60)
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_LEFT:
                    tetris.move_piece(-1)
                elif event.key == pygame.K_RIGHT:
                    tetris.move_piece(1)
                elif event.key == pygame.K_UP:
                    tetris.rotate_piece()
                elif event.key == pygame.K_DOWN:
                    tetris.drop_piece()
                elif event.key == pygame.K_ESCAPE:
                    running = False
        
        if not tetris.game_over():
            tetris.update(dt)
        else:
            # 게임 오버 메시지
            game_over_text = font.render("GAME OVER! Press ESC to quit", True, RED)
            screen.blit(game_over_text, (BOARD_X, BOARD_Y + BOARD_HEIGHT * CELL_SIZE + 10))
        
        screen.fill(BLACK)
        draw_board(screen, tetris)
        draw_info(screen, tetris, font)
        
        pygame.display.flip()
    
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()