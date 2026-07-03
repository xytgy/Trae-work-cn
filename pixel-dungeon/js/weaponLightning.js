/**
 * 闪电法杖武器类
 * 可穿透1个敌人，伤害2，射速快
 */

class WeaponLightning extends Weapon {
    constructor() {
        super(
            '闪电法杖', // 名称
            WEAPONS.LIGHTNING.DAMAGE, // 伤害
            WEAPONS.LIGHTNING.FIRE_RATE, // 射速（毫秒）
            WEAPONS.LIGHTNING.AMMO, // 弹药
            WEAPONS.LIGHTNING.MAX_AMMO, // 最大弹药
            WEAPONS.LIGHTNING.ICON, // 图标
            WEAPONS.LIGHTNING.COLOR // 颜色
        );

        this.id = WEAPONS.LIGHTNING.ID;
        this.bulletSpeed = WEAPONS.LIGHTNING.BULLET_SPEED;
        this.penetrate = WEAPONS.LIGHTNING.PENETRATE; // 可穿透1个敌人
    }

    /**
     * 获取子弹速度
     */
    getBulletSpeed() {
        return this.bulletSpeed;
    }

    /**
     * 创建闪电子弹
     */
    createBullet(playerX, playerY, dirX, dirY) {
        return new LightningBullet(playerX, playerY, dirX, dirY, {
            damage: this.damage,
            speed: this.bulletSpeed,
            color: COLORS.BULLET.LIGHTNING,
            penetrate: this.penetrate
        });
    }
}
