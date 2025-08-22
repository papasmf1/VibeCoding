// 게임 상태 열거형
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

// 메인 게임 클래스
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // 게임 상태
        this.state = GameState.MENU;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // 시간 관리
        this.lastTime = 0;
        this.deltaTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // 엔티티 배열
        this.entities = {
            player: null,
            enemies: [],
            bullets: [],
            particles: [],
            powerups: []
        };
        
        // 매니저들
        this.inputManager = null;
        this.collisionManager = null;
        this.uiManager = null;
        
        // 게임 설정
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 2000; // 2초마다 적 생성
        this.backgroundOffset = 0;
        
        // 애니메이션 프레임 ID
        this.animationId = null;
        
        // 바인딩
        this.gameLoop = this.gameLoop.bind(this);
    }
    
    init() {
        console.log('게임 초기화 중...');
        
        // 전역 게임 참조 설정
        window.game = this;
        
        // 매니저 초기화
        this.inputManager = new InputManager();
        this.collisionManager = new CollisionManager();
        this.uiManager = new UIManager(this.canvas);
        
        // 캔버스 크기 설정
        this.resizeCanvas();
        
        // 이벤트 리스너 등록
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 게임 시작
        this.start();
        
        console.log('게임 초기화 완료');
    }
    
    start() {
        console.log('게임 시작');
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    gameLoop(currentTime = performance.now()) {
        try {
            // 델타 타임 계산
            this.deltaTime = currentTime - this.lastTime;
            
            // 첫 프레임이거나 델타 타임이 너무 클 때 제한
            if (this.lastTime === 0 || this.deltaTime > 100) {
                this.deltaTime = 16.67; // 60fps 기준
            }
            
            this.lastTime = currentTime;
            
            // 게임 업데이트
            this.update(this.deltaTime);
            
            // 렌더링
            this.render();
        } catch (error) {
            console.error('Game loop error:', error);
            // 오류 발생 시 게임 상태 초기화
            this.reset();
        }
        
        // 다음 프레임 요청
        this.animationId = requestAnimationFrame(this.gameLoop);
    }
    
    update(deltaTime) {
        // 입력 처리 먼저
        if (this.inputManager) {
            // 게임 상태별 업데이트
            switch (this.state) {
                case GameState.MENU:
                    this.updateMenu();
                    break;
                case GameState.PLAYING:
                    this.updatePlaying(deltaTime);
                    break;
                case GameState.GAME_OVER:
                    this.updateGameOver();
                    break;
            }
            
            // 입력 상태 초기화 (다음 프레임을 위해)
            this.inputManager.update();
        }
    }
    
    updateMenu() {
        // 스페이스바 또는 엔터키로 게임 시작
        if (this.inputManager.isKeyPressed('Space') || 
            this.inputManager.isKeyPressed('Enter') || 
            this.inputManager.isKeyPressed('start') ||
            this.inputManager.touchStarted.length > 0) {
            this.startGame();
        }
    }
    
    updatePlaying(deltaTime) {
        // 플레이어 업데이트
        if (this.entities.player && this.entities.player.active) {
            try {
                this.entities.player.update(deltaTime, this.inputManager);
            } catch (error) {
                console.error('Player update error:', error);
                this.gameOver();
            }
        }
        
        // 적 생성
        this.updateEnemySpawning(deltaTime);
        
        // 모든 엔티티 업데이트
        this.updateEntities(deltaTime);
        
        // 충돌 감지
        try {
            this.collisionManager.checkCollisions(this.entities);
        } catch (error) {
            console.error('Collision detection error:', error);
        }
        
        // 화면 밖 엔티티 제거
        this.cleanupEntities();
        
        // 배경 스크롤
        this.updateBackground(deltaTime);
    }
    
    updateGameOver() {
        // R키로 재시작
        if (this.inputManager.isKeyPressed('KeyR')) {
            this.reset();
        }
    }
    
    updateEnemySpawning(deltaTime) {
        this.enemySpawnTimer += deltaTime;
        
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
            
            // 시간이 지날수록 적 생성 빈도 증가
            if (this.enemySpawnInterval > 500) {
                this.enemySpawnInterval -= 10;
            }
        }
    }
    
    updateEntities(deltaTime) {
        try {
            // 적 업데이트
            for (let i = this.entities.enemies.length - 1; i >= 0; i--) {
                const enemy = this.entities.enemies[i];
                
                if (enemy && enemy.active && !enemy.shouldDestroy) {
                    try {
                        enemy.update(deltaTime);
                    } catch (error) {
                        console.error('Enemy update error:', error);
                        enemy.destroy();
                    }
                }
                
                if (!enemy || enemy.shouldDestroy || !enemy.active) {
                    this.entities.enemies.splice(i, 1);
                }
            }
            
            // 총알 업데이트
            for (let i = this.entities.bullets.length - 1; i >= 0; i--) {
                const bullet = this.entities.bullets[i];
                
                if (bullet && bullet.active && !bullet.shouldDestroy) {
                    try {
                        bullet.update(deltaTime);
                    } catch (error) {
                        console.error('Bullet update error:', error);
                        bullet.destroy();
                    }
                }
                
                if (!bullet || bullet.shouldDestroy || !bullet.active) {
                    this.entities.bullets.splice(i, 1);
                }
            }
            
            // 파티클 업데이트
            for (let i = this.entities.particles.length - 1; i >= 0; i--) {
                const particle = this.entities.particles[i];
                
                if (particle && particle.active && !particle.shouldDestroy) {
                    try {
                        particle.update(deltaTime);
                    } catch (error) {
                        console.error('Particle update error:', error);
                        particle.destroy();
                    }
                }
                
                if (!particle || particle.shouldDestroy || !particle.active) {
                    this.entities.particles.splice(i, 1);
                }
            }
            
            // 파워업 업데이트
            for (let i = this.entities.powerups.length - 1; i >= 0; i--) {
                const powerup = this.entities.powerups[i];
                
                if (powerup && powerup.active && !powerup.shouldDestroy) {
                    try {
                        powerup.update(deltaTime);
                    } catch (error) {
                        console.error('PowerUp update error:', error);
                        powerup.destroy();
                    }
                }
                
                if (!powerup || powerup.shouldDestroy || !powerup.active) {
                    this.entities.powerups.splice(i, 1);
                }
            }
        } catch (error) {
            console.error('Entity update error:', error);
        }
    }
    
    updateBackground(deltaTime) {
        this.backgroundOffset += 50 * (deltaTime / 1000); // 초당 50픽셀 스크롤
        if (this.backgroundOffset >= this.canvas.height) {
            this.backgroundOffset = 0;
        }
    }
    
    cleanupEntities() {
        // 화면 밖으로 나간 엔티티들 제거
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // 적 정리
        this.entities.enemies = this.entities.enemies.filter(enemy => {
            return enemy.y < canvasHeight + 50;
        });
        
        // 총알 정리
        this.entities.bullets = this.entities.bullets.filter(bullet => {
            return bullet.y > -50 && bullet.y < canvasHeight + 50;
        });
    }
    
    render() {
        // 화면 클리어
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 배경 렌더링
        this.renderBackground();
        
        // 게임 상태별 렌더링
        switch (this.state) {
            case GameState.MENU:
                this.renderMenu();
                break;
            case GameState.PLAYING:
                this.renderPlaying();
                break;
            case GameState.GAME_OVER:
                this.renderGameOver();
                break;
        }
    }
    
    renderBackground() {
        // 간단한 별 배경
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = ((i * 73 + this.backgroundOffset) % (this.canvas.height + 100)) - 50;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    renderMenu() {
        // 메뉴는 CSS로 처리
        this.uiManager.showStartScreen();
    }
    
    renderPlaying() {
        try {
            // 플레이어 렌더링
            if (this.entities.player && this.entities.player.active) {
                this.entities.player.render(this.ctx);
            }
            
            // 적 렌더링
            this.entities.enemies.forEach(enemy => {
                if (enemy && enemy.active && !enemy.shouldDestroy) {
                    try {
                        enemy.render(this.ctx);
                    } catch (error) {
                        console.error('Enemy render error:', error);
                    }
                }
            });
            
            // 총알 렌더링
            this.entities.bullets.forEach(bullet => {
                if (bullet && bullet.active && !bullet.shouldDestroy) {
                    try {
                        bullet.render(this.ctx);
                    } catch (error) {
                        console.error('Bullet render error:', error);
                    }
                }
            });
            
            // 파티클 렌더링
            this.entities.particles.forEach(particle => {
                if (particle && particle.active && !particle.shouldDestroy) {
                    try {
                        particle.render(this.ctx);
                    } catch (error) {
                        console.error('Particle render error:', error);
                    }
                }
            });
            
            // 파워업 렌더링
            this.entities.powerups.forEach(powerup => {
                if (powerup && powerup.active && !powerup.shouldDestroy) {
                    try {
                        powerup.render(this.ctx);
                    } catch (error) {
                        console.error('PowerUp render error:', error);
                    }
                }
            });
            
            // UI 업데이트
            if (this.uiManager) {
                this.uiManager.updateScore(this.score);
                this.uiManager.hideGameInfo();
            }
        } catch (error) {
            console.error('Render error:', error);
        }
    }
    
    renderGameOver() {
        // 게임 오버 화면
        this.uiManager.showGameOver(this.score);
    }
    
    startGame() {
        console.log('게임 플레이 시작');
        this.state = GameState.PLAYING;
        
        // 플레이어 생성
        this.entities.player = new Player(
            this.canvas.width / 2 - 16,
            this.canvas.height - 80
        );
        
        // 게임 상태 초기화
        this.score = 0;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 2000;
    }
    
    spawnEnemy() {
        try {
            if (typeof Enemy !== 'undefined') {
                const x = Math.random() * (this.canvas.width - 32);
                
                // 레벨에 따른 적 타입 결정
                const currentLevel = Math.floor(this.score / 100) + 1;
                let enemy;
                
                try {
                    enemy = Enemy.createRandom(x, -32, currentLevel);
                } catch (error) {
                    console.error('Enemy creation error:', error);
                    // 기본 적 생성으로 대체
                    enemy = new Enemy(x, -32, 'basic');
                }
                
                if (enemy) {
                    this.entities.enemies.push(enemy);
                }
            }
        } catch (error) {
            console.error('Spawn enemy error:', error);
        }
    }
    
    gameOver() {
        console.log('게임 오버');
        this.state = GameState.GAME_OVER;
        
        // 모든 엔티티 제거
        this.entities.enemies = [];
        this.entities.bullets = [];
        this.entities.particles = [];
        this.entities.powerups = [];
        this.entities.player = null;
    }
    
    reset() {
        console.log('게임 리셋');
        this.state = GameState.MENU;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.enemySpawnInterval = 2000;
        
        // 모든 엔티티 제거
        this.entities.enemies = [];
        this.entities.bullets = [];
        this.entities.particles = [];
        this.entities.powerups = [];
        this.entities.player = null;
        
        this.uiManager.showStartScreen();
    }
    
    addScore(points) {
        this.score += points;
        this.uiManager.animateScoreIncrease();
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // 16:9 비율 유지
        const aspectRatio = 4 / 3;
        let newWidth = Math.min(containerWidth, 800);
        let newHeight = newWidth / aspectRatio;
        
        if (newHeight > containerHeight * 0.8) {
            newHeight = containerHeight * 0.8;
            newWidth = newHeight * aspectRatio;
        }
        
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        
        // 캔버스 스타일 크기도 설정
        this.canvas.style.width = newWidth + 'px';
        this.canvas.style.height = newHeight + 'px';
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}