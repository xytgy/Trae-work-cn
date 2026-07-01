/**
 * Boss类
 * 大型紫色地牢守护者
 */

class Boss {
    constructor(x, y, { eventBus } = {}) {
        // 事件总线
        this.eventBus = eventBus;
        
        // 位置
        this.x = x;
        this.y = y;
        
        // 尺寸
        this.size = BOSS.SIZE;
        
        // 生命值
        this.health = BOSS.HEALTH;
        this.maxHealth = BOSS.HEALTH;
        
        // 移动速度
        this.speed = BOSS.SPEED;
        
        // 伤害
        this.damage = BOSS.DAMAGE;
        
        // 存活状态
        this.alive = true;
        
        // 受伤状态
        this.isHurt = false;
        this.hurtTimer = 0;
        
        // 当前阶段
        this.phase = 1;
        
        // 攻击计时器
        this.attackTimer = 0;
        this.attackCooldown = BOSS.PHASE1.ATTACK_COOLDOWN;
        
        // 阶段2召唤计时器
        this.summonTimer = 0;
        
        // 阶段3激光攻击
        this.laserActive = false;
        this.laserTimer = 0;
        this.laserWarning = false;
        this.laserAngle = 0;
        
        // 动画
        this.animFrame = 0;
        this.animTimer = 0;
        
        // 颜色
        this.color = COLORS.ENEMY.BOSS;
        
        // ========== 闪避行为状态 ==========
        this.isDodging = false;           // 是否正在闪避
        this.dodgeTimer = 0;              // 闪避计时器
        this.dodgeCooldown = 0;           // 闪避冷却
        this.dodgeDirection = { x: 0, y: 0 }; // 闪避方向
        
        // ========== 冲锋行为状态 ==========
        this.isCharging = false;          // 是否正在冲锋
        this.chargeWarning = false;       // 冲锋预警中
        this.chargeTimer = 0;             // 冲锋计时器
        this.chargeCooldown = 0;          // 冲锋冷却
        this.chargeDirection = { x: 0, y: 0 }; // 冲锋方向
        this.isStunned = false;           // 硬直状态
        this.stunTimer = 0;               // 硬直计时器
        
        // ========== 回血行为状态 ==========
        this.isHealing = false;           // 是否正在回血蓄力
        this.healTimer = 0;               // 蓄力计时器
        this.healCooldown = 0;            // 回血冷却
        this.healDamageTaken = 0;         // 蓄力期间受到的伤害
        
        // ========== 召唤特效 ==========
        this.summonEffects = [];          // 召唤特效列表
        this.summonTokens = [];           // 召唤取消令牌
        
        // ========== 阶段3混合攻击计时器 ==========
        this.spreadshotTimer = 0;         // 阶段3散弹计时器
        this.phase3SummonTimer = 0;       // 阶段3召唤计时器
        
        // 击中闪白
        this.hitFlashTimer = 0;
        this.hitFlashDuration = FEEDBACK.HIT_FLASH.ENEMY_DURATION;
        
        // 击退效果（Boss击退较弱）
        this.knockbackX = 0;
        this.knockbackY = 0;
        this.knockbackTimer = 0;
        
        // ========== 新增Boss特效属性 ==========
        
        // 呼吸动画
        this.breathTimer = 0;
        this.breathSpeed = 0.003;
        this.breathAmount = 0.05;
        
        // 浮动动画
        this.floatTimer = 0;
        this.floatSpeed = 0.002;
        this.floatAmount = 3;
        
        // 阶段转换
        this.isPhaseTransitioning = false;
        this.phaseTransitionTimer = 0;
        this.phaseTransitionDuration = 1500;
        this.oldPhase = 1;
        
        // 死亡特效
        this.isDying = false;
        this.deathTimer = 0;
        this.deathDuration = 2000;
        this.deathExplosionCount = 0;
        
        // 愤怒脉动
        this.ragePulseTimer = 0;
        this.ragePulseSpeed = 0.005;
        
        // 激光预警圈
        this.laserWarningTimer = 0;
        
        // 受击震动
        this.hitShakeTimer = 0;
        this.hitShakeIntensity = 3;
        this.hitShakeDuration = 100;
        
        // 旋转光环
        this.auraRotation = 0;
        this.auraSpeed = 0.002;
    }
    
    /**
     * 更新Boss
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {Player} player - 玩家引用
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    update(deltaTime, player, gameLogic) {
        // 死亡动画
        if (!this.alive) {
            if (this.isDying) {
                this.updateDeath(deltaTime, gameLogic);
            }
            return;
        }
        
        // 更新呼吸和浮动动画
        this.breathTimer += deltaTime * this.breathSpeed;
        this.floatTimer += deltaTime * this.floatSpeed;
        this.ragePulseTimer += deltaTime * this.ragePulseSpeed;
        this.auraRotation += deltaTime * this.auraSpeed;
        
        // 阶段转换动画
        if (this.isPhaseTransitioning) {
            this.updatePhaseTransition(deltaTime, gameLogic);
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
        
        // 受击震动
        if (this.hitShakeTimer > 0) {
            this.hitShakeTimer -= deltaTime;
        }
        
        // 更新击退效果
        this.updateKnockback(deltaTime);
        
        // 更新冷却计时器
        this.updateCooldowns(deltaTime);
        
        // 更新召唤特效
        this.updateSummonEffects(deltaTime, gameLogic);
        
        // 检查阶段变化
        this.checkPhaseChange();
        
        // 更新动画
        this.updateAnimation(deltaTime);
        
        // 检测玩家子弹并尝试闪避
        this.tryDodge(player, gameLogic);
        
        // 根据阶段执行行为
        if (!this.isPhaseTransitioning) {
            this.executePhaseBehavior(deltaTime, player, gameLogic);
        }
    }
    
    /**
     * 更新各种冷却计时器
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updateCooldowns(deltaTime) {
        // 闪避冷却
        if (this.dodgeCooldown > 0) {
            this.dodgeCooldown -= deltaTime;
        }
        
        // 冲锋冷却
        if (this.chargeCooldown > 0) {
            this.chargeCooldown -= deltaTime;
        }
        
        // 回血冷却
        if (this.healCooldown > 0) {
            this.healCooldown -= deltaTime;
        }
        
        // 硬直计时器
        if (this.isStunned) {
            this.stunTimer -= deltaTime;
            if (this.stunTimer <= 0) {
                this.isStunned = false;
            }
        }
    }
    
    /**
     * 检查阶段变化
     */
    checkPhaseChange() {
        if (this.isPhaseTransitioning) return;
        
        const healthPercent = this.health / this.maxHealth;
        
        if (healthPercent <= BOSS.PHASE2.HEALTH_THRESHOLD && this.phase === 1) {
            this.startPhaseTransition(2);
            console.log('Boss进入阶段2: 狂暴状态');
        }
        
        if (healthPercent <= BOSS.PHASE3.HEALTH_THRESHOLD && this.phase === 2) {
            this.startPhaseTransition(3);
            console.log('Boss进入阶段3: 最终状态');
        }
    }
    
    /**
     * 开始阶段转换
     * @param {number} newPhase - 新阶段
     */
    startPhaseTransition(newPhase) {
        this.isPhaseTransitioning = true;
        this.phaseTransitionTimer = 0;
        this.oldPhase = this.phase;
        this.phase = newPhase;
        
        // 触发粒子特效
        if (typeof particleSystem !== 'undefined' && particleSystem.createPhaseTransition) {
            particleSystem.createPhaseTransition(this.x, this.y, newPhase);
        }
    }
    
    /**
     * 更新阶段转换
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    updatePhaseTransition(deltaTime, gameLogic) {
        this.phaseTransitionTimer += deltaTime;
        
        // 阶段转换期间持续生成粒子
        if (this.phaseTransitionTimer % 100 < deltaTime && typeof particleSystem !== 'undefined') {
            if (particleSystem.createExplosion) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 25 + Math.random() * 10;
                particleSystem.createExplosion(
                    this.x + Math.cos(angle) * dist,
                    this.y + Math.sin(angle) * dist,
                    5,
                    this.phase === 2 ? '#ff6600' : '#ffff00'
                );
            }
        }
        
        if (this.phaseTransitionTimer >= this.phaseTransitionDuration) {
            this.isPhaseTransitioning = false;
            
            // 应用阶段属性
            if (this.phase === 2) {
                this.attackCooldown = BOSS.PHASE1.ATTACK_COOLDOWN * 0.8;
                this.chargeCooldown = BOSS.PHASE2.CHARGE_COOLDOWN / 2;
            } else if (this.phase === 3) {
                this.attackCooldown = BOSS.PHASE1.ATTACK_COOLDOWN * 0.6;
                this.spreadshotTimer = BOSS.PHASE3.SPREADSHOT_COOLDOWN;
                this.phase3SummonTimer = BOSS.PHASE3.SUMMON_INTERVAL;
            }
        }
    }
    
    /**
     * 执行当前阶段行为
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {Player} player - 玩家引用
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    executePhaseBehavior(deltaTime, player, gameLogic) {
        // 如果在硬直状态，不执行任何行为
        if (this.isStunned) return;
        
        // 如果正在回血，不执行其他行为
        if (this.isHealing) {
            this.updateHealing(deltaTime);
            return;
        }
        
        // 更新冲锋状态（优先级高于移动和普通攻击）
        if (this.isCharging || this.chargeWarning) {
            this.updateCharge(deltaTime, player, gameLogic);
            return;
        }
        
        // 更新闪避状态
        if (this.isDodging) {
            this.updateDodge(deltaTime, gameLogic);
            return;
        }
        
        // 阶段2及以上尝试冲锋
        if (this.phase >= 2 && this.chargeCooldown <= 0 && !this.chargeWarning && !this.isCharging) {
            this.startCharge(player);
            return;
        }
        
        // 阶段3检查回血
        if (this.phase === 3 && this.health <= BOSS.PHASE3.HEAL_THRESHOLD && 
            this.healCooldown <= 0 && !this.isHealing) {
            this.startHealing();
            return;
        }
        
        // 移动向玩家
        this.moveTowardsPlayer(player);
        
        // 更新攻击计时器
        this.attackTimer += deltaTime;
        
        // 阶段1: 散弹攻击
        if (this.phase === 1) {
            if (this.attackTimer >= this.attackCooldown) {
                this.attackTimer = 0;
                this.spreadshotAttack(gameLogic);
            }
        }
        
        // 阶段2: 狂暴状态 + 召唤小怪
        if (this.phase === 2) {
            if (this.attackTimer >= this.attackCooldown) {
                this.attackTimer = 0;
                this.spreadshotAttack(gameLogic);
            }
            
            // 召唤小怪
            this.summonTimer += deltaTime;
            if (this.summonTimer >= BOSS.PHASE2.SUMMON_INTERVAL) {
                this.summonTimer = 0;
                this.summonEnemies(player, gameLogic);
            }
        }
        
        // 阶段3: 混合攻击模式（激光 + 散弹 + 召唤）
        if (this.phase === 3) {
            // 激光攻击
            if (this.attackTimer >= BOSS.PHASE3.LASER_INTERVAL) {
                this.attackTimer = 0;
                this.laserAttack(gameLogic);
            }
            
            // 更新激光状态
            this.updateLaser(deltaTime, player, gameLogic);
            
            // 散弹攻击（频率降低）
            this.spreadshotTimer += deltaTime;
            if (this.spreadshotTimer >= BOSS.PHASE3.SPREADSHOT_COOLDOWN) {
                this.spreadshotTimer = 0;
                this.spreadshotAttack(gameLogic);
            }
            
            // 召唤小怪（频率降低）
            this.phase3SummonTimer += deltaTime;
            if (this.phase3SummonTimer >= BOSS.PHASE3.SUMMON_INTERVAL) {
                this.phase3SummonTimer = 0;
                this.summonEnemies(player, gameLogic);
            }
        }
    }
    
    /**
     * 尝试闪避玩家子弹
     * @param {Player} player - 玩家引用
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    tryDodge(player, gameLogic) {
        // 如果正在闪避、冲锋、硬直或回血，不触发新的闪避
        if (this.isDodging || this.isCharging || this.chargeWarning || 
            this.isStunned || this.isHealing) {
            return;
        }
        
        // 冷却中
        if (this.dodgeCooldown > 0) return;
        
        // 检查是否有子弹射向Boss
        const bullets = gameLogic.bullets;
        let threateningBullet = null;
        
        for (let i = 0; i < bullets.length; i++) {
            const bullet = bullets[i];
            if (bullet.isEnemyBullet || !bullet.active) continue;
            
            // 计算子弹是否朝向Boss
            const dx = this.x - bullet.x;
            const dy = this.y - bullet.y;
            const distToBoss = Math.sqrt(dx * dx + dy * dy);
            
            // 只检测一定范围内的子弹
            if (distToBoss > 150) continue;
            
            // 计算子弹方向与Boss的夹角
            const bulletAngle = Math.atan2(bullet.dirY, bullet.dirX);
            const angleToBoss = Math.atan2(dy, dx);
            const angleDiff = Math.abs(bulletAngle - angleToBoss);
            
            // 如果子弹大致朝向Boss
            if (angleDiff < 0.5 || angleDiff > Math.PI * 2 - 0.5) {
                threateningBullet = bullet;
                break;
            }
        }
        
        // 有威胁的子弹，按概率闪避
        if (threateningBullet && Math.random() < BOSS.DODGE.PROBABILITY) {
            this.performDodge(threateningBullet, gameLogic);
        }
    }
    
    /**
     * 执行闪避
     * @param {Bullet} bullet - 威胁子弹
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    performDodge(bullet, gameLogic) {
        this.isDodging = true;
        this.dodgeTimer = BOSS.DODGE.DURATION;
        this.dodgeCooldown = BOSS.DODGE.COOLDOWN;
        
        // 计算垂直于子弹方向的闪避方向（向左或向右）
        const bulletAngle = Math.atan2(bullet.dirY, bullet.dirX);
        // 随机选择向左或向右闪避（垂直于子弹方向）
        const side = Math.random() < 0.5 ? -1 : 1;
        const dodgeAngle = bulletAngle + side * Math.PI / 2;
        
        this.dodgeDirection = {
            x: Math.cos(dodgeAngle),
            y: Math.sin(dodgeAngle)
        };
        
        // 生成残影粒子
        this.spawnAfterimageParticles(gameLogic);
    }
    
    /**
     * 更新闪避状态
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    updateDodge(deltaTime, gameLogic) {
        this.dodgeTimer -= deltaTime;
        
        // 定期生成残影
        if (!this.lastAfterimageTime) this.lastAfterimageTime = 0;
        this.lastAfterimageTime += deltaTime;
        
        if (this.lastAfterimageTime > 100) {
            this.lastAfterimageTime = 0;
            this.spawnAfterimageParticles(gameLogic);
        }
        
        // 移动
        const dodgeSpeed = this.speed * BOSS.DODGE.SPEED_MULTIPLIER;
        this.x += this.dodgeDirection.x * dodgeSpeed;
        this.y += this.dodgeDirection.y * dodgeSpeed;
        
        // 边界限制
        const margin = LEVELS.WALL_THICKNESS + this.size / 2;
        this.x = Math.max(margin, Math.min(GAME_WIDTH - margin, this.x));
        this.y = Math.max(margin, Math.min(GAME_HEIGHT - margin, this.y));
        
        // 闪避结束
        if (this.dodgeTimer <= 0) {
            this.isDodging = false;
            this.lastAfterimageTime = 0;
        }
    }
    
    /**
     * 开始冲锋
     * @param {Player} player - 玩家引用
     */
    startCharge(player) {
        this.chargeWarning = true;
        this.chargeTimer = BOSS.PHASE2.CHARGE_WARNING;
        
        // 记录冲锋方向（朝向玩家当前位置）
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.chargeDirection = {
                x: dx / dist,
                y: dy / dist
            };
        }
    }
    
    /**
     * 更新冲锋状态
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {Player} player - 玩家引用
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    updateCharge(deltaTime, player, gameLogic) {
        this.chargeTimer -= deltaTime;
        
        // 预警阶段
        if (this.chargeWarning) {
            // 预警期间不移动
            if (this.chargeTimer <= 0) {
                // 预警结束，开始冲锋
                this.chargeWarning = false;
                this.isCharging = true;
                this.chargeTimer = BOSS.PHASE2.CHARGE_DURATION;
            }
            return;
        }
        
        // 冲锋阶段
        if (this.isCharging) {
            const chargeSpeed = this.speed * BOSS.PHASE2.CHARGE_SPEED_MULTIPLIER;
            this.x += this.chargeDirection.x * chargeSpeed;
            this.y += this.chargeDirection.y * chargeSpeed;
            
            // 边界限制
            const margin = LEVELS.WALL_THICKNESS + this.size / 2;
            this.x = Math.max(margin, Math.min(GAME_WIDTH - margin, this.x));
            this.y = Math.max(margin, Math.min(GAME_HEIGHT - margin, this.y));
            
            // 冲锋结束
            if (this.chargeTimer <= 0) {
                this.isCharging = false;
                this.chargeCooldown = BOSS.PHASE2.CHARGE_COOLDOWN;
                // 硬直
                this.isStunned = true;
                this.stunTimer = BOSS.PHASE2.CHARGE_STUN_DURATION;
            }
        }
    }
    
    /**
     * 开始回血蓄力
     */
    startHealing() {
        this.isHealing = true;
        this.healTimer = BOSS.PHASE3.HEAL_CHARGE_TIME;
        this.healDamageTaken = 0;
    }
    
    /**
     * 更新回血状态
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updateHealing(deltaTime) {
        this.healTimer -= deltaTime;
        
        // 蓄力完成
        if (this.healTimer <= 0) {
            this.isHealing = false;
            this.healCooldown = BOSS.PHASE3.HEAL_COOLDOWN;
            
            // 恢复生命值
            this.health = Math.min(this.health + BOSS.PHASE3.HEAL_AMOUNT, this.maxHealth);
            console.log(`Boss恢复了${BOSS.PHASE3.HEAL_AMOUNT}点生命值`);
        }
    }
    
    /**
     * 召唤敌人（优化召唤位置）
     * @param {Player} player - 玩家引用
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    summonEnemies(player, gameLogic) {
        const count = BOSS.PHASE2.SUMMON_COUNT;
        
        for (let i = 0; i < count; i++) {
            // 确定召唤位置
            const rand = Math.random();
            let spawnX, spawnY;
            
            if (rand < BOSS.SUMMON_POSITION.BEHIND_PLAYER) {
                // 玩家背后召唤
                const playerAngle = Math.atan2(player.y - this.y, player.x - this.x);
                const behindAngle = playerAngle + Math.PI;
                const dist = 80 + Math.random() * 40;
                spawnX = player.x + Math.cos(behindAngle) * dist;
                spawnY = player.y + Math.sin(behindAngle) * dist;
            } else if (rand < BOSS.SUMMON_POSITION.BEHIND_PLAYER + BOSS.SUMMON_POSITION.SIDE_PLAYER) {
                // 玩家两侧召唤
                const side = Math.random() < 0.5 ? -1 : 1;
                const playerAngle = Math.atan2(player.y - this.y, player.x - this.x);
                const sideAngle = playerAngle + side * Math.PI / 2;
                const dist = 80 + Math.random() * 40;
                spawnX = player.x + Math.cos(sideAngle) * dist;
                spawnY = player.y + Math.sin(sideAngle) * dist;
            } else {
                // Boss身边召唤
                const angle = Math.random() * Math.PI * 2;
                const dist = 100 + Math.random() * 50;
                spawnX = this.x + Math.cos(angle) * dist;
                spawnY = this.y + Math.sin(angle) * dist;
            }
            
            // 确保在房间内
            const margin = LEVELS.WALL_THICKNESS + 20;
            spawnX = Math.max(margin, Math.min(GAME_WIDTH - margin, spawnX));
            spawnY = Math.max(margin, Math.min(GAME_HEIGHT - margin, spawnY));
            
            // 创建取消令牌
            const cancelToken = { cancelled: false };
            this.summonTokens.push(cancelToken);
            
            // 添加召唤特效
            this.summonEffects.push({
                x: spawnX,
                y: spawnY,
                timer: BOSS.SUMMON_POSITION.EFFECT_DURATION,
                cancelToken: cancelToken
            });
            
            // 延迟生成小怪（等特效出现后）
            setTimeout(() => {
                // 检查是否被取消
                if (cancelToken.cancelled) return;
                if (!this.alive) return;
                
                const slime = new Slime(spawnX, spawnY);
                slime.isSummoned = true;
                slime.fadeIn = true;
                slime.fadeInTimer = BOSS.SUMMON_POSITION.FADE_IN_DURATION;
                
                gameLogic.enemies.push(slime);
            }, BOSS.SUMMON_POSITION.EFFECT_DURATION);
        }
        
        console.log(`Boss召唤了${count}个小怪`);
    }
    
    /**
     * 更新召唤特效
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    updateSummonEffects(deltaTime, gameLogic) {
        for (let i = this.summonEffects.length - 1; i >= 0; i--) {
            const effect = this.summonEffects[i];
            effect.timer -= deltaTime;
            
            // 生成光柱粒子
            if (effect.timer > 0) {
                const particleCount = 2;
                for (let j = 0; j < particleCount; j++) {
                    gameLogic.particles.push(new Particle(
                        effect.x + (Math.random() - 0.5) * 20,
                        effect.y + (Math.random() - 0.5) * 40,
                        0,
                        -1 - Math.random() * 2,
                        '#9c27b0',
                        3 + Math.random() * 3,
                        200 + Math.random() * 200
                    ));
                }
            }
            
            // 特效结束
            if (effect.timer <= 0) {
                this.summonEffects.splice(i, 1);
            }
        }
    }
    
    /**
     * 向玩家移动
     * @param {Player} player - 玩家引用
     */
    moveTowardsPlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            let speed = this.speed;
            
            // 阶段2增加速度
            if (this.phase >= 2) {
                speed *= BOSS.PHASE2.SPEED_MULTIPLIER;
            }
            
            this.x += (dx / dist) * speed;
            this.y += (dy / dist) * speed;
        }
        
        // 边界限制
        const margin = LEVELS.WALL_THICKNESS + this.size / 2;
        this.x = Math.max(margin, Math.min(GAME_WIDTH - margin, this.x));
        this.y = Math.max(margin, Math.min(GAME_HEIGHT - margin, this.y));
    }
    
    /**
     * 散弹攻击
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    spreadshotAttack(gameLogic) {
        const bulletCount = BOSS.PHASE1.BULLET_COUNT;
        const bulletSpeed = BOSS.PHASE1.BULLET_SPEED;
        
        // 播放Boss攻击音效
        audioManager.playSound(AUDIO.BOSS_ATTACK);
        
        for (let i = 0; i < bulletCount; i++) {
            // 计算散开角度
            const angle = (i / bulletCount) * Math.PI * 2;
            
            const bullet = new Bullet(
                this.x,
                this.y,
                Math.cos(angle),
                Math.sin(angle),
                {
                    damage: 1,
                    speed: bulletSpeed,
                    isEnemyBullet: true,
                    color: '#ff1744'
                }
            );
            bullet.isEnemyBullet = true;
            gameLogic.bullets.push(bullet);
        }
    }
    
    /**
     * 激光攻击
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    laserAttack(gameLogic) {
        // 开始激光预警
        this.laserActive = true;
        this.laserWarning = true;
        this.laserTimer = BOSS.PHASE3.LASER_WARNING;
        
        // 播放Boss攻击音效
        audioManager.playSound(AUDIO.BOSS_ATTACK);
        
        // 计算激光角度（朝向玩家）
        const dx = gameLogic.player.x - this.x;
        const dy = gameLogic.player.y - this.y;
        this.laserAngle = Math.atan2(dy, dx);
    }
    
    /**
     * 更新激光状态
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {Player} player - 玩家引用
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    updateLaser(deltaTime, player, gameLogic) {
        if (!this.laserActive) return;
        
        this.laserTimer -= deltaTime;
        
        if (this.laserTimer <= 0) {
            if (this.laserWarning) {
                // 预警结束，开始激光
                this.laserWarning = false;
                this.laserTimer = BOSS.PHASE3.LASER_DURATION;
                
                // 持续激光伤害
                this.laserDamageTimer = 0;
            } else {
                // 激光结束
                this.laserActive = false;
                this.laserTimer = 0;
            }
        }
        
        // 激光预警阶段生成预警粒子
        if (this.laserWarning && this.laserActive) {
            this.laserWarningParticleTimer = (this.laserWarningParticleTimer || 0) + deltaTime;
            
            // 每50毫秒生成一批预警粒子
            if (this.laserWarningParticleTimer >= 50) {
                this.laserWarningParticleTimer = 0;
                this.spawnLaserWarningParticles(gameLogic);
            }
        }
        
        // 激光持续期间造成伤害
        if (!this.laserWarning && this.laserActive) {
            this.laserDamageTimer = (this.laserDamageTimer || 0) + deltaTime;
            
            // 每0.2秒造成一次伤害
            if (this.laserDamageTimer >= 200) {
                this.laserDamageTimer = 0;
                
                // 检查玩家是否在激光范围内
                if (this.checkLaserHit(player)) {
                    if (!gameState.getData().isInvincible) {
                        gameState.playerHurt(BOSS.PHASE3.DAMAGE_PER_TICK);
                    }
                }
            }
        }
    }
    
    /**
     * 生成激光预警粒子
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    spawnLaserWarningParticles(gameLogic) {
        const config = PARTICLES.TYPES.LASER_WARNING;
        const count = Math.floor(config.countMin + Math.random() * (config.countMax - config.countMin));
        const length = 1000; // 激光长度
        
        for (let i = 0; i < count; i++) {
            const t = Math.random();
            const x = this.x + Math.cos(this.laserAngle) * length * t;
            const y = this.y + Math.sin(this.laserAngle) * length * t;
            const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
            const lifetime = config.lifetimeMin + Math.random() * (config.lifetimeMax - config.lifetimeMin);
            const color = config.colors[Math.floor(Math.random() * config.colors.length)];
            
            // 添加一些垂直于激光的偏移
            const perpAngle = this.laserAngle + Math.PI / 2;
            const offset = (Math.random() - 0.5) * 20;
            const px = x + Math.cos(perpAngle) * offset;
            const py = y + Math.sin(perpAngle) * offset;
            
            const particle = new Particle(
                px, py,
                0, 0,
                color,
                size,
                lifetime
            );
            
            particle.setKind(PARTICLES.KIND.CIRCLE);
            particle.enableFlicker(config.flickerSpeed);
            particle.disableShrink();
            
            gameLogic.particles.push(particle);
        }
    }
    
    /**
     * 检查玩家是否被激光击中
     * @param {Player} player - 玩家引用
     */
    checkLaserHit(player) {
        const laserWidth = BOSS.PHASE3.LASER_WIDTH;
        
        const laserStartX = this.x;
        const laserStartY = this.y;
        
        const laserDirX = Math.cos(this.laserAngle);
        const laserDirY = Math.sin(this.laserAngle);
        
        const px = player.x;
        const py = player.y;
        
        const dx = px - laserStartX;
        const dy = py - laserStartY;
        
        const t = dx * laserDirX + dy * laserDirY;
        
        const closestX = laserStartX + t * laserDirX;
        const closestY = laserStartY + t * laserDirY;
        
        const distX = px - closestX;
        const distY = py - closestY;
        const dist = Math.sqrt(distX * distX + distY * distY);
        
        const playerRadius = PLAYER.SIZE / 2;
        
        return dist < (laserWidth / 2 + playerRadius) && t > 0;
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
        
        // 受击震动
        this.hitShakeTimer = this.hitShakeDuration;
        
        // 应用击退效果（Boss击退较弱，乘以0.3）
        if (knockbackDirection && knockbackForce > 0) {
            this.knockbackX = knockbackDirection.x * knockbackForce * 0.3;
            this.knockbackY = knockbackDirection.y * knockbackForce * 0.3;
            this.knockbackTimer = FEEDBACK.KNOCKBACK.RECOVERY_TIME;
        }
        
        // 如果正在回血蓄力，累计伤害
        if (this.isHealing) {
            this.healDamageTaken += damage;
            // 受到足够伤害打断回血
            if (this.healDamageTaken >= BOSS.PHASE3.HEAL_DAMAGE_THRESHOLD) {
                this.isHealing = false;
                this.healCooldown = BOSS.PHASE3.HEAL_COOLDOWN;
                console.log('Boss回血被打断！');
            }
        }
        
        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
            this.isDying = true;
            this.deathTimer = 0;
            this.deathExplosionCount = 0;
            
            // 打断所有未执行的召唤
            this.summonTokens.forEach(token => {
                token.cancelled = true;
            });
            this.summonTokens = [];
            
            // 发布Boss死亡事件
            if (this.eventBus) {
                this.eventBus.publish('BOSS_DEATH', { boss: this });
            }
        }
    }
    
    /**
     * 更新死亡动画
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    updateDeath(deltaTime, gameLogic) {
        this.deathTimer += deltaTime;
        this.ragePulseTimer += deltaTime * 0.01;
        
        const progress = this.deathTimer / this.deathDuration;
        
        // 阶段性爆炸
        const explosionInterval = 150;
        const targetExplosions = Math.floor(this.deathTimer / explosionInterval);
        while (this.deathExplosionCount < targetExplosions && this.deathExplosionCount < 20) {
            if (typeof particleSystem !== 'undefined' && particleSystem.createExplosion) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 10 + Math.random() * 30 * progress;
                particleSystem.createExplosion(
                    this.x + Math.cos(angle) * dist,
                    this.y + Math.sin(angle) * dist,
                    8 + Math.floor(Math.random() * 8),
                    Math.random() > 0.5 ? '#ff6600' : '#ffff00'
                );
            }
            this.deathExplosionCount++;
        }
        
        // 最后大爆炸
        if (progress >= 1 && this.deathExplosionCount < 100) {
            if (typeof particleSystem !== 'undefined') {
                if (particleSystem.createBossDeath) {
                    particleSystem.createBossDeath(this.x, this.y);
                } else if (particleSystem.createExplosion) {
                    for (let i = 0; i < 5; i++) {
                        setTimeout(() => {
                            if (particleSystem.createExplosion) {
                                particleSystem.createExplosion(this.x, this.y, 30, '#ffff00');
                            }
                        }, i * 100);
                    }
                }
            }
            this.deathExplosionCount = 100;
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
     * 生成残影粒子
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    spawnAfterimageParticles(gameLogic) {
        if (!gameLogic) return;
        
        // 生成3个残影粒子
        for (let i = 0; i < 3; i++) {
            const particle = new Particle(
                this.x,
                this.y,
                0,
                0,
                this.color,
                this.size / 2,
                200 - i * 50  // 每个残影寿命递减
            );
            
            // 设置为特殊的残影类型
            particle.setKind(PARTICLES.KIND.CIRCLE);
            particle.disableShrink();
            particle.disableFade();
            particle.alpha = 0.6 - i * 0.2;  // 透明度递减
            
            gameLogic.particles.push(particle);
        }
    }
    
    /**
     * 获取冲锋伤害
     */
    getChargeDamage() {
        return this.damage * BOSS.PHASE2.CHARGE_DAMAGE_MULTIPLIER;
    }
    
    /**
     * 更新动画
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updateAnimation(deltaTime) {
        this.animTimer += deltaTime;
        
        const frameTime = 1000 / ANIMATION.MOVE.fps;
        
        if (this.animTimer >= frameTime) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }
}
