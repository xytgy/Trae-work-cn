/**
 * 存档系统
 * 负责游戏存档的保存、加载、导入和导出
 */

class SaveManager {
    constructor() {
        // 存档数据
        this.saveSlots = [];

        // 当前选中的存档槽
        this.selectedSlot = 0;

        // 存档版本号
        this.SAVE_VERSION = '1.0';

        

        // 全局统计数据（跨存档）
        this.globalStats = {
            totalKills: 0,
            totalPlayTime: 0,
            totalVictories: 0,
            totalGamesPlayed: 0,
            unlockedCharacters: {},
            achievements: {},
            collectedWeapons: [],
            coins: 0,
            gems: 0
        };

        // 初始化
        try {
            this.init();
        } catch (error) {
            console.error('[SAVE] 存档系统初始化失败:', error);
        }
    }

    _generateChecksum(data) {
        let hash = 0;
        const str = JSON.stringify(data);
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    _encodeSave(data) {
        const checksum = this._generateChecksum(data);
        const wrappedData = {
            version: this.SAVE_VERSION,
            checksum: checksum,
            data: data
        };
        return btoa(JSON.stringify(wrappedData));
    }

    _decodeSave(encodedString) {
        try {
            const wrappedData = JSON.parse(atob(encodedString));
            if (wrappedData.data && wrappedData.checksum) {
                const calculatedChecksum = this._generateChecksum(wrappedData.data);
                if (calculatedChecksum === wrappedData.checksum) {
                    return wrappedData.data;
                } else {
                    console.warn('[SAVE] 存档数据校验失败，可能被篡改');
                    return null;
                }
            }
        } catch (e) {
            console.warn('[SAVE] 解码存档失败:', e);
        }
        return null;
    }

    /**
     * 初始化存档系统
     */
    init() {
        this.loadAllSaves();
        this.loadGlobalStats();
    }

    /**
     * 检查 localStorage 是否可用
     * @returns {boolean}
     */
    checkStorageAvailable() {
        try {
            const testKey = '__pixel_dungeon_storage_test__';
            localStorage.setItem(testKey, '1');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('[SAVE] localStorage 不可用:', e);
            return false;
        }
    }

    /**
     * 迁移存档数据版本
     * @param {Object} saveData - 原始存档数据
     * @returns {Object|null} 迁移后的存档数据
     */
    migrateSaveData(saveData) {
        if (!saveData) {
            return null;
        }

        const version = saveData.version || '0.0';

        if (version === this.SAVE_VERSION) {
            return saveData;
        }

        console.log(`[SAVE] 迁移存档数据: ${version} -> ${this.SAVE_VERSION}`);

        if (version === '0.0') {
            saveData.version = '1.0';
            if (!saveData.characterName) {
                saveData.characterName = '未知';
            }
            if (!saveData.isVictory) {
                saveData.isVictory = false;
            }
            if (!saveData.playerHealth) {
                saveData.playerHealth = PLAYER.MAX_HEALTH;
            }
        }

        return saveData;
    }

    /**
     * 加载所有存档
     */
    loadAllSaves() {
        this.saveSlots = [];

        for (let i = 0; i < SAVE.SLOT_COUNT; i++) {
            const saveData = this.loadSlot(i);
            this.saveSlots.push(saveData);
        }
    }

    /**
     * 加载单个存档槽
     * @param {number} slotIndex - 槽位索引
     * @returns {Object|null} 存档数据
     */
    loadSlot(slotIndex) {
        try {
            const key = `${SAVE.STORAGE_KEY}_slot_${slotIndex}`;
            const data = localStorage.getItem(key);

            if (data) {
                let saveData = this._decodeSave(data);
                if (!saveData) {
                    saveData = JSON.parse(data);
                    console.warn(`[SAVE] 存档槽 ${slotIndex} 使用旧格式，未加密`);
                }
                return this.migrateSaveData(saveData);
            }
        } catch (e) {
            console.warn(`加载存档槽 ${slotIndex} 失败:`, e);
        }

        return null;
    }

    /**
     * 保存到指定槽位
     * @param {number} slotIndex - 槽位索引
     * @param {Object} gameData - 游戏数据
     * @returns {boolean} 是否保存成功
     */
    saveToSlot(slotIndex, gameData) {
        try {
            const saveData = {
                version: this.SAVE_VERSION,
                timestamp: Date.now(),
                characterId: gameData.selectedCharacter?.id || 1,
                characterName: gameData.selectedCharacter?.name || '未知',
                currentLevel: gameData.currentLevel || 1,
                playTime: gameData.playTime || 0,
                killCount: gameData.killCount || 0,
                weaponsCollected: gameData.weaponsCollected || 0,
                finalScore: gameData.finalScore || 0,
                isVictory: gameState.isState(GAME_STATE.VICTORY),
                playerHealth: gameData.playerHealth || PLAYER.MAX_HEALTH,
                currentWeaponIndex: gameData.currentWeaponIndex || 0,
                playerWeapons: gameData.playerWeapons || []
            };

            const key = `${SAVE.STORAGE_KEY}_slot_${slotIndex}`;
            localStorage.setItem(key, this._encodeSave(saveData));

            // 更新内存中的存档
            this.saveSlots[slotIndex] = saveData;

            // 更新全局统计
            this.updateGlobalStats(gameData);

            console.log(`存档保存成功，槽位: ${slotIndex}`);
            return true;
        } catch (e) {
            console.error('保存存档失败:', e);
            return false;
        }
    }

    /**
     * 自动保存
     * @param {Object} gameData - 游戏数据
     * @returns {boolean} 是否保存成功
     */
    autoSave(gameData) {
        try {
            const saveData = {
                version: this.SAVE_VERSION,
                timestamp: Date.now(),
                characterId: gameData.selectedCharacter?.id || 1,
                characterName: gameData.selectedCharacter?.name || '未知',
                currentLevel: gameData.currentLevel || 1,
                playTime: gameData.playTime || 0,
                killCount: gameData.killCount || 0,
                weaponsCollected: gameData.weaponsCollected || 0,
                finalScore: gameData.finalScore || 0,
                isVictory: false,
                playerHealth: gameData.playerHealth || PLAYER.MAX_HEALTH,
                currentWeaponIndex: gameData.currentWeaponIndex || 0,
                playerWeapons: gameData.playerWeapons || []
            };

            localStorage.setItem(SAVE.AUTO_SAVE_KEY, this._encodeSave(saveData));
            console.log('自动保存成功');
            return true;
        } catch (e) {
            console.error('自动保存失败:', e);
            return false;
        }
    }

    /**
     * 加载自动存档
     * @returns {Object|null} 自动存档数据
     */
    loadAutoSave() {
        try {
            const data = localStorage.getItem(SAVE.AUTO_SAVE_KEY);
            if (data) {
                let saveData = this._decodeSave(data);
                if (!saveData) {
                    saveData = JSON.parse(data);
                    console.warn('[SAVE] 自动存档使用旧格式，未加密');
                }
                return this.migrateSaveData(saveData);
            }
        } catch (e) {
            console.warn('加载自动存档失败:', e);
        }
        return null;
    }

    /**
     * 检查是否有自动存档
     * @returns {boolean}
     */
    hasAutoSave() {
        return this.loadAutoSave() !== null;
    }

    /**
     * 删除指定槽位的存档
     * @param {number} slotIndex - 槽位索引
     * @returns {boolean} 是否删除成功
     */
    deleteSlot(slotIndex) {
        try {
            const key = `${SAVE.STORAGE_KEY}_slot_${slotIndex}`;
            localStorage.removeItem(key);
            this.saveSlots[slotIndex] = null;
            console.log(`存档槽 ${slotIndex} 已删除`);
            return true;
        } catch (e) {
            console.error('删除存档失败:', e);
            return false;
        }
    }

    /**
     * 获取指定槽位的存档信息
     * @param {number} slotIndex - 槽位索引
     * @returns {Object|null} 存档数据
     */
    getSlotInfo(slotIndex) {
        return this.saveSlots[slotIndex] || null;
    }

    /**
     * 获取所有存档槽信息
     * @returns {Array} 存档数组
     */
    getAllSlots() {
        return this.saveSlots;
    }

    /**
     * 检查槽位是否有存档
     * @param {number} slotIndex - 槽位索引
     * @returns {boolean}
     */
    hasSave(slotIndex) {
        return this.saveSlots[slotIndex] !== null;
    }

    /**
     * 获取最新的存档
     * @returns {Object|null}
     */
    getLatestSave() {
        let latest = null;
        let latestTime = 0;

        for (let i = 0; i < this.saveSlots.length; i++) {
            if (this.saveSlots[i] && this.saveSlots[i].timestamp > latestTime) {
                latest = this.saveSlots[i];
                latestTime = this.saveSlots[i].timestamp;
            }
        }

        return latest;
    }

    /**
     * 更新全局统计数据
     * @param {Object} gameData - 游戏数据
     */
    updateGlobalStats(gameData) {
        if (gameData.killCount) {
            this.globalStats.totalKills += gameData.killCount;
        }
        if (gameData.playTime) {
            this.globalStats.totalPlayTime += gameData.playTime;
        }

        this.globalStats.totalGamesPlayed++;

        if (gameState.isState(GAME_STATE.VICTORY)) {
            this.globalStats.totalVictories++;
        }

        this.saveGlobalStats();
    }

    /**
     * 保存全局统计数据
     */
    saveGlobalStats() {
        try {
            const key = `${SAVE.STORAGE_KEY}_global_stats`;
            localStorage.setItem(key, JSON.stringify(this.globalStats));
        } catch (e) {
            console.error('保存全局统计失败:', e);
        }
    }

    /**
     * 加载全局统计数据
     */
    loadGlobalStats() {
        try {
            const key = `${SAVE.STORAGE_KEY}_global_stats`;
            const data = localStorage.getItem(key);

            if (data) {
                this.globalStats = { ...this.globalStats, ...JSON.parse(data) };
            }
        } catch (e) {
            console.warn('加载全局统计失败:', e);
        }
    }

    /**
     * 获取全局统计数据
     * @returns {Object}
     */
    getGlobalStats() {
        return this.globalStats;
    }

    /**
     * 导出所有存档为JSON
     * @returns {string} JSON字符串
     */
    exportAllSaves() {
        const exportData = {
            version: this.SAVE_VERSION,
            exportTime: Date.now(),
            slots: this.saveSlots,
            globalStats: this.globalStats
        };

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * 从JSON导入存档
     * @param {string} jsonString - JSON字符串
     * @returns {boolean} 是否导入成功
     */
    importSaves(jsonString) {
        try {
            const importData = JSON.parse(jsonString);

            if (importData.slots && Array.isArray(importData.slots)) {
                for (let i = 0; i < Math.min(importData.slots.length, SAVE.SLOT_COUNT); i++) {
                    if (importData.slots[i]) {
                        const key = `${SAVE.STORAGE_KEY}_slot_${i}`;
                        localStorage.setItem(key, JSON.stringify(importData.slots[i]));
                        this.saveSlots[i] = importData.slots[i];
                    }
                }
            }

            if (importData.globalStats) {
                this.globalStats = { ...this.globalStats, ...importData.globalStats };
                this.saveGlobalStats();
            }

            console.log('存档导入成功');
            return true;
        } catch (e) {
            console.error('导入存档失败:', e);
            return false;
        }
    }

    /**
     * 格式化游戏时间
     * @param {number} seconds - 秒数
     * @returns {string} 格式化的时间字符串
     */
    formatPlayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        const pad = (n) => n.toString().padStart(2, '0');

        if (hours > 0) {
            return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
        } else {
            return `${pad(minutes)}:${pad(secs)}`;
        }
    }

    /**
     * 格式化日期
     * @param {number} timestamp - 时间戳
     * @returns {string} 格式化的日期字符串
     */
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    /**
     * 解锁角色
     * @param {number} characterId - 角色ID
     */
    unlockCharacter(characterId) {
        this.globalStats.unlockedCharacters[characterId] = true;
        this.saveGlobalStats();
    }

    /**
     * 检查角色是否解锁
     * @param {number} characterId - 角色ID
     * @returns {boolean}
     */
    isCharacterUnlocked(characterId) {
        return this.globalStats.unlockedCharacters[characterId] === true;
    }

    /**
     * 解锁成就
     * @param {string} achievementId - 成就ID
     * @returns {boolean} 是否是新解锁的
     */
    unlockAchievement(achievementId) {
        if (!this.globalStats.achievements[achievementId]) {
            this.globalStats.achievements[achievementId] = {
                unlockedAt: Date.now()
            };
            this.saveGlobalStats();
            return true;
        }
        return false;
    }

    /**
     * 检查成就是否解锁
     * @param {string} achievementId - 成就ID
     * @returns {boolean}
     */
    isAchievementUnlocked(achievementId) {
        return this.globalStats.achievements[achievementId] !== undefined;
    }

    /**
     * 添加收集的武器
     * @param {number} weaponId - 武器ID
     */
    addCollectedWeapon(weaponId) {
        if (!this.globalStats.collectedWeapons.includes(weaponId)) {
            this.globalStats.collectedWeapons.push(weaponId);
            this.saveGlobalStats();
        }
    }

    /**
     * 添加金币
     * @param {number} amount - 数量
     */
    addCoins(amount) {
        this.globalStats.coins += amount;
        this.saveGlobalStats();
    }

    /**
     * 添加宝石
     * @param {number} amount - 数量
     */
    addGems(amount) {
        this.globalStats.gems += amount;
        this.saveGlobalStats();
    }
}

// 创建全局存档管理器实例
const saveManager = new SaveManager();
