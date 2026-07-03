/**
 * 子弹管理器
 * 从 GameLogic 中提取子弹管理相关方法
 */
class BulletManager {
    constructor({ eventBus, gameLogic }) {
        this.eventBus = eventBus;
        this.gameLogic = gameLogic;
    }

    /**
     * 更新子弹
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updateBullets(deltaTime) {
        const gl = this.gameLogic;
        const flameBulletsToMark = [];

        gl.bullets.forEach((bullet) => {
            if (bullet.active) {
                const wasActive = bullet.active;

                if (bullet.bulletType === 'homing' && bullet.setEnemiesRef) {
                    bullet.setEnemiesRef(gl.enemies);
                }

                bullet.update(deltaTime);

                this.spawnBulletTrailParticle(bullet);

                if (wasActive && !bullet.active && bullet.bulletType === 'flame') {
                    flameBulletsToMark.push({ x: bullet.x, y: bullet.y });
                }
            }
        });

        flameBulletsToMark.forEach((pos) => {
            this.spawnBurnMark(pos.x, pos.y);
        });

        gl.bullets = gl.bullets.filter((bullet) => bullet.active);
    }

    /**
     * 生成子弹轨迹粒子
     * @param {Bullet} bullet - 子弹
     */
    spawnBulletTrailParticle(bullet) {
        if (bullet.isEnemyBullet) {
            return;
        }

        const gl = this.gameLogic;
        gl.frameBulletTrails++;
        if (gl.frameBulletTrails > 30) {
            return;
        }

        let color = COLORS.BULLET.NORMAL;
        let particleCount = 1;
        let sizeMultiplier = 1;

        switch (bullet.bulletType) {
            case 'lightning':
                color = COLORS.BULLET.LIGHTNING;
                particleCount = 1;
                break;
            case 'grenade':
                color = COLORS.BULLET.GRENADE;
                particleCount = 1;
                break;
            case 'flame':
                color = COLORS.BULLET.FLAME;
                particleCount = 2;
                sizeMultiplier = 1.5;
                break;
            case 'boomerang':
                color = COLORS.WEAPON.BOOMERANG;
                particleCount = 1;
                break;
            case 'freeze':
                color = COLORS.BULLET.FREEZE;
                particleCount = 2;
                break;
            case 'shotgun':
                color = COLORS.BULLET.SHOTGUN;
                particleCount = 1;
                break;
            case 'homing':
                color = COLORS.BULLET.HOMING;
                particleCount = 2;
                break;
        }

        const baseSize = PARTICLES.TYPES.BULLET_TRAIL.size * sizeMultiplier;
        const lifetime = PARTICLES.TYPES.BULLET_TRAIL.lifetime;

        for (let i = 0; i < particleCount; i++) {
            const particle = gl._acquireBulletTrail();
            particle.x = bullet.x + (Math.random() - 0.5) * 4;
            particle.y = bullet.y + (Math.random() - 0.5) * 4;
            particle.velX = (Math.random() - 0.5) * 0.5;
            particle.velY = (Math.random() - 0.5) * 0.5;
            particle.color = color;
            particle.size = baseSize;
            particle.originalSize = baseSize;
            particle.lifetime = lifetime;
            particle.age = 0;
            particle.active = true;
            particle.friction = 0.95;

            gl.particles.push(particle);
        }
    }

    /**
     * 创建子弹
     * @param {Object} weapon - 武器数据
     * @param {Object} direction - 方向向量
     */
    createBullet(weapon, direction) {
        const gl = this.gameLogic;

        gl.playShootSound(weapon);

        switch (weapon.ID) {
            case WEAPONS.LIGHTNING.ID:
                const lightningBullet = new LightningBullet(gl.player.x, gl.player.y, direction.x, direction.y, weapon);
                gl.bullets.push(lightningBullet);
                break;

            case WEAPONS.GRENADE.ID:
                const grenadeBullet = new GrenadeBullet(gl.player.x, gl.player.y, direction.x, direction.y, weapon);
                gl.bullets.push(grenadeBullet);
                break;

            case WEAPONS.FLAME.ID:
                const flameBullet = new FlameBullet(gl.player.x, gl.player.y, direction.x, direction.y, {
                    ...weapon,
                    gameLogic: gl
                });
                gl.bullets.push(flameBullet);
                break;

            case WEAPONS.BOOMERANG.ID:
                const boomerangBullet = new BoomerangBullet(gl.player.x, gl.player.y, direction.x, direction.y, weapon);
                boomerangBullet.setPlayerPosition(gl.player.getPosition());
                gl.bullets.push(boomerangBullet);
                break;

            case WEAPONS.FREEZE.ID:
                const freezeBullet = new FreezeBullet(gl.player.x, gl.player.y, direction.x, direction.y, {
                    damage: weapon.DAMAGE,
                    speed: weapon.BULLET_SPEED,
                    color: COLORS.BULLET.FREEZE,
                    slowFactor: weapon.SLOW_FACTOR,
                    slowDuration: weapon.SLOW_DURATION,
                    gameLogic: gl
                });
                gl.bullets.push(freezeBullet);
                break;

            case WEAPONS.SHOTGUN.ID:
                const bulletCount = weapon.BULLET_COUNT || 3;
                const spreadAngle = weapon.SPREAD_ANGLE || 30;
                const baseAngle = Math.atan2(direction.y, direction.x);
                const spreadRad = (spreadAngle * Math.PI) / 180;

                for (let i = 0; i < bulletCount; i++) {
                    let angleOffset = 0;
                    if (bulletCount > 1) {
                        angleOffset = -spreadRad / 2 + (spreadRad * i) / (bulletCount - 1);
                    }
                    const angle = baseAngle + angleOffset;
                    const dirX = Math.cos(angle);
                    const dirY = Math.sin(angle);

                    const shotgunBullet = new ShotgunBullet(gl.player.x, gl.player.y, dirX, dirY, {
                        damage: weapon.DAMAGE,
                        speed: weapon.BULLET_SPEED,
                        color: COLORS.BULLET.SHOTGUN
                    });
                    gl.bullets.push(shotgunBullet);
                }
                break;

            case WEAPONS.HOMING.ID:
                const homingBullet = new HomingBullet(gl.player.x, gl.player.y, direction.x, direction.y, {
                    damage: weapon.DAMAGE,
                    speed: weapon.BULLET_SPEED,
                    color: COLORS.BULLET.HOMING,
                    maxSpeed: weapon.MAX_SPEED,
                    acceleration: weapon.ACCELERATION,
                    turnSpeed: weapon.TURN_SPEED,
                    explosionRadius: weapon.EXPLOSION_RADIUS
                });
                homingBullet.setEnemiesRef(gl.enemies);
                gl.bullets.push(homingBullet);
                break;

            default:
                const normalBullet = new Bullet(gl.player.x, gl.player.y, direction.x, direction.y, weapon);
                gl.bullets.push(normalBullet);
        }
    }

    /**
     * 生成地面燃烧痕迹
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    spawnBurnMark(x, y) {
        const gl = this.gameLogic;
        const config = PARTICLES.TYPES.BURN_MARK;
        const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);

        const particle = new Particle(x, y, 0, 0, config.color, size, config.lifetime);

        particle.setKind(PARTICLES.KIND.BURN_MARK);
        particle.enableFlicker(config.flickerSpeed);
        particle.disableShrink();

        gl.particles.push(particle);
    }
}
