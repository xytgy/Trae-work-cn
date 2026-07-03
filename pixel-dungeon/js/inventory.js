/**
 * 背包系统
 * 管理玩家的道具存储和使用
 */

class Inventory {
    constructor() {
        this.slots = [];
        this.maxSlots = INVENTORY_CONFIG.MAX_SLOTS;
        this.gold = 0;
        this.gems = 0;
        this.collectedItemIds = new Set();
    }

    /**
     * 重置背包
     */
    reset() {
        this.slots = [];
        this.gold = 0;
        this.gems = 0;
        this.collectedItemIds = new Set();
    }

    /**
     * 添加道具
     * @param {Item} item - 道具
     * @returns {boolean} 是否添加成功
     */
    addItem(item) {
        if (item.type === 'material') {
            if (item.id === 'gold') {
                this.gold += item.count;
                this.collectedItemIds.add(item.id);
                return true;
            }
            if (item.id === 'gem') {
                this.gems += item.count;
                this.collectedItemIds.add(item.id);
                return true;
            }
        }

        if (item.stackable) {
            const existing = this.slots.find((slot) => slot.id === item.id);
            if (existing) {
                const space = existing.maxStack - existing.count;
                if (space >= item.count) {
                    existing.count += item.count;
                    this.collectedItemIds.add(item.id);
                    return true;
                } else {
                    existing.count = existing.maxStack;
                    item.count -= space;
                }
            }
        }

        if (this.slots.length < this.maxSlots) {
            this.slots.push(item);
            this.collectedItemIds.add(item.id);
            return true;
        }

        return false;
    }

    /**
     * 移除指定位置的道具
     * @param {number} slotIndex - 槽位索引
     * @param {number} count - 数量
     * @returns {Item|null}
     */
    removeItem(slotIndex, count = 1) {
        if (slotIndex < 0 || slotIndex >= this.slots.length) {
            return null;
        }

        const item = this.slots[slotIndex];
        if (item.stackable && item.count > count) {
            item.count -= count;
            return item.clone();
        } else {
            this.slots.splice(slotIndex, 1);
            return item;
        }
    }

    /**
     * 使用指定槽位的道具
     * @param {number} slotIndex - 槽位索引
     * @param {Object} gameLogic - 游戏逻辑引用
     * @returns {boolean} 是否使用成功
     */
    useItem(slotIndex, gameLogic) {
        if (slotIndex < 0 || slotIndex >= this.slots.length) {
            return false;
        }

        const item = this.slots[slotIndex];

        if (item.type === 'relic') {
            const success = gameLogic.relicManager.addRelic(item, gameLogic);
            if (success) {
                this.slots.splice(slotIndex, 1);
            }
            return success;
        }

        const consumed = item.use(gameLogic);
        if (consumed) {
            this.slots.splice(slotIndex, 1);
        }

        return true;
    }

    /**
     * 获取指定槽位的道具
     * @param {number} slotIndex
     * @returns {Item|null}
     */
    getItem(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.slots.length) {
            return null;
        }
        return this.slots[slotIndex];
    }

    /**
     * 检查是否有足够的金币
     * @param {number} amount
     * @returns {boolean}
     */
    hasGold(amount) {
        return this.gold >= amount;
    }

    /**
     * 检查是否有足够的宝石
     * @param {number} amount
     * @returns {boolean}
     */
    hasGems(amount) {
        return this.gems >= amount;
    }

    /**
     * 消费金币
     * @param {number} amount
     * @returns {boolean}
     */
    spendGold(amount) {
        if (this.hasGold(amount)) {
            this.gold -= amount;
            return true;
        }
        return false;
    }

    /**
     * 消费宝石
     * @param {number} amount
     * @returns {boolean}
     */
    spendGems(amount) {
        if (this.hasGems(amount)) {
            this.gems -= amount;
            return true;
        }
        return false;
    }

    /**
     * 添加金币
     * @param {number} amount
     * @param {Object} player - 玩家引用（用于计算加成）
     */
    addGold(amount, player = null) {
        let bonus = 1;
        if (player && player.goldGainBonus) {
            bonus += player.goldGainBonus;
        }
        this.gold += Math.floor(amount * bonus);
    }

    /**
     * 添加宝石
     * @param {number} amount
     */
    addGems(amount) {
        this.gems += amount;
    }

    /**
     * 获取收集的不同道具数量
     * @returns {number}
     */
    getCollectedItemCount() {
        return this.collectedItemIds.size;
    }

    /**
     * 获取背包中道具数量
     * @returns {number}
     */
    getItemCount() {
        return this.slots.length;
    }

    /**
     * 检查背包是否已满
     * @returns {boolean}
     */
    isFull() {
        return this.slots.length >= this.maxSlots;
    }
}
