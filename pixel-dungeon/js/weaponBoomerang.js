/**
 * 星星回旋镖武器类
 * 发射后返回，可攻击多个敌人
 */

class WeaponBoomerang extends Weapon {
    constructor() {
        super(
            '星星回旋镖', // 名称
            WEAPONS.BOOMERANG.DAMAGE, // 伤害
            WEAPONS.BOOMERANG.FIRE_RATE, // 射速（毫秒）
            WEAPONS.BOOMERANG.AMMO, // 弹药
            WEAPONS.BOOMERANG.MAX_AMMO, // 最大弹药
            WEAPONS.BOOMERANG.ICON, // 图标
            WEAPONS.BOOMERANG.COLOR // 颜色
        );

        this.id = WEAPONS.BOOMERANG.ID;
        this.bulletSpeed = WEAPONS.BOOMERANG.BULLET_SPEED;
        this.isBoomerang = true;
        this.multiHit = true;
    }

    /**
     * 获取子弹速度
     */
    getBulletSpeed() {
        return this.bulletSpeed;
    }

    /**
     * 创建回旋镖子弹
     */
    createBullet(playerX, playerY, dirX, dirY) {
        return new BoomerangBullet(playerX, playerY, dirX, dirY, {
            damage: this.damage,
            speed: this.bulletSpeed,
            color: this.color,
            isBoomerang: true,
            multiHit: true
        });
    }
}
