/**
 * 事件总线模块
 * 提供中心化事件系统，解耦模块间的直接依赖
 */

const EVENT_TYPES = {
    ENEMY_KILLED: 'ENEMY_KILLED',
    PLAYER_HURT: 'PLAYER_HURT',
    WEAPON_PICKUP: 'WEAPON_PICKUP',
    SKILL_USED: 'SKILL_USED',
    ROOM_CLEARED: 'ROOM_CLEARED',
    BOSS_SPAWN: 'BOSS_SPAWN',
    BOSS_DEATH: 'BOSS_DEATH',
    ACHIEVEMENT_UNLOCKED: 'ACHIEVEMENT_UNLOCKED',
    GOLD_EARNED: 'GOLD_EARNED',
    BUFF_APPLIED: 'BUFF_APPLIED'
};

class EventBus {
    constructor() {
        this.subscriptions = {};
        this.onceSubscriptions = {};
    }

    /**
     * 订阅事件
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     * @returns {Object} 订阅句柄，用于取消订阅
     */
    subscribe(eventName, callback) {
        if (typeof callback !== 'function') {
            console.error('[EventBus] 订阅失败：callback 必须是函数');
            return null;
        }

        if (!this.subscriptions[eventName]) {
            this.subscriptions[eventName] = [];
        }

        this.subscriptions[eventName].push(callback);

        return {
            unsubscribe: () => this.unsubscribe(eventName, callback)
        };
    }

    /**
     * 取消订阅
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     */
    unsubscribe(eventName, callback) {
        if (!this.subscriptions[eventName]) {
            return;
        }

        const index = this.subscriptions[eventName].indexOf(callback);
        if (index !== -1) {
            this.subscriptions[eventName].splice(index, 1);
        }
    }

    /**
     * 发布事件
     * @param {string} eventName - 事件名称
     * @param {Object} data - 事件数据
     */
    publish(eventName, data = {}) {
        console.log(`[EVENT] ${eventName}`, data);

        if (this.onceSubscriptions[eventName]) {
            const onceCallbacks = [...this.onceSubscriptions[eventName]];
            this.onceSubscriptions[eventName] = [];

            for (const callback of onceCallbacks) {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[EventBus] 事件 ${eventName} 的一次性订阅回调执行失败:`, error);
                }
            }
        }

        if (this.subscriptions[eventName]) {
            for (const callback of this.subscriptions[eventName]) {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[EventBus] 事件 ${eventName} 的订阅回调执行失败:`, error);
                }
            }
        }
    }

    /**
     * 单次订阅（只触发一次）
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     * @returns {Object} 订阅句柄，用于取消订阅
     */
    once(eventName, callback) {
        if (typeof callback !== 'function') {
            console.error('[EventBus] 单次订阅失败：callback 必须是函数');
            return null;
        }

        if (!this.onceSubscriptions[eventName]) {
            this.onceSubscriptions[eventName] = [];
        }

        this.onceSubscriptions[eventName].push(callback);

        return {
            unsubscribe: () => {
                if (!this.onceSubscriptions[eventName]) {
                    return;
                }
                const index = this.onceSubscriptions[eventName].indexOf(callback);
                if (index !== -1) {
                    this.onceSubscriptions[eventName].splice(index, 1);
                }
            }
        };
    }

    /**
     * 清除某事件所有订阅者
     * @param {string} eventName - 事件名称
     */
    clear(eventName) {
        if (this.subscriptions[eventName]) {
            this.subscriptions[eventName] = [];
        }
        if (this.onceSubscriptions[eventName]) {
            this.onceSubscriptions[eventName] = [];
        }
    }

    /**
     * 清除所有事件的订阅者
     */
    clearAll() {
        this.subscriptions = {};
        this.onceSubscriptions = {};
    }

    /**
     * 获取某事件的订阅者数量
     * @param {string} eventName - 事件名称
     * @returns {number} 订阅者数量
     */
    getSubscriberCount(eventName) {
        const normalCount = this.subscriptions[eventName] ? this.subscriptions[eventName].length : 0;
        const onceCount = this.onceSubscriptions[eventName] ? this.onceSubscriptions[eventName].length : 0;
        return normalCount + onceCount;
    }

    /**
     * 获取所有已注册的事件名称
     * @returns {Array} 事件名称数组
     */
    getRegisteredEvents() {
        const events = new Set();
        Object.keys(this.subscriptions).forEach((event) => events.add(event));
        Object.keys(this.onceSubscriptions).forEach((event) => events.add(event));
        return Array.from(events);
    }
}
