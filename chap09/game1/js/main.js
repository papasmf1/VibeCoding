// Global game instance
let game = null;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

function initializeGame() {
    try {
        // Create the game engine instance
        game = new GameEngine();
        
        // Setup additional event listeners
        setupGlobalEventListeners();
        
        // Enable audio on first user interaction
        enableAudioOnInteraction();
        
        // Start the game loop
        game.start();
        
        console.log('Neo Xevious initialized successfully!');
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showErrorMessage('게임 초기화에 실패했습니다. 브라우저를 새로고침해 주세요.');
    }
}

function setupGlobalEventListeners() {
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Handle visibility changes (tab switching)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle window focus/blur
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    
    // Handle touch events for mobile
    setupTouchControls();
    
    // Handle debug key
    document.addEventListener('keydown', (e) => {
        if (e.code === 'F3') {
            e.preventDefault();
            toggleDebug();
        }
    });
    
    // Prevent context menu on canvas
    const canvas = document.getElementById('gameCanvas');
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
}

function handleResize() {
    if (!game) return;
    
    // Simple responsive handling
    const container = document.getElementById('gameContainer');
    const canvas = document.getElementById('gameCanvas');
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Scale for mobile devices
    if (windowWidth < 900 || windowHeight < 700) {
        const scale = Math.min(windowWidth / 800, windowHeight / 600);
        container.style.transform = `scale(${scale})`;
        container.style.transformOrigin = 'center center';
    } else {
        container.style.transform = 'none';
    }
}

function handleVisibilityChange() {
    if (!game) return;
    
    if (document.hidden && game.gameState === 'playing') {
        game.pauseGame();
    }
}

function handleWindowFocus() {
    // Resume audio context if needed
    if (game && game.audioManager) {
        game.audioManager.resumeAudioContext();
    }
}

function handleWindowBlur() {
    if (!game) return;
    
    if (game.gameState === 'playing') {
        game.pauseGame();
    }
}

function setupTouchControls() {
    const canvas = document.getElementById('gameCanvas');
    let touchStartPos = null;
    let isMoving = false;
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        
        if (!game || game.gameState !== 'playing') return;
        
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        touchStartPos = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
        
        isMoving = true;
        
        // Simulate mouse position for crosshair
        game.mouse.x = touchStartPos.x;
        game.mouse.y = touchStartPos.y;
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        
        if (!game || game.gameState !== 'playing' || !isMoving) return;
        
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const touchPos = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
        
        // Calculate movement delta
        if (touchStartPos) {
            const deltaX = touchPos.x - touchStartPos.x;
            const deltaY = touchPos.y - touchStartPos.y;
            
            // Move player
            const moveSpeed = 200;
            const direction = new Vector2(deltaX, deltaY).normalize();
            game.player.move(direction.multiply(moveSpeed * game.deltaTime));
        }
        
        touchStartPos = touchPos;
        game.mouse.x = touchPos.x;
        game.mouse.y = touchPos.y;
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        
        if (!game || game.gameState !== 'playing') return;
        
        isMoving = false;
        
        // Fire laser on touch end
        if (game.player.canFire()) {
            game.weaponSystem.fireLaser(game.player.position, game.player.laserPower);
        }
        
        touchStartPos = null;
    }, { passive: false });
    
    // Double tap for bomb
    let lastTapTime = 0;
    canvas.addEventListener('touchstart', (e) => {
        const currentTime = Date.now();
        const tapDelay = currentTime - lastTapTime;
        
        if (tapDelay < 300 && tapDelay > 0) {
            // Double tap detected
            if (game && game.gameState === 'playing') {
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                const targetPos = new Vector2(
                    touch.clientX - rect.left,
                    touch.clientY - rect.top
                );
                
                game.weaponSystem.fireBomb(game.player.position, targetPos, game.player.bombPower);
            }
        }
        
        lastTapTime = currentTime;
    });
}

function enableAudioOnInteraction() {
    const enableAudio = async () => {
        if (game && game.audioManager) {
            await game.audioManager.enableAudio();
        }
        
        // Remove listeners after first interaction
        document.removeEventListener('click', enableAudio);
        document.removeEventListener('keydown', enableAudio);
        document.removeEventListener('touchstart', enableAudio);
    };
    
    // Add listeners for first user interaction
    document.addEventListener('click', enableAudio);
    document.addEventListener('keydown', enableAudio);
    document.addEventListener('touchstart', enableAudio);
}

function toggleDebug() {
    if (game && game.ui) {
        game.ui.toggleDebug();
    }
}

function showErrorMessage(message) {
    // Create error display
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 2rem;
        border-radius: 10px;
        font-family: 'Courier New', monospace;
        font-size: 1.2rem;
        text-align: center;
        z-index: 9999;
        max-width: 80%;
    `;
    
    errorDiv.innerHTML = `
        <h2>오류 발생</h2>
        <p>${message}</p>
        <button onclick="location.reload()" style="
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: #fff;
            color: #000;
            border: none;
            border-radius: 5px;
            font-family: inherit;
            cursor: pointer;
        ">새로고침</button>
    `;
    
    document.body.appendChild(errorDiv);
}

// Export for debugging purposes
window.game = game;

// Performance monitoring
if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('game-init-start');
    
    document.addEventListener('DOMContentLoaded', () => {
        performance.mark('game-init-end');
        performance.measure('game-initialization', 'game-init-start', 'game-init-end');
        
        // Log performance if needed
        const measures = performance.getEntriesByType('measure');
        measures.forEach(measure => {
            console.log(`${measure.name}: ${measure.duration.toFixed(2)}ms`);
        });
    });
}

// Handle browser compatibility issues
function checkBrowserCompatibility() {
    const features = {
        canvas: !!document.createElement('canvas').getContext,
        audioContext: !!(window.AudioContext || window.webkitAudioContext),
        requestAnimationFrame: !!window.requestAnimationFrame,
        localStorage: !!window.localStorage
    };
    
    const missingFeatures = Object.entries(features)
        .filter(([name, supported]) => !supported)
        .map(([name]) => name);
    
    if (missingFeatures.length > 0) {
        showErrorMessage(`브라우저가 다음 기능을 지원하지 않습니다: ${missingFeatures.join(', ')}`);
        return false;
    }
    
    return true;
}

// Check compatibility before initializing
if (checkBrowserCompatibility()) {
    console.log('Browser compatibility check passed');
} else {
    console.error('Browser compatibility check failed');
}

// Prevent common mobile scrolling issues
document.addEventListener('touchmove', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
}, { passive: false });

// Handle orientation changes on mobile
window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 100); // Delay to ensure proper viewport update
});

console.log('Neo Xevious - Main script loaded');
console.log('Controls: WASD/Arrow keys to move, Space/Z for laser, Shift/X for bomb, P to pause');