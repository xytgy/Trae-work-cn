/**
 * 排行榜系统
 * 负责游戏排行榜数据的管理、保存和显示
 */

class LeaderboardManager {
    constructor() {
        // 排行榜数据
        this.leaderboards = {};

        // 当前选中的排行榜类型
        this.currentType = LEADERBOARD.TYPES.SPEED;

        // 新记录标记
        this.newRecord = null;

        // 初始化
        this.init();
    }

    /**
     * 初始化排行榜系统
     */
    init() {
        this.loadLeaderboards();
    }

    /**
     * 加载所有排行榜
     */
    loadLeaderboards() {
        try {
            const data = localStorage.getItem(LEADERBOARD.STORAGE_KEY);

            if (data) {
                this.leaderboards = JSON.parse(data);
            } else {
                // 初始化空排行榜
                this.leaderboards = {};
                Object.values(LEADERBOARD.TYPES).forEach((type) => {
                    this.leaderboards[type] = [];
                });
            }
        } catch (e) {
            console.warn('加载排行榜失败:', e);
            this.leaderboards = {};
            Object.values(LEADERBOARD.TYPES).forEach((type) => {
                this.leaderboards[type] = [];
            });
        }
    }

    /**
     * 保存排行榜
     * @returns {boolean} 是否保存成功
     */
    saveLeaderboards() {
        try {
            localStorage.setItem(LEADERBOARD.STORAGE_KEY, JSON.stringify(this.leaderboards));
            return true;
        } catch (e) {
            console.error('保存排行榜失败:', e);
            return false;
        }
    }

    /**
     * 添加记录到排行榜
     * @param {string} type - 排行榜类型
     * @param {Object} record - 记录数据
     * @returns {number} 排名（-1表示未上榜）
     */
    addRecord(type, record) {
        if (!this.leaderboards[type]) {
            this.leaderboards[type] = [];
        }

        const board = this.leaderboards[type];

        // 新记录
        const newRecord = {
            ...record,
            timestamp: Date.now()
        };

        // 添加到列表
        board.push(newRecord);

        // 排序
        this.sortBoard(type);

        // 检查是否上榜
        const rank = this.getRank(type, newRecord);

        // 只保留前N名
        if (board.length > LEADERBOARD.MAX_ENTRIES) {
            board.length = LEADERBOARD.MAX_ENTRIES;
        }

        // 保存
        this.saveLeaderboards();

        // 如果是新记录，设置标记
        if (rank > 0 && rank <= LEADERBOARD.MAX_ENTRIES) {
            this.newRecord = { type, rank };
        }

        return rank;
    }

    /**
     * 对排行榜排序
     * @param {string} type - 排行榜类型
     */
    sortBoard(type) {
        const board = this.leaderboards[type];
        if (!board) {
            return;
        }

        switch (type) {
            case LEADERBOARD.TYPES.SPEED:
                // 通关时间越短越靠前
                board.sort((a, b) => a.value - b.value);
                break;

            case LEADERBOARD.TYPES.KILLS:
            case LEADERBOARD.TYPES.COINS:
            case LEADERBOARD.TYPES.ENDLESS:
                // 数值越大越靠前
                board.sort((a, b) => b.value - a.value);
                break;

            case LEADERBOARD.TYPES.CHARACTERS:
                // 角色通关记录，按时间排序
                board.sort((a, b) => a.value - b.value);
                break;

            default:
                board.sort((a, b) => b.value - a.value);
        }
    }

    /**
     * 获取记录的排名
     * @param {string} type - 排行榜类型
     * @param {Object} record - 记录
     * @returns {number} 排名（1-based，-1表示未上榜）
     */
    getRank(type, record) {
        const board = this.leaderboards[type];
        if (!board) {
            return -1;
        }

        // 查找记录的索引
        const index = board.findIndex((r) => r.timestamp === record.timestamp && r.value === record.value);

        return index >= 0 ? index + 1 : -1;
    }

    /**
     * 获取指定排行榜
     * @param {string} type - 排行榜类型
     * @returns {Array} 排行榜数据
     */
    getLeaderboard(type) {
        return this.leaderboards[type] || [];
    }

    /**
     * 获取当前排行榜
     * @returns {Array}
     */
    getCurrentLeaderboard() {
        return this.getLeaderboard(this.currentType);
    }

    /**
     * 切换排行榜类型
     * @param {string} type - 排行榜类型
     */
    setCurrentType(type) {
        if (Object.values(LEADERBOARD.TYPES).includes(type)) {
            this.currentType = type;
            this.newRecord = null;
        }
    }

    /**
     * 获取当前排行榜类型
     * @returns {string}
     */
    getCurrentType() {
        return this.currentType;
    }

    /**
     * 检查是否是新记录
     * @param {string} type - 排行榜类型
     * @returns {boolean}
     */
    isNewRecord(type) {
        return this.newRecord && this.newRecord.type === type;
    }

    /**
     * 获取新记录排名
     * @returns {number|null}
     */
    getNewRecordRank() {
        return this.newRecord ? this.newRecord.rank : null;
    }

    /**
     * 清除新记录标记
     */
    clearNewRecord() {
        this.newRecord = null;
    }

    /**
     * 清空指定排行榜
     * @param {string} type - 排行榜类型
     */
    clearBoard(type) {
        if (this.leaderboards[type]) {
            this.leaderboards[type] = [];
            this.saveLeaderboards();
        }
    }

    /**
     * 清空所有排行榜
     */
    clearAll() {
        Object.values(LEADERBOARD.TYPES).forEach((type) => {
            this.leaderboards[type] = [];
        });
        this.saveLeaderboards();
    }

    // ==================== 便捷方法 ====================

    /**
     * 提交通关时间记录
     * @param {number} time - 通关时间（秒）
     * @param {string} characterName - 角色名称
     * @returns {number} 排名
     */
    submitSpeedRun(time, characterName) {
        return this.addRecord(LEADERBOARD.TYPES.SPEED, {
            value: time,
            character: characterName,
            label: saveManager.formatPlayTime(time)
        });
    }

    /**
     * 提交击杀数记录
     * @param {number} kills - 击杀数
     * @param {string} characterName - 角色名称
     * @returns {number} 排名
     */
    submitKills(kills, characterName) {
        return this.addRecord(LEADERBOARD.TYPES.KILLS, {
            value: kills,
            character: characterName,
            label: kills.toString()
        });
    }

    /**
     * 提交金币收集记录
     * @param {number} coins - 金币数
     * @param {string} characterName - 角色名称
     * @returns {number} 排名
     */
    submitCoins(coins, characterName) {
        return this.addRecord(LEADERBOARD.TYPES.COINS, {
            value: coins,
            character: characterName,
            label: coins.toString()
        });
    }

    /**
     * 提交无尽模式层数记录
     * @param {number} floor - 层数
     * @param {string} characterName - 角色名称
     * @returns {number} 排名
     */
    submitEndlessFloor(floor, characterName) {
        return this.addRecord(LEADERBOARD.TYPES.ENDLESS, {
            value: floor,
            character: characterName,
            label: `第 ${floor} 层`
        });
    }

    /**
     * 提交角色通关记录
     * @param {string} characterId - 角色ID
     * @param {number} time - 通关时间
     * @param {string} characterName - 角色名称
     * @returns {number} 排名
     */
    submitCharacterVictory(characterId, time, characterName) {
        return this.addRecord(LEADERBOARD.TYPES.CHARACTERS, {
            value: time,
            character: characterName,
            characterId: characterId,
            label: saveManager.formatPlayTime(time)
        });
    }

    /**
     * 获取排行榜类型名称
     * @param {string} type - 排行榜类型
     * @returns {string}
     */
    getTypeName(type) {
        const typeNames = {
            [LEADERBOARD.TYPES.SPEED]: '最快通关',
            [LEADERBOARD.TYPES.KILLS]: '击杀数',
            [LEADERBOARD.TYPES.COINS]: '金币收集',
            [LEADERBOARD.TYPES.ENDLESS]: '无尽模式',
            [LEADERBOARD.TYPES.CHARACTERS]: '角色通关'
        };
        return typeNames[type] || type;
    }

    /**
     * 获取排名奖牌
     * @param {number} rank - 排名（1-based）
     * @returns {string}
     */
    getRankMedal(rank) {
        switch (rank) {
            case 1:
                return '🥇';
            case 2:
                return '🥈';
            case 3:
                return '🥉';
            default:
                return '';
        }
    }

    /**
     * 格式化相对时间
     * @param {number} timestamp - 时间戳
     * @returns {string}
     */
    formatRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) {
            return '刚刚';
        }
        if (minutes < 60) {
            return `${minutes}分钟前`;
        }
        if (hours < 24) {
            return `${hours}小时前`;
        }
        if (days < 7) {
            return `${days}天前`;
        }
        if (days < 30) {
            return `${Math.floor(days / 7)}周前`;
        }
        if (days < 365) {
            return `${Math.floor(days / 30)}个月前`;
        }
        return `${Math.floor(days / 365)}年前`;
    }
}

// 创建全局排行榜管理器实例
const leaderboardManager = new LeaderboardManager();
