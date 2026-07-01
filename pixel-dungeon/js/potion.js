/**
 * 药水系统
 * 管理药水效果和药水道具
 */

class Potion extends Item {
    /**
     * 构造药水
     * @param {Object} config - 药水配置
     */
    constructor(config) {
        super(
            config.id,
            config.name,
            config.icon,
            'potion',
            config.rarity,
            config.description
        );
        
        this.effect = config.effect;
        this.value = config.value;
        this.duration = config.duration;
        this.price = config.price || 0;
        this.gemPrice = config.gemPrice || 0;
        this.stackable = true;
        this.maxStack = 10;
        this.count = 1;
    }
    
    /**
     * 使用药水
     * @param {Object} gameLogic - 游戏逻辑引用
     * @returns {boolean} 是否消耗完
     */
    use(gameLogic) {
        if (this.count <= 0) return false;
        
        this.applyEffect(gameLogic);
        
        this.count--;
        return this.count <= 0;
    }
    
    /**
     * 应用药水效果
     * @param {Object} gameLogic - 游戏逻辑引用
     */
    applyEffect(gameLogic) {
        const state = gameLogic.state;
        const player = gameLogic.player;
        const rageSystem = gameLogic.rageSystem;
        
        switch (this.effect) {
            case 'heal':
                state.healPlayer(this.value);
                this.spawnHealParticles(gameLogic, player.x, player.y);
                break;
                
            case 'full_heal':
                state.setHealth(PLAYER.MAX_HEALTH);
                this.spawnHealParticles(gameLogic, player.x, player.y);
                break;
                
            case 'rage':
                rageSystem.addRage(this.value);
                break;
                
            case 'shield':
                state.addBuff({
                    type: 'shield',
                    duration: this.duration,
                    value: 1
                });
                break;
                
            case 'speed':
                state.addBuff({
                    type: 'speed',
                    duration: this.duration,
                    value: this.value
                });
                break;
                
            case 'crit':
                state.addBuff({
                    type: 'crit',
                    duration: this.duration,
                    value: this.value
                });
                break;
                
            case 'damage':
                state.addBuff({
                    type: 'damage',
                    duration: this.duration,
                    value: this.value
                });
                break;
                
            case 'invisible':
                state.addBuff({
                    type: 'invisible',
                    duration: this.duration,
                    value: 1
                });
                break;
                
            case 'poison':
                state.addBuff({
                    type: 'poison',
                    duration: this.duration,
                    value: this.value
                });
                break;
                
            case 'regen':
                state.addBuff({
                    type: 'regen',
                    duration: this.duration,
                    value: this.value,
                    interval: 1000
                });
                break;
                
            case 'random':
                this.applyRandomEffect(gameLogic);
                break;
        }
    }
    
    /**
     * 应用随机效果
     * @param {Object} gameLogic - 游戏逻辑引用
     */
    applyRandomEffect(gameLogic) {
        const effects = [
            'heal', 'full_heal', 'rage', 'shield', 'speed',
            'crit', 'damage', 'invisible', 'poison', 'regen'
        ];
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        
        const originalEffect = this.effect;
        const originalValue = this.value;
        const originalDuration = this.duration;
        
        this.effect = randomEffect;
        
        switch (randomEffect) {
            case 'heal':
                this.value = 2;
                this.duration = 0;
                break;
            case 'full_heal':
                this.value = 0;
                this.duration = 0;
                break;
            case 'rage':
                this.value = 80;
                this.duration = 0;
                break;
            case 'shield':
                this.value = 1;
                this.duration = 8000;
                break;
            case 'speed':
                this.value = 0.5;
                this.duration = 15000;
                break;
            case 'crit':
                this.value = 0.8;
                this.duration = 15000;
                break;
            case 'damage':
                this.value = 0.8;
                this.duration = 15000;
                break;
            case 'invisible':
                this.value = 1;
                this.duration = 10000;
                break;
            case 'poison':
                this.value = 2;
                this.duration = 20000;
                break;
            case 'regen':
                this.value = 1;
                this.duration = 15000;
                break;
        }
        
        this.applyEffect(gameLogic);
        
        this.effect = originalEffect;
        this.value = originalValue;
        this.duration = originalDuration;
    }
    
    /**
     * 生成治疗粒子效果
     * @param {Object} gameLogic - 游戏逻辑引用
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    spawnHealParticles(gameLogic, x, y) {
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            
            gameLogic.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 2,
                '#4caf50',
                3 + Math.random() * 3,
                500 + Math.random() * 300
            ));
        }
    }
    
    /**
     * 克隆药水
     * @returns {Potion}
     */
    clone() {
        const config = {
            id: this.id,
            name: this.name,
            icon: this.icon,
            rarity: this.rarity,
            description: this.description,
            effect: this.effect,
            value: this.value,
            duration: this.duration,
            price: this.price,
            gemPrice: this.gemPrice
        };
        const potion = new Potion(config);
        potion.count = this.count;
        return potion;
    }
}

/**
 * 药水工厂
 * 创建各种药水
 */
const PotionFactory = {
    /**
     * 创建药水
     * @param {string} type - 药水类型
     * @param {number} count - 数量
     * @returns {Potion}
     */
    createPotion(type, count = 1) {
        const config = POTIONS[type];
        if (!config) return null;
        
        const potion = new Potion(config);
        potion.count = count;
        return potion;
    },
    
    /**
     * 创建生命药水
     * @param {number} count
     * @returns {Potion}
     */
    createHealthPotion(count = 1) {
        return this.createPotion('HEALTH', count);
    },
    
    /**
     * 创建大生命药水
     * @param {number} count
     * @returns {Potion}
     */
    createFullHealthPotion(count = 1) {
        return this.createPotion('FULL_HEALTH', count);
    },
    
    /**
     * 创建能量药水
     * @param {number} count
     * @returns {Potion}
     */
    createRagePotion(count = 1) {
        return this.createPotion('RAGE', count);
    },
    
    /**
     * 创建护盾药水
     * @param {number} count
     * @returns {Potion}
     */
    createShieldPotion(count = 1) {
        return this.createPotion('SHIELD', count);
    },
    
    /**
     * 创建加速药水
     * @param {number} count
     * @returns {Potion}
     */
    createSpeedPotion(count = 1) {
        return this.createPotion('SPEED', count);
    },
    
    /**
     * 创建精准药水
     * @param {number} count
     * @returns {Potion}
     */
    createCritPotion(count = 1) {
        return this.createPotion('CRIT', count);
    },
    
    /**
     * 创建狂暴药水
     * @param {number} count
     * @returns {Potion}
     */
    createDamagePotion(count = 1) {
        return this.createPotion('DAMAGE', count);
    },
    
    /**
     * 创建隐身药水
     * @param {number} count
     * @returns {Potion}
     */
    createInvisiblePotion(count = 1) {
        return this.createPotion('INVISIBLE', count);
    },
    
    /**
     * 创建毒药水
     * @param {number} count
     * @returns {Potion}
     */
    createPoisonPotion(count = 1) {
        return this.createPotion('POISON', count);
    },
    
    /**
     * 创建治疗药水
     * @param {number} count
     * @returns {Potion}
     */
    createRegenPotion(count = 1) {
        return this.createPotion('REGEN', count);
    },
    
    /**
     * 创建神秘药水
     * @param {number} count
     * @returns {Potion}
     */
    createMysteryPotion(count = 1) {
        return this.createPotion('MYSTERY', count);
    },
    
    /**
     * 创建随机药水
     * @param {string} rarity - 稀有度
     * @returns {Potion}
     */
    createRandomPotion(rarity = 'common') {
        const potionTypes = Object.keys(POTIONS).filter(key => {
            return POTIONS[key].rarity === rarity;
        });
        
        if (potionTypes.length === 0) {
            potionTypes.push('HEALTH');
        }
        
        const randomType = potionTypes[Math.floor(Math.random() * potionTypes.length)];
        return this.createPotion(randomType, 1);
    }
};

/**
 * Buff管理器
 * 管理玩家的增益/减益效果
 */
class BuffManager {
    constructor() {
        this.buffs = [];
    }
    
    /**
     * 重置Buff
     */
    reset() {
        this.buffs = [];
    }
    
    /**
     * 添加Buff
     * @param {Object} buff - Buff配置
     */
    addBuff(buff) {
        buff.startTime = Date.now();
        buff.elapsed = 0;
        buff.lastTick = 0;
        this.buffs.push(buff);
    }
    
    /**
     * 更新Buff
     * @param {number} deltaTime - 时间增量
     * @param {Object} gameLogic - 游戏逻辑引用
     */
    update(deltaTime, gameLogic) {
        for (let i = this.buffs.length - 1; i >= 0; i--) {
            const buff = this.buffs[i];
            buff.elapsed += deltaTime;
            
            if (buff.type === 'regen' && buff.interval) {
                buff.lastTick += deltaTime;
                if (buff.lastTick >= buff.interval) {
                    buff.lastTick -= buff.interval;
                    gameLogic.state.healPlayer(buff.value);
                }
            }
            
            if (buff.duration > 0 && buff.elapsed >= buff.duration) {
                this.buffs.splice(i, 1);
            }
        }
    }
    
    /**
     * 获取指定类型Buff的总值
     * @param {string} type - Buff类型
     * @returns {number}
     */
    getBuffValue(type) {
        let value = 0;
        for (const buff of this.buffs) {
            if (buff.type === type) {
                value += buff.value;
            }
        }
        return value;
    }
    
    /**
     * 检查是否有指定类型的Buff
     * @param {string} type - Buff类型
     * @returns {boolean}
     */
    hasBuff(type) {
        return this.buffs.some(buff => buff.type === type);
    }
    
    /**
     * 获取所有激活的Buff
     * @returns {Object[]}
     */
    getActiveBuffs() {
        return this.buffs.filter(buff => buff.duration > 0 ? buff.elapsed < buff.duration : true);
    }
}
