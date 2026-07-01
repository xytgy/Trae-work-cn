/**
 * 角色基类
 * 定义所有角色的通用属性和方法
 */
class Character {
    constructor() {
        // 角色基本信息
        this.id = 0;                    // 角色ID
        this.name = '';                 // 角色名称
        this.title = '';               // 角色称号
        this.description = '';          // 角色描述
        this.icon = '';                // 角色图标
        
        // 角色属性
        this.maxHealth = 3;            // 最大生命值
        this.speed = 4;               // 移动速度
        this.damage = 1;              // 基础伤害
        
        // 技能
        this.activeSkill = null;        // 主动技能实例
        this.passiveSkill = null;       // 被动技能实例
        
        // 怒气系统
        this.rage = 0;                 // 当前怒气
        this.maxRage = 100;            // 最大怒气
        this.ragePerKill = 10;         // 击杀获得怒气
        this.ragePerHurt = 5;          // 受伤获得怒气
        
        // 角色颜色
        this.color = '#ffffff';         // 主色调
        this.accentColor = '#ffffff';   // 强调色
        
        // 解锁状态
        this.unlocked = true;           // 是否已解锁
        this.unlockCost = 0;           // 解锁花费
        
        // 角色系别
        this.category = '';            // 角色系别（战士、刺客、法师等）
    }
    
    /**
     * 获取角色信息
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            title: this.title,
            description: this.description,
            icon: this.icon,
            color: this.color,
            accentColor: this.accentColor,
            category: this.category,
            unlocked: this.unlocked,
            activeSkill: this.activeSkill ? this.activeSkill.name : null,
            passiveSkill: this.passiveSkill ? this.passiveSkill.name : null
        };
    }
    
    /**
     * 初始化角色
     * @param {Object} game - 游戏逻辑引用
     */
    init(game) {
        this.game = game;
        
        // 初始化主动技能
        if (this.activeSkill) {
            this.activeSkill.init(this);
        }
        
        // 初始化被动技能
        if (this.passiveSkill) {
            this.passiveSkill.init(this);
        }
    }
    
    /**
     * 更新角色
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    update(deltaTime) {
        // 更新主动技能
        if (this.activeSkill) {
            this.activeSkill.update(deltaTime);
        }
        
        // 更新被动技能
        if (this.passiveSkill) {
            this.passiveSkill.update(deltaTime);
        }
    }
    
    /**
     * 添加怒气
     * @param {number} amount - 怒气值
     */
    addRage(amount) {
        this.rage = Math.min(this.rage + amount, this.maxRage);
    }
    
    /**
     * 消耗怒气
     * @param {number} amount - 怒气值
     * @returns {boolean} 是否成功消耗
     */
    consumeRage(amount) {
        if (this.rage >= amount) {
            this.rage -= amount;
            return true;
        }
        return false;
    }
    
    /**
     * 获取怒气百分比
     * @returns {number} 怒气百分比（0-1）
     */
    getRagePercentage() {
        return this.rage / this.maxRage;
    }
    
    /**
     * 检查是否满怒气
     * @returns {boolean} 是否满怒气
     */
    isRageFull() {
        return this.rage >= this.maxRage;
    }
    
    /**
     * 触发被动技能-受伤回调
     * @param {number} damage - 受到的伤害
     * @returns {number} 实际受到的伤害
     */
    onTakeDamage(damage) {
        if (this.passiveSkill && this.passiveSkill.onTakeDamage) {
            return this.passiveSkill.onTakeDamage(damage);
        }
        return damage;
    }
    
    /**
     * 触发被动技能-攻击回调
     * @param {number} damage - 造成的伤害
     * @param {Object} target - 攻击目标
     * @returns {number} 实际造成的伤害
     */
    onDealDamage(damage, target) {
        if (this.passiveSkill && this.passiveSkill.onDealDamage) {
            return this.passiveSkill.onDealDamage(damage, target);
        }
        return damage;
    }
    
    /**
     * 触发被动技能-击杀回调
     * @param {Object} enemy - 被击杀的敌人
     */
    onKillEnemy(enemy) {
        if (this.passiveSkill && this.passiveSkill.onKillEnemy) {
            this.passiveSkill.onKillEnemy(enemy);
        }
    }
    
    /**
     * 触发被动技能-移动回调
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    onMove(deltaTime) {
        if (this.passiveSkill && this.passiveSkill.onMove) {
            this.passiveSkill.onMove(deltaTime);
        }
    }
    
    /**
     * 获取速度加成
     * @returns {number} 速度倍率
     */
    getSpeedBonus() {
        if (this.passiveSkill && this.passiveSkill.getSpeedBonus) {
            return this.passiveSkill.getSpeedBonus();
        }
        return 1;
    }
    
    /**
     * 获取伤害加成
     * @returns {number} 伤害倍率
     */
    getDamageBonus() {
        if (this.passiveSkill && this.passiveSkill.getDamageBonus) {
            return this.passiveSkill.getDamageBonus();
        }
        return 1;
    }
    
    /**
     * 获取防御加成
     * @returns {number} 防御倍率
     */
    getDefenseBonus() {
        if (this.passiveSkill && this.passiveSkill.getDefenseBonus) {
            return this.passiveSkill.getDefenseBonus();
        }
        return 1;
    }
    
    /**
     * 使用主动技能
     */
    useActiveSkill() {
        if (this.activeSkill && this.activeSkill.canUse()) {
            return this.activeSkill.use();
        }
        return false;
    }
    
    /**
     * 重置角色状态
     */
    reset() {
        this.rage = 0;
        if (this.activeSkill) {
            this.activeSkill.reset();
        }
        if (this.passiveSkill) {
            this.passiveSkill.reset();
        }
    }
}
