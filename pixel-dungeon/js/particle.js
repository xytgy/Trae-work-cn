/**
 * 粒子类
 * 用于游戏中的各种特效
 */

class Particle {
    constructor(x, y, velX, velY, color, size, lifetime) {
        // 位置
        this.x = x;
        this.y = y;

        // 速度
        this.velX = velX;
        this.velY = velY;

        // 颜色
        this.color = color;

        // 尺寸
        this.size = size || 4;
        this.originalSize = this.size;

        // 生命周期
        this.lifetime = lifetime || 500;
        this.age = 0;

        // 活跃状态
        this.active = true;

        // 重力影响
        this.gravity = 0;

        // 摩擦力
        this.friction = 0.98;

        // 渐变
        this.fadeOut = true;
        this.shrink = true;

        // 粒子形状类型
        this.kind = PARTICLES.KIND.CIRCLE;

        // 闪烁效果
        this.flicker = false;
        this.flickerSpeed = 0.1;

        // 环形粒子属性
        this.ringThickness = 2;
        this.expandSpeed = 0;

        // 旋转角度（星形粒子用）
        this.rotation = 0;
        this.rotationSpeed = 0;

        // 轨道运动属性
        this.isOrbiting = false;
        this.orbitAngle = 0;
        this.orbitRadius = 0;
        this.orbitCenterX = 0;
        this.orbitCenterY = 0;
        this.orbitSpeed = 0;

        // 吸引运动属性
        this.isAttracting = false;
        this.targetX = 0;
        this.targetY = 0;
        this.attractSpeed = 0;

        // 附着运动属性
        this.isAttached = false;
        this.attachTargetX = 0;
        this.attachTargetY = 0;

        // 裂痕粒子属性
        this.isCrack = false;
        this.crackAngle = 0;
        this.crackLength = 0;

        // 文字粒子属性
        this.text = '';
        this.font = '12px Arial';

        // 图像粒子属性
        this.image = null;

        // 自定义alpha
        this.alpha = 1;
    }

    /**
     * 重置粒子（用于对象池复用）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} velX - X方向速度
     * @param {number} velY - Y方向速度
     * @param {string} color - 颜色
     * @param {number} size - 尺寸
     * @param {number} lifetime - 生命周期
     */
    reset(x, y, velX, velY, color, size, lifetime) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
        this.color = color;
        this.size = size;
        this.originalSize = size;
        this.lifetime = lifetime;
        this.age = 0;
        this.active = true;
        this.gravity = 0;
        this.friction = 0.98;
        this.fadeOut = true;
        this.shrink = true;
        this.kind = PARTICLES.KIND.CIRCLE;
        this.flicker = false;
        this.flickerSpeed = 0.1;
        this.ringThickness = 2;
        this.expandSpeed = 0;
        this.rotation = 0;
        this.rotationSpeed = 0;

        // 重置特殊行为属性
        this.isOrbiting = false;
        this.orbitAngle = 0;
        this.orbitRadius = 0;
        this.orbitCenterX = 0;
        this.orbitCenterY = 0;
        this.orbitSpeed = 0;

        this.isAttracting = false;
        this.targetX = 0;
        this.targetY = 0;
        this.attractSpeed = 0;

        this.isAttached = false;
        this.attachTargetX = 0;
        this.attachTargetY = 0;

        this.isCrack = false;
        this.crackAngle = 0;
        this.crackLength = 0;

        this.text = '';
        this.font = '12px Arial';
        this.image = null;
        this.alpha = 1;
    }

    /**
     * 更新粒子
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    update(deltaTime) {
        if (!this.active) {
            return;
        }

        // 更新年龄
        this.age += deltaTime;

        // 检查生命周期
        if (this.age >= this.lifetime) {
            this.active = false;
            return;
        }

        // 应用速度
        this.x += this.velX;
        this.y += this.velY;

        // 应用重力
        this.velY += this.gravity;

        // 应用摩擦力
        this.velX *= this.friction;
        this.velY *= this.friction;

        // 环形粒子扩展
        if (this.kind === PARTICLES.KIND.RING && this.expandSpeed > 0) {
            this.size += this.expandSpeed;
        }

        // 星形粒子旋转
        if (this.kind === PARTICLES.KIND.STAR) {
            this.rotation += this.rotationSpeed;
        }

        // 更新尺寸（渐变缩小）
        if (this.shrink && this.kind !== PARTICLES.KIND.RING) {
            const lifePercent = this.age / this.lifetime;
            this.size = this.originalSize * (1 - lifePercent);
        }

        // 轨道运动更新
        if (this.isOrbiting) {
            this.orbitAngle += this.orbitSpeed;
            this.x = this.orbitCenterX + Math.cos(this.orbitAngle) * this.orbitRadius;
            this.y = this.orbitCenterY + Math.sin(this.orbitAngle) * this.orbitRadius;
        }

        // 吸引运动更新
        if (this.isAttracting) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 5) {
                this.active = false;
            } else {
                this.velX += (dx / dist) * this.attractSpeed;
                this.velY += (dy / dist) * this.attractSpeed;
            }
        }

        // 附着运动更新
        if (this.isAttached) {
            this.x += (this.attachTargetX - this.x) * 0.1;
            this.y += (this.attachTargetY - this.y) * 0.1;
        }
    }

    /**
     * 获取透明度（用于渐变效果）
     */
    getAlpha() {
        let alpha = this.alpha;

        if (this.fadeOut) {
            const lifePercent = this.age / this.lifetime;
            alpha *= 1 - lifePercent;
        }

        // 闪烁效果
        if (this.flicker) {
            const flickerValue = Math.sin(this.age * this.flickerSpeed) * 0.5 + 0.5;
            alpha *= flickerValue;
        }

        return Math.max(0, Math.min(1, alpha));
    }

    /**
     * 检查粒子是否死亡
     */
    isDead() {
        return this.age >= this.lifetime || !this.active;
    }

    /**
     * 设置重力
     * @param {number} gravity - 重力值
     */
    setGravity(gravity) {
        this.gravity = gravity;
    }

    /**
     * 设置摩擦力
     * @param {number} friction - 摩擦力值
     */
    setFriction(friction) {
        this.friction = friction;
    }

    /**
     * 禁用渐变
     */
    disableFade() {
        this.fadeOut = false;
    }

    /**
     * 禁用缩小
     */
    disableShrink() {
        this.shrink = false;
    }

    /**
     * 设置粒子形状类型
     * @param {string} kind - 粒子类型
     */
    setKind(kind) {
        this.kind = kind;
    }

    /**
     * 启用闪烁效果
     * @param {number} speed - 闪烁速度
     */
    enableFlicker(speed) {
        this.flicker = true;
        this.flickerSpeed = speed || 0.1;
    }

    /**
     * 设置环形扩展速度
     * @param {number} speed - 扩展速度
     */
    setExpandSpeed(speed) {
        this.expandSpeed = speed;
    }

    /**
     * 设置环形厚度
     * @param {number} thickness - 厚度
     */
    setRingThickness(thickness) {
        this.ringThickness = thickness;
    }

    /**
     * 设置旋转速度（星形粒子）
     * @param {number} speed - 旋转速度
     */
    setRotationSpeed(speed) {
        this.rotationSpeed = speed;
    }
}

/**
 * 粒子对象池
 * 用于复用粒子对象，避免频繁创建销毁
 */
class ParticlePool {
    constructor(maxSize) {
        this.pool = [];
        this.maxSize = maxSize || 200;
    }

    /**
     * 从池中获取一个粒子
     * @returns {Particle} 粒子实例
     */
    acquire() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return new Particle(0, 0, 0, 0, '#ffffff', 4, 500);
    }

    /**
     * 将粒子归还池中
     * @param {Particle} particle - 粒子实例
     */
    release(particle) {
        if (this.pool.length < this.maxSize) {
            particle.active = false;
            this.pool.push(particle);
        }
    }

    /**
     * 获取池大小
     * @returns {number} 池中的粒子数量
     */
    size() {
        return this.pool.length;
    }

    /**
     * 清空对象池
     */
    clear() {
        this.pool = [];
    }
}

/**
 * 粒子系统管理器
 * 负责管理所有粒子
 */
class ParticleSystem {
    constructor() {
        // 粒子列表
        this.particles = [];

        // 最大粒子数
        this.maxParticles = PARTICLES.MAX_COUNT;

        // 对象池
        this.pool = new ParticlePool(this.maxParticles * 2);

        // 延迟生成的粒子队列
        this.delayedParticles = [];
    }

    /**
     * 添加延迟生成的粒子
     * @param {number} delay - 延迟时间（毫秒）
     * @param {Function} createFn - 创建粒子的函数
     */
    addDelayedParticle(delay, createFn) {
        this.delayedParticles.push({
            delay: delay,
            createFn: createFn,
            timer: 0
        });
    }

    /**
     * 更新延迟粒子
     * @param {number} deltaTime - 时间增量
     */
    updateDelayedParticles(deltaTime) {
        for (let i = this.delayedParticles.length - 1; i >= 0; i--) {
            const delayed = this.delayedParticles[i];
            delayed.timer += deltaTime;

            if (delayed.timer >= delayed.delay) {
                delayed.createFn();
                this.delayedParticles.splice(i, 1);
            }
        }
    }

    /**
     * 清空所有延迟粒子（游戏重置时调用）
     */
    clearDelayedParticles() {
        this.delayedParticles = [];
    }

    /**
     * 添加粒子
     * @param {Particle} particle - 粒子实例
     */
    add(particle) {
        if (this.particles.length < this.maxParticles) {
            this.particles.push(particle);
            return true;
        }
        return false;
    }

    /**
     * 创建并添加一个粒子（使用对象池）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} velX - X方向速度
     * @param {number} velY - Y方向速度
     * @param {string} color - 颜色
     * @param {number} size - 尺寸
     * @param {number} lifetime - 生命周期
     * @returns {Particle} 创建的粒子
     */
    createParticle(x, y, velX, velY, color, size, lifetime) {
        if (this.particles.length >= this.maxParticles) {
            return null;
        }

        const particle = this.pool.acquire();
        particle.reset(x, y, velX, velY, color, size, lifetime);
        this.particles.push(particle);
        return particle;
    }

    /**
     * 创建击中碎片粒子效果（子弹击中敌人时）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} enemyColor - 敌人颜色
     */
    createHitFragments(x, y, enemyColor) {
        const config = PARTICLES.TYPES.HIT_FRAGMENT;
        const count = Math.floor(config.countMin + Math.random() * (config.countMax - config.countMin));

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
            const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
            const lifetime = config.lifetimeMin + Math.random() * (config.lifetimeMax - config.lifetimeMin);

            // 70%概率是敌人颜色，30%概率是白色火花
            const color = Math.random() < 0.7 ? enemyColor : '#ffffff';

            const particle = this.createParticle(
                x,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                size,
                lifetime
            );

            if (particle) {
                particle.setKind(PARTICLES.KIND.SQUARE);
                particle.setGravity(config.gravity);
                particle.setFriction(0.96);
            }
        }
    }

    /**
     * 创建爆炸碎片粒子效果（榴弹爆炸时）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createExplosionFragments(x, y) {
        const config = PARTICLES.TYPES.EXPLOSION_FRAGMENT;
        const smokeConfig = PARTICLES.TYPES.EXPLOSION_SMOKE;

        // 爆炸碎片
        const count = Math.floor(config.countMin + Math.random() * (config.countMax - config.countMin));
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
            const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
            const lifetime = config.lifetimeMin + Math.random() * (config.lifetimeMax - config.lifetimeMin);
            const color = config.colors[Math.floor(Math.random() * config.colors.length)];

            const particle = this.createParticle(
                x,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                size,
                lifetime
            );

            if (particle) {
                particle.setKind(PARTICLES.KIND.SQUARE);
                particle.setGravity(config.gravity);
                particle.setFriction(0.95);
            }
        }

        // 烟雾粒子
        const smokeCount = Math.floor(
            smokeConfig.countMin + Math.random() * (smokeConfig.countMax - smokeConfig.countMin)
        );
        for (let i = 0; i < smokeCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = smokeConfig.speedMin + Math.random() * (smokeConfig.speedMax - smokeConfig.speedMin);
            const size = smokeConfig.sizeMin + Math.random() * (smokeConfig.sizeMax - smokeConfig.sizeMin);
            const lifetime =
                smokeConfig.lifetimeMin + Math.random() * (smokeConfig.lifetimeMax - smokeConfig.lifetimeMin);

            const particle = this.createParticle(
                x,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                smokeConfig.color,
                size,
                lifetime
            );

            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
                particle.setGravity(smokeConfig.gravity);
                particle.setFriction(0.97);
            }
        }
    }

    /**
     * 创建升级光环粒子效果（拾取武器时）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createUpgradeAura(x, y) {
        const ringConfig = PARTICLES.TYPES.UPGRADE_RING;
        const starConfig = PARTICLES.TYPES.UPGRADE_STAR;

        // 金色光环（同心圆）- 使用延迟队列
        for (let i = 0; i < ringConfig.ringCount; i++) {
            const delay = i * 80;
            const ringIndex = i;

            // 使用延迟队列而不是setTimeout
            this.addDelayedParticle(delay, () => {
                const expandSpeed =
                    ringConfig.expandSpeedMin + Math.random() * (ringConfig.expandSpeedMax - ringConfig.expandSpeedMin);
                const color = ringConfig.colors[ringIndex % ringConfig.colors.length];

                const particle = this.createParticle(x, y, 0, 0, color, 10, ringConfig.lifetime);

                if (particle) {
                    particle.setKind(PARTICLES.KIND.RING);
                    particle.setExpandSpeed(expandSpeed);
                    particle.setRingThickness(3);
                    particle.disableShrink();
                }
            });
        }

        // 向上漂浮的星星粒子 - 正常生成
        const starCount = Math.floor(starConfig.countMin + Math.random() * (starConfig.countMax - starConfig.countMin));
        for (let i = 0; i < starCount; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
            const speed = starConfig.speedMin + Math.random() * (starConfig.speedMax - starConfig.speedMin);
            const size = starConfig.sizeMin + Math.random() * (starConfig.sizeMax - starConfig.sizeMin);
            const lifetime = starConfig.lifetimeMin + Math.random() * (starConfig.lifetimeMax - starConfig.lifetimeMin);

            const particle = this.createParticle(
                x + (Math.random() - 0.5) * 20,
                y + (Math.random() - 0.5) * 10,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                starConfig.color,
                size,
                lifetime
            );

            if (particle) {
                particle.setKind(PARTICLES.KIND.STAR);
                particle.setGravity(starConfig.gravity);
                particle.setRotationSpeed(0.1 + Math.random() * 0.2);
                particle.setFriction(0.99);
            }
        }
    }

    /**
     * 创建地面燃烧痕迹
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createBurnMark(x, y) {
        const config = PARTICLES.TYPES.BURN_MARK;
        const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);

        const particle = this.createParticle(x, y, 0, 0, config.color, size, config.lifetime);

        if (particle) {
            particle.setKind(PARTICLES.KIND.BURN_MARK);
            particle.enableFlicker(config.flickerSpeed);
            particle.disableShrink();
        }
    }

    /**
     * 创建Boss激光预警粒子
     * @param {number} startX - 起始X坐标
     * @param {number} startY - 起始Y坐标
     * @param {number} angle - 激光角度（弧度）
     * @param {number} length - 激光长度
     */
    createLaserWarning(startX, startY, angle, length) {
        const config = PARTICLES.TYPES.LASER_WARNING;
        const count = Math.floor(config.countMin + Math.random() * (config.countMax - config.countMin));

        for (let i = 0; i < count; i++) {
            const t = Math.random();
            const x = startX + Math.cos(angle) * length * t;
            const y = startY + Math.sin(angle) * length * t;
            const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
            const lifetime = config.lifetimeMin + Math.random() * (config.lifetimeMax - config.lifetimeMin);
            const color = config.colors[Math.floor(Math.random() * config.colors.length)];

            // 添加一些垂直于激光的偏移
            const perpAngle = angle + Math.PI / 2;
            const offset = (Math.random() - 0.5) * 20;
            const px = x + Math.cos(perpAngle) * offset;
            const py = y + Math.sin(perpAngle) * offset;

            const particle = this.createParticle(px, py, 0, 0, color, size, lifetime);

            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
                particle.enableFlicker(config.flickerSpeed);
                particle.disableShrink();
            }
        }
    }

    /**
     * 创建爆炸粒子效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} color - 颜色
     * @param {number} count - 粒子数量
     */
    createExplosion(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;

            const particle = this.createParticle(
                x,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                PARTICLES.SIZE_MIN + Math.random() * (PARTICLES.SIZE_MAX - PARTICLES.SIZE_MIN),
                PARTICLES.LIFETIME_MIN + Math.random() * (PARTICLES.LIFETIME_MAX - PARTICLES.LIFETIME_MIN)
            );

            if (particle) {
                particle.setGravity(0.1);
            }
        }
    }

    /**
     * 创建闪光效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} color - 颜色
     */
    createFlash(x, y, color) {
        const particle = this.createParticle(x, y, 0, 0, color, 20, 100);

        if (particle) {
            particle.disableShrink();
            particle.disableFade();
        }
    }

    /**
     * 创建子弹轨迹粒子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} color - 颜色
     */
    createBulletTrail(x, y, color) {
        const particle = this.createParticle(
            x,
            y,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            color,
            PARTICLES.TYPES.BULLET_TRAIL.size,
            PARTICLES.TYPES.BULLET_TRAIL.lifetime
        );

        if (particle) {
            particle.setFriction(0.95);
        }
    }

    /**
     * 创建传送门粒子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createPortalParticle(x, y) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;

        const particle = this.createParticle(
            x,
            y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            PARTICLES.TYPES.PORTAL.color,
            PARTICLES.TYPES.PORTAL.size,
            PARTICLES.TYPES.PORTAL.lifetime
        );

        if (particle) {
            particle.setGravity(-0.05);
        }
    }

    /**
     * 创建火焰粒子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} color - 颜色
     */
    createFlameParticle(x, y, color) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;

        const particle = this.createParticle(
            x,
            y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            color || PARTICLES.TYPES.FLAME.color,
            PARTICLES.TYPES.FLAME.size + Math.random() * 2,
            PARTICLES.TYPES.FLAME.lifetime
        );

        if (particle) {
            particle.setGravity(-0.1);
            particle.setFriction(0.9);
        }
    }

    /**
     * 创建武器拾取闪光
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} color - 颜色
     */
    createWeaponPickup(x, y, color) {
        // 向外扩散的环形粒子
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 3;

            const particle = this.createParticle(
                x,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                PARTICLES.TYPES.WEAPON_PICKUP.size,
                PARTICLES.TYPES.WEAPON_PICKUP.lifetime
            );
        }

        // 中心闪光
        this.createFlash(x, y, color);
    }

    /**
     * 创建枪口闪光效果
     * @param {number} x - 枪口X坐标
     * @param {number} y - 枪口Y坐标
     * @param {number} angle - 射击角度（弧度）
     * @param {string} color - 武器颜色
     * @param {number} size - 闪光大小
     */
    createMuzzleFlash(x, y, angle, color, size) {
        const config = PARTICLES.TYPES.MUZZLE_FLASH;

        // 主闪光（圆形，带闪烁）
        const flash = this.createParticle(x, y, 0, 0, '#ffaa00', size || config.MAIN.size, config.MAIN.lifetime);
        if (flash) {
            flash.setKind(PARTICLES.KIND.CIRCLE);
            flash.enableFlicker(0.5);
            flash.disableShrink();
        }

        // 火星粒子（向射击方向散开）
        const sparkCount = config.SPARK.count;
        for (let i = 0; i < sparkCount; i++) {
            const spread = (Math.random() - 0.5) * 0.6; // 扩散角度
            const speed = 2 + Math.random() * 4;
            const sparkAngle = angle + spread;
            const sparkSize = config.SPARK.sizeMin + Math.random() * (config.SPARK.sizeMax - config.SPARK.sizeMin);
            const lifetime =
                config.SPARK.lifetimeMin + Math.random() * (config.SPARK.lifetimeMax - config.SPARK.lifetimeMin);

            // 随机颜色：橙色或黄色
            const sparkColor = Math.random() < 0.5 ? '#ff6600' : '#ffff00';

            const particle = this.createParticle(
                x,
                y,
                Math.cos(sparkAngle) * speed,
                Math.sin(sparkAngle) * speed,
                sparkColor,
                sparkSize,
                lifetime
            );

            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
                particle.setGravity(0.05);
                particle.setFriction(0.95);
            }
        }
    }

    /**
     * 创建技能蓄力光环效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} color - 光环颜色
     * @param {number} progress - 蓄力进度（0-1）
     */
    createCastRing(x, y, color, progress) {
        const config = PARTICLES.TYPES.CAST_RING;
        const size = config.size * (0.5 + progress * 0.5);

        const particle = this.createParticle(x, y, 0, 0, color || config.color, size, config.lifetime);

        if (particle) {
            particle.setKind(PARTICLES.KIND.RING);
            particle.setRingThickness(3);
            particle.disableShrink();
            particle.enableFlicker(0.3);
        }
    }

    /**
     * 创建受伤闪烁效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createDamageFlash(x, y) {
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 2;

            const particle = this.createParticle(
                x,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#ff0000',
                PARTICLES.TYPES.DAMAGE_FLASH.size,
                PARTICLES.TYPES.DAMAGE_FLASH.lifetime
            );
        }
    }

    /**
     * 更新所有粒子
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    update(deltaTime) {
        // 更新延迟粒子
        this.updateDelayedParticles(deltaTime);

        this.particles.forEach((particle) => {
            particle.update(deltaTime);
        });

        // 移除死亡粒子并归还对象池
        const deadParticles = this.particles.filter((p) => p.isDead());
        deadParticles.forEach((p) => this.pool.release(p));
        this.particles = this.particles.filter((p) => !p.isDead());
    }

    /**
     * 渲染所有粒子
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    render(ctx) {
        this.particles.forEach((particle) => {
            if (!particle.active) {
                return;
            }

            const alpha = particle.getAlpha();
            ctx.save();
            ctx.globalAlpha = alpha;

            switch (particle.kind) {
                case PARTICLES.KIND.CIRCLE:
                    // 圆形粒子
                    ctx.fillStyle = particle.color;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case PARTICLES.KIND.SQUARE:
                    // 方形碎片粒子
                    if (particle.isCrack) {
                        // 裂痕粒子
                        ctx.save();
                        ctx.translate(particle.x, particle.y);
                        ctx.rotate(particle.crackAngle);
                        ctx.fillStyle = particle.color;
                        ctx.fillRect(
                            -particle.crackLength / 2,
                            -particle.size / 2,
                            particle.crackLength,
                            particle.size
                        );
                        ctx.restore();
                    } else {
                        ctx.fillStyle = particle.color;
                        ctx.fillRect(
                            particle.x - particle.size / 2,
                            particle.y - particle.size / 2,
                            particle.size,
                            particle.size
                        );
                    }
                    break;

                case PARTICLES.KIND.RING:
                    // 环形粒子（光环效果）
                    ctx.strokeStyle = particle.color;
                    ctx.lineWidth = particle.ringThickness;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.stroke();
                    break;

                case PARTICLES.KIND.STAR:
                    // 星形粒子
                    ctx.save();
                    ctx.translate(particle.x, particle.y);
                    ctx.rotate(particle.rotation);
                    ctx.fillStyle = particle.color;
                    this.drawStar(ctx, 0, 0, 5, particle.size, particle.size / 2);
                    ctx.fill();
                    ctx.restore();
                    break;

                case PARTICLES.KIND.DUST:
                    // 灰尘粒子
                    ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case PARTICLES.KIND.BURN_MARK:
                    // 燃烧痕迹
                    ctx.fillStyle = particle.color;
                    ctx.globalAlpha = alpha * 0.6;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case PARTICLES.KIND.HEART:
                    // 心形粒子
                    ctx.save();
                    ctx.translate(particle.x, particle.y);
                    ctx.fillStyle = particle.color;
                    this.drawHeart(ctx, 0, 0, particle.size);
                    ctx.fill();
                    ctx.restore();
                    break;

                case PARTICLES.KIND.DIAMOND:
                    // 钻石形粒子
                    ctx.save();
                    ctx.translate(particle.x, particle.y);
                    ctx.rotate(particle.rotation);
                    ctx.fillStyle = particle.color;
                    ctx.beginPath();
                    ctx.moveTo(0, -particle.size);
                    ctx.lineTo(particle.size * 0.7, 0);
                    ctx.lineTo(0, particle.size);
                    ctx.lineTo(-particle.size * 0.7, 0);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                    break;

                case PARTICLES.KIND.LIGHTNING:
                    // 闪电形粒子
                    ctx.save();
                    ctx.translate(particle.x, particle.y);
                    ctx.strokeStyle = particle.color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    const lightningHeight = particle.size * 2;
                    const segments = 4;
                    let currentY = -lightningHeight / 2;
                    ctx.moveTo(0, currentY);
                    for (let i = 0; i < segments; i++) {
                        currentY += lightningHeight / segments;
                        const offsetX = (Math.random() - 0.5) * particle.size;
                        ctx.lineTo(offsetX, currentY);
                    }
                    ctx.stroke();
                    ctx.restore();
                    break;

                case PARTICLES.KIND.TEXT:
                    // 文字粒子
                    ctx.fillStyle = particle.color;
                    ctx.font = particle.font || '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(particle.text || '', particle.x, particle.y);
                    break;

                case PARTICLES.KIND.IMAGE:
                    // 图像粒子
                    if (particle.image && particle.image.complete) {
                        ctx.drawImage(
                            particle.image,
                            particle.x - particle.size,
                            particle.y - particle.size,
                            particle.size * 2,
                            particle.size * 2
                        );
                    }
                    break;
            }

            ctx.restore();
        });
    }

    /**
     * 绘制星形（辅助方法）
     */
    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }

        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
    }

    /**
     * 绘制心形（辅助方法）
     */
    drawHeart(ctx, cx, cy, size) {
        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        ctx.moveTo(cx, cy + size * 0.5);
        ctx.bezierCurveTo(cx - size, cy - size * 0.2, cx - size * 0.5, cy - size, cx, cy - topCurveHeight);
        ctx.bezierCurveTo(cx + size * 0.5, cy - size, cx + size, cy - size * 0.2, cx, cy + size * 0.5);
        ctx.closePath();
    }

    /**
     * 获取所有活跃粒子
     */
    getParticles() {
        return this.particles.filter((p) => p.active);
    }

    /**
     * 清空所有粒子
     */
    clear() {
        this.particles.forEach((p) => this.pool.release(p));
        this.particles = [];
        this.clearDelayedParticles();
    }

    /**
     * 创建环境灰尘粒子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {Particle} 创建的粒子
     */
    createDustParticle(x, y) {
        const config = PARTICLES.TYPES.AMBIENT_DUST;
        const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);

        const particle = this.createParticle(
            x,
            y,
            (Math.random() - 0.5) * 0.2,
            -0.1 - Math.random() * 0.1,
            config.color,
            size,
            config.lifetime
        );

        if (particle) {
            particle.setKind(PARTICLES.KIND.DUST);
            particle.setFriction(0.99);
            particle.disableShrink();
        }

        return particle;
    }

    /**
     * 生成房间内的环境灰尘粒子
     * @param {number} roomX - 房间X坐标
     * @param {number} roomY - 房间Y坐标
     * @param {number} roomWidth - 房间宽度
     * @param {number} roomHeight - 房间高度
     * @param {number} count - 粒子数量
     */
    createAmbientDust(roomX, roomY, roomWidth, roomHeight, count = 25) {
        for (let i = 0; i < count; i++) {
            const x = roomX + Math.random() * roomWidth;
            const y = roomY + Math.random() * roomHeight;
            this.createDustParticle(x, y);
        }
    }

    /**
     * 创建怒气溢出粒子效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createRageOverflowParticle(x, y) {
        const particle = this.createParticle(
            x,
            y,
            (Math.random() - 0.5) * 2,
            -1 - Math.random() * 2,
            Math.random() < 0.5 ? '#ff6600' : '#ffff00',
            1 + Math.random() * 2,
            300 + Math.random() * 200
        );

        if (particle) {
            particle.setKind(PARTICLES.KIND.CIRCLE);
            particle.setGravity(-0.05);
            particle.setFriction(0.98);
        }

        return particle;
    }

    /**
     * 创建治疗效果粒子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createHealParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
            const speed = 1 + Math.random() * 2;

            const particle = this.createParticle(
                x + (Math.random() - 0.5) * 20,
                y + (Math.random() - 0.5) * 10,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#00ff00',
                2 + Math.random() * 2,
                500 + Math.random() * 300
            );

            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
                particle.setGravity(-0.03);
            }
        }
    }

    /**
     * 创建暴击特效粒子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createCritParticles(x, y) {
        const config = PARTICLE_EFFECTS.CRIT_BURST;

        // 星形爆发
        for (let i = 0; i < config.starCount; i++) {
            const angle = (i / config.starCount) * Math.PI * 2;
            const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);

            const particle = this.createParticle(
                x,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                config.starColor,
                config.starSize,
                config.lifetime
            );

            if (particle) {
                particle.setKind(PARTICLES.KIND.STAR);
                particle.setRotationSpeed(0.2 + Math.random() * 0.3);
                particle.setFriction(0.95);
            }
        }

        // 金色粒子
        for (let i = 0; i < config.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
            const color = config.particleColors[Math.floor(Math.random() * config.particleColors.length)];

            const particle = this.createParticle(
                x,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                2 + Math.random() * 2,
                config.lifetime
            );

            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
                particle.setFriction(0.95);
            }
        }

        // 金色光环
        const ring = this.createParticle(x, y, 0, 0, config.ringColor, 10, config.lifetime);
        if (ring) {
            ring.setKind(PARTICLES.KIND.RING);
            ring.setExpandSpeed(config.ringExpandSpeed);
            ring.setRingThickness(3);
            ring.disableShrink();
        }
    }

    /**
     * 创建治疗光环效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createHealAura(x, y) {
        const config = PARTICLE_EFFECTS.HEAL_AURA;

        // 多层绿色光环
        for (let i = 0; i < config.ringCount; i++) {
            const delay = i * 80;
            const ringIndex = i;

            this.addDelayedParticle(delay, () => {
                const color = config.ringColors[ringIndex % config.ringColors.length];
                const particle = this.createParticle(x, y, 0, 0, color, 10, config.ringLifetime);

                if (particle) {
                    particle.setKind(PARTICLES.KIND.RING);
                    particle.setExpandSpeed(config.expandSpeed);
                    particle.setRingThickness(3);
                    particle.disableShrink();
                }
            });
        }

        // 向上漂浮的治疗粒子
        for (let i = 0; i < config.particleCount; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
            const speed = 1 + Math.random() * 2;
            const size = config.particleSizeMin + Math.random() * (config.particleSizeMax - config.particleSizeMin);

            const particle = this.createParticle(
                x + (Math.random() - 0.5) * 30,
                y + (Math.random() - 0.5) * 20,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                config.particleColor,
                size,
                config.particleLifetime
            );

            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
                particle.setGravity(-0.03);
                particle.setFriction(0.99);
            }
        }
    }

    /**
     * 创建护盾破碎效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createShieldBreak(x, y) {
        const config = PARTICLE_EFFECTS.SHIELD_BREAK;

        for (let i = 0; i < config.fragmentCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
            const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
            const color = config.colors[Math.floor(Math.random() * config.colors.length)];

            const particle = this.createParticle(
                x,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                size,
                config.lifetime
            );

            if (particle) {
                particle.setKind(PARTICLES.KIND.SQUARE);
                particle.setGravity(config.gravity);
                particle.setFriction(0.96);
                particle.setRotationSpeed(0.1 + Math.random() * 0.2);
            }
        }
    }

    /**
     * 创建击杀吸收效果（光点飞向玩家）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} targetX - 目标X坐标
     * @param {number} targetY - 目标Y坐标
     */
    createKillAbsorb(x, y, targetX, targetY) {
        const config = PARTICLE_EFFECTS.KILL_ABSORB;

        for (let i = 0; i < config.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const startDist = 10 + Math.random() * 10;
            const startX = x + Math.cos(angle) * startDist;
            const startY = y + Math.sin(angle) * startDist;

            const dx = targetX - startX;
            const dy = targetY - startY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const velX = (dx / dist) * config.speed;
            const velY = (dy / dist) * config.speed;

            const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);

            const particle = this.createParticle(startX, startY, velX, velY, config.color, size, config.lifetime);

            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
                particle.targetX = targetX;
                particle.targetY = targetY;
                particle.attractSpeed = config.attractSpeed;
                particle.isAttracting = true;
            }
        }
    }

    /**
     * 创建怒气爆发效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createRageBurst(x, y) {
        const config = PARTICLE_EFFECTS.RAGE_BURST;

        // 红色火焰粒子
        for (let i = 0; i < config.flameCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
            const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
            const color = config.colors[Math.floor(Math.random() * config.colors.length)];

            const particle = this.createParticle(
                x,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                size,
                config.lifetime
            );

            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
                particle.setGravity(-0.05);
                particle.setFriction(0.97);
            }
        }

        // 多层红色光环
        for (let i = 0; i < config.ringCount; i++) {
            const delay = i * 100;

            this.addDelayedParticle(delay, () => {
                const particle = this.createParticle(x, y, 0, 0, config.ringColor, 15, 600);

                if (particle) {
                    particle.setKind(PARTICLES.KIND.RING);
                    particle.setExpandSpeed(config.ringExpandSpeed);
                    particle.setRingThickness(4);
                    particle.disableShrink();
                }
            });
        }
    }

    /**
     * 创建传送门漩涡效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createPortalVortex(x, y) {
        const config = PARTICLE_EFFECTS.PORTAL_VORTEX;
        const time = Date.now() / 1000;

        for (let i = 0; i < config.particleCount; i++) {
            const angle = (i / config.particleCount) * Math.PI * 2 + time * config.rotationSpeed * 10;
            const radius = config.orbitRadius + Math.sin(time * 2 + i) * 5;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);

            const particle = this.createParticle(px, py, 0, 0, config.color, size, config.lifetime);

            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
                particle.enableFlicker(0.2);
                particle.orbitAngle = angle;
                particle.orbitRadius = radius;
                particle.orbitCenterX = x;
                particle.orbitCenterY = y;
                particle.isOrbiting = true;
                particle.orbitSpeed = config.rotationSpeed;
            }
        }
    }

    /**
     * 创建宝箱金光效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createChestGlow(x, y) {
        const config = PARTICLE_EFFECTS.CHEST_GLOW;

        // 金色光柱粒子
        for (let i = 0; i < config.beamCount; i++) {
            const angle = -Math.PI / 2 + (i / config.beamCount - 0.5) * 0.5;
            const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);

            const particle = this.createParticle(
                x + (Math.random() - 0.5) * 20,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                config.particleColor,
                config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin),
                config.lifetime
            );

            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
                particle.setGravity(-0.02);
                particle.setFriction(0.99);
            }
        }

        // 向四周散开的金色粒子
        for (let i = 0; i < config.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);

            const particle = this.createParticle(
                x,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                config.particleColor,
                config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin),
                config.lifetime
            );

            if (particle) {
                particle.setKind(PARTICLES.KIND.STAR);
                particle.setRotationSpeed(0.1 + Math.random() * 0.15);
                particle.setFriction(0.97);
            }
        }
    }

    /**
     * 创建地面裂痕效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createGroundCrack(x, y) {
        const config = PARTICLE_EFFECTS.GROUND_CRACK;

        // 放射状裂痕
        for (let i = 0; i < config.crackCount; i++) {
            const angle = (i / config.crackCount) * Math.PI * 2 + Math.random() * 0.3;
            const length = config.crackLength * (0.5 + Math.random() * 0.5);

            const particle = this.createParticle(
                x + (Math.cos(angle) * length) / 2,
                y + (Math.sin(angle) * length) / 2,
                0,
                0,
                config.color,
                config.crackWidth,
                config.lifetime
            );

            if (particle) {
                particle.setKind(PARTICLES.KIND.SQUARE);
                particle.crackAngle = angle;
                particle.crackLength = length;
                particle.isCrack = true;
                particle.disableShrink();
            }
        }

        // 碎片粒子
        for (let i = 0; i < config.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;

            const particle = this.createParticle(
                x,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                config.particleColor,
                2 + Math.random() * 3,
                config.lifetime * 0.7
            );

            if (particle) {
                particle.setKind(PARTICLES.KIND.SQUARE);
                particle.setGravity(0.15);
                particle.setFriction(0.95);
            }
        }
    }

    /**
     * 创建元素附着效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} elementType - 元素类型 (fire/ice/poison)
     */
    createElementalAttach(x, y, elementType) {
        const config = PARTICLE_EFFECTS.ELEMENTAL_ATTACH[elementType.toUpperCase()];
        if (!config) {
            return;
        }

        for (let i = 0; i < config.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 8 + Math.random() * 8;
            const px = x + Math.cos(angle) * dist;
            const py = y + Math.sin(angle) * dist;
            const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);

            const particle = this.createParticle(
                px,
                py,
                (Math.random() - 0.5) * 0.5,
                config.gravity > 0 ? 0.5 : -0.5,
                config.color,
                size,
                300 + Math.random() * 200
            );

            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
                particle.setGravity(config.gravity);
                particle.setFriction(0.98);
                particle.attachTargetX = x;
                particle.attachTargetY = y;
                particle.isAttached = true;
            }
        }
    }

    /**
     * 创建残影拖尾效果
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} color - 颜色
     * @param {number} size - 尺寸
     */
    createAfterimage(x, y, color, size) {
        const config = PARTICLE_EFFECTS.AFTERIMAGE;

        const particle = this.createParticle(x, y, 0, 0, color, size * config.sizeScale, 200);

        if (particle) {
            particle.setKind(PARTICLES.KIND.CIRCLE);
            particle.disableShrink();
            particle.alpha = config.alphaStart;
        }
    }
}

/**
 * 环境灰尘粒子渲染辅助函数
 * 在粒子渲染循环中调用，用于渲染灰尘粒子
 * @param {CanvasRenderingContext2D} ctx - 渲染上下文
 * @param {Particle} particle - 粒子对象
 */
function renderDustParticle(ctx, particle) {
    const alpha = particle.getAlpha();
    ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
}
