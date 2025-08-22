class ParticleManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.particles = [];
        this.maxParticles = 200;
        this.particlePool = [];
        
        this.initializePool();
    }
    
    initializePool() {
        // Pre-create particles for better performance
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push(new Particle());
        }
    }
    
    update(deltaTime) {
        this.particles.forEach(particle => {
            particle.update(deltaTime);
        });
        
        this.cleanup();
    }
    
    cleanup() {
        // Return inactive particles to pool
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            if (!particle.active) {
                this.particlePool.push(particle);
                this.particles.splice(i, 1);
            }
        }
    }
    
    getParticle() {
        if (this.particlePool.length > 0) {
            return this.particlePool.pop();
        }
        return new Particle();
    }
    
    createExplosion(x, y, size = 'medium', color = '#ff4400') {
        const particleCount = this.getExplosionParticleCount(size);
        const speed = this.getExplosionSpeed(size);
        const lifespan = this.getExplosionLifespan(size);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle();
            if (!particle) continue;
            
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = new Vector2(
                Math.cos(angle) * randomRange(speed * 0.5, speed),
                Math.sin(angle) * randomRange(speed * 0.5, speed)
            );
            
            particle.initialize({
                position: new Vector2(x, y),
                velocity: velocity,
                acceleration: new Vector2(0, 50), // Gravity
                color: this.getExplosionColor(color),
                size: randomRange(2, 6),
                life: randomRange(lifespan * 0.7, lifespan),
                type: 'explosion'
            });
            
            this.particles.push(particle);
        }
        
        // Add some sparks
        this.createSparks(x, y, Math.floor(particleCount / 3));
    }
    
    createSparks(x, y, count = 10, color = '#ffff00') {
        for (let i = 0; i < count; i++) {
            const particle = this.getParticle();
            if (!particle) continue;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = randomRange(100, 300);
            
            particle.initialize({
                position: new Vector2(x + randomRange(-5, 5), y + randomRange(-5, 5)),
                velocity: new Vector2(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                ),
                acceleration: new Vector2(0, 200),
                color: color,
                size: randomRange(1, 3),
                life: randomRange(0.3, 0.8),
                type: 'spark'
            });
            
            this.particles.push(particle);
        }
    }
    
    createImpact(x, y, direction = null) {
        const count = 8;
        
        for (let i = 0; i < count; i++) {
            const particle = this.getParticle();
            if (!particle) continue;
            
            let angle;
            if (direction) {
                // Scatter around the impact direction
                const baseAngle = Math.atan2(direction.y, direction.x);
                angle = baseAngle + randomRange(-Math.PI / 4, Math.PI / 4);
            } else {
                angle = Math.random() * Math.PI * 2;
            }
            
            const speed = randomRange(50, 150);
            
            particle.initialize({
                position: new Vector2(x, y),
                velocity: new Vector2(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                ),
                acceleration: new Vector2(0, 100),
                color: '#ffffff',
                size: randomRange(1, 3),
                life: randomRange(0.2, 0.5),
                type: 'impact'
            });
            
            this.particles.push(particle);
        }
    }
    
    createTrail(x, y, velocity, color = '#ffffff') {
        const particle = this.getParticle();
        if (!particle) return;
        
        particle.initialize({
            position: new Vector2(x + randomRange(-2, 2), y + randomRange(-2, 2)),
            velocity: velocity.multiply(randomRange(0.1, 0.3)),
            acceleration: new Vector2(0, 0),
            color: color,
            size: randomRange(1, 2),
            life: randomRange(0.3, 0.6),
            type: 'trail'
        });
        
        this.particles.push(particle);
    }
    
    createSmoke(x, y, count = 5) {
        for (let i = 0; i < count; i++) {
            const particle = this.getParticle();
            if (!particle) continue;
            
            particle.initialize({
                position: new Vector2(x + randomRange(-5, 5), y + randomRange(-5, 5)),
                velocity: new Vector2(
                    randomRange(-20, 20),
                    randomRange(-40, -10)
                ),
                acceleration: new Vector2(0, -20),
                color: '#666666',
                size: randomRange(3, 8),
                life: randomRange(1.0, 2.0),
                type: 'smoke'
            });
            
            this.particles.push(particle);
        }
    }
    
    createPowerupEffect(x, y, powerupType) {
        const colors = {
            'laser': '#00ff00',
            'bomb': '#ffaa00',
            'option': '#00ffff',
            'shield': '#0080ff',
            'speed': '#ff00ff',
            'life': '#ff0000'
        };
        
        const color = colors[powerupType] || '#ffffff';
        const count = 15;
        
        for (let i = 0; i < count; i++) {
            const particle = this.getParticle();
            if (!particle) continue;
            
            const angle = (i / count) * Math.PI * 2;
            const speed = randomRange(80, 120);
            
            particle.initialize({
                position: new Vector2(x, y),
                velocity: new Vector2(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                ),
                acceleration: new Vector2(0, 0),
                color: color,
                size: randomRange(2, 4),
                life: randomRange(0.8, 1.2),
                type: 'powerup'
            });
            
            this.particles.push(particle);
        }
    }
    
    createEngineTrail(x, y) {
        if (Math.random() < 0.7) return; // Don't create every frame
        
        const particle = this.getParticle();
        if (!particle) return;
        
        particle.initialize({
            position: new Vector2(x + randomRange(-3, 3), y),
            velocity: new Vector2(
                randomRange(-10, 10),
                randomRange(20, 50)
            ),
            acceleration: new Vector2(0, 30),
            color: '#0088ff',
            size: randomRange(1, 3),
            life: randomRange(0.2, 0.5),
            type: 'engineTrail'
        });
        
        this.particles.push(particle);
    }
    
    getExplosionParticleCount(size) {
        switch (size) {
            case 'small': return 8;
            case 'medium': return 16;
            case 'large': return 24;
            default: return 12;
        }
    }
    
    getExplosionSpeed(size) {
        switch (size) {
            case 'small': return 100;
            case 'medium': return 150;
            case 'large': return 200;
            default: return 125;
        }
    }
    
    getExplosionLifespan(size) {
        switch (size) {
            case 'small': return 0.8;
            case 'medium': return 1.2;
            case 'large': return 1.6;
            default: return 1.0;
        }
    }
    
    getExplosionColor(baseColor) {
        const colors = [
            baseColor,
            '#ffaa00',
            '#ff6600',
            '#ffffff',
            '#ffff00'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    render(ctx) {
        this.particles.forEach(particle => {
            particle.render(ctx);
        });
    }
}

class Particle {
    constructor() {
        this.position = new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);
        this.acceleration = new Vector2(0, 0);
        this.color = '#ffffff';
        this.size = 1;
        this.life = 1;
        this.maxLife = 1;
        this.active = false;
        this.type = 'default';
        
        this.alpha = 1;
        this.rotation = 0;
        this.rotationSpeed = 0;
    }
    
    initialize(config) {
        this.position = config.position || new Vector2(0, 0);
        this.velocity = config.velocity || new Vector2(0, 0);
        this.acceleration = config.acceleration || new Vector2(0, 0);
        this.color = config.color || '#ffffff';
        this.size = config.size || 1;
        this.life = config.life || 1;
        this.maxLife = this.life;
        this.type = config.type || 'default';
        
        this.alpha = 1;
        this.rotation = config.rotation || 0;
        this.rotationSpeed = config.rotationSpeed || 0;
        
        this.active = true;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // Update physics
        this.velocity = this.velocity.add(this.acceleration.multiply(deltaTime));
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        
        // Update rotation
        this.rotation += this.rotationSpeed * deltaTime;
        
        // Update life
        this.life -= deltaTime;
        
        if (this.life <= 0) {
            this.active = false;
            return;
        }
        
        // Update visual properties based on life
        this.updateVisualProperties();
        
        // Apply drag for certain particle types
        this.applyDrag(deltaTime);
    }
    
    updateVisualProperties() {
        const lifeRatio = this.life / this.maxLife;
        
        switch (this.type) {
            case 'explosion':
                this.alpha = lifeRatio;
                this.size = this.size * (1 - (1 - lifeRatio) * 0.1); // Slight shrink
                break;
                
            case 'spark':
                this.alpha = lifeRatio;
                break;
                
            case 'smoke':
                this.alpha = lifeRatio * 0.6;
                this.size = this.size * (1 + (1 - lifeRatio) * 0.5); // Expand
                break;
                
            case 'trail':
                this.alpha = lifeRatio * 0.8;
                break;
                
            case 'powerup':
                this.alpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
                break;
                
            case 'engineTrail':
                this.alpha = lifeRatio * 0.7;
                break;
                
            default:
                this.alpha = lifeRatio;
        }
    }
    
    applyDrag(deltaTime) {
        const dragTypes = ['smoke', 'trail'];
        if (dragTypes.includes(this.type)) {
            const dragFactor = 0.95;
            this.velocity = this.velocity.multiply(Math.pow(dragFactor, deltaTime * 60));
        }
    }
    
    render(ctx) {
        if (!this.active || this.alpha <= 0) return;
        
        ctx.save();
        
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.position.x, this.position.y);
        
        if (this.rotation !== 0) {
            ctx.rotate(this.rotation);
        }
        
        this.renderParticle(ctx);
        
        ctx.restore();
    }
    
    renderParticle(ctx) {
        switch (this.type) {
            case 'explosion':
                this.renderExplosionParticle(ctx);
                break;
                
            case 'spark':
                this.renderSparkParticle(ctx);
                break;
                
            case 'smoke':
                this.renderSmokeParticle(ctx);
                break;
                
            case 'trail':
                this.renderTrailParticle(ctx);
                break;
                
            case 'powerup':
                this.renderPowerupParticle(ctx);
                break;
                
            case 'engineTrail':
                this.renderEngineTrailParticle(ctx);
                break;
                
            default:
                this.renderDefaultParticle(ctx);
        }
    }
    
    renderExplosionParticle(ctx) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.7, this.color + '88');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderSparkParticle(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Spark tail
        const speed = this.velocity.magnitude();
        if (speed > 50) {
            const tailLength = Math.min(speed / 10, this.size * 3);
            const direction = this.velocity.normalize().multiply(-tailLength);
            
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.size * 0.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(direction.x, direction.y);
            ctx.stroke();
        }
    }
    
    renderSmokeParticle(ctx) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.color + '40');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderTrailParticle(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderPowerupParticle(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        
        // Star shape
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const radius = i % 2 === 0 ? this.size : this.size * 0.5;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
    }
    
    renderEngineTrailParticle(ctx) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderDefaultParticle(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}