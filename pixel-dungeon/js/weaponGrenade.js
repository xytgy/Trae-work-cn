/**
 * 榴弹发射器武器类
 * 发射炮弹，有爆炸范围伤害，伤害3
 */

class WeaponGrenade extends Weapon {
    constructor() {
        super(
            '榴弹发射器',     // 名称
            WEAPONS.GRENADE.DAMAGE,     // 伤害
            WEAPONS.GRENADE.FIRE_RATE,  // 射速（毫秒）
            WEAPONS.GRENADE.AMMO,       // 弹药
            WEAPONS.GRENADE.MAX_AMMO,   // 最大弹药
            WEAPONS.GRENADE.ICON,       // 图标
            WEAPONS.GRENADE.COLOR       // 颜色
        );
        
        this.id = WEAPONS.GRENADE.ID;
        this.bulletSpeed = WEAPONS.GRENADE.BULLET_SPEED;
        this.explosionRadius = WEAPONS.GRENADE.EXPLOSION_RADIUS;
    }
    
    /**
     * 获取子弹速度
     */
    getBulletSpeed() {
        return this.bulletSpeed;
    }
    
    /**
     * 创建榴弹
     */
    createBullet(playerX, playerY, dirX, dirY) {
        return new GrenadeBullet(playerX, playerY, dirX, dirY, {
            damage: this.damage,
            speed: this.bulletSpeed,
            color: COLORS.BULLET.GRENADE,
            explosionRadius: this.explosionRadius
        });
    }
}