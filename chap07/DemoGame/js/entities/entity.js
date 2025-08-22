// 기본 엔티티 클래스
class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // 이동 관련
        this.velocity = new Vector2D(0, 0);
        this.speed = 0;
        
        // 상태 관리
        this.shouldDestroy = false;
        this.active = true;
        
        // 렌더링 관련
        this.color = '#ffffff';
        this.rotation = 0;
        
        // 충돌 관련
        this.collisionEnabled = true;
        this.collisionGroup = 'default';
        
        // 생명주기
        this.age = 0;
        this.maxAge = -1; // -1이면 무제한
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // 나이 증가
        this.age += deltaTime;
        
        // 최대 나이 체크
        if (this.maxAge > 0 && this.age >= this.maxAge) {
            this.destroy();
            return;
        }
        
        // 위치 업데이트
        this.x += this.velocity.x * (deltaTime / 1000);
        this.y += this.velocity.y * (deltaTime / 1000);
        
        // 자식 클래스에서 오버라이드할 수 있는 업데이트 로직
        this.onUpdate(deltaTime);
    }
    
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // 회전 적용
        if (this.rotation !== 0) {
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.rotation);
            ctx.translate(-this.width / 2, -this.height / 2);
        } else {
            ctx.translate(this.x, this.y);
        }
        
        // 자식 클래스에서 오버라이드할 렌더링 로직
        this.onRender(ctx);
        
        ctx.restore();
    }
    
    onUpdate(deltaTime) {
        // 자식 클래스에서 구현
    }
    
    onRender(ctx) {
        // 기본 렌더링 (사각형)
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, this.width, this.height);
    }
    
    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height,
            centerX: this.x + this.width / 2,
            centerY: this.y + this.height / 2,
            width: this.width,
            height: this.height
        };
    }
    
    getCenter() {
        return new Vector2D(
            this.x + this.width / 2,
            this.y + this.height / 2
        );
    }
    
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    setVelocity(vx, vy) {
        this.velocity.x = vx;
        this.velocity.y = vy;
    }
    
    move(direction, speed, deltaTime) {
        const normalizedDir = direction.normalize();
        this.x += normalizedDir.x * speed * (deltaTime / 1000);
        this.y += normalizedDir.y * speed * (deltaTime / 1000);
    }
    
    distanceTo(other) {
        const dx = this.getCenter().x - other.getCenter().x;
        const dy = this.getCenter().y - other.getCenter().y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    isColliding(other) {
        if (!this.collisionEnabled || !other.collisionEnabled) {
            return false;
        }
        
        const bounds1 = this.getBounds();
        const bounds2 = other.getBounds();
        
        return !(bounds1.right < bounds2.left ||
                bounds1.left > bounds2.right ||
                bounds1.bottom < bounds2.top ||
                bounds1.top > bounds2.bottom);
    }
    
    onCollision(other) {
        // 자식 클래스에서 구현
    }
    
    destroy() {
        this.shouldDestroy = true;
        this.active = false;
        this.onDestroy();
    }
    
    onDestroy() {
        // 자식 클래스에서 구현
    }
    
    isOutOfBounds(canvasWidth, canvasHeight, margin = 50) {
        return (this.x < -margin ||
                this.x > canvasWidth + margin ||
                this.y < -margin ||
                this.y > canvasHeight + margin);
    }
    
    clampToBounds(canvasWidth, canvasHeight) {
        this.x = Math.max(0, Math.min(this.x, canvasWidth - this.width));
        this.y = Math.max(0, Math.min(this.y, canvasHeight - this.height));
    }
    
    // 유틸리티 메서드들
    setColor(color) {
        this.color = color;
    }
    
    setRotation(angle) {
        this.rotation = angle;
    }
    
    setSize(width, height) {
        this.width = width;
        this.height = height;
    }
    
    setCollisionGroup(group) {
        this.collisionGroup = group;
    }
    
    enableCollision() {
        this.collisionEnabled = true;
    }
    
    disableCollision() {
        this.collisionEnabled = false;
    }
    
    setMaxAge(maxAge) {
        this.maxAge = maxAge;
    }
    
    // 디버그용 경계 박스 렌더링
    renderBounds(ctx, color = '#ff0000') {
        const bounds = this.getBounds();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(bounds.left, bounds.top, bounds.width, bounds.height);
        
        // 중심점 표시
        ctx.fillStyle = color;
        ctx.fillRect(bounds.centerX - 1, bounds.centerY - 1, 2, 2);
    }
}