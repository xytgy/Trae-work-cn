/**
 * 成就系统
 * 管理成就的解锁和奖励
 */

class Achievement {
    /**
     * 构造成就
     * @param {Object} config - 成就配置
     */
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.icon = config.icon;
        this.description = config.description;
        this.condition = config.condition;
        this.target = config.target;
        this.reward = config.reward || {};

        this.unlocked = false;
        this.progress = 0;
        this.unlockTime = 0;
        this.showAnim = false;
        this.animProgress = 0;
    }

    /**
     * 更新进度
     * @param {number} value - 新的进度值
     * @returns {boolean} 是否解锁
     */
    updateProgress(value) {
        if (this.unlocked) {return false;}

        this.progress = Math.min(value, this.target);

        if (this.progress >= this.target) {
            this.unlock();
            return true;
        }
        return false;
    }

    /**
     * 增加进度
     * @param {number} amount - 增加量
     * @returns {boolean} 是否解锁
     */
    addProgress(amount = 1) {
        return this.updateProgress(this.progress + amount);
    }

    /**
     * 解锁成就
     */
    unlock() {
        if (this.unlocked) {return;}

        this.unlocked = true;
        this.unlockTime = Date.now();
        this.showAnim = true;
        this.animProgress = 0;
    }

    /**
     * 获取进度百分比
     * @returns {number}
     */
    getProgressPercent() {
        if (this.target === 0) {return this.unlocked ? 1 : 0;}
        return Math.min(1, this.progress / this.target);
    }
}

/**
 * 成就管理器
 * 管理所有成就的追踪和解锁
 */
class AchievementManager {
    constructor() {
        this.achievements = {};
        this.unlockedCount = 0;
        this.totalCount = 0;

        this.newAchievements = [];

        this.stats = {
            killsTotal: 0,
            killsSingle: 0,
            goldSingle: 0,
            gemsTotal: 0,
            weaponsCollected: 0,
            weaponsUsedSingle: 0,
            damageTakenSingle: 0,
            itemsCollected: 0,
            victories: 0,
            noDamageVictories: 0,
            fullHealthVictories: 0,
            noPotionVictories: 0,
            legendaryDrops: 0,
            lowHpBossKills: 0,
            skillKills: 0,
            bestTime: Infinity
        };

        this.weaponsUsedSet = new Set();
        this.collectedItemsSet = new Set();
        this.tookDamage = false;
        this.usedPotion = false;

        try {
            this.initAchievements();
        } catch (error) {
            console.error('[ACHIEVEMENT] 初始化成就失败:', error);
        }
    }

    /**
     * 初始化所有成就
     */
    initAchievements() {
        try {
            const achievementList = ACHIEVEMENTS.LIST || [];

            for (const config of achievementList) {
                const achievementConfig = this.convertConfig(config);
                this.achievements[achievementConfig.id] = new Achievement(achievementConfig);
                this.totalCount++;
            }

            const extraAchievements = [
                {
                    id: 'hundred_kills',
                    name: '百人斩',
                    icon: '💀',
                    description: '累计击杀100个敌人',
                    condition: 'kills',
                    target: 100,
                    reward: { gold: 500 }
                },
                {
                    id: 'dungeon_conqueror',
                    name: '地牢征服者',
                    icon: '👑',
                    description: '通关游戏',
                    condition: 'victories',
                    target: 1,
                    reward: { gold: 1000, gems: 5 }
                },
                {
                    id: 'lightning_fast',
                    name: '闪电快枪手',
                    icon: '⚡',
                    description: '单局击杀30个敌人',
                    condition: 'kills_single',
                    target: 30,
                    reward: { gold: 200 }
                },
                {
                    id: 'rich',
                    name: '小富翁',
                    icon: '💰',
                    description: '单局获得500金币',
                    condition: 'gold_single',
                    target: 500,
                    reward: { gems: 3 }
                },
                {
                    id: 'gem_hunter',
                    name: '宝石猎人',
                    icon: '💎',
                    description: '累计获得10颗宝石',
                    condition: 'gems_total',
                    target: 10,
                    reward: { gold: 500 }
                },
                {
                    id: 'survivor',
                    name: '幸存者',
                    icon: '❤️',
                    description: '剩余1血时击杀Boss',
                    condition: 'low_hp_boss_kill',
                    target: 1,
                    reward: { gems: 5 }
                },
                {
                    id: 'all_rounder',
                    name: '全能选手',
                    icon: '🎪',
                    description: '单局使用5种不同武器',
                    condition: 'weapons_used_single',
                    target: 5,
                    reward: { gold: 200 }
                },
                {
                    id: 'berserker',
                    name: '狂战士',
                    icon: '⚔️',
                    description: '单局承受10次伤害仍存活',
                    condition: 'damage_taken_single',
                    target: 10,
                    reward: { gold: 150 }
                },
                {
                    id: 'speed_run_2min',
                    name: '速度之星',
                    icon: '🚀',
                    description: '2分钟内通关',
                    condition: 'speed_run_2min',
                    target: 1,
                    reward: { gems: 8 }
                },
                {
                    id: 'collector',
                    name: '收藏家',
                    icon: '📚',
                    description: '收集10种不同道具',
                    condition: 'items_collected',
                    target: 10,
                    reward: { gold: 300 }
                },
                {
                    id: 'lucky',
                    name: '幸运儿',
                    icon: '🎁',
                    description: '获得传说物品',
                    condition: 'legendary_drop',
                    target: 1,
                    reward: { gems: 5 }
                }
            ];

            for (const config of extraAchievements) {
                if (!this.achievements[config.id]) {
                    this.achievements[config.id] = new Achievement(config);
                    this.totalCount++;
                }
            }
        } catch (error) {
            console.error('[ACHIEVEMENT] 初始化成就列表失败:', error);
        }
    }

    /**
     * 转换成就配置格式
     * @param {Object} config - 原始配置
     * @returns {Object} 转换后的配置
     */
    convertConfig(config) {
        const result = {
            id: config.id,
            name: config.name,
            icon: config.icon || '🏆',
            description: config.description,
            condition: '',
            target: 1,
            reward: {}
        };

        if (config.condition && typeof config.condition === 'object') {
            const conditions = Object.keys(config.condition);
            if (conditions.length > 0) {
                const key = conditions[0];
                result.condition = key;
                result.target = config.condition[key];

                if (typeof result.target === 'boolean') {
                    result.target = result.target ? 1 : 0;
                }
            }
        }

        return result;
    }

    /**
     * 重置单局统计
     */
    resetSingleRun() {
        this.stats.killsSingle = 0;
        this.stats.goldSingle = 0;
        this.stats.weaponsUsedSingle = 0;
        this.stats.damageTakenSingle = 0;
        this.weaponsUsedSet.clear();
        this.tookDamage = false;
        this.usedPotion = false;
        this.newAchievements = [];
    }

    /**
     * 记录击杀
     */
    onKill(isSkillKill = false) {
        this.stats.killsTotal++;
        this.stats.killsSingle++;

        if (isSkillKill) {
            this.stats.skillKills++;
            this.checkAchievement('skill_kills', this.stats.skillKills);
        }

        this.checkAchievement('kills', this.stats.killsSingle);
        this.checkAchievement('kills_total', this.stats.killsTotal);
        this.checkAchievement('kills_single', this.stats.killsSingle);
    }

    /**
     * 记录获得金币
     * @param {number} amount
     */
    onGoldEarned(amount) {
        this.stats.goldSingle += amount;
        this.checkAchievement('gold_single', this.stats.goldSingle);
    }

    /**
     * 记录获得宝石
     * @param {number} amount
     */
    onGemsEarned(amount) {
        this.stats.gemsTotal += amount;
        this.checkAchievement('gems_total', this.stats.gemsTotal);
    }

    /**
     * 记录收集武器
     */
    onWeaponCollected(weaponId) {
        this.stats.weaponsCollected++;
        this.checkAchievement('weapons_collected', this.stats.weaponsCollected);
    }

    /**
     * 记录使用武器
     * @param {string} weaponId
     */
    onWeaponUsed(weaponId) {
        if (!this.weaponsUsedSet.has(weaponId)) {
            this.weaponsUsedSet.add(weaponId);
            this.stats.weaponsUsedSingle = this.weaponsUsedSet.size;
            this.checkAchievement('weapons_used_single', this.stats.weaponsUsedSingle);
        }
    }

    /**
     * 记录受伤
     */
    onDamageTaken() {
        this.stats.damageTakenSingle++;
        this.tookDamage = true;
        this.checkAchievement('damage_taken_single', this.stats.damageTakenSingle);
    }

    /**
     * 记录收集道具
     * @param {string} itemId
     */
    onItemCollected(itemId) {
        if (!this.collectedItemsSet.has(itemId)) {
            this.collectedItemsSet.add(itemId);
            this.stats.itemsCollected = this.collectedItemsSet.size;
            this.checkAchievement('items_collected', this.stats.itemsCollected);
        }
    }

    /**
     * 记录获得传说物品
     */
    onLegendaryDrop() {
        this.stats.legendaryDrops++;
        this.checkAchievement('legendary_drop', this.stats.legendaryDrops);
    }

    /**
     * 记录使用药水
     */
    onPotionUsed() {
        this.usedPotion = true;
    }

    /**
     * 记录Boss击杀（低血量）
     * @param {number} currentHealth
     * @param {number} maxHealth
     */
    onBossKilled(currentHealth, maxHealth) {
        if (currentHealth <= 1) {
            this.stats.lowHpBossKills++;
            this.checkAchievement('low_hp_boss_kill', this.stats.lowHpBossKills);
        }
    }

    /**
     * 记录通关
     * @param {number} time - 通关时间（秒）
     * @param {number} currentHealth
     * @param {number} maxHealth
     */
    onVictory(time, currentHealth, maxHealth) {
        this.stats.victories++;
        this.checkAchievement('victory', this.stats.victories);

        if (!this.tookDamage) {
            this.stats.noDamageVictories++;
            this.checkAchievement('no_damage_victory', this.stats.noDamageVictories);
        }

        if (currentHealth >= maxHealth) {
            this.stats.fullHealthVictories++;
            this.checkAchievement('full_health_victory', this.stats.fullHealthVictories);
        }

        if (!this.usedPotion) {
            this.stats.noPotionVictories++;
            this.checkAchievement('no_potion_victory', this.stats.noPotionVictories);
        }

        if (time < this.stats.bestTime) {
            this.stats.bestTime = time;
        }
        this.checkAchievement('speed_run', this.stats.bestTime <= 120 ? 1 : 0);

        this.checkGameMaster();
    }

    /**
     * 检查所有成就，解锁游戏大师
     */
    checkGameMaster() {
        const allUnlocked = Object.values(this.achievements).every((a) => a.unlocked || a.id === 'game_master');
        if (allUnlocked) {
            const gameMaster = this.achievements['game_master'];
            if (gameMaster && !gameMaster.unlocked) {
                this.unlockAchievement('game_master');
            }
        }
    }

    /**
     * 检查成就条件
     * @param {string} condition - 条件类型
     * @param {number} value - 当前值
     */
    checkAchievement(condition, value) {
        try {
            for (const id in this.achievements) {
                const achievement = this.achievements[id];
                if (!achievement) {continue;}
                if (achievement.unlocked) {continue;}
                if (achievement.condition === condition) {
                    if (achievement.updateProgress(value)) {
                        this.onAchievementUnlocked(achievement);
                    }
                }
            }
        } catch (error) {
            console.error('[ACHIEVEMENT] 检查成就条件失败:', error);
        }
    }

    /**
     * 解锁指定成就
     * @param {string} achievementId
     */
    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (achievement && !achievement.unlocked) {
            achievement.unlock();
            this.onAchievementUnlocked(achievement);
        }
    }

    /**
     * 成就解锁回调
     * @param {Achievement} achievement
     */
    onAchievementUnlocked(achievement) {
        try {
            this.unlockedCount++;
            this.newAchievements.push(achievement);

            if (typeof saveManager !== 'undefined') {
                saveManager.unlockAchievement(achievement.id);
            }
        } catch (error) {
            console.error('[ACHIEVEMENT] 成就解锁处理失败:', error);
        }
    }

    /**
     * 获取新解锁的成就（用于显示）
     * @returns {Achievement|null}
     */
    popNewAchievement() {
        if (this.newAchievements.length > 0) {
            return this.newAchievements.shift();
        }
        return null;
    }

    /**
     * 检查是否已解锁
     * @param {string} achievementId
     * @returns {boolean}
     */
    isUnlocked(achievementId) {
        const achievement = this.achievements[achievementId];
        return achievement ? achievement.unlocked : false;
    }

    /**
     * 获取所有成就
     * @returns {Achievement[]}
     */
    getAllAchievements() {
        return Object.values(this.achievements);
    }

    /**
     * 获取解锁进度
     * @returns {Object}
     */
    getProgress() {
        return {
            unlocked: this.unlockedCount,
            total: this.totalCount,
            percent: this.totalCount > 0 ? this.unlockedCount / this.totalCount : 0
        };
    }
}
