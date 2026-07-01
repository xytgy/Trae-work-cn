/**
 * 玩家角色类
 * 负责玩家角色的数据和方法
 * 功能：移动、射击、受伤、无敌帧、武器切换、角色技能
 */

class Player {
    constructor(x, y, { eventBus } = {}) {
        // 事件总线
        this.eventBus = eventBus;
        
        // 位置
        this.x = x;
        this.y = y;
        
        // 尺寸
        this.size = PIXEL_SIZE.PLAYER;
        
        // 移动速度（像素/帧）
        this.speed = PLAYER.SPEED;
        this.speedBonus = 1; // 速度加成倍率
        
        // 移动系统 - 速度向量
        this.velocityX = 0;
        this.velocityY = 0;
        
        // 移动系统 - 参数（从常量读取，可动态调整）
        this.maxSpeed = PLAYER.MAX_SPEED;
        this.acceleration = PLAYER.ACCELERATION;
        this.deceleration = PLAYER.DECELERATION;
        this.friction = PLAYER.FRICTION;
        this.airResistance = PLAYER.AIR_RESISTANCE;
        
        // 渲染位置（插值用）
        this.renderX = x;
        this.renderY = y;
        this.interpolationFactor = PLAYER.INTERPOLATION_FACTOR;
        
        // 走路动画
        this.walkBobTimer = 0;
        this.walkBobAmount = PLAYER.WALK_BOB_AMOUNT;
        this.walkBobSpeed = PLAYER.WALK_BOB_SPEED;
        
        // 角色倾斜
        this.tiltAngle = 0;
        this.maxTilt = PLAYER.MAX_TILT;
        this.tiltSpeed = PLAYER.TILT_SPEED;
        
        // 动画状态
        this.animState = 'idle';
        this.animFrame = 0;
        this.animTimer = 0;
        
        // 玩家状态
        this.playerState = 'normal';  // normal, invincible, dead
        
        // 受伤闪烁计时器
        this.flashTimer = 0;
        this.flashInterval = PLAYER.FLASH_INTERVAL;
        this.visible = true;
        
        // 角色系统
        this.character = null;           // 当前角色实例
        this.characterId = 1;           // 默认角色ID
        this.damageBonus = 1;           // 伤害加成倍率
        this.defenseBonus = 1;         // 防御加成倍率
        
        // 怒气系统
        this.rage = 0;                  // 当前怒气
        this.maxRage = RAGE.MAX_RAGE;   // 最大怒气
        this.ragePerKill = RAGE.KILL_RAGE_GAIN;   // 击杀获得怒气
        this.ragePerHurt = RAGE.HURT_RAGE_GAIN;   // 受伤获得怒气
        this.lastRageTime = 0;          // 上次获得怒气时间
        
        // 技能按键
        this.skillKey = 'E';            // 技能按键
        
        // 受伤闪白
        this.hitFlashTimer = 0;
        this.hitFlashDuration = FEEDBACK.HIT_FLASH.PLAYER_DURATION;
        
        // 击退效果
        this.knockbackX = 0;
        this.knockbackY = 0;
        this.knockbackTimer = 0;
        
        // 移动优化 - 起步爆发
        this.burstTimer = 0;
        this.lastInputX = 0;
        this.lastInputY = 0;
        
        // 移动优化 - 转向灵敏度
        this.turnSensitivity = PLAYER.TURN_SENSITIVITY;
        
        // 移动优化 - 对角线修正
        this.diagonalCorrection = PLAYER.DIAGONAL_CORRECTION;
        
        // ========== 新增动画属性 ==========
        
        // 待机呼吸动画
        this.breathTimer = 0;
        this.breathAmount = CHARACTER_ANIMATIONS.IDLE_BREATH.amount;
        this.breathSpeed = CHARACTER_ANIMATIONS.IDLE_BREATH.speed;
        
        // 走路腿部摆动
        this.legSwingTimer = 0;
        this.legSwingAngle = CHARACTER_ANIMATIONS.WALK_LEG_SWING.angle;
        this.legSwingSpeed = CHARACTER_ANIMATIONS.WALK_LEG_SWING.speed;
        
        // 浮动效果
        this.floatTimer = 0;
        this.floatAmount = CHARACTER_ANIMATIONS.FLOAT.amount;
        this.floatSpeed = CHARACTER_ANIMATIONS.FLOAT.speed;
        
        // 受伤倾斜
        this.hurtTiltAngle = 0;
        this.hurtTiltTargetAngle = 0;
        this.hurtTiltDuration = CHARACTER_ANIMATIONS.HURT_TILT.duration;
        this.hurtTiltRecoveryTime = CHARACTER_ANIMATIONS.HURT_TILT.recoveryTime;
        this.hurtTiltTimer = 0;
        this.isHurtTilting = false;
        
        // 攻击手部动作
        this.attackRecoil = 0;
        this.attackRecoilRecovery = CHARACTER_ANIMATIONS.ATTACK_HAND.recoveryTime;
        this.attackRecoilDistance = CHARACTER_ANIMATIONS.ATTACK_HAND.recoilDistance;
        
        // 技能释放动作
        this.skillCastTimer = 0;
        this.skillCastDuration = CHARACTER_ANIMATIONS.SKILL_CAST.duration;
        this.skillCastLeanBack = CHARACTER_ANIMATIONS.SKILL_CAST.leanBack;
        this.isCastingSkill = false;
        
        // 武器动画
        this.weaponRecoilOffset = 0;
        this.weaponRecoilRotation = 0;
        this.weaponSwitchTimer = 0;
        this.weaponSwitchDuration = WEAPON_ANIMATIONS.SWITCH.duration;
        this.isWeaponSwitching = false;
        this.weaponSpinAngle = 0;
        
        // 残影拖尾
        this.afterimageTimer = 0;
        this.afterimageInterval = PARTICLE_EFFECTS.AFTERIMAGE.interval;
        this.lastAfterimageX = 0;
        this.lastAfterimageY = 0;
        
        // 怒气满时的特效
        this.rageFullEffectTimer = 0;
    }
    
    /**
     * 设置角色
     * @param {number} characterId - 角色ID
     */
    setCharacter(characterId) {
        this.characterId = characterId;
        this.character = getCharacterById(characterId);
        
        if (this.character) {
            this.character.init(null); // 游戏引用稍后设置
            this.speed = this.character.speed;
            // 根据角色速度调整最大速度
            this.maxSpeed = this.character.speed * 1.125;
            this.maxRage = this.character.maxRage;
            this.ragePerKill = this.character.ragePerKill;
            this.ragePerHurt = this.character.ragePerHurt;
        }
    }
    
    /**
     * 设置游戏引用
     * @param {Object} game - 游戏逻辑实例
     */
    setGame(game) {
        if (this.character) {
            this.character.game = game;
        }
    }
    
    /**
     * 获取当前角色信息
     */
    getCharacterInfo() {
        if (this.character) {
            return this.character.getInfo();
        }
        return null;
    }
    
    /**
     * 获取怒气百分比
     * @returns {number} 怒气百分比（0-1）
     */
    getRagePercentage() {
        return this.rage / this.maxRage;
    }
    
    /**
     * 添加怒气
     * @param {number} amount - 怒气值
     */
    addRage(amount) {
        this.rage = Math.min(this.rage + amount, this.maxRage);
        this.lastRageTime = Date.now();
    }
    
    /**
     * 消耗怒气
     * @param {number} amount - 怒气值
     * @returns {boolean} 是否成功消耗
     */
    consumeRage(amount) {
        if (this.rage >= amount) {
            this.rage -= amount;
            return true;
        }
        return false;
    }
    
    /**
     * 使用主动技能
     * @param {Object} target - 技能目标
     * @returns {boolean} 是否成功使用
     */
    useSkill(target) {
        if (!this.character) return false;
        
        const skill = this.character.activeSkill;
        if (skill && skill.canUse()) {
            // 根据技能类型传递不同参数
            if (skill instanceof BlinkSkill || skill instanceof ShadowStrikeSkill) {
                skill.use(target);
            } else if (skill instanceof MeteorStrikeSkill || skill instanceof FreezeSkill || 
                       skill instanceof ThunderStrikeSkill || skill instanceof LandmineSkill ||
                       skill instanceof DemolitionSkill || skill instanceof ThornTrapSkill ||
                       skill instanceof PotionBombSkill) {
                skill.use(target);
            } else {
                skill.use();
            }
            
            // 发布技能使用事件
            if (this.eventBus) {
                this.eventBus.publish('SKILL_USED', { skill, player: this });
            }
            
            return true;
        }
        return false;
    }
    
    /**
     * 触发被动技能-受伤回调
     * @param {number} damage - 受到的伤害
     * @returns {number} 实际受到的伤害
     */
    onTakeDamage(damage) {
        if (this.character && this.character.passiveSkill) {
            return this.character.passiveSkill.onTakeDamage(damage);
        }
        return damage;
    }
    
    /**
     * 触发被动技能-攻击回调
     * @param {number} damage - 造成的伤害
     * @param {Object} target - 攻击目标
     * @returns {number} 实际造成的伤害
     */
    onDealDamage(damage, target) {
        let finalDamage = damage * this.damageBonus;
        
        if (this.character && this.character.passiveSkill) {
            finalDamage = this.character.passiveSkill.onDealDamage(finalDamage, target);
        }
        
        return finalDamage;
    }
    
    /**
     * 触发被动技能-击杀回调
     * @param {Object} enemy - 被击杀的敌人
     */
    onKillEnemy(enemy) {
        // 击杀获得怒气
        this.addRage(this.ragePerKill);
        
        if (this.character && this.character.passiveSkill) {
            this.character.passiveSkill.onKillEnemy(enemy);
        }
    }
    
    /**
     * 受伤时增加怒气
     * @param {number} damage - 受到的伤害
     * @param {Object} attacker - 攻击者
     */
    onHurt(damage, attacker) {
        this.addRage(this.ragePerHurt);
        
        // 发布玩家受伤事件
        if (this.eventBus) {
            this.eventBus.publish('PLAYER_HURT', { damage, attacker });
        }
    }
    
    /**
     * 获取玩家位置
     */
    getPosition() {
        return {
            x: this.x,
            y: this.y
        };
    }
    
    /**
     * 设置玩家位置（同时更新渲染位置，避免插值跳动）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.renderX = x;
        this.renderY = y;
    }
    
    /**
     * 移动玩家（旧版兼容方法，直接设置位置）
     * @param {number} dx - X方向移动量
     * @param {number} dy - Y方向移动量
     */
    move(dx, dy) {
        // 应用角色速度加成
        const finalSpeed = this.speed * this.speedBonus;
        
        // 如果有狂暴技能加成
        if (this.character && this.character.activeSkill instanceof BerserkSkill) {
            const berserkSkill = this.character.activeSkill;
            if (berserkSkill.isActive) {
                dx *= berserkSkill.getSpeedMultiplier();
                dy *= berserkSkill.getSpeedMultiplier();
            }
        }
        
        this.x += dx * finalSpeed;
        this.y += dy * finalSpeed;
        
        // 同步渲染位置
        this.renderX = this.x;
        this.renderY = this.y;
    }
    
    /**
     * 更新移动系统（加速度、减速度、摩擦）
     * @param {Object} input - 输入向量 {x, y}
     * @param {number} speedMultiplier - 速度倍率（如狂暴技能）
     * @param {number} deltaTime - 时间增量（毫秒）
     */
    updateMovement(input, speedMultiplier = 1, deltaTime = FRAME_TIME) {
        // 计算当前最大速度
        let currentMaxSpeed = this.maxSpeed * this.speedBonus * speedMultiplier;
        
        // 起步爆发速度检测
        const hasInput = input.x !== 0 || input.y !== 0;
        const wasIdle = this.lastInputX === 0 && this.lastInputY === 0;
        
        if (hasInput && wasIdle) {
            // 从静止开始移动，触发起步爆发
            this.burstTimer = PLAYER.BURST_DURATION;
        }
        
        // 更新爆发计时器
        if (this.burstTimer > 0) {
            this.burstTimer -= deltaTime;
            if (this.burstTimer < 0) this.burstTimer = 0;
        }
        
        // 应用爆发速度倍率
        const burstMultiplier = this.burstTimer > 0 ? PLAYER.BURST_SPEED : 1;
        currentMaxSpeed *= burstMultiplier;
        
        // 计算当前实际加速度（考虑转向灵敏度）
        let accelX = this.acceleration;
        let accelY = this.acceleration;
        
        // 快速变向时的惯性处理 - 如果输入方向与当前速度方向相反，提高减速度
        if (this.velocityX !== 0 && input.x !== 0) {
            const oppositeX = Math.sign(this.velocityX) !== Math.sign(input.x);
            if (oppositeX) {
                // 反向输入，使用转向灵敏度调整加速度
                accelX = this.deceleration * (1 + this.turnSensitivity);
            }
        }
        if (this.velocityY !== 0 && input.y !== 0) {
            const oppositeY = Math.sign(this.velocityY) !== Math.sign(input.y);
            if (oppositeY) {
                accelY = this.deceleration * (1 + this.turnSensitivity);
            }
        }
        
        // X轴加速度计算
        if (input.x !== 0) {
            this.velocityX += input.x * accelX;
            
            if (Math.abs(this.velocityX) > currentMaxSpeed) {
                this.velocityX = Math.sign(this.velocityX) * currentMaxSpeed;
            }
        } else {
            this.velocityX *= this.friction;
            
            if (Math.abs(this.velocityX) < 0.1) {
                this.velocityX = 0;
            }
        }
        
        // Y轴加速度计算
        if (input.y !== 0) {
            this.velocityY += input.y * accelY;
            
            if (Math.abs(this.velocityY) > currentMaxSpeed) {
                this.velocityY = Math.sign(this.velocityY) * currentMaxSpeed;
            }
        } else {
            this.velocityY *= this.friction;
            
            if (Math.abs(this.velocityY) < 0.1) {
                this.velocityY = 0;
            }
        }
        
        // 对角线移动修正
        if (input.x !== 0 && input.y !== 0) {
            // 对角线移动时，速度稍微降低，避免比直线快
            const diagonalFactor = this.diagonalCorrection;
            this.velocityX *= diagonalFactor;
            this.velocityY *= diagonalFactor;
        }
        
        // 应用空气阻力（移动时的微小阻力）
        if (!(input.x === 0 && input.y === 0)) {
            this.velocityX *= this.airResistance;
            this.velocityY *= this.airResistance;
        }
        
        // 更新实际位置
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // 更新渲染位置（插值）
        this.renderX += (this.x - this.renderX) * this.interpolationFactor;
        this.renderY += (this.y - this.renderY) * this.interpolationFactor;
        
        // 保存上一帧输入
        this.lastInputX = input.x;
        this.lastInputY = input.y;
        
        // 更新走路动画
        this.updateWalkAnimation();
    }
    
    /**
     * 更新走路动画（摆动和倾斜）
     */
    updateWalkAnimation() {
        // 计算当前速度大小
        const speed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
        
        if (speed > 0.5) {
            // 移动时，更新摆动计时器
            this.walkBobTimer += speed * this.walkBobSpeed;
            
            // 计算目标倾斜角度（与X方向速度相关）
            const targetTilt = Math.max(-this.maxTilt, Math.min(this.maxTilt, this.velocityX * 0.02));
            
            // 平滑过渡倾斜角度
            this.tiltAngle += (targetTilt - this.tiltAngle) * this.tiltSpeed;
        } else {
            // 静止时，倾斜角度逐渐归零
            this.tiltAngle *= 0.9;
            
            // 角度很小时直接归零
            if (Math.abs(this.tiltAngle) < 0.001) {
                this.tiltAngle = 0;
            }
        }
    }
    
    /**
     * 获取走路摆动偏移量
     * @returns {number} Y轴偏移量
     */
    getWalkBobOffset() {
        return Math.sin(this.walkBobTimer) * this.walkBobAmount;
    }
    
    /**
     * 获取渲染位置（带摆动）
     * @returns {Object} 渲染坐标 {x, y}
     */
    getRenderPosition() {
        return {
            x: this.renderX,
            y: this.renderY + this.getWalkBobOffset()
        };
    }
    
    /**
     * 立即停止移动（用于碰撞等情况）
     * @param {boolean} stopX - 是否停止X轴
     * @param {boolean} stopY - 是否停止Y轴
     */
    stopMovement(stopX = true, stopY = true) {
        if (stopX) {
            this.velocityX = 0;
        }
        if (stopY) {
            this.velocityY = 0;
        }
    }
    
    /**
     * 施加一个冲量（用于技能、击退等）
     * @param {number} impulseX - X方向冲量
     * @param {number} impulseY - Y方向冲量
     */
    applyImpulse(impulseX, impulseY) {
        this.velocityX += impulseX;
        this.velocityY += impulseY;
    }
    
    /**
     * 更新玩家状态
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {boolean} isInvincible - 是否处于无敌状态
     */
    update(deltaTime, isInvincible) {
        // 更新动画
        this.updateAnimation(deltaTime);
        
        // 更新受伤闪白
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= deltaTime;
            if (this.hitFlashTimer < 0) {
                this.hitFlashTimer = 0;
            }
        }
        
        // 更新击退效果
        this.updateKnockback(deltaTime);
        
        // 更新无敌闪烁状态
        if (isInvincible) {
            this.flashTimer += deltaTime;
            if (this.flashTimer >= this.flashInterval) {
                this.flashTimer = 0;
                this.visible = !this.visible;
            }
        } else {
            this.visible = true;
            this.flashTimer = 0;
        }
        
        // 更新角色系统
        if (this.character) {
            this.character.update(deltaTime);
        }
        
        // 怒气衰减
        const timeSinceRage = Date.now() - this.lastRageTime;
        if (timeSinceRage > RAGE.DECAY_DELAY && this.rage > 0) {
            this.rage = Math.max(0, this.rage - RAGE.DECAY_RATE * (deltaTime / 1000));
        }
    }
    
    /**
     * 触发受伤闪白
     */
    triggerHitFlash() {
        this.hitFlashTimer = this.hitFlashDuration;
    }
    
    /**
     * 应用击退效果
     * @param {Object} direction - 击退方向 {x, y}
     * @param {number} force - 击退力度
     */
    applyKnockback(direction, force) {
        if (direction && force > 0) {
            this.knockbackX = direction.x * force;
            this.knockbackY = direction.y * force;
            this.knockbackTimer = FEEDBACK.KNOCKBACK.RECOVERY_TIME;
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
     * 更新玩家动画
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updateAnimation(deltaTime) {
        this.animTimer += deltaTime;
        
        const fps = this.animState === 'move' 
            ? ANIMATION.MOVE.fps 
            : ANIMATION.STAND.fps;
        
        const frameTime = 1000 / fps;
        
        if (this.animTimer >= frameTime) {
            this.animTimer = 0;
            this.animFrame++;
            
            // 动画帧数重置
            const frameCount = this.animState === 'move' ? 4 : 1;
            if (this.animFrame >= frameCount) {
                this.animFrame = 0;
            }
        }
        
        // ========== 新增动画更新 ==========
        
        // 待机呼吸动画
        if (this.animState === 'idle') {
            this.breathTimer += deltaTime * this.breathSpeed;
        }
        
        // 浮动效果
        this.floatTimer += deltaTime * this.floatSpeed;
        
        // 走路腿部摆动
        if (this.animState === 'move') {
            this.legSwingTimer += deltaTime * this.legSwingSpeed;
        }
        
        // 受伤倾斜恢复
        if (this.isHurtTilting) {
            this.hurtTiltTimer += deltaTime;
            if (this.hurtTiltTimer < this.hurtTiltDuration) {
                // 倾斜阶段
                const progress = this.hurtTiltTimer / this.hurtTiltDuration;
                this.hurtTiltAngle = this.hurtTiltTargetAngle * Math.sin(progress * Math.PI);
            } else if (this.hurtTiltTimer < this.hurtTiltDuration + this.hurtTiltRecoveryTime) {
                // 恢复阶段
                const progress = (this.hurtTiltTimer - this.hurtTiltDuration) / this.hurtTiltRecoveryTime;
                this.hurtTiltAngle = this.hurtTiltTargetAngle * (1 - progress);
            } else {
                this.hurtTiltAngle = 0;
                this.isHurtTilting = false;
                this.hurtTiltTimer = 0;
            }
        }
        
        // 攻击后坐力恢复
        if (this.attackRecoil > 0) {
            const recoilDecay = deltaTime / this.attackRecoilRecovery;
            this.attackRecoil = Math.max(0, this.attackRecoil - recoilDecay * this.attackRecoilDistance);
        }
        
        // 武器后坐力恢复
        if (this.weaponRecoilOffset > 0 || this.weaponRecoilRotation > 0) {
            const weaponRecoilDecay = deltaTime / WEAPON_ANIMATIONS.RECOIL.recoveryTime;
            this.weaponRecoilOffset = Math.max(0, this.weaponRecoilOffset - weaponRecoilDecay * WEAPON_ANIMATIONS.RECOIL.distance);
            this.weaponRecoilRotation = Math.max(0, this.weaponRecoilRotation - weaponRecoilDecay * WEAPON_ANIMATIONS.RECOIL.rotation);
        }
        
        // 技能释放动作
        if (this.isCastingSkill) {
            this.skillCastTimer += deltaTime;
            if (this.skillCastTimer >= this.skillCastDuration) {
                this.isCastingSkill = false;
                this.skillCastTimer = 0;
            }
        }
        
        // 武器切换动画
        if (this.isWeaponSwitching) {
            this.weaponSwitchTimer += deltaTime;
            this.weaponSpinAngle = (this.weaponSwitchTimer / this.weaponSwitchDuration) * WEAPON_ANIMATIONS.SWITCH.rotateAngle;
            if (this.weaponSwitchTimer >= this.weaponSwitchDuration) {
                this.isWeaponSwitching = false;
                this.weaponSwitchTimer = 0;
                this.weaponSpinAngle = 0;
            }
        }
        
        // 怒气满特效计时
        if (this.rage >= this.maxRage) {
            this.rageFullEffectTimer += deltaTime;
        }
    }
    
    /**
     * 触发受伤倾斜动画
     * @param {number} directionX - 伤害来源方向X
     */
    triggerHurtTilt(directionX = 1) {
        this.isHurtTilting = true;
        this.hurtTiltTimer = 0;
        this.hurtTiltTargetAngle = CHARACTER_ANIMATIONS.HURT_TILT.angle * (directionX > 0 ? -1 : 1);
    }
    
    /**
     * 触发攻击后坐力动画
     */
    triggerAttackRecoil() {
        this.attackRecoil = this.attackRecoilDistance;
        this.weaponRecoilOffset = WEAPON_ANIMATIONS.RECOIL.distance;
        this.weaponRecoilRotation = WEAPON_ANIMATIONS.RECOIL.rotation;
    }
    
    /**
     * 触发技能释放动画
     */
    triggerSkillCast() {
        this.isCastingSkill = true;
        this.skillCastTimer = 0;
    }
    
    /**
     * 触发武器切换动画
     */
    triggerWeaponSwitch() {
        this.isWeaponSwitching = true;
        this.weaponSwitchTimer = 0;
        this.weaponSpinAngle = 0;
    }
    
    /**
     * 获取呼吸动画偏移量
     * @returns {number} Y轴偏移量
     */
    getBreathOffset() {
        return Math.sin(this.breathTimer) * this.breathAmount;
    }
    
    /**
     * 获取浮动动画偏移量
     * @returns {number} Y轴偏移量
     */
    getFloatOffset() {
        return Math.sin(this.floatTimer) * this.floatAmount;
    }
    
    /**
     * 获取腿部摆动角度
     * @returns {number} 摆动角度（弧度）
     */
    getLegSwingAngle() {
        return Math.sin(this.legSwingTimer) * this.legSwingAngle;
    }
    
    /**
     * 获取技能释放后仰偏移
     * @returns {number} Y轴偏移量
     */
    getSkillCastOffset() {
        if (!this.isCastingSkill) return 0;
        const progress = this.skillCastTimer / this.skillCastDuration;
        return Math.sin(progress * Math.PI) * this.skillCastLeanBack;
    }
    
    /**
     * 设置动画状态
     * @param {string} state - 动画状态
     */
    setAnimState(state) {
        if (this.animState !== state) {
            this.animState = state;
            this.animFrame = 0;
            this.animTimer = 0;
        }
    }
    
    /**
     * 获取玩家边界框（使用实际位置，用于碰撞检测）
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
     * 检查玩家是否死亡
     */
    isDead() {
        return this.playerState === 'dead';
    }
    
    /**
     * 设置玩家死亡状态
     */
    setDead() {
        this.playerState = 'dead';
        this.visible = true;
    }
    
    /**
     * 重置玩家状态
     */
    reset() {
        this.playerState = 'normal';
        this.visible = true;
        this.flashTimer = 0;
        this.animState = 'idle';
        this.animFrame = 0;
        this.animTimer = 0;
        this.rage = 0;
        this.lastRageTime = 0;
        this.damageBonus = 1;
        this.defenseBonus = 1;
        this.speedBonus = 1;
        
        // 重置移动系统
        this.velocityX = 0;
        this.velocityY = 0;
        this.renderX = this.x;
        this.renderY = this.y;
        this.walkBobTimer = 0;
        this.tiltAngle = 0;
        
        // 重置后坐力
        this.recoilOffsetX = 0;
        this.recoilOffsetY = 0;
        this.recoilTimer = 0;
        
        // 重置角色技能
        if (this.character) {
            this.character.reset();
        }
    }
}
