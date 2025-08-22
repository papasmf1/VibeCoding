class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.lastTime = 0;
        this.deltaTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        
        this.gameState = 'menu';
        this.score = 0;
        this.lives = 3;
        this.stage = 1;
        
        this.keys = {};
        this.mouse = { x: 0, y: 0, clicked: false };
        
        this.entities = [];
        this.particleSystems = [];
        
        this.scrollSpeed = 2;
        this.backgroundOffset = 0;
        
        this.setupEventListeners();
        this.initializeGame();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyDown(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('click', (e) => {
            this.mouse.clicked = true;
        });
        
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.gameState === 'playing') {
                this.pauseGame();
            }
        });
        
        window.addEventListener('blur', () => {
            if (this.gameState === 'playing') {
                this.pauseGame();
            }
        });
    }
    
    handleKeyDown(e) {
        switch (e.code) {
            case 'KeyP':
                if (this.gameState === 'playing') {
                    this.pauseGame();
                } else if (this.gameState === 'paused') {
                    this.resumeGame();
                }
                break;
            case 'Escape':
                if (this.gameState === 'paused') {
                    this.resumeGame();
                }
                break;
        }
    }
    
    initializeGame() {
        this.player = new Player(this.width / 2, this.height - 100);
        this.weaponSystem = new WeaponSystem(this);
        this.enemyManager = new EnemyManager(this);
        this.powerupManager = new PowerupManager(this);
        this.particleManager = new ParticleManager(this);
        this.background = new Background(this);
        this.collision = new CollisionSystem(this);
        this.ui = new UI(this);
        this.audioManager = new AudioManager();
        this.gameStateManager = new GameStateManager(this);
        
        this.entities = [];
        this.particleSystems = [];
    }
    
    start() {
        this.isRunning = true;
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.gameStateManager.showPauseScreen();
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.gameStateManager.hidePauseScreen();
        }
    }
    
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.016);
        this.lastTime = currentTime;
        
        this.update();
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.handleInput();
        
        this.background.update(this.deltaTime);
        this.player.update(this.deltaTime);
        this.weaponSystem.update(this.deltaTime);
        this.enemyManager.update(this.deltaTime);
        this.powerupManager.update(this.deltaTime);
        this.particleManager.update(this.deltaTime);
        this.collision.update(this.deltaTime);
        
        this.updateEntities();
        this.cleanupEntities();
        
        this.checkGameOver();
    }
    
    handleInput() {
        const moveSpeed = 200;
        let moveX = 0;
        let moveY = 0;
        
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
        
        if (moveX !== 0 || moveY !== 0) {
            const direction = new Vector2(moveX, moveY).normalize();
            this.player.move(direction.multiply(moveSpeed * this.deltaTime));
        }
        
        if (this.keys['Space'] || this.keys['KeyZ']) {
            this.weaponSystem.fireLaser(this.player.position, this.player.laserPower);
        }
        
        if (this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.keys['KeyX']) {
            const targetPos = new Vector2(this.mouse.x, this.mouse.y);
            this.weaponSystem.fireBomb(this.player.position, targetPos, this.player.bombPower);
            this.showCrosshair(true);
        } else {
            this.showCrosshair(false);
        }
        
        this.mouse.clicked = false;
    }
    
    showCrosshair(show) {
        const crosshair = document.getElementById('crosshair');
        if (show) {
            crosshair.classList.remove('hidden');
            crosshair.style.left = this.mouse.x + 'px';
            crosshair.style.top = this.mouse.y + 'px';
        } else {
            crosshair.classList.add('hidden');
        }
    }
    
    updateEntities() {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            if (entity.active) {
                entity.update(this.deltaTime);
            }
        }
    }
    
    cleanupEntities() {
        this.entities = this.entities.filter(entity => entity.active);
        
        this.weaponSystem.cleanup();
        this.enemyManager.cleanup();
        this.powerupManager.cleanup();
        this.particleManager.cleanup();
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.background.render(this.ctx);
        
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            this.player.render(this.ctx);
            this.weaponSystem.render(this.ctx);
            this.enemyManager.render(this.ctx);
            this.powerupManager.render(this.ctx);
            this.particleManager.render(this.ctx);
            
            this.renderEntities();
        }
        
        this.ui.render(this.ctx);
    }
    
    renderEntities() {
        this.entities.forEach(entity => {
            if (entity.active) {
                entity.render(this.ctx);
            }
        });
    }
    
    addEntity(entity) {
        this.entities.push(entity);
    }
    
    removeEntity(entity) {
        entity.active = false;
    }
    
    addScore(points) {
        this.score += points;
        
        if (this.score % 10000 === 0 && this.score > 0) {
            this.lives++;
            this.audioManager.playSound('extraLife');
        }
        
        this.ui.updateScore(this.score);
    }
    
    loseLife() {
        this.lives--;
        this.ui.updateLives(this.lives);
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.player.respawn();
            this.audioManager.playSound('playerDeath');
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.gameStateManager.showGameOverScreen();
        this.audioManager.stopMusic();
    }
    
    checkGameOver() {
        if (this.lives <= 0 && this.gameState === 'playing') {
            this.gameOver();
        }
    }
    
    startNewGame() {
        this.score = 0;
        this.lives = 3;
        this.stage = 1;
        this.gameState = 'playing';
        
        this.initializeGame();
        this.ui.updateScore(this.score);
        this.ui.updateLives(this.lives);
        this.ui.updateStage(this.stage);
        
        this.audioManager.playMusic('game');
    }
    
    returnToMenu() {
        this.gameState = 'menu';
        this.gameStateManager.showMenu();
        this.audioManager.stopMusic();
    }
}