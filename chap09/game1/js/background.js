class Background {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.layers = [];
        this.groundObjects = [];
        
        this.initializeLayers();
        this.generateGroundObjects();
    }
    
    initializeLayers() {
        this.layers = [
            {
                name: 'stars',
                speed: 0.5,
                objects: this.generateStars(100),
                color: '#ffffff'
            },
            {
                name: 'clouds',
                speed: 1,
                objects: this.generateClouds(20),
                color: '#cccccc'
            },
            {
                name: 'terrain',
                speed: 2,
                objects: [],
                color: '#004400'
            }
        ];
    }
    
    generateStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.gameEngine.width,
                y: Math.random() * this.gameEngine.height,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.8 + 0.2,
                twinkle: Math.random() * Math.PI * 2
            });
        }
        return stars;
    }
    
    generateClouds(count) {
        const clouds = [];
        for (let i = 0; i < count; i++) {
            clouds.push({
                x: Math.random() * (this.gameEngine.width + 200) - 100,
                y: Math.random() * this.gameEngine.height * 0.7,
                width: Math.random() * 80 + 40,
                height: Math.random() * 30 + 20,
                alpha: Math.random() * 0.3 + 0.1
            });
        }
        return clouds;
    }
    
    generateGroundObjects() {
        this.groundObjects = [];
        
        const types = ['building', 'tower', 'facility', 'radar'];
        const colors = ['#003300', '#006600', '#004400', '#005500'];
        
        for (let i = 0; i < 50; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const obj = {
                x: Math.random() * this.gameEngine.width,
                y: this.gameEngine.height + Math.random() * 1000,
                type: type,
                color: colors[Math.floor(Math.random() * colors.length)],
                width: Math.random() * 60 + 20,
                height: Math.random() * 80 + 30,
                health: type === 'facility' ? 3 : 1,
                maxHealth: type === 'facility' ? 3 : 1,
                active: true,
                targetable: true,
                points: type === 'facility' ? 500 : 100
            };
            
            if (type === 'radar') {
                obj.radarAngle = 0;
                obj.radarSpeed = 2;
            }
            
            this.groundObjects.push(obj);
        }
    }
    
    update(deltaTime) {
        this.updateLayers(deltaTime);
        this.updateGroundObjects(deltaTime);
        this.spawnNewGroundObjects();
    }
    
    updateLayers(deltaTime) {
        this.layers.forEach(layer => {
            if (layer.name === 'stars') {
                layer.objects.forEach(star => {
                    star.y += layer.speed * this.gameEngine.scrollSpeed * deltaTime;
                    star.twinkle += deltaTime * 3;
                    
                    if (star.y > this.gameEngine.height + 5) {
                        star.y = -5;
                        star.x = Math.random() * this.gameEngine.width;
                    }
                });
            } else if (layer.name === 'clouds') {
                layer.objects.forEach(cloud => {
                    cloud.y += layer.speed * this.gameEngine.scrollSpeed * deltaTime;
                    
                    if (cloud.y > this.gameEngine.height + cloud.height) {
                        cloud.y = -cloud.height;
                        cloud.x = Math.random() * (this.gameEngine.width + 200) - 100;
                    }
                });
            }
        });
    }
    
    updateGroundObjects(deltaTime) {
        this.groundObjects.forEach(obj => {
            obj.y -= this.gameEngine.scrollSpeed * deltaTime;
            
            if (obj.type === 'radar' && obj.active) {
                obj.radarAngle += obj.radarSpeed * deltaTime;
            }
            
            if (obj.y < -obj.height - 50) {
                this.resetGroundObject(obj);
            }
        });
    }
    
    resetGroundObject(obj) {
        obj.y = this.gameEngine.height + Math.random() * 500;
        obj.x = Math.random() * this.gameEngine.width;
        obj.health = obj.maxHealth;
        obj.active = true;
        obj.targetable = true;
    }
    
    spawnNewGroundObjects() {
        const activeObjects = this.groundObjects.filter(obj => 
            obj.y > -100 && obj.y < this.gameEngine.height + 100
        );
        
        if (activeObjects.length < 10) {
            const inactiveObjects = this.groundObjects.filter(obj => 
                obj.y < -obj.height - 50 || obj.y > this.gameEngine.height + 500
            );
            
            if (inactiveObjects.length > 0) {
                const obj = inactiveObjects[0];
                this.resetGroundObject(obj);
            }
        }
    }
    
    getGroundTargets() {
        return this.groundObjects.filter(obj => 
            obj.active && 
            obj.targetable && 
            obj.y > -obj.height && 
            obj.y < this.gameEngine.height + obj.height
        );
    }
    
    destroyGroundObject(obj) {
        obj.active = false;
        obj.targetable = false;
        
        this.gameEngine.addScore(obj.points);
        
        this.gameEngine.particleManager.createExplosion(
            obj.x + obj.width / 2,
            obj.y + obj.height / 2,
            'large'
        );
    }
    
    render(ctx) {
        this.renderGradientBackground(ctx);
        this.renderLayers(ctx);
        this.renderGroundObjects(ctx);
    }
    
    renderGradientBackground(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, this.gameEngine.height);
        gradient.addColorStop(0, '#000022');
        gradient.addColorStop(0.3, '#001133');
        gradient.addColorStop(0.7, '#002244');
        gradient.addColorStop(1, '#003366');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.gameEngine.width, this.gameEngine.height);
    }
    
    renderLayers(ctx) {
        this.layers.forEach(layer => {
            if (layer.name === 'stars') {
                this.renderStars(ctx, layer);
            } else if (layer.name === 'clouds') {
                this.renderClouds(ctx, layer);
            }
        });
    }
    
    renderStars(ctx, layer) {
        ctx.save();
        layer.objects.forEach(star => {
            const alpha = star.brightness * (0.8 + Math.sin(star.twinkle) * 0.2);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = layer.color;
            
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
    
    renderClouds(ctx, layer) {
        ctx.save();
        layer.objects.forEach(cloud => {
            ctx.globalAlpha = cloud.alpha;
            ctx.fillStyle = layer.color;
            
            ctx.beginPath();
            ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.ellipse(cloud.x + cloud.width * 0.3, cloud.y, cloud.width * 0.4, cloud.height * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.ellipse(cloud.x - cloud.width * 0.3, cloud.y, cloud.width * 0.4, cloud.height * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
    
    renderGroundObjects(ctx) {
        ctx.save();
        
        this.groundObjects.forEach(obj => {
            if (obj.y > -obj.height && obj.y < this.gameEngine.height + obj.height) {
                this.renderGroundObject(ctx, obj);
            }
        });
        
        ctx.restore();
    }
    
    renderGroundObject(ctx, obj) {
        if (!obj.active && obj.health <= 0) {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#444444';
        } else {
            ctx.globalAlpha = 1;
            ctx.fillStyle = obj.color;
        }
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        
        switch (obj.type) {
            case 'building':
                this.renderBuilding(ctx, obj);
                break;
            case 'tower':
                this.renderTower(ctx, obj);
                break;
            case 'facility':
                this.renderFacility(ctx, obj);
                break;
            case 'radar':
                this.renderRadar(ctx, obj);
                break;
        }
        
        if (obj.active && obj.health < obj.maxHealth) {
            this.renderHealthBar(ctx, obj);
        }
    }
    
    renderBuilding(ctx, obj) {
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
        
        const windowSize = 4;
        const windowSpacing = 8;
        for (let x = obj.x + windowSpacing; x < obj.x + obj.width - windowSize; x += windowSpacing) {
            for (let y = obj.y + windowSpacing; y < obj.y + obj.height - windowSize; y += windowSpacing) {
                if (Math.random() > 0.3) {
                    ctx.fillStyle = '#ffff88';
                    ctx.fillRect(x, y, windowSize, windowSize);
                    ctx.fillStyle = obj.color;
                }
            }
        }
    }
    
    renderTower(ctx, obj) {
        ctx.beginPath();
        ctx.moveTo(obj.x + obj.width / 2, obj.y);
        ctx.lineTo(obj.x + obj.width * 0.3, obj.y + obj.height);
        ctx.lineTo(obj.x + obj.width * 0.7, obj.y + obj.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(obj.x + obj.width / 2, obj.y + 5, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderFacility(ctx, obj) {
        ctx.fillRect(obj.x, obj.y + obj.height * 0.3, obj.width, obj.height * 0.7);
        ctx.strokeRect(obj.x, obj.y + obj.height * 0.3, obj.width, obj.height * 0.7);
        
        ctx.beginPath();
        ctx.ellipse(obj.x + obj.width / 2, obj.y + obj.height * 0.3, obj.width * 0.4, obj.height * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#00ffff';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(obj.x + obj.width * (0.2 + i * 0.3), obj.y + obj.height * 0.6, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderRadar(ctx, obj) {
        ctx.fillRect(obj.x, obj.y + obj.height * 0.7, obj.width, obj.height * 0.3);
        ctx.strokeRect(obj.x, obj.y + obj.height * 0.7, obj.width, obj.height * 0.3);
        
        const centerX = obj.x + obj.width / 2;
        const centerY = obj.y + obj.height * 0.7;
        const radius = Math.min(obj.width, obj.height * 0.7) * 0.4;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        if (obj.active) {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(obj.radarAngle);
            
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(radius * 0.8, 0);
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    renderHealthBar(ctx, obj) {
        const barWidth = obj.width;
        const barHeight = 4;
        const barX = obj.x;
        const barY = obj.y - 8;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const healthRatio = obj.health / obj.maxHealth;
        ctx.fillStyle = healthRatio > 0.5 ? '#00ff00' : healthRatio > 0.25 ? '#ffff00' : '#ff4444';
        ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
}