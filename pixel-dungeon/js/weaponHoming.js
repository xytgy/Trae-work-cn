/**
 * 追踪导弹武器类
 * 发射后自动追踪最近的敌人，击中时爆炸
 */

class WeaponHoming extends Weapon {
    constructor() {
        super(
            '追踪导弹',         // 名称
            WEAPONS.HOMING.DAMAGE,       // 伤害
            WEAPONS.HOMING.FIRE_RATE,    // 射速（毫秒）
            WEAPONS.HOMING.AMMO,         // 弹药
            WEAPONS.HOMING.MAX_AMMO,     // 最大弹药
            WEAPONS.HOMING.ICON,         // 图标
            WEAPONS.HOMING.COLOR         // 颜色
        );
        
        this.id = WEAPONS.HOMING.ID;
        this.bulletSpeed = WEAPONS.HOMING.BULLET_SPEED;
        this.maxSpeed = WEAPONS.HOMING.MAX_SPEED;
        this.acceleration = WEAPONS.HOMING.ACCELERATION;
        this.turnSpeed = WEAPONS.HOMING.TURN_SPEED;
        this.explosionRadius = WEAPONS.HOMING.EXPLOSION_RADIUS;
    }
    
    /**
     * 获取子弹速度
     */
    getBulletSpeed() {
        return this.bulletSpeed;
    }
    
    /**
     * 创建追踪导弹
     */
    createBullet(playerX, playerY, dirX, dirY) {
        return new HomingBullet(playerX, playerY, dirX, dirY, {
            damage: this.damage,
            speed: this.bulletSpeed,
            color: COLORS.BULLET.HOMING,
            maxSpeed: this.maxSpeed,
            acceleration: this.acceleration,
            turnSpeed: this.turnSpeed,
            explosionRadius: this.explosionRadius
        });
    }
}
