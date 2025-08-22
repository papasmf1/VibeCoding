// 파티클 클래스
class Particle extends Entity {
    constructor(x, y) {
        super(x, y, 2, 2);
        
        // 파티클 속성
        this.startSize = 2;
        this.endSize = 0;
        this.currentSize = this.startSize;
        
        // 색상 및 투명도
        this.startColor = '#ffffff';
        this.endColor = '#ffffff';
        this.currentColor = this.startColor;
        this.startAlpha = 1;
        this.endAlpha = 0;
        this.currentAlpha = this.startAlpha;
        
        // 물리 속성
        this.gravity = 0;
        this.friction = 0.98;
        this.bounce = 0;
        this.airResistance = 0.99;
        
        // 생명주기
        this.lifespan = 1000; // 1초
        this.age = 0;
        this.fadeStart = 0.7; // 생명의 70% 지점부터 페이드
        
        // 애니메이션
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.scaleSpeed = 0;
        
        // 특수 효과
        this.trail = [];
        this.trailLength = 0;
        this.glow = false;
        this.glowSize = 4;
        
        // 충돌 비활성화 (파티클은 보통 충돌하지 않음)
        this.collisionEnabled = false;
        
        // 타입별 설정
        this.type = 'default';
        
        // 물리 시뮬레이션
        this.mass = 1;
        this.forces = [];
    }
    
    onUpdate(deltaTime) {
        const deltaSeconds = deltaTime / 1000;
        this.age += deltaTime;
        
        // 생명주기 체크
        if (this.age >= this.lifespan) {
            this.destroy();
            return;
        }
        
        // 물리 업데이트
        this.updatePhysics(deltaSeconds);
        
        // 시각적 속성 업데이트
        this.updateVisuals();
        
        // 트레일 업데이트
        if (this.trailLength > 0) {
            this.updateTrail();
        }
        
        // 회전 업데이트
        this.rotation += this.rotationSpeed * deltaSeconds;
        
        // 크기 변화
        if (this.scaleSpeed !== 0) {
            this.currentSize += this.scaleSpeed * deltaSeconds;
            this.currentSize = Math.max(0, this.currentSize);
        }
    }
    
    updatePhysics(deltaSeconds) {
        // 힘 적용
        this.forces.forEach(force => {
            this.velocity.x += force.x / this.mass * deltaSeconds;
            this.velocity.y += force.y / this.mass * deltaSeconds;
        });
        this.forces = []; // 힘 초기화
        
        // 중력 적용
        if (this.gravity !== 0) {
            this.velocity.y += this.gravity * deltaSeconds;
        }
        
        // 공기 저항
        this.velocity.multiply(this.airResistance);
        
        // 마찰
        this.velocity.multiply(this.friction);
        
        // 위치 업데이트
        this.x += this.velocity.x * deltaSeconds;
        this.y += this.velocity.y * deltaSeconds;
        
        // 바운스 (화면 경계)
        if (this.bounce > 0 && window.game && window.game.canvas) {
            const canvas = window.game.canvas;
            
            if (this.x <= 0 || this.x >= canvas.width) {
                this.velocity.x *= -this.bounce;
                this.x = MathUtils.clamp(this.x, 0, canvas.width);
            }
            
            if (this.y <= 0 || this.y >= canvas.height) {
                this.velocity.y *= -this.bounce;
                this.y = MathUtils.clamp(this.y, 0, canvas.height);
            }
        }
    }
    
    updateVisuals() {
        const lifePercent = this.age / this.lifespan;
        
        // 크기 보간
        this.currentSize = MathUtils.lerp(this.startSize, this.endSize, lifePercent);
        this.width = this.currentSize;
        this.height = this.currentSize;
        
        // 투명도 보간 (페이드 시작점 고려)
        if (lifePercent >= this.fadeStart) {
            const fadePercent = (lifePercent - this.fadeStart) / (1 - this.fadeStart);
            this.currentAlpha = MathUtils.lerp(this.startAlpha, this.endAlpha, fadePercent);
        } else {
            this.currentAlpha = this.startAlpha;
        }
        
        // 색상 보간 (간단한 구현)
        this.currentColor = this.interpolateColor(this.startColor, this.endColor, lifePercent);
    }
    
    updateTrail() {
        // 현재 위치를 트레일에 추가
        this.trail.unshift({
            x: this.x,
            y: this.y,
            time: this.age
        });
        
        // 트레일 길이 제한
        if (this.trail.length > this.trailLength) {
            this.trail.pop();
        }
        
        // 오래된 트레일 포인트 제거
        this.trail = this.trail.filter(point => 
            this.age - point.time < 300 // 0.3초 이내
        );
    }
    
    interpolateColor(color1, color2, t) {
        // 간단한 색상 보간 (HEX 색상용)
        if (color1 === color2) return color1;
        
        // RGB 변환 후 보간 (간단한 구현)
        const rgb1 = ColorUtils.hexToRgb(color1);
        const rgb2 = ColorUtils.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return color1;
        
        const r = Math.round(MathUtils.lerp(rgb1.r, rgb2.r, t));
        const g = Math.round(MathUtils.lerp(rgb1.g, rgb2.g, t));
        const b = Math.round(MathUtils.lerp(rgb1.b, rgb2.b, t));
        
        return ColorUtils.rgbToHex(r, g, b);
    }
    
    onRender(ctx) {
        if (this.currentAlpha <= 0 || this.currentSize <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.currentAlpha;
        
        // 트레일 렌더링
        if (this.trail.length > 1) {
            this.renderTrail(ctx);
        }
        
        // 글로우 효과
        if (this.glow) {
            this.renderGlow(ctx);
        }
        
        // 파티클 본체
        this.renderBody(ctx);
        
        ctx.restore();
    }
    
    renderTrail(ctx) {
        ctx.save();
        
        for (let i = 1; i < this.trail.length; i++) {
            const point = this.trail[i];
            const alpha = (this.trailLength - i) / this.trailLength * this.currentAlpha * 0.5;
            const size = (this.trailLength - i) / this.trailLength * this.currentSize;
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.currentColor;
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
        const glowSize = this.currentSize + this.glowSize;
        
        ctx.save();
        ctx.globalAlpha = this.currentAlpha * 0.3;
        ctx.fillStyle = this.currentColor;
        ctx.fillRect(
            -glowSize / 2 + this.currentSize / 2,
            -glowSize / 2 + this.currentSize / 2,
            glowSize,
            glowSize
        );
        ctx.restore();
    }
    
    renderBody(ctx) {
        // 회전 적용
        if (this.rotation !== 0) {
            ctx.translate(this.currentSize / 2, this.currentSize / 2);
            ctx.rotate(this.rotation);
            ctx.translate(-this.currentSize / 2, -this.currentSize / 2);
        }
        
        // 타입별 렌더링
        switch (this.type) {
            case 'spark':
                this.renderSpark(ctx);
                break;
            case 'smoke':
                this.renderSmoke(ctx);
                break;
            case 'star':
                this.renderStar(ctx);
                break;
            case 'circle':
                this.renderCircle(ctx);
                break;
            default:
                this.renderDefault(ctx);
        }
    }
    
    renderDefault(ctx) {
        ctx.fillStyle = this.currentColor;
        ctx.fillRect(0, 0, this.currentSize, this.currentSize);
    }
    
    renderSpark(ctx) {
        // 스파크 효과 (선 모양)
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = Math.max(1, this.currentSize / 2);
        ctx.beginPath();
        ctx.moveTo(0, this.currentSize / 2);
        ctx.lineTo(this.currentSize, this.currentSize / 2);
        ctx.stroke();
    }
    
    renderSmoke(ctx) {
        // 연기 효과 (원형, 부드러운 가장자리)
        ctx.fillStyle = this.currentColor;
        ctx.beginPath();
        ctx.arc(this.currentSize / 2, this.currentSize / 2, this.currentSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderStar(ctx) {
        // 별 모양
        ctx.fillStyle = this.currentColor;
        ctx.beginPath();
        
        const centerX = this.currentSize / 2;
        const centerY = this.currentSize / 2;
        const radius = this.currentSize / 2;
        
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // 내부 점
            const innerAngle = angle + Math.PI / 5;
            const innerX = centerX + Math.cos(innerAngle) * radius * 0.4;
            const innerY = centerY + Math.sin(innerAngle) * radius * 0.4;
            ctx.lineTo(innerX, innerY);
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    renderCircle(ctx) {
        // 원형
        ctx.fillStyle = this.currentColor;
        ctx.beginPath();
        ctx.arc(this.currentSize / 2, this.currentSize / 2, this.currentSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 테두리
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
    
    // 힘 추가
    addForce(forceX, forceY) {
        this.forces.push(new Vector2D(forceX, forceY));
    }
    
    // 설정 메서드들
    setLifespan(lifespan) {
        this.lifespan = lifespan;
        return this;
    }
    
    setSize(startSize, endSize = 0) {
        this.startSize = startSize;
        this.endSize = endSize;
        this.currentSize = startSize;
        this.width = startSize;
        this.height = startSize;
        return this;
    }
    
    setColor(startColor, endColor = null) {
        this.startColor = startColor;
        this.endColor = endColor || startColor;
        this.currentColor = startColor;
        return this;
    }
    
    setAlpha(startAlpha, endAlpha = 0) {
        this.startAlpha = startAlpha;
        this.endAlpha = endAlpha;
        this.currentAlpha = startAlpha;
        return this;
    }
    
    setVelocity(vx, vy) {
        this.velocity.set(vx, vy);
        return this;
    }
    
    setGravity(gravity) {
        this.gravity = gravity;
        return this;
    }
    
    setFriction(friction) {
        this.friction = friction;
        return this;
    }
    
    setBounce(bounce) {
        this.bounce = bounce;
        return this;
    }
    
    setRotation(rotationSpeed) {
        this.rotationSpeed = rotationSpeed;
        return this;
    }
    
    setTrail(length) {
        this.trailLength = length;
        this.trail = [];
        return this;
    }
    
    setGlow(enabled, size = 4) {
        this.glow = enabled;
        this.glowSize = size;
        return this;
    }
    
    setType(type) {
        this.type = type;
        return this;
    }
    
    // 정적 팩토리 메서드들
    
    // 폭발 파티클
    static createExplosion(x, y, count = 10, color = '#ff4444') {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const particle = new Particle(x, y);
            const angle = (Math.PI * 2 * i) / count + MathUtils.randomFloat(-0.2, 0.2);
            const speed = MathUtils.randomFloat(100, 300);
            
            particle
                .setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
                .setSize(MathUtils.randomFloat(3, 8), 0)
                .setColor(color, '#ffaa00')
                .setLifespan(MathUtils.randomFloat(500, 1000))
                .setGravity(50)
                .setFriction(0.95)
                .setType('spark');
            
            particles.push(particle);
        }
        
        return particles;
    }
    
    // 연기 파티클
    static createSmoke(x, y, count = 5) {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const particle = new Particle(x, y);
            
            particle
                .setVelocity(
                    MathUtils.randomFloat(-30, 30),
                    MathUtils.randomFloat(-100, -50)
                )
                .setSize(MathUtils.randomFloat(8, 15), MathUtils.randomFloat(20, 30))
                .setColor('#666666', '#333333')
                .setAlpha(0.7, 0)
                .setLifespan(MathUtils.randomFloat(2000, 3000))
                .setType('smoke')
                .setGravity(-20); // 위로 올라감
            
            particles.push(particle);
        }
        
        return particles;
    }
    
    // 스파크 파티클
    static createSparks(x, y, count = 8, color = '#ffff00') {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const particle = new Particle(x, y);
            const angle = Math.random() * Math.PI * 2;
            const speed = MathUtils.randomFloat(80, 200);
            
            particle
                .setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
                .setSize(MathUtils.randomFloat(2, 4), 0)
                .setColor(color)
                .setLifespan(MathUtils.randomFloat(300, 600))
                .setGravity(200)
                .setFriction(0.98)
                .setType('spark')
                .setBounce(0.3);
            
            particles.push(particle);
        }
        
        return particles;
    }
    
    // 별 파티클 (수집 효과)
    static createStars(x, y, count = 6, color = '#ffff00') {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const particle = new Particle(x, y);
            const angle = (Math.PI * 2 * i) / count;
            const speed = MathUtils.randomFloat(60, 120);
            
            particle
                .setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
                .setSize(6, 0)
                .setColor(color)
                .setLifespan(800)
                .setRotation(MathUtils.randomFloat(-5, 5))
                .setType('star')
                .setGlow(true, 2);
            
            particles.push(particle);
        }
        
        return particles;
    }
    
    // 트레일 파티클
    static createTrail(x, y, velocityX, velocityY, color = '#00ffff') {
        const particle = new Particle(x, y);
        
        particle
            .setVelocity(velocityX * 0.5, velocityY * 0.5)
            .setSize(3, 0)
            .setColor(color)
            .setLifespan(200)
            .setTrail(3)
            .setType('circle');
        
        return particle;
    }
    
    // 파티클 시스템 관리
    static addToGame(particles) {
        if (!window.game || !window.game.entities) return;
        
        particles.forEach(particle => {
            window.game.entities.particles.push(particle);
        });
    }
    
    // 디버그 정보
    getDebugInfo() {
        return {
            type: this.type,
            age: `${Math.round(this.age)}/${this.lifespan}`,
            size: `${this.currentSize.toFixed(1)}`,
            alpha: this.currentAlpha.toFixed(2),
            velocity: `(${Math.round(this.velocity.x)}, ${Math.round(this.velocity.y)})`,
            position: `(${Math.round(this.x)}, ${Math.round(this.y)})`
        };
    }
}