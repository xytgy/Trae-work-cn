/**
 * 遗物系统
 * 管理被动永久生效的遗物
 */

class Relic extends Item {
    /**
     * 构造遗物
     * @param {Object} config - 遗物配置
     */
    constructor(config) {
        super(config.id, config.name, config.icon, 'relic', config.rarity, config.description);

        this.effect = config.effect;
        this.value = config.value;
        this.stackable = false;
        this.maxStack = 1;
        this.count = 1;
        this.equipped = false;
    }

    /**
     * 使用遗物（装备/拾取）
     * @param {Object} gameLogic - 游戏逻辑引用
     * @returns {boolean}
     */
    use(gameLogic) {
        if (this.equipped) {
            return false;
        }

        this.equip(gameLogic);
        return true;
    }

    /**
     * 装备遗物
     * @param {Object} gameLogic - 游戏逻辑引用
     */
    equip(gameLogic) {
        if (this.equipped) {
            return;
        }

        this.equipped = true;
        this.applyEffect(gameLogic);
    }

    /**
     * 应用遗物效果
     * @param {Object} gameLogic - 游戏逻辑引用
     */
    applyEffect(gameLogic) {
        const player = gameLogic.player;
        const state = gameLogic.state;

        switch (this.effect) {
            case 'max_health':
                state.data.maxHealth = (state.data.maxHealth || PLAYER.MAX_HEALTH) + this.value;
                state.data.playerHealth = Math.min(state.data.playerHealth + this.value, state.data.maxHealth);
                break;

            case 'rage_gain':
                player.rageGainBonus = (player.rageGainBonus || 0) + this.value;
                break;

            case 'damage_reduction':
                player.damageReduction = (player.damageReduction || 0) + this.value;
                break;

            case 'move_speed':
                player.speedBonus = (player.speedBonus || 0) + this.value;
                break;

            case 'crit_rate':
                player.critRate = (player.critRate || 0) + this.value;
                break;

            case 'gold_gain':
                player.goldGainBonus = (player.goldGainBonus || 0) + this.value;
                break;

            case 'burn':
                player.burnDamage = (player.burnDamage || 0) + this.value;
                break;

            case 'slow':
                player.slowEffect = (player.slowEffect || 0) + this.value;
                break;

            case 'chain_lightning':
                player.chainChance = (player.chainChance || 0) + this.value;
                break;

            case 'drop_rate':
                player.dropRateBonus = (player.dropRateBonus || 0) + this.value;
                break;
        }
    }

    /**
     * 克隆遗物
     * @returns {Relic}
     */
    clone() {
        const config = {
            id: this.id,
            name: this.name,
            icon: this.icon,
            rarity: this.rarity,
            description: this.description,
            effect: this.effect,
            value: this.value
        };
        return new Relic(config);
    }
}

/**
 * 遗物工厂
 * 创建各种遗物
 */
const RelicFactory = {
    /**
     * 创建遗物
     * @param {string} type - 遗物类型
     * @returns {Relic}
     */
    createRelic(type) {
        const config = RELICS[type];
        if (!config) {
            return null;
        }

        return new Relic(config);
    },

    /**
     * 创建生命之心
     * @returns {Relic}
     */
    createHeartRelic() {
        return this.createRelic('HEART');
    },

    /**
     * 创建能量核心
     * @returns {Relic}
     */
    createEnergyCore() {
        return this.createRelic('ENERGY_CORE');
    },

    /**
     * 创建钢铁护符
     * @returns {Relic}
     */
    createSteelAmulet() {
        return this.createRelic('STEEL_AMULET');
    },

    /**
     * 创建疾风之靴
     * @returns {Relic}
     */
    createWindBoots() {
        return this.createRelic('WIND_BOOTS');
    },

    /**
     * 创建瞄准镜
     * @returns {Relic}
     */
    createScope() {
        return this.createRelic('SCOPE');
    },

    /**
     * 创建聚宝盆
     * @returns {Relic}
     */
    createGoldPot() {
        return this.createRelic('GOLD_POT');
    },

    /**
     * 创建火焰之心
     * @returns {Relic}
     */
    createFireHeart() {
        return this.createRelic('FIRE_HEART');
    },

    /**
     * 创建冰霜之心
     * @returns {Relic}
     */
    createIceHeart() {
        return this.createRelic('ICE_HEART');
    },

    /**
     * 创建雷电之心
     * @returns {Relic}
     */
    createThunderHeart() {
        return this.createRelic('THUNDER_HEART');
    },

    /**
     * 创建幸运星
     * @returns {Relic}
     */
    createLuckyStar() {
        return this.createRelic('LUCKY_STAR');
    },

    /**
     * 创建随机遗物
     * @param {string} rarity - 稀有度
     * @returns {Relic}
     */
    createRandomRelic(rarity = 'rare') {
        const relicTypes = Object.keys(RELICS).filter((key) => {
            return RELICS[key].rarity === rarity;
        });

        if (relicTypes.length === 0) {
            relicTypes.push('HEART');
        }

        const randomType = relicTypes[Math.floor(Math.random() * relicTypes.length)];
        return this.createRelic(randomType);
    }
};

/**
 * 遗物管理器
 * 管理玩家已装备的遗物
 */
class RelicManager {
    constructor() {
        this.relics = [];
    }

    /**
     * 重置遗物
     */
    reset() {
        this.relics = [];
    }

    /**
     * 添加遗物
     * @param {Relic} relic - 遗物
     * @param {Object} gameLogic - 游戏逻辑引用
     * @returns {boolean}
     */
    addRelic(relic, gameLogic) {
        const existing = this.relics.find((r) => r.id === relic.id);
        if (existing) {
            return false;
        }

        relic.equip(gameLogic);
        this.relics.push(relic);
        return true;
    }

    /**
     * 获取所有遗物
     * @returns {Relic[]}
     */
    getRelics() {
        return this.relics;
    }

    /**
     * 检查是否有指定遗物
     * @param {string} relicId - 遗物ID
     * @returns {boolean}
     */
    hasRelic(relicId) {
        return this.relics.some((r) => r.id === relicId);
    }

    /**
     * 获取遗物数量
     * @returns {number}
     */
    getCount() {
        return this.relics.length;
    }
}
