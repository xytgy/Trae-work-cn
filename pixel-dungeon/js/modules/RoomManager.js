/**
 * 房间管理器
 * 从 GameLogic 中提取房间管理相关方法
 */
class RoomManager {
    constructor({ eventBus, gameLogic }) {
        this.eventBus = eventBus;
        this.gameLogic = gameLogic;
    }

    /**
     * 初始化房间
     */
    initRoom() {
        const gl = this.gameLogic;
        const level = gl.state.getData().currentLevel;
        const roomIndex = level - 1;

        const roomType = this.getRoomType(roomIndex);
        const isBossRoom = roomType === ROOM_TYPES.BOSS || level >= LEVELS.COUNT;

        gl.currentRoom = new Room(roomType, roomIndex, isBossRoom);

        gl.enemies = [];
        gl.bullets = [];
        gl.particles = [];
        gl.boss = null;
        gl.portal = null;
        gl.allEnemiesCleared = false;

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

        console.log(
            `房间 ${level} 初始化完成 - 类型: ${gl.currentRoom.getRoomTypeName()}, 敌人数量: ${gl.enemies.length}, Boss: ${!!gl.boss}`
        );
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
        const gl = this.gameLogic;
        const difficultyConfig = gl.state.getDifficultyConfig();
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
                gl.enemies.push(enemy);
            }
        }
    }

    /**
     * 初始化精英房
     * @param {number} roomIndex - 房间索引
     */
    initEliteRoom(roomIndex) {
        const gl = this.gameLogic;
        const centerX = GAME_WIDTH / 2;
        const centerY = GAME_HEIGHT / 3;

        const difficultyConfig = gl.state.getDifficultyConfig();
        const roomProgressMult = gl.state.getRoomDifficultyMultiplier(roomIndex, false);
        const healthMult = (difficultyConfig?.enemy?.healthMultiplier || 1) * roomProgressMult;
        const damageMult = (difficultyConfig?.enemy?.damageMultiplier || 1) * roomProgressMult;
        const speedMult = difficultyConfig?.enemy?.speedMultiplier || 1;
        const aiLevel = difficultyConfig?.enemy?.aiLevel || 1;

        const elite = new EliteEnemy(centerX, centerY, { eventBus: this.eventBus });
        this.applyDifficultyToEnemy(elite, healthMult, damageMult, speedMult, aiLevel);
        gl.enemies.push(elite);

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
                gl.enemies.push(enemy);
            }
        }
    }

    /**
     * 初始化Boss房
     */
    initBossRoom() {
        const gl = this.gameLogic;
        const difficultyConfig = gl.state.getDifficultyConfig();
        const roomIndex = gl.state.getData().currentLevel - 1;
        const roomProgressMult = gl.state.getRoomDifficultyMultiplier(roomIndex, true);
        const healthMult = (difficultyConfig?.enemy?.healthMultiplier || 1) * roomProgressMult;
        const damageMult = (difficultyConfig?.enemy?.damageMultiplier || 1) * roomProgressMult;
        const speedMult = difficultyConfig?.enemy?.speedMultiplier || 1;
        const aiLevel = difficultyConfig?.enemy?.aiLevel || 1;

        gl.boss = new Boss(GAME_WIDTH / 2, 150, { eventBus: this.eventBus });

        if (gl.boss) {
            gl.boss.maxHealth = Math.ceil(gl.boss.maxHealth * healthMult);
            gl.boss.health = gl.boss.maxHealth;
            gl.boss.damage = Math.max(1, Math.floor(gl.boss.damage * damageMult));
            gl.boss.aiLevel = aiLevel;
        }

        soundManager.play(SOUND_EFFECTS.BOSS);

        if (this.eventBus) {
            this.eventBus.publish('BOSS_SPAWN', { boss: gl.boss });
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
     * @param {number} roomIndex - 房间索引
     * @returns {Enemy|null} 敌人实例
     */
    createEnemy(type, x, y, roomIndex = 0) {
        const gl = this.gameLogic;
        const difficultyConfig = gl.state.getDifficultyConfig();
        const roomProgressMult = gl.state.getRoomDifficultyMultiplier(roomIndex, false);
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
        if (!enemy) {
            return;
        }

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
     * 检查房间是否已清除
     */
    checkRoomClear() {
        const gl = this.gameLogic;
        if (!gl.currentRoom) {
            return;
        }

        const roomCompleted = gl.currentRoom.checkRoomCompleted(gl);

        if (roomCompleted && !gl.allEnemiesCleared) {
            gl.allEnemiesCleared = true;

            const roomType = gl.currentRoom.roomType;
            const isBossRoom = roomType === ROOM_TYPES.BOSS || gl.boss;

            if (!isBossRoom) {
                setTimeout(() => {
                    if (gl.currentRoom) {
                        gl.currentRoom.spawnPortal();
                    }
                }, PORTAL.SPAWN_DELAY);
            }
        }
    }

    /**
     * 进入下一个房间
     */
    nextRoom() {
        const gl = this.gameLogic;
        if (gl.state.nextLevel()) {
            this.initRoom();
        }
    }
}
