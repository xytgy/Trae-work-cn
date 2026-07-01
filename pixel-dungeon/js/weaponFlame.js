/**
 * 火焰喷射器武器类
 * 短距离持续伤害，射速极快
 */

class WeaponFlame extends Weapon {
    constructor() {
        super(
            '火焰喷射器',     // 名称
            WEAPONS.FLAME.DAMAGE,       // 伤害
            WEAPONS.FLAME.FIRE_RATE,    // 射速（毫秒）
            WEAPONS.FLAME.AMMO,         // 弹药
            WEAPONS.FLAME.MAX_AMMO,     // 最大弹药
            WEAPONS.FLAME.ICON,         // 图标
            WEAPONS.FLAME.COLOR         // 颜色
        );
        
        this.id = WEAPONS.FLAME.ID;
        this.bulletSpeed = WEAPONS.FLAME.BULLET_SPEED;
        this.range = WEAPONS.FLAME.RANGE;  // 短距离
    }
    
    /**
     * 获取子弹速度
     */
    getBulletSpeed() {
        return this.bulletSpeed;
    }
    
    /**
     * 创建火焰子弹
     */
    createBullet(playerX, playerY, dirX, dirY) {
        return new FlameBullet(playerX, playerY, dirX, dirY, {
            damage: this.damage,
            speed: this.bulletSpeed,
            color: COLORS.BULLET.FLAME,
            range: this.range
        });
    }
}