/**
 * 冰冻枪武器类
 * 命中敌人后减速敌人，持续2秒
 */

class WeaponFreeze extends Weapon {
    constructor() {
        super(
            '冰冻枪',           // 名称
            WEAPONS.FREEZE.DAMAGE,       // 伤害
            WEAPONS.FREEZE.FIRE_RATE,    // 射速（毫秒）
            WEAPONS.FREEZE.AMMO,         // 弹药
            WEAPONS.FREEZE.MAX_AMMO,     // 最大弹药
            WEAPONS.FREEZE.ICON,         // 图标
            WEAPONS.FREEZE.COLOR         // 颜色
        );
        
        this.id = WEAPONS.FREEZE.ID;
        this.bulletSpeed = WEAPONS.FREEZE.BULLET_SPEED;
        this.slowFactor = WEAPONS.FREEZE.SLOW_FACTOR;
        this.slowDuration = WEAPONS.FREEZE.SLOW_DURATION;
    }
    
    /**
     * 获取子弹速度
     */
    getBulletSpeed() {
        return this.bulletSpeed;
    }
    
    /**
     * 创建冰冻子弹
     */
    createBullet(playerX, playerY, dirX, dirY) {
        return new FreezeBullet(playerX, playerY, dirX, dirY, {
            damage: this.damage,
            speed: this.bulletSpeed,
            color: COLORS.BULLET.FREEZE,
            slowFactor: this.slowFactor,
            slowDuration: this.slowDuration
        });
    }
}
