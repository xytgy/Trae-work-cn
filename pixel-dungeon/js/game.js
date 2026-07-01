/**
 * 怒气系统类
 * 负责管理玩家的怒气值
 */
class RageSystem {
    constructor() {
        this.currentRage = 0;         // 当前怒气值
        this.maxRage = RAGE.MAX_RAGE; // 最大怒气值
        this.lastRageTime = 0;        // 上次获取怒气的时间
        this.isDecaying = false;      // 是否正在衰减
    }
    
    /**
     * 重置怒气系统
     */
    reset() {
        this.currentRage = 0;
        this.lastRageTime = 0;
        this.isDecaying = false;
    }
    
    /**
     * 更新怒气系统（每帧调用）
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    update(deltaTime) {
        const now = Date.now();
        
        // 如果当前怒气大于0，检查是否开始衰减
        if (this.currentRage > 0) {
            // 如果距离上次获取怒气已经超过衰减延迟，开始衰减
            if (now - this.lastRageTime >= RAGE.DECAY_DELAY) {
                // 怒气衰减
                const decayAmount = (RAGE.DECAY_RATE * deltaTime) / 1000;
                this.currentRage = Math.max(0, this.currentRage - decayAmount);
                this.isDecaying = true;
            }
        }
    }
    
    /**
     * 击杀敌人时调用
     */
    onKill() {
        this.addRage(RAGE.KILL_RAGE_GAIN);
    }
    
    /**
     * 受伤时调用
     */
    onHurt() {
        this.addRage(RAGE.HURT_RAGE_GAIN);
    }
    
    /**
     * 增加怒气值
     * @param {number} amount - 增加的怒气值
     */
    addRage(amount) {
        this.currentRage = Math.min(this.maxRage, this.currentRage + amount);
        this.lastRageTime = Date.now();
        this.isDecaying = false;
    }
    
    /**
     * 消耗怒气（用于技能释放）
     * @param {number} amount - 消耗的怒气值
     * @returns {boolean} - 是否成功消耗
     */
    consumeRage(amount) {
        if (this.currentRage >= amount) {
            this.currentRage -= amount;
            this.lastRageTime = Date.now();
            return true;
        }
        return false;
    }
    
    /**
     * 获取怒气百分比
     * @returns {number} - 怒气百分比（0-1）
     */
    getPercentage() {
        return this.currentRage / this.maxRage;
    }
    
    /**
     * 检查怒气是否已满
     * @returns {boolean}
     */
    isFull() {
        return this.currentRage >= this.maxRage;
    }
    
    /**
     * 获取当前怒气值
     * @returns {number}
     */
    getRage() {
        return this.currentRage;
    }
}

/**
 * 时间管理器类
 * 负责管理慢动作、时间停止等时间相关效果
 */
class TimeManager {
    constructor() {
        // 时间缩放（1.0 = 正常速度）
        this.timeScale = 1.0;
        
        // 慢动作相关
        this.slowMoTimer = 0;
        this.slowMoDuration = 0;
        this.slowMoTargetScale = 1.0;
        
        // 时间停止相关
        this.timeStopTimer = 0;
        this.timeStopDuration = 0;
    }
    
    /**
     * 开始慢动作效果
     * @param {number} duration - 持续时间（毫秒）
     * @param {number} targetScale - 目标时间缩放（0.1 = 10%速度）
     */
    startSlowMotion(duration, targetScale) {
        this.slowMoTimer = duration;
        this.slowMoDuration = duration;
        this.slowMoTargetScale = targetScale;
    }
    
    /**
     * 开始时间停止效果
     * @param {number} duration - 持续时间（毫秒）
     */
    startTimeStop(duration) {
        this.timeStopTimer = duration;
        this.timeStopDuration = duration;
    }
    
    /**
     * 检查时间是否停止
     * @returns {boolean}
     */
    isTimeStopped() {
        return this.timeStopTimer > 0;
    }
    
    /**
     * 更新时间管理器
     * @param {number} deltaTime - 原始delta time（毫秒）
     */
    update(deltaTime) {
        // 更新时间停止（使用真实时间更新计时器）
        if (this.timeStopTimer > 0) {
            this.timeStopTimer -= deltaTime;
            if (this.timeStopTimer <= 0) {
                this.timeStopTimer = 0;
            }
            // 时间停止时，timeScale为0
            this.timeScale = 0;
            return;
        }
        
        // 更新慢动作
        if (this.slowMoTimer > 0) {
            this.slowMoTimer -= deltaTime;
            const progress = Math.max(0, this.slowMoTimer / this.slowMoDuration);
            
            // 缓入缓出效果
            if (progress > 0.7) {
                // 开始阶段（0-30%时间）：从正常速度缓入到目标速度
                const t = (1 - progress) / 0.3;
                this.timeScale = 1 + (this.slowMoTargetScale - 1) * this.easeInOutQuad(t);
            } else if (progress < 0.3) {
                // 结束阶段（最后30%时间）：从目标速度缓出到正常速度
                const t = progress / 0.3;
                this.timeScale = this.slowMoTargetScale + (1 - this.slowMoTargetScale) * this.easeInOutQuad(1 - t);
            } else {
                // 中间阶段：保持目标速度
                this.timeScale = this.slowMoTargetScale;
            }
            
            if (this.slowMoTimer <= 0) {
                this.slowMoTimer = 0;
                this.timeScale = 1.0;
            }
        } else {
            this.timeScale = 1.0;
        }
    }
    
    /**
     * 缓入缓出二次函数
     * @param {number} t - 0-1之间的值
     * @returns {number}
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    /**
     * 获取缩放后的delta time
     * @param {number} originalDelta - 原始delta time
     * @returns {number} 缩放后的delta time
     */
    getScaledDeltaTime(originalDelta) {
        return originalDelta * this.timeScale;
    }
    
    /**
     * 重置时间管理器
     */
    reset() {
        this.timeScale = 1.0;
        this.slowMoTimer = 0;
        this.slowMoDuration = 0;
        this.slowMoTargetScale = 1.0;
        this.timeStopTimer = 0;
        this.timeStopDuration = 0;
    }
}

/**
 * 游戏主逻辑类
 * 负责游戏核心逻辑的更新和协调各组件
 */

class GameLogic {
    constructor({ eventBus }) {
        // 事件总线
        this.eventBus = eventBus;
        
        // 游戏状态引用
        this.state = null;
        
        // 玩家引用
        this.player = null;
        
        // 敌人列表
        this.enemies = [];
        
        // Boss引用
        this.boss = null;
        
        // 子弹列表
        this.bullets = [];
        
        // 粒子列表
        this.particles = [];
        
        // 当前房间
        this.currentRoom = null;
        
        // 传送门
        this.portal = null;
        
        // 是否所有敌人已清除
        this.allEnemiesCleared = false;
        
        // 射击冷却
        this.shootCooldown = 0;
        
        // 粒子池（用于子弹轨迹优化）
        this.bulletTrailPool = [];
        this.BULLET_TRAIL_POOL_SIZE = 100;
        this._initBulletTrailPool();
        
        // 每帧子弹轨迹粒子计数（用于限制生成频率）
        this.frameBulletTrails = 0;
        
        // 怒气系统
        this.rageSystem = new RageSystem();
        
        // 伤害数字列表
        this.damageNumbers = [];
        
        // 时间管理器
        this.timeManager = new TimeManager();
        
        // 辅助瞄准系统
        this.aimAssist = {
            enabled: AIM_ASSIST.ENABLED,
            lastTargetEnemy: null
        };
        
        // 背包系统
        this.inventory = new Inventory();
        
        // 掉落物管理器
        this.dropManager = new DropManager();
        
        // Buff管理器
        this.buffManager = new BuffManager();
        
        // 遗物管理器
        this.relicManager = new RelicManager();
        
        // 商店管理器
        this.shopManager = new ShopManager();
        
        // 成就管理器
        this.achievementManager = new AchievementManager();
        
        // 背包UI开关
        this.inventoryOpen = false;
        
        // 成就通知队列
        this.achievementNotifications = [];
        
        // 清空旧事件监听（防止内存泄漏）
        if (this.eventBus) {
            this.eventBus.clearAll();
        }

        // 注册事件监听
        this._registerEventListeners();
    }
    
    /**
     * 注册事件监听
     */
    _registerEventListeners() {
        if (!this.eventBus) return;
        
        this.eventBus.subscribe('ENEMY_KILLED', (data) => {
            this.onEnemyKilledEvent(data);
        });
        
        this.eventBus.subscribe('PLAYER_HURT', (data) => {
            this.onPlayerHurtEvent(data);
        });
        
        this.eventBus.subscribe('SKILL_USED', (data) => {
            this.onSkillUsedEvent(data);
        });
        
        this.eventBus.subscribe('BOSS_SPAWN', (data) => {
            this.onBossSpawnEvent(data);
        });
        
        this.eventBus.subscribe('BOSS_DEATH', (data) => {
            this.onBossDeathEvent(data);
        });
        
        this.eventBus.subscribe('ROOM_CLEARED', (data) => {
            this.onRoomClearedEvent(data);
        });
        
        this.eventBus.subscribe('WEAPON_PICKUP', (data) => {
            this.onWeaponPickupEvent(data);
        });
        
        this.eventBus.subscribe('GOLD_EARNED', (data) => {
            this.onGoldEarnedEvent(data);
        });
        
        this.eventBus.subscribe('BUFF_APPLIED', (data) => {
            this.onBuffAppliedEvent(data);
        });
    }
    
    /**
     * 初始化子弹轨迹粒子池
     */
    _initBulletTrailPool() {
        for (let i = 0; i < this.BULLET_TRAIL_POOL_SIZE; i++) {
            this.bulletTrailPool.push(new Particle(0, 0, 0, 0, '#ffffff', 2, 100));
        }
    }
    
    /**
     * 获取一个子弹轨迹粒子
     */
    _acquireBulletTrail() {
        if (this.bulletTrailPool.length > 0) {
            return this.bulletTrailPool.pop();
        }
        return new Particle(0, 0, 0, 0, '#ffffff', 2, 100);
    }
    
    /**
     * 归还一个子弹轨迹粒子
     */
    _releaseBulletTrail(particle) {
        if (this.bulletTrailPool.length < this.BULLET_TRAIL_POOL_SIZE) {
            particle.active = false;
            this.bulletTrailPool.push(particle);
        }
    }
    
    /**
     * 清空所有粒子并归还到池
     */
    _clearParticles() {
        // 归还所有子弹轨迹粒子到池
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            if (particle.size <= 4 && particle.lifetime <= 150) {
                this._releaseBulletTrail(particle);
            }
        }
        this.particles = [];
    }
    
    /**
     * 初始化游戏逻辑
     */
    init() {
        console.log('初始化游戏逻辑...');
        
        // 重置状态
        this.state = gameState;
        this.state.resetData();
        
        // 获取选中的角色
        const selectedCharacter = this.state.getSelectedCharacter();
        
        // 创建玩家
        this.player = new Player(GAME_WIDTH / 2, GAME_HEIGHT / 2, { eventBus: this.eventBus });
        
        // 如果有选中的角色，应用角色属性
        if (selectedCharacter) {
            console.log(`应用角色属性: ${selectedCharacter.name}`);
            // 设置玩家生命值（基于生存能力属性，1-5映射到2-4生命值）
            const survivability = selectedCharacter.stats?.survivability || 3;
            const baseHealth = Math.max(2, Math.min(4, survivability));
            this.state.data.playerHealth = baseHealth;
            this.state.data.maxHealth = baseHealth;
            // 设置玩家颜色
            this.player.color = selectedCharacter.color || COLORS.PLAYER.BODY;
        }
        
        // 应用难度设置
        const difficultyConfig = this.state.getDifficultyConfig();
        if (difficultyConfig) {
            console.log(`应用难度设置: ${difficultyConfig.name}`);
            
            // 应用难度对玩家初始生命的影响
            if (difficultyConfig.player && difficultyConfig.player.initialHealth !== undefined) {
                // 基于难度的初始生命调整
                this.state.data.playerHealth = difficultyConfig.player.initialHealth;
                this.state.data.maxHealth = difficultyConfig.player.initialHealth;
                // 如果有角色属性，取较高值
                if (selectedCharacter) {
                    const survivability = selectedCharacter.stats?.survivability || 3;
                    const baseHealth = Math.max(2, Math.min(4, survivability));
                    this.state.data.playerHealth = Math.max(1, Math.min(difficultyConfig.player.initialHealth + 1, baseHealth + difficultyConfig.player.initialHealth - 3));
                }
            }
            
            // 应用难度对金币的影响
            if (difficultyConfig.player && difficultyConfig.player.goldMultiplier !== undefined) {
                this.state.data.goldMultiplier = difficultyConfig.player.goldMultiplier;
            }
            
            // 应用难度对掉落率的影响
            if (difficultyConfig.player && difficultyConfig.player.dropRateMultiplier !== undefined) {
                this.state.data.dropRateMultiplier = difficultyConfig.player.dropRateMultiplier;
            }
        }
        
        // 清空敌人列表
        this.enemies = [];
        this.bullets = [];
        this._clearParticles();
        this.boss = null;
        this.portal = null;
        this.weaponDrops = [];  // 武器掉落列表
        this.allEnemiesCleared = false;
        this.shootCooldown = 0;
        
        // 重置怒气系统
        this.rageSystem.reset();
        this.damageNumbers = [];
        
        // 重置背包系统
        this.inventory.reset();
        this.dropManager.reset();
        this.buffManager.reset();
        this.relicManager.reset();
        this.shopManager.reset();
        this.achievementManager.resetSingleRun();
        this.inventoryOpen = false;
        this.achievementNotifications = [];
        
        // 初始化房间
        this.initRoom();
        
        // 初始化UI
        uiManager.init();
        uiManager.show(true);
        
        // 注册武器切换回调
        this.handleWeaponSwitch();
        
        console.log('游戏逻辑初始化完成');
    }
    
    /**
     * 初始化当前房间
     */
    initRoom() {
        const level = this.state.getData().currentLevel;
        const roomIndex = level - 1;
        
        const roomType = this.getRoomType(roomIndex);
        const isBossRoom = roomType === ROOM_TYPES.BOSS || level >= LEVELS.COUNT;
        
        this.currentRoom = new Room(roomType, roomIndex, isBossRoom);
        
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.boss = null;
        this.portal = null;
        this.allEnemiesCleared = false;
        
        switch (roomType) {
            case ROOM_TYPES.BOSS:
                this.initBossRoom();
                break;
            case ROOM_TYPES.ELITE:
                this.initEliteRoom(roomIndex);
                break;
            case ROOM_TYPES.BATTLE:
                this.initBattleRoom(roomIndex);
                break;
            case ROOM_TYPES.CHEST:
            case ROOM_TYPES.TRAP:
            case ROOM_TYPES.REST:
            case ROOM_TYPES.SHOP:
            default:
                break;
        }
        
        console.log(`房间 ${level} 初始化完成 - 类型: ${this.currentRoom.getRoomTypeName()}, 敌人数量: ${this.enemies.length}, Boss: ${!!this.boss}`);
    }
    
    /**
     * 根据房间索引获取房间类型
     * @param {number} roomIndex - 房间索引
     * @returns {string} 房间类型
     */
    getRoomType(roomIndex) {
        if (roomIndex >= LEVELS.COUNT - 1) {
            return ROOM_TYPES.BOSS;
        }
        
        const roomTypes = [
            { type: ROOM_TYPES.BATTLE, weight: ROOM_SPAWN_CONFIG.BATTLE },
            { type: ROOM_TYPES.CHEST, weight: ROOM_SPAWN_CONFIG.CHEST },
            { type: ROOM_TYPES.SHOP, weight: ROOM_SPAWN_CONFIG.SHOP },
            { type: ROOM_TYPES.TRAP, weight: ROOM_SPAWN_CONFIG.TRAP },
            { type: ROOM_TYPES.ELITE, weight: ROOM_SPAWN_CONFIG.ELITE },
            { type: ROOM_TYPES.REST, weight: ROOM_SPAWN_CONFIG.REST }
        ];
        
        const totalWeight = roomTypes.reduce((sum, rt) => sum + rt.weight, 0);
        let rand = Math.random() * totalWeight;
        
        for (const rt of roomTypes) {
            rand -= rt.weight;
            if (rand <= 0) {
                return rt.type;
            }
        }
        
        return ROOM_TYPES.BATTLE;
    }
    
    /**
     * 初始化战斗房
     * @param {number} roomIndex - 房间索引
     */
    initBattleRoom(roomIndex) {
        const difficultyConfig = this.state.getDifficultyConfig();
        const baseCount = 3 + Math.floor(roomIndex * 0.5);
        let enemyCount = baseCount;
        
        if (difficultyConfig?.room) {
            if (difficultyConfig.id === 'easy') {
                enemyCount = Math.max(2, Math.floor(baseCount * 0.8));
            } else if (difficultyConfig.id === 'hard') {
                enemyCount = Math.floor(baseCount * 1.2);
            } else if (difficultyConfig.id === 'nightmare') {
                enemyCount = Math.floor(baseCount * 1.5);
            }
        }
        
        const enemyTypes = this.getEnemyTypesForRoom(roomIndex);
        
        for (let i = 0; i < enemyCount; i++) {
            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const x = 100 + Math.random() * (GAME_WIDTH - 200);
            const y = 100 + Math.random() * (GAME_HEIGHT - 200);
            
            const enemy = this.createEnemy(enemyType, x, y, roomIndex);
            if (enemy) {
                this.enemies.push(enemy);
            }
        }
    }
    
    /**
     * 初始化精英房
     * @param {number} roomIndex - 房间索引
     */
    initEliteRoom(roomIndex) {
        const centerX = GAME_WIDTH / 2;
        const centerY = GAME_HEIGHT / 3;
        
        const difficultyConfig = this.state.getDifficultyConfig();
        const roomProgressMult = this.state.getRoomDifficultyMultiplier(roomIndex, false);
        const healthMult = (difficultyConfig?.enemy?.healthMultiplier || 1) * roomProgressMult;
        const damageMult = (difficultyConfig?.enemy?.damageMultiplier || 1) * roomProgressMult;
        const speedMult = difficultyConfig?.enemy?.speedMultiplier || 1;
        const aiLevel = difficultyConfig?.enemy?.aiLevel || 1;
        
        const elite = new EliteEnemy(centerX, centerY, { eventBus: this.eventBus });
        this.applyDifficultyToEnemy(elite, healthMult, damageMult, speedMult, aiLevel);
        this.enemies.push(elite);
        
        let minionCount = ELITE_ROOM_CONFIG.MINION_COUNT;
        if (difficultyConfig?.id === 'nightmare') {
            minionCount = Math.floor(minionCount * 1.5);
        }
        
        const enemyTypes = ['slime', 'bat', 'skeleton'];
        
        for (let i = 0; i < minionCount; i++) {
            const angle = (i / minionCount) * Math.PI * 2;
            const dist = 80;
            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist;
            
            const enemyType = enemyTypes[i % enemyTypes.length];
            const enemy = this.createEnemy(enemyType, x, y, roomIndex);
            if (enemy) {
                this.enemies.push(enemy);
            }
        }
    }
    
    /**
     * 初始化Boss房
     */
    initBossRoom() {
        const difficultyConfig = this.state.getDifficultyConfig();
        const roomIndex = this.state.getData().currentLevel - 1;
        const roomProgressMult = this.state.getRoomDifficultyMultiplier(roomIndex, true);
        const healthMult = (difficultyConfig?.enemy?.healthMultiplier || 1) * roomProgressMult;
        const damageMult = (difficultyConfig?.enemy?.damageMultiplier || 1) * roomProgressMult;
        const speedMult = difficultyConfig?.enemy?.speedMultiplier || 1;
        const aiLevel = difficultyConfig?.enemy?.aiLevel || 1;
        
        this.boss = new Boss(GAME_WIDTH / 2, 150, { eventBus: this.eventBus });
        
        if (this.boss) {
            this.boss.maxHealth = Math.ceil(this.boss.maxHealth * healthMult);
            this.boss.health = this.boss.maxHealth;
            this.boss.damage = Math.max(1, Math.floor(this.boss.damage * damageMult));
            this.boss.aiLevel = aiLevel;
        }
        
        audioManager.playSound(AUDIO.BOSS_APPEAR);
        
        // 发布Boss出现事件
        if (this.eventBus) {
            this.eventBus.publish('BOSS_SPAWN', { boss: this.boss });
        }
    }
    
    /**
     * 根据房间索引获取可用敌人类型
     * @param {number} roomIndex - 房间索引
     * @returns {Array} 敌人类型数组
     */
    getEnemyTypesForRoom(roomIndex) {
        if (roomIndex <= 1) {
            return ['slime', 'skeleton'];
        } else if (roomIndex <= 2) {
            return ['slime', 'bat', 'skeleton'];
        } else if (roomIndex <= 3) {
            return ['slime', 'bat', 'skeleton', 'archer'];
        } else {
            return ['slime', 'bat', 'ghost', 'skeleton', 'archer', 'mage', 'bomber'];
        }
    }
    
    /**
     * 创建敌人实例
     * @param {string} type - 敌人类型
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {Enemy|null} 敌人实例
     */
    createEnemy(type, x, y, roomIndex = 0) {
        const difficultyConfig = this.state.getDifficultyConfig();
        const roomProgressMult = this.state.getRoomDifficultyMultiplier(roomIndex, false);
        const healthMult = (difficultyConfig?.enemy?.healthMultiplier || 1) * roomProgressMult;
        const damageMult = (difficultyConfig?.enemy?.damageMultiplier || 1) * roomProgressMult;
        const speedMult = difficultyConfig?.enemy?.speedMultiplier || 1;
        const aiLevel = difficultyConfig?.enemy?.aiLevel || 1;
        
        let enemy;
        const enemyOptions = { eventBus: this.eventBus };
        switch (type) {
            case 'slime':
                enemy = new Slime(x, y, enemyOptions);
                break;
            case 'bat':
                enemy = new Bat(x, y, enemyOptions);
                break;
            case 'ghost':
                enemy = new Ghost(x, y, enemyOptions);
                break;
            case 'skeleton':
                if (typeof Skeleton !== 'undefined') {
                    enemy = new Skeleton(x, y, enemyOptions);
                } else {
                    enemy = new Slime(x, y, enemyOptions);
                }
                break;
            case 'archer':
                if (typeof Archer !== 'undefined') {
                    enemy = new Archer(x, y, enemyOptions);
                } else {
                    enemy = new Bat(x, y, enemyOptions);
                }
                break;
            case 'mage':
                if (typeof Mage !== 'undefined') {
                    enemy = new Mage(x, y, enemyOptions);
                } else {
                    enemy = new Ghost(x, y, enemyOptions);
                }
                break;
            case 'bomber':
                if (typeof Bomber !== 'undefined') {
                    enemy = new Bomber(x, y, enemyOptions);
                } else {
                    enemy = new Slime(x, y, enemyOptions);
                }
                break;
            default:
                enemy = new Slime(x, y, enemyOptions);
                break;
        }
        
        if (enemy) {
            this.applyDifficultyToEnemy(enemy, healthMult, damageMult, speedMult, aiLevel);
        }
        
        return enemy;
    }
    
    /**
     * 应用难度设置到敌人
     * @param {Enemy} enemy - 敌人实例
     * @param {number} healthMult - 血量倍率
     * @param {number} damageMult - 伤害倍率
     * @param {number} speedMult - 速度倍率
     * @param {number} aiLevel - AI等级
     */
    applyDifficultyToEnemy(enemy, healthMult, damageMult, speedMult, aiLevel) {
        if (!enemy) return;
        
        enemy.maxHealth = Math.ceil(enemy.maxHealth * healthMult);
        enemy.health = enemy.maxHealth;
        enemy.damage = Math.max(1, Math.floor(enemy.damage * damageMult));
        enemy.baseSpeed = enemy.baseSpeed * speedMult;
        enemy.speed = enemy.baseSpeed;
        enemy.aiLevel = aiLevel;
        enemy.aiConfig = DIFFICULTY.AI_LEVELS[aiLevel] || DIFFICULTY.AI_LEVELS[1];
        if (enemy.applyAILevelAdjustments) {
            enemy.applyAILevelAdjustments();
        }
    }
    
    /**
     * 更新游戏逻辑
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    update(deltaTime) {
        // 更新时间管理器（使用真实时间）
        this.timeManager.update(deltaTime);
        
        // 获取缩放后的delta time
        const scaledDelta = this.timeManager.getScaledDeltaTime(deltaTime);
        
        // 如果时间停止，只更新相机和UI，不更新游戏逻辑
        if (this.timeManager.isTimeStopped()) {
            // 更新相机震动（使用真实时间）
            camera.update(deltaTime);
            
            // 更新UI（使用真实时间）
            uiManager.update(deltaTime);
            
            return;
        }
        
        // 更新相机（使用真实时间，让震动更流畅）
        camera.update(deltaTime);
        
        // 更新游戏状态
        this.state.update(scaledDelta);
        
        // 更新房间
        this.updateRoom(scaledDelta);
        
        // 更新玩家
        this.updatePlayer(scaledDelta);
        
        // 更新敌人
        this.updateEnemies(scaledDelta);
        
        // 更新Boss
        this.updateBoss(scaledDelta);
        
        // 更新子弹
        this.updateBullets(scaledDelta);
        
        // 更新粒子
        this.updateParticles(scaledDelta);
        
        // 更新光影系统
        renderer.updateLighting(scaledDelta);
        
        // 维护环境灰尘粒子
        this.maintainAmbientDust(scaledDelta);
        
        // 检查碰撞
        this.checkCollisions();
        
        // 检查武器拾取
        this.checkWeaponPickup();
        
        // 检查房间清除
        this.checkRoomClear();
        
        // 更新UI
        uiManager.update(scaledDelta);
        
        // 更新怒气系统
        this.rageSystem.update(scaledDelta);
        
        // 更新伤害数字
        this.updateDamageNumbers(scaledDelta);
        
        // 更新掉落物
        this.dropManager.update(scaledDelta);
        
        // 更新Buff
        this.buffManager.update(scaledDelta, this);
        
        // 更新商店
        this.shopManager.update(scaledDelta);
        
        // 检查道具拾取
        this.checkItemPickup();
        
        // 检查成就通知
        this.checkAchievementNotifications();
        
        // 处理射击
        this.handleShooting(scaledDelta);
    }
    
    /**
     * 维护环境灰尘粒子
     * @param {number} deltaTime - 时间增量
     */
    maintainAmbientDust(deltaTime) {
        if (!this.currentRoom) return;
        
        // 统计当前灰尘粒子数量
        let dustCount = 0;
        for (const particle of this.particles) {
            if (particle.active && particle.kind === PARTICLES.KIND.DUST) {
                dustCount++;
            }
        }
        
        // 如果灰尘粒子不足，补充生成
        const targetDustCount = 25;
        if (dustCount < targetDustCount && Math.random() < 0.1) {
            const playableArea = this.currentRoom.getPlayableArea();
            const x = playableArea.x + Math.random() * playableArea.width;
            const y = playableArea.y + playableArea.height;
            
            const config = PARTICLES.TYPES.AMBIENT_DUST;
            const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
            
            const particle = new Particle(
                x, y,
                (Math.random() - 0.5) * 0.2,
                -0.1 - Math.random() * 0.1,
                config.color,
                size,
                config.lifetime
            );
            
            particle.setKind(PARTICLES.KIND.DUST);
            particle.setFriction(0.99);
            particle.disableShrink();
            
            if (this.particles.length < PARTICLES.MAX_COUNT) {
                this.particles.push(particle);
            }
        }
    }
    
    /**
     * 更新玩家
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updatePlayer(deltaTime) {
        if (!this.player) return;

        // 获取移动输入
        const movement = inputManager.getMovementVector();

        // 使用物理移动系统（加速度、减速度、摩擦）
        this.player.updateMovement(movement, 1, deltaTime);

        // 更新玩家状态（无敌闪烁等）
        const isInvincible = this.state.getData().isInvincible;
        this.player.update(deltaTime, isInvincible);

        // 更新动画状态
        if (movement.x !== 0 || movement.y !== 0) {
            this.player.setAnimState('move');
        } else {
            this.player.setAnimState('idle');
        }

        // 边界检测
        this.clampPlayerToRoom();
    }
    
    /**
     * 限制玩家在房间范围内
     */
    clampPlayerToRoom() {
        const margin = LEVELS.WALL_THICKNESS;
        const playerHalfSize = PLAYER.SIZE / 2;
        
        // 限制X坐标
        if (this.player.x < margin + playerHalfSize) {
            this.player.x = margin + playerHalfSize;
            // 碰到左墙，停止X方向速度
            if (this.player.velocityX < 0) {
                this.player.velocityX = 0;
            }
        }
        if (this.player.x > GAME_WIDTH - margin - playerHalfSize) {
            this.player.x = GAME_WIDTH - margin - playerHalfSize;
            // 碰到右墙，停止X方向速度
            if (this.player.velocityX > 0) {
                this.player.velocityX = 0;
            }
        }
        
        // 限制Y坐标
        if (this.player.y < margin + playerHalfSize) {
            this.player.y = margin + playerHalfSize;
            // 碰到上墙，停止Y方向速度
            if (this.player.velocityY < 0) {
                this.player.velocityY = 0;
            }
        }
        if (this.player.y > GAME_HEIGHT - margin - playerHalfSize) {
            this.player.y = GAME_HEIGHT - margin - playerHalfSize;
            // 碰到下墙，停止Y方向速度
            if (this.player.velocityY > 0) {
                this.player.velocityY = 0;
            }
        }
        
        // 同步渲染位置也需要跟随实际位置（防止穿墙时的插值问题
        if (this.player.renderX !== this.player.x || this.player.renderY !== this.player.y) {
            // 如果实际位置被限制了，渲染位置也相应调整
            this.player.renderX = this.player.x;
            this.player.renderY = this.player.y;
        }
    }
    
    /**
     * 更新敌人
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            if (enemy.alive) {
                enemy.update(deltaTime, this.player);
            }
        });
        
        // 移除死亡敌人
        this.enemies = this.enemies.filter(enemy => enemy.alive);
    }
    
    /**
     * 更新Boss
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updateBoss(deltaTime) {
        if (!this.boss || !this.boss.alive) return;
        
        this.boss.update(deltaTime, this.player, this);
    }
    
    /**
     * 更新子弹
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updateBullets(deltaTime) {
        const flameBulletsToMark = [];
        
        this.bullets.forEach(bullet => {
            if (bullet.active) {
                const wasActive = bullet.active;
                
                // 为追踪导弹更新敌人引用
                if (bullet.bulletType === 'homing' && bullet.setEnemiesRef) {
                    bullet.setEnemiesRef(this.enemies);
                }
                
                bullet.update(deltaTime);
                
                // 生成子弹轨迹粒子
                this.spawnBulletTrailParticle(bullet);
                
                // 火焰子弹结束时生成地面燃烧痕迹
                if (wasActive && !bullet.active && bullet.bulletType === 'flame') {
                    flameBulletsToMark.push({ x: bullet.x, y: bullet.y });
                }
            }
        });
        
        // 生成地面燃烧痕迹
        flameBulletsToMark.forEach(pos => {
            this.spawnBurnMark(pos.x, pos.y);
        });
        
        // 移除不活跃子弹
        this.bullets = this.bullets.filter(bullet => bullet.active);
    }
    
    /**
     * 生成地面燃烧痕迹
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    spawnBurnMark(x, y) {
        const config = PARTICLES.TYPES.BURN_MARK;
        const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
        
        const particle = new Particle(
            x, y,
            0, 0,
            config.color,
            size,
            config.lifetime
        );
        
        particle.setKind(PARTICLES.KIND.BURN_MARK);
        particle.enableFlicker(config.flickerSpeed);
        particle.disableShrink();
        
        this.particles.push(particle);
    }
    
    /**
     * 生成子弹轨迹粒子
     * @param {Bullet} bullet - 子弹
     */
    spawnBulletTrailParticle(bullet) {
        // 只对玩家子弹生成轨迹
        if (bullet.isEnemyBullet) return;
        
        // 限制每帧添加的轨迹粒子数量
        this.frameBulletTrails++;
        if (this.frameBulletTrails > 30) {
            return;
        }
        
        // 根据子弹类型选择颜色和粒子数量
        let color = COLORS.BULLET.NORMAL;
        let particleCount = 1;
        let sizeMultiplier = 1;
        
        switch (bullet.bulletType) {
            case 'lightning':
                color = COLORS.BULLET.LIGHTNING;
                particleCount = 1;
                break;
            case 'grenade':
                color = COLORS.BULLET.GRENADE;
                particleCount = 1;
                break;
            case 'flame':
                color = COLORS.BULLET.FLAME;
                particleCount = 2;
                sizeMultiplier = 1.5;
                break;
            case 'boomerang':
                color = COLORS.WEAPON.BOOMERANG;
                particleCount = 1;
                break;
            case 'freeze':
                color = COLORS.BULLET.FREEZE;
                particleCount = 2;
                break;
            case 'shotgun':
                color = COLORS.BULLET.SHOTGUN;
                particleCount = 1;
                break;
            case 'homing':
                color = COLORS.BULLET.HOMING;
                particleCount = 2;
                break;
        }
        
        // 添加子弹轨迹粒子（使用池化对象）
        const baseSize = PARTICLES.TYPES.BULLET_TRAIL.size * sizeMultiplier;
        const lifetime = PARTICLES.TYPES.BULLET_TRAIL.lifetime;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this._acquireBulletTrail();
            particle.x = bullet.x + (Math.random() - 0.5) * 4;
            particle.y = bullet.y + (Math.random() - 0.5) * 4;
            particle.velX = (Math.random() - 0.5) * 0.5;
            particle.velY = (Math.random() - 0.5) * 0.5;
            particle.color = color;
            particle.size = baseSize;
            particle.originalSize = baseSize;
            particle.lifetime = lifetime;
            particle.age = 0;
            particle.active = true;
            particle.friction = 0.95;
            
            this.particles.push(particle);
        }
    }
    
    /**
     * 更新粒子
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updateParticles(deltaTime) {
        // 重置帧子弹轨迹计数
        this.frameBulletTrails = 0;
        
        // 粒子数量警告阈值
        const MAX_PARTICLES = 500;
        
        // 从后往前遍历，避免使用filter分配新数组
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            if (particle.active) {
                particle.update(deltaTime);
            }
            
            // 如果粒子死亡，移除并归还池
            if (particle.isDead()) {
                // 尝试归还到子弹轨迹池
                if (particle.size <= 4 && particle.lifetime <= 150) {
                    this._releaseBulletTrail(particle);
                }
                this.particles.splice(i, 1);
            }
        }
        
        // 粒子数量警告
        if (this.particles.length >= MAX_PARTICLES) {
            if (this.particles.length === MAX_PARTICLES) {
                console.warn(`粒子数量达到上限: ${MAX_PARTICLES}`);
            }
        }
    }
    
    /**
     * 检查碰撞
     */
    checkCollisions() {
        // 玩家与敌人碰撞
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;
            
            if (this.checkCollision(this.player, enemy)) {
                this.playerHitByEnemy(enemy);
            }
        });
        
        // 敌人子弹与玩家碰撞
        this.bullets.forEach(bullet => {
            if (!bullet.active || !bullet.isEnemyBullet) return;

            if (this.checkBulletCollision(bullet, this.player)) {
                bullet.active = false;
                if (!this.state.getData().isInvincible) {
                    const damage = bullet.damage || 1;
                    let actualDamage = damage;
                    if (this.player.passiveSkill) {
                        actualDamage = this.player.passiveSkill.onTakeDamage(damage);
                    }
                    if (actualDamage > 0) {
                        this.rageSystem.onHurt();
                        this.player.triggerHitFlash();
                        camera.shake(FEEDBACK.SCREEN_SHAKE.PLAYER_HURT.intensity, FEEDBACK.SCREEN_SHAKE.PLAYER_HURT.duration);
                        const knockbackDir = { x: bullet.dirX || 0, y: bullet.dirY || 0 };
                        this.player.applyKnockback(knockbackDir, FEEDBACK.KNOCKBACK.PLAYER_FORCE);
                    }
                    this.state.playerHurt(actualDamage);
                    this.spawnDamageParticles(this.player.x, this.player.y);
                    audioManager.playSound(AUDIO.HURT);
                }
            }
        });

        // Boss与玩家碰撞
        if (this.boss && this.boss.alive) {
            if (this.checkCollision(this.player, this.boss)) {
                this.playerHitByBoss();
            }
        }
        
        // 子弹与敌人碰撞（已在各个handle*函数中完整处理，包括普通敌人和Boss召唤的小怪）
        this.bullets.forEach(bullet => {
            if (!bullet.active || bullet.isEnemyBullet) return;

            // 闪电子弹处理穿透
            if (bullet.bulletType === 'lightning') {
                this.handleLightningBulletCollision(bullet);
            }
            // 榴弹处理爆炸
            else if (bullet.bulletType === 'grenade') {
                this.handleGrenadeBulletCollision(bullet);
            }
            // 冰冻子弹处理减速
            else if (bullet.bulletType === 'freeze') {
                this.handleFreezeBulletCollision(bullet);
            }
            // 散弹子弹
            else if (bullet.bulletType === 'shotgun') {
                this.handleNormalBulletCollision(bullet);
            }
            // 追踪导弹处理爆炸
            else if (bullet.bulletType === 'homing') {
                this.handleHomingBulletCollision(bullet);
            }
            // 普通子弹
            else {
                this.handleNormalBulletCollision(bullet);
            }
        });
    }
    
    /**
     * 对敌人造成爆炸伤害并应用击退（从爆炸中心向外）
     * @param {Object} enemy - 敌人对象
     * @param {number} damage - 伤害值
     * @param {number} explosionX - 爆炸中心X坐标
     * @param {number} explosionY - 爆炸中心Y坐标
     * @param {number} forceMultiplier - 击退力倍率（爆炸击退更强）
     */
    damageEnemyWithExplosion(enemy, damage, explosionX, explosionY, forceMultiplier = 1.5) {
        // 计算击退方向（从爆炸中心指向敌人）
        const dx = enemy.x - explosionX;
        const dy = enemy.y - explosionY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const knockbackDir = { x: dx / dist, y: dy / dist };
        
        // 计算击退力度（爆炸击退更强）
        const knockbackForce = (FEEDBACK.KNOCKBACK.ENEMY_BASE_FORCE + 
            damage * FEEDBACK.KNOCKBACK.ENEMY_DAMAGE_MULT) * forceMultiplier;
        
        // 应用伤害和击退
        enemy.takeDamage(damage, knockbackDir, knockbackForce);
    }
    
    /**
     * 对Boss造成伤害并应用击退
     * @param {number} damage - 伤害值
     * @param {Object} bullet - 子弹对象（用于计算击退方向）
     */
    damageBoss(damage, bullet) {
        if (!this.boss || !this.boss.alive) return;
        
        // 计算击退方向（子弹飞行方向）
        let dirX = 0;
        let dirY = 0;
        
        if (bullet) {
            if (bullet.velX !== undefined && bullet.velY !== undefined) {
                dirX = bullet.velX;
                dirY = bullet.velY;
            } else {
                dirX = bullet.x - this.player.x;
                dirY = bullet.y - this.player.y;
            }
        }
        
        const dist = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        const knockbackDir = { x: dirX / dist, y: dirY / dist };
        
        // 计算击退力度（Boss击退较弱）
        const knockbackForce = (FEEDBACK.KNOCKBACK.ENEMY_BASE_FORCE + 
            damage * FEEDBACK.KNOCKBACK.ENEMY_DAMAGE_MULT) * 0.3;
        
        // 应用伤害和击退
        this.boss.takeDamage(damage, knockbackDir, knockbackForce);
    }
    
    /**
     * 对Boss造成爆炸伤害并应用击退
     * @param {number} damage - 伤害值
     * @param {number} explosionX - 爆炸中心X坐标
     * @param {number} explosionY - 爆炸中心Y坐标
     */
    damageBossWithExplosion(damage, explosionX, explosionY) {
        if (!this.boss || !this.boss.alive) return;
        
        // 计算击退方向（从爆炸中心指向Boss）
        const dx = this.boss.x - explosionX;
        const dy = this.boss.y - explosionY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const knockbackDir = { x: dx / dist, y: dy / dist };
        
        // 计算击退力度（爆炸击退，Boss击退较弱）
        const knockbackForce = (FEEDBACK.KNOCKBACK.ENEMY_BASE_FORCE + 
            damage * FEEDBACK.KNOCKBACK.ENEMY_DAMAGE_MULT) * 1.5 * 0.3;
        
        // 应用伤害和击退
        this.boss.takeDamage(damage, knockbackDir, knockbackForce);
    }
    
    /**
     * 对敌人造成伤害并应用击退
     * @param {Object} enemy - 敌人对象
     * @param {number} damage - 伤害值
     * @param {Object} bullet - 子弹对象（用于计算击退方向）
     */
    damageEnemy(enemy, damage, bullet) {
        // 计算击退方向（子弹飞行方向）
        let dirX = 0;
        let dirY = 0;
        
        if (bullet) {
            if (bullet.velX !== undefined && bullet.velY !== undefined) {
                dirX = bullet.velX;
                dirY = bullet.velY;
            } else {
                dirX = bullet.x - this.player.x;
                dirY = bullet.y - this.player.y;
            }
        }
        
        const dist = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        const knockbackDir = { x: dirX / dist, y: dirY / dist };
        
        // 计算击退力度（基于伤害）
        const knockbackForce = FEEDBACK.KNOCKBACK.ENEMY_BASE_FORCE + 
            damage * FEEDBACK.KNOCKBACK.ENEMY_DAMAGE_MULT;
        
        // 应用伤害和击退
        enemy.takeDamage(damage, knockbackDir, knockbackForce);
    }
    
    /**
     * 处理普通子弹碰撞
     * @param {Bullet} bullet - 子弹
     */
    handleNormalBulletCollision(bullet) {
        // 检查与敌人碰撞
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;
            
            if (this.checkBulletCollision(bullet, enemy)) {
                this.damageEnemy(enemy, bullet.damage, bullet);
                bullet.active = false;
                
                // 生成受伤粒子
                this.spawnHitParticles(enemy.x, enemy.y, enemy.color);
                
                // 检查敌人死亡
                if (!enemy.alive) {
                    this.onEnemyKilled(enemy);
                }
            }
        });
        
        // 检查与Boss碰撞
        if (this.boss && this.boss.alive) {
            if (this.checkBulletCollision(bullet, this.boss)) {
                this.damageBoss(bullet.damage, bullet);
                bullet.active = false;
                
                // 生成受伤粒子
                this.spawnHitParticles(this.boss.x, this.boss.y, this.boss.color);
                
                // 检查Boss死亡
                if (!this.boss.alive) {
                    this.onBossKilled();
                }
            }
        }
    }
    
    /**
     * 处理闪电子弹碰撞（可穿透）
     * @param {LightningBullet} bullet - 闪电子弹
     */
    handleLightningBulletCollision(bullet) {
        // 检查与敌人碰撞
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;
            
            if (this.checkBulletCollision(bullet, enemy)) {
                this.damageEnemy(enemy, bullet.damage, bullet);
                
                // 生成受伤粒子
                this.spawnHitParticles(enemy.x, enemy.y, enemy.color);
                
                // 检查敌人死亡
                if (!enemy.alive) {
                    this.onEnemyKilled(enemy);
                }
                
                // 穿透逻辑
                if (!bullet.penetrate()) {
                    bullet.active = false;
                }
            }
        });
        
        // 检查与Boss碰撞
        if (this.boss && this.boss.alive) {
            if (this.checkBulletCollision(bullet, this.boss)) {
                this.damageBoss(bullet.damage, bullet);
                
                // 生成受伤粒子
                this.spawnHitParticles(this.boss.x, this.boss.y, this.boss.color);
                
                // 检查Boss死亡
                if (!this.boss.alive) {
                    this.onBossKilled();
                }
                
                // 穿透逻辑
                if (!bullet.penetrate()) {
                    bullet.active = false;
                }
            }
        }
    }
    
    /**
     * 处理榴弹碰撞（爆炸范围伤害）
     * @param {GrenadeBullet} bullet - 榴弹
     */
    handleGrenadeBulletCollision(bullet) {
        // 检查是否已经爆炸
        if (bullet.hasExploded) return;
        
        let exploded = false;
        
        // 检查与敌人碰撞
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;
            
            if (this.checkBulletCollision(bullet, enemy)) {
                exploded = true;
            }
        });
        
        // 检查与Boss碰撞
        if (this.boss && this.boss.alive) {
            if (this.checkBulletCollision(bullet, this.boss)) {
                exploded = true;
            }
        }
        
        // 触地爆炸
        if (!exploded && !bullet.active) {
            exploded = true;
        }
        
        if (exploded) {
            this.explodeGrenade(bullet);
        }
    }
    
    /**
     * 榴弹爆炸处理
     * @param {GrenadeBullet} bullet - 榴弹
     */
    explodeGrenade(bullet) {
        if (bullet.hasExploded) return;
        bullet.hasExploded = true;
        bullet.active = false;
        
        const explosionRadius = bullet.getExplosionRadius();
        
        // 触发爆炸屏幕震动
        camera.shake(FEEDBACK.SCREEN_SHAKE.EXPLOSION.intensity, FEEDBACK.SCREEN_SHAKE.EXPLOSION.duration);
        
        // 对范围内敌人造成伤害
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;
            
            const dx = enemy.x - bullet.x;
            const dy = enemy.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= explosionRadius) {
                this.damageEnemyWithExplosion(enemy, bullet.damage, bullet.x, bullet.y);
                this.spawnHitParticles(enemy.x, enemy.y, enemy.color);
                
                if (!enemy.alive) {
                    this.onEnemyKilled(enemy);
                }
            }
        });
        
        // 对Boss造成伤害
        if (this.boss && this.boss.alive) {
            const dx = this.boss.x - bullet.x;
            const dy = this.boss.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= explosionRadius) {
                this.damageBossWithExplosion(bullet.damage, bullet.x, bullet.y);
                this.spawnHitParticles(this.boss.x, this.boss.y, this.boss.color);
                
                if (!this.boss.alive) {
                    this.onBossKilled();
                }
            }
        }
        
        // 生成爆炸粒子效果
        this.spawnExplosionParticles(bullet.x, bullet.y);
    }
    
    /**
     * 处理冰冻子弹碰撞（减速敌人）
     * @param {FreezeBullet} bullet - 冰冻子弹
     */
    handleFreezeBulletCollision(bullet) {
        // 检查与敌人碰撞
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;
            
            if (this.checkBulletCollision(bullet, enemy)) {
                this.damageEnemy(enemy, bullet.damage, bullet);
                // 应用冰冻效果
                enemy.applyFreeze(bullet.slowFactor, bullet.slowDuration);
                bullet.active = false;
                
                // 生成受伤粒子
                this.spawnHitParticles(enemy.x, enemy.y, COLORS.BULLET.FREEZE);
                
                // 检查敌人死亡
                if (!enemy.alive) {
                    this.onEnemyKilled(enemy);
                }
            }
        });
        
        // 检查与Boss碰撞
        if (this.boss && this.boss.alive) {
            if (this.checkBulletCollision(bullet, this.boss)) {
                this.damageBoss(bullet.damage, bullet);
                // Boss也可以被减速
                if (this.boss.applyFreeze) {
                    this.boss.applyFreeze(bullet.slowFactor, bullet.slowDuration);
                }
                bullet.active = false;
                
                // 生成受伤粒子
                this.spawnHitParticles(this.boss.x, this.boss.y, COLORS.BULLET.FREEZE);
                
                // 检查Boss死亡
                if (!this.boss.alive) {
                    this.onBossKilled();
                }
            }
        }
    }
    
    /**
     * 处理追踪导弹碰撞（爆炸伤害）
     * @param {HomingBullet} bullet - 追踪导弹
     */
    handleHomingBulletCollision(bullet) {
        if (bullet.hasExploded) return;
        
        let exploded = false;
        
        // 检查与敌人碰撞
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;
            
            if (this.checkBulletCollision(bullet, enemy)) {
                exploded = true;
            }
        });
        
        // 检查与Boss碰撞
        if (this.boss && this.boss.alive) {
            if (this.checkBulletCollision(bullet, this.boss)) {
                exploded = true;
            }
        }
        
        // 触地/边界爆炸
        if (!exploded && !bullet.active) {
            exploded = true;
        }
        
        if (exploded) {
            this.explodeHoming(bullet);
        }
    }
    
    /**
     * 追踪导弹爆炸处理
     * @param {HomingBullet} bullet - 追踪导弹
     */
    explodeHoming(bullet) {
        if (bullet.hasExploded) return;
        bullet.hasExploded = true;
        bullet.active = false;
        
        const explosionRadius = bullet.explosionRadius || 20;
        
        // 触发爆炸屏幕震动
        camera.shake(FEEDBACK.SCREEN_SHAKE.EXPLOSION.intensity, FEEDBACK.SCREEN_SHAKE.EXPLOSION.duration);
        
        // 对范围内敌人造成伤害
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;
            
            const dx = enemy.x - bullet.x;
            const dy = enemy.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= explosionRadius) {
                this.damageEnemyWithExplosion(enemy, bullet.damage, bullet.x, bullet.y);
                this.spawnHitParticles(enemy.x, enemy.y, enemy.color);
                
                if (!enemy.alive) {
                    this.onEnemyKilled(enemy);
                }
            }
        });
        
        // 对Boss造成伤害
        if (this.boss && this.boss.alive) {
            const dx = this.boss.x - bullet.x;
            const dy = this.boss.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= explosionRadius) {
                this.damageBossWithExplosion(bullet.damage, bullet.x, bullet.y);
                this.spawnHitParticles(this.boss.x, this.boss.y, this.boss.color);
                
                if (!this.boss.alive) {
                    this.onBossKilled();
                }
            }
        }
        
        // 生成爆炸粒子效果（紫色）
        this.spawnHomingExplosionParticles(bullet.x, bullet.y);
    }
    
    /**
     * 生成追踪导弹爆炸粒子效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    spawnHomingExplosionParticles(x, y) {
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                COLORS.BULLET.HOMING,
                3 + Math.random() * 3,
                300 + Math.random() * 200
            ));
        }
    }
    
    /**
     * 生成爆炸碎片粒子效果（榴弹爆炸时）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    spawnExplosionParticles(x, y) {
        const colors = ['#ff5722', '#ff9800', '#ffeb3b', '#ffffff'];
        
        // 爆炸碎片
        const count = 8 + Math.floor(Math.random() * 5);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const size = 3 + Math.random() * 4;
            const lifetime = 300 + Math.random() * 400;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const particle = new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, size, lifetime);
            particle.setKind(PARTICLES.KIND.SQUARE);
            particle.setGravity(0.1);
            particle.setFriction(0.95);
            this.particles.push(particle);
        }
        
        // 烟雾粒子
        const smokeCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < smokeCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1;
            const size = 6 + Math.random() * 8;
            const lifetime = 500 + Math.random() * 500;
            
            const particle = new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#666666', size, lifetime);
            particle.setKind(PARTICLES.KIND.CIRCLE);
            particle.setGravity(-0.02);
            particle.setFriction(0.97);
            this.particles.push(particle);
        }
    }
    
    /**
     * 检查两个实体是否碰撞（AABB）
     * @param {Object} a - 实体A
     * @param {Object} b - 实体B
     */
    checkCollision(a, b) {
        const sizeA = a.size || PIXEL_SIZE.PLAYER;
        const sizeB = b.size || PIXEL_SIZE.ENEMY;
        
        return a.x - sizeA / 2 < b.x + sizeB / 2 &&
               a.x + sizeA / 2 > b.x - sizeB / 2 &&
               a.y - sizeA / 2 < b.y + sizeB / 2 &&
               a.y + sizeA / 2 > b.y - sizeB / 2;
    }
    
    /**
     * 检查子弹与目标碰撞
     * @param {Object} bullet - 子弹
     * @param {Object} target - 目标
     */
    checkBulletCollision(bullet, target) {
        const targetSize = target.size || PIXEL_SIZE.ENEMY;
        const bulletSize = PIXEL_SIZE.BULLET;
        
        return bullet.x - bulletSize / 2 < target.x + targetSize / 2 &&
               bullet.x + bulletSize / 2 > target.x - targetSize / 2 &&
               bullet.y - bulletSize / 2 < target.y + targetSize / 2 &&
               bullet.y + bulletSize / 2 > target.y - targetSize / 2;
    }
    
    /**
     * 玩家被敌人击中
     * @param {Object} enemy - 敌人
     */
    playerHitByEnemy(enemy) {
        if (this.state.getData().isInvincible) return;
        
        const damage = enemy.damage || 1;
        
        // 计算实际伤害（考虑被动技能减伤）
        let actualDamage = damage;
        if (this.player.passiveSkill) {
            actualDamage = this.player.passiveSkill.onTakeDamage(damage);
        }
        
        if (actualDamage > 0) {
            // 增加怒气
            this.rageSystem.onHurt();
            // 设置受伤闪白
            this.player.triggerHitFlash();
            
            // 触发屏幕震动
            camera.shake(FEEDBACK.SCREEN_SHAKE.PLAYER_HURT.intensity, FEEDBACK.SCREEN_SHAKE.PLAYER_HURT.duration);
            
            // 计算击退方向（从敌人指向玩家）
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const knockbackDir = { x: dx / dist, y: dy / dist };
            
            // 应用玩家击退
            this.player.applyKnockback(knockbackDir, FEEDBACK.KNOCKBACK.PLAYER_FORCE);
        }
        
        this.state.playerHurt(actualDamage);
        
        // 生成受伤粒子
        this.spawnDamageParticles(this.player.x, this.player.y);
        
        // 播放受伤音效
        audioManager.playSound(AUDIO.HURT);
        
        if (this.state.isState(GAME_STATE.GAME_OVER)) {
            console.log('玩家死亡');
        }
    }
    
    /**
     * 玩家被Boss击中
     */
    playerHitByBoss() {
        if (this.state.getData().isInvincible) return;
        
        // 冲锋时伤害翻倍
        let damage = BOSS.DAMAGE;
        if (this.boss && this.boss.isCharging) {
            damage = this.boss.getChargeDamage();
        }
        
        // 计算实际伤害（考虑被动技能减伤）
        let actualDamage = damage;
        if (this.player.passiveSkill) {
            actualDamage = this.player.passiveSkill.onTakeDamage(damage);
        }
        
        if (actualDamage > 0) {
            // 增加怒气
            this.rageSystem.onHurt();
            // 设置受伤闪红
            this.player.hurtFlashTimer = 200;
        }
        
        this.state.playerHurt(actualDamage);
        
        // 生成受伤粒子
        this.spawnDamageParticles(this.player.x, this.player.y);
        
        // 播放受伤音效
        audioManager.playSound(AUDIO.HURT);
        
        if (this.state.isState(GAME_STATE.GAME_OVER)) {
            console.log('玩家死亡');
        }
    }
    
    /**
     * 敌人被击杀
     * @param {Object} enemy - 敌人
     */
    onEnemyKilled(enemy) {
        this.state.addKill();
        
        // 增加怒气
        const rageGain = this.player.rageGainBonus 
            ? RAGE.KILL_RAGE_GAIN * (1 + this.player.rageGainBonus) 
            : RAGE.KILL_RAGE_GAIN;
        this.rageSystem.addRage(rageGain);
        
        // 触发被动技能
        if (this.player.passiveSkill) {
            this.player.passiveSkill.onKillEnemy(enemy);
        }
        
        // 生成死亡粒子
        this.spawnDeathParticles(enemy.x, enemy.y, enemy.color);
        
        // 播放击杀音效
        audioManager.playSound(AUDIO.KILL);
        
        // 触发屏幕震动
        camera.shake(FEEDBACK.SCREEN_SHAKE.ENEMY_KILLED.intensity, FEEDBACK.SCREEN_SHAKE.ENEMY_KILLED.duration);
        
        // 30%概率掉落武器
        if (Math.random() < 0.3) {
            this.spawnWeaponDrop(enemy.x, enemy.y);
        }
        
        // 道具掉落
        let dropChance = 0.4;
        if (this.player.dropRateBonus) {
            dropChance *= (1 + this.player.dropRateBonus);
        }
        
        if (Math.random() < dropChance) {
            this.spawnItemDrop(enemy.x, enemy.y);
        }
        
        // 成就追踪
        this.achievementManager.onKill(false);
        
        // 发布敌人死亡事件
        if (this.eventBus) {
            this.eventBus.publish('ENEMY_KILLED', { enemy, killer: this.player });
        }
    }
    
    /**
     * Boss被击杀
     */
    onBossKilled() {
        console.log('Boss被击杀!');
        
        // 生成爆炸粒子效果
        this.spawnBossExplosion(this.boss.x, this.boss.y);
        
        // 增加击杀数（Boss算10个击杀）
        for (let i = 0; i < 10; i++) {
            this.state.addKill();
        }
        
        // 播放胜利音效
        audioManager.playSound(AUDIO.VICTORY);
        
        // Boss击杀成就
        const data = this.state.getData();
        this.achievementManager.onBossKilled(data.playerHealth, data.maxHealth || PLAYER.MAX_HEALTH);
        
        // 发布Boss死亡事件
        if (this.eventBus) {
            this.eventBus.publish('BOSS_DEATH', { boss: this.boss });
        }
        
        // 触发通关
        setTimeout(() => {
            this.state.victory();
        }, 2000);
    }
    
    /**
     * 敌人死亡事件处理（通过事件总线）
     * @param {Object} data - 事件数据
     */
    onEnemyKilledEvent(data) {
        const { enemy } = data;
        if (!enemy) return;
        
        this.spawnDeathParticles(enemy.x, enemy.y, enemy.color);
        camera.shake(FEEDBACK.SCREEN_SHAKE.ENEMY_KILLED.intensity, FEEDBACK.SCREEN_SHAKE.ENEMY_KILLED.duration);
    }
    
    /**
     * 玩家受伤事件处理（通过事件总线）
     * @param {Object} data - 事件数据
     */
    onPlayerHurtEvent(data) {
        const { damage, attacker } = data;
        
        this.rageSystem.onHurt();
        this.player.triggerHitFlash();
        camera.shake(FEEDBACK.SCREEN_SHAKE.PLAYER_HURT.intensity, FEEDBACK.SCREEN_SHAKE.PLAYER_HURT.duration);
        
        if (attacker) {
            const dx = this.player.x - attacker.x;
            const dy = this.player.y - attacker.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const knockbackDir = { x: dx / dist, y: dy / dist };
            this.player.applyKnockback(knockbackDir, FEEDBACK.KNOCKBACK.PLAYER_FORCE);
        }
        
        this.spawnDamageParticles(this.player.x, this.player.y);
        audioManager.playSound(AUDIO.HURT);
    }
    
    /**
     * 技能使用事件处理（通过事件总线）
     * @param {Object} data - 事件数据
     */
    onSkillUsedEvent(data) {
        const { skill, player } = data;
        if (player && player.triggerSkillCast) {
            player.triggerSkillCast();
        }
    }
    
    /**
     * Boss出现事件处理（通过事件总线）
     * @param {Object} data - 事件数据
     */
    onBossSpawnEvent(data) {
        const { boss } = data;
        if (boss) {
            this.boss = boss;
        }
        audioManager.playSound(AUDIO.BOSS_APPEAR);
    }
    
    /**
     * Boss死亡事件处理（通过事件总线）
     * @param {Object} data - 事件数据
     */
    onBossDeathEvent(data) {
        const { boss } = data;
        if (boss && boss.x !== undefined && boss.y !== undefined) {
            this.spawnBossExplosion(boss.x, boss.y);
        }
        audioManager.playSound(AUDIO.VICTORY);
    }
    
    /**
     * 房间清除事件处理（通过事件总线）
     * @param {Object} data - 事件数据
     */
    onRoomClearedEvent(data) {
        const { roomIndex } = data;
        console.log(`房间 ${roomIndex + 1} 已清除`);
        
        setTimeout(() => {
            if (this.currentRoom) {
                this.currentRoom.spawnPortal();
            }
        }, PORTAL.SPAWN_DELAY);
    }
    
    /**
     * 武器拾取事件处理（通过事件总线）
     * @param {Object} data - 事件数据
     */
    onWeaponPickupEvent(data) {
        const { weapon, player } = data;
        if (player && player.triggerWeaponSwitch) {
            player.triggerWeaponSwitch();
        }
    }
    
    /**
     * 金币获得事件处理（通过事件总线）
     * @param {Object} data - 事件数据
     */
    onGoldEarnedEvent(data) {
        const { amount } = data;
        this.achievementManager.onGoldEarned(amount);
    }
    
    /**
     * Buff应用事件处理（通过事件总线）
     * @param {Object} data - 事件数据
     */
    onBuffAppliedEvent(data) {
        const { buff, target } = data;
        if (target && target.x !== undefined && target.y !== undefined) {
            this.spawnHitParticles(target.x, target.y, '#4caf50');
        }
    }
    
    /**
     * 生成道具掉落
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    spawnItemDrop(x, y) {
        const rand = Math.random();
        let item;
        
        if (rand < 0.4) {
            const goldAmount = 5 + Math.floor(Math.random() * 15);
            item = ItemFactory.createGold(goldAmount);
        } else if (rand < 0.6) {
            item = PotionFactory.createHealthPotion(1);
        } else if (rand < 0.75) {
            item = ItemFactory.createBomb(1);
        } else if (rand < 0.85) {
            item = ItemFactory.createFood(1);
        } else if (rand < 0.92) {
            item = PotionFactory.createRandomPotion('uncommon');
        } else if (rand < 0.97) {
            item = ItemFactory.createKey(1);
        } else {
            item = RelicFactory.createRandomRelic('rare');
            if (item.rarity === 'legendary') {
                this.achievementManager.onLegendaryDrop();
            }
        }
        
        if (item) {
            const offsetX = (Math.random() - 0.5) * 30;
            const offsetY = (Math.random() - 0.5) * 30;
            this.dropManager.addDrop(item, x + offsetX, y + offsetY);
        }
    }
    
    /**
     * 检查道具拾取
     */
    checkItemPickup() {
        if (!this.player) return;
        
        const pickedUp = this.dropManager.pickUpInRange(
            this.player.x, 
            this.player.y, 
            this.inventory
        );
        
        pickedUp.forEach(item => {
            this.achievementManager.onItemCollected(item.id);
            
            if (item.rarity === 'legendary') {
                this.achievementManager.onLegendaryDrop();
            }
            
            if (item.id === 'gold') {
                let goldAmount = item.count;
                if (this.player.goldGainBonus) {
                    goldAmount = Math.floor(goldAmount * (1 + this.player.goldGainBonus));
                }
                this.achievementManager.onGoldEarned(goldAmount);
            }
            
            if (item.id === 'gem') {
                this.achievementManager.onGemsEarned(item.count);
            }
        });
    }
    
    /**
     * 检查成就通知
     */
    checkAchievementNotifications() {
        const achievement = this.achievementManager.popNewAchievement();
        if (achievement) {
            this.achievementNotifications.push({
                achievement: achievement,
                timer: 3000,
                y: -50
            });
            
            if (achievement.reward) {
                if (achievement.reward.gold) {
                    this.inventory.addGold(achievement.reward.gold, this.player);
                }
                if (achievement.reward.gems) {
                    this.inventory.addGems(achievement.reward.gems);
                }
            }
        }
        
        for (let i = this.achievementNotifications.length - 1; i >= 0; i--) {
            const notif = this.achievementNotifications[i];
            notif.timer -= 16;
            
            if (notif.y < 20) {
                notif.y += 2;
            }
            
            if (notif.timer <= 0) {
                this.achievementNotifications.splice(i, 1);
            }
        }
    }
    
    /**
     * 使用背包道具
     * @param {number} slotIndex - 槽位索引
     * @returns {boolean}
     */
    useInventoryItem(slotIndex) {
        const item = this.inventory.getItem(slotIndex);
        if (!item) return false;
        
        if (item.type === 'potion') {
            this.achievementManager.onPotionUsed();
        }
        
        return this.inventory.useItem(slotIndex, this);
    }
    
    /**
     * 切换背包显示
     */
    toggleInventory() {
        this.inventoryOpen = !this.inventoryOpen;
        if (this.inventoryOpen) {
            this.shopManager.closeShop();
        }
    }
    
    /**
     * 与商人交互
     */
    interactWithShop() {
        if (this.shopManager.canInteract(this.player.x, this.player.y)) {
            this.shopManager.interact();
            this.inventoryOpen = false;
        }
    }
    
    /**
     * 关闭商店
     */
    closeShop() {
        this.shopManager.closeShop();
    }
    
    /**
     * 购买商店物品
     * @param {number} index - 商品索引
     * @returns {boolean}
     */
    buyShopItem(index) {
        return this.shopManager.buyItem(index, this.inventory);
    }
    
    /**
     * 更新房间（每帧调用）
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updateRoom(deltaTime) {
        if (this.currentRoom) {
            this.currentRoom.update(deltaTime, this.player, this);
            
            this.currentRoom.updatePortalParticles(deltaTime, this.particles);
        }
    }
    
    /**
     * 检查房间是否已清除
     */
    checkRoomClear() {
        if (!this.currentRoom) return;
        
        const roomCompleted = this.currentRoom.checkRoomCompleted(this);
        
        if (roomCompleted && !this.allEnemiesCleared) {
            this.allEnemiesCleared = true;
            
            const roomType = this.currentRoom.roomType;
            const isBossRoom = roomType === ROOM_TYPES.BOSS || this.boss;
            
            if (!isBossRoom) {
                setTimeout(() => {
                    if (this.currentRoom) {
                        this.currentRoom.spawnPortal();
                    }
                }, PORTAL.SPAWN_DELAY);
            }
        }
    }
    
    /**
     * 角度插值（最短路径插值）
     * @param {number} from - 起始角度
     * @param {number} to - 目标角度
     * @param {number} t - 插值系数 (0-1)
     * @returns {number} 插值后的角度
     */
    lerpAngle(from, to, t) {
        let diff = to - from;
        
        // 调整差值到 -PI 到 PI 之间
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        
        return from + diff * t;
    }
    
    /**
     * 计算辅助瞄准
     * @param {number} playerX - 玩家X坐标
     * @param {number} playerY - 玩家Y坐标
     * @param {number} targetX - 原始目标X坐标
     * @param {number} targetY - 原始目标Y坐标
     * @param {number} strength - 辅助强度 (0-1)
     * @returns {Object} 修正后的目标坐标 {x, y}
     */
    calculateAimAssist(playerX, playerY, targetX, targetY, strength) {
        if (!this.aimAssist.enabled || strength <= 0) {
            return { x: targetX, y: targetY };
        }
        
        // 计算原始角度
        const baseAngle = Math.atan2(targetY - playerY, targetX - playerX);
        const baseDistance = Math.sqrt((targetX - playerX) ** 2 + (targetY - playerY) ** 2);
        
        // 收集所有敌人（包括Boss）
        const allEnemies = [];
        for (const enemy of this.enemies) {
            if (enemy.alive) {
                allEnemies.push(enemy);
            }
        }
        if (this.boss && this.boss.alive) {
            allEnemies.push(this.boss);
        }
        
        // 找到最近的、在辅助角度范围内的敌人
        let nearestEnemy = null;
        let nearestAngleDiff = Infinity;
        
        for (const enemy of allEnemies) {
            // 计算敌人相对于玩家的角度
            const angle = Math.atan2(enemy.y - playerY, enemy.x - playerX);
            
            // 计算角度差
            let angleDiff = Math.abs(angle - baseAngle);
            if (angleDiff > Math.PI) {
                angleDiff = Math.PI * 2 - angleDiff;
            }
            
            // 计算距离
            const dist = Math.sqrt((enemy.x - playerX) ** 2 + (enemy.y - playerY) ** 2);
            
            // 如果在角度和距离范围内，并且角度差更小
            if (angleDiff < AIM_ASSIST.ASSIST_ANGLE && dist < AIM_ASSIST.ASSIST_RANGE) {
                if (angleDiff < nearestAngleDiff) {
                    nearestAngleDiff = angleDiff;
                    nearestEnemy = enemy;
                }
            }
        }
        
        // 如果找到目标敌人，进行角度修正
        if (nearestEnemy) {
            const targetAngle = Math.atan2(nearestEnemy.y - playerY, nearestEnemy.x - playerX);
            
            // 计算辅助强度（距离越近、角度差越小，辅助越强）
            const angleFactor = 1 - nearestAngleDiff / AIM_ASSIST.ASSIST_ANGLE;
            const assistAmount = angleFactor * strength;
            
            // 混合原始角度和目标角度
            const finalAngle = this.lerpAngle(baseAngle, targetAngle, assistAmount);
            
            // 计算修正后的目标坐标
            return {
                x: playerX + Math.cos(finalAngle) * baseDistance,
                y: playerY + Math.sin(finalAngle) * baseDistance
            };
        }
        
        return { x: targetX, y: targetY };
    }
    
    /**
     * 获取辅助瞄准强度
     * @returns {number} 辅助强度值
     */
    getAimAssistStrength() {
        if (!this.aimAssist.enabled) return 0;
        
        let strength = 0;
        
        // 从设置系统获取强度
        if (typeof settingsManager !== 'undefined') {
            strength = settingsManager.getAimAssistStrength();
        } else {
            strength = AIM_ASSIST.STRENGTH_LEVELS[AIM_ASSIST.DEFAULT_STRENGTH.toUpperCase()] || 0;
        }
        
        // 如果瞄准增强激活（LT键），增强辅助
        if (inputManager.isAimBoostActive()) {
            strength *= 1.5;
        }
        
        return Math.min(strength, 1.0);
    }
    
    /**
     * 处理射击
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    handleShooting(deltaTime) {
        // 更新射击冷却
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
        
        // 检查是否正在射击
        if (!inputManager.isShooting()) return;
        if (this.shootCooldown > 0) return;
        
        // 获取当前武器
        const weapon = this.state.getCurrentWeapon();
        if (!weapon) return;
        
        // 检查弹药
        if (weapon.AMMO <= 0) {
            // 切换到手枪
            if (weapon.ID !== 1) {
                // 找到手枪并切换
                const weapons = this.state.getData().playerWeapons;
                const pistolIndex = weapons.findIndex(w => w.ID === 1);
                if (pistolIndex !== -1) {
                    this.state.data.currentWeaponIndex = pistolIndex;
                }
            }
            return;
        }
        
        // 获取原始瞄准目标
        const mousePos = inputManager.getMouseWorldPosition();
        
        // 计算辅助瞄准
        const aimAssistStrength = this.getAimAssistStrength();
        const assistedTarget = this.calculateAimAssist(
            this.player.x,
            this.player.y,
            mousePos.x,
            mousePos.y,
            aimAssistStrength
        );
        
        // 计算射击方向
        const dx = assistedTarget.x - this.player.x;
        const dy = assistedTarget.y - this.player.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return;
        
        const direction = {
            x: dx / length,
            y: dy / length
        };
        
        // 创建子弹
        this.createBullet(weapon, direction);
        
        // 应用射击反馈（后坐力 + 枪口闪光）
        this.applyShootFeedback(weapon, direction);
        
        // 设置射击冷却
        this.shootCooldown = weapon.FIRE_RATE;
        
        // 消耗弹药（如果不是无限弹药）
        if (weapon.AMMO !== Infinity) {
            weapon.AMMO--;
        }
    }
    
    applyShootFeedback(weapon, direction) {
        const feedback = SHOOT_FEEDBACK.SCREEN_SHAKE[weapon.NAME];
        if (feedback && camera) {
            camera.shake(feedback.intensity, feedback.duration);
        }
    }
    
    /**
     * 创建子弹
     * @param {Object} weapon - 武器数据
     * @param {Object} direction - 射击方向
     */
    createBullet(weapon, direction) {
        // 播放射击音效
        this.playShootSound(weapon);
        
        // 根据武器类型创建不同子弹
        switch (weapon.ID) {
            case WEAPONS.LIGHTNING.ID:
                // 闪电法杖 - 可穿透
                const lightningBullet = new LightningBullet(
                    this.player.x,
                    this.player.y,
                    direction.x,
                    direction.y,
                    weapon
                );
                this.bullets.push(lightningBullet);
                break;
                
            case WEAPONS.GRENADE.ID:
                // 榴弹发射器 - 爆炸范围
                const grenadeBullet = new GrenadeBullet(
                    this.player.x,
                    this.player.y,
                    direction.x,
                    direction.y,
                    weapon
                );
                this.bullets.push(grenadeBullet);
                break;
                
            case WEAPONS.FLAME.ID:
                // 火焰喷射器 - 短距离
                const flameBullet = new FlameBullet(
                    this.player.x,
                    this.player.y,
                    direction.x,
                    direction.y,
                    weapon
                );
                this.bullets.push(flameBullet);
                break;
                
            case WEAPONS.BOOMERANG.ID:
                // 回旋镖 - 返回
                const boomerangBullet = new BoomerangBullet(
                    this.player.x,
                    this.player.y,
                    direction.x,
                    direction.y,
                    weapon
                );
                boomerangBullet.setPlayerPosition(this.player.getPosition());
                this.bullets.push(boomerangBullet);
                break;
                
            case WEAPONS.FREEZE.ID:
                // 冰冻枪 - 减速敌人
                const freezeBullet = new FreezeBullet(
                    this.player.x,
                    this.player.y,
                    direction.x,
                    direction.y,
                    {
                        damage: weapon.DAMAGE,
                        speed: weapon.BULLET_SPEED,
                        color: COLORS.BULLET.FREEZE,
                        slowFactor: weapon.SLOW_FACTOR,
                        slowDuration: weapon.SLOW_DURATION
                    }
                );
                this.bullets.push(freezeBullet);
                break;
                
            case WEAPONS.SHOTGUN.ID:
                // 散弹枪 - 一次发射多发
                const bulletCount = weapon.BULLET_COUNT || 3;
                const spreadAngle = weapon.SPREAD_ANGLE || 30;
                const baseAngle = Math.atan2(direction.y, direction.x);
                const spreadRad = (spreadAngle * Math.PI) / 180;
                
                for (let i = 0; i < bulletCount; i++) {
                    let angleOffset = 0;
                    if (bulletCount > 1) {
                        angleOffset = -spreadRad / 2 + (spreadRad * i) / (bulletCount - 1);
                    }
                    const angle = baseAngle + angleOffset;
                    const dirX = Math.cos(angle);
                    const dirY = Math.sin(angle);
                    
                    const shotgunBullet = new ShotgunBullet(
                        this.player.x,
                        this.player.y,
                        dirX,
                        dirY,
                        {
                            damage: weapon.DAMAGE,
                            speed: weapon.BULLET_SPEED,
                            color: COLORS.BULLET.SHOTGUN
                        }
                    );
                    this.bullets.push(shotgunBullet);
                }
                break;
                
            case WEAPONS.HOMING.ID:
                // 追踪导弹 - 自动追踪敌人
                const homingBullet = new HomingBullet(
                    this.player.x,
                    this.player.y,
                    direction.x,
                    direction.y,
                    {
                        damage: weapon.DAMAGE,
                        speed: weapon.BULLET_SPEED,
                        color: COLORS.BULLET.HOMING,
                        maxSpeed: weapon.MAX_SPEED,
                        acceleration: weapon.ACCELERATION,
                        turnSpeed: weapon.TURN_SPEED,
                        explosionRadius: weapon.EXPLOSION_RADIUS
                    }
                );
                homingBullet.setEnemiesRef(this.enemies);
                this.bullets.push(homingBullet);
                break;
                
            default:
                // 手枪 - 普通子弹
                const normalBullet = new Bullet(
                    this.player.x,
                    this.player.y,
                    direction.x,
                    direction.y,
                    weapon
                );
                this.bullets.push(normalBullet);
        }
    }
    
    /**
     * 播放射击音效
     * @param {Object} weapon - 武器数据
     */
    playShootSound(weapon) {
        switch (weapon.ID) {
            case WEAPONS.LIGHTNING.ID:
                audioManager.playSound(AUDIO.SHOOT.LIGHTNING);
                break;
            case WEAPONS.GRENADE.ID:
                audioManager.playSound(AUDIO.SHOOT.GRENADE);
                break;
            case WEAPONS.FLAME.ID:
                audioManager.playSound(AUDIO.SHOOT.FLAME);
                break;
            case WEAPONS.BOOMERANG.ID:
                audioManager.playSound(AUDIO.SHOOT.BOOMERANG);
                break;
            case WEAPONS.FREEZE.ID:
                audioManager.playSound(AUDIO.SHOOT.FREEZE);
                break;
            case WEAPONS.SHOTGUN.ID:
                audioManager.playSound(AUDIO.SHOOT.SHOTGUN);
                break;
            case WEAPONS.HOMING.ID:
                audioManager.playSound(AUDIO.SHOOT.HOMING);
                break;
            default:
                audioManager.playSound(AUDIO.SHOOT.PISTOL);
        }
    }
    
    /**
     * 处理武器切换
     */
    handleWeaponSwitch() {
        // 注册切换武器回调
        inputManager.on('onSwitchWeapon', () => {
            if (this.state.switchWeapon()) {
                uiManager.updateWeapon();
                uiManager.updateWeaponInfo();
            }
        });
    }
    
    /**
     * 生成武器掉落
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    spawnWeaponDrop(x, y) {
        // 随机选择一种武器（除了手枪）
        const weaponTypes = [WEAPONS.LIGHTNING, WEAPONS.GRENADE, WEAPONS.FLAME, WEAPONS.BOOMERANG];
        const weapon = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
        
        // 检查玩家是否已有此武器
        const playerWeapons = this.state.getData().playerWeapons;
        if (playerWeapons.some(w => w.ID === weapon.ID)) {
            return; // 已有此武器，不掉落
        }
        
        // 创建掉落物品
        const drop = {
            x: x,
            y: y,
            type: 'weapon',
            weapon: { ...weapon },
            active: true,
            spawnTime: Date.now(),
            // 上下浮动偏移量
            floatOffset: 0
        };
        
        // 添加到掉落列表
        if (!this.weaponDrops) {
            this.weaponDrops = [];
        }
        this.weaponDrops.push(drop);
        
        // 生成拾取粒子
        this.spawnPickupParticles(x, y, weapon.COLOR);
    }
    
    /**
     * 检查武器拾取
     */
    checkWeaponPickup() {
        if (!this.weaponDrops || this.weaponDrops.length === 0) return;
        
        const playerPos = this.player.getPosition();
        
        // 遍历掉落列表
        this.weaponDrops = this.weaponDrops.filter(drop => {
            if (!drop.active) return false;
            
            // 计算距离
            const dx = playerPos.x - drop.x;
            const dy = playerPos.y - drop.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 拾取范围
            const pickupRange = 30;
            
            if (distance < pickupRange) {
                // 尝试添加武器
                const added = this.state.addWeapon(drop.weapon);
                
                if (added) {
                    console.log(`拾取了武器: ${drop.weapon.NAME}`);
                    // 播放拾取音效
                    audioManager.playSound(AUDIO.PICKUP);
                    // 更新UI
                    uiManager.updateWeapon();
                    uiManager.updateWeaponInfo();
                    
                    // 触发拾取屏幕震动
                    camera.shake(FEEDBACK.SCREEN_SHAKE.WEAPON_PICKUP.intensity, FEEDBACK.SCREEN_SHAKE.WEAPON_PICKUP.duration);
                    
                    // 触发时间停止效果（强力武器拾取仪式感）
                    this.timeManager.startTimeStop(FEEDBACK.TIME_STOP.POWER_WEAPON);
                    
                    return false; // 移除掉落
                }
            }
            
            return true;
        });
    }
    
    /**
     * 生成击中碎片粒子（子弹击中敌人时）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} color - 敌人颜色
     */
    spawnHitParticles(x, y, color) {
        const config = PARTICLES.TYPES.HIT_FRAGMENT;
        const count = Math.floor(config.countMin + Math.random() * (config.countMax - config.countMin));

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
            const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
            const lifetime = config.lifetimeMin + Math.random() * (config.lifetimeMax - config.lifetimeMin);

            const particleColor = Math.random() < 0.7 ? color : '#ffffff';

            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                particleColor,
                size,
                lifetime
            );

            particle.setKind(PARTICLES.KIND.SQUARE);
            particle.setGravity(config.gravity);
            particle.setFriction(0.96);

            this.particles.push(particle);
        }
    }
    
    /**
     * 生成受伤粒子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    spawnDamageParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                COLORS.UI.HEALTH_FULL,
                4,
                300
            ));
        }
    }
    
    /**
     * 生成死亡粒子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} color - 颜色
     */
    spawnDeathParticles(x, y, color) {
        // 主要爆炸粒子（圆形）
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2 + Math.random() * 0.3;
            const speed = 2 + Math.random() * 4;
            
            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                4 + Math.random() * 4,
                500 + Math.random() * 300
            );
            particle.setKind(PARTICLES.KIND.CIRCLE);
            particle.setGravity(0.15);
            this.particles.push(particle);
        }
        
        // 小碎片（方形）
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            
            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 2,
                '#ffffff',
                2 + Math.random() * 2,
                300 + Math.random() * 200
            );
            particle.setKind(PARTICLES.KIND.SQUARE);
            particle.setGravity(0.2);
            particle.enableFlicker(0.05);
            this.particles.push(particle);
        }
        
        // 冲击波（环形粒子）
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particle = new Particle(
                x, y,
                Math.cos(angle) * 6,
                Math.sin(angle) * 6,
                color,
                6,
                200
            );
            particle.setKind(PARTICLES.KIND.CIRCLE);
            particle.setGravity(0);
            this.particles.push(particle);
        }
        
        // 中心闪光
        const flash = new Particle(
            x, y,
            0, 0,
            '#ffffff',
            20,
            100
        );
        flash.disableShrink();
        flash.disableFade();
        this.particles.push(flash);
    }
    
    /**
     * 生成Boss爆炸粒子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    spawnBossExplosion(x, y) {
        const bossColor = PARTICLES.TYPES.BOSS_EXPLOSION.color;
        
        // 大爆炸粒子
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 6;
            
            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                bossColor,
                8 + Math.random() * 10,
                800 + Math.random() * 600
            );
            particle.setKind(PARTICLES.KIND.CIRCLE);
            particle.setGravity(0.1);
            this.particles.push(particle);
        }
        
        // 橙色/黄色火花
        const sparkColors = ['#ff9800', '#ffeb3b', '#ff5722'];
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 8;
            
            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 3,
                sparkColors[Math.floor(Math.random() * sparkColors.length)],
                4 + Math.random() * 4,
                500 + Math.random() * 400
            );
            particle.setKind(PARTICLES.KIND.SQUARE);
            particle.setGravity(0.2);
            particle.enableFlicker(0.08);
            this.particles.push(particle);
        }
        
        // 烟雾粒子
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            
            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 2,
                '#424242',
                10 + Math.random() * 10,
                1000 + Math.random() * 500
            );
            particle.setKind(PARTICLES.KIND.CIRCLE);
            particle.setGravity(-0.05);
            this.particles.push(particle);
        }
        
        // 冲击波环（多层）
        for (let i = 0; i < 3; i++) {
            const delay = i * 100;
            const ringSize = 20 + i * 10;
            setTimeout(() => {
                const ring = new Particle(
                    x, y,
                    0, 0,
                    i === 0 ? '#ffffff' : bossColor,
                    ringSize,
                    400
                );
                ring.setKind(PARTICLES.KIND.RING);
                ring.setExpandSpeed(0.8 + i * 0.3);
                ring.setRingThickness(3 - i);
                ring.disableShrink();
                this.particles.push(ring);
            }, delay);
        }
        
        // 中心大闪光
        const flash = new Particle(
            x, y,
            0, 0,
            '#ffffff',
            60,
            150
        );
        flash.disableShrink();
        flash.disableFade();
        this.particles.push(flash);
    }
    
    /**
     * 生成升级光环粒子效果（拾取武器时）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} color - 颜色
     */
    spawnPickupParticles(x, y, color) {
        const self = this;
        
        // 金色光环（同心圆）
        for (let i = 0; i < 3; i++) {
            const delay = i * 80;
            setTimeout(function() {
                const expandSpeed = 1 + Math.random() * 1;
                const ringColors = [color, '#ffd700', '#ffffff'];
                const ringColor = ringColors[i % ringColors.length];
                
                const particle = new Particle(x, y, 0, 0, ringColor, 10, 600);
                particle.setKind(PARTICLES.KIND.RING);
                particle.setExpandSpeed(expandSpeed);
                particle.setRingThickness(3);
                particle.disableShrink();
                self.particles.push(particle);
            }, delay);
        }
        
        // 向上漂浮的星星粒子
        const starCount = 6 + Math.floor(Math.random() * 4);
        for (let i = 0; i < starCount; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
            const speed = 1 + Math.random() * 2;
            const size = 3 + Math.random() * 4;
            const lifetime = 500 + Math.random() * 500;
            
            const particle = new Particle(
                x + (Math.random() - 0.5) * 20,
                y + (Math.random() - 0.5) * 10,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#ffd700',
                size,
                lifetime
            );
            
            particle.setKind(PARTICLES.KIND.STAR);
            particle.setGravity(-0.05);
            particle.setRotationSpeed(0.1 + Math.random() * 0.2);
            particle.setFriction(0.99);
            
            this.particles.push(particle);
        }
    }
    
    /**
     * 渲染游戏画面
     */
    render() {
        // 清除画布
        renderer.clear();
        
        const ctx = renderer.ctx;
        
        // 保存画布状态，应用相机变换（包含震动）
        ctx.save();
        camera.apply(ctx);
        
        // 渲染房间（使用room的预渲染背景，包含地砖和3D墙壁）
        if (this.currentRoom) {
            this.currentRoom.render(renderer);
            
            // 渲染装饰物（火把、骷髅、箱子、石柱）
            this.currentRoom.renderDecorations(renderer);
            
            // 渲染陷阱
            this.currentRoom.renderTraps(renderer);
            
            // 渲染宝箱
            this.currentRoom.renderChests(renderer);
            
            // 渲染回血喷泉
            this.currentRoom.renderFountain(renderer);
        }
        
        // 渲染传送门（使用room的传送门）
        if (this.currentRoom) {
            this.currentRoom.renderPortal(renderer);
        }
        
        // 渲染武器掉落
        this.renderWeaponDrop();
        
        // 渲染粒子（底层）
        this.renderParticles();
        
        // 渲染敌人
        this.renderEnemies();
        
        // 渲染Boss
        this.renderBoss();
        
        // 渲染子弹
        this.renderBullets();
        
        // 渲染玩家
        this.renderPlayer();
        
        // 恢复画布状态（取消相机变换）
        ctx.restore();
        
        // 更新光源（玩家光圈 + 火把光源）
        this.updateLights();
        
        // 渲染光影效果（在所有游戏元素之后，不受相机影响）
        renderer.renderLighting();
        
        // 渲染伤害数字（不受相机影响）
        this.renderDamageNumbers(renderer.ctx);
        
        // 渲染调试信息
        renderer.drawDebugInfo({
            'Enemies': this.enemies.length,
            'Bullets': this.bullets.length,
            'Particles': this.particles.length,
            'Boss HP': this.boss ? this.boss.health : 'N/A',
            'TimeScale': this.timeManager.timeScale.toFixed(2),
            'Shake': camera.getCurrentShakeIntensity().toFixed(1)
        });
    }
    
    /**
     * 更新光源（玩家光圈 + 火把光源）
     */
    updateLights() {
        // 清空现有光源
        renderer.clearLights();
        
        // 添加玩家光源
        if (this.player) {
            renderer.addLight(
                this.player.x,
                this.player.y,
                LIGHTING.PLAYER_LIGHT.RADIUS,
                LIGHTING.PLAYER_LIGHT.COLOR,
                LIGHTING.PLAYER_LIGHT.INTENSITY,
                false
            );
        }
        
        // 添加火把光源
        if (this.currentRoom) {
            const torchLights = this.currentRoom.getTorchLights();
            for (const light of torchLights) {
                renderer.addLight(
                    light.x,
                    light.y,
                    light.radius,
                    light.color,
                    light.intensity,
                    true
                );
            }
        }
    }
    
    /**
     * 更新伤害数字
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updateDamageNumbers(deltaTime) {
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const dn = this.damageNumbers[i];
            
            dn.y += dn.vy;
            dn.x += dn.vx || 0;
            dn.timer -= deltaTime;
            
            if (dn.timer <= 0) {
                this.damageNumbers.splice(i, 1);
            }
        }
    }
    
    /**
     * 显示伤害数字
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} damage - 伤害值
     * @param {boolean} isCrit - 是否暴击
     * @param {string} type - 伤害类型（normal/crit/heal/skill）
     */
    showDamage(x, y, damage, isCrit = false, type = 'normal') {
        this.damageNumbers.push({
            x: x,
            y: y,
            damage: damage,
            timer: UI.DAMAGE_NUMBER_DURATION,
            duration: UI.DAMAGE_NUMBER_DURATION,
            isCrit: isCrit,
            type: isCrit ? 'crit' : type,
            vy: -UI.DAMAGE_NUMBER_SPEED,
            vx: (Math.random() - 0.5) * 1.5
        });
        
        // 暴击时添加特效粒子
        if (isCrit && typeof particleSystem !== 'undefined') {
            particleSystem.createCritParticles(x, y);
        }
    }
    
    /**
     * 渲染伤害数字
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    renderDamageNumbers(ctx) {
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const dn = this.damageNumbers[i];
            
            const alpha = dn.timer / dn.duration;
            const scale = dn.isCrit ? (1.2 + Math.sin(dn.timer / 50) * 0.2) : 1;
            
            ctx.save();
            ctx.translate(dn.x, dn.y);
            ctx.scale(scale, scale);
            ctx.globalAlpha = alpha;
            
            // 描边
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeText(Math.floor(dn.damage), 0, 0);
            
            // 填充
            let color = UI_COLORS.DAMAGE_NORMAL;
            if (dn.type === 'crit') color = UI_COLORS.DAMAGE_CRIT;
            if (dn.type === 'heal') color = UI_COLORS.DAMAGE_HEAL;
            if (dn.type === 'skill') color = UI_COLORS.DAMAGE_SKILL;
            
            ctx.fillStyle = color;
            ctx.fillText(Math.floor(dn.damage), 0, 0);
            
            // 暴击文字
            if (dn.isCrit) {
                ctx.font = 'bold 10px Arial';
                ctx.fillStyle = '#ff0000';
                ctx.fillText('暴击!', 0, -18);
            }
            
            ctx.restore();
        }
    }
    
    /**
     * 渲染房间
     */
    renderRoom() {
        // 绘制墙壁
        const wallColor = COLORS.DUNGEON.WALL;
        const wallThickness = LEVELS.WALL_THICKNESS;
        
        // 上墙
        renderer.drawRect(0, 0, GAME_WIDTH, wallThickness, wallColor);
        // 下墙
        renderer.drawRect(0, GAME_HEIGHT - wallThickness, GAME_WIDTH, wallThickness, wallColor);
        // 左墙
        renderer.drawRect(0, 0, wallThickness, GAME_HEIGHT, wallColor);
        // 右墙
        renderer.drawRect(GAME_WIDTH - wallThickness, 0, wallThickness, GAME_HEIGHT, wallColor);
        
        // 绘制门
        const doorColor = COLORS.DUNGEON.DOOR;
        const doorSize = LEVELS.DOOR_SIZE;
        
        // 上门
        renderer.drawRect(
            GAME_WIDTH / 2 - doorSize / 2,
            0,
            doorSize,
            wallThickness,
            doorColor
        );
        // 下门
        renderer.drawRect(
            GAME_WIDTH / 2 - doorSize / 2,
            GAME_HEIGHT - wallThickness,
            doorSize,
            wallThickness,
            doorColor
        );
        // 左门
        renderer.drawRect(
            0,
            GAME_HEIGHT / 2 - doorSize / 2,
            wallThickness,
            doorSize,
            doorColor
        );
        // 右门
        renderer.drawRect(
            GAME_WIDTH - wallThickness,
            GAME_HEIGHT / 2 - doorSize / 2,
            wallThickness,
            doorSize,
            doorColor
        );
    }
    
    /**
     * 渲染武器掉落
     */
    renderWeaponDrop() {
        if (!this.weaponDrops || this.weaponDrops.length === 0) return;
        
        const time = Date.now() / 1000;
        
        this.weaponDrops.forEach(drop => {
            if (!drop.active) return;
            
            // 上下浮动效果
            const floatY = Math.sin(time * 4 + drop.x) * 5;
            
            // 发光效果
            const glowSize = 20 + Math.sin(time * 6) * 5;
            
            // 绘制发光效果
            const gradient = renderer.ctx.createRadialGradient(
                drop.x, drop.y + floatY, 0,
                drop.x, drop.y + floatY, glowSize
            );
            gradient.addColorStop(0, drop.weapon.COLOR + '80');
            gradient.addColorStop(1, 'transparent');
            
            renderer.ctx.fillStyle = gradient;
            renderer.ctx.beginPath();
            renderer.ctx.arc(drop.x, drop.y + floatY, glowSize, 0, Math.PI * 2);
            renderer.ctx.fill();
            
            // 绘制武器图标
            renderer.drawCenteredText(
                drop.weapon.ICON,
                drop.x,
                drop.y + floatY - 8,
                drop.weapon.COLOR,
                '24px serif'
            );
        });
    }
    
    /**
     * 渲染粒子
     * @param {boolean} bottomLayer - 是否渲染底层（地面痕迹）
     */
    renderParticles(bottomLayer = false) {
        const ctx = renderer.ctx;
        
        this.particles.forEach(particle => {
            if (!particle.active) return;
            
            // 底层只渲染燃烧痕迹
            if (bottomLayer && particle.kind !== PARTICLES.KIND.BURN_MARK) return;
            // 上层不渲染燃烧痕迹
            if (!bottomLayer && particle.kind === PARTICLES.KIND.BURN_MARK) return;
            
            const alpha = particle.getAlpha();
            ctx.save();
            ctx.globalAlpha = alpha;
            
            switch (particle.kind) {
                case PARTICLES.KIND.CIRCLE:
                    // 圆形粒子
                    ctx.fillStyle = particle.color;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case PARTICLES.KIND.SQUARE:
                    // 方形碎片粒子
                    ctx.fillStyle = particle.color;
                    ctx.fillRect(
                        particle.x - particle.size / 2,
                        particle.y - particle.size / 2,
                        particle.size,
                        particle.size
                    );
                    break;
                    
                case PARTICLES.KIND.RING:
                    // 环形粒子（光环效果）
                    ctx.strokeStyle = particle.color;
                    ctx.lineWidth = particle.ringThickness;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.stroke();
                    break;
                    
                case PARTICLES.KIND.STAR:
                    // 星形粒子
                    ctx.save();
                    ctx.translate(particle.x, particle.y);
                    ctx.rotate(particle.rotation);
                    ctx.fillStyle = particle.color;
                    ctx.beginPath();
                    for (let i = 0; i < 5; i++) {
                        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                        const radius = i % 2 === 0 ? particle.size : particle.size / 2;
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
                    break;
                    
                case PARTICLES.KIND.BURN_MARK:
                    // 地面燃烧痕迹
                    const gradient = ctx.createRadialGradient(
                        particle.x, particle.y, 0,
                        particle.x, particle.y, particle.size
                    );
                    gradient.addColorStop(0, particle.color);
                    gradient.addColorStop(0.5, particle.color + '80');
                    gradient.addColorStop(1, 'transparent');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case PARTICLES.KIND.DUST:
                    // 环境灰尘粒子
                    ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                default:
                    // 默认圆形
                    ctx.fillStyle = particle.color;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
            
            ctx.restore();
        });
    }
    
    /**
     * 渲染敌人
     */
    renderEnemies() {
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;
            
            // 调用敌人的render方法（如果有的话）
            if (typeof enemy.render === 'function') {
                enemy.render();
            } else {
                // 绘制敌人身体
                let bodyColor = enemy.color;
                if (enemy.isHurt) {
                    bodyColor = '#ff0000';
                } else if (enemy.isFrozen) {
                    bodyColor = COLORS.BULLET.FREEZE;
                }
                renderer.drawPixelCharacter(
                    enemy.x - enemy.size / 2,
                    enemy.y - enemy.size / 2,
                    enemy.size,
                    bodyColor
                );
                
                // 绘制敌人眼睛
                renderer.drawCircle(
                    enemy.x - 3,
                    enemy.y - 2,
                    2,
                    '#ffffff'
                );
                renderer.drawCircle(
                    enemy.x + 3,
                    enemy.y - 2,
                    2,
                    '#ffffff'
                );
            }
        });
    }
    
    /**
     * 渲染Boss
     */
    renderBoss() {
        if (!this.boss) return;
        if (!this.boss.alive && !this.boss.isDying) return;
        
        const boss = this.boss;
        const ctx = renderer.ctx;
        
        // 计算浮动偏移
        const floatY = boss.isDying ? 0 : Math.sin(boss.floatTimer) * boss.floatAmount;
        
        // 呼吸缩放
        const breathScale = boss.isDying ? 1 : 1 + Math.sin(boss.breathTimer) * boss.breathAmount;
        
        // 阶段转换脉动缩放
        let phasePulseScale = 1;
        if (boss.isPhaseTransitioning) {
            const progress = boss.phaseTransitionTimer / boss.phaseTransitionDuration;
            phasePulseScale = 1 + Math.sin(progress * Math.PI * 6) * 0.1;
        }
        
        // 死亡缩放
        let deathScale = 1;
        let deathAlpha = 1;
        if (boss.isDying) {
            const progress = Math.min(boss.deathTimer / boss.deathDuration, 1);
            deathScale = 1 + progress * 0.5;
            deathAlpha = 1 - progress;
        }
        
        // 根据Boss阶段改变颜色
        let bodyColor = COLORS.ENEMY.BOSS;
        if (boss.phase === 2) {
            bodyColor = BOSS.PHASE2.COLOR;
        } else if (boss.phase === 3) {
            bodyColor = BOSS.PHASE3.COLOR;
        }
        
        // 受伤闪红
        if (boss.isHurt) {
            bodyColor = '#ff0000';
        }
        
        // 冲锋预警时身体变红闪烁
        if (boss.chargeWarning) {
            const flash = Math.sin(Date.now() / 50) > 0;
            bodyColor = flash ? '#ff0000' : '#ff6666';
        }
        
        // 冲锋中身体更红
        if (boss.isCharging) {
            bodyColor = '#ff0000';
        }
        
        // 回血时发绿光
        if (boss.isHealing) {
            bodyColor = '#4caf50';
        }
        
        // 保存画布状态
        ctx.save();
        
        // 死亡透明度
        ctx.globalAlpha = deathAlpha;
        
        // 受击震动偏移
        let shakeX = 0, shakeY = 0;
        if (boss.hitShakeTimer > 0 && !boss.isDying) {
            const shakeProgress = boss.hitShakeTimer / boss.hitShakeDuration;
            shakeX = (Math.random() - 0.5) * boss.hitShakeIntensity * shakeProgress;
            shakeY = (Math.random() - 0.5) * boss.hitShakeIntensity * shakeProgress;
        }
        
        // 闪避时身体倾斜
        if (boss.isDodging) {
            const tiltAngle = BOSS.DODGE.TILT_ANGLE;
            ctx.translate(boss.x + shakeX, boss.y + floatY + shakeY);
            ctx.rotate(boss.dodgeDirection.x > 0 ? tiltAngle : -tiltAngle);
            ctx.translate(-boss.x - shakeX, -boss.y - floatY - shakeY);
        }
        
        const drawX = boss.x + shakeX;
        const drawY = boss.y + floatY + shakeY;
        const totalScale = breathScale * phasePulseScale * deathScale;
        
        // 绘制旋转光环（阶段2及以上）
        if (boss.phase >= 2 && !boss.isDying) {
            const auraRadius = 28 + Math.sin(boss.ragePulseTimer) * 3;
            const auraColor = boss.phase === 2 ? 'rgba(255, 102, 0, 0.3)' : 'rgba(255, 255, 0, 0.3)';
            
            ctx.save();
            ctx.translate(drawX, drawY);
            ctx.rotate(boss.auraRotation);
            
            // 外圈光环
            ctx.strokeStyle = auraColor;
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.restore();
        }
        
        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(drawX, drawY + 20 - floatY, 25 * totalScale, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制Boss身体（大圆）
        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.scale(totalScale, totalScale);
        ctx.translate(-drawX, -drawY);
        
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(drawX, drawY, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制身体纹理/细节（外圈暗色）
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(drawX, drawY, 18, 0, Math.PI * 2);
        ctx.stroke();
        
        // 阶段转换时的能量纹路
        if (boss.isPhaseTransitioning) {
            const progress = boss.phaseTransitionTimer / boss.phaseTransitionDuration;
            const lineAlpha = Math.sin(progress * Math.PI) * 0.8;
            ctx.strokeStyle = boss.phase === 2 ? `rgba(255, 102, 0, ${lineAlpha})` : `rgba(255, 255, 0, ${lineAlpha})`;
            ctx.lineWidth = 2;
            
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + boss.auraRotation * 2;
                ctx.beginPath();
                ctx.moveTo(drawX + Math.cos(angle) * 5, drawY + Math.sin(angle) * 5);
                ctx.lineTo(drawX + Math.cos(angle) * 18, drawY + Math.sin(angle) * 18);
                ctx.stroke();
            }
        }
        
        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(drawX - 6, drawY - 6, 7, 0, Math.PI * 2);
        ctx.fill();
        
        // 阶段2及以上的尖刺/王冠装饰
        if (boss.phase >= 2) {
            ctx.fillStyle = boss.phase === 3 ? '#ffcc00' : '#ff6600';
            for (let i = 0; i < 5; i++) {
                const angle = -Math.PI / 2 + (i - 2) * 0.3;
                const innerR = 18;
                const outerR = 26 + (i === 2 ? 4 : 0);
                const ix = drawX + Math.cos(angle) * innerR;
                const iy = drawY + Math.sin(angle) * innerR;
                const ox = drawX + Math.cos(angle) * outerR;
                const oy = drawY + Math.sin(angle) * outerR;
                
                ctx.beginPath();
                ctx.moveTo(ix - 2, iy);
                ctx.lineTo(ox, oy);
                ctx.lineTo(ix + 2, iy);
                ctx.closePath();
                ctx.fill();
            }
        }
        
        // 大眼睛
        const eyeY = drawY - 3;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(drawX - 7, eyeY, 5, 0, Math.PI * 2);
        ctx.arc(drawX + 7, eyeY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // 虹膜（阶段变化颜色）
        let irisColor = '#ff0000';
        if (boss.phase === 2) irisColor = '#ff6600';
        if (boss.phase === 3) irisColor = '#ffff00';
        
        // 死亡时眼睛变暗
        if (boss.isDying) {
            irisColor = '#333333';
        }
        
        ctx.fillStyle = irisColor;
        ctx.beginPath();
        ctx.arc(drawX - 7, eyeY, 3, 0, Math.PI * 2);
        ctx.arc(drawX + 7, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 瞳孔
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(drawX - 7, eyeY, 1.5, 0, Math.PI * 2);
        ctx.arc(drawX + 7, eyeY, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 愤怒的眉毛（阶段2及以上）
        if (boss.phase >= 2 && !boss.isDying) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(drawX - 12, eyeY - 6);
            ctx.lineTo(drawX - 4, eyeY - 4);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(drawX + 4, eyeY - 4);
            ctx.lineTo(drawX + 12, eyeY - 6);
            ctx.stroke();
        }
        
        // 嘴巴（根据阶段变化）
        ctx.fillStyle = '#000000';
        if (boss.phase === 1 && !boss.isDying) {
            ctx.beginPath();
            ctx.arc(drawX, drawY + 6, 3, 0, Math.PI);
            ctx.fill();
        } else if (!boss.isDying) {
            // 张开的大嘴，露出尖牙
            ctx.beginPath();
            ctx.ellipse(drawX, drawY + 8, 6, 5, 0, 0, Math.PI);
            ctx.fill();
            
            // 尖牙
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(drawX - 4, drawY + 6);
            ctx.lineTo(drawX - 3, drawY + 10);
            ctx.lineTo(drawX - 2, drawY + 6);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(drawX + 2, drawY + 6);
            ctx.lineTo(drawX + 3, drawY + 10);
            ctx.lineTo(drawX + 4, drawY + 6);
            ctx.closePath();
            ctx.fill();
        } else {
            // 死亡时嘴巴闭合
            ctx.beginPath();
            ctx.arc(drawX, drawY + 8, 3, 0, Math.PI);
            ctx.fill();
        }
        
        ctx.restore();
        ctx.restore();
        
        // 绘制Boss血条
        if (boss.alive && boss.health < boss.maxHealth) {
            const barWidth = 100;
            const barHeight = 8;
            const barX = drawX - barWidth / 2;
            const barY = drawY - 45;
            const healthPercent = boss.health / boss.maxHealth;
            
            ctx.globalAlpha = 1;
            
            // 血条背景
            ctx.fillStyle = '#333333';
            ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
            
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // 血条颜色根据阶段变化
            let healthColor = '#ff0000';
            if (boss.phase === 2) healthColor = '#ff6600';
            if (boss.phase === 3) healthColor = '#ffcc00';
            
            ctx.fillStyle = healthColor;
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
            
            // 血条高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight / 2);
            
            // 阶段指示
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`阶段 ${boss.phase}`, drawX, barY - 5);
        }
    }
    
    /**
     * 渲染冲锋预警线
     * @param {Boss} boss - Boss引用
     */
    renderChargeWarning(boss) {
        const dirX = boss.chargeDirection.x;
        const dirY = boss.chargeDirection.y;
        
        // 计算预警线终点（画布边缘）
        const endX = boss.x + dirX * 1000;
        const endY = boss.y + dirY * 1000;
        
        // 闪烁的红色预警线
        const flash = Math.sin(Date.now() / 80) > 0;
        if (flash) {
            renderer.ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
            renderer.ctx.lineWidth = 4;
            renderer.ctx.setLineDash([15, 10]);
            renderer.ctx.beginPath();
            renderer.ctx.moveTo(boss.x, boss.y);
            renderer.ctx.lineTo(endX, endY);
            renderer.ctx.stroke();
            renderer.ctx.setLineDash([]);
        }
    }
    
    /**
     * 渲染冲锋拖尾效果
     * @param {Boss} boss - Boss引用
     */
    renderChargeTrail(boss) {
        // 绘制几个逐渐变淡的残影
        for (let i = 1; i <= 4; i++) {
            const alpha = 0.3 - i * 0.07;
            const offsetX = -boss.chargeDirection.x * i * 12;
            const offsetY = -boss.chargeDirection.y * i * 12;
            
            renderer.ctx.globalAlpha = alpha;
            renderer.drawPixelCharacter(
                boss.x - boss.size / 2 + offsetX,
                boss.y - boss.size / 2 + offsetY,
                boss.size,
                '#ff4444'
            );
        }
        renderer.ctx.globalAlpha = 1;
    }
    
    /**
     * 渲染召唤特效（紫色光柱）
     * @param {Boss} boss - Boss引用
     */
    renderSummonEffects(boss) {
        if (!boss.summonEffects || boss.summonEffects.length === 0) return;
        
        boss.summonEffects.forEach(effect => {
            const progress = 1 - (effect.timer / BOSS.SUMMON_POSITION.EFFECT_DURATION);
            const beamHeight = 80 * progress;
            const beamWidth = 20 + Math.sin(Date.now() / 100) * 5;
            
            // 绘制光柱
            const gradient = renderer.ctx.createLinearGradient(
                effect.x, effect.y + beamHeight / 2,
                effect.x, effect.y - beamHeight / 2
            );
            gradient.addColorStop(0, 'rgba(156, 39, 176, 0)');
            gradient.addColorStop(0.3, 'rgba(156, 39, 176, 0.6)');
            gradient.addColorStop(0.7, 'rgba(186, 104, 200, 0.8)');
            gradient.addColorStop(1, 'rgba(233, 30, 99, 0.6)');
            
            renderer.ctx.fillStyle = gradient;
            renderer.ctx.fillRect(
                effect.x - beamWidth / 2,
                effect.y - beamHeight / 2,
                beamWidth,
                beamHeight
            );
            
            // 光柱底部光环
            const glowSize = 30 + Math.sin(Date.now() / 80) * 10;
            const glowGradient = renderer.ctx.createRadialGradient(
                effect.x, effect.y, 0,
                effect.x, effect.y, glowSize
            );
            glowGradient.addColorStop(0, 'rgba(233, 30, 99, 0.8)');
            glowGradient.addColorStop(0.5, 'rgba(156, 39, 176, 0.4)');
            glowGradient.addColorStop(1, 'transparent');
            
            renderer.ctx.fillStyle = glowGradient;
            renderer.ctx.beginPath();
            renderer.ctx.arc(effect.x, effect.y, glowSize, 0, Math.PI * 2);
            renderer.ctx.fill();
        });
    }
    
    /**
     * 渲染激光预警线
     * @param {Boss} boss - Boss引用
     */
    renderLaserWarning(boss) {
        const laserWidth = BOSS.PHASE3.LASER_WIDTH;
        const laserDirX = Math.cos(boss.laserAngle);
        const laserDirY = Math.sin(boss.laserAngle);
        
        // 计算激光线段终点（画布外）
        const endX = boss.x + laserDirX * 1000;
        const endY = boss.y + laserDirY * 1000;
        
        // 绘制红色预警线（闪烁效果）
        const flash = Math.sin(Date.now() / 50) > 0;
        if (flash) {
            renderer.ctx.strokeStyle = '#ff0000';
            renderer.ctx.lineWidth = 2;
            renderer.ctx.setLineDash([10, 10]);
            renderer.ctx.beginPath();
            renderer.ctx.moveTo(boss.x, boss.y);
            renderer.ctx.lineTo(endX, endY);
            renderer.ctx.stroke();
            renderer.ctx.setLineDash([]);
        }
        
        // 绘制激光宽度指示器
        const perpX = -laserDirY * laserWidth / 2;
        const perpY = laserDirX * laserWidth / 2;
        
        renderer.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        renderer.ctx.lineWidth = laserWidth;
        renderer.ctx.beginPath();
        renderer.ctx.moveTo(boss.x + perpX, boss.y + perpY);
        renderer.ctx.lineTo(endX + perpX, endY + perpY);
        renderer.ctx.stroke();
    }
    
    /**
     * 渲染激光
     * @param {Boss} boss - Boss引用
     */
    renderLaser(boss) {
        const laserWidth = BOSS.PHASE3.LASER_WIDTH;
        const laserDirX = Math.cos(boss.laserAngle);
        const laserDirY = Math.sin(boss.laserAngle);
        
        // 计算激光线段终点
        const endX = boss.x + laserDirX * 1000;
        const endY = boss.y + laserDirY * 1000;
        
        // 绘制激光核心（白色）
        renderer.ctx.strokeStyle = '#ffffff';
        renderer.ctx.lineWidth = 4;
        renderer.ctx.beginPath();
        renderer.ctx.moveTo(boss.x, boss.y);
        renderer.ctx.lineTo(endX, endY);
        renderer.ctx.stroke();
        
        // 绘制激光主体（黄色）
        renderer.ctx.strokeStyle = COLORS.BULLET.LASER;
        renderer.ctx.lineWidth = laserWidth;
        renderer.ctx.beginPath();
        renderer.ctx.moveTo(boss.x, boss.y);
        renderer.ctx.lineTo(endX, endY);
        renderer.ctx.stroke();
        
        // 绘制激光外发光
        const gradient = renderer.ctx.createLinearGradient(
            boss.x, boss.y, endX, endY
        );
        gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 200, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        renderer.ctx.strokeStyle = gradient;
        renderer.ctx.lineWidth = laserWidth + 20;
        renderer.ctx.beginPath();
        renderer.ctx.moveTo(boss.x, boss.y);
        renderer.ctx.lineTo(endX, endY);
        renderer.ctx.stroke();
    }
    
    /**
     * 渲染子弹
     */
    renderBullets() {
        this.bullets.forEach(bullet => {
            if (!bullet.active) return;
            
            // 使用子弹自己的绘制方法
            bullet.draw(renderer.ctx);
        });
    }
    
    /**
     * 渲染玩家
     */
    renderPlayer() {
        if (!this.player) return;
        
        const player = this.player;
        const isInvincible = this.state.getData().isInvincible;
        const ctx = renderer.ctx;
        
        // 优先使用角色颜色，如果没有则使用当前武器颜色
        const bodyColor = player.color || COLORS.PLAYER.BODY;
        
        // 使用插值后的渲染位置
        const renderX = player.renderX;
        const renderY = player.renderY;
        
        // 走路摆动偏移量（使用新的移动系统）
        const walkBobOffset = player.getWalkBobOffset();
        // 呼吸动画偏移
        const breathOffset = player.getBreathOffset();
        // 浮动效果偏移
        const floatOffset = player.getFloatOffset();
        // 技能释放后仰偏移
        const skillCastOffset = player.getSkillCastOffset();
        
        // 综合Y轴偏移
        let baseYOffset = walkBobOffset + breathOffset + floatOffset + skillCastOffset;
        const drawY = renderY + baseYOffset;
        
        // 计算朝向鼠标的角度
        const mouseX = inputManager.mouse.worldX || renderX;
        const mouseY = inputManager.mouse.worldY || renderY;
        const angle = Math.atan2(mouseY - renderY, mouseX - renderX);
        
        // 无敌闪烁判断
        const shouldDraw = !isInvincible || Math.floor(Date.now() / PLAYER.FLASH_INTERVAL) % 2 === 0;
        if (!shouldDraw) return;
        
        // 先绘制阴影（在角色下方，不受倾斜影响）
        this.drawPlayerShadow(renderX);
        
        // 绘制腿部（走路摆动效果）
        this.drawPlayerLegs(renderX, drawY, player);
        
        ctx.save();
        ctx.translate(renderX, drawY);
        
        // 应用移动倾斜角度 + 受伤倾斜
        const totalTilt = player.tiltAngle + player.hurtTiltAngle;
        ctx.rotate(totalTilt);
        
        // 身体垂直缩放（呼吸效果）
        const breathScale = 1 + Math.sin(player.breathTimer) * 0.05;
        ctx.scale(1, breathScale);
        
        // 绘制身体（圆形）
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(-3, -3, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛朝向鼠标方向偏移（注意：因为有倾斜，所以眼睛方向也要考虑）
        const eyeOffsetX = Math.cos(angle - totalTilt) * 2;
        const eyeOffsetY = Math.sin(angle - totalTilt) * 2;
        
        // 绘制眼白
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-3 + eyeOffsetX, -2 + eyeOffsetY, 2.5, 0, Math.PI * 2);
        ctx.arc(3 + eyeOffsetX, -2 + eyeOffsetY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制瞳孔
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-3 + eyeOffsetX * 1.5, -2 + eyeOffsetY * 1.5, 1.2, 0, Math.PI * 2);
        ctx.arc(3 + eyeOffsetX * 1.5, -2 + eyeOffsetY * 1.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
        
        // 恢复缩放，不影响武器
        ctx.scale(1, 1 / breathScale);
        
        // 绘制武器（朝向鼠标方向，需要抵消倾斜角度）
        ctx.save();
        ctx.rotate(angle - totalTilt);
        
        // 武器后坐力偏移
        const recoilOffset = player.weaponRecoilOffset;
        const recoilRotation = player.weaponRecoilRotation;
        ctx.translate(-recoilOffset, 0);
        ctx.rotate(-recoilRotation);
        
        // 武器切换旋转动画
        if (player.isWeaponSwitching) {
            ctx.rotate(player.weaponSpinAngle);
        }
        
        // 获取当前武器颜色
        const weaponColor = this.getCurrentWeaponColor();
        
        // 武器手柄
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(8, -2, 6, 4);
        // 武器枪管
        ctx.fillStyle = weaponColor || '#666666';
        ctx.fillRect(12, -1.5, 10, 3);
        // 武器高光
        ctx.fillStyle = '#888888';
        ctx.fillRect(12, -1.5, 10, 1);
        
        // 武器发光效果（特殊武器或怒气满时）
        if (player.rage >= player.maxRage) {
            const glowIntensity = 0.3 + Math.sin(player.rageFullEffectTimer * 0.01) * 0.2;
            ctx.shadowColor = WEAPON_ANIMATIONS.GLOW.color;
            ctx.shadowBlur = 10 * glowIntensity;
            ctx.fillStyle = weaponColor || '#666666';
            ctx.fillRect(12, -1.5, 10, 3);
            ctx.shadowBlur = 0;
        }
        
        ctx.restore();
        
        // 受伤闪白效果
        if (player.hitFlashTimer > 0) {
            const intensity = player.hitFlashTimer / player.hitFlashDuration;
            ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.8})`;
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 怒气满时的身体发光
        if (player.rage >= player.maxRage) {
            const glowIntensity = 0.2 + Math.sin(player.rageFullEffectTimer * 0.008) * 0.15;
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 15 * glowIntensity;
            ctx.fillStyle = bodyColor;
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        ctx.restore();
    }
    
    /**
     * 绘制玩家腿部
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Object} player - 玩家对象
     */
    drawPlayerLegs(x, y, player) {
        const ctx = renderer.ctx;
        const legSwingAngle = player.getLegSwingAngle();
        
        ctx.save();
        ctx.translate(x, y + 8);
        
        // 左腿
        ctx.save();
        ctx.translate(-4, 0);
        ctx.rotate(legSwingAngle);
        ctx.fillStyle = '#2196f3';
        ctx.fillRect(-2, 0, 4, 6);
        ctx.restore();
        
        // 右腿
        ctx.save();
        ctx.translate(4, 0);
        ctx.rotate(-legSwingAngle);
        ctx.fillStyle = '#2196f3';
        ctx.fillRect(-2, 0, 4, 6);
        ctx.restore();
        
        ctx.restore();
    }
    
    /**
     * 绘制玩家阴影
     * @param {number} x - 玩家X坐标
     */
    drawPlayerShadow(x) {
        const ctx = renderer.ctx;
        const player = this.player;
        
        // 阴影位置（在角色脚下，使用实际y坐标，不受摆动影响）
        const shadowX = x;
        const shadowY = player.y + PLAYER.SHADOW_OFFSET_Y;
        
        // 计算阴影大小（根据速度微调，移动快时阴影稍扁）
        const speed = Math.sqrt(player.velocityX ** 2 + player.velocityY ** 2);
        const speedFactor = Math.min(speed / player.maxSpeed, 1);
        const shadowWidth = PLAYER.SHADOW_WIDTH * (1 - speedFactor * 0.1);
        const shadowHeight = PLAYER.SHADOW_HEIGHT * (1 + speedFactor * 0.1);
        
        ctx.save();
        ctx.fillStyle = PLAYER.SHADOW_COLOR;
        ctx.beginPath();
        ctx.ellipse(shadowX, shadowY, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    /**
     * 获取当前武器颜色
     * @returns {string} 武器颜色
     */
    getCurrentWeaponColor() {
        const weapon = this.state.getCurrentWeapon();
        if (weapon && weapon.color) {
            return weapon.color;
        }
        return COLORS.WEAPON.PISTOL;
    }
    
    /**
     * 进入下一房间
     */
    nextRoom() {
        if (this.state.nextLevel()) {
            this.initRoom();
        }
    }
}