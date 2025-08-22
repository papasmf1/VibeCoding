import tkinter as tk
import random

CELL_SIZE = 30
COLS = 10
ROWS = 20
SPEED = 500

SHAPES = [
    [[1, 1, 1, 1]],  # I
    [[1, 1], [1, 1]],  # O
    [[0, 1, 0], [1, 1, 1]],  # T
    [[1, 1, 0], [0, 1, 1]],  # S
    [[0, 1, 1], [1, 1, 0]],  # Z
    [[1, 0, 0], [1, 1, 1]],  # J
    [[0, 0, 1], [1, 1, 1]],  # L
]

COLORS = ["cyan", "yellow", "purple", "green", "red", "blue", "orange"]

def rotate(shape):
    return [list(row) for row in zip(*shape[::-1])]

class Tetris:
    def __init__(self, root):
        self.root = root
        self.canvas = tk.Canvas(root, width=COLS*CELL_SIZE, height=ROWS*CELL_SIZE, bg="black")
        self.canvas.pack()
        self.init_game()
        self.root.bind("<Key>", self.key_press)
        self.update()

    def init_game(self):
        self.board = [[None for _ in range(COLS)] for _ in range(ROWS)]  # type: list[list[str|None]]
        self.new_block()
        self.game_over = False
        self.score = 0

    def new_block(self):
        self.shape_id = random.randint(0, len(SHAPES)-1)
        self.shape = [row[:] for row in SHAPES[self.shape_id]]
        self.color = COLORS[self.shape_id]
        self.x = COLS // 2 - len(self.shape[0]) // 2
        self.y = 0
        if self.collision(self.x, self.y, self.shape):
            self.game_over = True

    def collision(self, x, y, shape):
        for i, row in enumerate(shape):
            for j, cell in enumerate(row):
                if cell:
                    nx, ny = x + j, y + i
                    if nx < 0 or nx >= COLS or ny < 0 or ny >= ROWS:
                        return True
                    if self.board[ny][nx]:
                        return True
        return False

    def freeze(self):
        for i, row in enumerate(self.shape):
            for j, cell in enumerate(row):
                if cell:
                    self.board[self.y + i][self.x + j] = self.color
        self.clear_lines()
        self.new_block()

    def clear_lines(self):
        new_board = [row for row in self.board if any(cell is None for cell in row)]
        lines_cleared = ROWS - len(new_board)
        for _ in range(lines_cleared):
            new_board.insert(0, [None for _ in range(COLS)])
        self.board = new_board
        self.score += lines_cleared

    def move(self, dx, dy):
        if not self.collision(self.x + dx, self.y + dy, self.shape):
            self.x += dx
            self.y += dy
            return True
        return False

    def drop(self):
        if not self.move(0, 1):
            self.freeze()

    def rotate_block(self):
        new_shape = rotate(self.shape)
        if not self.collision(self.x, self.y, new_shape):
            self.shape = new_shape

    def key_press(self, event):
        if self.game_over:
            return
        if event.keysym == "Left":
            self.move(-1, 0)
        elif event.keysym == "Right":
            self.move(1, 0)
        elif event.keysym == "Down":
            self.drop()
        elif event.keysym == "Up":
            self.rotate_block()
        self.draw()

    def update(self):
        if not self.game_over:
            self.drop()
            self.draw()
            self.root.after(SPEED, self.update)
        else:
            self.draw()
            self.canvas.create_text(COLS*CELL_SIZE//2, ROWS*CELL_SIZE//2, text="게임 오버", fill="white", font=("Arial", 24))

    def draw(self):
        self.canvas.delete("all")
        # Draw board
        for y in range(ROWS):
            for x in range(COLS):
                color = self.board[y][x]
                if color:
                    self.draw_cell(x, y, color)
        # Draw current block
        for i, row in enumerate(self.shape):
            for j, cell in enumerate(row):
                if cell:
                    self.draw_cell(self.x + j, self.y + i, self.color)
        # Draw score
        self.canvas.create_text(60, 10, text=f"점수: {self.score}", fill="white", font=("Arial", 14), anchor="nw")

    def draw_cell(self, x, y, color):
        x1 = x * CELL_SIZE
        y1 = y * CELL_SIZE
        x2 = x1 + CELL_SIZE
        y2 = y1 + CELL_SIZE
        self.canvas.create_rectangle(x1, y1, x2, y2, fill=color, outline="gray")

if __name__ == "__main__":
    root = tk.Tk()
    root.title("테트리스 게임")
    game = Tetris(root)
    root.mainloop()
