/**
 * 武器基类
 * 所有武器的父类，定义通用属性和方法
 */

class Weapon {
    /**
     * 构造函数
     * @param {string} name - 武器名称
     * @param {number} damage - 伤害值
     * @param {number} fireRate - 射速（毫秒）
     * @param {number} ammo - 当前弹药
     * @param {number} maxAmmo - 最大弹药
     * @param {string} icon - 武器图标
     * @param {string} color - 武器颜色
     */
    constructor(name, damage, fireRate, ammo, maxAmmo, icon, color) {
        // 武器名称
        this.name = name;
        
        // 伤害值
        this.damage = damage;
        
        // 射击间隔（毫秒）
        this.fireRate = fireRate;
        
        // 当前弹药
        this.ammo = ammo;
        
        // 最大弹药
        this.maxAmmo = maxAmmo;
        
        // 武器图标
        this.icon = icon;
        
        // 武器颜色
        this.color = color;
        
        // 是否无限弹药
        this.infiniteAmmo = (ammo === Infinity);
        
        // 武器ID（由子类设置）
        this.id = 0;
        
        // 特殊属性（由子类设置）
        this.penetrate = 0;       // 穿透敌人数量
        this.explosionRadius = 0; // 爆炸范围
        this.range = 0;           // 射程
        this.isBoomerang = false; // 是否是回旋镖
        this.multiHit = false;    // 是否可攻击多个敌人
        
        // 武器所有者（玩家）
        this.owner = null;
        
        // 后坐力参数
        this.recoil = 5;              // 后坐力距离（像素）
        this.recoilRecovery = 0.3;    // 恢复速度（每帧衰减比例）
        
        // 枪口闪光配置
        this.muzzleFlashSize = 12;    // 闪光大小
        this.muzzleFlashDuration = 50; // 闪光持续时间（毫秒）
    }
    
    /**
     * 更新武器状态
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    update(deltaTime) {
        // 基类实现为空，子类可重写
    }
    
    /**
     * 设置武器所有者
     * @param {Object} owner - 武器所有者（玩家）
     */
    setOwner(owner) {
        this.owner = owner;
    }
    
    /**
     * 射击方法
     * @param {number} playerX - 玩家X坐标
     * @param {number} playerY - 玩家Y坐标
     * @param {number} targetX - 目标X坐标
     * @param {number} targetY - 目标Y坐标
     * @returns {Bullet|null} 子弹对象，如果不能射击则返回null
     */
    fire(playerX, playerY, targetX, targetY) {
        // 检查弹药
        if (!this.infiniteAmmo && this.ammo <= 0) {
            return null;
        }
        
        // 计算方向向量
        const dx = targetX - playerX;
        const dy = targetY - playerY;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) {
            return null;
        }
        
        const dirX = dx / length;
        const dirY = dy / length;
        
        // 消耗弹药
        if (!this.infiniteAmmo) {
            this.ammo--;
        }
        
        // 应用后坐力
        this.applyRecoil(dirX, dirY);
        
        // 创建枪口闪光
        this.createMuzzleFlash(playerX, playerY, dirX, dirY);
        
        // 创建子弹
        return this.createBullet(playerX, playerY, dirX, dirY);
    }
    
    /**
     * 应用后坐力
     * @param {number} dirX - 射击方向X
     * @param {number} dirY - 射击方向Y
     */
    applyRecoil(dirX, dirY) {
        if (!this.owner || !this.owner.applyRecoil) return;
        
        // 调用玩家的后坐力方法
        this.owner.applyRecoil(dirX, dirY, this.recoil, this.recoilRecovery);
    }
    
    /**
     * 创建枪口闪光效果
     * @param {number} playerX - 玩家X坐标
     * @param {number} playerY - 玩家Y坐标
     * @param {number} dirX - 射击方向X
     * @param {number} dirY - 射击方向Y
     */
    createMuzzleFlash(playerX, playerY, dirX, dirY) {
        // 计算枪口位置（玩家前方）
        const angle = Math.atan2(dirY, dirX);
        const muzzleX = playerX + Math.cos(angle) * 15;
        const muzzleY = playerY + Math.sin(angle) * 15;
        
        // 使用粒子系统创建枪口闪光
        if (typeof particleSystem !== 'undefined' && particleSystem.createMuzzleFlash) {
            particleSystem.createMuzzleFlash(muzzleX, muzzleY, angle, this.color, this.muzzleFlashSize);
        }
    }
    
    /**
     * 创建子弹（子类可重写自定义子弹）
     * @param {number} playerX - 玩家X坐标
     * @param {number} playerY - 玩家Y坐标
     * @param {number} dirX - X方向
     * @param {number} dirY - Y方向
     * @returns {Bullet} 子弹对象
     */
    createBullet(playerX, playerY, dirX, dirY) {
        return new Bullet(playerX, playerY, dirX, dirY, {
            damage: this.damage,
            speed: this.getBulletSpeed(),
            color: this.color,
            penetrate: this.penetrate,
            explosionRadius: this.explosionRadius,
            range: this.range,
            isBoomerang: this.isBoomerang
        });
    }
    
    /**
     * 获取子弹速度（子类可重写）
     */
    getBulletSpeed() {
        return 10;
    }
    
    /**
     * 检查是否可以射击
     */
    canFire() {
        return this.infiniteAmmo || this.ammo > 0;
    }
    
    /**
     * 重新装填弹药
     * @param {number} amount - 装填数量
     */
    reload(amount) {
        if (!this.infiniteAmmo) {
            this.ammo = Math.min(this.ammo + amount, this.maxAmmo);
        }
    }
    
    /**
     * 获取武器信息
     */
    getInfo() {
        return {
            name: this.name,
            damage: this.damage,
            ammo: this.infiniteAmmo ? '∞' : this.ammo,
            maxAmmo: this.infiniteAmmo ? '∞' : this.maxAmmo,
            icon: this.icon,
            color: this.color
        };
    }
    
    /**
     * 绘制武器图标
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} size - 绘制大小
     */
    draw(ctx, x, y, size = PIXEL_SIZE.WEAPON_ICON) {
        // 默认实现：绘制一个简单的矩形表示武器
        ctx.fillStyle = this.color;
        ctx.fillRect(x, y, size, size);
        
        // 绘制武器图标文字
        ctx.font = `${size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, x + size / 2, y + size / 2);
    }
}