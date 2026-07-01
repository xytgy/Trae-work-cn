/**
 * 粒子管理器
 * 从 GameLogic 中提取粒子管理相关方法
 */
class ParticleManager {
    constructor({ eventBus, gameLogic }) {
        this.eventBus = eventBus;
        this.gameLogic = gameLogic;
    }

    /**
     * 更新粒子
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updateParticles(deltaTime) {
        const gl = this.gameLogic;
        gl.frameBulletTrails = 0;

        const MAX_PARTICLES = 500;

        for (let i = gl.particles.length - 1; i >= 0; i--) {
            const particle = gl.particles[i];
            if (particle.active) {
                particle.update(deltaTime);
            }

            if (particle.isDead()) {
                if (particle.size <= 4 && particle.lifetime <= 150) {
                    gl._releaseBulletTrail(particle);
                }
                gl.particles.splice(i, 1);
            }
        }

        if (gl.particles.length >= MAX_PARTICLES) {
            if (gl.particles.length === MAX_PARTICLES) {
                console.warn(`粒子数量达到上限: ${MAX_PARTICLES}`);
            }
        }
    }

    /**
     * 生成击中碎片粒子（子弹击中敌人时）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} color - 敌人颜色
     */
    spawnHitParticles(x, y, color) {
        const gl = this.gameLogic;
        const config = PARTICLES.TYPES.HIT_FRAGMENT;
        const count = Math.floor(config.countMin + Math.random() * (config.countMax - config.countMin));

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
            const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
            const lifetime = config.lifetimeMin + Math.random() * (config.lifetimeMax - config.lifetimeMin);

            const particleColor = Math.random() < 0.7 ? color : '#ffffff';

            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                particleColor,
                size,
                lifetime
            );

            particle.setKind(PARTICLES.KIND.SQUARE);
            particle.setGravity(config.gravity);
            particle.setFriction(0.96);

            gl.particles.push(particle);
        }
    }

    /**
     * 生成受伤粒子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    spawnDamageParticles(x, y) {
        const gl = this.gameLogic;
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;

            gl.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                COLORS.UI.HEALTH_FULL,
                4,
                300
            ));
        }
    }

    /**
     * 生成死亡粒子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} color - 颜色
     */
    spawnDeathParticles(x, y, color) {
        const gl = this.gameLogic;

        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2 + Math.random() * 0.3;
            const speed = 2 + Math.random() * 4;

            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                4 + Math.random() * 4,
                500 + Math.random() * 300
            );
            particle.setKind(PARTICLES.KIND.CIRCLE);
            particle.setGravity(0.15);
            gl.particles.push(particle);
        }

        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;

            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 2,
                '#ffffff',
                2 + Math.random() * 2,
                300 + Math.random() * 200
            );
            particle.setKind(PARTICLES.KIND.SQUARE);
            particle.setGravity(0.2);
            particle.enableFlicker(0.05);
            gl.particles.push(particle);
        }

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particle = new Particle(
                x, y,
                Math.cos(angle) * 6,
                Math.sin(angle) * 6,
                color,
                6,
                200
            );
            particle.setKind(PARTICLES.KIND.CIRCLE);
            particle.setGravity(0);
            gl.particles.push(particle);
        }

        const flash = new Particle(
            x, y,
            0, 0,
            '#ffffff',
            20,
            100
        );
        flash.disableShrink();
        flash.disableFade();
        gl.particles.push(flash);
    }

    /**
     * 生成Boss爆炸粒子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    spawnBossExplosion(x, y) {
        const gl = this.gameLogic;
        const bossColor = PARTICLES.TYPES.BOSS_EXPLOSION.color;

        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 6;

            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                bossColor,
                8 + Math.random() * 10,
                800 + Math.random() * 600
            );
            particle.setKind(PARTICLES.KIND.CIRCLE);
            particle.setGravity(0.1);
            gl.particles.push(particle);
        }

        const sparkColors = ['#ff9800', '#ffeb3b', '#ff5722'];
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 8;

            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 3,
                sparkColors[Math.floor(Math.random() * sparkColors.length)],
                4 + Math.random() * 4,
                500 + Math.random() * 400
            );
            particle.setKind(PARTICLES.KIND.SQUARE);
            particle.setGravity(0.2);
            particle.enableFlicker(0.08);
            gl.particles.push(particle);
        }

        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;

            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 2,
                '#424242',
                10 + Math.random() * 10,
                1000 + Math.random() * 500
            );
            particle.setKind(PARTICLES.KIND.CIRCLE);
            particle.setGravity(-0.05);
            gl.particles.push(particle);
        }

        for (let i = 0; i < 3; i++) {
            const delay = i * 100;
            const ringSize = 20 + i * 10;
            setTimeout(() => {
                const ring = new Particle(
                    x, y,
                    0, 0,
                    i === 0 ? '#ffffff' : bossColor,
                    ringSize,
                    400
                );
                ring.setKind(PARTICLES.KIND.RING);
                ring.setExpandSpeed(0.8 + i * 0.3);
                ring.setRingThickness(3 - i);
                ring.disableShrink();
                gl.particles.push(ring);
            }, delay);
        }

        const flash = new Particle(
            x, y,
            0, 0,
            '#ffffff',
            60,
            150
        );
        flash.disableShrink();
        flash.disableFade();
        gl.particles.push(flash);
    }

    /**
     * 生成拾取粒子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} color - 颜色
     */
    spawnPickupParticles(x, y, color) {
        const gl = this.gameLogic;
        const ringConfig = PARTICLES.TYPES.UPGRADE_RING;
        const starConfig = PARTICLES.TYPES.UPGRADE_STAR;

        for (let i = 0; i < ringConfig.ringCount; i++) {
            const delay = i * 80;
            const ringIndex = i;

            setTimeout(() => {
                const expandSpeed = ringConfig.expandSpeedMin + Math.random() * (ringConfig.expandSpeedMax - ringConfig.expandSpeedMin);
                const ringColor = ringConfig.colors[ringIndex % ringConfig.colors.length];

                const particle = new Particle(
                    x, y,
                    0, 0,
                    ringColor,
                    10,
                    ringConfig.lifetime
                );

                particle.setKind(PARTICLES.KIND.RING);
                particle.setExpandSpeed(expandSpeed);
                particle.setRingThickness(3);
                particle.disableShrink();

                gl.particles.push(particle);
            }, delay);
        }

        const starCount = Math.floor(starConfig.countMin + Math.random() * (starConfig.countMax - starConfig.countMin));
        for (let i = 0; i < starCount; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
            const speed = starConfig.speedMin + Math.random() * (starConfig.speedMax - starConfig.speedMin);
            const size = starConfig.sizeMin + Math.random() * (starConfig.sizeMax - starConfig.sizeMin);
            const lifetime = starConfig.lifetimeMin + Math.random() * (starConfig.lifetimeMax - starConfig.lifetimeMin);

            const particle = new Particle(
                x + (Math.random() - 0.5) * 20,
                y + (Math.random() - 0.5) * 10,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                starConfig.color,
                size,
                lifetime
            );

            particle.setKind(PARTICLES.KIND.STAR);
            particle.setGravity(starConfig.gravity);
            particle.setRotationSpeed(0.1 + Math.random() * 0.2);
            particle.setFriction(0.99);

            gl.particles.push(particle);
        }
    }

    /**
     * 生成爆炸碎片粒子效果（榴弹爆炸时）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    spawnExplosionParticles(x, y) {
        const gl = this.gameLogic;
        const config = PARTICLES.TYPES.EXPLOSION_FRAGMENT;
        const smokeConfig = PARTICLES.TYPES.EXPLOSION_SMOKE;

        const count = Math.floor(config.countMin + Math.random() * (config.countMax - config.countMin));
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
            const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
            const lifetime = config.lifetimeMin + Math.random() * (config.lifetimeMax - config.lifetimeMin);
            const color = config.colors[Math.floor(Math.random() * config.colors.length)];

            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                size,
                lifetime
            );

            particle.setKind(PARTICLES.KIND.SQUARE);
            particle.setGravity(config.gravity);
            particle.setFriction(0.95);

            gl.particles.push(particle);
        }

        const smokeCount = Math.floor(smokeConfig.countMin + Math.random() * (smokeConfig.countMax - smokeConfig.countMin));
        for (let i = 0; i < smokeCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = smokeConfig.speedMin + Math.random() * (smokeConfig.speedMax - smokeConfig.speedMin);
            const size = smokeConfig.sizeMin + Math.random() * (smokeConfig.sizeMax - smokeConfig.sizeMin);
            const lifetime = smokeConfig.lifetimeMin + Math.random() * (smokeConfig.lifetimeMax - smokeConfig.lifetimeMin);

            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                smokeConfig.color,
                size,
                lifetime
            );

            particle.setKind(PARTICLES.KIND.CIRCLE);
            particle.setGravity(smokeConfig.gravity);
            particle.setFriction(0.97);

            gl.particles.push(particle);
        }
    }

    /**
     * 生成追踪导弹爆炸粒子效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    spawnHomingExplosionParticles(x, y) {
        const gl = this.gameLogic;
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;

            gl.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                COLORS.BULLET.HOMING,
                3 + Math.random() * 3,
                300 + Math.random() * 200
            ));
        }
    }
}
