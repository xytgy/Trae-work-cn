/**
 * 幽灵敌人
 * 紫色幽灵，可发射投射物攻击玩家
 */

class Ghost extends Enemy {
    constructor(x, y, { eventBus } = {}) {
        super(
            x,
            y,
            {
                ...ENEMIES.GHOST,
                type: 'ghost'
            },
            1,
            1,
            { eventBus });

        // 幽灵特有的浮动动画
        this.floatOffset = 0;
        this.floatTimer = 0;

        // 发射投射物计时器
        this.shootTimer = 0;

        // ========== 新增动画属性 ==========

        // 透明度变化
        this.alphaVariation = ENEMY_ANIMATIONS.GHOST.alphaVariation;
        this.alphaSpeed = ENEMY_ANIMATIONS.GHOST.alphaSpeed;
        this.baseAlpha = 0.85;

        // 下摆飘动
        this.bottomWaveAmount = ENEMY_ANIMATIONS.GHOST.bottomWaveAmount;
        this.bottomWaveSpeed = ENEMY_ANIMATIONS.GHOST.bottomWaveSpeed;

        // 攻击前伸长
        this.attackExtend = 0;
        this.attackExtendAmount = ENEMY_ANIMATIONS.GHOST.attackExtend;
        this.isAttacking = false;
        this.attackAnimTimer = 0;
        this.attackAnimDuration = 300;

        // 死亡消散
        this.isFading = false;
        this.fadeTimer = 0;
        this.fadeDuration = ENEMY_ANIMATIONS.GHOST.deathFadeDuration;

        // 受击震动
        this.hitShakeTimer = 0;
        this.hitShakeDuration = 100;
        this.hitShakeIntensity = 2;
    }

    /**
     * 更新幽灵
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {Player} player - 玩家引用
     */
    update(deltaTime, player) {
        // 死亡消散动画
        if (!this.alive && !this.isFading) {
            this.isFading = true;
            this.fadeTimer = 0;
        }

        if (this.isFading) {
            this.fadeTimer += deltaTime;
            this.floatOffset += 0.5;
            if (this.fadeTimer >= this.fadeDuration) {
                this.isFading = false;
            }
            return;
        }

        // 更新浮动动画
        this.floatTimer += deltaTime;
        this.floatOffset = Math.sin(this.floatTimer / 300) * 4;

        // 攻击伸长动画
        if (this.isAttacking) {
            this.attackAnimTimer += deltaTime;
            const progress = this.attackAnimTimer / this.attackAnimDuration;
            if (progress < 0.5) {
                this.attackExtend = this.attackExtendAmount * (progress * 2);
            } else {
                this.attackExtend = this.attackExtendAmount * (1 - (progress - 0.5) * 2);
            }
            if (this.attackAnimTimer >= this.attackAnimDuration) {
                this.isAttacking = false;
                this.attackExtend = 0;
            }
        }

        // 受击震动
        if (this.hitShakeTimer > 0) {
            this.hitShakeTimer -= deltaTime;
        }

        // 更新射击计时器（冰冻时射击变慢，即计时器增长变慢）
        const adjustedDelta = deltaTime * (this.slowFactor || 1);
        this.shootTimer += adjustedDelta;

        // 如果到了射击时间，发射投射物
        if (this.shootTimer >= ENEMIES.GHOST.SHOOT_INTERVAL) {
            this.shootTimer = 0;
            this.shoot(player);
            this.isAttacking = true;
            this.attackAnimTimer = 0;
        }

        super.update(deltaTime, player);
    }

    /**
     * 重写受伤方法
     */
    takeDamage(damage) {
        const result = super.takeDamage(damage);
        this.hitShakeTimer = this.hitShakeDuration;
        return result;
    }

    /**
     * 发射投射物
     * @param {Player} player - 玩家引用
     */
    shoot(player) {
        // 计算朝向玩家的方向
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            const direction = {
                x: dx / dist,
                y: dy / dist
            };

            // 创建敌人子弹（通过全局game实例访问）
            if (typeof game !== 'undefined' && game.getGameLogic) {
                const bullet = new Bullet(this.x, this.y, direction.x, direction.y, {
                    damage: this.damage,
                    speed: ENEMIES.GHOST.BULLET_SPEED,
                    isEnemyBullet: true,
                    color: '#9c27b0'
                });
                bullet.isEnemyBullet = true;
                game.getGameLogic().bullets.push(bullet);
            }
        }
    }

    /**
     * 渲染幽灵
     */
    render() {
        if (!this.alive && !this.isFading) {return;}

        const ctx = renderer.ctx;

        // 漂浮动画
        const floatY = Math.sin(this.floatTimer / 400) * 5;
        const floatX = Math.sin(this.floatTimer / 600) * 3;

        // 透明度变化
        const alphaPulse = Math.sin(this.floatTimer * this.alphaSpeed) * this.alphaVariation;
        let currentAlpha = this.baseAlpha + alphaPulse;

        // 死亡消散透明度
        if (this.isFading) {
            currentAlpha *= 1 - this.fadeTimer / this.fadeDuration;
            if (this.fadeTimer >= this.fadeDuration) {return;}
        }

        // 计算淡入透明度
        if (this.fadeIn) {
            currentAlpha *= this.fadeInTimer / this.fadeInMaxTime;
        }

        ctx.save();
        ctx.globalAlpha = currentAlpha;

        // 受击震动偏移
        let shakeX = 0,
            shakeY = 0;
        if (this.hitShakeTimer > 0) {
            const shakeProgress = this.hitShakeTimer / this.hitShakeDuration;
            shakeX = (Math.random() - 0.5) * this.hitShakeIntensity * shakeProgress;
            shakeY = (Math.random() - 0.5) * this.hitShakeIntensity * shakeProgress;
        }

        ctx.translate(this.x + floatX + shakeX, this.y + floatY + shakeY);

        // 攻击时向前伸长
        let extendOffset = 0;
        if (this.isAttacking) {
            extendOffset = this.attackExtend;
        }

        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.ellipse(0, 18 - floatY, 10, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // 身体颜色
        let bodyColor = this.color;
        if (this.isHurt) {
            bodyColor = '#ff0000';
        } else if (this.isFrozen) {
            bodyColor = COLORS.BULLET.FREEZE;
        }

        // 绘制幽灵身体（上圆下波浪）
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(0, -2 - extendOffset / 2, 10, Math.PI, 0);
        ctx.lineTo(10, 10 + extendOffset);
        // 波浪底边
        for (let i = 0; i < 4; i++) {
            const x = 10 - i * 5;
            const y = 10 + extendOffset + Math.sin(this.floatTimer * this.bottomWaveSpeed + i) * this.bottomWaveAmount;
            ctx.quadraticCurveTo(x - 2.5, y + 5, x - 5, y);
        }
        ctx.lineTo(-10, 10 + extendOffset);
        ctx.closePath();
        ctx.fill();

        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(-3, -5 - extendOffset / 2, 3, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // 椭圆形黑色眼睛
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(-3.5, -3 - extendOffset / 2, 2.5, 3.5, 0, 0, Math.PI * 2);
        ctx.ellipse(3.5, -3 - extendOffset / 2, 2.5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛高光
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-4, -4 - extendOffset / 2, 1, 0, Math.PI * 2);
        ctx.arc(3, -4 - extendOffset / 2, 1, 0, Math.PI * 2);
        ctx.fill();

        // 嘴巴（攻击时张大）
        ctx.fillStyle = '#000000';
        const mouthScale = 1 + (this.isAttacking ? 0.5 : 0);
        ctx.beginPath();
        ctx.ellipse(0, 3 + extendOffset / 2, 2.5 * mouthScale, 3 * mouthScale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // 绘制血条
        if (this.health < this.maxHealth && this.alive) {
            const barWidth = 20;
            const barHeight = 3;
            const barX = this.x - barWidth / 2;
            const barY = this.y - 22 + floatY;

            ctx.globalAlpha = 1;
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
