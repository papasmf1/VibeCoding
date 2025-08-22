// 플레이어 클래스
class Player extends Entity {
    constructor(x, y) {
        super(x, y, 32, 32);
        
        // 플레이어 속성
        this.speed = 300; // 픽셀/초
        this.health = 3;
        this.maxHealth = 3;
        
        // 총알 발사 관련
        this.fireRate = 0.2; // 초당 발사 횟수
        this.lastFireTime = 0;
        this.bulletSpeed = 500;
        this.bulletDamage = 1;
        
        // 시각적 속성
        this.color = '#00ffff';
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 2000; // 2초
        
        // 애니메이션 관련
        this.blinkTimer = 0;
        this.blinkInterval = 100; // 0.1초마다 깜빡임
        this.visible = true;
        
        // 무기 업그레이드 시스템
        this.weaponLevel = 1;
        this.maxWeaponLevel = 10;
        
        // 파워업 관련
        this.powerups = {
            doubleShot: false,
            tripleShot: false,
            rapidFire: false,
            shield: false
        };
        this.powerupTimers = {};
        
        // 충돌 설정
        this.collisionGroup = 'player';
        this.collisionEnabled = true;
        
        // 이동 관련
        this.smoothMovement = true;
        this.acceleration = 1200; // 가속도
        this.deceleration = 800; // 감속도
        this.currentVelocity = new Vector2D(0, 0);
        
        // 트레일 효과
        this.trailPositions = [];
        this.maxTrailLength = 5;
        
        // 사운드 (나중에 추가될 수 있음)
        this.sounds = {
            shoot: null,
            hit: null,
            powerup: null
        };
    }
    
    update(deltaTime, inputManager) {
        if (!this.active) return;
        
        super.update(deltaTime);
        
        // 무적 시간 처리
        this.updateInvulnerability(deltaTime);
        
        // 파워업 타이머 업데이트
        this.updatePowerups(deltaTime);
        
        // 입력 처리
        this.handleInput(inputManager, deltaTime);
        
        // 트레일 업데이트
        this.updateTrail();
        
        // 화면 경계 제한
        this.clampToScreen();
    }
    
    handleInput(inputManager, deltaTime) {
        if (!inputManager) return;
        
        // 이동 입력 처리
        const movement = inputManager.getMovementVector();
        this.handleMovement(movement, deltaTime);
        
        // 발사 입력 처리
        if (inputManager.isShootPressed()) {
            this.shoot();
        }
    }
    
    handleMovement(movement, deltaTime) {
        const deltaSeconds = deltaTime / 1000;
        
        if (this.smoothMovement) {
            // 부드러운 이동 (가속/감속)
            if (movement.magnitude() > 0) {
                // 가속
                const targetVelocity = Vector2D.multiply(movement, this.speed);
                this.currentVelocity = Vector2D.lerp(
                    this.currentVelocity,
                    targetVelocity,
                    this.acceleration * deltaSeconds / this.speed
                );
            } else {
                // 감속
                this.currentVelocity = Vector2D.multiply(
                    this.currentVelocity,
                    Math.max(0, 1 - (this.deceleration * deltaSeconds / this.speed))
                );
            }
            
            // 위치 업데이트
            this.x += this.currentVelocity.x * deltaSeconds;
            this.y += this.currentVelocity.y * deltaSeconds;
        } else {
            // 즉시 이동
            this.x += movement.x * this.speed * deltaSeconds;
            this.y += movement.y * this.speed * deltaSeconds;
        }
    }
    
    shoot() {
        const currentTime = Date.now();
        const fireInterval = this.powerups.rapidFire ? this.fireRate / 2 : this.fireRate;
        
        if (currentTime - this.lastFireTime < fireInterval * 1000) {
            return; // 아직 발사할 수 없음
        }
        
        this.lastFireTime = currentTime;
        
        // 총알 생성
        this.createBullets();
        
        // 사운드 재생 (나중에 구현)
        // this.playSound('shoot');
    }
    
    createBullets() {
        if (!window.game || !window.game.entities) return;
        
        try {
            const bullets = [];
            const centerX = this.x + this.width / 2;
            const centerY = this.y;
            
            // 무기 레벨에 따른 총알 발사
            this.createBulletsForWeaponLevel(bullets, centerX, centerY);
            
            // 게임에 총알 추가
            bullets.forEach(bullet => {
                if (bullet && window.game && window.game.entities) {
                    window.game.entities.bullets.push(bullet);
                }
            });
        } catch (error) {
            console.error('Create bullets error:', error);
        }
    }
    
    createBulletsForWeaponLevel(bullets, centerX, centerY) {
        const level = this.weaponLevel;
        
        if (level >= 1) {
            // 레벨 1: 중앙 1발
            bullets.push(this.createBullet(centerX, centerY, 0));
        }
        
        if (level >= 2) {
            // 레벨 2: 좌우 2발 추가 (총 3발)
            bullets.push(this.createBullet(centerX - 8, centerY + 5, -0.1));
            bullets.push(this.createBullet(centerX + 8, centerY + 5, 0.1));
        }
        
        if (level >= 3) {
            // 레벨 3: 더 넓은 각도로 2발 추가 (총 5발)
            bullets.push(this.createBullet(centerX - 12, centerY + 8, -0.2));
            bullets.push(this.createBullet(centerX + 12, centerY + 8, 0.2));
        }
        
        if (level >= 4) {
            // 레벨 4: 더 넓은 각도로 2발 추가 (총 7발)
            bullets.push(this.createBullet(centerX - 16, centerY + 10, -0.3));
            bullets.push(this.createBullet(centerX + 16, centerY + 10, 0.3));
        }
        
        if (level >= 5) {
            // 레벨 5: 후방 발사 2발 추가 (총 9발)
            bullets.push(this.createBullet(centerX - 4, centerY + 15, -0.05));
            bullets.push(this.createBullet(centerX + 4, centerY + 15, 0.05));
        }
        
        if (level >= 6) {
            // 레벨 6: 날개 끝에서 발사 (총 11발)
            bullets.push(this.createBullet(centerX - 20, centerY + 12, -0.15));
            bullets.push(this.createBullet(centerX + 20, centerY + 12, 0.15));
        }
        
        if (level >= 7) {
            // 레벨 7: 더 많은 각도 (총 13발)
            bullets.push(this.createBullet(centerX - 6, centerY + 3, -0.4));
            bullets.push(this.createBullet(centerX + 6, centerY + 3, 0.4));
        }
        
        if (level >= 8) {
            // 레벨 8: 측면 발사 (총 15발)
            bullets.push(this.createBullet(centerX - 24, centerY + 8, -0.5));
            bullets.push(this.createBullet(centerX + 24, centerY + 8, 0.5));
        }
        
        if (level >= 9) {
            // 레벨 9: 더 많은 후방 발사 (총 17발)
            bullets.push(this.createBullet(centerX - 2, centerY + 18, -0.02));
            bullets.push(this.createBullet(centerX + 2, centerY + 18, 0.02));
        }
        
        if (level >= 10) {
            // 레벨 10: 최대 화력 (총 19발)
            bullets.push(this.createBullet(centerX - 28, centerY + 6, -0.6));
            bullets.push(this.createBullet(centerX + 28, centerY + 6, 0.6));
            
            // 특수 총알 (관통 총알)
            const specialBullet = this.createBullet(centerX, centerY - 5, 0);
            if (specialBullet) {
                specialBullet.makePiercing(3);
                specialBullet.color = '#ff00ff';
                bullets.push(specialBullet);
            }
        }
    }
    
    createBullet(x, y, angleOffset = 0) {
        if (typeof Bullet === 'undefined') return null;
        
        const bullet = new Bullet(x - 2, y - 8, 'player');
        bullet.velocity.set(0, -this.bulletSpeed);
        bullet.damage = this.bulletDamage;
        bullet.color = '#ffff00';
        
        // 각도 오프셋 적용
        if (angleOffset !== 0) {
            bullet.velocity.rotate(angleOffset);
        }
        
        return bullet;
    }
    
    takeDamage(damage = 1) {
        if (this.invulnerable || !this.active) return false;
        
        this.health -= damage;
        
        if (this.health <= 0) {
            this.health = 0;
            this.destroy();
            
            // 게임 오버
            if (window.game) {
                window.game.gameOver();
            }
            return true;
        } else {
            // 무적 시간 시작
            this.startInvulnerability();
            return false;
        }
    }
    
    heal(amount = 1) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
    
    startInvulnerability() {
        this.invulnerable = true;
        this.invulnerabilityTime = this.invulnerabilityDuration;
    }
    
    updateInvulnerability(deltaTime) {
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            
            // 깜빡임 효과
            this.blinkTimer += deltaTime;
            if (this.blinkTimer >= this.blinkInterval) {
                this.visible = !this.visible;
                this.blinkTimer = 0;
            }
            
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
                this.visible = true;
            }
        }
    }
    
    updatePowerups(deltaTime) {
        Object.keys(this.powerupTimers).forEach(powerup => {
            this.powerupTimers[powerup] -= deltaTime;
            
            if (this.powerupTimers[powerup] <= 0) {
                this.powerups[powerup] = false;
                delete this.powerupTimers[powerup];
                console.log(`파워업 ${powerup} 종료`);
            }
        });
    }
    
    applyPowerup(type, duration = 10000) {
        switch (type) {
            case 'doubleShot':
                this.powerups.doubleShot = true;
                this.powerups.tripleShot = false; // 상위 파워업으로 교체
                this.powerupTimers.doubleShot = duration;
                break;
                
            case 'tripleShot':
                this.powerups.tripleShot = true;
                this.powerups.doubleShot = false; // 하위 파워업 비활성화
                this.powerupTimers.tripleShot = duration;
                break;
                
            case 'rapidFire':
                this.powerups.rapidFire = true;
                this.powerupTimers.rapidFire = duration;
                break;
                
            case 'shield':
                this.powerups.shield = true;
                this.powerupTimers.shield = duration;
                break;
                
            case 'health':
                this.heal(1);
                break;
                
            default:
                console.log(`알 수 없는 파워업: ${type}`);
        }
    }
    
    updateTrail() {
        // 현재 위치를 트레일에 추가
        this.trailPositions.unshift({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        });
        
        // 트레일 길이 제한
        if (this.trailPositions.length > this.maxTrailLength) {
            this.trailPositions.pop();
        }
    }
    
    clampToScreen() {
        if (!window.game || !window.game.canvas) return;
        
        const canvas = window.game.canvas;
        this.x = MathUtils.clamp(this.x, 0, canvas.width - this.width);
        this.y = MathUtils.clamp(this.y, 0, canvas.height - this.height);
    }
    
    onRender(ctx) {
        if (!this.visible) return;
        
        // 트레일 렌더링
        this.renderTrail(ctx);
        
        // 쉴드 효과 렌더링
        if (this.powerups.shield) {
            this.renderShield(ctx);
        }
        
        // 플레이어 본체 렌더링
        this.renderBody(ctx);
        
        // 파워업 표시
        this.renderPowerupIndicators(ctx);
    }
    
    renderTrail(ctx) {
        if (this.trailPositions.length < 2) return;
        
        ctx.save();
        
        for (let i = 1; i < this.trailPositions.length; i++) {
            const pos = this.trailPositions[i];
            const alpha = (this.maxTrailLength - i) / this.maxTrailLength * 0.3;
            const size = (this.maxTrailLength - i) / this.maxTrailLength * 4;
            
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.fillRect(
                pos.x - this.x - size / 2,
                pos.y - this.y - size / 2,
                size,
                size
            );
        }
        
        ctx.restore();
    }
    
    renderBody(ctx) {
        // 멋진 우주선 모양
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // 메인 선체 (유선형)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(centerX, 0); // 앞쪽 끝
        ctx.lineTo(centerX - this.width * 0.3, this.height * 0.4);
        ctx.lineTo(centerX - this.width * 0.4, this.height * 0.7);
        ctx.lineTo(centerX - this.width * 0.2, this.height);
        ctx.lineTo(centerX + this.width * 0.2, this.height);
        ctx.lineTo(centerX + this.width * 0.4, this.height * 0.7);
        ctx.lineTo(centerX + this.width * 0.3, this.height * 0.4);
        ctx.closePath();
        ctx.fill();
        
        // 조종석 (투명한 파란색)
        ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
        ctx.beginPath();
        ctx.ellipse(centerX, this.height * 0.3, this.width * 0.15, this.height * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 날개 (좌우)
        ctx.fillStyle = '#0088ff';
        // 왼쪽 날개
        ctx.beginPath();
        ctx.moveTo(centerX - this.width * 0.3, this.height * 0.4);
        ctx.lineTo(centerX - this.width * 0.6, this.height * 0.5);
        ctx.lineTo(centerX - this.width * 0.5, this.height * 0.8);
        ctx.lineTo(centerX - this.width * 0.4, this.height * 0.7);
        ctx.closePath();
        ctx.fill();
        
        // 오른쪽 날개
        ctx.beginPath();
        ctx.moveTo(centerX + this.width * 0.3, this.height * 0.4);
        ctx.lineTo(centerX + this.width * 0.6, this.height * 0.5);
        ctx.lineTo(centerX + this.width * 0.5, this.height * 0.8);
        ctx.lineTo(centerX + this.width * 0.4, this.height * 0.7);
        ctx.closePath();
        ctx.fill();
        
        // 무기 포트 (업그레이드 레벨에 따라)
        this.renderWeaponPorts(ctx);
        
        // 테두리
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX - this.width * 0.3, this.height * 0.4);
        ctx.lineTo(centerX - this.width * 0.4, this.height * 0.7);
        ctx.lineTo(centerX - this.width * 0.2, this.height);
        ctx.lineTo(centerX + this.width * 0.2, this.height);
        ctx.lineTo(centerX + this.width * 0.4, this.height * 0.7);
        ctx.lineTo(centerX + this.width * 0.3, this.height * 0.4);
        ctx.closePath();
        ctx.stroke();
        
        // 엔진 불꽃 효과
        if (this.currentVelocity.magnitude() > 50) {
            this.renderEngineFlame(ctx);
        }
    }
    
    renderWeaponPorts(ctx) {
        const centerX = this.width / 2;
        const weaponLevel = this.weaponLevel || 1;
        
        // 무기 포트 표시 (레벨에 따라 개수 증가)
        ctx.fillStyle = '#ffff00';
        
        if (weaponLevel >= 1) {
            // 중앙 포트
            ctx.fillRect(centerX - 1, this.height * 0.1, 2, 4);
        }
        
        if (weaponLevel >= 2) {
            // 좌우 포트
            ctx.fillRect(centerX - 8, this.height * 0.2, 2, 3);
            ctx.fillRect(centerX + 6, this.height * 0.2, 2, 3);
        }
        
        if (weaponLevel >= 4) {
            // 추가 좌우 포트
            ctx.fillRect(centerX - 12, this.height * 0.3, 2, 3);
            ctx.fillRect(centerX + 10, this.height * 0.3, 2, 3);
        }
        
        if (weaponLevel >= 6) {
            // 날개 끝 포트
            ctx.fillRect(centerX - 16, this.height * 0.4, 2, 3);
            ctx.fillRect(centerX + 14, this.height * 0.4, 2, 3);
        }
        
        if (weaponLevel >= 8) {
            // 후방 포트
            ctx.fillRect(centerX - 4, this.height * 0.6, 2, 3);
            ctx.fillRect(centerX + 2, this.height * 0.6, 2, 3);
        }
        
        if (weaponLevel >= 10) {
            // 최대 레벨 특수 포트
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(centerX - 20, this.height * 0.5, 2, 4);
            ctx.fillRect(centerX + 18, this.height * 0.5, 2, 4);
        }
    }
    
    renderEngineFlame(ctx) {
        const flameHeight = MathUtils.randomFloat(8, 12);
        const flameWidth = 6;
        
        ctx.fillStyle = '#ff4400';
        ctx.fillRect(
            this.width / 2 - flameWidth / 2,
            this.height,
            flameWidth,
            flameHeight
        );
        
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(
            this.width / 2 - flameWidth / 4,
            this.height,
            flameWidth / 2,
            flameHeight * 0.6
        );
    }
    
    renderShield(ctx) {
        ctx.save();
        
        const time = Date.now() / 1000;
        const radius = Math.max(this.width, this.height) / 2 + 8;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // 회전하는 쉴드 효과
        ctx.strokeStyle = `rgba(0, 255, 0, ${0.5 + Math.sin(time * 4) * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // 육각형 쉴드 패턴
        ctx.strokeStyle = `rgba(0, 255, 0, ${0.3 + Math.sin(time * 6) * 0.2})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6 + time;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
    }
    
    renderPowerupIndicators(ctx) {
        let indicatorY = -20;
        
        // 활성 파워업 표시
        Object.keys(this.powerups).forEach(powerup => {
            if (this.powerups[powerup]) {
                ctx.fillStyle = '#ffff00';
                ctx.font = '8px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(powerup.charAt(0).toUpperCase(), this.width / 2, indicatorY);
                indicatorY -= 10;
            }
        });
    }
    
    // 체력 바 렌더링 (UI에서 호출)
    renderHealthBar(ctx, x, y) {
        const barWidth = 60;
        const barHeight = 8;
        
        // 배경
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // 체력
        const healthPercent = this.health / this.maxHealth;
        const healthWidth = barWidth * healthPercent;
        
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : 
                       healthPercent > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(x, y, healthWidth, barHeight);
        
        // 테두리
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }
    
    onCollision(other) {
        // 충돌 처리는 CollisionManager에서 담당
        // 여기서는 추가적인 효과만 처리
        
        if (other.collisionGroup === 'enemy' || other.collisionGroup === 'enemy_bullet') {
            // 화면 흔들림 효과 (나중에 구현)
            // this.createScreenShake();
        }
    }
    
    onDestroy() {
        super.onDestroy();
        
        // 플레이어 파괴 시 폭발 효과
        if (window.game && window.game.collisionManager) {
            window.game.collisionManager.createExplosion(
                this.x + this.width / 2,
                this.y + this.height / 2,
                'large'
            );
        }
    }
    
    // 디버그 정보
    getDebugInfo() {
        return {
            health: `${this.health}/${this.maxHealth}`,
            position: `(${Math.round(this.x)}, ${Math.round(this.y)})`,
            velocity: `(${Math.round(this.currentVelocity.x)}, ${Math.round(this.currentVelocity.y)})`,
            invulnerable: this.invulnerable,
            activePowerups: Object.keys(this.powerups).filter(p => this.powerups[p])
        };
    }
}