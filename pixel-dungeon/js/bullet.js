/**
 * 子弹类
 * 负责子弹的移动、状态管理和渲染
 */

/**
 * 普通子弹类
 */
class Bullet {
    constructor(x, y, dirX, dirY, config = {}) {
        this.x = x;
        this.y = y;
        
        this.dirX = dirX;
        this.dirY = dirY;
        
        this.speed = config.speed || 10;
        
        this.damage = config.damage || 1;
        
        this.color = config.color || COLORS.BULLET.NORMAL;
        
        this.isEnemyBullet = config.isEnemyBullet || false;
        
        this.size = PIXEL_SIZE.BULLET;
        
        this.active = true;
        
        this.penetrateCount = config.penetrate || 0;
        this.penetrateMax = this.penetrateCount;
        
        this.explosionRadius = config.explosionRadius || 0;
        
        this.range = config.range || 0;
        this.distanceTraveled = 0;
        
        this.isBoomerang = config.isBoomerang || false;
        this.boomerangReturned = false;
        this.startX = x;
        this.startY = y;
        
        this.lifetime = config.lifetime || 5000;
        this.age = 0;
        
        this.bulletType = 'normal';
        
        this.trail = [];
        this.trailMaxLength = 8;
        
        this.gameLogic = config.gameLogic || null;
    }
    
    /**
     * 更新子弹
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // 记录轨迹点
        this.trail.push({ x: this.x, y: this.y, age: 0 });
        if (this.trail.length > this.trailMaxLength) {
            this.trail.shift();
        }
        // 更新轨迹年龄
        this.trail.forEach(point => point.age += deltaTime);
        
        // 更新年龄
        this.age += deltaTime;
        
        // 检查生命周期
        if (this.age >= this.lifetime) {
            this.active = false;
            return;
        }
        
        // 计算移动距离
        const moveX = this.dirX * this.speed;
        const moveY = this.dirY * this.speed;
        const moveDist = Math.sqrt(moveX * moveX + moveY * moveY);
        
        // 更新位置
        this.x += moveX;
        this.y += moveY;
        
        // 记录移动距离（用于射程检测）
        this.distanceTraveled += moveDist;
        
        // 边界检测（使用世界坐标范围）
        const worldLeft = 0;
        const worldRight = 10000;
        const worldTop = 0;
        const worldBottom = 10000;
        if (this.x < worldLeft || this.x > worldRight ||
            this.y < worldTop || this.y > worldBottom) {
            this.active = false;
        }
        
        // 射程检测（火焰喷射器）
        if (this.range > 0 && this.distanceTraveled >= this.range) {
            this.active = false;
        }
        
        // 回旋镖逻辑
        if (this.isBoomerang && this.distanceTraveled > 100) {
            this.boomerangReturned = true;
        }
    }
    
    /**
     * 获取子弹位置
     */
    getPosition() {
        return {
            x: this.x,
            y: this.y
        };
    }
    
    /**
     * 获取边界框
     */
    getBounds() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }
    
    /**
     * 穿透敌人
     */
    penetrate() {
        if (this.penetrateMax > 0) {
            this.penetrateCount--;
            return this.penetrateCount >= 0;
        }
        return false;
    }
    
    /**
     * 绘制子弹
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    draw(ctx) {
        if (!this.active) return;
        
        // 绘制拖尾
        if (this.trail.length > 1) {
            for (let i = 0; i < this.trail.length; i++) {
                const point = this.trail[i];
                const progress = i / this.trail.length;
                const alpha = progress * 0.6;
                const size = (this.size / 2) * progress;
                
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // 发光效果
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 核心高光
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x - 1, this.y - 1, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}

/**
 * 闪电子弹类 - 可穿透敌人
 */
class LightningBullet extends Bullet {
    constructor(x, y, dirX, dirY, config = {}) {
        super(x, y, dirX, dirY, config);
        this.bulletType = 'lightning';
        this.penetrateCount = config.penetrate || 1;
        this.penetrateMax = this.penetrateCount;
        this.trail = [];  // 电弧轨迹
    }
    
    penetrate() {
        this.penetrateCount--;
        return this.penetrateCount > 0;
    }
    
    update(deltaTime) {
        // 记录轨迹
        this.trail.push({ x: this.x, y: this.y, age: 0 });
        
        // 更新轨迹年龄
        this.trail = this.trail.filter(point => {
            point.age += deltaTime;
            return point.age < 100;
        });
        
        super.update(deltaTime);
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        // 绘制电弧轨迹
        if (this.trail.length > 1) {
            // 外层光晕
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            
            for (let i = 1; i < this.trail.length; i++) {
                const point = this.trail[i];
                const offsetX = (Math.random() - 0.5) * 8;
                const offsetY = (Math.random() - 0.5) * 8;
                ctx.lineTo(point.x + offsetX, point.y + offsetY);
            }
            ctx.stroke();
            
            // 主电弧
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            
            for (let i = 1; i < this.trail.length; i++) {
                const point = this.trail[i];
                const prevPoint = this.trail[i - 1];
                const midX = (prevPoint.x + point.x) / 2;
                const midY = (prevPoint.y + point.y) / 2;
                
                const offsetX = (Math.random() - 0.5) * 6;
                const offsetY = (Math.random() - 0.5) * 6;
                
                ctx.quadraticCurveTo(prevPoint.x + offsetX, prevPoint.y + offsetY, midX, midY);
                
                const offsetX2 = (Math.random() - 0.5) * 6;
                const offsetY2 = (Math.random() - 0.5) * 6;
                ctx.quadraticCurveTo(point.x + offsetX2, point.y + offsetY2, point.x, point.y);
            }
            ctx.stroke();
            
            // 分支电弧
            for (let i = 2; i < this.trail.length - 1; i += 2) {
                const point = this.trail[i];
                if (Math.random() < 0.5) {
                    const branchLength = 5 + Math.random() * 8;
                    const branchAngle = Math.random() * Math.PI * 2;
                    
                    ctx.strokeStyle = '#ffff00';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(
                        point.x + Math.cos(branchAngle) * branchLength,
                        point.y + Math.sin(branchAngle) * branchLength
                    );
                    ctx.stroke();
                }
            }
        }
        
        // 发光光晕
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // 绘制子弹核心
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}

/**
 * 榴弹类 - 有爆炸范围伤害
 */
class GrenadeBullet extends Bullet {
    constructor(x, y, dirX, dirY, config = {}) {
        super(x, y, dirX, dirY, config);
        this.bulletType = 'grenade';
        this.explosionRadius = config.explosionRadius || 50;
        this.hasExploded = false;
        this.trail = [];
        this.trailMaxLength = 12;
        this.sparkParticles = [];
        this.rotation = 0;
    }
    
    update(deltaTime) {
        // 更新轨迹
        this.trail.push({ x: this.x, y: this.y, age: 0 });
        if (this.trail.length > this.trailMaxLength) {
            this.trail.shift();
        }
        this.trail.forEach(point => point.age += deltaTime);
        
        // 更新旋转
        this.rotation += 0.15;
        
        // 生成火花粒子
        if (Math.random() < 0.4) {
            this.sparkParticles.push({
                x: this.x + (Math.random() - 0.5) * 4,
                y: this.y + (Math.random() - 0.5) * 4,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 300 + Math.random() * 200
            });
        }
        
        // 更新火花粒子
        this.sparkParticles = this.sparkParticles.filter(spark => {
            spark.x += spark.vx;
            spark.y += spark.vy;
            spark.life -= deltaTime;
            return spark.life > 0;
        });
        
        super.update(deltaTime);
        
        // 榴弹触地或到达最大距离时爆炸
        if (!this.active && !this.hasExploded) {
            this.explode();
        }
    }
    
    /**
     * 触发爆炸
     */
    explode() {
        this.hasExploded = true;
        // 爆炸效果由调用者处理
    }
    
    /**
     * 获取爆炸半径
     */
    getExplosionRadius() {
        return this.explosionRadius;
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        // 绘制抛物线尾迹
        if (this.trail.length > 1) {
            for (let i = 0; i < this.trail.length; i++) {
                const point = this.trail[i];
                const progress = i / this.trail.length;
                const alpha = progress * 0.4;
                const size = 2 + progress * 3;
                
                ctx.fillStyle = `rgba(128, 128, 128, ${alpha})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // 绘制火花粒子
        for (const spark of this.sparkParticles) {
            const alpha = spark.life / 500;
            ctx.fillStyle = `rgba(255, ${100 + alpha * 155}, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(spark.x, spark.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // 绘制旋转火花
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2 + this.rotation;
            const sparkLen = 3 + Math.sin(Date.now() / 50 + i) * 2;
            
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * sparkLen, Math.sin(angle) * sparkLen);
            ctx.stroke();
        }
        
        // 绘制榴弹主体
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制高光
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(-2, -2, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

/**
 * 火焰子弹类 - 短距离持续伤害
 */
class FlameBullet extends Bullet {
    constructor(x, y, dirX, dirY, config = {}) {
        super(x, y, dirX, dirY, config);
        this.bulletType = 'flame';
        this.range = config.range || 100;
        this.size = 6;
        this.particles = [];
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        const canSpawnParticles = !this.gameLogic || 
            this.gameLogic.particles.length < PARTICLES.MAX_COUNT;
        
        if (canSpawnParticles && this.particles.length < 20) {
            this.particles.push({
                x: this.x + (Math.random() - 0.5) * 4,
                y: this.y + (Math.random() - 0.5) * 4,
                vx: (Math.random() - 0.5) * 1,
                vy: -0.5 - Math.random() * 1,
                life: 100 + Math.random() * 100,
                maxLife: 200,
                size: 2 + Math.random() * 4
            });
        }
        
        // 更新和绘制火焰粒子
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 16;
            p.size *= 0.98;
            
            if (p.life <= 0) return false;
            
            const alpha = p.life / p.maxLife;
            const progress = 1 - alpha;
            
            let color;
            if (progress < 0.3) {
                color = '#ffff00';
            } else if (progress < 0.6) {
                color = '#ff9800';
            } else {
                color = '#ff5722';
            }
            
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            
            const offsetX = Math.sin(Date.now() / 30 + p.x) * 2;
            const offsetY = Math.cos(Date.now() / 40 + p.y) * 2;
            
            ctx.beginPath();
            ctx.arc(p.x + offsetX, p.y + offsetY, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            return true;
        });
        
        ctx.globalAlpha = 1;
        
        // 火焰跳动效果
        const pulseSize = this.size + Math.sin(Date.now() / 50) * 2;
        
        // 外层光晕
        const outerGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, pulseSize * 1.5
        );
        outerGradient.addColorStop(0, 'rgba(255, 152, 0, 0.3)');
        outerGradient.addColorStop(1, 'rgba(255, 87, 34, 0)');
        
        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 主火焰
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, pulseSize
        );
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.4, '#ff9800');
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, 'rgba(255, 87, 34, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // 火焰核心
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize / 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * 回旋镖子弹类 - 发射后返回
 */
class BoomerangBullet extends Bullet {
    constructor(x, y, dirX, dirY, config = {}) {
        super(x, y, dirX, dirY, config);
        this.bulletType = 'boomerang';
        this.isBoomerang = true;
        this.size = 10;
        this.rotation = 0;
        this.trail = [];
        this.trailMaxLength = 15;
        this.previousPositions = [];
    }
    
    update(deltaTime) {
        // 记录轨迹
        this.trail.push({ x: this.x, y: this.y, rotation: this.rotation });
        if (this.trail.length > this.trailMaxLength) {
            this.trail.shift();
        }
        
        // 记录前几帧位置用于残影
        this.previousPositions.push({ x: this.x, y: this.y, rotation: this.rotation });
        if (this.previousPositions.length > 5) {
            this.previousPositions.shift();
        }
        
        // 回旋镖返回逻辑
        if (this.boomerangReturned) {
            // 改变方向朝向玩家
            const playerPos = this.getPlayerPosition();
            if (playerPos) {
                const dx = playerPos.x - this.x;
                const dy = playerPos.y - this.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                
                if (length > 0) {
                    this.dirX = dx / length;
                    this.dirY = dy / length;
                }
            }
        }
        
        // 更新旋转角度
        this.rotation += 0.3;
        
        super.update(deltaTime);
    }
    
    /**
     * 获取玩家位置（临时存储）
     */
    getPlayerPosition() {
        return this._playerPos;
    }
    
    /**
     * 设置玩家位置引用
     */
    setPlayerPosition(pos) {
        this._playerPos = pos;
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        // 绘制弧线拖尾
        if (this.trail.length > 1) {
            for (let i = 0; i < this.trail.length; i++) {
                const point = this.trail[i];
                const progress = i / this.trail.length;
                const alpha = progress * 0.5;
                
                ctx.save();
                ctx.translate(point.x, point.y);
                ctx.rotate(point.rotation);
                
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.beginPath();
                for (let j = 0; j < 5; j++) {
                    const angle = (j * 2 * Math.PI) / 5 - Math.PI / 2;
                    const radius = (j % 2 === 0 ? this.size : this.size / 2) * (0.3 + progress * 0.7);
                    const px = Math.cos(angle) * radius;
                    const py = Math.sin(angle) * radius;
                    
                    if (j === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.closePath();
                ctx.fill();
                
                ctx.restore();
            }
        }
        
        // 绘制旋转残影
        for (let i = 0; i < this.previousPositions.length; i++) {
            const pos = this.previousPositions[i];
            const alpha = (i + 1) / this.previousPositions.length * 0.3;
            const scale = 0.5 + (i / this.previousPositions.length) * 0.5;
            
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(pos.rotation);
            ctx.globalAlpha = alpha;
            ctx.scale(scale, scale);
            
            ctx.fillStyle = this.color;
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
                const angle = (j * 2 * Math.PI) / 5 - Math.PI / 2;
                const radius = j % 2 === 0 ? this.size : this.size / 2;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                
                if (j === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
        
        ctx.globalAlpha = 1;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // 发光效果
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        
        // 绘制星形回旋镖
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const radius = i % 2 === 0 ? this.size : this.size / 2;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        // 边缘高光
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}

/**
 * 冰冻子弹类 - 命中后减速敌人
 */
class FreezeBullet extends Bullet {
    constructor(x, y, dirX, dirY, config = {}) {
        super(x, y, dirX, dirY, config);
        this.bulletType = 'freeze';
        this.slowFactor = config.slowFactor || 0.5;
        this.slowDuration = config.slowDuration || 2000;
        this.size = 8;
        this.rotation = 0;
        this.iceParticles = [];
        this.hitEffectActive = false;
        this.hitTime = 0;
        this.crackLines = [];
    }
    
    update(deltaTime) {
        this.rotation += 0.1;
        super.update(deltaTime);
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        const canSpawnParticles = !this.gameLogic || 
            this.gameLogic.particles.length < PARTICLES.MAX_COUNT;
        
        if (canSpawnParticles && this.iceParticles.length < 8) {
            this.iceParticles.push({
                x: this.x + (Math.random() - 0.5) * 6,
                y: this.y + (Math.random() - 0.5) * 6,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: 150 + Math.random() * 100,
                size: 1 + Math.random() * 2
            });
        }
        
        // 更新和绘制冰晶粒子
        this.iceParticles = this.iceParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 16;
            p.size *= 0.99;
            
            if (p.life <= 0) return false;
            
            const alpha = p.life / 250;
            ctx.fillStyle = `rgba(173, 216, 230, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            return true;
        });
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // 发光光晕
        ctx.shadowColor = '#87ceeb';
        ctx.shadowBlur = 10;
        
        // 绘制冰晶形状（六角形）
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const px = Math.cos(angle) * (this.size / 2);
            const py = Math.sin(angle) * (this.size / 2);
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        // 冰晶分支
        ctx.strokeStyle = '#add8e6';
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const startX = Math.cos(angle) * (this.size / 2);
            const startY = Math.sin(angle) * (this.size / 2);
            const endX = Math.cos(angle) * (this.size / 2 + 3);
            const endY = Math.sin(angle) * (this.size / 2 + 3);
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // 内部高光
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }
    
    triggerHitEffect(x, y) {
        this.hitEffectActive = true;
        this.hitTime = Date.now();
        this.hitX = x;
        this.hitY = y;
        
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            this.crackLines.push({
                startX: x,
                startY: y,
                endX: x + Math.cos(angle) * 15,
                endY: y + Math.sin(angle) * 15,
                progress: 0
            });
        }
    }
    
    drawHitEffect(ctx) {
        if (!this.hitEffectActive) return;
        
        const elapsed = Date.now() - this.hitTime;
        const duration = 500;
        
        if (elapsed >= duration) {
            this.hitEffectActive = false;
            return;
        }
        
        const progress = Math.min(elapsed / duration, 1);
        
        // 绘制冰裂效果
        ctx.strokeStyle = `rgba(173, 216, 230, ${1 - progress})`;
        ctx.lineWidth = 2;
        
        for (const line of this.crackLines) {
            const currentEndX = line.startX + (line.endX - line.startX) * progress;
            const currentEndY = line.startY + (line.endY - line.startY) * progress;
            
            ctx.beginPath();
            ctx.moveTo(line.startX, line.startY);
            ctx.lineTo(currentEndX, currentEndY);
            ctx.stroke();
        }
        
        // 绘制冲击波纹
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * (1 - progress)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.hitX, this.hitY, progress * 20, 0, Math.PI * 2);
        ctx.stroke();
    }
}

/**
 * 散弹子弹类 - 散弹枪发射的子弹
 */
class ShotgunBullet extends Bullet {
    constructor(x, y, dirX, dirY, config = {}) {
        super(x, y, dirX, dirY, config);
        this.bulletType = 'shotgun';
        this.size = 5;
        this.trail = [];
        this.trailMaxLength = 6;
        this.sparkParticles = [];
    }
    
    update(deltaTime) {
        // 记录轨迹点
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailMaxLength) {
            this.trail.shift();
        }
        
        // 生成散射火花
        if (Math.random() < 0.3) {
            this.sparkParticles.push({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 3 + this.dirX * 2,
                vy: (Math.random() - 0.5) * 3 + this.dirY * 2,
                life: 200 + Math.random() * 100
            });
        }
        
        // 更新火花粒子
        this.sparkParticles = this.sparkParticles.filter(spark => {
            spark.x += spark.vx * 0.5;
            spark.y += spark.vy * 0.5;
            spark.vx *= 0.95;
            spark.vy *= 0.95;
            spark.life -= deltaTime;
            return spark.life > 0;
        });
        
        super.update(deltaTime);
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        // 绘制独立拖尾
        if (this.trail.length > 1) {
            for (let i = 0; i < this.trail.length; i++) {
                const point = this.trail[i];
                const progress = i / this.trail.length;
                const alpha = progress * 0.5;
                const size = (this.size / 2) * progress;
                
                ctx.fillStyle = `rgba(255, 193, 7, ${alpha})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // 绘制散射火花
        for (const spark of this.sparkParticles) {
            const alpha = spark.life / 300;
            ctx.fillStyle = `rgba(255, ${150 + alpha * 105}, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(spark.x, spark.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 发光效果
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5;
        
        // 绘制子弹主体
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 高光
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(this.x - 1, this.y - 1, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}

/**
 * 追踪导弹类 - 自动追踪最近的敌人
 */
class HomingBullet extends Bullet {
    constructor(x, y, dirX, dirY, config = {}) {
        super(x, y, dirX, dirY, config);
        this.bulletType = 'homing';
        this.size = 10;
        this.maxSpeed = config.maxSpeed || 12;
        this.acceleration = config.acceleration || 0.1;
        this.turnSpeed = config.turnSpeed || 2;
        this.explosionRadius = config.explosionRadius || 20;
        this.hasExploded = false;
        this.targetEnemy = null;
        this.enemiesRef = null;
        this.angle = Math.atan2(dirY, dirX);
        
        // 目标锁定机制
        this.targetLocked = false;
        this.lockTimer = 0;
        this.LOCK_DURATION = 1000;
        this.RELOCK_COOLDOWN = 500;
        this.relockCooldownTimer = 0;
        
        // 帧计数器（减少更新频率）
        this.frameCounter = 0;
        
        // 尾焰粒子
        this.flameParticles = [];
        // 转弯轨迹
        this.trail = [];
        this.trailMaxLength = 10;
    }
    
    /**
     * 设置敌人引用（用于追踪）
     */
    setEnemiesRef(enemies) {
        this.enemiesRef = enemies;
    }
    
    /**
     * 获取到敌人的距离
     */
    getDistanceToEnemy(enemy) {
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * 寻找最近的敌人（优化：当敌人数量大于20时使用简化计算）
     */
    findNearestEnemy() {
        if (!this.enemiesRef || this.enemiesRef.length === 0) return null;
        
        // 敌人数量少时，直接遍历
        if (this.enemiesRef.length <= 20) {
            return this._findNearestSimple();
        }
        
        // 敌人数量多时，使用简化计算（避免开方）
        let nearest = null;
        let nearestDistSq = Infinity;
        
        for (const enemy of this.enemiesRef) {
            if (!enemy.alive) continue;
            
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distSq = dx * dx + dy * dy;
            
            if (distSq < nearestDistSq) {
                nearestDistSq = distSq;
                nearest = enemy;
            }
        }
        
        return nearest;
    }
    
    /**
     * 简单遍历查找最近敌人（使用精确距离）
     */
    _findNearestSimple() {
        let nearest = null;
        let nearestDist = Infinity;
        
        for (const enemy of this.enemiesRef) {
            if (!enemy.alive) continue;
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        }
        
        return nearest;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // 更新锁定计时器
        if (this.targetLocked) {
            this.lockTimer += deltaTime;
        }
        
        // 更新重新锁定冷却
        if (this.relockCooldownTimer > 0) {
            this.relockCooldownTimer -= deltaTime;
        }
        
        // 帧计数
        this.frameCounter++;
        
        // 每2帧更新一次追踪逻辑
        if (this.frameCounter % 2 === 0) {
            // 检查是否需要寻找新目标
            if (!this.targetEnemy || !this.targetEnemy.alive) {
                this.targetEnemy = this.findNearestEnemy();
                this.targetLocked = true;
                this.lockTimer = 0;
            } else if (this.targetLocked && this.lockTimer >= this.LOCK_DURATION) {
                // 锁定超时，重新寻找更近的目标
                if (this.relockCooldownTimer <= 0) {
                    const newTarget = this.findNearestEnemy();
                    if (newTarget && newTarget !== this.targetEnemy) {
                        const currentDist = this.getDistanceToEnemy(this.targetEnemy);
                        const newDist = this.getDistanceToEnemy(newTarget);
                        
                        // 如果新目标近很多，则切换
                        if (newDist < currentDist * 0.5) {
                            this.targetEnemy = newTarget;
                            this.lockTimer = 0;
                        }
                    }
                    this.relockCooldownTimer = this.RELOCK_COOLDOWN;
                }
            }
        }
        
        // 如果有目标，调整方向
        if (this.targetEnemy && this.targetEnemy.alive) {
            const targetAngle = Math.atan2(
                this.targetEnemy.y - this.y,
                this.targetEnemy.x - this.x
            );
            
            // 计算角度差
            let angleDiff = targetAngle - this.angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            // 限制转向速度
            const maxTurn = this.turnSpeed * (deltaTime / 1000);
            if (Math.abs(angleDiff) <= maxTurn) {
                this.angle = targetAngle;
            } else {
                this.angle += Math.sign(angleDiff) * maxTurn;
            }
            
            // 更新方向向量
            this.dirX = Math.cos(this.angle);
            this.dirY = Math.sin(this.angle);
        }
        
        // 加速
        if (this.speed < this.maxSpeed) {
            this.speed += this.acceleration;
            if (this.speed > this.maxSpeed) {
                this.speed = this.maxSpeed;
            }
        }
        
        // 记录转弯轨迹
        this.trail.push({ x: this.x, y: this.y, age: 0 });
        if (this.trail.length > this.trailMaxLength) {
            this.trail.shift();
        }
        this.trail.forEach(point => point.age += deltaTime);
        
        // 生成尾焰粒子
        for (let i = 0; i < 2; i++) {
            this.flameParticles.push({
                x: this.x - Math.cos(this.angle) * (this.size / 2 + 2),
                y: this.y - Math.sin(this.angle) * (this.size / 2 + 2),
                vx: -Math.cos(this.angle) * (2 + Math.random() * 3),
                vy: -Math.sin(this.angle) * (2 + Math.random() * 3) + (Math.random() - 0.5) * 2,
                life: 100 + Math.random() * 100,
                maxLife: 200,
                size: 2 + Math.random() * 4
            });
        }
        
        // 更新尾焰粒子
        this.flameParticles = this.flameParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.life -= deltaTime;
            p.size *= 0.95;
            return p.life > 0;
        });
        
        super.update(deltaTime);
    }
    
    /**
     * 触发爆炸
     */
    explode() {
        if (this.hasExploded) return;
        this.hasExploded = true;
        this.active = false;
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        // 绘制转弯轨迹
        if (this.trail.length > 1) {
            for (let i = 0; i < this.trail.length; i++) {
                const point = this.trail[i];
                const progress = i / this.trail.length;
                const alpha = progress * 0.3;
                const size = 2 + progress * 2;
                
                ctx.fillStyle = `rgba(147, 51, 234, ${alpha})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // 发光效果
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        
        // 增强尾焰
        // 外层尾焰
        const flameGradient = ctx.createLinearGradient(
            -this.size / 2 - 15, 0,
            -this.size / 2, 0
        );
        flameGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        flameGradient.addColorStop(0.3, 'rgba(255, 152, 0, 0.8)');
        flameGradient.addColorStop(0.7, 'rgba(255, 87, 34, 1)');
        flameGradient.addColorStop(1, 'rgba(255, 0, 0, 1)');
        
        ctx.fillStyle = flameGradient;
        ctx.beginPath();
        ctx.moveTo(-this.size / 3, -this.size / 3);
        ctx.lineTo(-this.size / 2 - 10 - Math.random() * 8, 0);
        ctx.lineTo(-this.size / 3, this.size / 3);
        ctx.closePath();
        ctx.fill();
        
        // 内层尾焰
        ctx.fillStyle = '#ff9800';
        ctx.beginPath();
        ctx.moveTo(-this.size / 3, -this.size / 5);
        ctx.lineTo(-this.size / 2 - 5 - Math.random() * 4, 0);
        ctx.lineTo(-this.size / 3, this.size / 5);
        ctx.closePath();
        ctx.fill();
        
        // 尾焰核心
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-this.size / 3, -this.size / 8);
        ctx.lineTo(-this.size / 2 - Math.random() * 3, 0);
        ctx.lineTo(-this.size / 3, this.size / 8);
        ctx.closePath();
        ctx.fill();
        
        // 绘制尾焰粒子
        for (const p of this.flameParticles) {
            const alpha = p.life / p.maxLife;
            let color;
            if (alpha > 0.5) {
                color = '#ff9800';
            } else {
                color = '#ff5722';
            }
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(p.x - this.x, p.y - this.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // 绘制导弹主体（紫色）
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.size / 2, 0);
        ctx.lineTo(-this.size / 2, -this.size / 3);
        ctx.lineTo(-this.size / 3, 0);
        ctx.lineTo(-this.size / 2, this.size / 3);
        ctx.closePath();
        ctx.fill();
        
        // 导弹头部高光
        ctx.fillStyle = '#e1bee7';
        ctx.beginPath();
        ctx.moveTo(this.size / 2, 0);
        ctx.lineTo(0, -this.size / 4);
        ctx.lineTo(0, this.size / 4);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.restore();
        
        // 目标锁定指示器
        if (this.targetEnemy && this.targetEnemy.alive && this.targetLocked) {
            const dx = this.targetEnemy.x - this.x;
            const dy = this.targetEnemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // 绘制锁定线
            ctx.strokeStyle = `rgba(147, 51, 234, ${0.5 + Math.sin(Date.now() / 200) * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.targetEnemy.x, this.targetEnemy.y);
            ctx.stroke();
            
            // 绘制目标框
            const lockAlpha = 0.6 + Math.sin(Date.now() / 150) * 0.3;
            ctx.strokeStyle = `rgba(255, 255, 255, ${lockAlpha})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(
                this.targetEnemy.x - 10,
                this.targetEnemy.y - 10,
                20,
                20
            );
            
            // 绘制角落箭头
            ctx.strokeStyle = `rgba(147, 51, 234, ${lockAlpha})`;
            ctx.lineWidth = 2;
            
            // 左上角
            ctx.beginPath();
            ctx.moveTo(this.targetEnemy.x - 10, this.targetEnemy.y - 8);
            ctx.lineTo(this.targetEnemy.x - 10, this.targetEnemy.y - 15);
            ctx.lineTo(this.targetEnemy.x - 3, this.targetEnemy.y - 15);
            ctx.stroke();
            
            // 右上角
            ctx.beginPath();
            ctx.moveTo(this.targetEnemy.x + 10, this.targetEnemy.y - 8);
            ctx.lineTo(this.targetEnemy.x + 10, this.targetEnemy.y - 15);
            ctx.lineTo(this.targetEnemy.x + 3, this.targetEnemy.y - 15);
            ctx.stroke();
            
            // 左下角
            ctx.beginPath();
            ctx.moveTo(this.targetEnemy.x - 10, this.targetEnemy.y + 8);
            ctx.lineTo(this.targetEnemy.x - 10, this.targetEnemy.y + 15);
            ctx.lineTo(this.targetEnemy.x - 3, this.targetEnemy.y + 15);
            ctx.stroke();
            
            // 右下角
            ctx.beginPath();
            ctx.moveTo(this.targetEnemy.x + 10, this.targetEnemy.y + 8);
            ctx.lineTo(this.targetEnemy.x + 10, this.targetEnemy.y + 15);
            ctx.lineTo(this.targetEnemy.x + 3, this.targetEnemy.y + 15);
            ctx.stroke();
        }
    }
}