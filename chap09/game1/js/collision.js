class CollisionSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
    }
    
    update(deltaTime) {
        this.checkPlayerCollisions();
        this.checkWeaponCollisions();
        this.checkEnemyBulletCollisions();
        this.checkExplosionCollisions();
    }
    
    checkPlayerCollisions() {
        if (!this.gameEngine.player.active || this.gameEngine.player.invulnerable) {
            return;
        }
        
        const playerBounds = this.gameEngine.player.getBounds();
        
        // Check collision with enemies
        this.gameEngine.enemyManager.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            const enemyBounds = enemy.getBounds();
            if (this.rectangleIntersects(playerBounds, enemyBounds)) {
                this.handlePlayerEnemyCollision(enemy);
            }
        });
        
        // Check collision with enemy bullets
        this.gameEngine.enemyManager.enemies.forEach(enemy => {
            enemy.bullets.forEach(bullet => {
                if (!bullet.active) return;
                
                const bulletBounds = bullet.getBounds();
                if (this.rectangleIntersects(playerBounds, bulletBounds)) {
                    this.handlePlayerBulletCollision(bullet);
                }
            });
        });
        
        // Check collision with powerups
        this.gameEngine.powerupManager.powerups.forEach(powerup => {
            if (!powerup.active) return;
            
            const powerupBounds = powerup.getBounds();
            if (this.rectangleIntersects(playerBounds, powerupBounds)) {
                this.handlePlayerPowerupCollision(powerup);
            }
        });
    }
    
    checkWeaponCollisions() {
        // Check laser collisions with enemies
        this.gameEngine.weaponSystem.lasers.forEach(laser => {
            if (!laser.active) return;
            
            const laserBounds = laser.getBounds();
            
            this.gameEngine.enemyManager.enemies.forEach(enemy => {
                if (!enemy.active) return;
                
                const enemyBounds = enemy.getBounds();
                if (this.rectangleIntersects(laserBounds, enemyBounds)) {
                    this.handleLaserEnemyCollision(laser, enemy);
                }
            });
            
            // Check laser collision with enemy bullets
            this.gameEngine.enemyManager.enemies.forEach(enemy => {
                enemy.bullets.forEach(bullet => {
                    if (!bullet.active) return;
                    
                    const bulletBounds = bullet.getBounds();
                    if (this.rectangleIntersects(laserBounds, bulletBounds)) {
                        this.handleLaserBulletCollision(laser, bullet);
                    }
                });
            });
        });
        
        // Check bomb collisions with ground targets
        this.gameEngine.weaponSystem.bombs.forEach(bomb => {
            if (!bomb.active) return;
            
            const groundTargets = this.gameEngine.background.getGroundTargets();
            groundTargets.forEach(target => {
                const bombBounds = bomb.getBounds();
                const targetBounds = new Rectangle(
                    target.x,
                    target.y,
                    target.width,
                    target.height
                );
                
                if (this.rectangleIntersects(bombBounds, targetBounds)) {
                    bomb.explode();
                }
            });
        });
    }
    
    checkEnemyBulletCollisions() {
        // This is handled in checkPlayerCollisions for player bullets
        // Here we could add bullet-to-bullet collisions if needed
    }
    
    checkExplosionCollisions() {
        this.gameEngine.weaponSystem.explosions.forEach(explosion => {
            if (!explosion.active || explosion.hasDealtDamage) return;
            
            const explosionBounds = explosion.getBounds();
            
            // Check explosion collision with enemies
            this.gameEngine.enemyManager.enemies.forEach(enemy => {
                if (!enemy.active) return;
                
                const enemyBounds = enemy.getBounds();
                if (this.circleRectangleIntersects(
                    explosion.position, explosion.radius, enemyBounds)) {
                    this.handleExplosionEnemyCollision(explosion, enemy);
                }
            });
            
            explosion.hasDealtDamage = true;
        });
    }
    
    handlePlayerEnemyCollision(enemy) {
        if (this.gameEngine.player.takeDamage()) {
            this.gameEngine.loseLife();
        }
        
        enemy.takeDamage(999); // Destroy enemy on collision
        
        this.gameEngine.particleManager.createExplosion(
            enemy.position.x,
            enemy.position.y,
            'medium'
        );
    }
    
    handlePlayerBulletCollision(bullet) {
        bullet.active = false;
        
        if (this.gameEngine.player.takeDamage()) {
            this.gameEngine.loseLife();
        }
        
        this.gameEngine.particleManager.createImpact(
            bullet.position.x,
            bullet.position.y
        );
    }
    
    handlePlayerPowerupCollision(powerup) {
        powerup.collect(this.gameEngine.player);
        
        this.gameEngine.particleManager.createPowerupEffect(
            powerup.position.x,
            powerup.position.y,
            powerup.type
        );
        
        this.gameEngine.audioManager.playSound('powerup');
    }
    
    handleLaserEnemyCollision(laser, enemy) {
        laser.active = false;
        
        const destroyed = enemy.takeDamage(laser.damage);
        
        this.gameEngine.particleManager.createImpact(
            laser.position.x,
            laser.position.y
        );
        
        if (destroyed) {
            this.gameEngine.audioManager.playSound('enemyDeath');
        } else {
            this.gameEngine.audioManager.playSound('hit');
        }
    }
    
    handleLaserBulletCollision(laser, bullet) {
        laser.active = false;
        bullet.active = false;
        
        this.gameEngine.addScore(10); // Bonus for shooting down bullets
        
        this.gameEngine.particleManager.createSparks(
            laser.position.x,
            laser.position.y
        );
        
        this.gameEngine.audioManager.playSound('bulletDestroy');
    }
    
    handleExplosionEnemyCollision(explosion, enemy) {
        const distance = explosion.position.distance(enemy.position);
        const maxDistance = explosion.radius;
        
        if (distance <= maxDistance) {
            const damageRatio = 1 - (distance / maxDistance);
            const damage = Math.ceil(explosion.damage * damageRatio);
            
            enemy.takeDamage(damage);
        }
    }
    
    rectangleIntersects(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    circleRectangleIntersects(circleCenter, circleRadius, rectangle) {
        const closestX = Math.max(rectangle.x, 
            Math.min(circleCenter.x, rectangle.x + rectangle.width));
        const closestY = Math.max(rectangle.y, 
            Math.min(circleCenter.y, rectangle.y + rectangle.height));
        
        const distance = Math.sqrt(
            Math.pow(circleCenter.x - closestX, 2) + 
            Math.pow(circleCenter.y - closestY, 2)
        );
        
        return distance <= circleRadius;
    }
    
    circleIntersects(circle1Center, circle1Radius, circle2Center, circle2Radius) {
        const distance = circle1Center.distance(circle2Center);
        return distance <= circle1Radius + circle2Radius;
    }
    
    pointInRectangle(point, rectangle) {
        return point.x >= rectangle.x && 
               point.x <= rectangle.x + rectangle.width &&
               point.y >= rectangle.y && 
               point.y <= rectangle.y + rectangle.height;
    }
    
    pointInCircle(point, circleCenter, circleRadius) {
        return point.distance(circleCenter) <= circleRadius;
    }
    
    // Advanced collision detection for more precise hit detection
    pixelPerfectCollision(sprite1, sprite2) {
        // This would require sprite pixel data
        // For now, we use rectangle collision as it's sufficient for this game
        return this.rectangleIntersects(sprite1.getBounds(), sprite2.getBounds());
    }
    
    // Swept collision detection for fast-moving objects
    sweptCollision(movingObject, staticObject, deltaTime) {
        const velocity = movingObject.velocity.multiply(deltaTime);
        
        // Create expanded rectangle for the path
        const expandedBounds = new Rectangle(
            Math.min(movingObject.position.x, movingObject.position.x + velocity.x) - movingObject.size.x / 2,
            Math.min(movingObject.position.y, movingObject.position.y + velocity.y) - movingObject.size.y / 2,
            Math.abs(velocity.x) + movingObject.size.x,
            Math.abs(velocity.y) + movingObject.size.y
        );
        
        return this.rectangleIntersects(expandedBounds, staticObject.getBounds());
    }
}