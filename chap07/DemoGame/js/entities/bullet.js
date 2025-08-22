// 총알 클래스
class Bullet extends Entity {
    constructor(x, y, owner = 'player') {
        super(x, y, 4, 8);
        
        // 총알 속성
        this.owner = owner; // 'player' 또는 'enemy'
        this.damage = 1;
        this.speed = 500; // 픽셀/초
        this.piercing = false; // 관통 여부
        this.maxPierceCount = 0;
        this.pierceCount = 0;
        
        // 시각적 속성
        this.color = owner === 'player' ? '#ffff00' : '#ff4444';
        this.glowColor = owner === 'player' ? '#ffff88' : '#ff8888';
        this.trailLength = 3;
        this.trail = [];
        
        // 충돌 설정
        this.collisionGroup = owner === 'player' ? 'player_bullet' : 'enemy_bullet';
        this.collisionEnabled = true;
        
        // 특수 효과
        this.hasGlow = true;
        this.pulsing = false;
        this.pulseSpeed = 5;
        this.pulseIntensity = 0.3;
        
        // 물리 속성
        this.gravity = 0; // 중력 영향 (특수 총알용)
        this.homing = false; // 유도 기능
        this.homingTarget = null;
        this.homingStrength = 0.1;
        
        // 생명주기
        this.autoDestroy = true;
        this.maxLifetime = 5000; // 5초 후 자동 소멸
        
        // 애니메이션
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.scale = 1;
        this.scaleSpeed = 0;
        
        // 사운드
        this.playedHitSound = false;
    }
    
    onUpdate(deltaTime) {
        // 이동 처리
        this.updateMovement(deltaTime);
        
        // 특수 효과 업데이트
        this.updateEffects(deltaTime);
        
        // 트레일 업데이트
        this.updateTrail();
        
        // 유도 기능
        if (this.homing && this.homingTarget) {
            this.updateHoming(deltaTime);
        }
        
        // 화면 밖으로 나가면 제거
        if (this.autoDestroy && this.isOutOfScreen()) {
            this.destroy();
        }
    }
    
    updateMovement(deltaTime) {
        const deltaSeconds = deltaTime / 1000;
        
        // 기본 이동
        this.x += this.velocity.x * deltaSeconds;
        this.y += this.velocity.y * deltaSeconds;
        
        // 중력 적용
        if (this.gravity !== 0) {
            this.velocity.y += this.gravity * deltaSeconds;
        }
        
        // 회전
        if (this.rotationSpeed !== 0) {
            this.rotation += this.rotationSpeed * deltaSeconds;
        }
        
        // 크기 변화
        if (this.scaleSpeed !== 0) {
            this.scale += this.scaleSpeed * deltaSeconds;
            if (this.scale <= 0) {
                this.destroy();
            }
        }
    }
    
    updateEffects(deltaTime) {
        // 펄스 효과
        if (this.pulsing) {
            const time = this.age / 1000;
            this.scale = 1 + Math.sin(time * this.pulseSpeed) * this.pulseIntensity;
        }
    }
    
    updateTrail() {
        // 현재 위치를 트레일에 추가
        this.trail.unshift({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            time: this.age
        });
        
        // 트레일 길이 제한
        if (this.trail.length > this.trailLength) {
            this.trail.pop();
        }
        
        // 오래된 트레일 제거
        this.trail = this.trail.filter(point => 
            this.age - point.time < 200 // 0.2초 이내
        );
    }
    
    updateHoming(deltaTime) {
        if (!this.homingTarget || !this.homingTarget.active) {
            this.homingTarget = this.findNearestTarget();
            return;
        }
        
        const targetCenter = this.homingTarget.getCenter();
        const currentCenter = this.getCenter();
        const direction = Vector2D.subtract(targetCenter, currentCenter).normalize();
        
        // 현재 속도 방향과 목표 방향을 보간
        const currentDirection = this.velocity.normalized();
        const newDirection = Vector2D.lerp(currentDirection, direction, this.homingStrength);
        
        this.velocity = Vector2D.multiply(newDirection, this.speed);
        
        // 총알 회전을 속도 방향에 맞춤
        this.rotation = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI / 2;
    }
    
    findNearestTarget() {
        if (!window.game || !window.game.entities) return null;
        
        const targets = this.owner === 'player' ? 
            window.game.entities.enemies : 
            [window.game.entities.player].filter(p => p && p.active);
        
        let nearest = null;
        let nearestDistance = Infinity;
        
        targets.forEach(target => {
            if (!target || !target.active) return;
            
            const distance = this.distanceTo(target);
            if (distance < nearestDistance) {
                nearest = target;
                nearestDistance = distance;
            }
        });
        
        return nearest;
    }
    
    isOutOfScreen() {
        if (!window.game || !window.game.canvas) return true;
        
        const canvas = window.game.canvas;
        const margin = 50;
        
        return (this.x < -margin ||
                this.x > canvas.width + margin ||
                this.y < -margin ||
                this.y > canvas.height + margin);
    }
    
    onRender(ctx) {
        ctx.save();
        
        // 트레일 렌더링
        this.renderTrail(ctx);
        
        // 글로우 효과
        if (this.hasGlow) {
            this.renderGlow(ctx);
        }
        
        // 총알 본체
        this.renderBody(ctx);
        
        ctx.restore();
    }
    
    renderTrail(ctx) {
        if (this.trail.length < 2) return;
        
        ctx.save();
        
        for (let i = 1; i < this.trail.length; i++) {
            const point = this.trail[i];
            const alpha = (this.trailLength - i) / this.trailLength * 0.6;
            const size = (this.trailLength - i) / this.trailLength * 3;
            
            ctx.fillStyle = `rgba(${this.getColorRGB()}, ${alpha})`;
            ctx.fillRect(
                point.x - this.x - size / 2,
                point.y - this.y - size / 2,
                size,
                size
            );
        }
        
        ctx.restore();
    }
    
    renderGlow(ctx) {
        const glowSize = Math.max(this.width, this.height) * 2 * this.scale;
        
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = this.glowColor;
        ctx.fillRect(
            this.width / 2 - glowSize / 2,
            this.height / 2 - glowSize / 2,
            glowSize,
            glowSize
        );
        ctx.restore();
    }
    
    renderBody(ctx) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // 회전 적용
        if (this.rotation !== 0) {
            ctx.translate(centerX, centerY);
            ctx.rotate(this.rotation);
            ctx.translate(-centerX, -centerY);
        }
        
        // 크기 적용
        if (this.scale !== 1) {
            ctx.translate(centerX, centerY);
            ctx.scale(this.scale, this.scale);
            ctx.translate(-centerX, -centerY);
        }
        
        // 총알 모양에 따른 렌더링
        if (this.owner === 'player') {
            this.renderPlayerBullet(ctx);
        } else {
            this.renderEnemyBullet(ctx);
        }
    }
    
    renderPlayerBullet(ctx) {
        // 플레이어 총알 (화살표 모양)
        ctx.fillStyle = this.color;
        
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0); // 위쪽 끝
        ctx.lineTo(0, this.height * 0.7); // 왼쪽
        ctx.lineTo(this.width / 2, this.height * 0.5); // 중앙
        ctx.lineTo(this.width, this.height * 0.7); // 오른쪽
        ctx.closePath();
        ctx.fill();
        
        // 테두리
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
    
    renderEnemyBullet(ctx) {
        // 적 총알 (원형)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, Math.min(this.width, this.height) / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 내부 하이라이트
        ctx.fillStyle = '#ffaaaa';
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, Math.min(this.width, this.height) / 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    getColorRGB() {
        // 색상을 RGB 문자열로 변환
        if (this.color === '#ffff00') return '255, 255, 0';
        if (this.color === '#ff4444') return '255, 68, 68';
        return '255, 255, 255';
    }
    
    onCollision(other) {
        // 관통 총알 처리
        if (this.piercing && this.pierceCount < this.maxPierceCount) {
            this.pierceCount++;
            
            // 관통 효과
            this.createPierceEffect();
            
            if (this.pierceCount >= this.maxPierceCount) {
                this.destroy();
            }
        } else {
            // 일반 총알은 충돌 시 파괴
            this.destroy();
        }
        
        // 충돌 효과 생성
        this.createHitEffect(other);
    }
    
    createPierceEffect() {
        // 관통 시 파티클 효과
        if (window.game && window.game.entities && typeof Particle !== 'undefined') {
            for (let i = 0; i < 3; i++) {
                const particle = new Particle(
                    this.x + this.width / 2,
                    this.y + this.height / 2
                );
                particle.velocity.set(
                    MathUtils.randomFloat(-100, 100),
                    MathUtils.randomFloat(-100, 100)
                );
                particle.color = this.color;
                particle.setMaxAge(200);
                
                window.game.entities.particles.push(particle);
            }
        }
    }
    
    createHitEffect(target) {
        // 충돌 시 파티클 효과
        if (window.game && window.game.entities && typeof Particle !== 'undefined') {
            const particleCount = 5;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = new Particle(
                    this.x + this.width / 2,
                    this.y + this.height / 2
                );
                
                const angle = (Math.PI * 2 * i) / particleCount;
                const speed = MathUtils.randomFloat(50, 150);
                
                particle.velocity.set(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
                particle.color = this.color;
                particle.setMaxAge(300);
                particle.width = 2;
                particle.height = 2;
                
                window.game.entities.particles.push(particle);
            }
        }
    }
    
    // 특수 총알 타입 설정 메서드들
    
    makePiercing(maxPierceCount = 3) {
        this.piercing = true;
        this.maxPierceCount = maxPierceCount;
        this.color = '#00ffff';
        this.glowColor = '#88ffff';
        return this;
    }
    
    makeHoming(target = null, strength = 0.1) {
        this.homing = true;
        this.homingTarget = target;
        this.homingStrength = strength;
        this.color = '#ff00ff';
        this.glowColor = '#ff88ff';
        return this;
    }
    
    makeExplosive(radius = 50, damage = 2) {
        this.explosive = true;
        this.explosionRadius = radius;
        this.explosionDamage = damage;
        this.color = '#ff8800';
        this.glowColor = '#ffaa44';
        this.pulsing = true;
        return this;
    }
    
    makeLaser() {
        this.width = 3;
        this.height = 20;
        this.color = '#ff0000';
        this.glowColor = '#ff4444';
        this.hasGlow = true;
        this.trailLength = 8;
        return this;
    }
    
    // 폭발 총알 처리
    explode() {
        if (!this.explosive || !window.game) return;
        
        // 폭발 범위 내 적들에게 데미지
        const entities = this.owner === 'player' ? 
            window.game.entities.enemies : 
            [window.game.entities.player].filter(p => p && p.active);
        
        const explosionCenter = this.getCenter();
        
        entities.forEach(entity => {
            if (!entity || !entity.active) return;
            
            const distance = explosionCenter.distanceTo(entity.getCenter());
            if (distance <= this.explosionRadius) {
                if (entity.takeDamage) {
                    entity.takeDamage(this.explosionDamage);
                }
            }
        });
        
        // 폭발 효과
        if (window.game.collisionManager) {
            window.game.collisionManager.createExplosion(
                explosionCenter.x,
                explosionCenter.y,
                'large'
            );
        }
    }
    
    onDestroy() {
        // 폭발 총알인 경우 폭발 처리
        if (this.explosive) {
            this.explode();
        }
        
        super.onDestroy();
    }
    
    // 정적 팩토리 메서드들
    static createPlayerBullet(x, y) {
        const bullet = new Bullet(x, y, 'player');
        bullet.velocity.set(0, -500);
        return bullet;
    }
    
    static createEnemyBullet(x, y, targetX, targetY) {
        const bullet = new Bullet(x, y, 'enemy');
        const direction = new Vector2D(targetX - x, targetY - y).normalize();
        bullet.velocity = Vector2D.multiply(direction, 200);
        return bullet;
    }
    
    static createHomingBullet(x, y, owner, target) {
        const bullet = new Bullet(x, y, owner);
        bullet.makeHoming(target, 0.05);
        bullet.speed = 300;
        
        // 초기 방향 설정
        if (target) {
            const direction = Vector2D.subtract(target.getCenter(), new Vector2D(x, y)).normalize();
            bullet.velocity = Vector2D.multiply(direction, bullet.speed);
        }
        
        return bullet;
    }
    
    // 디버그 정보
    getDebugInfo() {
        return {
            owner: this.owner,
            damage: this.damage,
            position: `(${Math.round(this.x)}, ${Math.round(this.y)})`,
            velocity: `(${Math.round(this.velocity.x)}, ${Math.round(this.velocity.y)})`,
            piercing: this.piercing,
            homing: this.homing,
            explosive: this.explosive
        };
    }
}