class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 게임 상태
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // 플레이어
        this.player = {
            x: this.width / 2,
            y: this.height - 50,
            width: 40,
            height: 30,
            speed: 300, // 픽셀/초로 변경
            color: '#00ffff'
        };
        
        // 총알 배열
        this.bullets = [];
        this.bulletSpeed = 300; // 픽셀/초
        this.bulletSize = 3;
        
        // 무기 시스템
        this.weaponType = 'single'; // single, double, triple, spread
        this.weaponLevel = 1;
        this.lastShotTime = 0;
        this.shotCooldown = 200; // 밀리초
        
        // 적 배열
        this.enemies = [];
        this.enemySpeed = 100; // 픽셀/초
        this.enemySpawnRate = 0.5; // 초당 스폰 확률
        this.lastEnemySpawnTime = 0;
        
        // 아이템 배열
        this.items = [];
        this.itemSpeed = 150; // 픽셀/초
        this.itemSpawnRate = 0.1; // 초당 스폰 확률
        this.lastItemSpawnTime = 0;
        
        // 폭발 효과
        this.explosions = [];
        
        // 키 입력
        this.keys = {};
        
        // 게임 루프
        this.lastTime = 0;
        this.gameLoop = null;
        this.deltaTime = 0;
        
        // 오디오 시스템
        this.audioContext = null;
        this.sounds = {};
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        this.initAudio();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.spawnEnemies();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
            console.log('Audio system initialized');
        } catch (error) {
            console.log('Audio not supported:', error);
        }
    }
    
    createSounds() {
        // 총알 발사 사운드
        this.sounds.shoot = this.createShootSound();
        
        // 적 폭발 사운드
        this.sounds.explosion = this.createExplosionSound();
        
        // 플레이어 피격 사운드
        this.sounds.hit = this.createHitSound();
        
        // 아이템 획득 사운드
        this.sounds.powerup = this.createPowerupSound();
        
        // 배경 음악
        this.sounds.bgm = this.createBackgroundMusic();
        
        // 게임오버 사운드
        this.sounds.gameOver = this.createGameOverSound();
    }
    
    createShootSound() {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }
    
    createExplosionSound() {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
            
            filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.4, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }
    
    createHitSound() {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.5, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }
    
    createPowerupSound() {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
            oscillator.frequency.linearRampToValueAtTime(1200, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.4, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }
    
    createBackgroundMusic() {
        return () => {
            if (!this.audioContext) return;
            
            // 간단한 배경 음악 패턴
            const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C major scale
            let currentNote = 0;
            
            const playNote = () => {
                if (this.gameState !== 'playing') return;
                
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(notes[currentNote], this.audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(this.musicVolume * 0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.5);
                
                currentNote = (currentNote + 1) % notes.length;
                
                setTimeout(playNote, 2000); // 2초마다 다음 음표
            };
            
            playNote();
        };
    }
    
    createGameOverSound() {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
            oscillator.frequency.linearRampToValueAtTime(50, this.audioContext.currentTime + 1.0);
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.6, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.0);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 1.0);
        };
    }
    
    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    setupEventListeners() {
        // 키보드 이벤트 - 더 안정적인 방식
        document.addEventListener('keydown', (e) => {
            e.preventDefault(); // 기본 동작 방지
            console.log('Key pressed:', e.code, e.key); // 디버깅용
            
            // 키 상태 저장
            this.keys[e.code] = true;
            this.keys[e.key] = true;
            
            // 발사
            if ((e.code === 'Space' || e.key === ' ') && this.gameState === 'playing') {
                this.shoot();
            }
            
            // 일시정지
            if (e.code === 'KeyP' || e.key === 'p' || e.key === 'P') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            // 키 상태 해제
            this.keys[e.code] = false;
            this.keys[e.key] = false;
        });
        
        // 포커스 이벤트 추가
        window.addEventListener('focus', () => {
            console.log('Window focused');
        });
        
        window.addEventListener('blur', () => {
            console.log('Window blurred');
            // 창이 포커스를 잃으면 모든 키 상태 초기화
            this.keys = {};
        });
        
        // 버튼 이벤트
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 볼륨 컨트롤 이벤트
        document.getElementById('musicVolume').addEventListener('input', (e) => {
            this.musicVolume = e.target.value / 100;
        });
        
        document.getElementById('sfxVolume').addEventListener('input', (e) => {
            this.sfxVolume = e.target.value / 100;
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.weaponType = 'single';
        this.weaponLevel = 1;
        this.enemies = [];
        this.bullets = [];
        this.items = [];
        this.explosions = [];
        this.updateUI();
        
        // 배경 음악 시작
        if (this.sounds.bgm) {
            this.sounds.bgm();
        }
        
        this.gameLoop = requestAnimationFrame((timestamp) => this.update(timestamp));
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            cancelAnimationFrame(this.gameLoop);
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.gameLoop = requestAnimationFrame((timestamp) => this.update(timestamp));
        }
    }
    
    restartGame() {
        this.gameState = 'menu';
        document.getElementById('gameOver').classList.add('hidden');
        this.enemies = [];
        this.bullets = [];
        this.explosions = [];
        this.updateUI();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
        cancelAnimationFrame(this.gameLoop);
        
        // 게임오버 사운드 재생
        this.playSound('gameOver');
    }
    
    update(currentTime) {
        if (this.gameState !== 'playing') return;
        
        this.deltaTime = (currentTime - this.lastTime) / 1000; // 초 단위로 변환
        this.lastTime = currentTime;
        
        this.updatePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.updateItems();
        this.updateExplosions();
        this.checkCollisions();
        this.spawnEnemies();
        this.spawnItems();
        this.render();
        
        this.gameLoop = requestAnimationFrame((timestamp) => this.update(timestamp));
    }
    
    updatePlayer() {
        const moveSpeed = this.player.speed * this.deltaTime;
        
        // 다양한 키 입력 지원 (화살표 키 + WASD)
        const moveLeft = this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'] || this.keys['KeyA'];
        const moveRight = this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'] || this.keys['KeyD'];
        
        // 디버깅용 로그
        if (moveLeft || moveRight) {
            console.log('Movement keys state:', {
                left: moveLeft,
                right: moveRight,
                gameState: this.gameState,
                playerX: this.player.x,
                moveSpeed: moveSpeed,
                keys: this.keys
            });
        }
        
        // 플레이어 이동
        if (moveLeft && this.player.x > 0) {
            this.player.x -= moveSpeed;
            console.log('Moving left, new X:', this.player.x);
        }
        if (moveRight && this.player.x < this.width - this.player.width) {
            this.player.x += moveSpeed;
            console.log('Moving right, new X:', this.player.x);
        }
    }
    
    shoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime < this.shotCooldown) return;
        
        this.lastShotTime = currentTime;
        
        // 발사 사운드 재생
        this.playSound('shoot');
        
        switch(this.weaponType) {
            case 'single':
                this.createBullet(0);
                break;
            case 'double':
                this.createBullet(-10);
                this.createBullet(10);
                break;
            case 'triple':
                this.createBullet(0);
                this.createBullet(-15);
                this.createBullet(15);
                break;
            case 'spread':
                this.createBullet(0, 0);
                this.createBullet(-15, -1);
                this.createBullet(15, 1);
                this.createBullet(-25, -2);
                this.createBullet(25, 2);
                break;
        }
    }
    
    createBullet(offsetX = 0, angleOffset = 0) {
        const bullet = {
            x: this.player.x + this.player.width / 2 - this.bulletSize / 2 + offsetX,
            y: this.player.y,
            width: this.bulletSize,
            height: this.bulletSize * 2,
            color: '#ffff00',
            velocityX: angleOffset * 50, // 스프레드 무기용
            velocityY: -this.bulletSpeed
        };
        this.bullets.push(bullet);
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += bullet.velocityX * this.deltaTime;
            bullet.y += bullet.velocityY * this.deltaTime;
            
            if (bullet.y < 0 || bullet.x < 0 || bullet.x > this.width) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    spawnEnemies() {
        const currentTime = Date.now() / 1000;
        if (currentTime - this.lastEnemySpawnTime >= 1 / this.enemySpawnRate) {
            this.lastEnemySpawnTime = currentTime;
            
            const enemy = {
                x: Math.random() * (this.width - 30),
                y: -30,
                width: 30,
                height: 30,
                speed: this.enemySpeed + Math.random() * 50,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                health: 1
            };
            
            this.enemies.push(enemy);
        }
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.y += enemy.speed * this.deltaTime;
            
            if (enemy.y > this.height) {
                this.enemies.splice(i, 1);
                this.lives--;
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.gameOver();
                    return;
                }
            }
        }
    }
    
    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.life -= this.deltaTime * 10; // 초당 10 감소
            
            if (explosion.life <= 0) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        // 총알과 적 충돌 검사
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (this.isColliding(bullet, enemy)) {
                    // 총알 제거
                    this.bullets.splice(i, 1);
                    
                    // 적 체력 감소
                    enemy.health--;
                    
                    // 폭발 효과 추가
                    this.explosions.push({
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height / 2,
                        life: 10,
                        maxLife: 10
                    });
                    
                    // 적 제거
                    if (enemy.health <= 0) {
                        this.enemies.splice(j, 1);
                        this.score += 100;
                        this.updateUI();
                        
                        // 폭발 사운드 재생
                        this.playSound('explosion');
                        
                                // 레벨 업 체크
        if (this.score % 1000 === 0) {
            this.level++;
            this.enemySpeed += 20;
            this.enemySpawnRate = Math.min(2, this.enemySpawnRate + 0.1);
            this.updateUI();
        }
                    }
                    
                    break;
                }
            }
        }
        
        // 플레이어와 적 충돌 검사
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (this.isColliding(this.player, enemy)) {
                this.enemies.splice(i, 1);
                this.lives--;
                this.updateUI();
                
                // 피격 사운드 재생
                this.playSound('hit');
                
                // 폭발 효과
                this.explosions.push({
                    x: this.player.x + this.player.width / 2,
                    y: this.player.y + this.player.height / 2,
                    life: 15,
                    maxLife: 15
                });
                
                if (this.lives <= 0) {
                    this.gameOver();
                    return;
                }
            }
        }
        
        // 플레이어와 아이템 충돌 검사
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            
            if (this.isColliding(this.player, item)) {
                this.collectItem(item);
                this.items.splice(i, 1);
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    spawnItems() {
        const currentTime = Date.now() / 1000;
        if (currentTime - this.lastItemSpawnTime >= 1 / this.itemSpawnRate) {
            this.lastItemSpawnTime = currentTime;
            
            const itemTypes = ['double', 'triple', 'spread'];
            const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            
            const item = {
                x: Math.random() * (this.width - 20),
                y: -20,
                width: 20,
                height: 20,
                speed: this.itemSpeed,
                type: randomType,
                color: this.getItemColor(randomType)
            };
            
            this.items.push(item);
        }
    }
    
    updateItems() {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.y += item.speed * this.deltaTime;
            
            if (item.y > this.height) {
                this.items.splice(i, 1);
            }
        }
    }
    
    collectItem(item) {
        this.weaponType = item.type;
        this.weaponLevel++;
        
        // 파워업 사운드 재생
        this.playSound('powerup');
        
        // 아이템 획득 효과
        this.explosions.push({
            x: this.player.x + this.player.width / 2,
            y: this.player.y + this.player.height / 2,
            life: 10,
            maxLife: 10
        });
        
        // 무기 업그레이드 메시지 표시
        this.showWeaponUpgrade(item.type);
    }
    
    getItemColor(type) {
        switch(type) {
            case 'double': return '#00ff00'; // 초록색
            case 'triple': return '#ff00ff'; // 마젠타
            case 'spread': return '#ff8800'; // 주황색
            default: return '#ffffff';
        }
    }
    
    showWeaponUpgrade(type) {
        const weaponNames = {
            'double': '더블 샷!',
            'triple': '트리플 샷!',
            'spread': '스프레드 샷!'
        };
        
        // 화면에 무기 업그레이드 메시지 표시 (임시)
        console.log(`무기 업그레이드: ${weaponNames[type]}`);
    }
    
    render() {
        // 캔버스 클리어
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 배경 별들
        this.drawStars();
        
        // 플레이어 그리기
        this.drawPlayer();
        
        // 총알 그리기
        this.drawBullets();
        
        // 적 그리기
        this.drawEnemies();
        
        // 아이템 그리기
        this.drawItems();
        
        // 폭발 효과 그리기
        this.drawExplosions();
        
        // 게임 상태 표시
        if (this.gameState === 'paused') {
            this.drawPauseScreen();
        }
    }
    
    drawStars() {
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.width;
            const y = (i * 73 + Date.now() * 0.01) % this.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    drawPlayer() {
        const x = this.player.x + this.player.width / 2;
        const y = this.player.y + this.player.height / 2;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // 플레이어 우주선 그리기
        this.ctx.beginPath();
        
        // 우주선 본체 (삼각형 모양)
        this.ctx.moveTo(0, -15);
        this.ctx.lineTo(-12, 10);
        this.ctx.lineTo(-8, 15);
        this.ctx.lineTo(8, 15);
        this.ctx.lineTo(12, 10);
        this.ctx.closePath();
        
        // 글로우 효과
        this.ctx.shadowColor = this.player.color;
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = this.player.color;
        this.ctx.fill();
        
        // 우주선 세부 디테일
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 조종석
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        
        // 엔진 불꽃 효과
        this.ctx.beginPath();
        this.ctx.moveTo(-6, 15);
        this.ctx.lineTo(-3, 25);
        this.ctx.lineTo(0, 20);
        this.ctx.lineTo(3, 25);
        this.ctx.lineTo(6, 15);
        this.ctx.closePath();
        this.ctx.fillStyle = `hsl(${Date.now() * 0.1 % 60 + 10}, 100%, 50%)`;
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawBullets() {
        for (const bullet of this.bullets) {
            this.drawLaserBullet(bullet);
        }
    }
    
    drawLaserBullet(bullet) {
        const x = bullet.x + bullet.width / 2;
        const y = bullet.y + bullet.height / 2;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // 레이저 빔 그리기
        this.ctx.shadowColor = '#ffff00';
        this.ctx.shadowBlur = 8;
        
        // 메인 레이저
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(-1, -bullet.height/2, 2, bullet.height);
        
        // 레이저 글로우 효과
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(-0.5, -bullet.height/2, 1, bullet.height);
        
        // 레이저 끝부분 효과
        this.ctx.beginPath();
        this.ctx.arc(0, -bullet.height/2, 2, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        this.ctx.restore();
    }
    
    drawItems() {
        for (const item of this.items) {
            this.drawItem(item);
        }
    }
    
    drawItem(item) {
        const x = item.x + item.width / 2;
        const y = item.y + item.height / 2;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // 아이템 글로우 효과
        this.ctx.shadowColor = item.color;
        this.ctx.shadowBlur = 15;
        
        // 아이템 모양 그리기
        switch(item.type) {
            case 'double':
                this.drawDoubleItem(item);
                break;
            case 'triple':
                this.drawTripleItem(item);
                break;
            case 'spread':
                this.drawSpreadItem(item);
                break;
        }
        
        this.ctx.shadowBlur = 0;
        this.ctx.restore();
    }
    
    drawDoubleItem(item) {
        // 두 개의 총알 모양
        this.ctx.fillStyle = item.color;
        this.ctx.fillRect(-8, -3, 4, 6);
        this.ctx.fillRect(4, -3, 4, 6);
        
        // 중앙 연결선
        this.ctx.strokeStyle = item.color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(-4, 0);
        this.ctx.lineTo(4, 0);
        this.ctx.stroke();
    }
    
    drawTripleItem(item) {
        // 세 개의 총알 모양
        this.ctx.fillStyle = item.color;
        this.ctx.fillRect(-10, -3, 4, 6);
        this.ctx.fillRect(-2, -3, 4, 6);
        this.ctx.fillRect(6, -3, 4, 6);
        
        // 연결선
        this.ctx.strokeStyle = item.color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(-6, 0);
        this.ctx.lineTo(6, 0);
        this.ctx.stroke();
    }
    
    drawSpreadItem(item) {
        // 스프레드 무기 모양 (부채꼴)
        this.ctx.fillStyle = item.color;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -8);
        this.ctx.lineTo(-6, 0);
        this.ctx.lineTo(-4, 8);
        this.ctx.lineTo(4, 8);
        this.ctx.lineTo(6, 0);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 중앙 점
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 2, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
    }
    
    drawEnemies() {
        for (const enemy of this.enemies) {
            this.drawEnemyShip(enemy);
        }
    }
    
    drawEnemyShip(enemy) {
        const x = enemy.x + enemy.width / 2;
        const y = enemy.y + enemy.height / 2;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // 적 타입에 따른 다양한 우주선 디자인
        const enemyType = Math.floor(enemy.x * enemy.y) % 4; // 위치 기반 타입 결정
        
        switch(enemyType) {
            case 0: // 원형 우주선
                this.drawCircularEnemy(enemy);
                break;
            case 1: // 육각형 우주선
                this.drawHexagonalEnemy(enemy);
                break;
            case 2: // 다이아몬드 우주선
                this.drawDiamondEnemy(enemy);
                break;
            case 3: // 크로스 우주선
                this.drawCrossEnemy(enemy);
                break;
        }
        
        this.ctx.restore();
    }
    
    drawCircularEnemy(enemy) {
        // 메인 원형 본체
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 12, 0, Math.PI * 2);
        this.ctx.shadowColor = enemy.color;
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = enemy.color;
        this.ctx.fill();
        
        // 내부 원형
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
        this.ctx.fillStyle = '#000';
        this.ctx.fill();
        
        // 중앙 코어
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = enemy.color;
        this.ctx.fill();
        
        // 외부 링
        this.ctx.strokeStyle = enemy.color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawHexagonalEnemy(enemy) {
        // 육각형 본체
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = Math.cos(angle) * 12;
            const y = Math.sin(angle) * 12;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.shadowColor = enemy.color;
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = enemy.color;
        this.ctx.fill();
        
        // 내부 육각형
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = Math.cos(angle) * 8;
            const y = Math.sin(angle) * 8;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fillStyle = '#000';
        this.ctx.fill();
        
        // 중앙 원형
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = enemy.color;
        this.ctx.fill();
    }
    
    drawDiamondEnemy(enemy) {
        // 다이아몬드 본체
        this.ctx.beginPath();
        this.ctx.moveTo(0, -15);
        this.ctx.lineTo(-10, 0);
        this.ctx.lineTo(0, 15);
        this.ctx.lineTo(10, 0);
        this.ctx.closePath();
        this.ctx.shadowColor = enemy.color;
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = enemy.color;
        this.ctx.fill();
        
        // 내부 다이아몬드
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -10);
        this.ctx.lineTo(-6, 0);
        this.ctx.lineTo(0, 10);
        this.ctx.lineTo(6, 0);
        this.ctx.closePath();
        this.ctx.fillStyle = '#000';
        this.ctx.fill();
        
        // 중앙 원형
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = enemy.color;
        this.ctx.fill();
        
        // 날개
        this.ctx.strokeStyle = enemy.color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(-15, -5);
        this.ctx.lineTo(-20, -10);
        this.ctx.moveTo(15, -5);
        this.ctx.lineTo(20, -10);
        this.ctx.stroke();
    }
    
    drawCrossEnemy(enemy) {
        // 십자형 본체
        this.ctx.shadowColor = enemy.color;
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = enemy.color;
        
        // 세로 막대
        this.ctx.fillRect(-3, -15, 6, 30);
        // 가로 막대
        this.ctx.fillRect(-15, -3, 30, 6);
        
        this.ctx.shadowBlur = 0;
        
        // 중앙 원형
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 6, 0, Math.PI * 2);
        this.ctx.fillStyle = '#000';
        this.ctx.fill();
        
        // 중앙 코어
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = enemy.color;
        this.ctx.fill();
        
        // 외부 링
        this.ctx.strokeStyle = enemy.color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawExplosions() {
        for (const explosion of this.explosions) {
            const alpha = explosion.life / explosion.maxLife;
            const size = (explosion.maxLife - explosion.life) * 2;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = `hsl(${Date.now() * 0.1 % 360}, 100%, 50%)`;
            this.ctx.shadowColor = this.ctx.fillStyle;
            this.ctx.shadowBlur = 15;
            
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
    
    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#00ffff';
        this.ctx.shadowBlur = 10;
        this.ctx.fillText('일시정지', this.width / 2, this.height / 2);
        this.ctx.shadowBlur = 0;
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    const game = new Game();
    
    // 즉시 게임 시작 (디버깅용)
    setTimeout(() => {
        console.log('Starting game immediately...');
        game.startGame();
    }, 1000);
    
    // 캔버스에 포커스 이벤트 추가
    const canvas = document.getElementById('gameCanvas');
    canvas.addEventListener('click', () => {
        console.log('Canvas clicked, focusing...');
        canvas.focus();
    });
    
    // 캔버스에 키보드 이벤트 직접 추가
    canvas.addEventListener('keydown', (e) => {
        console.log('Canvas keydown:', e.code);
        e.preventDefault();
    });
}); 