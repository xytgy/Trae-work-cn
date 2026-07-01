/**
 * 散弹枪武器类
 * 一次发射3发子弹，呈扇形散开
 */

class WeaponShotgun extends Weapon {
    constructor() {
        super(
            '散弹枪',           // 名称
            WEAPONS.SHOTGUN.DAMAGE,       // 伤害
            WEAPONS.SHOTGUN.FIRE_RATE,    // 射速（毫秒）
            WEAPONS.SHOTGUN.AMMO,         // 弹药
            WEAPONS.SHOTGUN.MAX_AMMO,     // 最大弹药
            WEAPONS.SHOTGUN.ICON,         // 图标
            WEAPONS.SHOTGUN.COLOR         // 颜色
        );
        
        this.id = WEAPONS.SHOTGUN.ID;
        this.bulletSpeed = WEAPONS.SHOTGUN.BULLET_SPEED;
        this.bulletCount = WEAPONS.SHOTGUN.BULLET_COUNT;
        this.spreadAngle = WEAPONS.SHOTGUN.SPREAD_ANGLE;
    }
    
    /**
     * 获取子弹速度
     */
    getBulletSpeed() {
        return this.bulletSpeed;
    }
    
    /**
     * 射击方法 - 散弹枪一次发射多发子弹
     * @param {number} playerX - 玩家X坐标
     * @param {number} playerY - 玩家Y坐标
     * @param {number} targetX - 目标X坐标
     * @param {number} targetY - 目标Y坐标
     * @returns {Bullet[]|null} 子弹数组，如果不能射击则返回null
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
        
        // 消耗弹药
        if (!this.infiniteAmmo) {
            this.ammo--;
        }
        
        // 创建多发子弹（扇形散开）
        const bullets = [];
        const baseAngle = Math.atan2(dy, dx);
        const spreadRad = (this.spreadAngle * Math.PI) / 180;
        
        for (let i = 0; i < this.bulletCount; i++) {
            // 计算每发子弹的角度
            let angleOffset = 0;
            if (this.bulletCount > 1) {
                angleOffset = -spreadRad / 2 + (spreadRad * i) / (this.bulletCount - 1);
            }
            const angle = baseAngle + angleOffset;
            const dirX = Math.cos(angle);
            const dirY = Math.sin(angle);
            
            bullets.push(this.createBullet(playerX, playerY, dirX, dirY));
        }
        
        return bullets;
    }
    
    /**
     * 创建散弹子弹
     */
    createBullet(playerX, playerY, dirX, dirY) {
        return new ShotgunBullet(playerX, playerY, dirX, dirY, {
            damage: this.damage,
            speed: this.bulletSpeed,
            color: COLORS.BULLET.SHOTGUN
        });
    }
}
