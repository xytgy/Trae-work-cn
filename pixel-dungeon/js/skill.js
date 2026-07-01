/**
 * 主动技能基类
 * 所有主动技能的父类，定义通用属性和方法
 */

class ActiveSkill {
    /**
     * 构造函数
     * @param {string} name - 技能名称
     * @param {string} key - 按键 (空格/E/R/F/G/X)
     * @param {number} cooldown - 冷却时间（毫秒）
     * @param {string} description - 技能描述
     */
    constructor(name, key, cooldown, description) {
        // 技能名称
        this.name = name;
        
        // 按键
        this.key = key;
        
        // 冷却时间（毫秒）
        this.cooldown = cooldown;
        
        // 当前冷却时间
        this.currentCooldown = 0;
        
        // 技能描述
        this.description = description;
        
        // 技能所有者
        this.owner = null;
        
        // 技能是否激活
        this.active = false;
        
        // 前摇时间（毫秒）
        this.castTime = SKILL_CAST.DEFAULT_CAST_TIME;
        
        // 是否正在前摇
        this.isCasting = false;
        
        // 前摇进度（0-1）
        this.castProgress = 0;
        
        // 前摇是否可被打断
        this.canInterrupt = SKILL_CAST.DEFAULT_CAN_INTERRUPT;
        
        // 蓄力光环颜色
        this.castColor = '#00ffff';
        
        // 前摇特效计时器
        this.castEffectTimer = 0;
        this.castEffectInterval = 50; // 每50毫秒生成一次特效
    }
    
    /**
     * 初始化技能
     * @param {Object} owner - 技能所有者（玩家）
     */
    init(owner) {
        this.owner = owner;
    }
    
    /**
     * 更新技能
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    update(deltaTime) {
        // 更新冷却时间
        if (this.currentCooldown > 0) {
            this.currentCooldown -= deltaTime;
            if (this.currentCooldown < 0) {
                this.currentCooldown = 0;
            }
        }
        
        // 更新前摇
        if (this.isCasting) {
            this.castProgress += deltaTime;
            this.castEffectTimer += deltaTime;
            
            // 生成前摇特效
            if (this.castEffectTimer >= this.castEffectInterval) {
                this.castEffectTimer = 0;
                this.spawnCastEffect();
            }
            
            // 前摇完成，执行技能
            if (this.castProgress >= this.castTime) {
                this.isCasting = false;
                this.execute();
                this.currentCooldown = this.cooldown;
            }
        }
    }
    
    /**
     * 使用技能
     * @returns {boolean} 是否成功开始使用技能
     */
    use() {
        // 检查冷却中
        if (this.currentCooldown > 0) {
            return false;
        }
        
        // 检查是否正在前摇
        if (this.isCasting) {
            return false;
        }
        
        // 如果前摇时间为0，直接执行
        if (this.castTime <= 0) {
            this.execute();
            this.currentCooldown = this.cooldown;
            return true;
        }
        
        // 开始前摇
        this.isCasting = true;
        this.castProgress = 0;
        this.castEffectTimer = 0;
        
        return true;
    }
    
    /**
     * 打断前摇
     * @returns {boolean} 是否成功打断
     */
    interrupt() {
        if (!this.canInterrupt || !this.isCasting) {
            return false;
        }
        
        this.isCasting = false;
        this.castProgress = 0;
        return true;
    }
    
    /**
     * 生成前摇特效
     */
    spawnCastEffect() {
        if (!this.owner || typeof particleSystem === 'undefined') return;
        
        const progress = this.castProgress / this.castTime;
        
        // 生成蓄力光环
        if (particleSystem.createCastRing) {
            particleSystem.createCastRing(
                this.owner.x,
                this.owner.y,
                this.castColor,
                progress
            );
        }
    }
    
    /**
     * 执行技能效果（子类实现）
     */
    execute() {
        // 子类实现
    }
    
    /**
     * 获取冷却百分比
     * @returns {number} 冷却百分比（0-1）
     */
    getCooldownPercentage() {
        if (this.cooldown === 0) return 0;
        return this.currentCooldown / this.cooldown;
    }
    
    /**
     * 是否冷却中
     * @returns {boolean} 是否在冷却中
     */
    isOnCooldown() {
        return this.currentCooldown > 0;
    }
    
    /**
     * 获取冷却剩余时间（秒）
     * @returns {number} 剩余冷却时间（秒）
     */
    getCooldownRemaining() {
        return Math.ceil(this.currentCooldown / 1000);
    }
    
    /**
     * 检查是否处于无敌状态（子类可重写）
     * @returns {boolean} 是否无敌
     */
    isInvincible() {
        return false;
    }
    
    /**
     * 渲染技能效果（子类可重写）
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    render(ctx) {
        // 子类实现
    }
}
