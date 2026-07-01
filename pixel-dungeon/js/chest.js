/**
 * 宝箱系统
 * 实现5种不同类型的宝箱：普通、金、宝石、传说、mimic
 */

/**
 * 宝箱基类
 * 所有宝箱的父类
 */
class Chest {
    /**
     * 构造函数
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} type - 宝箱类型
     */
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.opened = false;
        this.animating = false;
        this.lidAngle = 0;
        this.openProgress = 0;
        this.glowPulse = 0;
        this.config = this.getConfig();
        this.size = this.config.SIZE;
        this.interactDistance = 40;
        this.items = [];
        this.itemFlyItems = [];
    }
    
    /**
     * 获取宝箱配置
     * @returns {Object} 宝箱配置
     */
    getConfig() {
        switch (this.type) {
            case CHEST_TYPES.NORMAL: return CHESTS.NORMAL;
            case CHEST_TYPES.GOLDEN: return CHESTS.GOLDEN;
            case CHEST_TYPES.GEM: return CHESTS.GEM;
            case CHEST_TYPES.LEGENDARY: return CHESTS.LEGENDARY;
            case CHEST_TYPES.MIMIC: return CHESTS.MIMIC;
            default: return CHESTS.NORMAL;
        }
    }
    
    /**
     * 更新宝箱
     * @param {number} deltaTime - 时间增量
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    update(deltaTime, gameLogic) {
        this.glowPulse += deltaTime / 300;
        
        if (this.animating) {
            this.openProgress += deltaTime / 500;
            if (this.openProgress >= 1) {
                this.openProgress = 1;
                this.animating = false;
                this.opened = true;
                this.onFullyOpened(gameLogic);
            }
            this.lidAngle = this.openProgress * Math.PI * 0.6;
        }
    }
    
    /**
     * 检查是否可以交互
     * @param {Player} player - 玩家引用
     * @returns {boolean} 是否可以交互
     */
    canInteract(player) {
        if (this.opened || this.animating) return false;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.interactDistance;
    }
    
    /**
     * 打开宝箱
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    open(gameLogic) {
        if (this.opened || this.animating) return;
        this.animating = true;
        this.openProgress = 0;
        this.generateLoot();
    }
    
    /**
     * 生成战利品
     */
    generateLoot() {
        const config = this.config;
        this.items = [];
        
        if (config.GOLD_MIN !== undefined) {
            const goldAmount = Math.floor(config.GOLD_MIN + Math.random() * (config.GOLD_MAX - config.GOLD_MIN));
            this.items.push({ type: 'gold', amount: goldAmount });
        }
        
        const itemCount = config.ITEM_COUNT || 1;
        for (let i = 0; i < itemCount; i++) {
            this.items.push({ type: 'item', quality: this.type });
        }
    }
    
    /**
     * 宝箱完全打开时调用
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    onFullyOpened(gameLogic) {
        this.spawnItemEffects(gameLogic);
        this.giveRewards(gameLogic);
    }
    
    /**
     * 生成物品飞出效果
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    spawnItemEffects(gameLogic) {
        for (let i = 0; i < this.items.length; i++) {
            const delay = i * 150;
            setTimeout(() => {
                if (!gameLogic || !gameLogic.particles) return;
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
                const speed = 3 + Math.random() * 2;
                gameLogic.particles.push(new Particle(
                    this.x,
                    this.y - this.size / 2,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    this.config.METAL_COLOR,
                    4 + Math.random() * 4,
                    600 + Math.random() * 400
                ));
            }, delay);
        }
        
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            gameLogic.particles.push(new Particle(
                this.x,
                this.y - this.size / 4,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 2,
                this.config.GLOW_COLOR || '#ffd700',
                3 + Math.random() * 4,
                500 + Math.random() * 500
            ));
        }
    }
    
    /**
     * 给予玩家奖励
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    giveRewards(gameLogic) {
        for (const item of this.items) {
            if (item.type === 'gold') {
                console.log(`获得金币: ${item.amount}`);
            }
        }
    }
    
    /**
     * 渲染宝箱
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     */
    render(ctx) {
        const size = this.size;
        const halfSize = size / 2;
        const bodyHeight = size * 0.6;
        const lidHeight = size * 0.4;
        
        if (!this.opened && !this.animating) {
            const glowAlpha = 0.3 + Math.sin(this.glowPulse) * 0.2;
            const gradient = ctx.createRadialGradient(
                this.x, this.y - size / 4, 0,
                this.x, this.y - size / 4, size
            );
            gradient.addColorStop(0, this.config.GLOW_COLOR || 'rgba(255, 215, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            ctx.globalAlpha = glowAlpha;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y - size / 4, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        ctx.fillStyle = this.config.COLOR;
        ctx.fillRect(this.x - halfSize, this.y - bodyHeight / 2, size, bodyHeight);
        
        ctx.fillStyle = this.config.METAL_COLOR;
        ctx.fillRect(this.x - halfSize, this.y - 4, size, 4);
        ctx.fillRect(this.x - 2, this.y - bodyHeight / 2, 4, bodyHeight);
        
        ctx.save();
        ctx.translate(this.x, this.y - bodyHeight / 2);
        ctx.rotate(-this.lidAngle);
        
        ctx.fillStyle = this.config.LID_COLOR || this.config.COLOR;
        ctx.fillRect(-halfSize, -lidHeight, size, lidHeight);
        
        ctx.fillStyle = this.config.METAL_COLOR;
        ctx.fillRect(-halfSize, -lidHeight, size, 4);
        ctx.fillRect(-2, -lidHeight, 4, lidHeight);
        
        if (!this.opened && !this.animating) {
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(-4, -4, 8, 8);
        }
        
        ctx.restore();
        
        if (this.type === CHEST_TYPES.MIMIC && !this.opened && !this.animating) {
            const eyeShift = Math.sin(this.glowPulse * 2) * 1;
            ctx.fillStyle = this.config.EYE_COLOR;
            ctx.beginPath();
            ctx.arc(this.x - 6 + eyeShift, this.y - 5, 2, 0, Math.PI * 2);
            ctx.arc(this.x + 6 + eyeShift, this.y - 5, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

/**
 * Mimic宝箱
 * 会攻击玩家的陷阱宝箱
 */
class MimicChest extends Chest {
    constructor(x, y) {
        super(x, y, CHEST_TYPES.MIMIC);
        this.awakened = false;
        this.health = CHESTS.MIMIC.HEALTH;
        this.maxHealth = CHESTS.MIMIC.HEALTH;
        this.damage = CHESTS.MIMIC.DAMAGE;
        this.speed = CHESTS.MIMIC.SPEED;
        this.alive = true;
        this.attackCooldown = 0;
        this.attackRange = 40;
        this.hurtTimer = 0;
        this.isHurt = false;
    }
    
    update(deltaTime, player, gameLogic) {
        if (!this.alive) return;
        
        this.glowPulse += deltaTime / 300;
        
        if (this.awakened) {
            if (this.attackCooldown > 0) {
                this.attackCooldown -= deltaTime;
            }
            
            if (this.isHurt) {
                this.hurtTimer -= deltaTime;
                if (this.hurtTimer <= 0) {
                    this.isHurt = false;
                }
            }
            
            this.moveTowardsPlayer(player, deltaTime);
            this.tryAttack(player, gameLogic);
        } else {
            super.update(deltaTime, gameLogic);
            
            if (!this.opened && !this.animating) {
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 50) {
                    this.awaken();
                }
            }
        }
    }
    
    awaken() {
        this.awakened = true;
        this.opened = true;
        this.animating = false;
        this.lidAngle = Math.PI * 0.8;
    }
    
    open(gameLogic) {
        if (!this.awakened) {
            this.awaken();
        }
    }
    
    moveTowardsPlayer(player, deltaTime) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
    }
    
    tryAttack(player, gameLogic) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.attackRange && this.attackCooldown <= 0) {
            this.attackCooldown = 1000;
            if (gameState && !gameState.getData().isInvincible) {
                gameState.playerHurt(this.damage);
                gameLogic.rageSystem.onHurt();
                camera.shake(3, 200);
            }
        }
    }
    
    takeDamage(damage, knockbackDirection, knockbackForce) {
        this.health -= damage;
        this.isHurt = true;
        this.hurtTimer = 150;
        
        if (this.health <= 0) {
            this.alive = false;
        }
    }
    
    getBounds() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }
    
    render(ctx) {
        if (!this.alive) return;
        
        const size = this.size;
        const halfSize = size / 2;
        const bodyHeight = size * 0.6;
        
        let bodyColor = this.config.COLOR;
        if (this.isHurt) {
            bodyColor = '#ff0000';
        }
        
        ctx.fillStyle = bodyColor;
        ctx.fillRect(this.x - halfSize, this.y - bodyHeight / 2, size, bodyHeight);
        
        ctx.fillStyle = this.config.METAL_COLOR || '#daa520';
        ctx.fillRect(this.x - halfSize, this.y - 4, size, 4);
        
        ctx.save();
        ctx.translate(this.x, this.y - bodyHeight / 2);
        
        const lidAngle = this.awakened ? Math.PI * 0.8 : 0;
        ctx.rotate(-lidAngle);
        
        ctx.fillStyle = this.config.LID_COLOR || this.config.COLOR;
        ctx.fillRect(-halfSize, -size * 0.4, size, size * 0.4);
        
        ctx.fillStyle = this.config.METAL_COLOR || '#daa520';
        ctx.fillRect(-halfSize, -size * 0.4, size, 4);
        
        ctx.restore();
        
        if (this.awakened) {
            ctx.fillStyle = this.config.EYE_COLOR;
            ctx.beginPath();
            ctx.arc(this.x - 7, this.y - 8, 3, 0, Math.PI * 2);
            ctx.arc(this.x + 7, this.y - 8, 3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(this.x - 7, this.y - 8, 1.5, 0, Math.PI * 2);
            ctx.arc(this.x + 7, this.y - 8, 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x - 8, this.y + 2, 16, 4);
            
            this.renderHealthBar(ctx);
        }
    }
    
    renderHealthBar(ctx) {
        if (this.health >= this.maxHealth) return;
        
        const barWidth = 36;
        const barHeight = 4;
        const x = this.x - barWidth / 2;
        const y = this.y - this.size / 2 - 15;
        
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        const healthPercent = Math.max(0, this.health / this.maxHealth);
        
        let barColor = '#00ff00';
        if (healthPercent < 0.3) {
            barColor = '#ff0000';
        } else if (healthPercent < 0.6) {
            barColor = '#ffff00';
        }
        
        ctx.fillStyle = barColor;
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, barWidth - 1, barHeight - 1);
    }
}

/**
 * 宝箱管理器
 * 管理房间中的所有宝箱
 */
class ChestManager {
    constructor() {
        this.chests = [];
    }
    
    /**
     * 生成宝箱
     * @param {number} count - 宝箱数量
     * @param {Object} playableArea - 可活动区域
     * @param {boolean} includeMimic - 是否包含mimic
     */
    generateChests(count, playableArea, includeMimic = false) {
        this.chests = [];
        
        const chestTypes = [
            CHEST_TYPES.NORMAL,
            CHEST_TYPES.NORMAL,
            CHEST_TYPES.NORMAL,
            CHEST_TYPES.GOLDEN,
            CHEST_TYPES.GEM
        ];
        
        const margin = 80;
        
        for (let i = 0; i < count; i++) {
            let type;
            
            if (includeMimic && Math.random() < CHEST_ROOM_CONFIG.MIMIC_CHANCE) {
                type = CHEST_TYPES.MIMIC;
            } else {
                type = chestTypes[Math.floor(Math.random() * chestTypes.length)];
            }
            
            const x = playableArea.x + margin + Math.random() * (playableArea.width - margin * 2);
            const y = playableArea.y + margin + Math.random() * (playableArea.height - margin * 2);
            
            let chest;
            if (type === CHEST_TYPES.MIMIC) {
                chest = new MimicChest(x, y);
            } else {
                chest = new Chest(x, y, type);
            }
            
            this.chests.push(chest);
        }
    }
    
    /**
     * 添加特定类型的宝箱
     * @param {string} type - 宝箱类型
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    addChest(type, x, y) {
        let chest;
        if (type === CHEST_TYPES.MIMIC) {
            chest = new MimicChest(x, y);
        } else {
            chest = new Chest(x, y, type);
        }
        this.chests.push(chest);
    }
    
    /**
     * 更新所有宝箱
     * @param {number} deltaTime - 时间增量
     * @param {Player} player - 玩家引用
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    update(deltaTime, player, gameLogic) {
        for (const chest of this.chests) {
            if (chest instanceof MimicChest) {
                chest.update(deltaTime, player, gameLogic);
            } else {
                chest.update(deltaTime, gameLogic);
            }
        }
    }
    
    /**
     * 检查交互
     * @param {Player} player - 玩家引用
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    checkInteraction(player, gameLogic) {
        for (const chest of this.chests) {
            if (chest.canInteract && chest.canInteract(player)) {
                chest.open(gameLogic);
                return true;
            }
        }
        return false;
    }
    
    /**
     * 获取可交互的宝箱
     * @param {Player} player - 玩家引用
     * @returns {Chest|null} 可交互的宝箱
     */
    getInteractableChest(player) {
        for (const chest of this.chests) {
            if (chest.canInteract && chest.canInteract(player)) {
                return chest;
            }
        }
        return null;
    }
    
    /**
     * 获取所有Mimic宝箱（作为敌人）
     * @returns {Array} Mimic宝箱数组
     */
    getMimics() {
        return this.chests.filter(c => c instanceof MimicChest && c.alive && c.awakened);
    }
    
    /**
     * 渲染所有宝箱
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     */
    render(ctx) {
        for (const chest of this.chests) {
            chest.render(ctx);
        }
    }
    
    /**
     * 清空所有宝箱
     */
    clear() {
        this.chests = [];
    }
}

/**
 * 回血喷泉
 * 休息房的回血装置
 */
class HealingFountain {
    /**
     * 构造函数
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = REST_ROOM_CONFIG.FOUNTAIN_SIZE;
        this.used = false;
        this.healAmount = REST_ROOM_CONFIG.FOUNTAIN_HEAL_AMOUNT;
        this.animTimer = 0;
        this.interactDistance = 50;
    }
    
    /**
     * 更新喷泉
     * @param {number} deltaTime - 时间增量
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    update(deltaTime, gameLogic) {
        this.animTimer += deltaTime;
        
        if (!this.used && Math.random() < 0.2) {
            gameLogic.particles.push(new Particle(
                this.x + (Math.random() - 0.5) * 20,
                this.y - 10,
                (Math.random() - 0.5) * 0.5,
                -1 - Math.random(),
                REST_ROOM_CONFIG.FOUNTAIN_COLOR,
                3 + Math.random() * 3,
                500 + Math.random() * 300
            ));
        }
    }
    
    /**
     * 检查是否可以交互
     * @param {Player} player - 玩家引用
     * @returns {boolean} 是否可以交互
     */
    canInteract(player) {
        if (this.used) return false;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.interactDistance;
    }
    
    /**
     * 使用喷泉
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    use(gameLogic) {
        if (this.used) return false;
        this.used = true;
        
        if (gameState) {
            const currentHealth = gameState.getData().playerHealth;
            const maxHealth = PLAYER.MAX_HEALTH;
            const newHealth = Math.min(currentHealth + this.healAmount, maxHealth);
            gameState.setData('playerHealth', newHealth);
        }
        
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            gameLogic.particles.push(new Particle(
                this.x,
                this.y,
                Math.cos(angle) * (1 + Math.random() * 2),
                Math.sin(angle) * (1 + Math.random() * 2) - 1,
                '#4caf50',
                4 + Math.random() * 4,
                600 + Math.random() * 400
            ));
        }
        
        return true;
    }
    
    /**
     * 渲染喷泉
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     */
    render(ctx) {
        const size = this.size;
        const halfSize = size / 2;
        
        ctx.fillStyle = '#696969';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 10, halfSize, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#808080';
        ctx.fillRect(this.x - halfSize + 5, this.y - 15, size - 10, 25);
        
        const waterColor = this.used ? '#4682b4' : REST_ROOM_CONFIG.FOUNTAIN_COLOR;
        ctx.fillStyle = waterColor;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y - 15, halfSize - 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        if (!this.used) {
            const pulse = Math.sin(this.animTimer / 200) * 0.3 + 0.7;
            const gradient = ctx.createRadialGradient(
                this.x, this.y - 15, 0,
                this.x, this.y - 15, halfSize + 10
            );
            gradient.addColorStop(0, `rgba(0, 191, 255, ${pulse * 0.5})`);
            gradient.addColorStop(1, 'rgba(0, 191, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y - 15, halfSize + 10, 0, Math.PI * 2);
            ctx.fill();
            
            const waterHeight = 15 + Math.sin(this.animTimer / 150) * 3;
            ctx.fillStyle = '#00bfff';
            ctx.beginPath();
            ctx.moveTo(this.x - 3, this.y - 15);
            ctx.quadraticCurveTo(this.x, this.y - 15 - waterHeight, this.x + 3, this.y - 15);
            ctx.fill();
        }
    }
}
