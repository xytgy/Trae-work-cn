/**
 * 子弹类
 * 负责子弹的移动、状态管理和渲染
 */

/**
 * 普通子弹类
 */
class Bullet {
    constructor(x, y, dirX, dirY, config = {}) {
        // 位置
        this.x = x;
        this.y = y;
        
        // 方向
        this.dirX = dirX;
        this.dirY = dirY;
        
        // 速度
        this.speed = config.speed || 10;
        
        // 伤害
        this.damage = config.damage || 1;
        
        // 颜色
        this.color = config.color || COLORS.BULLET.NORMAL;
        
        // 是否是敌人子弹
        this.isEnemyBullet = config.isEnemyBullet || false;
        
        // 尺寸
        this.size = PIXEL_SIZE.BULLET;
        
        // 活跃状态
        this.active = true;
        
        // 穿透计数
        this.penetrateCount = config.penetrate || 0;
        this.penetrateMax = this.penetrateCount;
        
        // 榴弹爆炸半径
        this.explosionRadius = config.explosionRadius || 0;
        
        // 火焰喷射器射程
        this.range = config.range || 0;
        this.distanceTraveled = 0;
        
        // 回旋镖相关
        this.isBoomerang = config.isBoomerang || false;
        this.boomerangReturned = false;
        this.startX = x;
        this.startY = y;
        
        // 生命周期
        this.lifetime = config.lifetime || 5000;
        this.age = 0;
        
        // 子弹类型
        this.bulletType = 'normal';
    }
    
    /**
     * 更新子弹
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    update(deltaTime) {
        if (!this.active) return;
        
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
        
        // 边界检测
        if (this.x < 0 || this.x > GAME_WIDTH ||
            this.y < 0 || this.y > GAME_HEIGHT) {
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
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * 闪电子弹类 - 可穿透敌人
 */
class LightningBullet extends Bullet {
    constructor(x, y, dirX, dirY, config = {}) {
        super(x, y, dirX, dirY, config);
        this.bulletType = 'lightning';
        this.penetrate = config.penetrate || 1;
        this.penetrateMax = this.penetrate;
        this.trail = [];  // 电弧轨迹
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
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            
            for (let i = 1; i < this.trail.length; i++) {
                const point = this.trail[i];
                const prevPoint = this.trail[i - 1];
                
                // 添加随机偏移模拟电弧
                const offsetX = (Math.random() - 0.5) * 4;
                const offsetY = (Math.random() - 0.5) * 4;
                
                ctx.lineTo(point.x + offsetX, point.y + offsetY);
            }
            ctx.stroke();
        }
        
        // 绘制子弹核心
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
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
    }
    
    update(deltaTime) {
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
        
        // 绘制橙色圆球
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制高光
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
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
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        // 绘制火焰效果
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, 'rgba(255, 87, 34, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
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
    }
    
    update(deltaTime) {
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
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
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
    }
    
    update(deltaTime) {
        this.rotation += 0.1;
        super.update(deltaTime);
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
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
        
        // 内部高光
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
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
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        // 绘制橙色小圆点
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 高光
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(this.x - 1, this.y - 1, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
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
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
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
        
        // 尾焰
        ctx.fillStyle = '#ff9800';
        ctx.beginPath();
        ctx.moveTo(-this.size / 3, -this.size / 4);
        ctx.lineTo(-this.size / 2 - Math.random() * 4, 0);
        ctx.lineTo(-this.size / 3, this.size / 4);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}