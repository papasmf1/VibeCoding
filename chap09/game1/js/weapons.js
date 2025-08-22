class WeaponSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.lasers = [];
        this.bombs = [];
        this.explosions = [];
    }
    
    update(deltaTime) {
        this.updateLasers(deltaTime);
        this.updateBombs(deltaTime);
        this.updateExplosions(deltaTime);
        this.cleanup();
    }
    
    updateLasers(deltaTime) {
        this.lasers.forEach(laser => {
            laser.update(deltaTime);
        });
    }
    
    updateBombs(deltaTime) {
        this.bombs.forEach(bomb => {
            bomb.update(deltaTime);
        });
    }
    
    updateExplosions(deltaTime) {
        this.explosions.forEach(explosion => {
            explosion.update(deltaTime);
        });
    }
    
    fireLaser(position, power) {
        if (!this.gameEngine.player.canFire()) return;
        
        this.gameEngine.player.fire();
        
        const basePositions = [
            new Vector2(position.x, position.y - 20)
        ];
        
        if (power >= 2) {
            basePositions.push(
                new Vector2(position.x - 15, position.y - 10),
                new Vector2(position.x + 15, position.y - 10)
            );
        }
        
        if (power >= 4) {
            basePositions.push(
                new Vector2(position.x - 25, position.y),
                new Vector2(position.x + 25, position.y)
            );
        }
        
        basePositions.forEach(pos => {
            this.lasers.push(new Laser(pos, power));
        });
        
        this.gameEngine.player.options.forEach(option => {
            if (option.fire()) {
                this.lasers.push(new Laser(
                    new Vector2(option.position.x, option.position.y - 10),
                    Math.max(1, power - 1)
                ));
            }
        });
        
        this.gameEngine.audioManager.playSound('laser');
    }
    
    fireBomb(playerPosition, targetPosition, power) {
        if (!this.gameEngine.player.canFireBomb()) return;
        
        this.gameEngine.player.fireBomb();
        
        const bomb = new Bomb(playerPosition, targetPosition, power, this.gameEngine);
        this.bombs.push(bomb);
        
        this.gameEngine.audioManager.playSound('bomb');
    }
    
    createExplosion(position, size, damage) {
        const explosion = new Explosion(position, size, damage);
        this.explosions.push(explosion);
        
        this.gameEngine.particleManager.createExplosion(
            position.x,
            position.y,
            size
        );
        
        this.gameEngine.audioManager.playSound('explosion');
        
        return explosion;
    }
    
    cleanup() {
        this.lasers = this.lasers.filter(laser => laser.active);
        this.bombs = this.bombs.filter(bomb => bomb.active);
        this.explosions = this.explosions.filter(explosion => explosion.active);
    }
    
    render(ctx) {
        this.lasers.forEach(laser => laser.render(ctx));
        this.bombs.forEach(bomb => bomb.render(ctx));
        this.explosions.forEach(explosion => explosion.render(ctx));
    }
}

class Laser {
    constructor(position, power) {
        this.position = new Vector2(position.x, position.y);
        this.velocity = new Vector2(0, -400);
        this.size = new Vector2(4, 16);
        this.power = power;
        this.damage = power;
        this.active = true;
        
        this.color = this.getLaserColor(power);
    }
    
    getLaserColor(power) {
        const colors = [
            '#00ff00',  // Green - Power 1
            '#00ffff',  // Cyan - Power 2
            '#ffff00',  // Yellow - Power 3
            '#ff8800',  // Orange - Power 4
            '#ff0088'   // Pink - Power 5
        ];
        return colors[Math.min(power - 1, colors.length - 1)];
    }
    
    update(deltaTime) {
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        
        if (this.position.y < -this.size.y) {
            this.active = false;
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
        const width = this.size.x;
        const height = this.size.y;
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.fillStyle = this.color;
        ctx.fillRect(x - width/2, y - height/2, width, height);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - width/4, y - height/2, width/2, height);
        
        if (this.power >= 3) {
            ctx.fillStyle = this.color;
            ctx.fillRect(x - width/2 - 2, y - height/4, 2, height/2);
            ctx.fillRect(x + width/2, y - height/4, 2, height/2);
        }
        
        ctx.restore();
    }
}

class Bomb {
    constructor(startPosition, targetPosition, power, gameEngine = null) {
        this.position = new Vector2(startPosition.x, startPosition.y);
        this.targetPosition = new Vector2(targetPosition.x, targetPosition.y);
        this.gameEngine = gameEngine;
        
        const distance = this.position.distance(this.targetPosition);
        const fallTime = distance / 300;
        
        this.velocity = new Vector2(
            (this.targetPosition.x - this.position.x) / fallTime,
            (this.targetPosition.y - this.position.y) / fallTime
        );
        
        this.size = new Vector2(6, 8);
        this.power = power;
        this.damage = power * 2;
        this.active = true;
        
        this.shadow = new Vector2(this.targetPosition.x, this.targetPosition.y);
        this.trailPoints = [];
    }
    
    update(deltaTime) {
        this.trailPoints.push({
            x: this.position.x,
            y: this.position.y,
            life: 0.5
        });
        
        this.trailPoints = this.trailPoints.filter(point => {
            point.life -= deltaTime;
            return point.life > 0;
        });
        
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        
        const distanceToTarget = this.position.distance(this.targetPosition);
        if (distanceToTarget < 10 || this.position.y > this.targetPosition.y) {
            this.explode();
        }
        
        if (this.position.y > 650) {
            this.active = false;
        }
    }
    
    explode() {
        this.active = false;
        
        if (!this.gameEngine) return;
        
        const explosionSize = this.power >= 3 ? 'large' : 'medium';
        const explosionDamage = this.damage;
        
        this.gameEngine.weaponSystem.createExplosion(
            this.position,
            explosionSize,
            explosionDamage
        );
        
        const groundTargets = this.gameEngine.background.getGroundTargets();
        groundTargets.forEach(target => {
            const distance = Math.sqrt(
                Math.pow(target.x + target.width/2 - this.position.x, 2) +
                Math.pow(target.y + target.height/2 - this.position.y, 2)
            );
            
            const explosionRadius = this.power * 20;
            if (distance <= explosionRadius) {
                target.health -= this.damage;
                if (target.health <= 0) {
                    this.gameEngine.background.destroyGroundObject(target);
                }
            }
        });
        
        const enemies = this.gameEngine.enemyManager.getGroundEnemies();
        enemies.forEach(enemy => {
            const distance = enemy.position.distance(this.position);
            const explosionRadius = this.power * 25;
            if (distance <= explosionRadius) {
                enemy.takeDamage(this.damage);
            }
        });
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
        
        this.renderTrail(ctx);
        this.renderShadow(ctx);
        this.renderBomb(ctx);
        
        ctx.restore();
    }
    
    renderTrail(ctx) {
        if (this.trailPoints.length < 2) return;
        
        ctx.strokeStyle = '#ff4400';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.trailPoints.length; i++) {
            const point = this.trailPoints[i];
            ctx.globalAlpha = point.life;
            
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    renderShadow(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.shadow.x, this.shadow.y, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderBomb(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const width = this.size.x;
        const height = this.size.y;
        
        ctx.fillStyle = '#444444';
        ctx.fillRect(x - width/2, y - height/2, width, height);
        
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - width/2, y - height/2, width, height);
        
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(x, y - height/4, 2, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.power >= 3) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - width/2 - 1, y - height/2 - 1, width + 2, height + 2);
        }
    }
}

class Explosion {
    constructor(position, size, damage) {
        this.position = new Vector2(position.x, position.y);
        this.damage = damage;
        this.active = true;
        
        this.maxRadius = this.getSizeRadius(size);
        this.radius = 0;
        this.maxLife = 0.5;
        this.life = this.maxLife;
        
        this.hasDealtDamage = false;
    }
    
    getSizeRadius(size) {
        switch (size) {
            case 'small': return 20;
            case 'medium': return 35;
            case 'large': return 50;
            default: return 30;
        }
    }
    
    update(deltaTime) {
        this.life -= deltaTime;
        
        const progress = 1 - (this.life / this.maxLife);
        this.radius = this.maxRadius * Math.sin(progress * Math.PI);
        
        if (this.life <= 0) {
            this.active = false;
        }
    }
    
    getBounds() {
        return new Rectangle(
            this.position.x - this.radius,
            this.position.y - this.radius,
            this.radius * 2,
            this.radius * 2
        );
    }
    
    render(ctx) {
        if (!this.active || this.radius <= 0) return;
        
        ctx.save();
        
        const alpha = this.life / this.maxLife;
        
        const gradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, this.radius
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.8})`);
        gradient.addColorStop(0.3, `rgba(255, 200, 0, ${alpha * 0.6})`);
        gradient.addColorStop(0.6, `rgba(255, 100, 0, ${alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        if (alpha > 0.5) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius * 0.8, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}