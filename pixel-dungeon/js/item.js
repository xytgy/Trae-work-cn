/**
 * 道具基类
 * 所有道具的父类，定义道具的基本属性和方法
 */

class Item {
    /**
     * 构造函数
     * @param {string} id - 道具唯一标识
     * @param {string} name - 道具名称
     * @param {string} icon - 道具图标（emoji）
     * @param {string} type - 道具类型
     * @param {string} rarity - 稀有度
     * @param {string} description - 道具描述
     */
    constructor(id, name, icon, type, rarity, description) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.type = type;
        this.rarity = rarity;
        this.description = description;
        
        this.stackable = false;
        this.maxStack = 1;
        this.value = 0;
        this.count = 1;
        
        this.x = 0;
        this.y = 0;
        this.isDropped = false;
        this.bounceOffset = 0;
        this.bouncePhase = Math.random() * Math.PI * 2;
        this.pickupAnimProgress = 0;
        this.isPickingUp = false;
    }
    
    /**
     * 使用道具
     * @param {Object} gameLogic - 游戏逻辑引用
     * @returns {boolean} 是否使用成功
     */
    use(gameLogic) {
        return false;
    }
    
    /**
     * 掉落在地上
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    drop(x, y) {
        this.x = x;
        this.y = y;
        this.isDropped = true;
        this.isPickingUp = false;
        this.bouncePhase = Math.random() * Math.PI * 2;
    }
    
    /**
     * 拾取道具
     * @returns {boolean} 是否拾取成功
     */
    pickUp() {
        if (!this.isDropped || this.isPickingUp) {
            return false;
        }
        this.isPickingUp = true;
        this.pickupAnimProgress = 0;
        return true;
    }
    
    /**
     * 更新掉落物动画
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        if (!this.isDropped) return;
        
        if (this.isPickingUp) {
            this.pickupAnimProgress += deltaTime * DROP_ITEM.PICKUP_SPEED;
            if (this.pickupAnimProgress >= 1) {
                this.isDropped = false;
                this.isPickingUp = false;
            }
        } else {
            this.bouncePhase += deltaTime * DROP_ITEM.BOUNCE_SPEED;
            this.bounceOffset = Math.sin(this.bouncePhase) * DROP_ITEM.BOUNCE_HEIGHT;
        }
    }
    
    /**
     * 渲染掉落物
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    render(ctx) {
        if (!this.isDropped) return;
        
        let renderY = this.y + this.bounceOffset;
        let scale = 1;
        let alpha = 1;
        
        if (this.isPickingUp) {
            const progress = this.pickupAnimProgress;
            scale = 1 + progress * 0.5;
            alpha = 1 - progress;
            renderY = this.y - progress * 30;
        }
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, renderY);
        ctx.scale(scale, scale);
        
        const rarityColor = RARITY_COLORS[this.rarity] || '#ffffff';
        ctx.shadowColor = rarityColor;
        ctx.shadowBlur = 10;
        
        ctx.font = '20px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);
        
        if (this.stackable && this.count > 1) {
            ctx.shadowBlur = 0;
            ctx.font = 'bold 10px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeText(`x${this.count}`, 8, 8);
            ctx.fillText(`x${this.count}`, 8, 8);
        }
        
        ctx.restore();
    }
    
    /**
     * 检查是否可以被拾取
     * @param {number} playerX - 玩家X坐标
     * @param {number} playerY - 玩家Y坐标
     * @returns {boolean}
     */
    canPickUp(playerX, playerY) {
        if (!this.isDropped || this.isPickingUp) return false;
        const dx = this.x - playerX;
        const dy = this.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < INVENTORY_CONFIG.PICKUP_RANGE;
    }
    
    /**
     * 克隆道具
     * @returns {Item}
     */
    clone() {
        const item = new Item(this.id, this.name, this.icon, this.type, this.rarity, this.description);
        item.stackable = this.stackable;
        item.maxStack = this.maxStack;
        item.value = this.value;
        item.count = this.count;
        return item;
    }
}

/**
 * 掉落物管理器
 * 管理场景中所有掉落的道具
 */
class DropManager {
    constructor() {
        this.drops = [];
    }
    
    /**
     * 重置掉落物
     */
    reset() {
        this.drops = [];
    }
    
    /**
     * 添加掉落物
     * @param {Item} item - 道具
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    addDrop(item, x, y) {
        item.drop(x, y);
        this.drops.push(item);
    }
    
    /**
     * 更新所有掉落物
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        for (let i = this.drops.length - 1; i >= 0; i--) {
            const drop = this.drops[i];
            drop.update(deltaTime);
            
            if (!drop.isDropped && !drop.isPickingUp) {
                this.drops.splice(i, 1);
            }
        }
    }
    
    /**
     * 渲染所有掉落物
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    render(ctx) {
        this.drops.forEach(drop => {
            drop.render(ctx);
        });
    }
    
    /**
     * 检查并拾取范围内的道具
     * @param {number} playerX - 玩家X坐标
     * @param {number} playerY - 玩家Y坐标
     * @param {Object} inventory - 背包引用
     * @returns {Item[]} 拾取的道具数组
     */
    pickUpInRange(playerX, playerY, inventory) {
        const pickedUp = [];
        
        for (let i = this.drops.length - 1; i >= 0; i--) {
            const drop = this.drops[i];
            if (drop.canPickUp(playerX, playerY)) {
                if (inventory.addItem(drop)) {
                    drop.pickUp();
                    pickedUp.push(drop);
                }
            }
        }
        
        return pickedUp;
    }
}
