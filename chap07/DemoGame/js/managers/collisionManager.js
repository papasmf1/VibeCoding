// 충돌 감지 관리 클래스
class CollisionManager {
    constructor() {
        // 충돌 그룹 정의
        this.collisionGroups = {
            PLAYER: 'player',
            ENEMY: 'enemy',
            PLAYER_BULLET: 'player_bullet',
            ENEMY_BULLET: 'enemy_bullet',
            POWERUP: 'powerup',
            OBSTACLE: 'obstacle'
        };
        
        // 충돌 규칙 정의 (어떤 그룹끼리 충돌하는지)
        this.collisionRules = new Map();
        this.setupCollisionRules();
        
        // 충돌 콜백 함수들
        this.collisionCallbacks = new Map();
        this.setupCollisionCallbacks();
        
        // 성능 최적화를 위한 공간 분할
        this.spatialGrid = null;
        this.gridSize = 64; // 그리드 셀 크기
        this.useSpacialPartitioning = false; // 엔티티가 많을 때만 활성화
    }
    
    setupCollisionRules() {
        // 플레이어와 충돌하는 것들
        this.addCollisionRule(this.collisionGroups.PLAYER, this.collisionGroups.ENEMY);
        this.addCollisionRule(this.collisionGroups.PLAYER, this.collisionGroups.ENEMY_BULLET);
        this.addCollisionRule(this.collisionGroups.PLAYER, this.collisionGroups.POWERUP);
        this.addCollisionRule(this.collisionGroups.PLAYER, this.collisionGroups.OBSTACLE);
        
        // 플레이어 총알과 충돌하는 것들
        this.addCollisionRule(this.collisionGroups.PLAYER_BULLET, this.collisionGroups.ENEMY);
        this.addCollisionRule(this.collisionGroups.PLAYER_BULLET, this.collisionGroups.OBSTACLE);
        
        // 적 총알과 충돌하는 것들
        this.addCollisionRule(this.collisionGroups.ENEMY_BULLET, this.collisionGroups.PLAYER);
        this.addCollisionRule(this.collisionGroups.ENEMY_BULLET, this.collisionGroups.OBSTACLE);
        
        // 적과 충돌하는 것들
        this.addCollisionRule(this.collisionGroups.ENEMY, this.collisionGroups.PLAYER);
        this.addCollisionRule(this.collisionGroups.ENEMY, this.collisionGroups.PLAYER_BULLET);
    }
    
    addCollisionRule(group1, group2) {
        const key1 = `${group1}_${group2}`;
        const key2 = `${group2}_${group1}`;
        this.collisionRules.set(key1, true);
        this.collisionRules.set(key2, true);
    }
    
    setupCollisionCallbacks() {
        // 플레이어-적 충돌
        this.addCollisionCallback(
            this.collisionGroups.PLAYER,
            this.collisionGroups.ENEMY,
            (player, enemy) => this.handlePlayerEnemyCollision(player, enemy)
        );
        
        // 플레이어-적 총알 충돌
        this.addCollisionCallback(
            this.collisionGroups.PLAYER,
            this.collisionGroups.ENEMY_BULLET,
            (player, bullet) => this.handlePlayerBulletCollision(player, bullet)
        );
        
        // 플레이어 총알-적 충돌
        this.addCollisionCallback(
            this.collisionGroups.PLAYER_BULLET,
            this.collisionGroups.ENEMY,
            (bullet, enemy) => this.handleBulletEnemyCollision(bullet, enemy)
        );
        
        // 플레이어-파워업 충돌
        this.addCollisionCallback(
            this.collisionGroups.PLAYER,
            this.collisionGroups.POWERUP,
            (player, powerup) => this.handlePlayerPowerupCollision(player, powerup)
        );
    }
    
    addCollisionCallback(group1, group2, callback) {
        const key1 = `${group1}_${group2}`;
        const key2 = `${group2}_${group1}`;
        this.collisionCallbacks.set(key1, callback);
        this.collisionCallbacks.set(key2, (entity2, entity1) => callback(entity1, entity2));
    }
    
    // 메인 충돌 감지 함수
    checkCollisions(entities) {
        const allEntities = this.flattenEntities(entities);
        
        // 엔티티가 많으면 공간 분할 사용
        if (allEntities.length > 50 && !this.useSpacialPartitioning) {
            this.useSpacialPartitioning = true;
            this.initSpatialGrid(entities);
        } else if (allEntities.length <= 50) {
            this.useSpacialPartitioning = false;
        }
        
        if (this.useSpacialPartitioning) {
            this.checkCollisionsWithSpatialGrid(entities);
        } else {
            this.checkCollisionsBruteForce(allEntities);
        }
    }
    
    // 모든 엔티티를 하나의 배열로 평면화
    flattenEntities(entities) {
        const allEntities = [];
        
        // 플레이어 추가
        if (entities.player && entities.player.active) {
            allEntities.push(entities.player);
        }
        
        // 다른 엔티티들 추가
        ['enemies', 'bullets', 'particles', 'powerups'].forEach(type => {
            if (entities[type]) {
                entities[type].forEach(entity => {
                    if (entity.active && entity.collisionEnabled) {
                        allEntities.push(entity);
                    }
                });
            }
        });
        
        return allEntities;
    }
    
    // 무차별 대입 충돌 감지 (엔티티가 적을 때)
    checkCollisionsBruteForce(entities) {
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entity1 = entities[i];
                const entity2 = entities[j];
                
                if (this.shouldCheckCollision(entity1, entity2)) {
                    if (this.checkAABBCollision(entity1, entity2)) {
                        this.handleCollision(entity1, entity2);
                    }
                }
            }
        }
    }
    
    // 공간 분할을 이용한 충돌 감지 (엔티티가 많을 때)
    initSpatialGrid(entities) {
        // 간단한 공간 분할 그리드 초기화
        this.spatialGrid = new Map();
    }
    
    checkCollisionsWithSpatialGrid(entities) {
        // 공간 분할 구현 (복잡하므로 기본 구현만)
        this.checkCollisionsBruteForce(this.flattenEntities(entities));
    }
    
    // 두 엔티티가 충돌 검사를 해야 하는지 확인
    shouldCheckCollision(entity1, entity2) {
        if (!entity1.active || !entity2.active) return false;
        if (entity1.shouldDestroy || entity2.shouldDestroy) return false;
        if (!entity1.collisionEnabled || !entity2.collisionEnabled) return false;
        if (entity1 === entity2) return false;
        
        // 적이 죽는 상태인 경우 충돌 무시
        if (entity1.state === 'dying' || entity2.state === 'dying') return false;
        
        const key = `${entity1.collisionGroup}_${entity2.collisionGroup}`;
        return this.collisionRules.has(key);
    }
    
    // AABB 충돌 감지
    checkAABBCollision(entity1, entity2) {
        const bounds1 = entity1.getBounds();
        const bounds2 = entity2.getBounds();
        
        return !(bounds1.right < bounds2.left ||
                bounds1.left > bounds2.right ||
                bounds1.bottom < bounds2.top ||
                bounds1.top > bounds2.bottom);
    }
    
    // 원형 충돌 감지 (더 정확한 충돌 감지가 필요한 경우)
    checkCircleCollision(entity1, entity2) {
        const center1 = entity1.getCenter();
        const center2 = entity2.getCenter();
        const radius1 = Math.min(entity1.width, entity1.height) / 2;
        const radius2 = Math.min(entity2.width, entity2.height) / 2;
        
        const dx = center1.x - center2.x;
        const dy = center1.y - center2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (radius1 + radius2);
    }
    
    // 충돌 처리
    handleCollision(entity1, entity2) {
        const key = `${entity1.collisionGroup}_${entity2.collisionGroup}`;
        const callback = this.collisionCallbacks.get(key);
        
        if (callback) {
            callback(entity1, entity2);
        }
        
        // 엔티티의 onCollision 메서드 호출
        if (entity1.onCollision) {
            entity1.onCollision(entity2);
        }
        if (entity2.onCollision) {
            entity2.onCollision(entity1);
        }
    }
    
    // 구체적인 충돌 처리 함수들
    
    handlePlayerEnemyCollision(player, enemy) {
        console.log('플레이어-적 충돌!');
        
        // 플레이어 데미지 또는 게임 오버
        if (player.takeDamage) {
            player.takeDamage(1);
        } else {
            // 게임 오버 처리
            if (window.game) {
                window.game.gameOver();
            }
        }
        
        // 적 파괴
        enemy.destroy();
        
        // 폭발 효과 생성
        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
    }
    
    handlePlayerBulletCollision(player, bullet) {
        console.log('플레이어-적 총알 충돌!');
        
        // 플레이어 데미지
        if (player.takeDamage) {
            player.takeDamage(1);
        } else {
            if (window.game) {
                window.game.gameOver();
            }
        }
        
        // 총알 제거
        bullet.destroy();
        
        // 작은 폭발 효과
        this.createExplosion(bullet.x, bullet.y, 'small');
    }
    
    handleBulletEnemyCollision(bullet, enemy) {
        console.log('총알-적 충돌!');
        
        // 적이 이미 죽었거나 비활성화된 경우 무시
        if (!enemy.active || enemy.state === 'dying') {
            bullet.destroy();
            return;
        }
        
        // 적에게 데미지
        const damage = bullet.damage || 1;
        const enemyDied = enemy.takeDamage(damage);
        
        // 데미지 숫자 표시
        if (window.game && window.game.uiManager) {
            window.game.uiManager.showDamageNumber(
                enemy.x + enemy.width / 2,
                enemy.y,
                damage
            );
        }
        
        // 총알 제거
        bullet.destroy();
        
        // 폭발 효과 (적이 죽었을 때만 큰 폭발)
        if (enemyDied) {
            this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'normal');
        } else {
            this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'small');
        }
    }
    
    handlePlayerPowerupCollision(player, powerup) {
        console.log('플레이어-파워업 충돌!');
        
        // 파워업 효과 적용
        if (player.applyPowerup) {
            player.applyPowerup(powerup.type);
        }
        
        // UI 알림
        if (window.game && window.game.uiManager) {
            window.game.uiManager.showPowerUpNotification(powerup.name || '파워업');
        }
        
        // 파워업 제거
        powerup.destroy();
        
        // 수집 효과
        this.createCollectEffect(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
    }
    
    // 폭발 효과 생성
    createExplosion(x, y, size = 'normal') {
        if (!window.game || !window.game.entities) return;
        
        const particleCount = size === 'small' ? 5 : size === 'large' ? 15 : 10;
        const maxSpeed = size === 'small' ? 100 : size === 'large' ? 300 : 200;
        const colors = ['#ff4444', '#ff8844', '#ffff44', '#ffffff'];
        
        for (let i = 0; i < particleCount; i++) {
            if (typeof Particle !== 'undefined') {
                const angle = (Math.PI * 2 * i) / particleCount;
                const speed = MathUtils.randomFloat(50, maxSpeed);
                const particle = new Particle(x, y);
                
                particle.velocity.set(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
                // ArrayUtils 대신 직접 랜덤 선택 구현
                particle.color = colors[Math.floor(Math.random() * colors.length)];
                particle.setMaxAge(500); // 0.5초
                
                window.game.entities.particles.push(particle);
            }
        }
    }
    
    // 수집 효과 생성
    createCollectEffect(x, y) {
        if (!window.game || !window.game.entities) return;
        
        const particleCount = 8;
        const colors = ['#00ff00', '#00ffff', '#ffff00'];
        
        for (let i = 0; i < particleCount; i++) {
            if (typeof Particle !== 'undefined') {
                const angle = (Math.PI * 2 * i) / particleCount;
                const speed = MathUtils.randomFloat(80, 150);
                const particle = new Particle(x, y);
                
                particle.velocity.set(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
                // ArrayUtils 대신 직접 랜덤 선택 구현
                particle.color = colors[Math.floor(Math.random() * colors.length)];
                particle.setMaxAge(300); // 0.3초
                particle.width = 3;
                particle.height = 3;
                
                window.game.entities.particles.push(particle);
            }
        }
    }
    
    // 레이캐스팅 (선분과 엔티티의 교차 검사)
    raycast(startX, startY, endX, endY, entities, ignoreEntity = null) {
        const hits = [];
        
        entities.forEach(entity => {
            if (entity === ignoreEntity || !entity.active || !entity.collisionEnabled) {
                return;
            }
            
            const bounds = entity.getBounds();
            if (CollisionUtils.lineRect(startX, startY, endX, endY, bounds)) {
                const distance = MathUtils.distance(startX, startY, bounds.centerX, bounds.centerY);
                hits.push({ entity, distance });
            }
        });
        
        // 거리순으로 정렬
        hits.sort((a, b) => a.distance - b.distance);
        return hits;
    }
    
    // 특정 지점에서 가장 가까운 엔티티 찾기
    findNearestEntity(x, y, entities, maxDistance = Infinity, filterGroup = null) {
        let nearest = null;
        let nearestDistance = maxDistance;
        
        entities.forEach(entity => {
            if (!entity.active || !entity.collisionEnabled) return;
            if (filterGroup && entity.collisionGroup !== filterGroup) return;
            
            const distance = MathUtils.distance(x, y, entity.x + entity.width / 2, entity.y + entity.height / 2);
            if (distance < nearestDistance) {
                nearest = entity;
                nearestDistance = distance;
            }
        });
        
        return nearest;
    }
    
    // 특정 영역 내의 모든 엔티티 찾기
    findEntitiesInArea(x, y, width, height, entities, filterGroup = null) {
        const found = [];
        const area = { x, y, width, height };
        
        entities.forEach(entity => {
            if (!entity.active || !entity.collisionEnabled) return;
            if (filterGroup && entity.collisionGroup !== filterGroup) return;
            
            const bounds = entity.getBounds();
            if (CollisionUtils.checkAABB(area, bounds)) {
                found.push(entity);
            }
        });
        
        return found;
    }
    
    // 디버그용 충돌 박스 렌더링
    renderDebugCollisions(ctx, entities) {
        ctx.save();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;
        
        const allEntities = this.flattenEntities(entities);
        allEntities.forEach(entity => {
            if (entity.collisionEnabled) {
                entity.renderBounds(ctx, '#ff0000');
            }
        });
        
        ctx.restore();
    }
    
    // 성능 통계
    getPerformanceStats() {
        return {
            usingSpatialPartitioning: this.useSpacialPartitioning,
            collisionRulesCount: this.collisionRules.size,
            callbacksCount: this.collisionCallbacks.size
        };
    }
}