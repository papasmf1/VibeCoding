class GameStateManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentState = 'menu';
        
        // Ensure DOM is fully loaded before setting up event listeners
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.initializeScreens();
            });
        } else {
            this.setupEventListeners();
            this.initializeScreens();
        }
    }
    
    setupEventListeners() {
        // Menu buttons
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('Start button clicked');
                this.startNewGame();
            });
        }
        
        const highScoreBtn = document.getElementById('highScoreBtn');
        if (highScoreBtn) {
            highScoreBtn.addEventListener('click', () => {
                this.showHighScores();
            });
        }
        
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }
        
        // Game Over buttons
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.startNewGame();
            });
        }
        
        const mainMenuBtn = document.getElementById('mainMenuBtn');
        if (mainMenuBtn) {
            mainMenuBtn.addEventListener('click', () => {
                this.showMenu();
            });
        }
        
        // Pause buttons
        const resumeBtn = document.getElementById('resumeBtn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.resumeGame();
            });
        }
        
        const pauseMainMenuBtn = document.getElementById('pauseMainMenuBtn');
        if (pauseMainMenuBtn) {
            pauseMainMenuBtn.addEventListener('click', () => {
                this.showMenu();
            });
        }
    }
    
    initializeScreens() {
        this.showMenu();
    }
    
    showMenu() {
        this.hideAllScreens();
        document.getElementById('menuScreen').classList.remove('hidden');
        this.gameEngine.gameState = 'menu';
        this.gameEngine.audioManager.playMusic('menu');
    }
    
    startNewGame() {
        console.log('Starting new game...');
        this.hideAllScreens();
        const gameScreen = document.getElementById('gameScreen');
        if (gameScreen) {
            gameScreen.classList.remove('hidden');
        } else {
            console.error('Game screen element not found');
            return;
        }
        
        // Initialize game state directly instead of calling gameEngine.startNewGame()
        this.gameEngine.score = 0;
        this.gameEngine.lives = 3;
        this.gameEngine.stage = 1;
        this.gameEngine.gameState = 'playing';
        
        // Reset player position and game state
        if (this.gameEngine.player) {
            this.gameEngine.player.position = new Vector2(this.gameEngine.width / 2, this.gameEngine.height - 100);
            this.gameEngine.player.health = this.gameEngine.player.maxHealth;
            this.gameEngine.player.active = true;
            this.gameEngine.player.invulnerable = false;
            this.gameEngine.player.laserPower = 1;
            this.gameEngine.player.bombPower = 1;
            this.gameEngine.player.options = [];
        }
        // Clear all game objects
        this.gameEngine.entities = [];
        this.gameEngine.particleSystems = [];
        
        // Clear weapons and enemies
        if (this.gameEngine.weaponSystem) {
            this.gameEngine.weaponSystem.lasers = [];
            this.gameEngine.weaponSystem.bombs = [];
            this.gameEngine.weaponSystem.explosions = [];
        }
        
        if (this.gameEngine.enemyManager) {
            this.gameEngine.enemyManager.enemies = [];
        }
        
        if (this.gameEngine.powerupManager) {
            this.gameEngine.powerupManager.powerups = [];
        }
        
        if (this.gameEngine.particleManager) {
            this.gameEngine.particleManager.particles = [];
        }
        
        this.gameEngine.ui.updateScore(this.gameEngine.score);
        this.gameEngine.ui.updateLives(this.gameEngine.lives);
        this.gameEngine.ui.updateStage(this.gameEngine.stage);
        
        this.gameEngine.audioManager.playMusic('game');
        
        // Use UI fade effect if available
        if (this.gameEngine.ui && this.gameEngine.ui.fadeIn) {
            this.gameEngine.ui.fadeIn(0.5);
        }
        
        // Show game start message
        if (this.gameEngine.ui && this.gameEngine.ui.showFloatingMessage) {
            this.gameEngine.ui.showFloatingMessage(
                'MISSION START!',
                this.gameEngine.width / 2,
                this.gameEngine.height / 2,
                '#00ff00',
                2.0
            );
        }
    }
    
    showGameOverScreen() {
        document.getElementById('gameOverScreen').classList.remove('hidden');
        this.gameEngine.ui.updateFinalScore(this.gameEngine.score);
        
        // Save high score
        this.saveHighScore(this.gameEngine.score);
        
        // Show game over message
        this.gameEngine.ui.showFloatingMessage(
            'GAME OVER',
            this.gameEngine.width / 2,
            this.gameEngine.height / 2 - 50,
            '#ff0000',
            3.0
        );
        
        this.gameEngine.audioManager.playSound('gameOver');
    }
    
    showPauseScreen() {
        document.getElementById('pauseScreen').classList.remove('hidden');
    }
    
    hidePauseScreen() {
        document.getElementById('pauseScreen').classList.add('hidden');
    }
    
    resumeGame() {
        this.hidePauseScreen();
        this.gameEngine.resumeGame();
    }
    
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
    }
    
    showHighScores() {
        const highScores = this.getHighScores();
        
        // Create high score display
        const highScoreScreen = document.createElement('div');
        highScoreScreen.className = 'screen';
        highScoreScreen.id = 'highScoreScreen';
        highScoreScreen.innerHTML = `
            <h2>최고 기록</h2>
            <div class="high-scores">
                ${highScores.map((score, index) => 
                    `<div class="score-entry">
                        <span class="rank">${index + 1}.</span>
                        <span class="score">${score.toLocaleString()}</span>
                    </div>`
                ).join('')}
            </div>
            <div class="menu">
                <button id="backToMenuBtn">메인 메뉴</button>
            </div>
        `;
        
        // Remove existing high score screen if any
        const existingScreen = document.getElementById('highScoreScreen');
        if (existingScreen) {
            existingScreen.remove();
        }
        
        document.getElementById('gameContainer').appendChild(highScoreScreen);
        
        // Setup back button
        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            highScoreScreen.remove();
            this.showMenu();
        });
        
        this.hideAllScreens();
        highScoreScreen.classList.remove('hidden');
    }
    
    showSettings() {
        // Create settings screen
        const settingsScreen = document.createElement('div');
        settingsScreen.className = 'screen';
        settingsScreen.id = 'settingsScreen';
        settingsScreen.innerHTML = `
            <h2>설정</h2>
            <div class="settings">
                <div class="setting-item">
                    <label>음량</label>
                    <input type="range" id="volumeSlider" min="0" max="100" value="50">
                    <span id="volumeValue">50%</span>
                </div>
                <div class="setting-item">
                    <label>효과음</label>
                    <input type="range" id="sfxSlider" min="0" max="100" value="70">
                    <span id="sfxValue">70%</span>
                </div>
                <div class="setting-item">
                    <label>화질</label>
                    <select id="qualitySelect">
                        <option value="low">낮음</option>
                        <option value="medium" selected>보통</option>
                        <option value="high">높음</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label>자동 폭탄</label>
                    <input type="checkbox" id="autoBombCheck">
                </div>
            </div>
            <div class="menu">
                <button id="saveSettingsBtn">저장</button>
                <button id="cancelSettingsBtn">취소</button>
            </div>
        `;
        
        // Remove existing settings screen if any
        const existingScreen = document.getElementById('settingsScreen');
        if (existingScreen) {
            existingScreen.remove();
        }
        
        document.getElementById('gameContainer').appendChild(settingsScreen);
        
        // Load current settings
        this.loadSettings(settingsScreen);
        
        // Setup event listeners
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            document.getElementById('volumeValue').textContent = e.target.value + '%';
        });
        
        document.getElementById('sfxSlider').addEventListener('input', (e) => {
            document.getElementById('sfxValue').textContent = e.target.value + '%';
        });
        
        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveSettings(settingsScreen);
            settingsScreen.remove();
            this.showMenu();
        });
        
        document.getElementById('cancelSettingsBtn').addEventListener('click', () => {
            settingsScreen.remove();
            this.showMenu();
        });
        
        this.hideAllScreens();
        settingsScreen.classList.remove('hidden');
    }
    
    saveHighScore(score) {
        const highScores = this.getHighScores();
        highScores.push(score);
        highScores.sort((a, b) => b - a);
        highScores.splice(10); // Keep only top 10
        
        localStorage.setItem('neoXeviousHighScores', JSON.stringify(highScores));
    }
    
    getHighScores() {
        const saved = localStorage.getItem('neoXeviousHighScores');
        if (saved) {
            return JSON.parse(saved);
        }
        return [50000, 40000, 30000, 25000, 20000, 15000, 10000, 7500, 5000, 2500];
    }
    
    saveSettings(settingsScreen) {
        const settings = {
            volume: parseInt(settingsScreen.querySelector('#volumeSlider').value),
            sfx: parseInt(settingsScreen.querySelector('#sfxSlider').value),
            quality: settingsScreen.querySelector('#qualitySelect').value,
            autoBomb: settingsScreen.querySelector('#autoBombCheck').checked
        };
        
        localStorage.setItem('neoXeviousSettings', JSON.stringify(settings));
        
        // Apply settings
        this.applySettings(settings);
    }
    
    loadSettings(settingsScreen) {
        const saved = localStorage.getItem('neoXeviousSettings');
        let settings = {
            volume: 50,
            sfx: 70,
            quality: 'medium',
            autoBomb: false
        };
        
        if (saved) {
            settings = { ...settings, ...JSON.parse(saved) };
        }
        
        settingsScreen.querySelector('#volumeSlider').value = settings.volume;
        settingsScreen.querySelector('#volumeValue').textContent = settings.volume + '%';
        settingsScreen.querySelector('#sfxSlider').value = settings.sfx;
        settingsScreen.querySelector('#sfxValue').textContent = settings.sfx + '%';
        settingsScreen.querySelector('#qualitySelect').value = settings.quality;
        settingsScreen.querySelector('#autoBombCheck').checked = settings.autoBomb;
        
        this.applySettings(settings);
    }
    
    applySettings(settings) {
        // Apply volume settings
        if (this.gameEngine.audioManager) {
            this.gameEngine.audioManager.setMasterVolume(settings.volume / 100);
            this.gameEngine.audioManager.setSFXVolume(settings.sfx / 100);
        }
        
        // Apply quality settings
        this.applyQualitySettings(settings.quality);
        
        // Store settings for game logic
        this.gameEngine.settings = settings;
    }
    
    applyQualitySettings(quality) {
        switch (quality) {
            case 'low':
                this.gameEngine.particleQuality = 0.5;
                this.gameEngine.maxParticles = 50;
                break;
            case 'medium':
                this.gameEngine.particleQuality = 1.0;
                this.gameEngine.maxParticles = 100;
                break;
            case 'high':
                this.gameEngine.particleQuality = 1.5;
                this.gameEngine.maxParticles = 200;
                break;
        }
    }
    
    // Game state transitions with effects
    transitionTo(newState, duration = 0.5) {
        this.gameEngine.ui.fadeOut(duration / 2);
        
        setTimeout(() => {
            switch (newState) {
                case 'menu':
                    this.showMenu();
                    break;
                case 'playing':
                    this.startNewGame();
                    break;
                case 'gameOver':
                    this.showGameOverScreen();
                    break;
                case 'paused':
                    this.showPauseScreen();
                    break;
            }
            
            this.gameEngine.ui.fadeIn(duration / 2);
        }, (duration / 2) * 1000);
    }
    
    // Handle browser tab visibility changes
    handleVisibilityChange() {
        if (document.hidden && this.gameEngine.gameState === 'playing') {
            this.gameEngine.pauseGame();
        }
    }
    
    // Handle window focus/blur
    handleWindowFocus() {
        // Resume game logic if needed
    }
    
    handleWindowBlur() {
        if (this.gameEngine.gameState === 'playing') {
            this.gameEngine.pauseGame();
        }
    }
}

// Add CSS for settings and high scores
const style = document.createElement('style');
style.textContent = `
    .high-scores {
        margin: 2rem 0;
        min-width: 300px;
    }
    
    .score-entry {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        margin: 0.2rem 0;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
    }
    
    .rank {
        color: #ffff00;
        font-weight: bold;
    }
    
    .settings {
        margin: 2rem 0;
        min-width: 300px;
    }
    
    .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.8rem 0;
        border-bottom: 1px solid #333;
    }
    
    .setting-item label {
        color: #ccc;
        min-width: 80px;
    }
    
    .setting-item input[type="range"] {
        flex: 1;
        margin: 0 1rem;
    }
    
    .setting-item select {
        background: #222;
        color: #fff;
        border: 1px solid #555;
        padding: 0.3rem;
    }
    
    .setting-item span {
        min-width: 40px;
        text-align: right;
        color: #00ff00;
    }
    
    @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
    }
`;
document.head.appendChild(style);