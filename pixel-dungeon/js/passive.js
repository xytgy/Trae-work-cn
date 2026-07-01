/**
 * 被动技能基类
 */
class PassiveSkill {
    constructor(name, description) {
        this.name = name;              // 技能名称
        this.description = description; // 技能描述
        this.owner = null;             // 技能所有者
        this.bonusMultiplier = 1;     // 通用增益倍率
    }
    
    /**
     * 初始化技能
     */
    init(owner) {
        this.owner = owner;
    }
    
    /**
     * 更新技能（每帧调用）
     */
    update(deltaTime) {
        // 大部分被动技能不需要每帧更新
    }
    
    /**
     * 获取伤害加成（用于计算最终伤害）
     */
    getDamageBonus() {
        return this.bonusMultiplier;
    }
    
    /**
     * 获取速度加成
     */
    getSpeedBonus() {
        return 1;
    }
    
    /**
     * 获取防御加成
     */
    getDefenseBonus() {
        return 1;
    }
    
    /**
     * 受伤时调用（返回实际受到的伤害）
     */
    onTakeDamage(damage) {
        return damage;
    }
    
    /**
     * 攻击时调用（返回实际伤害）
     */
    onDealDamage(damage, target) {
        return damage;
    }
    
    /**
     * 击杀敌人时调用
     */
    onKillEnemy(enemy) {
        // 大部分被动技能不需要实现
    }
    
    /**
     * 移动时调用
     */
    onMove(deltaTime) {
        // 大部分被动技能不需要实现
    }
}
