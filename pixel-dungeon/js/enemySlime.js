/**
 * 史莱姆敌人
 * 绿色史莱姆，持续向玩家移动
 */

class Slime extends Enemy {
    constructor(x, y, { eventBus } = {}) {
        super(x, y, {
            ...ENEMIES.SLIME,
            type: 'slime'
        }, 1, 1, { eventBus });
        
        // 史莱姆特有的弹跳动画
        this.bounceOffset = 0;
        this.bounceTimer = 0;
        
        // ========== 新增动画属性 ==========
        
        // 愤怒状态（低血量时）
        this.isAngry = false;
        this.angryThreshold = 0.3; // 30%血量以下愤怒
        
        // 死亡融化动画
        this.isMelting = false;
        this.meltTimer = 0;
        this.meltDuration = ENEMY_ANIMATIONS.SLIME.deathMeltDuration;
        
        // 跳跃拉伸/落地压扁（增强版）
        this.jumpStretch = ENEMY_ANIMATIONS.SLIME.jumpStretch;
        this.landSquash = ENEMY_ANIMATIONS.SLIME.landSquash;
        
        // 受击震动
        this.hitShakeTimer = 0;
        this.hitShakeDuration = 100;
        this.hitShakeIntensity = 2;
    }
    
    /**
     * 更新史莱姆
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {Player} player - 玩家引用
     */
    update(deltaTime, player) {
        super.update(deltaTime, player);
        
        // 更新弹跳动画
        this.bounceTimer += deltaTime;
        this.bounceOffset = Math.abs(Math.sin(this.bounceTimer / 200)) * 3;
        
        // 检查愤怒状态
        if (this.health / this.maxHealth <= this.angryThreshold) {
            this.isAngry = true;
        }
        
        // 死亡融化动画
        if (!this.alive && !this.isMelting) {
            this.isMelting = true;
            this.meltTimer = 0;
        }
        
        if (this.isMelting) {
            this.meltTimer += deltaTime;
        }
        
        // 受击震动
        if (this.hitShakeTimer > 0) {
            this.hitShakeTimer -= deltaTime;
        }
    }
    
    /**
     * 重写受伤方法以添加震屏效果
     */
    takeDamage(damage) {
        const result = super.takeDamage(damage);
        this.hitShakeTimer = this.hitShakeDuration;
        return result;
    }
    
    /**
     * 重写渲染方法以添加弹跳效果
     */
    render() {
        if (!this.alive && !this.isMelting) return;
        
        const ctx = renderer.ctx;
        
        // 计算淡入透明度
        let alpha = 1;
        if (this.fadeIn) {
            alpha = this.fadeInTimer / this.fadeInMaxTime;
        }
        
        // 死亡融化透明度
        if (this.isMelting) {
            alpha *= 1 - this.meltTimer / this.meltDuration;
            if (this.meltTimer >= this.meltDuration) return;
        }
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // 受击震动偏移
        let shakeX = 0, shakeY = 0;
        if (this.hitShakeTimer > 0) {
            const shakeProgress = this.hitShakeTimer / this.hitShakeDuration;
            shakeX = (Math.random() - 0.5) * this.hitShakeIntensity * shakeProgress;
            shakeY = (Math.random() - 0.5) * this.hitShakeIntensity * shakeProgress;
        }
        
        // 弹跳动画
        const bounceY = Math.abs(Math.sin(this.bounceTimer / 200)) * 3;
        
        // 增强版压扁/拉伸效果
        const bouncePhase = this.bounceTimer / 200;
        const normalizedPhase = bouncePhase % Math.PI;
        let scaleX = 1;
        let scaleY = 1;
        
        if (normalizedPhase < Math.PI / 2) {
            // 上升阶段 - 拉伸
            const t = normalizedPhase / (Math.PI / 2);
            scaleX = 1 - this.jumpStretch * Math.sin(t * Math.PI);
            scaleY = 1 + this.jumpStretch * Math.sin(t * Math.PI);
        } else {
            // 下降阶段 - 压扁
            const t = (normalizedPhase - Math.PI / 2) / (Math.PI / 2);
            scaleX = 1 + this.landSquash * Math.sin(t * Math.PI);
            scaleY = 1 - this.landSquash * Math.sin(t * Math.PI);
        }
        
        // 死亡融化缩放
        if (this.isMelting) {
            const meltProgress = this.meltTimer / this.meltDuration;
            scaleX = 1 + meltProgress * 0.5;
            scaleY = 1 - meltProgress * 0.8;
        }
        
        ctx.translate(this.x + shakeX, this.y - bounceY + shakeY);
        ctx.scale(scaleX, scaleY);
        
        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 10 + bounceY, 10 / scaleX, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 身体颜色
        let bodyColor = this.color;
        if (this.isHurt) {
            bodyColor = '#ff0000';
        } else if (this.isFrozen) {
            bodyColor = COLORS.BULLET.FREEZE;
        } else if (this.isAngry) {
            // 愤怒时变红
            bodyColor = ENEMY_ANIMATIONS.SLIME.angryRed;
        }
        
        // 绘制史莱姆身体（椭圆）
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-3, -3, 3, 2, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // 愤怒时的眉毛
        if (this.isAngry) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1.5;
            // 左眉毛
            ctx.beginPath();
            ctx.moveTo(-5, -4);
            ctx.lineTo(-1, -3);
            ctx.stroke();
            // 右眉毛
            ctx.beginPath();
            ctx.moveTo(5, -4);
            ctx.lineTo(1, -3);
            ctx.stroke();
        }
        
        // 眨眼动画
        const blinkPhase = Math.floor(this.bounceTimer / 2000) % 3;
        if (blinkPhase !== 2 && !this.isMelting) {
            // 眼白
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-3, -1, 2.5, 0, Math.PI * 2);
            ctx.arc(3, -1, 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            // 瞳孔
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(-3, -1, 1.2, 0, Math.PI * 2);
            ctx.arc(3, -1, 1.2, 0, Math.PI * 2);
            ctx.fill();
            
            // 愤怒时瞳孔变小更凶狠
            if (this.isAngry) {
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(-3, -1, 0.8, 0, Math.PI * 2);
                ctx.arc(3, -1, 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
        
        // 绘制血条（在世界坐标）
        if (this.health < this.maxHealth && this.alive) {
            const barWidth = 20;
            const barHeight = 3;
            const barX = this.x - barWidth / 2;
            const barY = this.y - 18 - this.bounceOffset;
            
            // 血条背景
            ctx.fillStyle = '#424242';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // 血条颜色根据血量变化
            const healthPercent = this.health / this.maxHealth;
            let healthColor = '#e91e63';
            if (healthPercent > 0.6) {
                healthColor = '#4caf50';
            } else if (healthPercent > 0.3) {
                healthColor = '#ff9800';
            }
            
            // 血条
            ctx.fillStyle = healthColor;
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
            
            // 血条边框
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
        }
    }
}