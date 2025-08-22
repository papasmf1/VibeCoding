class UI {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.floatingMessages = [];
        
        this.elements = {
            score: document.getElementById('scoreValue'),
            lives: document.getElementById('livesValue'),
            stage: document.getElementById('stageValue'),
            laserPower: document.getElementById('laserPowerValue'),
            bombPower: document.getElementById('bombPowerValue'),
            finalScore: document.getElementById('finalScoreValue')
        };
        
        this.initializeUI();
    }
    
    initializeUI() {
        this.updateScore(0);
        this.updateLives(3);
        this.updateStage(1);
        this.updateWeaponPowers(1, 1);
    }
    
    update(deltaTime) {
        this.updateFloatingMessages(deltaTime);
        this.updateWeaponDisplays();
    }
    
    updateFloatingMessages(deltaTime) {
        this.floatingMessages.forEach(message => {
            message.update(deltaTime);
        });
        
        this.floatingMessages = this.floatingMessages.filter(message => message.active);
    }
    
    updateWeaponDisplays() {
        if (this.gameEngine.player) {
            this.updateWeaponPowers(
                this.gameEngine.player.laserPower,
                this.gameEngine.player.bombPower
            );
        }
    }
    
    updateScore(score) {
        if (this.elements.score) {
            this.elements.score.textContent = score.toLocaleString();
        }
    }
    
    updateLives(lives) {
        if (this.elements.lives) {
            this.elements.lives.textContent = lives;
            
            // Visual feedback for low lives
            if (lives <= 1) {
                this.elements.lives.style.color = '#ff0000';
                this.elements.lives.style.animation = 'blink 1s infinite';
            } else {
                this.elements.lives.style.color = '#00ff00';
                this.elements.lives.style.animation = 'none';
            }
        }
    }
    
    updateStage(stage) {
        if (this.elements.stage) {
            this.elements.stage.textContent = stage;
        }
    }
    
    updateWeaponPowers(laserPower, bombPower) {
        if (this.elements.laserPower) {
            this.elements.laserPower.textContent = laserPower;
            this.elements.laserPower.style.color = this.getPowerColor(laserPower);
        }
        
        if (this.elements.bombPower) {
            this.elements.bombPower.textContent = bombPower;
            this.elements.bombPower.style.color = this.getPowerColor(bombPower);
        }
    }
    
    getPowerColor(power) {
        const colors = ['#ffffff', '#00ff00', '#ffff00', '#ff8800', '#ff0000', '#ff00ff'];
        return colors[Math.min(power - 1, colors.length - 1)];
    }
    
    updateFinalScore(score) {
        if (this.elements.finalScore) {
            this.elements.finalScore.textContent = score.toLocaleString();
        }
    }
    
    showFloatingMessage(text, x, y, color = '#ffffff', duration = 2.0) {
        const message = new FloatingMessage(text, x, y, color, duration);
        this.floatingMessages.push(message);
    }
    
    showComboMessage(combo, x, y) {
        const comboTexts = [
            '', 'NICE!', 'GREAT!', 'AWESOME!', 'EXCELLENT!', 'FANTASTIC!', 'INCREDIBLE!'
        ];
        
        const text = combo < comboTexts.length ? comboTexts[combo] : 'LEGENDARY!';
        const color = combo >= 5 ? '#ff00ff' : combo >= 3 ? '#ffff00' : '#00ff00';
        
        this.showFloatingMessage(`${text} ${combo}x COMBO!`, x, y, color, 1.5);
    }
    
    showBossWarning() {
        this.showFloatingMessage(
            'WARNING: BOSS APPROACHING!',
            this.gameEngine.width / 2,
            this.gameEngine.height / 2,
            '#ff0000',
            3.0
        );
    }
    
    showStageComplete(stage) {
        this.showFloatingMessage(
            `STAGE ${stage} COMPLETE!`,
            this.gameEngine.width / 2,
            this.gameEngine.height / 2,
            '#00ffff',
            2.5
        );
    }
    
    render(ctx) {
        this.renderFloatingMessages(ctx);
        this.renderMinimap(ctx);
        this.renderDebugInfo(ctx);
    }
    
    renderFloatingMessages(ctx) {
        this.floatingMessages.forEach(message => {
            message.render(ctx);
        });
    }
    
    renderMinimap(ctx) {
        if (this.gameEngine.gameState !== 'playing') return;
        
        const minimapWidth = 100;
        const minimapHeight = 80;
        const minimapX = this.gameEngine.width - minimapWidth - 10;
        const minimapY = 50;
        
        ctx.save();
        
        // Minimap background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(minimapX, minimapY, minimapWidth, minimapHeight);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(minimapX, minimapY, minimapWidth, minimapHeight);
        
        // Player position
        const playerX = minimapX + (this.gameEngine.player.position.x / this.gameEngine.width) * minimapWidth;
        const playerY = minimapY + (this.gameEngine.player.position.y / this.gameEngine.height) * minimapHeight;
        
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(playerX, playerY, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Enemies on minimap
        this.gameEngine.enemyManager.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            const enemyX = minimapX + (enemy.position.x / this.gameEngine.width) * minimapWidth;
            const enemyY = minimapY + (enemy.position.y / this.gameEngine.height) * minimapHeight;
            
            ctx.fillStyle = enemy.health > 5 ? '#ff0000' : '#ff4444';
            ctx.beginPath();
            ctx.arc(enemyX, enemyY, 1, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Powerups on minimap
        this.gameEngine.powerupManager.powerups.forEach(powerup => {
            if (!powerup.active) return;
            
            const powerupX = minimapX + (powerup.position.x / this.gameEngine.width) * minimapWidth;
            const powerupY = minimapY + (powerup.position.y / this.gameEngine.height) * minimapHeight;
            
            ctx.fillStyle = powerup.color;
            ctx.beginPath();
            ctx.arc(powerupX, powerupY, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    renderDebugInfo(ctx) {
        if (this.gameEngine.gameState !== 'playing') return;
        
        // Only show in debug mode (could be toggled with a key)
        if (!this.debugMode) return;
        
        ctx.save();
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, this.gameEngine.height - 120, 200, 110);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        
        const debugInfo = [
            `FPS: ${Math.round(1 / this.gameEngine.deltaTime)}`,
            `Entities: ${this.gameEngine.entities.length}`,
            `Enemies: ${this.gameEngine.enemyManager.enemies.length}`,
            `Lasers: ${this.gameEngine.weaponSystem.lasers.length}`,
            `Bombs: ${this.gameEngine.weaponSystem.bombs.length}`,
            `Powerups: ${this.gameEngine.powerupManager.powerups.length}`,
            `Particles: ${this.gameEngine.particleManager.particles.length}`,
            `Player Pos: ${Math.round(this.gameEngine.player.position.x)}, ${Math.round(this.gameEngine.player.position.y)}`
        ];
        
        debugInfo.forEach((info, index) => {
            ctx.fillText(info, 15, this.gameEngine.height - 105 + index * 14);
        });
        
        ctx.restore();
    }
    
    toggleDebug() {
        this.debugMode = !this.debugMode;
    }
    
    // Screen transition effects
    fadeIn(duration = 1.0) {
        // Create fade in effect
        this.createScreenEffect('fadeIn', duration);
    }
    
    fadeOut(duration = 1.0) {
        // Create fade out effect
        this.createScreenEffect('fadeOut', duration);
    }
    
    createScreenEffect(type, duration) {
        // This could be implemented with CSS transitions or canvas effects
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'black';
        overlay.style.zIndex = '1000';
        overlay.style.pointerEvents = 'none';
        
        if (type === 'fadeIn') {
            overlay.style.opacity = '1';
            overlay.style.transition = `opacity ${duration}s`;
            document.body.appendChild(overlay);
            
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, duration * 1000);
            }, 50);
        } else if (type === 'fadeOut') {
            overlay.style.opacity = '0';
            overlay.style.transition = `opacity ${duration}s`;
            document.body.appendChild(overlay);
            
            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 50);
        }
    }
}

class FloatingMessage {
    constructor(text, x, y, color = '#ffffff', duration = 2.0) {
        this.text = text;
        this.position = new Vector2(x, y);
        this.startPosition = new Vector2(x, y);
        this.color = color;
        this.duration = duration;
        this.life = duration;
        this.active = true;
        
        this.velocity = new Vector2(0, -30); // Float upward
        this.scale = 1.0;
        this.alpha = 1.0;
        
        this.fontSize = 16;
        this.font = 'bold';
    }
    
    update(deltaTime) {
        this.life -= deltaTime;
        
        if (this.life <= 0) {
            this.active = false;
            return;
        }
        
        // Update position
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        
        // Fade out near the end
        const fadeTime = this.duration * 0.3;
        if (this.life <= fadeTime) {
            this.alpha = this.life / fadeTime;
        }
        
        // Scale effect
        const progress = 1 - (this.life / this.duration);
        if (progress < 0.1) {
            this.scale = progress / 0.1;
        } else if (progress > 0.9) {
            this.scale = 1 - ((progress - 0.9) / 0.1) * 0.5;
        }
    }
    
    render(ctx) {
        if (!this.active || this.alpha <= 0) return;
        
        ctx.save();
        
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        const fontSize = Math.round(this.fontSize * this.scale);
        ctx.font = `${this.font} ${fontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Text outline
        ctx.strokeText(this.text, this.position.x, this.position.y);
        
        // Text fill
        ctx.fillText(this.text, this.position.x, this.position.y);
        
        ctx.restore();
    }
}