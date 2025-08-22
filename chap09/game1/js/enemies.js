class EnemyManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.enemies = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2.0;
        this.waveTimer = 0;
        this.currentWave = 0;
        
        this.enemyTypes = [
            'drone', 'fighter', 'bomber', 'interceptor', 'formation'
        ];
    }
    
    update(deltaTime) {
        this.updateSpawning(deltaTime);
        this.updateEnemies(deltaTime);
        this.cleanup();
    }
    
    updateSpawning(deltaTime) {
        this.spawnTimer += deltaTime;
        this.waveTimer += deltaTime;
        
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnEnemy();
            this.spawnTimer = 0;
            
            this.spawnInterval = Math.max(0.5, this.spawnInterval - 0.01);
        }
        
        if (this.waveTimer >= 30) {
            this.spawnWave();
            this.waveTimer = 0;
            this.currentWave++;
        }
    }
    
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime);
        });
    }
    
    spawnEnemy() {
        const type = this.getRandomEnemyType();
        const x = Math.random() * (this.gameEngine.width - 60) + 30;
        const y = -50;
        
        let enemy;
        switch (type) {
            case 'drone':
                enemy = new DroneEnemy(x, y, this.gameEngine);
                break;
            case 'fighter':
                enemy = new FighterEnemy(x, y, this.gameEngine);
                break;
            case 'bomber':
                enemy = new BomberEnemy(x, y, this.gameEngine);
                break;
            case 'interceptor':
                enemy = new InterceptorEnemy(x, y, this.gameEngine);
                break;
            default:
                enemy = new DroneEnemy(x, y, this.gameEngine);
        }
        
        this.enemies.push(enemy);
    }
    
    spawnWave() {
        const waveTypes = ['formation', 'swarm', 'boss'];
        const waveType = waveTypes[Math.floor(Math.random() * waveTypes.length)];
        
        switch (waveType) {
            case 'formation':
                this.spawnFormation();
                break;
            case 'swarm':
                this.spawnSwarm();
                break;
            case 'boss':
                if (this.currentWave % 3 === 0) {
                    this.spawnBoss();
                }
                break;
        }
    }
    
    spawnFormation() {
        const formationSize = 5;
        const startX = this.gameEngine.width / 2 - (formationSize * 60) / 2;
        
        for (let i = 0; i < formationSize; i++) {
            const enemy = new FighterEnemy(
                startX + i * 60,
                -50 - i * 20,
                this.gameEngine
            );
            enemy.setFormation(i, formationSize);
            this.enemies.push(enemy);
        }
    }
    
    spawnSwarm() {
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const x = Math.random() * this.gameEngine.width;
                const enemy = new DroneEnemy(x, -30, this.gameEngine);
                enemy.speed *= 1.5;
                this.enemies.push(enemy);
            }, i * 200);
        }
    }
    
    spawnBoss() {
        const boss = new BossEnemy(this.gameEngine.width / 2, -100, this.gameEngine);
        this.enemies.push(boss);
    }
    
    getRandomEnemyType() {
        const weights = {
            'drone': 40,
            'fighter': 30,
            'bomber': 15,
            'interceptor': 15
        };
        
        const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (const [type, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) {
                return type;
            }
        }
        
        return 'drone';
    }
    
    getGroundEnemies() {
        return this.enemies.filter(enemy => 
            enemy.type === 'ground' && enemy.active
        );
    }
    
    cleanup() {
        this.enemies = this.enemies.filter(enemy => enemy.active);
    }
    
    render(ctx) {
        this.enemies.forEach(enemy => enemy.render(ctx));
    }
}

class Enemy {
    constructor(x, y, type, gameEngine = null) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.size = new Vector2(32, 32);
        this.type = type;
        this.gameEngine = gameEngine;
        
        this.health = 1;
        this.maxHealth = 1;
        this.damage = 1;
        this.points = 100;
        this.speed = 100;
        
        this.active = true;
        this.canShoot = false;
        this.shootTimer = 0;
        this.shootInterval = 2.0;
        
        this.bullets = [];
        this.color = '#ff4444';
        
        this.formation = {
            index: -1,
            size: 0,
            offset: new Vector2(0, 0)
        };
        
        this.animation = {
            frame: 0,
            time: 0,
            speed: 0.2
        };
    }
    
    update(deltaTime) {
        this.updateMovement(deltaTime);
        this.updateShooting(deltaTime);
        this.updateBullets(deltaTime);
        this.updateAnimation(deltaTime);
        this.checkBounds();
    }
    
    updateMovement(deltaTime) {
        this.position = this.position.add(this.velocity.multiply(deltaTime));
    }
    
    updateShooting(deltaTime) {
        if (!this.canShoot) return;
        
        this.shootTimer += deltaTime;
        if (this.shootTimer >= this.shootInterval) {
            this.shoot();
            this.shootTimer = 0;
        }
    }
    
    updateBullets(deltaTime) {
        this.bullets.forEach(bullet => bullet.update(deltaTime));
        this.bullets = this.bullets.filter(bullet => bullet.active);
    }
    
    updateAnimation(deltaTime) {
        this.animation.time += deltaTime;
        if (this.animation.time >= this.animation.speed) {
            this.animation.frame = (this.animation.frame + 1) % 4;
            this.animation.time = 0;
        }
    }
    
    checkBounds() {
        if (this.gameEngine && 
            (this.position.y > this.gameEngine.height + 100 ||
            this.position.x < -100 ||
            this.position.x > this.gameEngine.width + 100)) {
            this.active = false;
        }
    }
    
    shoot() {
        if (!this.gameEngine || !this.gameEngine.player) return;
        
        const bulletSpeed = 200;
        const playerPos = this.gameEngine.player.position;
        const direction = playerPos.subtract(this.position).normalize();
        
        this.bullets.push(new EnemyBullet(
            this.position.x,
            this.position.y + 10,
            direction.multiply(bulletSpeed)
        ));
    }
    
    takeDamage(damage) {
        this.health -= damage;
        
        if (this.health <= 0) {
            this.die();
            return true;
        }
        
        return false;
    }
    
    die() {
        this.active = false;
        
        if (this.gameEngine) {
            this.gameEngine.addScore(this.points);
            
            this.gameEngine.particleManager.createExplosion(
                this.position.x,
                this.position.y,
                'medium'
            );
            
            if (Math.random() < 0.15) {
                this.gameEngine.powerupManager.spawnPowerup(
                    this.position.x,
                    this.position.y
                );
            }
            
            this.gameEngine.audioManager.playSound('enemyDeath');
        }
    }
    
    setFormation(index, size) {
        this.formation.index = index;
        this.formation.size = size;
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
        
        this.renderEnemy(ctx);
        this.renderBullets(ctx);
        
        if (this.health < this.maxHealth && this.maxHealth > 1) {
            this.renderHealthBar(ctx);
        }
    }
    
    renderEnemy(ctx) {
        ctx.save();
        
        const x = this.position.x;
        const y = this.position.y;
        const width = this.size.x;
        const height = this.size.y;
        
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        
        this.renderEnemyShape(ctx, x, y, width, height);
        
        ctx.restore();
    }
    
    renderEnemyShape(ctx, x, y, width, height) {
        ctx.fillRect(x - width/2, y - height/2, width, height);
        ctx.strokeRect(x - width/2, y - height/2, width, height);
    }
    
    renderBullets(ctx) {
        this.bullets.forEach(bullet => bullet.render(ctx));
    }
    
    renderHealthBar(ctx) {
        const barWidth = this.size.x;
        const barHeight = 4;
        const barX = this.position.x - barWidth / 2;
        const barY = this.position.y - this.size.y / 2 - 8;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const healthRatio = this.health / this.maxHealth;
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
}

class DroneEnemy extends Enemy {
    constructor(x, y, gameEngine) {
        super(x, y, 'air', gameEngine);
        this.velocity = new Vector2(0, 80);
        this.health = 1;
        this.maxHealth = 1;
        this.points = 50;
        this.color = '#ff6666';
        this.size = new Vector2(24, 24);
    }
    
    renderEnemyShape(ctx, x, y, width, height) {
        ctx.beginPath();
        ctx.moveTo(x, y - height/2);
        ctx.lineTo(x - width/3, y + height/3);
        ctx.lineTo(x - width/2, y + height/2);
        ctx.lineTo(x + width/2, y + height/2);
        ctx.lineTo(x + width/3, y + height/3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#ffaaaa';
        ctx.fillRect(x - 2, y - 4, 4, 8);
    }
}

class FighterEnemy extends Enemy {
    constructor(x, y, gameEngine) {
        super(x, y, 'air', gameEngine);
        this.velocity = new Vector2(0, 120);
        this.health = 2;
        this.maxHealth = 2;
        this.points = 100;
        this.color = '#ff4444';
        this.canShoot = true;
        this.shootInterval = 3.0;
        
        this.zigzagTimer = 0;
        this.zigzagSpeed = 50;
    }
    
    updateMovement(deltaTime) {
        super.updateMovement(deltaTime);
        
        if (this.formation.index >= 0) {
            return;
        }
        
        this.zigzagTimer += deltaTime;
        this.velocity.x = Math.sin(this.zigzagTimer * 2) * this.zigzagSpeed;
    }
    
    renderEnemyShape(ctx, x, y, width, height) {
        ctx.beginPath();
        ctx.moveTo(x, y - height/2);
        ctx.lineTo(x - width/2, y);
        ctx.lineTo(x - width/3, y + height/2);
        ctx.lineTo(x + width/3, y + height/2);
        ctx.lineTo(x + width/2, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 3, y - 6, 6, 4);
        
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(x - width/2, y - 2, 4, 4);
        ctx.fillRect(x + width/2 - 4, y - 2, 4, 4);
    }
}

class BomberEnemy extends Enemy {
    constructor(x, y, gameEngine) {
        super(x, y, 'air', gameEngine);
        this.velocity = new Vector2(0, 60);
        this.health = 4;
        this.maxHealth = 4;
        this.points = 200;
        this.color = '#ff2222';
        this.size = new Vector2(48, 36);
        this.canShoot = true;
        this.shootInterval = 4.0;
    }
    
    shoot() {
        const bulletSpeed = 150;
        
        this.bullets.push(new EnemyBullet(
            this.position.x - 15,
            this.position.y + 10,
            new Vector2(0, bulletSpeed)
        ));
        
        this.bullets.push(new EnemyBullet(
            this.position.x,
            this.position.y + 10,
            new Vector2(0, bulletSpeed)
        ));
        
        this.bullets.push(new EnemyBullet(
            this.position.x + 15,
            this.position.y + 10,
            new Vector2(0, bulletSpeed)
        ));
    }
    
    renderEnemyShape(ctx, x, y, width, height) {
        ctx.fillRect(x - width/2, y - height/3, width, height * 2/3);
        ctx.strokeRect(x - width/2, y - height/3, width, height * 2/3);
        
        ctx.beginPath();
        ctx.ellipse(x, y - height/3, width/3, height/3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 4, y - height/4, 8, height/2);
        
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(x - width/3, y + height/4, 8, 4);
        ctx.fillRect(x + width/3 - 8, y + height/4, 8, 4);
    }
}

class InterceptorEnemy extends Enemy {
    constructor(x, y, gameEngine) {
        super(x, y, 'air', gameEngine);
        this.velocity = new Vector2(0, 150);
        this.health = 1;
        this.maxHealth = 1;
        this.points = 150;
        this.color = '#ff8844';
        this.canShoot = true;
        this.shootInterval = 1.5;
        this.speed = 200;
        
        this.targetPlayer = true;
        this.chargeTimer = 0;
        this.chargeDelay = 2.0;
    }
    
    updateMovement(deltaTime) {
        if (this.targetPlayer && this.chargeTimer < this.chargeDelay) {
            this.chargeTimer += deltaTime;
            this.velocity.x = 0;
            return;
        }
        
        if (this.targetPlayer && this.gameEngine && this.gameEngine.player) {
            const playerPos = this.gameEngine.player.position;
            const direction = playerPos.subtract(this.position).normalize();
            this.velocity = direction.multiply(this.speed);
            this.targetPlayer = false;
        }
        
        super.updateMovement(deltaTime);
    }
    
    renderEnemyShape(ctx, x, y, width, height) {
        ctx.beginPath();
        ctx.moveTo(x, y - height/2);
        ctx.lineTo(x - width/4, y);
        ctx.lineTo(x - width/2, y + height/4);
        ctx.lineTo(x - width/4, y + height/2);
        ctx.lineTo(x + width/4, y + height/2);
        ctx.lineTo(x + width/2, y + height/4);
        ctx.lineTo(x + width/4, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        if (this.chargeTimer < this.chargeDelay) {
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class BossEnemy extends Enemy {
    constructor(x, y, gameEngine) {
        super(x, y, 'air', gameEngine);
        this.velocity = new Vector2(0, 20);
        this.health = 20;
        this.maxHealth = 20;
        this.points = 1000;
        this.color = '#ff0000';
        this.size = new Vector2(80, 60);
        this.canShoot = true;
        this.shootInterval = 0.5;
        
        this.phase = 1;
        this.movePattern = 0;
        this.moveTimer = 0;
        this.specialAttackTimer = 0;
        this.specialAttackInterval = 5.0;
    }
    
    updateMovement(deltaTime) {
        this.moveTimer += deltaTime;
        
        switch (this.movePattern) {
            case 0: // Enter from top
                if (this.position.y >= 100) {
                    this.velocity = new Vector2(50, 0);
                    this.movePattern = 1;
                }
                break;
            case 1: // Side to side
                if (this.gameEngine && 
                    (this.position.x >= this.gameEngine.width - 60 || this.position.x <= 60)) {
                    this.velocity.x *= -1;
                }
                break;
        }
        
        super.updateMovement(deltaTime);
    }
    
    updateShooting(deltaTime) {
        super.updateShooting(deltaTime);
        
        this.specialAttackTimer += deltaTime;
        if (this.specialAttackTimer >= this.specialAttackInterval) {
            this.specialAttack();
            this.specialAttackTimer = 0;
        }
    }
    
    shoot() {
        const bulletSpeed = 180;
        const angles = [-0.5, -0.25, 0, 0.25, 0.5];
        
        angles.forEach(angle => {
            const direction = new Vector2(Math.sin(angle), Math.cos(angle));
            this.bullets.push(new EnemyBullet(
                this.position.x,
                this.position.y + 20,
                direction.multiply(bulletSpeed)
            ));
        });
    }
    
    specialAttack() {
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const direction = new Vector2(Math.cos(angle), Math.sin(angle));
            
            setTimeout(() => {
                this.bullets.push(new EnemyBullet(
                    this.position.x,
                    this.position.y,
                    direction.multiply(120)
                ));
            }, i * 50);
        }
    }
    
    takeDamage(damage) {
        const died = super.takeDamage(damage);
        
        const healthRatio = this.health / this.maxHealth;
        if (healthRatio <= 0.5 && this.phase === 1) {
            this.phase = 2;
            this.shootInterval = 0.3;
            this.specialAttackInterval = 3.0;
            this.velocity = this.velocity.multiply(1.5);
        }
        
        return died;
    }
    
    renderEnemyShape(ctx, x, y, width, height) {
        // Main body
        ctx.fillRect(x - width/2, y - height/3, width, height * 2/3);
        ctx.strokeRect(x - width/2, y - height/3, width, height * 2/3);
        
        // Cockpit
        ctx.beginPath();
        ctx.ellipse(x, y - height/3, width/4, height/4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Wings
        ctx.fillRect(x - width/2 - 10, y, 10, height/3);
        ctx.fillRect(x + width/2, y, 10, height/3);
        
        // Engines
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(x - width/3, y + height/4, 8, height/4);
        ctx.fillRect(x + width/3 - 8, y + height/4, 8, height/4);
        
        // Phase 2 effects
        if (this.phase === 2) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.strokeRect(x - width/2 - 5, y - height/2 - 5, width + 10, height + 10);
        }
    }
}

class EnemyBullet {
    constructor(x, y, velocity) {
        this.position = new Vector2(x, y);
        this.velocity = velocity;
        this.size = new Vector2(4, 8);
        this.active = true;
        this.damage = 1;
    }
    
    update(deltaTime) {
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        
        if (this.position.y > 650 || this.position.y < -50 ||
            this.position.x < -50 || this.position.x > 850) {
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
        
        ctx.fillStyle = '#ff4444';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        
        const x = this.position.x;
        const y = this.position.y;
        const width = this.size.x;
        const height = this.size.y;
        
        ctx.fillRect(x - width/2, y - height/2, width, height);
        ctx.strokeRect(x - width/2, y - height/2, width, height);
        
        ctx.restore();
    }
}