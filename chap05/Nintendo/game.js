// 게임 캔버스 및 컨텍스트 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 상태 변수
let gameState = 'waiting'; // waiting, playing, gameOver, win
let score = 0;
let lives = 3;
let level = 1;

// 카메라 시스템 (횡스크롤용)
const camera = {
    x: 0,
    y: 0,
    width: 800,
    height: 400
};

// 게임 요소들
const player = {
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 15,
    onGround: false,
    color: '#3498db'
};

// 플랫폼 배열 (확장된 레벨)
const platforms = [
    // 첫 번째 구간
    { x: 0, y: 350, width: 800, height: 50 }, // 바닥
    { x: 200, y: 250, width: 100, height: 20 },
    { x: 400, y: 200, width: 100, height: 20 },
    { x: 600, y: 150, width: 100, height: 20 },
    { x: 300, y: 100, width: 100, height: 20 },
    { x: 100, y: 150, width: 100, height: 20 },
    
    // 두 번째 구간
    { x: 900, y: 350, width: 800, height: 50 },
    { x: 1100, y: 250, width: 100, height: 20 },
    { x: 1300, y: 200, width: 100, height: 20 },
    { x: 1500, y: 150, width: 100, height: 20 },
    { x: 1200, y: 100, width: 100, height: 20 },
    { x: 1000, y: 150, width: 100, height: 20 },
    
    // 세 번째 구간
    { x: 1800, y: 350, width: 800, height: 50 },
    { x: 2000, y: 250, width: 100, height: 20 },
    { x: 2200, y: 200, width: 100, height: 20 },
    { x: 2400, y: 150, width: 100, height: 20 },
    { x: 2100, y: 100, width: 100, height: 20 },
    { x: 1900, y: 150, width: 100, height: 20 },
    
    // 네 번째 구간 (최종)
    { x: 2700, y: 350, width: 800, height: 50 },
    { x: 2900, y: 250, width: 100, height: 20 },
    { x: 3100, y: 200, width: 100, height: 20 },
    { x: 3300, y: 150, width: 100, height: 20 },
    { x: 3000, y: 100, width: 100, height: 20 },
    { x: 2800, y: 150, width: 100, height: 20 }
];

// 코인 배열 (확장된 레벨)
const coins = [
    // 첫 번째 구간
    { x: 250, y: 200, width: 15, height: 15, collected: false },
    { x: 450, y: 150, width: 15, height: 15, collected: false },
    { x: 650, y: 100, width: 15, height: 15, collected: false },
    { x: 350, y: 50, width: 15, height: 15, collected: false },
    { x: 150, y: 100, width: 15, height: 15, collected: false },
    
    // 두 번째 구간
    { x: 1150, y: 200, width: 15, height: 15, collected: false },
    { x: 1350, y: 150, width: 15, height: 15, collected: false },
    { x: 1550, y: 100, width: 15, height: 15, collected: false },
    { x: 1250, y: 50, width: 15, height: 15, collected: false },
    { x: 1050, y: 100, width: 15, height: 15, collected: false },
    
    // 세 번째 구간
    { x: 2050, y: 200, width: 15, height: 15, collected: false },
    { x: 2250, y: 150, width: 15, height: 15, collected: false },
    { x: 2450, y: 100, width: 15, height: 15, collected: false },
    { x: 2150, y: 50, width: 15, height: 15, collected: false },
    { x: 1950, y: 100, width: 15, height: 15, collected: false },
    
    // 네 번째 구간
    { x: 2950, y: 200, width: 15, height: 15, collected: false },
    { x: 3150, y: 150, width: 15, height: 15, collected: false },
    { x: 3350, y: 100, width: 15, height: 15, collected: false },
    { x: 3050, y: 50, width: 15, height: 15, collected: false },
    { x: 2850, y: 100, width: 15, height: 15, collected: false }
];

// 적 배열 (확장된 레벨)
const enemies = [
    // 첫 번째 구간
    { x: 300, y: 320, width: 25, height: 25, velocityX: -2, color: '#e74c3c', patrolStart: 200, patrolEnd: 400 },
    { x: 500, y: 320, width: 25, height: 25, velocityX: 2, color: '#e74c3c', patrolStart: 400, patrolEnd: 600 },
    { x: 700, y: 320, width: 25, height: 25, velocityX: -1, color: '#e74c3c', patrolStart: 600, patrolEnd: 800 },
    
    // 두 번째 구간
    { x: 1200, y: 320, width: 25, height: 25, velocityX: -2, color: '#e74c3c', patrolStart: 1100, patrolEnd: 1300 },
    { x: 1400, y: 320, width: 25, height: 25, velocityX: 2, color: '#e74c3c', patrolStart: 1300, patrolEnd: 1500 },
    { x: 1600, y: 320, width: 25, height: 25, velocityX: -1, color: '#e74c3c', patrolStart: 1500, patrolEnd: 1700 },
    
    // 세 번째 구간
    { x: 2100, y: 320, width: 25, height: 25, velocityX: -2, color: '#e74c3c', patrolStart: 2000, patrolEnd: 2200 },
    { x: 2300, y: 320, width: 25, height: 25, velocityX: 2, color: '#e74c3c', patrolStart: 2200, patrolEnd: 2400 },
    { x: 2500, y: 320, width: 25, height: 25, velocityX: -1, color: '#e74c3c', patrolStart: 2400, patrolEnd: 2600 },
    
    // 네 번째 구간
    { x: 3000, y: 320, width: 25, height: 25, velocityX: -2, color: '#e74c3c', patrolStart: 2900, patrolEnd: 3100 },
    { x: 3200, y: 320, width: 25, height: 25, velocityX: 2, color: '#e74c3c', patrolStart: 3100, patrolEnd: 3300 },
    { x: 3400, y: 320, width: 25, height: 25, velocityX: -1, color: '#e74c3c', patrolStart: 3300, patrolEnd: 3500 }
];

// 목표 지점 (확장된 레벨의 끝)
const goal = {
    x: 3600,
    y: 250,
    width: 30,
    height: 100,
    color: '#f1c40f'
};

// 중력 및 물리 상수
const gravity = 0.8;
const friction = 0.8;

// 오디오 요소들
const jumpSound = document.getElementById('jumpSound');
const coinSound = document.getElementById('coinSound');
const hitSound = document.getElementById('hitSound');
const winSound = document.getElementById('winSound');
const gameOverSound = document.getElementById('gameOverSound');
const bgMusic = document.getElementById('bgMusic');

// Web Audio API를 사용한 사운드 생성
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 사운드 생성 함수들
function createJumpSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function createCoinSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
}

function createHitSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

function createWinSound() {
    const notes = [523, 659, 784, 1047]; // C, E, G, C
    let time = audioContext.currentTime;
    
    notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, time);
        gainNode.gain.setValueAtTime(0.2, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        
        oscillator.start(time);
        oscillator.stop(time + 0.3);
        
        time += 0.1;
    });
}

function createGameOverSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function createBackgroundMusic() {
    const notes = [262, 330, 392, 523]; // C, E, G, C
    let time = audioContext.currentTime;
    
    setInterval(() => {
        if (gameState === 'playing' && soundEnabled) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            const randomNote = notes[Math.floor(Math.random() * notes.length)];
            oscillator.frequency.setValueAtTime(randomNote, time);
            gainNode.gain.setValueAtTime(0.05, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
            
            oscillator.start(time);
            oscillator.stop(time + 0.5);
            
            time += 0.5;
        }
    }, 2000);
}

// 사운드 효과 함수들
function playJumpSound() {
    if (!soundEnabled) return;
    createJumpSound();
}

function playCoinSound() {
    if (!soundEnabled) return;
    createCoinSound();
}

function playHitSound() {
    if (!soundEnabled) return;
    createHitSound();
}

function playWinSound() {
    if (!soundEnabled) return;
    createWinSound();
}

function playGameOverSound() {
    if (!soundEnabled) return;
    createGameOverSound();
}

function playBackgroundMusic() {
    if (!soundEnabled) return;
    createBackgroundMusic();
}

function stopBackgroundMusic() {
    // 배경음악은 setInterval로 관리되므로 별도 정지 로직 불필요
}

// 사운드 토글 기능
let soundEnabled = true;

function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundControl = document.getElementById('soundControl');
    
    if (soundEnabled) {
        soundControl.textContent = '🔊';
        soundControl.classList.remove('muted');
        if (gameState === 'playing') {
            playBackgroundMusic();
        }
    } else {
        soundControl.textContent = '🔇';
        soundControl.classList.add('muted');
        stopBackgroundMusic();
    }
}

// 사운드 재생 함수들을 수정하여 사운드 설정을 확인하도록 함
function playSound(audioElement) {
    if (!soundEnabled) return;
    audioElement.currentTime = 0;
    audioElement.play().catch(e => console.log('오디오 재생 실패:', e));
}

function playBackgroundMusic() {
    if (!soundEnabled) return;
    bgMusic.volume = 0.3;
    bgMusic.play().catch(e => console.log('배경음악 재생 실패:', e));
}

// 키보드 입력 처리
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (gameState === 'waiting') {
        startGame();
    } else if (gameState === 'gameOver' || gameState === 'win') {
        if (e.key === 'r' || e.key === 'R') {
            resetGame();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 게임 시작
function startGame() {
    gameState = 'playing';
    playBackgroundMusic();
    updateGameStatus('게임 진행 중!');
}

// 게임 재설정
function resetGame() {
    gameState = 'playing';
    score = 0;
    lives = 3;
    level = 1;
    
    // 플레이어 위치 재설정
    player.x = 50;
    player.y = 300;
    player.velocityX = 0;
    player.velocityY = 0;
    
    // 코인 재설정
    coins.forEach(coin => coin.collected = false);
    
    // 적 위치 재설정
    enemies[0].x = 300;
    enemies[1].x = 500;
    enemies[2].x = 700;
    enemies[3].x = 1200;
    enemies[4].x = 1400;
    enemies[5].x = 1600;
    enemies[6].x = 2100;
    enemies[7].x = 2300;
    enemies[8].x = 2500;
    enemies[9].x = 3000;
    enemies[10].x = 3200;
    enemies[11].x = 3400;
    
    playBackgroundMusic();
    updateUI();
    updateGameStatus('게임 재시작!');
}

// 플레이어 업데이트
function updatePlayer() {
    // 좌우 이동
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.velocityX = -player.speed;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.velocityX = player.speed;
    } else {
        player.velocityX *= friction;
    }
    
    // 점프
    if ((keys[' '] || keys['ArrowUp'] || keys['w'] || keys['W']) && player.onGround) {
        player.velocityY = -player.jumpPower;
        player.onGround = false;
        playJumpSound();
    }
    
    // 중력 적용
    player.velocityY += gravity;
    
    // 위치 업데이트
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // 경계 체크
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // 플랫폼 충돌 체크
    player.onGround = false;
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y) {
            
            // 위에서 충돌
            if (player.velocityY > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
            // 아래에서 충돌
            else if (player.velocityY < 0 && player.y + player.height > platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // 좌우 충돌
            else if (player.velocityX > 0 && player.x < platform.x) {
                player.x = platform.x - player.width;
            } else if (player.velocityX < 0 && player.x + player.width > platform.x + platform.width) {
                player.x = platform.x + platform.width;
            }
        }
    });
    
    // 바닥에 떨어졌을 때
    if (player.y > canvas.height) {
        loseLife();
    }
}

// 카메라 업데이트
function updateCamera() {
    // 플레이어를 화면 중앙에 유지
    camera.x = player.x - canvas.width / 2;
    
    // 카메라 경계 제한
    if (camera.x < 0) camera.x = 0;
    if (camera.x > 3200) camera.x = 3200; // 최대 스크롤 거리
}

// 적 업데이트
function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.x += enemy.velocityX;
        
        // 순찰 범위 내에서 방향 전환
        if (enemy.x <= enemy.patrolStart || enemy.x + enemy.width >= enemy.patrolEnd) {
            enemy.velocityX *= -1;
        }
        
        // 플레이어와 충돌 체크
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            playHitSound();
            loseLife();
        }
    });
}

// 코인 수집 체크
function checkCoinCollision() {
    coins.forEach(coin => {
        if (!coin.collected &&
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {
            coin.collected = true;
            score += 100;
            playCoinSound();
            updateUI();
        }
    });
}

// 목표 도달 체크
function checkGoalCollision() {
    if (player.x < goal.x + goal.width &&
        player.x + player.width > goal.x &&
        player.y < goal.y + goal.height &&
        player.y + player.height > goal.y) {
        gameState = 'win';
        stopBackgroundMusic();
        playWinSound();
        updateGameStatus('🎉 레벨 완료! R키로 재시작');
        document.getElementById('gameStatus').classList.add('game-win');
    }
}

// 생명 잃기
function loseLife() {
    lives--;
    updateUI();
    
    if (lives <= 0) {
        gameState = 'gameOver';
        stopBackgroundMusic();
        playGameOverSound();
        updateGameStatus('💀 게임 오버! R키로 재시작');
        document.getElementById('gameStatus').classList.add('game-over');
    } else {
        // 플레이어 위치 재설정
        player.x = 50;
        player.y = 300;
        player.velocityX = 0;
        player.velocityY = 0;
    }
}

// UI 업데이트
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

// 게임 상태 메시지 업데이트
function updateGameStatus(message) {
    const statusElement = document.getElementById('gameStatus');
    statusElement.textContent = message;
    statusElement.classList.remove('game-over', 'game-win');
}

// 그리기 함수들
function drawPlayer() {
    const screenX = player.x - camera.x;
    const screenY = player.y;
    
    // 마리오 몸체 (빨간색)
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(screenX + 5, screenY + 15, 20, 15);
    
    // 마리오 머리 (살색)
    ctx.fillStyle = '#fdbcb4';
    ctx.fillRect(screenX + 8, screenY + 5, 14, 12);
    
    // 마리오 모자 (빨간색)
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(screenX + 6, screenY + 3, 18, 6);
    ctx.fillRect(screenX + 8, screenY + 1, 14, 4);
    
    // 마리오 눈 (흰색)
    ctx.fillStyle = 'white';
    ctx.fillRect(screenX + 10, screenY + 7, 3, 3);
    ctx.fillRect(screenX + 17, screenY + 7, 3, 3);
    
    // 마리오 눈동자 (검은색)
    ctx.fillStyle = 'black';
    ctx.fillRect(screenX + 11, screenY + 8, 1, 1);
    ctx.fillRect(screenX + 18, screenY + 8, 1, 1);
    
    // 마리오 코 (살색)
    ctx.fillStyle = '#fdbcb4';
    ctx.fillRect(screenX + 13, screenY + 9, 2, 2);
    
    // 마리오 입 (검은색)
    ctx.fillStyle = 'black';
    ctx.fillRect(screenX + 12, screenY + 11, 6, 1);
    
    // 마리오 팔 (파란색)
    ctx.fillStyle = '#3498db';
    ctx.fillRect(screenX + 2, screenY + 18, 4, 8);
    ctx.fillRect(screenX + 24, screenY + 18, 4, 8);
    
    // 마리오 다리 (파란색)
    ctx.fillStyle = '#3498db';
    ctx.fillRect(screenX + 8, screenY + 30, 6, 8);
    ctx.fillRect(screenX + 16, screenY + 30, 6, 8);
    
    // 마리오 신발 (갈색)
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(screenX + 7, screenY + 38, 8, 2);
    ctx.fillRect(screenX + 15, screenY + 38, 8, 2);
}

function drawPlatforms() {
    ctx.fillStyle = '#95a5a6';
    platforms.forEach(platform => {
        const screenX = platform.x - camera.x;
        const screenY = platform.y;
        
        // 화면에 보이는 플랫폼만 그리기
        if (screenX + platform.width > 0 && screenX < canvas.width) {
            ctx.fillRect(screenX, screenY, platform.width, platform.height);
        }
    });
}

function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            const screenX = coin.x - camera.x;
            const screenY = coin.y;
            
            // 화면에 보이는 코인만 그리기
            if (screenX + coin.width > 0 && screenX < canvas.width) {
                ctx.fillStyle = '#f1c40f';
                ctx.beginPath();
                ctx.arc(screenX + coin.width/2, screenY + coin.height/2, coin.width/2, 0, Math.PI * 2);
                ctx.fill();
                
                // 코인 반짝임 효과
                ctx.fillStyle = '#f39c12';
                ctx.beginPath();
                ctx.arc(screenX + coin.width/2 - 2, screenY + coin.height/2 - 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        const screenX = enemy.x - camera.x;
        const screenY = enemy.y;
        
        // 화면에 보이는 적만 그리기
        if (screenX + enemy.width > 0 && screenX < canvas.width) {
            // 고마 (적) 몸체 (갈색)
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(screenX + 5, screenY + 10, 15, 15);
            
            // 고마 머리 (갈색)
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(screenX + 8, screenY + 3, 9, 10);
            
            // 고마 뿔 (노란색)
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(screenX + 9, screenY + 1, 2, 3);
            ctx.fillRect(screenX + 14, screenY + 1, 2, 3);
            
            // 고마 눈 (흰색)
            ctx.fillStyle = 'white';
            ctx.fillRect(screenX + 9, screenY + 5, 2, 2);
            ctx.fillRect(screenX + 14, screenY + 5, 2, 2);
            
            // 고마 눈동자 (빨간색)
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(screenX + 9, screenY + 6, 1, 1);
            ctx.fillRect(screenX + 14, screenY + 6, 1, 1);
            
            // 고마 입 (검은색)
            ctx.fillStyle = 'black';
            ctx.fillRect(screenX + 10, screenY + 8, 5, 1);
            
            // 고마 팔 (갈색)
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(screenX + 2, screenY + 15, 3, 6);
            ctx.fillRect(screenX + 20, screenY + 15, 3, 6);
            
            // 고마 다리 (갈색)
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(screenX + 8, screenY + 25, 4, 5);
            ctx.fillRect(screenX + 13, screenY + 25, 4, 5);
            
            // 고마 발 (검은색)
            ctx.fillStyle = 'black';
            ctx.fillRect(screenX + 7, screenY + 30, 6, 2);
            ctx.fillRect(screenX + 12, screenY + 30, 6, 2);
        }
    });
}

function drawGoal() {
    const screenX = goal.x - camera.x;
    const screenY = goal.y;
    
    // 화면에 보이는 목표만 그리기
    if (screenX + goal.width > 0 && screenX < canvas.width) {
        ctx.fillStyle = goal.color;
        ctx.fillRect(screenX, screenY, goal.width, goal.height);
        
        // 깃대 그리기
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(screenX + 10, screenY + goal.height, 10, 50);
        
        // 깃발 그리기
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(screenX + 20, screenY + 10, 20, 15);
    }
}

function drawBackground() {
    // 하늘 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 구름 그리기 (스크롤에 따라 이동)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    
    // 첫 번째 구름
    const cloud1X = (100 - camera.x * 0.1) % (canvas.width + 200) - 100;
    ctx.beginPath();
    ctx.arc(cloud1X, 50, 20, 0, Math.PI * 2);
    ctx.arc(cloud1X + 20, 50, 25, 0, Math.PI * 2);
    ctx.arc(cloud1X + 40, 50, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // 두 번째 구름
    const cloud2X = (600 - camera.x * 0.1) % (canvas.width + 200) - 100;
    ctx.beginPath();
    ctx.arc(cloud2X, 80, 15, 0, Math.PI * 2);
    ctx.arc(cloud2X + 15, 80, 20, 0, Math.PI * 2);
    ctx.arc(cloud2X + 30, 80, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // 세 번째 구름
    const cloud3X = (1000 - camera.x * 0.1) % (canvas.width + 200) - 100;
    ctx.beginPath();
    ctx.arc(cloud3X, 60, 18, 0, Math.PI * 2);
    ctx.arc(cloud3X + 18, 60, 22, 0, Math.PI * 2);
    ctx.arc(cloud3X + 36, 60, 18, 0, Math.PI * 2);
    ctx.fill();
}

// 메인 게임 루프
function gameLoop() {
    // 화면 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 배경 그리기
    drawBackground();
    
    // 플랫폼 그리기
    drawPlatforms();
    
    // 목표 그리기
    drawGoal();
    
    // 코인 그리기
    drawCoins();
    
    // 적 그리기
    drawEnemies();
    
    // 플레이어 그리기
    drawPlayer();
    
    // 게임 상태에 따른 업데이트
    if (gameState === 'playing') {
        updatePlayer();
        updateEnemies();
        updateCamera();
        checkCoinCollision();
        checkGoalCollision();
    }
    
    // 다음 프레임 요청
    requestAnimationFrame(gameLoop);
}

// 게임 시작
gameLoop();
updateUI(); 