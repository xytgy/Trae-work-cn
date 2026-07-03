/**
 * 手枪武器类
 * 初始武器，无限弹药，稳定输出
 */

class WeaponPistol extends Weapon {
    constructor() {
        super(
            '手枪', // 名称
            WEAPONS.PISTOL.DAMAGE, // 伤害
            WEAPONS.PISTOL.FIRE_RATE, // 射速（毫秒）
            WEAPONS.PISTOL.AMMO, // 弹药（无限）
            WEAPONS.PISTOL.MAX_AMMO, // 最大弹药
            WEAPONS.PISTOL.ICON, // 图标
            WEAPONS.PISTOL.COLOR // 颜色
        );

        this.id = WEAPONS.PISTOL.ID;
        this.bulletSpeed = WEAPONS.PISTOL.BULLET_SPEED;
    }

    /**
     * 获取子弹速度
     */
    getBulletSpeed() {
        return this.bulletSpeed;
    }

    /**
     * 创建子弹
     */
    createBullet(playerX, playerY, dirX, dirY) {
        return new Bullet(playerX, playerY, dirX, dirY, {
            damage: this.damage,
            speed: this.bulletSpeed,
            color: COLORS.BULLET.NORMAL,
            penetrate: 0,
            explosionRadius: 0,
            range: 0,
            isBoomerang: false
        });
    }
}
