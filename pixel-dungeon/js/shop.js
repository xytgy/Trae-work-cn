/**
 * 商店系统
 * 管理商人和商店交易
 */

class ShopItem {
    /**
     * 构造商品
     * @param {Item} item - 商品道具
     * @param {number} price - 金币价格
     * @param {number} gemPrice - 宝石价格
     * @param {boolean} isDiscount - 是否打折
     */
    constructor(item, price = 0, gemPrice = 0, isDiscount = false) {
        this.item = item;
        this.price = price;
        this.gemPrice = gemPrice;
        this.originalPrice = price;
        this.originalGemPrice = gemPrice;
        this.isDiscount = isDiscount;
        this.sold = false;
        
        if (isDiscount && price > 0) {
            this.price = Math.floor(price * SHOP_CONFIG.DISCOUNT_RATE);
        }
    }
    
    /**
     * 检查是否可以用金币购买
     * @param {number} gold
     * @returns {boolean}
     */
    canBuyWithGold(gold) {
        return !this.sold && this.price > 0 && gold >= this.price;
    }
    
    /**
     * 检查是否可以用宝石购买
     * @param {number} gems
     * @returns {boolean}
     */
    canBuyWithGems(gems) {
        return !this.sold && this.gemPrice > 0 && gems >= this.gemPrice;
    }
    
    /**
     * 购买商品
     * @param {Object} inventory - 背包引用
     * @returns {boolean} 是否购买成功
     */
    buy(inventory) {
        if (this.sold) return false;
        
        if (this.price > 0 && inventory.spendGold(this.price)) {
            this.sold = true;
            return inventory.addItem(this.item.clone());
        }
        
        if (this.gemPrice > 0 && inventory.spendGems(this.gemPrice)) {
            this.sold = true;
            return inventory.addItem(this.item.clone());
        }
        
        return false;
    }
}

class Merchant {
    /**
     * 构造商人
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 24;
        this.items = [];
        this.isOpen = false;
        
        this.bobOffset = 0;
        this.bobPhase = Math.random() * Math.PI * 2;
        
        this.generateItems();
    }
    
    /**
     * 生成商品
     */
    generateItems() {
        this.items = [];
        
        const itemCount = SHOP_CONFIG.MIN_ITEMS + 
            Math.floor(Math.random() * (SHOP_CONFIG.MAX_ITEMS - SHOP_CONFIG.MIN_ITEMS + 1));
        
        const availableItems = [
            () => {
                const potion = PotionFactory.createHealthPotion(3);
                return new ShopItem(potion, 30, 0, Math.random() < SHOP_CONFIG.DISCOUNT_CHANCE);
            },
            () => {
                const potion = PotionFactory.createFullHealthPotion(1);
                return new ShopItem(potion, 80, 0, Math.random() < SHOP_CONFIG.DISCOUNT_CHANCE);
            },
            () => {
                const potion = PotionFactory.createRagePotion(2);
                return new ShopItem(potion, 50, 0, Math.random() < SHOP_CONFIG.DISCOUNT_CHANCE);
            },
            () => {
                const potion = PotionFactory.createShieldPotion(1);
                return new ShopItem(potion, 0, 1, Math.random() < SHOP_CONFIG.DISCOUNT_CHANCE);
            },
            () => {
                const potion = PotionFactory.createSpeedPotion(2);
                return new ShopItem(potion, 60, 0, Math.random() < SHOP_CONFIG.DISCOUNT_CHANCE);
            },
            () => {
                const potion = PotionFactory.createCritPotion(2);
                return new ShopItem(potion, 70, 0, Math.random() < SHOP_CONFIG.DISCOUNT_CHANCE);
            },
            () => {
                const potion = PotionFactory.createDamagePotion(1);
                return new ShopItem(potion, 0, 1, Math.random() < SHOP_CONFIG.DISCOUNT_CHANCE);
            },
            () => {
                const potion = PotionFactory.createMysteryPotion(1);
                return new ShopItem(potion, 0, 2, Math.random() < SHOP_CONFIG.DISCOUNT_CHANCE);
            },
            () => {
                const bomb = ItemFactory.createBomb(3);
                return new ShopItem(bomb, 40, 0, Math.random() < SHOP_CONFIG.DISCOUNT_CHANCE);
            },
            () => {
                const key = ItemFactory.createKey(2);
                return new ShopItem(key, 60, 0, Math.random() < SHOP_CONFIG.DISCOUNT_CHANCE);
            },
            () => {
                const food = ItemFactory.createFood(3);
                return new ShopItem(food, 25, 0, Math.random() < SHOP_CONFIG.DISCOUNT_CHANCE);
            },
            () => {
                const scroll = ItemFactory.createScroll(1);
                return new ShopItem(scroll, 80, 0, Math.random() < SHOP_CONFIG.DISCOUNT_CHANCE);
            }
        ];
        
        const shuffled = availableItems.sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(itemCount, shuffled.length); i++) {
            this.items.push(shuffled[i]());
        }
    }
    
    /**
     * 更新商人
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        this.bobPhase += deltaTime * 0.002;
        this.bobOffset = Math.sin(this.bobPhase) * 3;
    }
    
    /**
     * 渲染商人
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    render(ctx) {
        const renderY = this.y + this.bobOffset;
        
        ctx.save();
        ctx.translate(this.x, renderY);
        
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 15;
        
        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧙', 0, 0);
        
        ctx.shadowBlur = 0;
        ctx.font = '12px "Courier New", monospace';
        ctx.fillStyle = '#ffd700';
        ctx.fillText('商人', 0, -20);
        
        ctx.restore();
    }
    
    /**
     * 检查玩家是否在交互范围内
     * @param {number} playerX
     * @param {number} playerY
     * @returns {boolean}
     */
    isInRange(playerX, playerY) {
        const dx = this.x - playerX;
        const dy = this.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < SHOP_CONFIG.INTERACT_RANGE;
    }
    
    /**
     * 打开商店
     */
    open() {
        this.isOpen = true;
    }
    
    /**
     * 关闭商店
     */
    close() {
        this.isOpen = false;
    }
}

/**
 * 商店管理器
 * 管理商店的生成和交互
 */
class ShopManager {
    constructor() {
        this.merchant = null;
    }
    
    /**
     * 重置
     */
    reset() {
        this.merchant = null;
    }
    
    /**
     * 生成商人
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {boolean} 是否生成
     */
    spawnMerchant(x, y) {
        this.merchant = new Merchant(x, y);
        return true;
    }
    
    /**
     * 更新
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        if (this.merchant) {
            this.merchant.update(deltaTime);
        }
    }
    
    /**
     * 渲染
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    render(ctx) {
        if (this.merchant) {
            this.merchant.render(ctx);
        }
    }
    
    /**
     * 检查是否可以与商人交互
     * @param {number} playerX
     * @param {number} playerY
     * @returns {boolean}
     */
    canInteract(playerX, playerY) {
        return this.merchant && this.merchant.isInRange(playerX, playerY);
    }
    
    /**
     * 与商人交互
     */
    interact() {
        if (this.merchant) {
            this.merchant.open();
        }
    }
    
    /**
     * 关闭商店
     */
    closeShop() {
        if (this.merchant) {
            this.merchant.close();
        }
    }
    
    /**
     * 检查商店是否打开
     * @returns {boolean}
     */
    isShopOpen() {
        return this.merchant && this.merchant.isOpen;
    }
    
    /**
     * 获取商品列表
     * @returns {ShopItem[]}
     */
    getShopItems() {
        return this.merchant ? this.merchant.items : [];
    }
    
    /**
     * 购买商品
     * @param {number} index - 商品索引
     * @param {Object} inventory - 背包
     * @returns {boolean}
     */
    buyItem(index, inventory) {
        if (!this.merchant || index < 0 || index >= this.merchant.items.length) {
            return false;
        }
        
        return this.merchant.items[index].buy(inventory);
    }
}
