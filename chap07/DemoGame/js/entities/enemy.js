// 적 엔티티 클래스
class Enemy extends Entity {
    constructor(x, y, type = 'basic') {
        // 타입별 기본 크기 설정
        const config = Enemy.getTypeConfig(type);
        super(x, y, config.width, config.height);
        
        // 적 타입 및 기본 속성
        this.type = type;
        this.health = config.health;
        this.maxHealth = config.health;
        this.speed = config.speed;
        this.points = config.points;
        this.damage = config.damage;
        
        // 이동 패턴
        this.movementPattern = config.movementPattern || 'straight';
        this.movementTimer = 0;
        this.movementData = {};
        
        // 시각적 속성
        this.color = config.color;
        this.secondaryColor = config.secondaryColor || '#ffffff';
        
        // 총알 발사 관련
        this.canShoot = config.canShoot || false;
        this.fireRate = config.fireRate || 1; // 초당 발사 횟수
        this.lastFireTime = 0;
        this.bulletSpeed = config.bulletSpeed || 200;
        this.shootRange = config.shootRange || 300;
        
        // 충돌 설정
        this.collisionGroup = 'enemy';
        this.collisionEnabled = true;
        
        // 애니메이션
        this.animationTimer = 0;
        this.animationSpeed = config.animationSpeed || 1;
        this.frame = 0;
        this.maxFrames = config.maxFrames || 1;
        
        // 특수 능력
        this.abilities = config.abilities || [];
        this.abilityTimers = {};
        
        // 상태 관리
        this.state = 'moving'; // moving, attacking, dying
        this.stateTimer = 0;
        
        // 데미지 표시
        this.damageNumbers = [];
        this.hitFlash = 0;
        
        // 드롭 아이템
        this.dropChance = config.dropChance || 0.1;
        this.dropItems = config.dropItems || ['points'];
        
        // 초기화
        this.initMovementPattern();
        this.initAbilities();
    }
    
    // 타입별 설정 가져오기
    static getTypeConfig(type) {
        const configs = {
            basic: {
                width: 24,
                height: 24,
                health: 1,
                speed: 100,
                points: 10,
                damage: 1,
                color: '#ff4444',
                movementPattern: 'straight'
            },
            fast: {
                width: 20,
                height: 20,
                health: 1,
                speed: 200,
                points: 20,
                damage: 1,
                color: '#ff8844',
                movementPattern: 'zigzag'
            },
            heavy: {
                width: 32,
                height: 32,
                health: 3,
                speed: 50,
                points: 50,
                damage: 2,
                color: '#884444',
                secondaryColor: '#ff4444',
                canShoot: true,
                fireRate: 0.5,
                movementPattern: 'straight'
            },
            shooter: {
                width: 28,
                height: 28,
                health: 2,
                speed: 80,
                points: 30,
                damage: 1,
                color: '#8844ff',
                canShoot: true,
                fireRate: 1,
                bulletSpeed: 250,
                movementPattern: 'sine'
            },
            boss: {
                width: 64,
                height: 64,
                health: 20,
                speed: 30,
                points: 500,
                damage: 3,
                color: '#ff0000',
                secondaryColor: '#ffff00',
                canShoot: true,
                fireRate: 2,
                bulletSpeed: 300,
                movementPattern: 'boss',
                abilities: ['multishot', 'shield'],
                animationSpeed: 2,
                maxFrames: 4,
                dropChance: 1.0,
                dropItems: ['powerup', 'health', 'points']
            }
        };
        
        return configs[type] || configs.basic;
    }
    
    initMovementPattern() {
        switch (this.movementPattern) {
            case 'sine':
                this.movementData.amplitude = 100;
                this.movementData.frequency = 2;
                this.movementData.startX = this.x;
                break;
                
            case 'zigzag':
                this.movementData.direction = 1;
                this.movementData.changeInterval = 500;
                break;
                
            case 'circle':
                this.movementData.centerX = this.x;
                this.movementData.centerY = this.y;
                this.movementData.radius = 50;
                this.movementData.angle = 0;
                break;
                
            case 'boss':
                this.movementData.phase = 'enter';
                this.movementData.targetY = 100;
                break;
        }
    }
    
    initAbilities() {
        this.abilities.forEach(ability => {
            this.abilityTimers[ability] = 0;
        });
    }
    
    onUpdate(deltaTime) {
        // 이미 파괴되었거나 비활성화된 경우 업데이트 중단
        if (!this.active || this.shouldDestroy) {
            return;
        }
        
        // 상태 업데이트
        this.updateState(deltaTime);
        
        // 죽는 상태가 아닐 때만 일반 업데이트 수행
        if (this.state !== 'dying') {
            // 이동 패턴 업데이트
            this.updateMovement(deltaTime);
            
            // 발사 처리
            if (this.canShoot && this.state === 'moving') {
                this.updateShooting(deltaTime);
            }
            
            // 특수 능력 업데이트
            this.updateAbilities(deltaTime);
            
            // 애니메이션 업데이트
            this.updateAnimation(deltaTime);
            
            // 화면 밖으로 나가면 제거
            if (this.y > (window.game?.canvas?.height || 600) + 50) {
                this.destroy();
            }
        }
        
        // 데미지 표시 업데이트 (항상 수행)
        this.updateDamageNumbers(deltaTime);
        
        // 히트 플래시 업데이트 (항상 수행)
        if (this.hitFlash > 0) {
            this.hitFlash -= deltaTime;
        }
    }
    
    updateState(deltaTime) {
        this.stateTimer += deltaTime;
        
        switch (this.state) {
            case 'moving':
                // 기본 이동 상태
                break;
                
            case 'attacking':
                // 공격 상태 (보스 등)
                if (this.stateTimer >= 2000) { // 2초 후 이동 상태로
                    this.state = 'moving';
                    this.stateTimer = 0;
                }
                break;
                
            case 'dying':
                // 죽는 애니메이션
                if (this.stateTimer >= 500) { // 0.5초 후 제거
                    this.destroy();
                }
                break;
        }
    }
    
    updateMovement(deltaTime) {
        if (this.state === 'dying') return;
        
        this.movementTimer += deltaTime;
        const deltaSeconds = deltaTime / 1000;
        
        switch (this.movementPattern) {
            case 'straight':
                this.y += this.speed * deltaSeconds;
                break;
                
            case 'sine':
                this.y += this.speed * deltaSeconds;
                this.x = this.movementData.startX + 
                        Math.sin(this.movementTimer / 1000 * this.movementData.frequency) * 
                        this.movementData.amplitude;
                break;
                
            case 'zigzag':
                this.y += this.speed * deltaSeconds;
                this.x += this.movementData.direction * this.speed * 0.5 * deltaSeconds;
                
                if (this.movementTimer >= this.movementData.changeInterval) {
                    this.movementData.direction *= -1;
                    this.movementTimer = 0;
                }
                break;
                
            case 'circle':
                this.movementData.angle += deltaSeconds * 2;
                this.x = this.movementData.centerX + 
                        Math.cos(this.movementData.angle) * this.movementData.radius;
                this.y = this.movementData.centerY + 
                        Math.sin(this.movementData.angle) * this.movementData.radius;
                this.movementData.centerY += this.speed * 0.3 * deltaSeconds;
                break;
                
            case 'boss':
                this.updateBossMovement(deltaSeconds);
                break;
        }
        
        // 화면 경계 체크 (좌우)
        if (window.game && window.game.canvas) {
            const canvas = window.game.canvas;
            if (this.x < 0 || this.x + this.width > canvas.width) {
                if (this.movementPattern === 'zigzag') {
                    this.movementData.direction *= -1;
                }
                this.x = MathUtils.clamp(this.x, 0, canvas.width - this.width);
            }
        }
    }
    
    updateBossMovement(deltaSeconds) {
        switch (this.movementData.phase) {
            case 'enter':
                this.y += this.speed * deltaSeconds;
                if (this.y >= this.movementData.targetY) {
                    this.movementData.phase = 'patrol';
                    this.movementData.direction = 1;
                }
                break;
                
            case 'patrol':
                this.x += this.movementData.direction * this.speed * 0.5 * deltaSeconds;
                
                if (window.game && window.game.canvas) {
                    const canvas = window.game.canvas;
                    if (this.x <= 0 || this.x + this.width >= canvas.width) {
                        this.movementData.direction *= -1;
                        this.x = MathUtils.clamp(this.x, 0, canvas.width - this.width);
                    }
                }
                break;
        }
    }
    
    updateShooting(deltaTime) {
        const currentTime = Date.now();
        const fireInterval = 1000 / this.fireRate;
        
        if (currentTime - this.lastFireTime < fireInterval) {
            return;
        }
        
        // 플레이어가 사정거리 내에 있는지 확인
        if (!this.isPlayerInRange()) {
            return;
        }
        
        this.lastFireTime = currentTime;
        this.shoot();
    }
    
    isPlayerInRange() {
        if (!window.game || !window.game.entities.player) {
            return false;
        }
        
        const player = window.game.entities.player;
        const distance = this.distanceTo(player);
        return distance <= this.shootRange;
    }
    
    shoot() {
        if (!window.game || !window.game.entities.player) return;
        
        const player = window.game.entities.player;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height;
        
        if (this.abilities.includes('multishot')) {
            this.shootMultiple(centerX, centerY, player);
        } else {
            this.shootSingle(centerX, centerY, player);
        }
    }
    
    shootSingle(x, y, target) {
        if (typeof Bullet === 'undefined') return;
        
        const targetCenter = target.getCenter();
        const bullet = Bullet.createEnemyBullet(x, y, targetCenter.x, targetCenter.y);
        
        if (window.game && window.game.entities) {
            window.game.entities.bullets.push(bullet);
        }
    }
    
    shootMultiple(x, y, target) {
        if (typeof Bullet === 'undefined') return;
        
        const targetCenter = target.getCenter();
        const angles = [-0.3, 0, 0.3]; // 3방향 발사
        
        angles.forEach(angleOffset => {
            const direction = new Vector2D(
                targetCenter.x - x,
                targetCenter.y - y
            ).normalize();
            
            direction.rotate(angleOffset);
            
            const bullet = new Bullet(x - 2, y, 'enemy');
            bullet.velocity = Vector2D.multiply(direction, this.bulletSpeed);
            
            if (window.game && window.game.entities) {
                window.game.entities.bullets.push(bullet);
            }
        });
    }
    
    updateAbilities(deltaTime) {
        this.abilities.forEach(ability => {
            this.abilityTimers[ability] += deltaTime;
            
            switch (ability) {
                case 'shield':
                    if (this.abilityTimers[ability] >= 5000) { // 5초마다
                        this.activateShield();
                        this.abilityTimers[ability] = 0;
                    }
                    break;
                    
                case 'teleport':
                    if (this.abilityTimers[ability] >= 3000) { // 3초마다
                        this.teleport();
                        this.abilityTimers[ability] = 0;
                    }
                    break;
            }
        });
    }
    
    activateShield() {
        // 임시 무적 상태
        this.invulnerable = true;
        setTimeout(() => {
            this.invulnerable = false;
        }, 2000); // 2초간 무적
    }
    
    teleport() {
        if (!window.game || !window.game.canvas) return;
        
        const canvas = window.game.canvas;
        this.x = MathUtils.randomFloat(0, canvas.width - this.width);
        this.y = MathUtils.randomFloat(50, 200);
        
        // 텔레포트 효과
        this.createTeleportEffect();
    }
    
    createTeleportEffect() {
        if (!window.game || !window.game.entities || typeof Particle === 'undefined') return;
        
        for (let i = 0; i < 10; i++) {
            const particle = new Particle(
                this.x + this.width / 2,
                this.y + this.height / 2
            );
            
            const angle = (Math.PI * 2 * i) / 10;
            const speed = MathUtils.randomFloat(100, 200);
            
            particle.velocity.set(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            particle.color = '#8844ff';
            particle.setMaxAge(500);
            
            window.game.entities.particles.push(particle);
        }
    }
    
    updateAnimation(deltaTime) {
        if (this.maxFrames <= 1) return;
        
        this.animationTimer += deltaTime * this.animationSpeed;
        
        if (this.animationTimer >= 200) { // 0.2초마다 프레임 변경
            this.frame = (this.frame + 1) % this.maxFrames;
            this.animationTimer = 0;
        }
    }
    
    updateDamageNumbers(deltaTime) {
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const dmg = this.damageNumbers[i];
            dmg.y -= 50 * (deltaTime / 1000);
            dmg.alpha -= deltaTime / 1000;
            
            if (dmg.alpha <= 0) {
                this.damageNumbers.splice(i, 1);
            }
        }
    }
    
    takeDamage(damage) {
        if (this.invulnerable || this.state === 'dying' || !this.active) {
            return false;
        }
        
        this.health -= damage;
        this.hitFlash = 200; // 0.2초간 플래시
        
        // 데미지 숫자 표시
        this.showDamageNumber(damage);
        
        if (this.health <= 0) {
            this.die();
            return true;
        }
        
        return false;
    }
    
    showDamageNumber(damage) {
        this.damageNumbers.push({
            damage: damage,
            x: this.x + this.width / 2,
            y: this.y,
            alpha: 1
        });
    }
    
    die() {
        if (this.state === 'dying' || !this.active) return; // 이미 죽는 중이거나 비활성화된 경우 무시
        
        // 점수 추가
        if (window.game) {
            window.game.addScore(this.points);
        }
        
        // 아이템 드롭
        this.dropItems();
        
        // 죽음 효과
        this.createDeathEffect();
        
        // 즉시 파괴
        this.destroy();
    }
    
    dropItems() {
        if (Math.random() > this.dropChance) return;
        
        try {
            // 파워업 생성
            const powerup = PowerUp.createRandom(
                this.x + this.width / 2 - 8,
                this.y + this.height / 2 - 8
            );
            
            if (window.game && window.game.entities && powerup) {
                window.game.entities.powerups.push(powerup);
                console.log(`${powerup.name} 드롭!`);
            }
        } catch (error) {
            console.error('Drop item error:', error);
        }
    }
    
    createDeathEffect() {
        if (!window.game || !window.game.collisionManager) return;
        
        window.game.collisionManager.createExplosion(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.type === 'boss' ? 'large' : 'normal'
        );
    }
    
    onRender(ctx) {
        if (this.state === 'dying') {
            this.renderDying(ctx);
            return;
        }
        
        // 히트 플래시 효과
        if (this.hitFlash > 0) {
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.restore();
        }
        
        // 쉴드 효과
        if (this.invulnerable) {
            this.renderShield(ctx);
        }
        
        // 적 본체 렌더링
        this.renderBody(ctx);
        
        // 데미지 숫자 렌더링
        this.renderDamageNumbers(ctx);
        
        // 체력바 렌더링 (보스 등)
        if (this.type === 'boss' || this.maxHealth > 1) {
            this.renderHealthBar(ctx);
        }
    }
    
    renderBody(ctx) {
        switch (this.type) {
            case 'basic':
                this.renderBasicEnemy(ctx);
                break;
            case 'fast':
                this.renderFastEnemy(ctx);
                break;
            case 'heavy':
                this.renderHeavyEnemy(ctx);
                break;
            case 'shooter':
                this.renderShooterEnemy(ctx);
                break;
            case 'boss':
                this.renderBossEnemy(ctx);
                break;
            default:
                this.renderBasicEnemy(ctx);
        }
    }
    
    renderBasicEnemy(ctx) {
        // 기본 적 (풍뎅이 모양)
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // 몸체 (타원형)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, this.width / 2, this.height / 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 머리 부분
        ctx.fillStyle = '#aa2222';
        ctx.beginPath();
        ctx.ellipse(centerX, this.height * 0.2, this.width / 3, this.height / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 더듬이
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 4, this.height * 0.1);
        ctx.lineTo(centerX - 8, 0);
        ctx.moveTo(centerX + 4, this.height * 0.1);
        ctx.lineTo(centerX + 8, 0);
        ctx.stroke();
        
        // 몸체 줄무늬
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.5;
        for (let i = 1; i <= 2; i++) {
            const y = this.height * (0.3 + i * 0.2);
            ctx.beginPath();
            ctx.arc(centerX, y, this.width / 3, 0, Math.PI);
            ctx.stroke();
        }
    }
    
    renderFastEnemy(ctx) {
        // 빠른 적 (날렵한 우주선)
        const centerX = this.width / 2;
        
        // 메인 바디 (삼각형 기반)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(centerX, 0); // 앞쪽 끝
        ctx.lineTo(centerX - this.width / 3, this.height * 0.6);
        ctx.lineTo(centerX - this.width / 6, this.height * 0.8);
        ctx.lineTo(centerX, this.height);
        ctx.lineTo(centerX + this.width / 6, this.height * 0.8);
        ctx.lineTo(centerX + this.width / 3, this.height * 0.6);
        ctx.closePath();
        ctx.fill();
        
        // 날개
        ctx.fillStyle = '#ff6644';
        ctx.beginPath();
        ctx.moveTo(centerX - this.width / 3, this.height * 0.6);
        ctx.lineTo(centerX - this.width / 2, this.height * 0.4);
        ctx.lineTo(centerX - this.width / 4, this.height * 0.7);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(centerX + this.width / 3, this.height * 0.6);
        ctx.lineTo(centerX + this.width / 2, this.height * 0.4);
        ctx.lineTo(centerX + this.width / 4, this.height * 0.7);
        ctx.closePath();
        ctx.fill();
        
        // 엔진 글로우
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(centerX - 2, this.height - 4, 4, 4);
    }
    
    renderHeavyEnemy(ctx) {
        // 중장갑 적 (거대한 전투함)
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // 메인 선체
        ctx.fillStyle = this.color;
        ctx.fillRect(this.width * 0.2, 0, this.width * 0.6, this.height);
        
        // 브릿지
        ctx.fillStyle = this.secondaryColor;
        ctx.fillRect(this.width * 0.3, this.height * 0.1, this.width * 0.4, this.height * 0.3);
        
        // 포탑들
        ctx.fillStyle = '#666666';
        ctx.fillRect(this.width * 0.1, this.height * 0.3, this.width * 0.15, this.height * 0.2);
        ctx.fillRect(this.width * 0.75, this.height * 0.3, this.width * 0.15, this.height * 0.2);
        
        // 엔진
        ctx.fillStyle = '#0088ff';
        ctx.fillRect(this.width * 0.25, this.height * 0.85, this.width * 0.1, this.height * 0.15);
        ctx.fillRect(this.width * 0.65, this.height * 0.85, this.width * 0.1, this.height * 0.15);
        
        // 장갑 디테일
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.width * 0.2, 0, this.width * 0.6, this.height);
        
        // 창문
        ctx.fillStyle = '#88ffff';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(centerX - 2 + i * 2, this.height * 0.15, 1, 3);
        }
    }
    
    renderShooterEnemy(ctx) {
        // 사격 적 (원반형 UFO)
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // 하부 원반
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + this.height * 0.1, this.width / 2, this.height / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 상부 돔
        ctx.fillStyle = '#aa44ff';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - this.height * 0.1, this.width / 3, this.height / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 조명 효과
        const time = this.animationTimer / 200;
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6 + time;
            const x = centerX + Math.cos(angle) * this.width * 0.3;
            const y = centerY + Math.sin(angle) * this.height * 0.2;
            
            ctx.fillStyle = `rgba(255, 255, 0, ${0.5 + Math.sin(time * 3 + i) * 0.3})`;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 중앙 코어
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY - this.height * 0.1, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderBossEnemy(ctx) {
        // 보스 (거대한 모함)
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const time = this.animationTimer / 100;
        
        // 메인 선체 (육각형)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const x = centerX + Math.cos(angle) * this.width * 0.4;
            const y = centerY + Math.sin(angle) * this.height * 0.4;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        // 중앙 코어
        ctx.fillStyle = this.secondaryColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // 회전하는 링
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width * 0.3, 0, Math.PI * 2);
        ctx.stroke();
        
        // 에너지 코어 (펄스 효과)
        const pulseSize = 3 + Math.sin(time * 4) * 2;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + Math.sin(time * 6) * 0.2})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // 무기 포트들
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI * 2) / 4 + time * 0.5;
            const x = centerX + Math.cos(angle) * this.width * 0.35;
            const y = centerY + Math.sin(angle) * this.height * 0.35;
            
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(x - 2, y - 2, 4, 4);
        }
        
        // 쉴드 효과 (보스가 무적일 때)
        if (this.invulnerable) {
            ctx.strokeStyle = `rgba(0, 255, 0, ${0.5 + Math.sin(time * 8) * 0.3})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width * 0.45, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 테두리
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const x = centerX + Math.cos(angle) * this.width * 0.4;
            const y = centerY + Math.sin(angle) * this.height * 0.4;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    renderDying(ctx) {
        // 죽는 애니메이션
        const alpha = 1 - (this.stateTimer / 500);
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // 확대 효과
        const scale = 1 + (this.stateTimer / 500) * 0.5;
        ctx.translate(this.width / 2, this.height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-this.width / 2, -this.height / 2);
        
        this.renderBody(ctx);
        ctx.restore();
    }
    
    renderShield(ctx) {
        const time = Date.now() / 1000;
        const radius = Math.max(this.width, this.height) / 2 + 5;
        
        ctx.save();
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.7 + Math.sin(time * 8) * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    
    renderDamageNumbers(ctx) {
        this.damageNumbers.forEach(dmg => {
            ctx.save();
            ctx.globalAlpha = dmg.alpha;
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                `-${dmg.damage}`,
                dmg.x - this.x,
                dmg.y - this.y
            );
            ctx.restore();
        });
    }
    
    renderHealthBar(ctx) {
        if (this.maxHealth <= 1) return;
        
        const barWidth = this.width;
        const barHeight = 4;
        const barY = -8;
        
        // 배경
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, barY, barWidth, barHeight);
        
        // 체력
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : 
                       healthPercent > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(0, barY, barWidth * healthPercent, barHeight);
        
        // 테두리
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, barY, barWidth, barHeight);
    }
    
    onCollision(other) {
        // 충돌 처리는 CollisionManager에서 담당
    }
    
    onDestroy() {
        super.onDestroy();
    }
    
    // 정적 팩토리 메서드들
    static createBasic(x, y) {
        return new Enemy(x, y, 'basic');
    }
    
    static createFast(x, y) {
        return new Enemy(x, y, 'fast');
    }
    
    static createHeavy(x, y) {
        return new Enemy(x, y, 'heavy');
    }
    
    static createShooter(x, y) {
        return new Enemy(x, y, 'shooter');
    }
    
    static createBoss(x, y) {
        return new Enemy(x, y, 'boss');
    }
    
    // 랜덤 적 생성
    static createRandom(x, y, level = 1) {
        const types = ['basic', 'fast'];
        
        if (level >= 2) types.push('heavy');
        if (level >= 3) types.push('shooter');
        if (level >= 5 && Math.random() < 0.1) types.push('boss');
        
        // ArrayUtils 대신 직접 랜덤 선택 구현
        const type = types[Math.floor(Math.random() * types.length)];
        return new Enemy(x, y, type);
    }
    
    // 디버그 정보
    getDebugInfo() {
        return {
            type: this.type,
            health: `${this.health}/${this.maxHealth}`,
            state: this.state,
            position: `(${Math.round(this.x)}, ${Math.round(this.y)})`,
            movementPattern: this.movementPattern,
            canShoot: this.canShoot,
            abilities: this.abilities
        };
    }
}