/**
 * 游戏状态管理
 * 负责管理游戏的各个状态和状态切换
 */

class GameStateManager {
    constructor() {
        // 当前游戏状态
        this.currentState = GAME_STATE.MENU;
        
        // 游戏数据存储
        this.data = {
            // 玩家相关
            playerHealth: PLAYER.MAX_HEALTH,
            playerWeapons: [WEAPONS.PISTOL],  // 初始武器
            currentWeaponIndex: 0,
            
            // 当前关卡
            currentLevel: 1,
            
            // 选中的角色
            selectedCharacter: null,
            selectedCharacterId: 1,        // 当前选择的角色ID
            characterUnlocks: {},          // 角色解锁状态 {id: unlocked}
            
            // 难度设置
            difficulty: DIFFICULTY.DEFAULT,  // 当前难度
            selectedDifficulty: DIFFICULTY.DEFAULT, // 选择界面选中的难度
            
            // 游戏统计
            killCount: 0,
            playTime: 0,              // 游玩时间（秒）
            weaponsCollected: 0,      // 拾取的武器数
            
            // 游戏结果
            finalScore: 0,
            survivalTime: 0,
            
            // 暂停相关
            isPaused: false,
            pauseTime: 0,
            
            // 特殊状态
            isInvincible: false,
            invincibleTimer: 0,
            
            // 武器切换冷却
            weaponSwitchCooldown: 0
        };
        
        // 状态回调函数
        this.callbacks = {
            onStateChange: [],        // 状态切换回调
            onGameStart: [],          // 游戏开始回调
            onGameOver: [],           // 游戏结束回调
            onVictory: [],            // 通关回调
            onPause: [],              // 暂停回调
            onResume: []              // 继续回调
        };
    }
    
    /**
     * 获取当前状态
     */
    getState() {
        return this.currentState;
    }
    
    /**
     * 获取当前武器
     */
    getCurrentWeapon() {
        return this.data.playerWeapons[this.data.currentWeaponIndex];
    }
    
    /**
     * 获取游戏数据
     */
    getData() {
        return this.data;
    }
    
    /**
     * 检查是否为指定状态
     */
    isState(state) {
        return this.currentState === state;
    }
    
    /**
     * 检查是否正在游戏中
     */
    isPlaying() {
        return this.currentState === GAME_STATE.PLAYING && !this.data.isPaused;
    }
    
    /**
     * 切换到指定状态
     * @param {string} newState - 新状态
     */
    setState(newState) {
        const oldState = this.currentState;
        
        // 验证状态转换合法性
        if (!this.isValidTransition(oldState, newState)) {
            console.warn(`无效的状态转换: ${oldState} -> ${newState}`);
            return false;
        }
        
        this.currentState = newState;
        
        // 执行状态进入逻辑
        this.onStateEnter(newState, oldState);
        
        // 触发状态切换回调
        this.triggerCallbacks('onStateChange', { oldState, newState });
        
        return true;
    }
    
    /**
     * 验证状态转换是否合法
     * @param {string} from - 原状态
     * @param {string} to - 目标状态
     */
    isValidTransition(from, to) {
        // 定义合法的状态转换
        const validTransitions = {
            [GAME_STATE.MENU]: [GAME_STATE.CHARACTER_SELECT, GAME_STATE.SETTINGS, GAME_STATE.LEADERBOARD, GAME_STATE.ACHIEVEMENTS, GAME_STATE.HELP, GAME_STATE.TUTORIAL],
            [GAME_STATE.CHARACTER_SELECT]: [GAME_STATE.DIFFICULTY_SELECT, GAME_STATE.MENU],
            [GAME_STATE.DIFFICULTY_SELECT]: [GAME_STATE.PLAYING, GAME_STATE.CHARACTER_SELECT, GAME_STATE.MENU],
            [GAME_STATE.PLAYING]: [GAME_STATE.PAUSED, GAME_STATE.GAME_OVER, GAME_STATE.VICTORY],
            [GAME_STATE.PAUSED]: [GAME_STATE.PLAYING, GAME_STATE.SETTINGS, GAME_STATE.MENU],
            [GAME_STATE.GAME_OVER]: [GAME_STATE.MENU, GAME_STATE.CHARACTER_SELECT, GAME_STATE.PLAYING, GAME_STATE.LEADERBOARD],
            [GAME_STATE.VICTORY]: [GAME_STATE.MENU, GAME_STATE.CHARACTER_SELECT, GAME_STATE.PLAYING, GAME_STATE.LEADERBOARD],
            [GAME_STATE.SETTINGS]: [GAME_STATE.MENU, GAME_STATE.PAUSED],
            [GAME_STATE.LEADERBOARD]: [GAME_STATE.MENU, GAME_STATE.GAME_OVER, GAME_STATE.VICTORY],
            [GAME_STATE.ACHIEVEMENTS]: [GAME_STATE.MENU],
            [GAME_STATE.HELP]: [GAME_STATE.MENU],
            [GAME_STATE.TUTORIAL]: [GAME_STATE.PLAYING, GAME_STATE.MENU]
        };
        
        return validTransitions[from]?.includes(to) || false;
    }
    
    /**
     * 状态进入逻辑
     * @param {string} state - 进入的状态
     * @param {string} oldState - 原状态
     */
    onStateEnter(state, oldState) {
        switch (state) {
            case GAME_STATE.MENU:
                // 重置游戏数据
                this.resetData();
                break;
                
            case GAME_STATE.CHARACTER_SELECT:
                // 角色选择状态，不需要重置数据
                break;
                
            case GAME_STATE.PLAYING:
                if (oldState === GAME_STATE.MENU || oldState === GAME_STATE.CHARACTER_SELECT) {
                    // 全新开始
                    this.resetData();
                    this.triggerCallbacks('onGameStart');
                } else if (oldState === GAME_STATE.PAUSED) {
                    // 从暂停恢复
                    this.data.isPaused = false;
                    this.triggerCallbacks('onResume');
                }
                break;
                
            case GAME_STATE.PAUSED:
                this.data.isPaused = true;
                this.data.pauseTime = Date.now();
                this.triggerCallbacks('onPause');
                break;
                
            case GAME_STATE.GAME_OVER:
                this.data.survivalTime = this.data.playTime;
                this.data.finalScore = this.calculateScore();
                this.triggerCallbacks('onGameOver');
                break;
                
            case GAME_STATE.VICTORY:
                this.data.survivalTime = this.data.playTime;
                this.data.finalScore = this.calculateScore();
                this.triggerCallbacks('onVictory');
                break;
        }
    }
    
    /**
     * 重置游戏数据
     */
    resetData() {
        // 保存当前选中的角色和难度（不重置）
        const savedCharacter = this.data.selectedCharacter;
        const savedDifficulty = this.data.difficulty;
        const savedSelectedDifficulty = this.data.selectedDifficulty;
        
        this.data = {
            playerHealth: PLAYER.MAX_HEALTH,
            maxHealth: PLAYER.MAX_HEALTH,
            playerWeapons: [{ ...WEAPONS.PISTOL }],  // 深拷贝初始武器
            currentWeaponIndex: 0,
            currentLevel: 1,
            killCount: 0,
            playTime: 0,
            weaponsCollected: 0,
            finalScore: 0,
            survivalTime: 0,
            isPaused: false,
            pauseTime: 0,
            isInvincible: false,
            invincibleTimer: 0,
            weaponSwitchCooldown: 0,
            selectedCharacter: savedCharacter,  // 恢复保存的角色
            difficulty: savedDifficulty || DIFFICULTY.DEFAULT,
            selectedDifficulty: savedSelectedDifficulty || DIFFICULTY.DEFAULT
        };
    }
    
    /**
     * 开始新游戏
     */
    startGame() {
        this.resetData();
        this.setState(GAME_STATE.PLAYING);
    }
    
    /**
     * 开始角色选择
     */
    startCharacterSelect() {
        this.setState(GAME_STATE.CHARACTER_SELECT);
    }
    
    /**
     * 设置选中的角色
     * @param {Character} character - 角色对象
     */
    setSelectedCharacter(character) {
        this.data.selectedCharacter = character;
    }
    
    /**
     * 获取选中的角色
     * @returns {Character|null} - 角色对象
     */
    getSelectedCharacter() {
        return this.data.selectedCharacter;
    }
    
    /**
     * 获取当前选择的角色ID
     * @returns {number} 角色ID
     */
    getSelectedCharacterId() {
        return this.data.selectedCharacterId;
    }
    
    /**
     * 设置当前选择的角色ID
     * @param {number} characterId - 角色ID
     */
    setSelectedCharacterId(characterId) {
        if (characterId >= 1 && characterId <= 24) {
            this.data.selectedCharacterId = characterId;
        }
    }
    
    /**
     * 检查角色是否已解锁
     * @param {number} characterId - 角色ID
     * @returns {boolean} 是否已解锁
     */
    isCharacterUnlocked(characterId) {
        return this.data.characterUnlocks[characterId] === true;
    }
    
    /**
     * 解锁角色
     * @param {number} characterId - 角色ID
     */
    unlockCharacter(characterId) {
        this.data.characterUnlocks[characterId] = true;
    }
    
    /**
     * 获取角色解锁状态
     * @returns {Object} 解锁状态对象
     */
    getCharacterUnlocks() {
        return this.data.characterUnlocks;
    }
    
    /**
     * 初始化角色解锁状态（默认全解锁）
     */
    initializeCharacterUnlocks() {
        for (let i = 1; i <= 24; i++) {
            if (this.data.characterUnlocks[i] === undefined) {
                this.data.characterUnlocks[i] = true;
            }
        }
    }
    
    /**
     * 暂停游戏
     */
    pauseGame() {
        if (this.isState(GAME_STATE.PLAYING)) {
            this.setState(GAME_STATE.PAUSED);
        }
    }
    
    /**
     * 继续游戏
     */
    resumeGame() {
        if (this.isState(GAME_STATE.PAUSED)) {
            this.setState(GAME_STATE.PLAYING);
        }
    }
    
    /**
     * 结束游戏（死亡）
     */
    gameOver() {
        // 播放失败音效
        audioManager.playSound(AUDIO.GAME_OVER);
        this.setState(GAME_STATE.GAME_OVER);
    }
    
    /**
     * 赢得游戏
     */
    victory() {
        this.setState(GAME_STATE.VICTORY);
    }
    
    /**
     * 返回主菜单
     */
    returnToMenu() {
        this.setState(GAME_STATE.MENU);
    }
    
    /**
     * 更新游戏数据（每帧调用）
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    update(deltaTime) {
        if (this.currentState !== GAME_STATE.PLAYING) return;
        if (this.data.isPaused) return;
        
        // 更新游玩时间
        this.data.playTime += deltaTime / 1000;
        
        // 更新无敌状态
        if (this.data.isInvincible) {
            this.data.invincibleTimer -= deltaTime;
            if (this.data.invincibleTimer <= 0) {
                this.data.isInvincible = false;
                this.data.invincibleTimer = 0;
            }
        }
        
        // 更新武器切换冷却
        if (this.data.weaponSwitchCooldown > 0) {
            this.data.weaponSwitchCooldown -= deltaTime;
        }
    }
    
    /**
     * 玩家受伤
     * @param {number} damage - 受到的伤害
     */
    playerHurt(damage = 1) {
        if (this.data.isInvincible) return false;
        
        this.data.playerHealth -= damage;
        
        // 设置无敌时间
        this.data.isInvincible = true;
        this.data.invincibleTimer = PLAYER.INVINCIBLE_TIME;
        
        // 检查是否死亡
        if (this.data.playerHealth <= 0) {
            this.data.playerHealth = 0;
            this.gameOver();
            return true;
        }
        
        return true;
    }
    
    /**
     * 治疗玩家
     * @param {number} amount - 治疗量
     * @returns {boolean} 是否成功治疗
     */
    healPlayer(amount = 1) {
        const maxHealth = this.data.maxHealth || PLAYER.MAX_HEALTH;
        if (this.data.playerHealth >= maxHealth) {
            return false;
        }
        this.data.playerHealth = Math.min(maxHealth, this.data.playerHealth + amount);
        return true;
    }
    
    /**
     * 设置玩家生命值
     * @param {number} health - 生命值
     */
    setHealth(health) {
        const maxHealth = this.data.maxHealth || PLAYER.MAX_HEALTH;
        this.data.playerHealth = Math.max(0, Math.min(maxHealth, health));
    }
    
    /**
     * 添加Buff
     * @param {Object} buff - Buff配置
     */
    addBuff(buff) {
        if (!this.buffManager) {
            if (typeof gameLogic !== 'undefined' && gameLogic.buffManager) {
                gameLogic.buffManager.addBuff(buff);
            }
        } else {
            this.buffManager.addBuff(buff);
        }
    }
    
    /**
     * 切换武器
     */
    switchWeapon() {
        if (this.data.weaponSwitchCooldown > 0) return false;
        if (this.data.playerWeapons.length <= 1) return false;
        
        // 切换到下一个武器
        this.data.currentWeaponIndex = 
            (this.data.currentWeaponIndex + 1) % this.data.playerWeapons.length;
        
        // 设置冷却时间
        this.data.weaponSwitchCooldown = PLAYER.WEAPON_SWITCH_COOLDOWN;
        
        return true;
    }
    
    /**
     * 添加武器
     * @param {Object} weapon - 武器数据
     */
    addWeapon(weapon) {
        // 如果武器栏未满
        if (this.data.playerWeapons.length < PLAYER.MAX_WEAPONS) {
            this.data.playerWeapons.push({ ...weapon });
            this.data.weaponsCollected++;
            return true;
        }
        // 如果武器栏已满，需要玩家选择
        return false;
    }
    
    /**
     * 增加击杀数
     */
    addKill() {
        this.data.killCount++;
    }
    
    /**
     * 进入下一关
     */
    nextLevel() {
        if (this.data.currentLevel < LEVELS.COUNT) {
            this.data.currentLevel++;
            return true;
        }
        return false;
    }
    
    /**
     * 计算最终得分
     */
    calculateScore() {
        // 基础分：击杀数 * 100
        const killScore = this.data.killCount * 100;
        
        // 时间分：存活时间越长得越多分
        const timeScore = Math.floor(this.data.playTime * 10);
        
        // 武器分：拾取的武器数 * 200
        const weaponScore = this.data.weaponsCollected * 200;
        
        return killScore + timeScore + weaponScore;
    }
    
    /**
     * 注册回调函数
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }
    
    /**
     * 触发回调函数
     * @param {string} event - 事件名称
     * @param {*} data - 传递给回调的数据
     */
    triggerCallbacks(event, data = null) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(data));
        }
    }
    
    /**
     * 获取当前难度配置
     * @returns {Object} 难度配置对象
     */
    getDifficultyConfig() {
        const difficultyKey = this.data.difficulty.toUpperCase();
        return DIFFICULTY.LEVELS[difficultyKey] || DIFFICULTY.LEVELS.NORMAL;
    }
    
    /**
     * 获取当前难度ID
     * @returns {string} 难度ID
     */
    getDifficulty() {
        return this.data.difficulty;
    }
    
    /**
     * 设置当前难度
     * @param {string} difficultyId - 难度ID
     */
    setDifficulty(difficultyId) {
        const validDifficulties = ['easy', 'normal', 'hard', 'nightmare'];
        if (validDifficulties.includes(difficultyId)) {
            this.data.difficulty = difficultyId;
            this.data.selectedDifficulty = difficultyId;
            this.saveDifficulty();
        }
    }
    
    /**
     * 获取选择界面选中的难度
     * @returns {string} 难度ID
     */
    getSelectedDifficulty() {
        return this.data.selectedDifficulty;
    }
    
    /**
     * 设置选择界面选中的难度
     * @param {string} difficultyId - 难度ID
     */
    setSelectedDifficulty(difficultyId) {
        const validDifficulties = ['easy', 'normal', 'hard', 'nightmare'];
        if (validDifficulties.includes(difficultyId)) {
            this.data.selectedDifficulty = difficultyId;
        }
    }
    
    /**
     * 开始难度选择
     */
    startDifficultySelect() {
        this.setState(GAME_STATE.DIFFICULTY_SELECT);
    }
    
    /**
     * 确认难度选择并开始游戏
     */
    confirmDifficultyAndStart() {
        this.setDifficulty(this.data.selectedDifficulty);
        this.startGame();
    }
    
    /**
     * 保存难度设置到localStorage
     */
    saveDifficulty() {
        try {
            localStorage.setItem('pixelDungeon_difficulty', this.data.difficulty);
        } catch (e) {
            console.warn('无法保存难度设置:', e);
        }
    }
    
    /**
     * 从localStorage加载难度设置
     */
    loadDifficulty() {
        try {
            const saved = localStorage.getItem('pixelDungeon_difficulty');
            if (saved && ['easy', 'normal', 'hard', 'nightmare'].includes(saved)) {
                this.data.difficulty = saved;
                this.data.selectedDifficulty = saved;
            }
        } catch (e) {
            console.warn('无法加载难度设置:', e);
        }
    }
    
    /**
     * 获取当前难度的基础倍率（用于简单计算）
     * @returns {number} 难度基础倍率
     */
    getDifficultyMultiplier() {
        const config = this.getDifficultyConfig();
        return config?.enemy?.healthMultiplier || 1;
    }
    
    /**
     * 获取房间难度递增倍率
     * @param {number} roomIndex - 房间索引（从0开始）
     * @param {boolean} isBossRoom - 是否是Boss房
     * @returns {number} 敌人强度倍率
     */
    getRoomDifficultyMultiplier(roomIndex, isBossRoom = false) {
        const progression = DIFFICULTY.ROOM_PROGRESSION.enemyStrengthByRoom;
        
        if (isBossRoom) {
            return progression[progression.length - 1];
        }
        
        if (roomIndex < 0) return progression[0];
        if (roomIndex >= progression.length - 1) return progression[progression.length - 2];
        
        return progression[roomIndex];
    }
}

// 创建全局状态管理器实例
const gameState = new GameStateManager();

// 初始化时加载保存的难度设置
gameState.loadDifficulty();