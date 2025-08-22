// UI 관리 클래스
class UIManager {
    constructor(canvas) {
        this.canvas = canvas;
        
        // DOM 요소들
        this.scoreElement = document.getElementById('score');
        this.gameStatusElement = document.getElementById('gameStatus');
        this.gameInfoElement = document.querySelector('.game-info');
        
        // UI 상태
        this.currentScore = 0;
        this.highScore = StorageUtils.load('highScore', 0);
        this.isGameInfoVisible = true;
        
        // 애니메이션 관련
        this.scoreAnimationTimer = 0;
        this.gameOverBlinkTimer = 0;
        this.gameOverBlinkState = true;
        
        // 초기화
        this.init();
    }
    
    init() {
        // 초기 UI 상태 설정
        this.updateScore(0);
        this.showStartScreen();
        
        // 리사이즈 이벤트 리스너
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();
    }
    
    // 점수 업데이트
    updateScore(score) {
        this.currentScore = score;
        if (this.scoreElement) {
            this.scoreElement.textContent = score.toLocaleString();
        }
        
        // 최고 점수 업데이트
        if (score > this.highScore) {
            this.highScore = score;
            StorageUtils.save('highScore', this.highScore);
        }
    }
    
    // 점수 증가 애니메이션
    animateScoreIncrease() {
        if (this.scoreElement) {
            this.scoreElement.classList.add('score-increase');
            
            // 애니메이션 제거
            setTimeout(() => {
                this.scoreElement.classList.remove('score-increase');
            }, 300);
        }
    }
    
    // 시작 화면 표시
    showStartScreen() {
        this.isGameInfoVisible = true;
        if (this.gameInfoElement) {
            this.gameInfoElement.style.display = 'block';
        }
        
        if (this.gameStatusElement) {
            this.gameStatusElement.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <h2 style="color: #00ffff; margin: 0 0 10px 0;">DemoGame</h2>
                    <p style="margin: 5px 0;">종스크롤 슈팅게임</p>
                </div>
                <div style="margin-bottom: 15px;">
                    <p>최고 점수: ${this.highScore.toLocaleString()}</p>
                </div>
                <div>
                    <p style="color: #ffff00;">스페이스바를 눌러 시작</p>
                </div>
            `;
            this.gameStatusElement.classList.remove('game-over');
        }
    }
    
    // 게임 오버 화면 표시
    showGameOver(finalScore) {
        this.isGameInfoVisible = true;
        if (this.gameInfoElement) {
            this.gameInfoElement.style.display = 'block';
        }
        
        if (this.gameStatusElement) {
            const isNewRecord = finalScore > this.highScore;
            
            this.gameStatusElement.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <h2 style="color: #ff4444; margin: 0 0 10px 0;">게임 오버</h2>
                </div>
                <div style="margin-bottom: 15px;">
                    <p>점수: ${finalScore.toLocaleString()}</p>
                    <p>최고 점수: ${this.highScore.toLocaleString()}</p>
                    ${isNewRecord ? '<p style="color: #ffff00;">🎉 신기록!</p>' : ''}
                </div>
                <div>
                    <p style="color: #00ffff;">R키를 눌러 재시작</p>
                </div>
            `;
            this.gameStatusElement.classList.add('game-over');
        }
    }
    
    // 게임 정보 숨기기
    hideGameInfo() {
        this.isGameInfoVisible = false;
        if (this.gameInfoElement) {
            this.gameInfoElement.style.display = 'none';
        }
    }
    
    // 일시정지 화면 표시
    showPauseScreen() {
        this.isGameInfoVisible = true;
        if (this.gameInfoElement) {
            this.gameInfoElement.style.display = 'block';
        }
        
        if (this.gameStatusElement) {
            this.gameStatusElement.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <h2 style="color: #ffff00; margin: 0 0 10px 0;">일시정지</h2>
                </div>
                <div>
                    <p style="color: #00ffff;">P키를 눌러 계속</p>
                </div>
            `;
            this.gameStatusElement.classList.remove('game-over');
        }
    }
    
    // 캔버스에 직접 UI 렌더링 (HUD)
    renderHUD(ctx, gameState) {
        // 게임 플레이 중일 때만 HUD 표시
        if (gameState !== 'playing') return;
        
        ctx.save();
        
        // 반투명 배경
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, this.canvas.width, 40);
        
        // 점수 표시
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`점수: ${this.currentScore.toLocaleString()}`, 10, 25);
        
        // 최고 점수 표시
        ctx.fillStyle = '#ffff00';
        ctx.font = '14px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`최고: ${this.highScore.toLocaleString()}`, this.canvas.width - 10, 25);
        
        ctx.restore();
    }
    
    // 로딩 화면 표시
    showLoadingScreen(progress = 0) {
        if (this.gameStatusElement) {
            this.gameStatusElement.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <h2 style="color: #00ffff; margin: 0 0 10px 0;">로딩 중...</h2>
                </div>
                <div style="margin-bottom: 15px;">
                    <div style="width: 200px; height: 10px; background: #333; border: 1px solid #00ffff; margin: 0 auto;">
                        <div style="width: ${progress}%; height: 100%; background: #00ffff; transition: width 0.3s;"></div>
                    </div>
                </div>
                <div>
                    <p>${Math.round(progress)}%</p>
                </div>
            `;
        }
    }
    
    // 레벨 표시
    showLevelTransition(level) {
        // 임시 레벨 표시 요소 생성
        const levelDisplay = document.createElement('div');
        levelDisplay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: #00ffff;
            padding: 20px 40px;
            border: 2px solid #00ffff;
            border-radius: 10px;
            font-size: 24px;
            font-weight: bold;
            z-index: 1000;
            animation: levelFade 2s ease-in-out;
        `;
        levelDisplay.textContent = `레벨 ${level}`;
        
        // 애니메이션 CSS 추가
        if (!document.getElementById('levelAnimationStyle')) {
            const style = document.createElement('style');
            style.id = 'levelAnimationStyle';
            style.textContent = `
                @keyframes levelFade {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                    80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(levelDisplay);
        
        // 2초 후 제거
        setTimeout(() => {
            if (levelDisplay.parentNode) {
                levelDisplay.parentNode.removeChild(levelDisplay);
            }
        }, 2000);
    }
    
    // 파워업 알림 표시
    showPowerUpNotification(powerUpName) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 0, 0.9);
            color: #000;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            z-index: 1000;
            animation: powerUpFade 1.5s ease-in-out;
        `;
        notification.textContent = `${powerUpName} 획득!`;
        
        // 애니메이션 CSS 추가
        if (!document.getElementById('powerUpAnimationStyle')) {
            const style = document.createElement('style');
            style.id = 'powerUpAnimationStyle';
            style.textContent = `
                @keyframes powerUpFade {
                    0% { opacity: 0; transform: translate(-50%, -50%) translateY(-20px); }
                    20% { opacity: 1; transform: translate(-50%, -50%) translateY(0); }
                    80% { opacity: 1; transform: translate(-50%, -50%) translateY(0); }
                    100% { opacity: 0; transform: translate(-50%, -50%) translateY(20px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 1500);
    }
    
    // 데미지 표시 (적이 맞았을 때)
    showDamageNumber(x, y, damage) {
        const canvas = this.canvas;
        const rect = canvas.getBoundingClientRect();
        
        const damageElement = document.createElement('div');
        damageElement.style.cssText = `
            position: fixed;
            left: ${rect.left + x}px;
            top: ${rect.top + y}px;
            color: #ff4444;
            font-size: 14px;
            font-weight: bold;
            pointer-events: none;
            z-index: 999;
            animation: damageFloat 1s ease-out forwards;
        `;
        damageElement.textContent = `-${damage}`;
        
        // 애니메이션 CSS 추가
        if (!document.getElementById('damageAnimationStyle')) {
            const style = document.createElement('style');
            style.id = 'damageAnimationStyle';
            style.textContent = `
                @keyframes damageFloat {
                    0% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-30px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(damageElement);
        
        setTimeout(() => {
            if (damageElement.parentNode) {
                damageElement.parentNode.removeChild(damageElement);
            }
        }, 1000);
    }
    
    // 화면 크기 조정 처리
    handleResize() {
        // 반응형 UI 조정
        const canvas = this.canvas;
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // 모바일에서 UI 크기 조정
            if (this.gameStatusElement) {
                this.gameStatusElement.style.fontSize = '18px';
            }
        } else {
            // 데스크톱에서 UI 크기 조정
            if (this.gameStatusElement) {
                this.gameStatusElement.style.fontSize = '24px';
            }
        }
    }
    
    // 디버그 정보 표시
    showDebugInfo(debugData) {
        let debugElement = document.getElementById('debugInfo');
        
        if (!debugElement) {
            debugElement = document.createElement('div');
            debugElement.id = 'debugInfo';
            debugElement.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: #00ff00;
                padding: 10px;
                font-family: monospace;
                font-size: 12px;
                border: 1px solid #00ff00;
                z-index: 1000;
                max-width: 300px;
            `;
            document.body.appendChild(debugElement);
        }
        
        debugElement.innerHTML = `
            <div>FPS: ${debugData.fps || 0}</div>
            <div>Entities: ${debugData.entityCount || 0}</div>
            <div>Enemies: ${debugData.enemyCount || 0}</div>
            <div>Bullets: ${debugData.bulletCount || 0}</div>
            <div>Particles: ${debugData.particleCount || 0}</div>
            <div>Memory: ${debugData.memoryUsage || 'N/A'}</div>
        `;
    }
    
    // 디버그 정보 숨기기
    hideDebugInfo() {
        const debugElement = document.getElementById('debugInfo');
        if (debugElement) {
            debugElement.remove();
        }
    }
    
    // 컨트롤 도움말 표시/숨기기
    toggleControlsHelp() {
        const helpElement = document.querySelector('.controls-info');
        if (helpElement) {
            helpElement.style.display = helpElement.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    // UI 정리
    cleanup() {
        // 생성된 임시 요소들 정리
        const tempElements = [
            'debugInfo',
            'levelAnimationStyle',
            'powerUpAnimationStyle',
            'damageAnimationStyle'
        ];
        
        tempElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.remove();
            }
        });
        
        // 이벤트 리스너 제거
        window.removeEventListener('resize', this.handleResize);
    }
    
    // 게임 상태에 따른 UI 업데이트
    update(gameState, deltaTime) {
        // 애니메이션 타이머 업데이트
        if (this.scoreAnimationTimer > 0) {
            this.scoreAnimationTimer -= deltaTime;
        }
        
        // 게임 오버 깜빡임 효과
        if (gameState === 'game_over') {
            this.gameOverBlinkTimer += deltaTime;
            if (this.gameOverBlinkTimer >= 500) { // 0.5초마다 깜빡임
                this.gameOverBlinkState = !this.gameOverBlinkState;
                this.gameOverBlinkTimer = 0;
                
                if (this.gameStatusElement) {
                    this.gameStatusElement.style.opacity = this.gameOverBlinkState ? '1' : '0.5';
                }
            }
        } else {
            // 게임 오버가 아닐 때는 불투명도 초기화
            if (this.gameStatusElement) {
                this.gameStatusElement.style.opacity = '1';
            }
        }
    }
}