/**
 * 主动技能实现
 * 包含6个主动技能的详细实现
 */

/**
 * 冲刺技能
 * 向鼠标方向快速冲刺，期间无敌
 */
class DashSkill extends ActiveSkill {
    constructor() {
        super('冲刺', ' ', 3000, '向鼠标方向快速冲刺，期间无敌');
        
        // 冲刺速度
        this.dashSpeed = 20;
        
        // 冲刺距离
        this.dashDistance = 300;
        
        // 冲刺持续时间
        this.dashDuration = 200;
        
        // 冲刺计时器
        this.dashTimer = 0;
        
        // 冲刺方向
        this.dashDirection = { x: 0, y: 0 };
        
        // 是否正在冲刺
        this.isDashing = false;
        
        // 冲刺期间是否无敌
        this.invincibleDuringDash = true;
    }
    
    /**
     * 执行冲刺
     */
    execute() {
        // 计算冲刺方向（朝向鼠标位置）
        const mousePos = inputManager.getMouseWorldPosition();
        const mouseX = mousePos.x;
        const mouseY = mousePos.y;
        const dx = mouseX - this.owner.x;
        const dy = mouseY - this.owner.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.dashDirection.x = dx / dist;
            this.dashDirection.y = dy / dist;
            this.isDashing = true;
            this.dashTimer = this.dashDuration;
            
            // 生成冲刺特效
            this.spawnDashEffect();
        }
    }
    
    /**
     * 更新冲刺状态
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.isDashing) {
            this.dashTimer -= deltaTime;
            
            // 移动玩家
            this.owner.x += this.dashDirection.x * this.dashSpeed;
            this.owner.y += this.dashDirection.y * this.dashSpeed;
            
            // 生成轨迹粒子
            this.spawnDashTrail();
            
            if (this.dashTimer <= 0) {
                this.isDashing = false;
            }
        }
    }
    
    /**
     * 生成冲刺起始特效
     */
    spawnDashEffect() {
        // 在冲刺起点生成光效
        for (let i = 0; i < 10; i++) {
            const particle = particleSystem.createParticle(
                this.owner.x,
                this.owner.y,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                '#00ffff',
                6,
                300
            );
            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
                particle.setGravity(0);
            }
        }
    }
    
    /**
     * 生成冲刺轨迹粒子
     */
    spawnDashTrail() {
        // 冲刺过程中生成轨迹
        for (let i = 0; i < 3; i++) {
            const particle = particleSystem.createParticle(
                this.owner.x + (Math.random() - 0.5) * 10,
                this.owner.y + (Math.random() - 0.5) * 10,
                0,
                0,
                '#00ffff',
                4,
                150
            );
            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
                particle.setGravity(0);
            }
        }
    }
    
    /**
     * 检查是否无敌
     * @returns {boolean} 是否无敌
     */
    isInvincible() {
        return this.isDashing && this.invincibleDuringDash;
    }
}

/**
 * 闪电链技能
 * 释放闪电，在敌人间弹射
 */
class LightningChainSkill extends ActiveSkill {
    constructor() {
        super('闪电链', 'E', 5000, '释放闪电，在敌人间弹射');
        
        // 最大弹射目标数
        this.maxChainTargets = 3;
        
        // 每次弹射伤害
        this.chainDamage = 1;
        
        // 弹射范围
        this.chainRange = 200;
        
        // 每次弹射延迟
        this.chainDelay = 100;
    }
    
    /**
     * 执行闪电链
     */
    execute() {
        const enemies = gameLogic.enemies;
        const playerX = this.owner.x;
        const playerY = this.owner.y;
        
        // 找最近的敌人作为第一个目标
        let closestEnemy = null;
        let closestDist = Infinity;
        
        for (const enemy of enemies) {
            if (!enemy.alive) continue;
            const dx = enemy.x - playerX;
            const dy = enemy.y - playerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < closestDist && dist <= this.chainRange) {
                closestDist = dist;
                closestEnemy = enemy;
            }
        }
        
        if (closestEnemy) {
            this.chainToTarget(closestEnemy, null, this.maxChainTargets);
        }
    }
    
    /**
     * 弹射到目标
     * @param {Object} target - 目标敌人
     * @param {Object} previousTarget - 上一个目标
     * @param {number} remainingChains - 剩余弹射次数
     */
    chainToTarget(target, previousTarget, remainingChains) {
        if (!target || !target.alive || remainingChains <= 0) return;
        
        // 造成伤害
        target.takeDamage(this.chainDamage);
        
        // 生成闪电特效
        this.spawnLightningEffect(previousTarget, target);
        
        // 播放音效
        audioManager.playSound(AUDIO.SHOOT.LIGHTNING);
        
        // 找下一个目标
        let nextTarget = null;
        let closestDist = Infinity;
        
        for (const enemy of gameLogic.enemies) {
            if (!enemy.alive) continue;
            if (enemy === target) continue;
            
            const dx = enemy.x - target.x;
            const dy = enemy.y - target.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < closestDist && dist <= this.chainRange) {
                closestDist = dist;
                nextTarget = enemy;
            }
        }
        
        if (nextTarget) {
            // 延迟弹射到下一个目标
            const self = this;
            setTimeout(function() {
                self.chainToTarget(nextTarget, target, remainingChains - 1);
            }, self.chainDelay);
        }
    }
    
    /**
     * 生成闪电特效
     * @param {Object} from - 起始目标
     * @param {Object} to - 目标
     */
    spawnLightningEffect(from, to) {
        // 创建闪电线条粒子
        const startX = from ? from.x : this.owner.x;
        const startY = from ? from.y : this.owner.y;
        const dx = to.x - startX;
        const dy = to.y - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const segments = Math.floor(dist / 20);
        
        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const x = startX + dx * t + (Math.random() - 0.5) * 20;
            const y = startY + dy * t + (Math.random() - 0.5) * 20;
            
            const particle = particleSystem.createParticle(
                x,
                y,
                0,
                0,
                '#ffff00',
                8,
                200
            );
            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
                particle.enableFlicker(true);
                particle.setGravity(0);
            }
        }
    }
}

/**
 * 地雷技能
 * 在脚下放置地雷，敌人踩上爆炸
 */
class MineSkill extends ActiveSkill {
    constructor() {
        super('地雷', 'R', 8000, '在脚下放置地雷，敌人踩上爆炸');
        
        // 地雷伤害
        this.mineDamage = 2;
        
        // 爆炸半径
        this.mineRadius = 60;
        
        // 最大同时存在的地雷数
        this.mineCount = 3;
        
        // 活跃的地雷列表
        this.activeMines = [];
        
        // 地雷颜色
        this.mineColor = '#ff6600';
    }
    
    /**
     * 执行放置地雷
     */
    execute() {
        // 在玩家脚下放置地雷
        const mine = {
            x: this.owner.x,
            y: this.owner.y,
            radius: this.mineRadius,
            damage: this.mineDamage,
            timer: 0,
            armed: false,
            active: true
        };
        
        // 地雷延迟武装
        const self = this;
        setTimeout(function() {
            mine.armed = true;
            // 武装特效
            self.spawnArmEffect(mine);
        }, 500);
        
        // 30秒后自动消失
        setTimeout(function() {
            mine.active = false;
        }, 30000);
        
        this.activeMines.push(mine);
        
        // 限制同时存在的地雷数量
        if (this.activeMines.length > this.mineCount) {
            const oldMine = this.activeMines.shift();
            oldMine.active = false;
        }
        
        // 放置特效
        this.spawnPlaceEffect(mine);
    }
    
    /**
     * 更新地雷状态
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // 检查地雷触发
        for (const mine of this.activeMines) {
            if (!mine.active || !mine.armed) continue;
            
            mine.timer += deltaTime;
            
            // 检查敌人是否踩到
            for (const enemy of gameLogic.enemies) {
                if (!enemy.alive) continue;
                
                const dx = enemy.x - mine.x;
                const dy = enemy.y - mine.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < mine.radius) {
                    // 触发爆炸
                    this.explode(mine, enemy);
                    break;
                }
            }
        }
        
        // 清理已触发的地雷
        this.activeMines = this.activeMines.filter(m => m.active);
    }
    
    /**
     * 地雷爆炸
     * @param {Object} mine - 地雷
     * @param {Object} triggeredBy - 触发者
     */
    explode(mine, triggeredBy) {
        mine.active = false;
        
        // 造成范围伤害
        for (const enemy of gameLogic.enemies) {
            if (!enemy.alive) continue;
            
            const dx = enemy.x - mine.x;
            const dy = enemy.y - mine.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < mine.radius) {
                enemy.takeDamage(mine.damage);
            }
        }
        
        // 爆炸特效
        this.spawnExplosionEffect(mine);
        
        // 音效
        audioManager.playSound(AUDIO.SHOOT.GRENADE);
    }
    
    /**
     * 生成放置特效
     * @param {Object} mine - 地雷
     */
    spawnPlaceEffect(mine) {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particle = particleSystem.createParticle(
                mine.x,
                mine.y,
                Math.cos(angle) * 2,
                Math.sin(angle) * 2,
                this.mineColor,
                4,
                300
            );
            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
            }
        }
    }
    
    /**
     * 生成武装特效
     * @param {Object} mine - 地雷
     */
    spawnArmEffect(mine) {
        for (let i = 0; i < 5; i++) {
            const particle = particleSystem.createParticle(
                mine.x,
                mine.y,
                0,
                -1,
                '#00ff00',
                6,
                300
            );
            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
            }
        }
    }
    
    /**
     * 生成爆炸特效
     * @param {Object} mine - 地雷
     */
    spawnExplosionEffect(mine) {
        // 爆炸粒子
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            const colors = ['#ff6600', '#ff9900', '#ffcc00', '#ff3300'];
            
            const particle = particleSystem.createParticle(
                mine.x,
                mine.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                colors[Math.floor(Math.random() * colors.length)],
                4 + Math.random() * 4,
                400 + Math.random() * 200
            );
            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
                particle.setGravity(0.1);
            }
        }
    }
    
    /**
     * 渲染地雷
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    render(ctx) {
        // 渲染地雷
        for (const mine of this.activeMines) {
            if (!mine.active) continue;
            
            ctx.globalAlpha = mine.armed ? 1 : 0.5;
            
            // 地雷本体
            ctx.fillStyle = mine.armed ? '#00ff00' : '#666666';
            ctx.beginPath();
            ctx.arc(mine.x, mine.y, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // 警戒范围
            if (mine.armed) {
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.arc(mine.x, mine.y, mine.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            
            ctx.globalAlpha = 1;
        }
    }
}

/**
 * 护盾技能
 * 开启3秒无敌护盾
 */
class ShieldSkill extends ActiveSkill {
    constructor() {
        super('护盾', 'F', 10000, '开启3秒无敌护盾');
        
        // 护盾持续时间
        this.shieldDuration = 3000;
        
        // 护盾计时器
        this.shieldTimer = 0;
        
        // 是否激活
        this.isActive = false;
        
        // 护盾半径
        this.shieldRadius = 30;
    }
    
    /**
     * 执行护盾
     */
    execute() {
        this.isActive = true;
        this.shieldTimer = this.shieldDuration;
        
        // 护盾激活特效
        this.spawnActivateEffect();
    }
    
    /**
     * 更新护盾状态
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.isActive) {
            this.shieldTimer -= deltaTime;
            
            // 生成护盾粒子效果
            if (Math.random() < 0.3) {
                const angle = Math.random() * Math.PI * 2;
                const x = this.owner.x + Math.cos(angle) * this.shieldRadius;
                const y = this.owner.y + Math.sin(angle) * this.shieldRadius;
                
                const particle = particleSystem.createParticle(
                    x,
                    y,
                    0,
                    -1,
                    '#00ffff',
                    4,
                    300
                );
                if (particle) {
                    particle.setKind(PARTICLES.KIND.CIRCLE);
                }
            }
            
            if (this.shieldTimer <= 0) {
                this.isActive = false;
            }
        }
    }
    
    /**
     * 检查是否无敌
     * @returns {boolean} 是否无敌
     */
    isInvincible() {
        return this.isActive;
    }
    
    /**
     * 生成激活特效
     */
    spawnActivateEffect() {
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const particle = particleSystem.createParticle(
                this.owner.x + Math.cos(angle) * 20,
                this.owner.y + Math.sin(angle) * 20,
                Math.cos(angle) * 3,
                Math.sin(angle) * 3,
                '#00ffff',
                8,
                400
            );
            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
            }
        }
    }
    
    /**
     * 渲染护盾效果
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    render(ctx) {
        if (this.isActive) {
            // 护盾效果
            const alpha = 0.3 + Math.sin(Date.now() / 100) * 0.1;
            ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.owner.x, this.owner.y, this.shieldRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // 护盾填充
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.2})`;
            ctx.fill();
        }
    }
}

/**
 * 治疗技能
 * 恢复1颗心
 */
class HealSkill extends ActiveSkill {
    constructor() {
        super('治疗', 'G', 15000, '恢复1颗心');
        
        // 治疗量
        this.healAmount = 1;
    }
    
    /**
     * 执行治疗
     */
    execute() {
        // 恢复生命
        if (this.owner.health < this.owner.maxHealth) {
            this.owner.health = Math.min(
                this.owner.health + this.healAmount,
                this.owner.maxHealth
            );
            
            // 治疗特效
            this.spawnHealEffect();
        }
    }
    
    /**
     * 生成治疗特效
     */
    spawnHealEffect() {
        // 向上飘的加号
        for (let i = 0; i < 5; i++) {
            const particle = particleSystem.createParticle(
                this.owner.x + (Math.random() - 0.5) * 20,
                this.owner.y,
                0,
                -2,
                '#00ff00',
                12,
                800
            );
            if (particle) {
                particle.setKind(PARTICLES.KIND.STAR);
                particle.setGravity(-0.02);
            }
        }
        
        // 绿色光环
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particle = particleSystem.createParticle(
                this.owner.x,
                this.owner.y,
                Math.cos(angle) * 2,
                Math.sin(angle) * 2,
                '#00ff00',
                6,
                500
            );
            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
            }
        }
    }
}

/**
 * 炮台技能
 * 召唤炮台自动攻击，持续10秒
 */
class TurretSkill extends ActiveSkill {
    constructor() {
        super('炮台', 'X', 20000, '召唤炮台自动攻击，持续10秒');
        
        // 炮台持续时间
        this.turretDuration = 10000;
        
        // 炮台伤害
        this.turretDamage = 1;
        
        // 炮台射程
        this.turretRange = 250;
        
        // 炮台射速
        this.turretFireRate = 500;
        
        // 最大炮台数
        this.turretCount = 3;
        
        // 活跃炮台列表
        this.activeTurrets = [];
    }
    
    /**
     * 执行放置炮台
     */
    execute() {
        // 在玩家位置放置炮台
        const turret = {
            x: this.owner.x + (Math.random() - 0.5) * 50,
            y: this.owner.y + (Math.random() - 0.5) * 50,
            damage: this.turretDamage,
            range: this.turretRange,
            fireRate: this.turretFireRate,
            fireTimer: 0,
            timer: this.turretDuration,
            angle: 0,
            active: true
        };
        
        this.activeTurrets.push(turret);
        
        // 限制炮台数量
        if (this.activeTurrets.length > this.turretCount) {
            const oldTurret = this.activeTurrets.shift();
            oldTurret.active = false;
        }
        
        // 放置特效
        this.spawnPlaceEffect(turret);
    }
    
    /**
     * 更新炮台状态
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        for (const turret of this.activeTurrets) {
            if (!turret.active) continue;
            
            turret.timer -= deltaTime;
            
            if (turret.timer <= 0) {
                turret.active = false;
                continue;
            }
            
            // 寻找最近敌人
            let closestEnemy = null;
            let closestDist = Infinity;
            
            for (const enemy of gameLogic.enemies) {
                if (!enemy.alive) continue;
                
                const dx = enemy.x - turret.x;
                const dy = enemy.y - turret.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < turret.range && dist < closestDist) {
                    closestDist = dist;
                    closestEnemy = enemy;
                }
            }
            
            // 更新炮台朝向
            if (closestEnemy) {
                const dx = closestEnemy.x - turret.x;
                const dy = closestEnemy.y - turret.y;
                turret.angle = Math.atan2(dy, dx);
                
                // 射击
                turret.fireTimer += deltaTime;
                if (turret.fireTimer >= turret.fireRate) {
                    turret.fireTimer = 0;
                    this.fire(turret, closestEnemy);
                }
            }
        }
        
        // 清理已过期的炮台
        this.activeTurrets = this.activeTurrets.filter(t => t.active);
    }
    
    /**
     * 炮台射击
     * @param {Object} turret - 炮台
     * @param {Object} target - 目标
     */
    fire(turret, target) {
        // 生成子弹
        const bullet = new Bullet(
            turret.x,
            turret.y,
            Math.cos(turret.angle) * 8,
            Math.sin(turret.angle) * 8,
            { damage: turret.damage, speed: 8, color: '#ff00ff', isEnemyBullet: false }
        );
        bullet.bulletType = 'turret';
        gameLogic.bullets.push(bullet);
        
        // 射击特效
        for (let i = 0; i < 3; i++) {
            const particle = particleSystem.createParticle(
                turret.x + Math.cos(turret.angle) * 15,
                turret.y + Math.sin(turret.angle) * 15,
                Math.cos(turret.angle) * 2 + (Math.random() - 0.5),
                Math.sin(turret.angle) * 2 + (Math.random() - 0.5),
                '#ff00ff',
                4,
                150
            );
            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
            }
        }
    }
    
    /**
     * 生成放置特效
     * @param {Object} turret - 炮台
     */
    spawnPlaceEffect(turret) {
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const particle = particleSystem.createParticle(
                turret.x,
                turret.y,
                Math.cos(angle) * 3,
                Math.sin(angle) * 3,
                '#ff00ff',
                8,
                400
            );
            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
            }
        }
    }
    
    /**
     * 渲染炮台
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    render(ctx) {
        for (const turret of this.activeTurrets) {
            if (!turret.active) continue;
            
            // 炮台底座
            ctx.fillStyle = '#666666';
            ctx.beginPath();
            ctx.arc(turret.x, turret.y, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // 炮管
            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(turret.x, turret.y);
            ctx.lineTo(
                turret.x + Math.cos(turret.angle) * 20,
                turret.y + Math.sin(turret.angle) * 20
            );
            ctx.stroke();
            
            // 剩余时间指示
            const timeLeft = Math.ceil(turret.timer / 1000);
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${timeLeft}s`, turret.x, turret.y + 4);
        }
    }
}

/**
 * 狂暴技能
 * 短时间内大幅提升伤害和移动速度
 */
class BerserkSkill extends ActiveSkill {
    constructor() {
        super('狂暴', 'E', 10000, '狂暴状态下伤害和速度大幅提升');
        
        this.berserkDuration = SKILL_EFFECT.BERSERK_DURATION;
        this.damageMult = SKILL_EFFECT.BERSERK_DAMAGE_MULT;
        this.speedMult = SKILL_EFFECT.BERSERK_SPEED_MULT;
        this.berserkTimer = 0;
        this.isActive = false;
        this.originalDamage = 1;
        this.originalSpeed = 4;
    }
    
    execute() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.berserkTimer = this.berserkDuration;
        
        if (this.owner) {
            this.originalDamage = this.owner.damage || 1;
            this.originalSpeed = this.owner.speed || 4;
            this.owner.damage = this.originalDamage * this.damageMult;
            this.owner.speed = this.originalSpeed * this.speedMult;
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.isActive) {
            this.berserkTimer -= deltaTime;
            
            if (this.berserkTimer <= 0) {
                this.deactivate();
            }
        }
    }
    
    deactivate() {
        this.isActive = false;
        this.berserkTimer = 0;
        
        if (this.owner) {
            this.owner.damage = this.originalDamage;
            this.owner.speed = this.originalSpeed;
        }
    }
    
    render(ctx) {
        if (!this.isActive || !this.owner) return;
        
        ctx.save();
        const alpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.2;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.owner.renderX || this.owner.x, this.owner.renderY || this.owner.y, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

class BladeStormSkill extends ActiveSkill {
    constructor() {
        super('剑刃风暴', 'E', SKILL_COOLDOWN.BLADE_STORM, '释放剑刃风暴攻击周围敌人');
    }
    execute() {
        if (!this.owner) return;
        const radius = SKILL_EFFECT.BLADE_STORM_RADIUS;
        const damage = SKILL_EFFECT.BLADE_STORM_DAMAGE;
        const interval = SKILL_EFFECT.BLADE_STORM_HIT_INTERVAL;
        const duration = SKILL_EFFECT.BLADE_STORM_DURATION;
        let elapsed = 0;
        const tick = () => {
            if (elapsed >= duration) return;
            elapsed += interval;
            if (typeof gameLogic !== 'undefined' && gameLogic.enemies) {
                for (const e of gameLogic.enemies) {
                    if (!e.alive) continue;
                    const dx = e.x - this.owner.x;
                    const dy = e.y - this.owner.y;
                    if (Math.sqrt(dx*dx + dy*dy) < radius) {
                        gameLogic.damageEnemy(e, damage, null);
                    }
                }
            }
            setTimeout(tick, interval);
        };
        tick();
    }
    render(ctx) {}
}

class BlinkSkill extends ActiveSkill {
    constructor() {
        super('瞬移', 'E', SKILL_COOLDOWN.BLINK, '瞬间移动到鼠标位置');
    }
    execute() {
        if (!this.owner) return;
        const mousePos = typeof inputManager !== 'undefined' ? inputManager.getMouseWorldPosition() : null;
        if (mousePos) {
            this.owner.x = mousePos.x;
            this.owner.y = mousePos.y;
        }
    }
    render(ctx) {}
}

class PhantomSkill extends ActiveSkill {
    constructor() {
        super('幻影', 'E', SKILL_COOLDOWN.PHANTOM, '召唤幻影分身');
    }
    execute() {}
    render(ctx) {}
}

class ShadowStrikeSkill extends ActiveSkill {
    constructor() {
        super('暗影突袭', 'E', SKILL_COOLDOWN.SHADOW_STRIKE, '向敌人突袭造成伤害');
    }
    execute() {
        if (!this.owner) return;
        const dist = SKILL_EFFECT.SHADOW_STRIKE_DISTANCE;
        const damage = SKILL_EFFECT.SHADOW_STRIKE_DAMAGE;
        if (typeof gameLogic !== 'undefined' && gameLogic.enemies && gameLogic.enemies.length > 0) {
            let nearest = null, minD = Infinity;
            for (const e of gameLogic.enemies) {
                if (!e.alive) continue;
                const d = Math.hypot(e.x - this.owner.x, e.y - this.owner.y);
                if (d < minD) { minD = d; nearest = e; }
            }
            if (nearest && minD < dist * 3) {
                this.owner.x = nearest.x;
                this.owner.y = nearest.y;
                if (typeof gameLogic.damageEnemy === 'function') gameLogic.damageEnemy(nearest, damage, null);
            }
        }
    }
    render(ctx) {}
}

class MeteorStrikeSkill extends ActiveSkill {
    constructor() {
        super('流星火雨', 'E', SKILL_COOLDOWN.METEOR, '召唤流星雨轰炸区域');
    }
    execute() {}
    render(ctx) {}
}

class FreezeSkill extends ActiveSkill {
    constructor() {
        super('冰封', 'E', SKILL_COOLDOWN.FREEZE_SKILL, '冻结周围敌人');
    }
    execute() {
        if (!this.owner) return;
        const radius = SKILL_EFFECT.FREEZE_RADIUS;
        if (typeof gameLogic !== 'undefined' && gameLogic.enemies) {
            for (const e of gameLogic.enemies) {
                if (!e.alive) continue;
                const d = Math.hypot(e.x - this.owner.x, e.y - this.owner.y);
                if (d < radius) {
                    e.frozen = true;
                    e.frozenTimer = SKILL_EFFECT.FREEZE_DURATION;
                }
            }
        }
    }
    render(ctx) {}
}

class ThunderStrikeSkill extends ActiveSkill {
    constructor() {
        super('雷霆', 'E', SKILL_COOLDOWN.THUNDER, '释放闪电链攻击');
    }
    execute() {}
    render(ctx) {}
}

class ForesightSkill extends ActiveSkill {
    constructor() {
        super('预知', 'E', SKILL_COOLDOWN.FORESIGHT, '预知敌人攻击');
    }
    execute() {}
    render(ctx) {}
}

class ResurrectionSkill extends ActiveSkill {
    constructor() {
        super('复活', 'E', SKILL_COOLDOWN.RESURRECTION, '死亡后复活一次');
    }
    execute() {}
    render(ctx) {}
}

class LandmineSkill extends ActiveSkill {
    constructor() {
        super('地雷', 'E', SKILL_COOLDOWN.LANDMINE, '放置地雷');
    }
    execute() {}
    render(ctx) {}
}

class SummonPetSkill extends ActiveSkill {
    constructor() {
        super('野性呼唤', 'E', SKILL_COOLDOWN.SUMMON_PET, '召唤宠物');
    }
    execute() {}
    render(ctx) {}
}

class PrecisionShotSkill extends ActiveSkill {
    constructor() {
        super('精准射击', 'E', SKILL_COOLDOWN.PRECISION_SHOT, '下一枪必定暴击');
    }
    execute() {}
    render(ctx) {}
}

class SelfRepairSkill extends ActiveSkill {
    constructor() {
        super('自我修复', 'E', SKILL_COOLDOWN.SELF_REPAIR, '持续恢复生命');
    }
    execute() {
        if (!this.owner) return;
        this.owner.health = Math.min(this.owner.maxHealth || 3, this.owner.health + SKILL_EFFECT.HEAL_AMOUNT);
    }
    render(ctx) {}
}

class DemolitionSkill extends ActiveSkill {
    constructor() {
        super('定点爆破', 'E', SKILL_COOLDOWN.DEMOLITION, '放置炸弹');
    }
    execute() {}
    render(ctx) {}
}

class ArmyOfDeadSkill extends ActiveSkill {
    constructor() {
        super('骷髅大军', 'E', SKILL_COOLDOWN.ARMY_OF_DEAD, '召唤骷髅大军');
    }
    execute() {}
    render(ctx) {}
}

class SummonDragonSkill extends ActiveSkill {
    constructor() {
        super('召唤飞龙', 'E', SKILL_COOLDOWN.SUMMON_DRAGON, '召唤飞龙助战');
    }
    execute() {}
    render(ctx) {}
}

class ThornTrapSkill extends ActiveSkill {
    constructor() {
        super('荆棘陷阱', 'E', SKILL_COOLDOWN.THORN_TRAP, '放置荆棘陷阱');
    }
    execute() {}
    render(ctx) {}
}

class PotionBombSkill extends ActiveSkill {
    constructor() {
        super('药水炸弹', 'E', SKILL_COOLDOWN.POTION_BOMB, '投掷药水炸弹');
    }
    execute() {}
    render(ctx) {}
}

class SurpriseBoxSkill extends ActiveSkill {
    constructor() {
        super('惊喜礼盒', 'E', SKILL_COOLDOWN.SURPRISE_BOX, '打开惊喜礼盒');
    }
    execute() {}
    render(ctx) {}
}

class ElementalFusionSkill extends ActiveSkill {
    constructor() {
        super('元素融合', 'E', SKILL_COOLDOWN.ELEMENTAL_FUSION, '融合元素之力');
    }
    execute() {}
    render(ctx) {}
}
