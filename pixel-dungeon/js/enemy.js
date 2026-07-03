/**
 * 敌人基类
 * 所有敌人的父类，包含通用属性和方法
 */

class Enemy {
    constructor(x, y, config, difficultyMultiplier = 1, aiLevel = 1, { eventBus } = {}) {
        // 事件总线
        this.eventBus = eventBus;

        // 位置
        this.x = x;
        this.y = y;

        // 尺寸
        this.size = config.size || PIXEL_SIZE.ENEMY;

        // 颜色
        this.color = config.color || COLORS.ENEMY.SLIME;

        // 生命值（应用难度倍率）
        this.baseHealth = config.health || 1;
        this.health = Math.ceil(this.baseHealth * difficultyMultiplier);
        this.maxHealth = this.health;

        // 移动速度（应用难度倍率）
        this.baseSpeed = config.speed || 2;
        this.speed = this.baseSpeed;

        // 伤害（应用难度倍率）
        this.baseDamage = config.damage || 1;
        this.damage = Math.max(1, Math.floor(this.baseDamage * difficultyMultiplier));

        // 掉落率
        this.dropRate = config.dropRate || 0.3;

        // 攻击范围
        this.attackRange = config.attackRange || 30;

        // 攻击冷却时间
        this.baseAttackCooldown = config.attackCooldown || 1000;
        this.attackCooldown = this.baseAttackCooldown;
        this.lastAttackTime = 0;

        // 存活状态
        this.alive = true;

        // 受伤状态
        this.isHurt = false;
        this.hurtTimer = 0;

        // 冰冻状态
        this.isFrozen = false;
        this.frozenTimer = 0;
        this.slowFactor = 1; // 当前速度倍率（1=正常，0.5=减速50%）

        // 动画
        this.animFrame = 0;
        this.animTimer = 0;

        // AI类型
        this.aiType = config.ai || 'chase';

        // AI等级（1=简单，2=普通，3=困难）
        this.aiLevel = aiLevel;
        this.aiConfig = DIFFICULTY.AI_LEVELS[aiLevel] || DIFFICULTY.AI_LEVELS[1];

        // 是否是被召唤的
        this.isSummoned = false;

        // 击中闪白
        this.hitFlashTimer = 0;
        this.hitFlashDuration = FEEDBACK.HIT_FLASH.ENEMY_DURATION;

        // 击退效果
        this.knockbackX = 0;
        this.knockbackY = 0;
        this.knockbackTimer = 0;

        // 闪避相关
        this.dodgeCooldown = 0;
        this.isDodging = false;
        this.dodgeTimer = 0;
        this.dodgeDirection = { x: 0, y: 0 };

        // 应用AI等级对攻击冷却的影响
        this.applyAILevelAdjustments();
    }

    /**
     * 应用AI等级调整
     */
    applyAILevelAdjustments() {
        if (this.aiConfig) {
            this.attackCooldown = this.baseAttackCooldown * this.aiConfig.attackCooldownMultiplier;
        }
    }

    /**
     * 更新敌人
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {Player} player - 玩家引用
     */
    update(deltaTime, player) {
        if (!this.alive) {
            return;
        }

        // 更新受伤状态
        if (this.isHurt) {
            this.hurtTimer -= deltaTime;
            if (this.hurtTimer <= 0) {
                this.isHurt = false;
            }
        }

        // 更新击中闪白
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= deltaTime;
            if (this.hitFlashTimer < 0) {
                this.hitFlashTimer = 0;
            }
        }

        // 更新击退效果
        this.updateKnockback(deltaTime);

        // 更新冰冻状态
        if (this.isFrozen) {
            this.frozenTimer -= deltaTime;
            if (this.frozenTimer <= 0) {
                this.isFrozen = false;
                this.slowFactor = 1;
                this.speed = this.baseSpeed;
                this.attackCooldown = this.baseAttackCooldown;
            }
        }

        // 更新动画
        this.updateAnimation(deltaTime);

        // 执行AI行为（应用减速）
        this.executeAI(deltaTime, player);
    }

    /**
     * 执行AI行为
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {Player} player - 玩家引用
     */
    executeAI(deltaTime, player) {
        // 更新闪避冷却
        if (this.dodgeCooldown > 0) {
            this.dodgeCooldown -= deltaTime;
        }

        // 更新闪避状态
        if (this.isDodging) {
            this.dodgeTimer -= deltaTime;
            if (this.dodgeTimer <= 0) {
                this.isDodging = false;
            } else {
                // 闪避移动
                this.x += this.dodgeDirection.x * this.speed * 2;
                this.y += this.dodgeDirection.y * this.speed * 2;
                return;
            }
        }

        switch (this.aiType) {
            case 'chase':
                this.aiChase(player);
                break;
            case 'flanker':
                this.aiFlanker(deltaTime, player);
                break;
            case 'shooter':
                this.aiShooter(deltaTime, player);
                break;
        }
    }

    /**
     * AI: 持续追踪玩家
     * @param {Player} player - 玩家引用
     */
    aiChase(player) {
        let targetX = player.x;
        let targetY = player.y;

        // AI等级2及以上：预测玩家移动
        if (this.aiConfig && this.aiConfig.predictiveMovement && player.velocityX !== undefined) {
            const predictTime = 30;
            targetX += player.velocityX * predictTime;
            targetY += player.velocityY * predictTime;
        }

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            // 应用追踪精确度
            const accuracy = this.aiConfig ? this.aiConfig.chaseAccuracy : 1;

            // 基础移动方向
            let moveX = (dx / dist) * this.speed * accuracy;
            let moveY = (dy / dist) * this.speed * accuracy;

            // 添加一些随机偏移（低AI等级更明显）
            if (accuracy < 1) {
                const randomFactor = (1 - accuracy) * 0.5;
                moveX += (Math.random() - 0.5) * this.speed * randomFactor;
                moveY += (Math.random() - 0.5) * this.speed * randomFactor;
            }

            this.x += moveX;
            this.y += moveY;
        }
    }

    /**
     * AI: 反复横跳
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {Player} player - 玩家引用
     */
    aiFlanker(deltaTime, player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 每隔一段时间改变方向
        this.flankerTimer = (this.flankerTimer || 0) + deltaTime;

        if (this.flankerTimer > 500) {
            this.flankerTimer = 0;
            // 随机选择一个垂直于玩家方向的方向
            const perpX = -dy / dist;
            const perpY = dx / dist;
            const side = Math.random() > 0.5 ? 1 : -1;

            this.x += perpX * this.speed * 3 * side;
            this.y += perpY * this.speed * 3 * side;
        }

        // 继续向玩家移动
        if (dist > 0) {
            this.x += (dx / dist) * this.speed * 0.5;
            this.y += (dy / dist) * this.speed * 0.5;
        }
    }

    /**
     * AI: 发射投射物
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {Player} player - 玩家引用
     */
    aiShooter(deltaTime, player) {
        // 向玩家移动
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            this.x += (dx / dist) * this.speed * 0.5;
            this.y += (dy / dist) * this.speed * 0.5;
        }

        // 检查是否需要发射投射物
        // 注意：这里只负责移动，投射物的创建由GameLogic处理
    }

    /**
     * 尝试闪避（高AI等级敌人使用）
     * @param {Object} incomingDirection - 来袭方向 {x, y}
     * @returns {boolean} 是否成功闪避
     */
    tryDodge(incomingDirection) {
        if (!this.aiConfig || !this.aiConfig.dodgeChance) {
            return false;
        }
        if (this.dodgeCooldown > 0 || this.isDodging) {
            return false;
        }

        if (Math.random() < this.aiConfig.dodgeChance) {
            // 闪避方向：垂直于来袭方向
            const perpX = -incomingDirection.y;
            const perpY = incomingDirection.x;
            const side = Math.random() > 0.5 ? 1 : -1;

            this.dodgeDirection = { x: perpX * side, y: perpY * side };
            this.isDodging = true;
            this.dodgeTimer = 200;
            this.dodgeCooldown = 2000;
            return true;
        }
        return false;
    }

    /**
     * 受伤
     * @param {number} damage - 受到的伤害
     * @param {Object} knockbackDirection - 击退方向 {x, y}
     * @param {number} knockbackForce - 击退力度
     */
    takeDamage(damage, knockbackDirection, knockbackForce) {
        this.health -= damage;
        this.isHurt = true;
        this.hurtTimer = 100;

        // 触发击中闪白
        this.hitFlashTimer = this.hitFlashDuration;

        // 应用击退效果
        if (knockbackDirection && knockbackForce > 0) {
            this.knockbackX = knockbackDirection.x * knockbackForce;
            this.knockbackY = knockbackDirection.y * knockbackForce;
            this.knockbackTimer = FEEDBACK.KNOCKBACK.RECOVERY_TIME;
        }

        if (this.health <= 0) {
            this.alive = false;

            // 发布敌人死亡事件
            if (this.eventBus) {
                this.eventBus.publish('ENEMY_KILLED', { enemy: this, killer: null });
            }
        }
    }

    /**
     * 更新击退效果
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updateKnockback(deltaTime) {
        if (this.knockbackTimer > 0) {
            // 应用击退速度
            this.x += this.knockbackX;
            this.y += this.knockbackY;

            // 摩擦力衰减
            this.knockbackX *= FEEDBACK.KNOCKBACK.FRICTION;
            this.knockbackY *= FEEDBACK.KNOCKBACK.FRICTION;

            // 更新计时器
            this.knockbackTimer -= deltaTime;

            // 结束时重置
            if (this.knockbackTimer <= 0) {
                this.knockbackTimer = 0;
                this.knockbackX = 0;
                this.knockbackY = 0;
            }
        }
    }

    /**
     * 应用冰冻效果
     * @param {number} slowFactor - 减速倍率（0.5表示减速50%）
     * @param {number} duration - 持续时间（毫秒）
     */
    applyFreeze(slowFactor, duration) {
        this.isFrozen = true;
        this.frozenTimer = duration;
        this.slowFactor = slowFactor;
        this.speed = this.baseSpeed * slowFactor;
        this.attackCooldown = this.baseAttackCooldown / slowFactor;
    }

    /**
     * 更新动画
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updateAnimation(deltaTime) {
        this.animTimer += deltaTime;

        const frameTime = 1000 / ANIMATION.STAND.fps;

        if (this.animTimer >= frameTime) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
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
     * 渲染敌人
     */
    render() {
        const ctx = renderer.ctx;

        // 计算闪白强度
        const flashIntensity =
            this.hitFlashTimer > 0 ? (this.hitFlashTimer / this.hitFlashDuration) * FEEDBACK.HIT_FLASH.INTENSITY : 0;

        // 确定身体颜色
        let bodyColor = this.color;
        if (this.isHurt) {
            bodyColor = '#ff0000';
        } else if (this.isFrozen) {
            bodyColor = COLORS.BULLET.FREEZE;
        }

        ctx.save();

        // 如果有闪白效果，使用lighter混合模式
        if (flashIntensity > 0) {
            ctx.globalCompositeOperation = 'source-over';
        }

        // 绘制敌人身体
        renderer.drawPixelCharacter(this.x - this.size / 2, this.y - this.size / 2, this.size, bodyColor);

        // 绘制敌人眼睛
        renderer.drawCircle(this.x - 3, this.y - 2, 2, '#ffffff');
        renderer.drawCircle(this.x + 3, this.y - 2, 2, '#ffffff');

        // 如果有闪白效果，绘制白色覆盖层
        if (flashIntensity > 0) {
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity})`;
            ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.restore();

        // 渲染血条
        this.renderHealthBar();
    }

    /**
     * 渲染敌人血条
     */
    renderHealthBar() {
        // 满血时不显示血条
        if (this.health >= this.maxHealth) {
            return;
        }

        const barWidth = ENEMY_HEALTH_BAR.WIDTH;
        const barHeight = ENEMY_HEALTH_BAR.HEIGHT;
        const x = this.x - barWidth / 2;
        const y = this.y - this.size / 2 - ENEMY_HEALTH_BAR.Y_OFFSET;

        // 背景
        renderer.drawRect(x, y, barWidth, barHeight, ENEMY_HEALTH_BAR.BG_COLOR);

        // 计算血量百分比
        const healthPercent = Math.max(0, this.health / this.maxHealth);

        // 根据血量百分比选择颜色
        let barColor = ENEMY_HEALTH_BAR.COLOR_HIGH;
        if (healthPercent < ENEMY_HEALTH_BAR.LOW_THRESHOLD) {
            barColor = ENEMY_HEALTH_BAR.COLOR_LOW;
        } else if (healthPercent < ENEMY_HEALTH_BAR.MID_THRESHOLD) {
            barColor = ENEMY_HEALTH_BAR.COLOR_MID;
        }

        // 当前血量
        renderer.drawRect(x, y, barWidth * healthPercent, barHeight, barColor);

        // 边框
        renderer.drawRectOutline(x, y, barWidth, barHeight, ENEMY_HEALTH_BAR.BORDER_COLOR, 1);
    }
}
