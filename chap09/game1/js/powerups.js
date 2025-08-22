class PowerupManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.powerups = [];
        this.spawnTimer = 0;
        this.spawnInterval = 15.0; // Spawn powerup every 15 seconds
    }
    
    update(deltaTime) {
        this.updatePowerups(deltaTime);
        this.updateSpawning(deltaTime);
        this.cleanup();
    }
    
    updatePowerups(deltaTime) {
        this.powerups.forEach(powerup => {
            powerup.update(deltaTime);
        });
    }
    
    updateSpawning(deltaTime) {
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnRandomPowerup();
            this.spawnTimer = 0;
        }
    }
    
    spawnPowerup(x, y, type = null) {
        if (!type) {
            type = this.getRandomPowerupType();
        }
        
        const powerup = new Powerup(x, y, type, this.gameEngine);
        this.powerups.push(powerup);
    }
    
    spawnRandomPowerup() {
        const x = Math.random() * (this.gameEngine.width - 60) + 30;
        const y = -30;
        this.spawnPowerup(x, y);
    }
    
    getRandomPowerupType() {
        const types = ['laser', 'bomb', 'option', 'shield', 'speed', 'life'];
        const weights = {
            'laser': 25,
            'bomb': 25,
            'option': 20,
            'shield': 15,
            'speed': 10,
            'life': 5
        };
        
        const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (const type of types) {
            random -= weights[type];
            if (random <= 0) {
                return type;
            }
        }
        
        return 'laser';
    }
    
    cleanup() {
        this.powerups = this.powerups.filter(powerup => powerup.active);
    }
    
    render(ctx) {
        this.powerups.forEach(powerup => powerup.render(ctx));
    }
}

class Powerup {
    constructor(x, y, type, gameEngine = null) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 50);
        this.type = type;
        this.size = new Vector2(24, 24);
        this.active = true;
        this.gameEngine = gameEngine;
        
        this.floatOffset = 0;
        this.floatSpeed = 3;
        this.floatAmplitude = 5;
        
        this.glowTimer = 0;
        this.glowSpeed = 4;
        
        this.lifeTimer = 10; // Powerup disappears after 10 seconds
        
        this.color = this.getTypeColor(type);
        this.icon = this.getTypeIcon(type);
    }
    
    getTypeColor(type) {
        const colors = {
            'laser': '#00ff00',
            'bomb': '#ffaa00',
            'option': '#00ffff',
            'shield': '#0080ff',
            'speed': '#ff00ff',
            'life': '#ff0000'
        };
        return colors[type] || '#ffffff';
    }
    
    getTypeIcon(type) {
        const icons = {
            'laser': 'L',
            'bomb': 'B',
            'option': 'O',
            'shield': 'S',
            'speed': '>',
            'life': '♥'
        };
        return icons[type] || '?';
    }
    
    update(deltaTime) {
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        
        this.floatOffset += this.floatSpeed * deltaTime;
        this.glowTimer += this.glowSpeed * deltaTime;
        this.lifeTimer -= deltaTime;
        
        if (this.lifeTimer <= 0) {
            this.active = false;
        }
        
        // Add slight floating motion
        this.position.y += Math.sin(this.floatOffset) * this.floatAmplitude * deltaTime;
    }
    
    collect(player) {
        this.active = false;
        
        switch (this.type) {
            case 'laser':
                player.addLaserPower();
                this.showMessage(`레이저 강화! 레벨 ${player.laserPower}`);
                break;
                
            case 'bomb':
                player.addBombPower();
                this.showMessage(`폭탄 강화! 레벨 ${player.bombPower}`);
                break;
                
            case 'option':
                player.addOption();
                this.showMessage(`옵션 추가! 옵션 수: ${player.options.length}`);
                break;
                
            case 'shield':
                player.addShield(8);
                this.showMessage('실드 획득! 8초간 무적');
                break;
                
            case 'speed':
                player.increaseSpeed();
                this.showMessage('스피드 업!');
                break;
                
            case 'life':
                if (this.gameEngine) {
                    this.gameEngine.lives++;
                    this.gameEngine.ui.updateLives(this.gameEngine.lives);
                }
                this.showMessage('라이프 추가!');
                break;
        }
        
        // Add score bonus
        if (this.gameEngine) {
            this.gameEngine.addScore(200);
        }
    }
    
    showMessage(text) {
        // Create floating message
        if (this.gameEngine && this.gameEngine.ui) {
            this.gameEngine.ui.showFloatingMessage(
                text,
                this.position.x,
                this.position.y - 20,
                this.color
            );
        }
    }
    
    getBounds() {
        return new Rectangle(
            this.position.x - this.size.x / 2,
            this.position.y - this.size.y / 2,
            this.size.x,
            this.size.y
        );
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size.x;
        
        // Glow effect
        const glowAlpha = 0.3 + Math.sin(this.glowTimer) * 0.2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.globalAlpha = glowAlpha;
        
        // Outer glow
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, size / 2 + 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        
        // Main powerup body
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        // Draw hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const px = x + Math.cos(angle) * size / 2;
            const py = y + Math.sin(angle) * size / 2;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Inner background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(x, y, size / 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Icon/Symbol
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, x, y);
        
        // Warning flash when about to expire
        if (this.lifeTimer < 3) {
            const flashAlpha = Math.sin(this.lifeTimer * 8) * 0.5 + 0.5;
            ctx.globalAlpha = flashAlpha;
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        // Type-specific additional effects
        this.renderTypeEffect(ctx, x, y, size);
        
        ctx.restore();
    }
    
    renderTypeEffect(ctx, x, y, size) {
        switch (this.type) {
            case 'laser':
                // Laser beam effects
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.6;
                
                for (let i = 0; i < 3; i++) {
                    const offset = (i - 1) * 8;
                    ctx.beginPath();
                    ctx.moveTo(x + offset, y - size);
                    ctx.lineTo(x + offset, y - size/3);
                    ctx.stroke();
                }
                break;
                
            case 'bomb':
                // Explosion particles
                ctx.fillStyle = '#ff4400';
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2 + this.glowTimer * 0.5;
                    const distance = size / 2 + 4;
                    const px = x + Math.cos(angle) * distance;
                    const py = y + Math.sin(angle) * distance;
                    
                    ctx.beginPath();
                    ctx.arc(px, py, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'option':
                // Orbiting dots
                ctx.fillStyle = this.color;
                for (let i = 0; i < 2; i++) {
                    const angle = (i / 2) * Math.PI * 2 + this.glowTimer;
                    const distance = size / 2 + 6;
                    const px = x + Math.cos(angle) * distance;
                    const py = y + Math.sin(angle) * distance;
                    
                    ctx.beginPath();
                    ctx.arc(px, py, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'shield':
                // Shield rings
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.4;
                
                for (let i = 1; i <= 2; i++) {
                    const radius = size / 2 + i * 6;
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
                break;
                
            case 'speed':
                // Speed lines
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.6;
                
                for (let i = 0; i < 3; i++) {
                    const offset = (i - 1) * 4;
                    ctx.beginPath();
                    ctx.moveTo(x - size, y + offset);
                    ctx.lineTo(x + size, y + offset);
                    ctx.stroke();
                }
                break;
                
            case 'life':
                // Pulse effect
                const pulseRadius = size / 2 + Math.sin(this.glowTimer * 2) * 4;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 3;
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
                ctx.stroke();
                break;
        }
    }
}