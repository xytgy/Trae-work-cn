/**
 * 被动技能实现
 * 包含所有被动技能的具体实现
 */

// ==================== 战士系被动技能 ====================

/**
 * 受伤减伤被动 - 骑士
 * 受伤时减少20%伤害
 */
class DamageReductionPassive extends PassiveSkill {
    constructor() {
        super('铁壁', '受伤时减少20%伤害');
        this.damageReduction = 0.2; // 20%减伤
    }

    /**
     * 受伤时调用（返回实际受到的伤害）
     * @param {number} damage - 伤害值
     * @returns {number} 实际受到的伤害
     */
    onTakeDamage(damage) {
        return damage * (1 - this.damageReduction);
    }

    /**
     * 获取防御加成
     * @returns {number} 防御倍率
     */
    getDefenseBonus() {
        return 1 + this.damageReduction;
    }
}

/**
 * 低血量增伤被动 - 狂战士
 * 血量低于50%时伤害提升50%
 */
class LowHealthDamagePassive extends PassiveSkill {
    constructor() {
        super('血之狂暴', '血量低于50%时伤害提升50%');
        this.damageMultiplier = 1.5; // 50%伤害提升
        this.healthThreshold = 0.5; // 50%血量阈值
    }

    /**
     * 获取伤害加成
     * @param {Object} owner - 技能所有者
     * @returns {number} 伤害倍率
     */
    getDamageBonus() {
        if (!this.owner || !this.owner.game) {return 1;}

        const currentHealth = this.owner.game.state.data.playerHealth;
        const maxHealth = PLAYER.MAX_HEALTH;
        const healthPercent = currentHealth / maxHealth;

        if (healthPercent <= this.healthThreshold) {
            return this.damageMultiplier;
        }
        return 1;
    }

    /**
     * 攻击时调用
     * @param {number} damage - 造成的伤害
     * @param {Object} target - 攻击目标
     * @returns {number} 实际伤害
     */
    onDealDamage(damage, target) {
        const bonus = this.getDamageBonus();
        return damage * bonus;
    }
}

/**
 * 攻速提升被动 - 剑圣
 * 攻击速度提升30%
 */
class AttackSpeedPassive extends PassiveSkill {
    constructor() {
        super('剑意', '攻击速度提升30%');
        this.speedBonus = 0.3; // 30%攻速提升
    }

    /**
     * 获取攻击速度加成
     * @returns {number} 攻速倍率
     */
    getAttackSpeedBonus() {
        return 1 + this.speedBonus;
    }
}

// ==================== 刺客系被动技能 ====================

/**
 * 背后伤害加成被动 - 刺客
 * 背后攻击伤害提升100%
 */
class BackstabPassive extends PassiveSkill {
    constructor() {
        super('暗袭', '背后攻击伤害提升100%');
        this.backstabMultiplier = 2.0; // 100%伤害提升
    }

    /**
     * 攻击时调用
     * @param {number} damage - 造成的伤害
     * @param {Object} target - 攻击目标
     * @returns {number} 实际伤害
     */
    onDealDamage(damage, target) {
        // 简化逻辑：假设在一定范围内就是背后攻击
        // 实际实现需要根据玩家和敌人的相对位置判断
        return damage * this.backstabMultiplier;
    }
}

/**
 * 闪避提升被动 - 游侠
 * 闪避率提升25%
 */
class EvasionPassive extends PassiveSkill {
    constructor() {
        super('幻影迷踪', '闪避率提升25%');
        this.evasionChance = 0.25; // 25%闪避
    }

    /**
     * 检查是否闪避
     * @returns {boolean} 是否闪避成功
     */
    checkEvasion() {
        return Math.random() < this.evasionChance;
    }

    /**
     * 受伤时调用
     * @param {number} damage - 伤害值
     * @returns {number} 实际受到的伤害
     */
    onTakeDamage(damage) {
        if (this.checkEvasion()) {
            // 生成闪避粒子效果
            if (this.owner && this.owner.game) {
                const game = this.owner.game;
                for (let i = 0; i < 5; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 2 + Math.random() * 2;
                    game.particles.push(
                        new Particle(
                            this.owner.x,
                            this.owner.y,
                            Math.cos(angle) * speed,
                            Math.sin(angle) * speed,
                            '#ffffff',
                            3,
                            200
                        )
                    );
                }
            }
            return 0;
        }
        return damage;
    }
}

/**
 * 击杀冷却减少被动 - 夜魔
 * 击杀敌人后冷却时间减少30%
 */
class KillCooldownReductionPassive extends PassiveSkill {
    constructor() {
        super('死神收割', '击杀敌人后技能冷却减少30%');
        this.cooldownReduction = 0.3; // 30%冷却减少
    }

    /**
     * 击杀敌人时调用
     * @param {Object} enemy - 被击杀的敌人
     */
    onKillEnemy(enemy) {
        if (this.owner && this.owner.activeSkill) {
            const skill = this.owner.activeSkill;
            // 减少30%当前冷却时间
            const reduction = skill.currentCooldown * this.cooldownReduction;
            skill.currentCooldown = Math.max(0, skill.currentCooldown - reduction);
        }
    }
}

// ==================== 法师系被动技能 ====================

/**
 * 技能伤害提升被动 - 法师
 * 主动技能伤害提升40%
 */
class SkillPowerPassive extends PassiveSkill {
    constructor() {
        super('奥术增强', '主动技能伤害提升40%');
        this.skillPowerBonus = 0.4; // 40%技能伤害提升
    }

    /**
     * 获取技能伤害加成
     * @returns {number} 技能伤害倍率
     */
    getSkillPowerBonus() {
        return 1 + this.skillPowerBonus;
    }
}

/**
 * 敌人减速加强被动 - 冰法师
 * 敌人减速效果提升30%
 */
class SlowEnhancementPassive extends PassiveSkill {
    constructor() {
        super('寒冰领域', '敌人减速效果提升30%');
        this.slowEnhancement = 0.3; // 30%减速增强
    }

    /**
     * 获取减速因子加成
     * @param {number} baseSlowFactor - 基础减速因子
     * @returns {number} 增强后的减速因子
     */
    getEnhancedSlowFactor(baseSlowFactor) {
        // 减速因子越大，敌人越慢
        // 例如：0.5变成0.65 (增强30%)
        return baseSlowFactor * (1 + this.slowEnhancement);
    }
}

/**
 * 闪电链扩展被动 - 雷法师
 * 闪电链额外攻击3个目标
 */
class LightningChainPassive extends PassiveSkill {
    constructor() {
        super('连锁闪电', '闪电链额外攻击3个目标');
        this.bonusChainTargets = 3; // 额外3个目标
    }

    /**
     * 获取额外链目标数
     * @returns {number} 额外目标数
     */
    getBonusChainTargets() {
        return this.bonusChainTargets;
    }
}

// ==================== 辅助系被动技能 ====================

/**
 * 击杀回血被动 - 牧师
 * 击杀敌人后恢复0.5心
 */
class KillHealPassive extends PassiveSkill {
    constructor() {
        super('神圣惩戒', '击杀敌人后恢复0.5心');
        this.healAmount = 0.5; // 0.5心
    }

    /**
     * 击杀敌人时调用
     * @param {Object} enemy - 被击杀的敌人
     */
    onKillEnemy(enemy) {
        if (this.owner && this.owner.game) {
            const game = this.owner.game;
            game.state.data.playerHealth = Math.min(game.state.data.playerHealth + this.healAmount, PLAYER.MAX_HEALTH);
            uiManager.updateHealth();
        }
    }
}

/**
 * 显示敌人轨迹被动 - 占卜师
 * 显示所有敌人移动轨迹
 */
class EnemyTrackingPassive extends PassiveSkill {
    constructor() {
        super('命运之眼', '显示所有敌人移动轨迹');
        this.trackingActive = true;
    }

    /**
     * 是否显示敌人轨迹
     * @returns {boolean} 是否显示
     */
    isTrackingActive() {
        return this.trackingActive;
    }
}

/**
 * 死亡复活被动 - 天使
 * 死亡后自动复活1次
 */
class ResurrectionPassive extends PassiveSkill {
    constructor() {
        super('天使守护', '死亡后自动复活1次');
        this.resurrectionsRemaining = 1;
    }

    /**
     * 检查是否可以复活
     * @returns {boolean} 是否可以复活
     */
    canResurrect() {
        return this.resurrectionsRemaining > 0;
    }

    /**
     * 执行复活
     */
    performResurrection() {
        if (this.canResurrect()) {
            this.resurrectionsRemaining--;
            if (this.owner && this.owner.game) {
                const game = this.owner.game;
                game.state.data.playerHealth = 1; // 复活后1心
                game.state.data.isInvincible = true;
                game.state.data.invincibleTimer = 2000;
                game.player.setPosition(game.player.x, game.player.y);
                uiManager.updateHealth();

                // 生成复活粒子
                for (let i = 0; i < 20; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 2 + Math.random() * 3;
                    game.particles.push(
                        new Particle(
                            this.owner.x,
                            this.owner.y,
                            Math.cos(angle) * speed,
                            Math.sin(angle) * speed,
                            '#ffeb3b',
                            5,
                            500
                        )
                    );
                }
            }
            return true;
        }
        return false;
    }

    /**
     * 重置被动状态
     */
    reset() {
        this.resurrectionsRemaining = 1;
    }
}

// ==================== 猎人系被动技能 ====================

/**
 * 移动速度提升被动 - 猎人
 * 移动速度提升20%
 */
class MovementSpeedPassive extends PassiveSkill {
    constructor() {
        super('疾风步', '移动速度提升20%');
        this.speedBonus = 0.2; // 20%速度提升
    }

    /**
     * 获取速度加成
     * @returns {number} 速度倍率
     */
    getSpeedBonus() {
        return 1 + this.speedBonus;
    }
}

/**
 * 宠物助战被动 - 狼人
 * 宠物自动攻击敌人
 */
class PetCompanionPassive extends PassiveSkill {
    constructor() {
        super('野兽本能', '宠物自动攻击敌人');
        this.petDamage = 1;
        this.petAttackRange = 80;
        this.petAttackCooldown = 1000;
        this.lastPetAttackTime = 0;
    }

    /**
     * 更新宠物攻击
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    update(deltaTime) {
        if (!this.owner || !this.owner.game) {return;}

        const now = Date.now();
        if (now - this.lastPetAttackTime < this.petAttackCooldown) {return;}

        const game = this.owner.game;

        // 宠物攻击最近的敌人
        let closestEnemy = null;
        let closestDist = this.petAttackRange;

        game.enemies.forEach((enemy) => {
            if (!enemy.alive) {return;}

            const dx = enemy.x - this.owner.x;
            const dy = enemy.y - this.owner.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < closestDist) {
                closestDist = distance;
                closestEnemy = enemy;
            }
        });

        if (closestEnemy) {
            closestEnemy.takeDamage(this.petDamage);
            game.spawnHitParticles(closestEnemy.x, closestEnemy.y, '#8d6e63');

            if (!closestEnemy.alive) {
                game.onEnemyKilled(closestEnemy);
            }

            this.lastPetAttackTime = now;
        }
    }
}

/**
 * 暴击率提升被动 - 鹰眼
 * 暴击率提升40%
 */
class CriticalHitPassive extends PassiveSkill {
    constructor() {
        super('致命狙击', '暴击率提升40%');
        this.critChance = 0.4; // 40%暴击率
        this.critMultiplier = 2.0; // 暴击2倍伤害
    }

    /**
     * 检查是否暴击
     * @returns {boolean} 是否暴击
     */
    checkCritical() {
        return Math.random() < this.critChance;
    }

    /**
     * 攻击时调用
     * @param {number} damage - 造成的伤害
     * @param {Object} target - 攻击目标
     * @returns {number} 实际伤害
     */
    onDealDamage(damage, target) {
        if (this.checkCritical()) {
            // 生成暴击粒子效果
            if (this.owner && this.owner.game) {
                const game = this.owner.game;
                for (let i = 0; i < 8; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 3 + Math.random() * 3;
                    game.particles.push(
                        new Particle(
                            target.x,
                            target.y,
                            Math.cos(angle) * speed,
                            Math.sin(angle) * speed,
                            '#ff5722',
                            4,
                            300
                        )
                    );
                }
            }
            return damage * this.critMultiplier;
        }
        return damage;
    }
}

// ==================== 机械系被动技能 ====================

/**
 * 弹药增加被动 - 工程师
 * 弹药容量提升100%
 */
class AmmoCapacityPassive extends PassiveSkill {
    constructor() {
        super('弹药专家', '弹药容量提升100%');
        this.ammoBonus = 1.0; // 100%弹药提升
    }

    /**
     * 获取弹药加成
     * @param {number} baseAmmo - 基础弹药
     * @returns {number} 加成后弹药
     */
    getBonusAmmo(baseAmmo) {
        if (baseAmmo === Infinity) {return Infinity;}
        return Math.floor(baseAmmo * (1 + this.ammoBonus));
    }
}

/**
 * 生命回复被动 - 机器人
 * 每秒回复0.1心
 */
class PassiveHealingPassive extends PassiveSkill {
    constructor() {
        super('能量护盾', '每秒回复0.1心');
        this.healPerSecond = 0.1;
        this.lastHealTime = 0;
    }

    /**
     * 更新被动效果
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    update(deltaTime) {
        if (!this.owner || !this.owner.game) {return;}

        const now = Date.now();
        if (now - this.lastHealTime >= 1000) {
            this.lastHealTime = now;

            const game = this.owner.game;
            game.state.data.playerHealth = Math.min(
                game.state.data.playerHealth + this.healPerSecond,
                PLAYER.MAX_HEALTH
            );
            uiManager.updateHealth();
        }
    }
}

/**
 * 爆炸范围扩大被动 - 爆破专家
 * 爆炸范围提升100%
 */
class ExplosionRangePassive extends PassiveSkill {
    constructor() {
        super('爆破专精', '爆炸范围提升100%');
        this.rangeBonus = 1.0; // 100%范围提升
    }

    /**
     * 获取爆炸范围加成
     * @param {number} baseRange - 基础范围
     * @returns {number} 加成后范围
     */
    getBonusRange(baseRange) {
        return baseRange * (1 + this.rangeBonus);
    }
}

// ==================== 召唤系被动技能 ====================

/**
 * 击杀召唤骷髅被动 - 死灵师
 * 击杀敌人时召唤骷髅
 */
class SummonOnKillPassive extends PassiveSkill {
    constructor() {
        super('亡灵复苏', '击杀敌人时召唤骷髅');
        this.skeletonDamage = 1;
        this.skeletonDuration = 5000;
    }

    /**
     * 击杀敌人时调用
     * @param {Object} enemy - 被击杀的敌人
     */
    onKillEnemy(enemy) {
        if (!this.owner || !this.owner.game) {return;}

        const game = this.owner.game;
        const now = Date.now();

        // 召唤一个骷髅
        const angle = Math.random() * Math.PI * 2;
        const radius = 20 + Math.random() * 20;

        game.skeletons = game.skeletons || [];
        game.skeletons.push({
            x: enemy.x + Math.cos(angle) * radius,
            y: enemy.y + Math.sin(angle) * radius,
            active: true,
            spawnTime: now,
            lastAttackTime: 0,
            attackCooldown: 1000
        });
    }
}

/**
 * 空中支援被动 - 驯龙师
 * 定期进行空袭
 */
class AirSupportPassive extends PassiveSkill {
    constructor() {
        super('飞龙指引', '定期进行空袭');
        this.airStrikeInterval = 8000; // 8秒一次
        this.airStrikeDamage = 2;
        this.lastAirStrikeTime = 0;
    }

    /**
     * 更新被动效果
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    update(deltaTime) {
        if (!this.owner || !this.owner.game) {return;}

        const now = Date.now();
        if (now - this.lastAirStrikeTime < this.airStrikeInterval) {return;}

        const game = this.owner.game;

        // 在随机敌人位置进行空袭
        if (game.enemies.length > 0) {
            const target = game.enemies[Math.floor(Math.random() * game.enemies.length)];

            // 造成伤害
            game.enemies.forEach((enemy) => {
                if (!enemy.alive) {return;}

                if (Math.abs(enemy.x - target.x) < 60) {
                    enemy.takeDamage(this.airStrikeDamage);

                    if (!enemy.alive) {
                        game.onEnemyKilled(enemy);
                    }
                }
            });

            // 生成空袭粒子效果
            for (let i = 0; i < 10; i++) {
                game.particles.push(
                    new Particle(
                        target.x + (Math.random() - 0.5) * 60,
                        50 + Math.random() * 50,
                        (Math.random() - 0.5) * 2,
                        3 + Math.random() * 2,
                        '#ff5722',
                        5,
                        400
                    )
                );
            }
        }

        this.lastAirStrikeTime = now;
    }
}

/**
 * 持续伤害被动 - 自然使者
 * 敌人持续受到伤害
 */
class DamageOverTimePassive extends PassiveSkill {
    constructor() {
        super('自然腐蚀', '敌人持续受到伤害');
        this.dotDamage = 0.5;
        this.dotInterval = 1000;
        this.affectedEnemies = new Map();
    }

    /**
     * 更新被动效果
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    update(deltaTime) {
        if (!this.owner || !this.owner.game) {return;}

        const now = Date.now();
        const game = this.owner.game;

        // 检查所有敌人
        game.enemies.forEach((enemy) => {
            if (!enemy.alive) {
                this.affectedEnemies.delete(enemy);
                return;
            }

            let enemyData = this.affectedEnemies.get(enemy);
            if (!enemyData) {
                enemyData = { lastDamageTime: 0 };
                this.affectedEnemies.set(enemy, enemyData);
            }

            // 检查是否造成持续伤害
            if (now - enemyData.lastDamageTime >= this.dotInterval) {
                enemy.takeDamage(this.dotDamage);
                enemyData.lastDamageTime = now;

                // 生成毒雾粒子
                for (let i = 0; i < 3; i++) {
                    game.particles.push(
                        new Particle(
                            enemy.x + (Math.random() - 0.5) * 20,
                            enemy.y + (Math.random() - 0.5) * 20,
                            (Math.random() - 0.5) * 0.5,
                            -0.5 - Math.random() * 0.5,
                            '#4caf50',
                            3,
                            300
                        )
                    );
                }

                if (!enemy.alive) {
                    game.onEnemyKilled(enemy);
                    this.affectedEnemies.delete(enemy);
                }
            }
        });
    }
}

// ==================== 特殊系被动技能 ====================

/**
 * 敌人中毒被动 - 炼金师
 * 攻击时使敌人中毒
 */
class PoisonAttackPassive extends PassiveSkill {
    constructor() {
        super('毒师', '攻击时使敌人中毒');
        this.poisonDamage = 0.5;
        this.poisonDuration = 3000;
    }

    /**
     * 攻击时调用
     * @param {number} damage - 造成的伤害
     * @param {Object} target - 攻击目标
     * @returns {number} 实际伤害
     */
    onDealDamage(damage, target) {
        // 使敌人中毒
        if (target && target.applyPoison) {
            target.applyPoison(this.poisonDamage, this.poisonDuration);
        }
        return damage;
    }
}

/**
 * 随机Buff被动 - 小丑
 * 随机获得各种增益效果
 */
class RandomBuffPassive extends PassiveSkill {
    constructor() {
        super('幸运光环', '随机获得各种增益效果');
        this.buffDuration = 5000;
        this.currentBuffs = [];
        this.lastBuffTime = 0;
        this.buffInterval = 10000; // 10秒一次随机buff
    }

    /**
     * 获取随机Buff类型
     * @returns {Object} Buff效果
     */
    getRandomBuff() {
        const buffs = [
            { type: 'speed', multiplier: 1.2, color: '#4fc3f7' },
            { type: 'damage', multiplier: 1.3, color: '#ff5722' },
            { type: 'defense', multiplier: 1.5, color: '#4caf50' }
        ];
        return buffs[Math.floor(Math.random() * buffs.length)];
    }

    /**
     * 更新被动效果
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    update(deltaTime) {
        if (!this.owner) {return;}

        const now = Date.now();
        if (now - this.lastBuffTime < this.buffInterval) {return;}

        const buff = this.getRandomBuff();
        this.currentBuffs.push({
            ...buff,
            endTime: now + this.buffDuration
        });

        this.lastBuffTime = now;

        // 应用buff效果
        switch (buff.type) {
            case 'speed':
                this.owner.speedBonus = (this.owner.speedBonus || 1) * buff.multiplier;
                break;
            case 'damage':
                this.owner.damageBonus = (this.owner.damageBonus || 1) * buff.multiplier;
                break;
            case 'defense':
                this.owner.defenseBonus = (this.owner.defenseBonus || 1) * buff.multiplier;
                break;
        }

        // 生成buff粒子
        if (this.owner.game) {
            const game = this.owner.game;
            for (let i = 0; i < 10; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 2;
                game.particles.push(
                    new Particle(
                        this.owner.x,
                        this.owner.y,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        buff.color,
                        4,
                        400
                    )
                );
            }
        }

        // 5秒后移除buff
        setTimeout(() => {
            const buffIndex = this.currentBuffs.findIndex((b) => b.type === buff.type);
            if (buffIndex !== -1) {
                const removedBuff = this.currentBuffs.splice(buffIndex, 1)[0];

                // 移除buff效果
                switch (removedBuff.type) {
                    case 'speed':
                        if (this.owner) {this.owner.speedBonus /= removedBuff.multiplier;}
                        break;
                    case 'damage':
                        if (this.owner) {this.owner.damageBonus /= removedBuff.multiplier;}
                        break;
                    case 'defense':
                        if (this.owner) {this.owner.defenseBonus /= removedBuff.multiplier;}
                        break;
                }
            }
        }, this.buffDuration);
    }

    /**
     * 重置被动状态
     */
    reset() {
        this.currentBuffs = [];
        this.lastBuffTime = 0;
    }
}

/**
 * 全属性提升被动 - 彩虹使者
 * 所有属性提升15%
 */
class AllStatsBonusPassive extends PassiveSkill {
    constructor() {
        super('元素亲和', '所有属性提升15%');
        this.allStatsBonus = 0.15; // 15%全属性提升
    }

    /**
     * 获取伤害加成
     * @returns {number} 伤害倍率
     */
    getDamageBonus() {
        return 1 + this.allStatsBonus;
    }

    /**
     * 获取速度加成
     * @returns {number} 速度倍率
     */
    getSpeedBonus() {
        return 1 + this.allStatsBonus;
    }

    /**
     * 获取防御加成
     * @returns {number} 防御倍率
     */
    getDefenseBonus() {
        return 1 + this.allStatsBonus;
    }
}
