class Player {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.size = new Vector2(32, 48);
        this.speed = 200;
        
        this.health = 1;
        this.maxHealth = 1;
        this.lives = 3;
        
        this.laserPower = 1;
        this.bombPower = 1;
        this.fireRate = 0.2;
        this.lastFireTime = 0;
        this.bombCooldown = 0.5;
        this.lastBombTime = 0;
        
        this.invulnerable = false;
        this.invulnerabilityTime = 2.0;
        this.invulnerabilityTimer = 0;
        
        this.active = true;
        this.visible = true;
        
        this.options = [];
        this.hasShield = false;
        this.shieldTimer = 0;
        
        this.animation = {
            frame: 0,
            time: 0,
            speed: 0.1
        };
        
        this.respawnPosition = new Vector2(x, y);
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        this.updateInvulnerability(deltaTime);
        this.updateShield(deltaTime);
        this.updateAnimation(deltaTime);
        this.updateOptions(deltaTime);
        this.constrainToScreen();
    }
    
    updateInvulnerability(deltaTime) {
        if (this.invulnerable) {
            this.invulnerabilityTimer -= deltaTime;
            if (this.invulnerabilityTimer <= 0) {
                this.invulnerable = false;
                this.visible = true;
            } else {
                this.visible = Math.floor(this.invulnerabilityTimer * 10) % 2 === 0;
            }
        }
    }
    
    updateShield(deltaTime) {
        if (this.hasShield) {
            this.shieldTimer -= deltaTime;
            if (this.shieldTimer <= 0) {
                this.hasShield = false;
            }
        }
    }
    
    updateAnimation(deltaTime) {
        this.animation.time += deltaTime;
        if (this.animation.time >= this.animation.speed) {
            this.animation.frame = (this.animation.frame + 1) % 4;
            this.animation.time = 0;
        }
    }
    
    updateOptions(deltaTime) {
        this.options.forEach((option, index) => {
            const angle = (Date.now() * 0.003) + (index * Math.PI * 2 / this.options.length);
            const radius = 40;
            option.position.x = this.position.x + Math.cos(angle) * radius;
            option.position.y = this.position.y + Math.sin(angle) * radius;
            option.update(deltaTime);
        });
    }
    
    move(direction) {
        this.position = this.position.add(direction);
    }
    
    constrainToScreen() {
        this.position.x = clamp(this.position.x, this.size.x / 2, 800 - this.size.x / 2);
        this.position.y = clamp(this.position.y, this.size.y / 2, 600 - this.size.y / 2);
    }
    
    canFire() {
        return Date.now() - this.lastFireTime >= this.fireRate * 1000;
    }
    
    canFireBomb() {
        return Date.now() - this.lastBombTime >= this.bombCooldown * 1000;
    }
    
    fire() {
        if (this.canFire()) {
            this.lastFireTime = Date.now();
            return true;
        }
        return false;
    }
    
    fireBomb() {
        if (this.canFireBomb()) {
            this.lastBombTime = Date.now();
            return true;
        }
        return false;
    }
    
    takeDamage() {
        if (this.invulnerable || this.hasShield) {
            return false;
        }
        
        this.health--;
        
        if (this.health <= 0) {
            this.die();
            return true;
        }
        
        this.startInvulnerability();
        return true;
    }
    
    die() {
        this.active = false;
        this.lives--;
        
        if (this.lives > 0) {
            setTimeout(() => {
                this.respawn();
            }, 1000);
        }
    }
    
    respawn() {
        this.position = new Vector2(this.respawnPosition.x, this.respawnPosition.y);
        this.health = this.maxHealth;
        this.active = true;
        this.visible = true;
        this.startInvulnerability();
        
        this.laserPower = Math.max(1, this.laserPower - 1);
        this.bombPower = Math.max(1, this.bombPower - 1);
        this.options = this.options.slice(0, Math.max(0, this.options.length - 1));
    }
    
    startInvulnerability() {
        this.invulnerable = true;
        this.invulnerabilityTimer = this.invulnerabilityTime;
    }
    
    addLaserPower() {
        this.laserPower = Math.min(5, this.laserPower + 1);
    }
    
    addBombPower() {
        this.bombPower = Math.min(5, this.bombPower + 1);
    }
    
    addOption() {
        if (this.options.length < 2) {
            this.options.push(new PlayerOption(this.position.x, this.position.y));
        }
    }
    
    addShield(duration = 10) {
        this.hasShield = true;
        this.shieldTimer = duration;
    }
    
    increaseSpeed() {
        this.speed = Math.min(300, this.speed + 50);
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
        if (!this.visible || !this.active) return;
        
        ctx.save();
        
        this.renderShield(ctx);
        this.renderPlayer(ctx);
        this.renderOptions(ctx);
        
        ctx.restore();
    }
    
    renderPlayer(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const width = this.size.x;
        const height = this.size.y;
        
        ctx.fillStyle = '#00ff00';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(x, y - height/2);
        ctx.lineTo(x - width/4, y + height/4);
        ctx.lineTo(x - width/2, y + height/2);
        ctx.lineTo(x + width/2, y + height/2);
        ctx.lineTo(x + width/4, y + height/4);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 2, y - 10, 4, 8);
        ctx.fillRect(x - 6, y + 5, 4, 6);
        ctx.fillRect(x + 2, y + 5, 4, 6);
        
        if (this.laserPower > 1) {
            ctx.fillStyle = '#ffff00';
            const powerBars = this.laserPower - 1;
            for (let i = 0; i < powerBars; i++) {
                ctx.fillRect(x - width/2 + i * 3, y - height/2 - 5, 2, 3);
                ctx.fillRect(x + width/2 - i * 3 - 2, y - height/2 - 5, 2, 3);
            }
        }
    }
    
    renderShield(ctx) {
        if (this.hasShield) {
            const alpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.2;
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, 30, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
    
    renderOptions(ctx) {
        this.options.forEach(option => {
            option.render(ctx);
        });
    }
}

class PlayerOption {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.size = new Vector2(16, 20);
        this.active = true;
        
        this.fireRate = 0.3;
        this.lastFireTime = 0;
    }
    
    update(deltaTime) {
        // Options automatically fire
    }
    
    canFire() {
        return Date.now() - this.lastFireTime >= this.fireRate * 1000;
    }
    
    fire() {
        if (this.canFire()) {
            this.lastFireTime = Date.now();
            return true;
        }
        return false;
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
        const width = this.size.x;
        const height = this.size.y;
        
        ctx.fillStyle = '#ffaa00';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.moveTo(x, y - height/2);
        ctx.lineTo(x - width/3, y + height/3);
        ctx.lineTo(x - width/2, y + height/2);
        ctx.lineTo(x + width/2, y + height/2);
        ctx.lineTo(x + width/3, y + height/3);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }
}