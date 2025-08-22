// 파워업 아이템 클래스
class PowerUp extends Entity {
    constructor(x, y, type = 'weapon') {
        super(x, y, 16, 16);
        
        // 파워업 속성
        this.type = type;
        this.speed = 80; // 아래로 떨어지는 속도
        this.rotationSpeed = 3; // 회전 속도
        this.rotation = 0;
        
        // 시각적 속성
        this.pulseTimer = 0;
        this.pulseSpeed = 4;
        this.baseScale = 1;
        this.currentScale = 1;
        
        // 충돌 설정
        this.collisionGroup = 'powerup';
        this.collisionEnabled = true;
        
        // 생명주기 (화면에 머무는 시간)
        this.maxAge = 10000; // 10초
        
        // 타입별 설정
        this.setupType();
        
        // 자동으로 아래로 이동
        this.velocity.set(0, this.speed);
    }
    
    setupType() {
        switch (this.type) {
            case 'weapon':
                this.color = '#ffff00';
                this.glowColor = '#ffff88';
                this.name = '무기 업그레이드';
                this.description = '무기 레벨 +1';
                break;
                
            case 'health':
                this.color = '#ff4444';
                this.glowColor = '#ff8888';
                this.name = '체력 회복';
                this.description = '체력 +1';
                break;
                
            case 'shield':
                this.color = '#44ff44';
                this.glowColor = '#88ff88';
                this.name = '보호막';
                this.description = '일시적 무적';
                break;
                
            case 'rapidfire':
                this.color = '#ff8844';
                this.glowColor = '#ffaa88';
                this.name = '연사 강화';
                this.description = '발사 속도 증가';
                break;
                
            case 'multishot':
                this.color = '#8844ff';
                this.glowColor = '#aa88ff';
                this.name = '다중 발사';
                this.description = '총알 개수 증가';
                break;
                
            default:
                this.color = '#ffffff';
                this.glowColor = '#cccccc';
                this.name = '알 수 없는 아이템';
                this.description = '';
        }
    }
    
    onUpdate(deltaTime) {
        // 회전 효과
        this.rotation += this.rotationSpeed * (deltaTime / 1000);
        
        // 펄스 효과
        this.pulseTimer += deltaTime;
        this.currentScale = this.baseScale + Math.sin(this.pulseTimer / 1000 * this.pulseSpeed) * 0.2;
        
        // 위치 업데이트
        this.x += this.velocity.x * (deltaTime / 1000);
        this.y += this.velocity.y * (deltaTime / 1000);
        
        // 화면 밖으로 나가면 제거
        if (this.y > (window.game?.canvas?.height || 600) + 50) {
            this.destroy();
        }
    }
    
    onRender(ctx) {
        ctx.save();
        
        // 중심점으로 이동
        ctx.translate(this.width / 2, this.height / 2);
        
        // 회전 적용
        ctx.rotate(this.rotation);
        
        // 스케일 적용
        ctx.scale(this.currentScale, this.currentScale);
        
        // 글로우 효과
        this.renderGlow(ctx);
        
        // 아이템 본체
        this.renderBody(ctx);
        
        ctx.restore();
    }
    
    renderGlow(ctx) {
        const glowSize = Math.max(this.width, this.height) * 1.5;
        
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = this.glowColor;
        ctx.fillRect(-glowSize / 2, -glowSize / 2, glowSize, glowSize);
        ctx.restore();
    }
    
    renderBody(ctx) {
        switch (this.type) {
            case 'weapon':
                this.renderWeaponPowerUp(ctx);
                break;
            case 'health':
                this.renderHealthPowerUp(ctx);
                break;
            case 'shield':
                this.renderShieldPowerUp(ctx);
                break;
            case 'rapidfire':
                this.renderRapidFirePowerUp(ctx);
                break;
            case 'multishot':
                this.renderMultiShotPowerUp(ctx);
                break;
            default:
                this.renderDefaultPowerUp(ctx);
        }
    }
    
    renderWeaponPowerUp(ctx) {
        // 무기 업그레이드 (화살표 위쪽)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2); // 위쪽 끝
        ctx.lineTo(-this.width / 3, -this.height / 6);
        ctx.lineTo(-this.width / 6, -this.height / 6);
        ctx.lineTo(-this.width / 6, this.height / 2);
        ctx.lineTo(this.width / 6, this.height / 2);
        ctx.lineTo(this.width / 6, -this.height / 6);
        ctx.lineTo(this.width / 3, -this.height / 6);
        ctx.closePath();
        ctx.fill();
        
        // 테두리
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 'W' 표시
        ctx.fillStyle = '#000000';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('W', 0, 2);
    }
    
    renderHealthPowerUp(ctx) {
        // 체력 회복 (십자가)
        ctx.fillStyle = this.color;
        
        // 세로 막대
        ctx.fillRect(-this.width / 6, -this.height / 2, this.width / 3, this.height);
        
        // 가로 막대
        ctx.fillRect(-this.width / 2, -this.height / 6, this.width, this.height / 3);
        
        // 테두리
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-this.width / 6, -this.height / 2, this.width / 3, this.height);
        ctx.strokeRect(-this.width / 2, -this.height / 6, this.width, this.height / 3);
        
        // 'H' 표시
        ctx.fillStyle = '#ffffff';
        ctx.font = '6px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('H', 0, 1);
    }
    
    renderShieldPowerUp(ctx) {
        // 보호막 (방패 모양)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(-this.width / 2, -this.height / 4);
        ctx.lineTo(-this.width / 2, this.height / 4);
        ctx.lineTo(0, this.height / 2);
        ctx.lineTo(this.width / 2, this.height / 4);
        ctx.lineTo(this.width / 2, -this.height / 4);
        ctx.closePath();
        ctx.fill();
        
        // 테두리
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 'S' 표시
        ctx.fillStyle = '#000000';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('S', 0, 2);
    }
    
    renderRapidFirePowerUp(ctx) {
        // 연사 강화 (번개 모양)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(-this.width / 4, -this.height / 2);
        ctx.lineTo(this.width / 4, -this.height / 4);
        ctx.lineTo(0, -this.height / 4);
        ctx.lineTo(this.width / 4, this.height / 2);
        ctx.lineTo(-this.width / 4, this.height / 4);
        ctx.lineTo(0, this.height / 4);
        ctx.closePath();
        ctx.fill();
        
        // 테두리
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 'R' 표시
        ctx.fillStyle = '#000000';
        ctx.font = '6px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('R', 0, 1);
    }
    
    renderMultiShotPowerUp(ctx) {
        // 다중 발사 (별 모양)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        const spikes = 5;
        const outerRadius = this.width / 2;
        const innerRadius = outerRadius * 0.4;
        
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
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
        
        // 테두리
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 'M' 표시
        ctx.fillStyle = '#ffffff';
        ctx.font = '6px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('M', 0, 1);
    }
    
    renderDefaultPowerUp(ctx) {
        // 기본 아이템 (원형)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 테두리
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // '?' 표시
        ctx.fillStyle = '#000000';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('?', 0, 2);
    }
    
    onCollision(other) {
        // 플레이어와 충돌 시 효과 적용
        if (other.collisionGroup === 'player') {
            this.applyEffect(other);
            this.destroy();
        }
    }
    
    applyEffect(player) {
        switch (this.type) {
            case 'weapon':
                this.upgradeWeapon(player);
                break;
            case 'health':
                player.heal(1);
                break;
            case 'shield':
                player.applyPowerup('shield', 5000);
                break;
            case 'rapidfire':
                player.applyPowerup('rapidFire', 8000);
                break;
            case 'multishot':
                player.applyPowerup('tripleShot', 10000);
                break;
        }
        
        // UI 알림
        if (window.game && window.game.uiManager) {
            window.game.uiManager.showPowerUpNotification(this.name);
        }
        
        console.log(`${this.name} 획득!`);
    }
    
    upgradeWeapon(player) {
        if (player.weaponLevel < player.maxWeaponLevel) {
            player.weaponLevel++;
            console.log(`무기 레벨 업그레이드! 현재 레벨: ${player.weaponLevel}`);
            
            // 특별한 레벨에서 추가 효과
            if (player.weaponLevel === 5) {
                console.log('레벨 5 달성! 후방 발사 해제!');
            } else if (player.weaponLevel === 10) {
                console.log('최대 레벨 달성! 관통 총알 해제!');
            }
        } else {
            // 최대 레벨일 때는 점수 보너스
            if (window.game) {
                window.game.addScore(100);
                console.log('최대 레벨! 점수 보너스 +100');
            }
        }
    }
    
    // 정적 팩토리 메서드들
    static createWeaponUpgrade(x, y) {
        return new PowerUp(x, y, 'weapon');
    }
    
    static createHealthPack(x, y) {
        return new PowerUp(x, y, 'health');
    }
    
    static createShield(x, y) {
        return new PowerUp(x, y, 'shield');
    }
    
    static createRapidFire(x, y) {
        return new PowerUp(x, y, 'rapidfire');
    }
    
    static createMultiShot(x, y) {
        return new PowerUp(x, y, 'multishot');
    }
    
    static createRandom(x, y) {
        const types = ['weapon', 'health', 'shield', 'rapidfire', 'multishot'];
        const weights = [40, 20, 15, 15, 10]; // 무기 업그레이드가 가장 높은 확률
        
        let totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < types.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return new PowerUp(x, y, types[i]);
            }
        }
        
        return new PowerUp(x, y, 'weapon'); // 기본값
    }
    
    // 디버그 정보
    getDebugInfo() {
        return {
            type: this.type,
            name: this.name,
            position: `(${Math.round(this.x)}, ${Math.round(this.y)})`,
            age: `${Math.round(this.age)}/${this.maxAge}`,
            scale: this.currentScale.toFixed(2)
        };
    }
}