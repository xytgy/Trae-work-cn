/**
 * 蝙蝠敌人
 * 红色蝙蝠，快速移动并反复横跳
 */

class Bat extends Enemy {
    constructor(x, y, { eventBus } = {}) {
        super(x, y, {
            ...ENEMIES.BAT,
            type: 'bat'
        }, 1, 1, { eventBus });
        
        // 蝙蝠特有的翅膀拍打动画
        this.wingAngle = 0;
        this.wingSpeed = ENEMY_ANIMATIONS.BAT.wingSpeedFast;
        
        // 水平移动计时器
        this.horizontalTimer = 0;
        this.horizontalDirection = Math.random() > 0.5 ? 1 : -1;
        
        // ========== 新增动画属性 ==========
        
        // 攻击俯冲状态
        this.isDiving = false;
        this.diveTimer = 0;
        this.diveDuration = 300;
        this.diveCooldown = 0;
        this.diveCooldownMax = 2000;
        
        // 受伤旋转
        this.hurtRotation = 0;
        this.hurtRotationSpeed = ENEMY_ANIMATIONS.BAT.hurtRotationSpeed;
        this.isHurtRotating = false;
        this.hurtRotateTimer = 0;
        
        // 死亡坠落
        this.isFalling = false;
        this.fallVelocity = 0;
        this.fallAcceleration = ENEMY_ANIMATIONS.BAT.deathFallSpeed * 0.1;
        this.fallRotation = 0;
        
        // 翅膀速度变化（快/慢）
        this.wingSpeedFast = ENEMY_ANIMATIONS.BAT.wingSpeedFast;
        this.wingSpeedSlow = ENEMY_ANIMATIONS.BAT.wingSpeedSlow;
        this.currentWingSpeed = this.wingSpeedFast;
        
        // 受击震动
        this.hitShakeTimer = 0;
        this.hitShakeDuration = 80;
        this.hitShakeIntensity = 2;
    }
    
    /**
     * 更新蝙蝠
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {Player} player - 玩家引用
     */
    update(deltaTime, player) {
        // 死亡坠落动画
        if (!this.alive && !this.isFalling) {
            this.isFalling = true;
            this.fallVelocity = 0;
        }
        
        if (this.isFalling) {
            this.fallVelocity += this.fallAcceleration * deltaTime;
            this.y += this.fallVelocity;
            this.fallRotation += 0.1;
            if (this.y > GAME_HEIGHT + 50) {
                this.isFalling = false;
            }
            return;
        }
        
        // 根据状态调整翅膀扇动速度
        const distToPlayer = player ? Math.sqrt((player.x - this.x) ** 2 + (player.y - this.y) ** 2) : 999;
        if (distToPlayer < 100) {
            this.currentWingSpeed = this.wingSpeedFast;
        } else {
            this.currentWingSpeed = this.wingSpeedSlow;
        }
        
        // 更新翅膀动画
        this.wingAngle += deltaTime * this.currentWingSpeed;
        
        // 水平移动计时
        this.horizontalTimer += deltaTime;
        if (this.horizontalTimer > 300) {
            this.horizontalTimer = 0;
            this.horizontalDirection *= -1;
        }
        
        // 俯冲冷却
        if (this.diveCooldown > 0) {
            this.diveCooldown -= deltaTime;
        }
        
        // 受伤旋转恢复
        if (this.isHurtRotating) {
            this.hurtRotateTimer -= deltaTime;
            this.hurtRotation = Math.sin(this.hurtRotateTimer * 0.05) * 0.5 * (this.hurtRotateTimer / 300);
            if (this.hurtRotateTimer <= 0) {
                this.isHurtRotating = false;
                this.hurtRotation = 0;
            }
        }
        
        // 受击震动
        if (this.hitShakeTimer > 0) {
            this.hitShakeTimer -= deltaTime;
        }
        
        super.update(deltaTime, player);
    }
    
    /**
     * 重写受伤方法
     */
    takeDamage(damage) {
        const result = super.takeDamage(damage);
        this.isHurtRotating = true;
        this.hurtRotateTimer = 300;
        this.hitShakeTimer = this.hitShakeDuration;
        return result;
    }
    
    /**
     * 渲染蝙蝠
     */
    render() {
        if (!this.alive && !this.isFalling) return;

        const ctx = renderer.ctx;
        
        // 计算淡入透明度
        let alpha = 1;
        if (this.fadeIn) {
            alpha = this.fadeInTimer / this.fadeInMaxTime;
        }
        
        // 死亡坠落透明度
        if (this.isFalling) {
            alpha *= Math.max(0, 1 - this.fallVelocity / 10);
        }
        
        // 翅膀扇动角度
        let wingAngle = Math.sin(this.wingAngle) * 0.8;
        
        // 俯冲时翅膀收拢
        if (this.isDiving) {
            wingAngle *= 0.3;
        }
        
        // 飞行上下摆动
        const bobY = Math.sin(this.animTimer / 200) * 4;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // 受击震动偏移
        let shakeX = 0, shakeY = 0;
        if (this.hitShakeTimer > 0) {
            const shakeProgress = this.hitShakeTimer / this.hitShakeDuration;
            shakeX = (Math.random() - 0.5) * this.hitShakeIntensity * shakeProgress;
            shakeY = (Math.random() - 0.5) * this.hitShakeIntensity * shakeProgress;
        }
        
        ctx.translate(this.x + shakeX, this.y + bobY + shakeY);
        
        // 受伤旋转
        ctx.rotate(this.hurtRotation);
        
        // 死亡坠落旋转
        if (this.isFalling) {
            ctx.rotate(this.fallRotation);
        }
        
        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 12 - bobY, 9, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 身体颜色
        let bodyColor = this.color;
        if (this.isHurt) {
            bodyColor = '#ff0000';
        } else if (this.isFrozen) {
            bodyColor = COLORS.BULLET.FREEZE;
        }
        
        // 左翼
        ctx.fillStyle = bodyColor;
        ctx.save();
        ctx.rotate(-wingAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-12, -8, -16, 0);
        ctx.quadraticCurveTo(-12, 4, 0, 4);
        ctx.fill();
        ctx.restore();
        
        // 右翼
        ctx.save();
        ctx.rotate(wingAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(12, -8, 16, 0);
        ctx.quadraticCurveTo(12, 4, 0, 4);
        ctx.fill();
        ctx.restore();
        
        // 身体
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 耳朵
        ctx.beginPath();
        ctx.moveTo(-4, -6);
        ctx.lineTo(-6, -11);
        ctx.lineTo(-1, -7);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(4, -6);
        ctx.lineTo(6, -11);
        ctx.lineTo(1, -7);
        ctx.fill();
        
        // 红色眼睛
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(-2.5, -2, 1.8, 0, Math.PI * 2);
        ctx.arc(2.5, -2, 1.8, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛高光
        ctx.fillStyle = '#ffaaaa';
        ctx.beginPath();
        ctx.arc(-3, -2.5, 0.6, 0, Math.PI * 2);
        ctx.arc(2, -2.5, 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // 受伤闪白
        if (this.isHurt) {
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.ellipse(0, 0, 12, 10, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        // 绘制血条
        if (this.health < this.maxHealth && this.alive) {
            const barWidth = 20;
            const barHeight = 3;
            const barX = this.x - barWidth / 2;
            const barY = this.y - 20 + Math.sin(this.animTimer / 200) * 4;
            
            ctx.fillStyle = '#424242';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            const healthPercent = this.health / this.maxHealth;
            let healthColor = '#e91e63';
            if (healthPercent > 0.6) {
                healthColor = '#4caf50';
            } else if (healthPercent > 0.3) {
                healthColor = '#ff9800';
            }
            
            ctx.fillStyle = healthColor;
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
        }
    }
}