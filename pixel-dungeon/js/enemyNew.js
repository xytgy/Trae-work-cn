/**
 * 新敌人系统
 * 实现5种新敌人：骷髅兵、弓箭手、法师、炸弹怪、精英怪
 */

/**
 * 骷髅兵
 * 近战，举盾牌减伤
 */
class Skeleton extends Enemy {
    constructor(x, y, { eventBus } = {}) {
        const config = {
            size: NEW_ENEMIES.SKELETON.SIZE,
            color: NEW_ENEMIES.SKELETON.COLOR,
            health: NEW_ENEMIES.SKELETON.HEALTH,
            speed: NEW_ENEMIES.SKELETON.SPEED,
            damage: NEW_ENEMIES.SKELETON.DAMAGE,
            dropRate: NEW_ENEMIES.SKELETON.DROP_RATE,
            attackRange: NEW_ENEMIES.SKELETON.ATTACK_RANGE,
            attackCooldown: NEW_ENEMIES.SKELETON.ATTACK_COOLDOWN,
            ai: 'tank'
        };
        super(x, y, config, 1, 1, { eventBus });

        this.boneColor = NEW_ENEMIES.SKELETON.BONE_COLOR;
        this.shieldColor = NEW_ENEMIES.SKELETON.SHIELD_COLOR;
        this.shieldUp = true;
        this.shieldAngle = 0;
        this.attackAnimation = 0;
        this.isAttacking = false;
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);

        const dx = player.x - this.x;
        this.shieldAngle = Math.atan2(0, dx);

        if (this.isAttacking) {
            this.attackAnimation -= deltaTime;
            if (this.attackAnimation <= 0) {
                this.isAttacking = false;
            }
        }
    }

    takeDamage(damage, knockbackDirection, knockbackForce) {
        let actualDamage = damage;

        if (this.shieldUp && knockbackDirection) {
            const dx = knockbackDirection.x;
            if (Math.abs(dx) > 0.5) {
                actualDamage *= NEW_ENEMIES.SKELETON.SHIELD_DAMAGE_REDUCTION;
                this.spawnBlockParticles();
            }
        }

        super.takeDamage(actualDamage, knockbackDirection, knockbackForce);
    }

    spawnBlockParticles() {
        if (typeof gameLogic !== 'undefined' && gameLogic.particles) {
            for (let i = 0; i < 5; i++) {
                gameLogic.particles.push(
                    new Particle(
                        this.x,
                        this.y,
                        (Math.random() - 0.5) * 3,
                        -1 - Math.random() * 2,
                        '#daa520',
                        2 + Math.random() * 2,
                        300 + Math.random() * 200
                    )
                );
            }
        }
    }

    executeAI(deltaTime, player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > this.attackRange) {
            if (dist > 0) {
                this.x += (dx / dist) * this.speed * this.slowFactor;
                this.y += (dy / dist) * this.speed * this.slowFactor;
            }
        } else {
            if (this.lastAttackTime <= 0) {
                this.lastAttackTime = this.attackCooldown;
                this.isAttacking = true;
                this.attackAnimation = 200;
            }
        }

        this.lastAttackTime -= deltaTime;
    }

    render() {
        const ctx = renderer.ctx;
        const size = this.size;
        const halfSize = size / 2;

        let bodyColor = this.color;
        if (this.isHurt) {
            bodyColor = '#ff0000';
        } else if (this.isFrozen) {
            bodyColor = COLORS.BULLET.FREEZE;
        }

        ctx.save();

        ctx.fillStyle = bodyColor;
        ctx.fillRect(this.x - halfSize / 2, this.y - halfSize, halfSize, size * 0.7);

        ctx.fillStyle = this.boneColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y - halfSize + 4, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - halfSize + 3, 1.5, 0, Math.PI * 2);
        ctx.arc(this.x + 2, this.y - halfSize + 3, 1.5, 0, Math.PI * 2);
        ctx.fill();

        const shieldX = this.x + halfSize / 2 + 2;
        const shieldY = this.y;
        ctx.fillStyle = this.shieldColor;
        ctx.beginPath();
        ctx.ellipse(shieldX, shieldY, 5, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#daa520';
        ctx.beginPath();
        ctx.arc(shieldX, shieldY, 2, 0, Math.PI * 2);
        ctx.fill();

        const swordAngle = this.isAttacking ? -Math.PI / 4 : Math.PI / 6;
        ctx.save();
        ctx.translate(this.x - halfSize / 2 - 2, this.y);
        ctx.rotate(swordAngle);
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(-2, -12, 4, 14);
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(-3, 2, 6, 3);
        ctx.restore();

        ctx.restore();

        this.renderHealthBar();
    }

    renderHealthBar() {
        if (this.health >= this.maxHealth) {return;}

        const barWidth = ENEMY_HEALTH_BAR.WIDTH;
        const barHeight = ENEMY_HEALTH_BAR.HEIGHT;
        const x = this.x - barWidth / 2;
        const y = this.y - this.size / 2 - ENEMY_HEALTH_BAR.Y_OFFSET;

        renderer.drawRect(x, y, barWidth, barHeight, ENEMY_HEALTH_BAR.BG_COLOR);

        const healthPercent = Math.max(0, this.health / this.maxHealth);

        let barColor = ENEMY_HEALTH_BAR.COLOR_HIGH;
        if (healthPercent < ENEMY_HEALTH_BAR.LOW_THRESHOLD) {
            barColor = ENEMY_HEALTH_BAR.COLOR_LOW;
        } else if (healthPercent < ENEMY_HEALTH_BAR.MID_THRESHOLD) {
            barColor = ENEMY_HEALTH_BAR.COLOR_MID;
        }

        renderer.drawRect(x, y, barWidth * healthPercent, barHeight, barColor);
        renderer.drawRectOutline(x, y, barWidth, barHeight, ENEMY_HEALTH_BAR.BORDER_COLOR, 1);
    }
}

/**
 * 弓箭手
 * 远程射箭，保持距离
 */
class Archer extends Enemy {
    constructor(x, y, { eventBus } = {}) {
        const config = {
            size: NEW_ENEMIES.ARCHER.SIZE,
            color: NEW_ENEMIES.ARCHER.COLOR,
            health: NEW_ENEMIES.ARCHER.HEALTH,
            speed: NEW_ENEMIES.ARCHER.SPEED,
            damage: NEW_ENEMIES.ARCHER.DAMAGE,
            dropRate: NEW_ENEMIES.ARCHER.DROP_RATE,
            attackRange: NEW_ENEMIES.ARCHER.ATTACK_RANGE,
            attackCooldown: NEW_ENEMIES.ARCHER.ATTACK_COOLDOWN,
            ai: 'ranger'
        };
        super(x, y, config, 1, 1, { eventBus });

        this.bowColor = NEW_ENEMIES.ARCHER.BOW_COLOR;
        this.arrowColor = NEW_ENEMIES.ARCHER.ARROW_COLOR;
        this.bulletSpeed = NEW_ENEMIES.ARCHER.BULLET_SPEED;
        this.keepDistance = NEW_ENEMIES.ARCHER.KEEP_DISTANCE;
        this.shootTimer = 0;
    }

    executeAI(deltaTime, player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.keepDistance - 30) {
            if (dist > 0) {
                this.x -= (dx / dist) * this.speed * this.slowFactor;
                this.y -= (dy / dist) * this.speed * this.slowFactor;
            }
        } else if (dist > this.keepDistance + 30) {
            if (dist > 0) {
                this.x += (dx / dist) * this.speed * 0.5 * this.slowFactor;
                this.y += (dy / dist) * this.speed * 0.5 * this.slowFactor;
            }
        }

        this.shootTimer -= deltaTime;
        if (this.shootTimer <= 0 && dist < this.attackRange && dist > 50) {
            this.shootTimer = this.attackCooldown;
            this.shoot(player);
        }
    }

    shoot(player) {
        if (typeof gameLogic === 'undefined') {return;}

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            const bullet = new Bullet(this.x, this.y, dx / dist, dy / dist, {
                damage: this.damage,
                speed: this.bulletSpeed,
                isEnemyBullet: true,
                color: this.arrowColor
            });
            bullet.isEnemyBullet = true;
            gameLogic.bullets.push(bullet);
        }
    }

    render() {
        const ctx = renderer.ctx;
        const size = this.size;
        const halfSize = size / 2;

        let bodyColor = this.color;
        if (this.isHurt) {
            bodyColor = '#ff0000';
        } else if (this.isFrozen) {
            bodyColor = COLORS.BULLET.FREEZE;
        }

        ctx.save();

        ctx.fillStyle = bodyColor;
        ctx.fillRect(this.x - halfSize / 2, this.y - halfSize / 2, halfSize, size * 0.7);

        ctx.fillStyle = '#deb887';
        ctx.beginPath();
        ctx.arc(this.x, this.y - halfSize / 2, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#228b22';
        ctx.beginPath();
        ctx.arc(this.x, this.y - halfSize / 2 - 2, 5, Math.PI, Math.PI * 2);
        ctx.fill();

        const bowSide = 1;
        const bowX = this.x + (halfSize / 2) * bowSide;
        ctx.strokeStyle = this.bowColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bowX, this.y, 8, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();

        ctx.strokeStyle = '#f5f5dc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bowX, this.y - 7);
        ctx.lineTo(bowX, this.y + 7);
        ctx.stroke();

        ctx.restore();

        this.renderHealthBar();
    }

    renderHealthBar() {
        if (this.health >= this.maxHealth) {return;}

        const barWidth = ENEMY_HEALTH_BAR.WIDTH;
        const barHeight = ENEMY_HEALTH_BAR.HEIGHT;
        const x = this.x - barWidth / 2;
        const y = this.y - this.size / 2 - ENEMY_HEALTH_BAR.Y_OFFSET;

        renderer.drawRect(x, y, barWidth, barHeight, ENEMY_HEALTH_BAR.BG_COLOR);

        const healthPercent = Math.max(0, this.health / this.maxHealth);

        let barColor = ENEMY_HEALTH_BAR.COLOR_HIGH;
        if (healthPercent < ENEMY_HEALTH_BAR.LOW_THRESHOLD) {
            barColor = ENEMY_HEALTH_BAR.COLOR_LOW;
        } else if (healthPercent < ENEMY_HEALTH_BAR.MID_THRESHOLD) {
            barColor = ENEMY_HEALTH_BAR.COLOR_MID;
        }

        renderer.drawRect(x, y, barWidth * healthPercent, barHeight, barColor);
        renderer.drawRectOutline(x, y, barWidth, barHeight, ENEMY_HEALTH_BAR.BORDER_COLOR, 1);
    }
}

/**
 * 法师
 * 远程魔法弹
 */
class Mage extends Enemy {
    constructor(x, y, { eventBus } = {}) {
        const config = {
            size: NEW_ENEMIES.MAGE.SIZE,
            color: NEW_ENEMIES.MAGE.COLOR,
            health: NEW_ENEMIES.MAGE.HEALTH,
            speed: NEW_ENEMIES.MAGE.SPEED,
            damage: NEW_ENEMIES.MAGE.DAMAGE,
            dropRate: NEW_ENEMIES.MAGE.DROP_RATE,
            attackRange: NEW_ENEMIES.MAGE.ATTACK_RANGE,
            attackCooldown: NEW_ENEMIES.MAGE.ATTACK_COOLDOWN,
            ai: 'caster'
        };
        super(x, y, config, 1, 1, { eventBus });

        this.robeColor = NEW_ENEMIES.MAGE.ROBE_COLOR;
        this.magicColor = NEW_ENEMIES.MAGE.MAGIC_COLOR;
        this.bulletSpeed = NEW_ENEMIES.MAGE.BULLET_SPEED;
        this.keepDistance = NEW_ENEMIES.MAGE.KEEP_DISTANCE;
        this.castTimer = 0;
        this.isCasting = false;
        this.magicCharge = 0;
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);

        if (this.isCasting) {
            this.magicCharge += deltaTime;
            if (typeof gameLogic !== 'undefined' && gameLogic.particles && Math.random() < 0.3) {
                gameLogic.particles.push(
                    new Particle(
                        this.x + (Math.random() - 0.5) * 20,
                        this.y - 10,
                        (Math.random() - 0.5) * 1,
                        -1 - Math.random(),
                        this.magicColor,
                        2 + Math.random() * 2,
                        300 + Math.random() * 200
                    )
                );
            }
        }
    }

    executeAI(deltaTime, player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.keepDistance - 40) {
            if (dist > 0) {
                this.x -= (dx / dist) * this.speed * this.slowFactor;
                this.y -= (dy / dist) * this.speed * this.slowFactor;
            }
        } else if (dist > this.keepDistance + 40) {
            if (dist > 0) {
                this.x += (dx / dist) * this.speed * 0.4 * this.slowFactor;
                this.y += (dy / dist) * this.speed * 0.4 * this.slowFactor;
            }
        }

        this.castTimer -= deltaTime;
        if (this.castTimer <= 0 && dist < this.attackRange && dist > 60) {
            this.castTimer = this.attackCooldown;
            this.isCasting = true;
            this.magicCharge = 0;

            setTimeout(() => {
                if (this.alive) {
                    this.castMagic(player);
                    this.isCasting = false;
                }
            }, 500);
        }
    }

    castMagic(player) {
        if (typeof gameLogic === 'undefined') {return;}

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            const bullet = new Bullet(this.x, this.y - 5, dx / dist, dy / dist, {
                damage: this.damage,
                speed: this.bulletSpeed,
                isEnemyBullet: true,
                color: this.magicColor
            });
            bullet.isEnemyBullet = true;
            gameLogic.bullets.push(bullet);
        }
    }

    render() {
        const ctx = renderer.ctx;
        const size = this.size;
        const halfSize = size / 2;

        let bodyColor = this.robeColor;
        if (this.isHurt) {
            bodyColor = '#ff0000';
        } else if (this.isFrozen) {
            bodyColor = COLORS.BULLET.FREEZE;
        }

        ctx.save();

        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.moveTo(this.x - halfSize / 2 - 2, this.y + halfSize / 2);
        ctx.lineTo(this.x, this.y - halfSize / 2);
        ctx.lineTo(this.x + halfSize / 2 + 2, this.y + halfSize / 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f5f5dc';
        ctx.beginPath();
        ctx.arc(this.x, this.y - halfSize / 2 + 2, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x - 8, this.y - halfSize / 2);
        ctx.lineTo(this.x, this.y - halfSize - 4);
        ctx.lineTo(this.x + 8, this.y - halfSize / 2);
        ctx.closePath();
        ctx.fill();

        const staffX = this.x + halfSize / 2 + 2;
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(staffX - 1, this.y - 10, 2, 20);

        const orbGlow = this.isCasting ? 1 + Math.sin(this.magicCharge / 50) * 0.3 : 1;
        ctx.fillStyle = this.magicColor;
        ctx.beginPath();
        ctx.arc(staffX, this.y - 12, 4 * orbGlow, 0, Math.PI * 2);
        ctx.fill();

        if (this.isCasting) {
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(staffX, this.y - 12, 8 * orbGlow, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        ctx.restore();

        this.renderHealthBar();
    }

    renderHealthBar() {
        if (this.health >= this.maxHealth) {return;}

        const barWidth = ENEMY_HEALTH_BAR.WIDTH;
        const barHeight = ENEMY_HEALTH_BAR.HEIGHT;
        const x = this.x - barWidth / 2;
        const y = this.y - this.size / 2 - ENEMY_HEALTH_BAR.Y_OFFSET;

        renderer.drawRect(x, y, barWidth, barHeight, ENEMY_HEALTH_BAR.BG_COLOR);

        const healthPercent = Math.max(0, this.health / this.maxHealth);

        let barColor = ENEMY_HEALTH_BAR.COLOR_HIGH;
        if (healthPercent < ENEMY_HEALTH_BAR.LOW_THRESHOLD) {
            barColor = ENEMY_HEALTH_BAR.COLOR_LOW;
        } else if (healthPercent < ENEMY_HEALTH_BAR.MID_THRESHOLD) {
            barColor = ENEMY_HEALTH_BAR.COLOR_MID;
        }

        renderer.drawRect(x, y, barWidth * healthPercent, barHeight, barColor);
        renderer.drawRectOutline(x, y, barWidth, barHeight, ENEMY_HEALTH_BAR.BORDER_COLOR, 1);
    }
}

/**
 * 炸弹怪
 * 接近后爆炸
 */
class Bomber extends Enemy {
    constructor(x, y, { eventBus } = {}) {
        const config = {
            size: NEW_ENEMIES.BOMBER.SIZE,
            color: NEW_ENEMIES.BOMBER.COLOR,
            health: NEW_ENEMIES.BOMBER.HEALTH,
            speed: NEW_ENEMIES.BOMBER.SPEED,
            damage: NEW_ENEMIES.BOMBER.DAMAGE,
            dropRate: NEW_ENEMIES.BOMBER.DROP_RATE,
            attackRange: NEW_ENEMIES.BOMBER.ATTACK_RANGE,
            attackCooldown: NEW_ENEMIES.BOMBER.ATTACK_COOLDOWN,
            ai: 'suicide'
        };
        super(x, y, config, 1, 1, { eventBus });

        this.bombColor = NEW_ENEMIES.BOMBER.BOMB_COLOR;
        this.fuseColor = NEW_ENEMIES.BOMBER.FUSE_COLOR;
        this.explosionRadius = NEW_ENEMIES.BOMBER.EXPLOSION_RADIUS;
        this.fuseTimer = 0;
        this.isPrimed = false;
        this.hasExploded = false;
    }

    executeAI(deltaTime, player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (!this.isPrimed) {
            if (dist > 0) {
                this.x += (dx / dist) * this.speed * this.slowFactor;
                this.y += (dy / dist) * this.speed * this.slowFactor;
            }

            if (dist < this.attackRange) {
                this.isPrimed = true;
                this.fuseTimer = 1000;
            }
        } else {
            this.fuseTimer -= deltaTime;

            if (typeof gameLogic !== 'undefined' && gameLogic.particles && Math.random() < 0.5) {
                gameLogic.particles.push(
                    new Particle(
                        this.x,
                        this.y - this.size / 2,
                        (Math.random() - 0.5) * 1,
                        -2 - Math.random() * 2,
                        '#ffff00',
                        2 + Math.random() * 2,
                        200 + Math.random() * 100
                    )
                );
            }

            if (this.fuseTimer <= 0 && !this.hasExploded) {
                this.explode();
            }
        }
    }

    explode() {
        this.hasExploded = true;
        this.alive = false;

        if (typeof gameLogic === 'undefined') {return;}

        const player = gameLogic.player;
        if (player) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.explosionRadius && gameState && !gameState.getData().isInvincible) {
                gameState.playerHurt(this.damage);
                gameLogic.rageSystem.onHurt();
                camera.shake(5, 300);
            }
        }

        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            gameLogic.particles.push(
                new Particle(
                    this.x,
                    this.y,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    Math.random() < 0.5 ? '#ff4500' : '#ffff00',
                    4 + Math.random() * 4,
                    400 + Math.random() * 300
                )
            );
        }
    }

    takeDamage(damage, knockbackDirection, knockbackForce) {
        super.takeDamage(damage, knockbackDirection, knockbackForce);

        if (!this.alive && !this.hasExploded) {
            this.explode();
        }
    }

    render() {
        if (!this.alive) {return;}

        const ctx = renderer.ctx;
        const size = this.size;
        const halfSize = size / 2;

        let bodyColor = this.color;
        if (this.isHurt) {
            bodyColor = '#ff0000';
        } else if (this.isFrozen) {
            bodyColor = COLORS.BULLET.FREEZE;
        }

        ctx.save();

        const wobble = Math.sin(this.animTimer / 100) * 1;

        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y + wobble, halfSize - 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.bombColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y + wobble, halfSize - 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x - 4, this.y - 2 + wobble, 3, 0, Math.PI * 2);
        ctx.arc(this.x + 4, this.y - 2 + wobble, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x - 4, this.y - 2 + wobble, 1.5, 0, Math.PI * 2);
        ctx.arc(this.x + 4, this.y - 2 + wobble, 1.5, 0, Math.PI * 2);
        ctx.fill();

        const fuseGlow = this.isPrimed ? (Math.sin(this.fuseTimer / 50) > 0 ? 1 : 0.5) : 0;
        ctx.fillStyle = this.fuseColor;
        ctx.fillRect(this.x - 1, this.y - halfSize + 2 + wobble, 2, 6);

        if (this.isPrimed) {
            ctx.fillStyle = `rgba(255, 255, 0, ${fuseGlow})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y - halfSize + 2 + wobble, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        this.renderHealthBar();
    }

    renderHealthBar() {
        if (this.health >= this.maxHealth) {return;}

        const barWidth = ENEMY_HEALTH_BAR.WIDTH;
        const barHeight = ENEMY_HEALTH_BAR.HEIGHT;
        const x = this.x - barWidth / 2;
        const y = this.y - this.size / 2 - ENEMY_HEALTH_BAR.Y_OFFSET;

        renderer.drawRect(x, y, barWidth, barHeight, ENEMY_HEALTH_BAR.BG_COLOR);

        const healthPercent = Math.max(0, this.health / this.maxHealth);

        let barColor = ENEMY_HEALTH_BAR.COLOR_HIGH;
        if (healthPercent < ENEMY_HEALTH_BAR.LOW_THRESHOLD) {
            barColor = ENEMY_HEALTH_BAR.COLOR_LOW;
        } else if (healthPercent < ENEMY_HEALTH_BAR.MID_THRESHOLD) {
            barColor = ENEMY_HEALTH_BAR.COLOR_MID;
        }

        renderer.drawRect(x, y, barWidth * healthPercent, barHeight, barColor);
        renderer.drawRectOutline(x, y, barWidth, barHeight, ENEMY_HEALTH_BAR.BORDER_COLOR, 1);
    }
}

/**
 * 精英怪
 * 强力敌人，变大，掉落好东西
 */
class EliteEnemy extends Enemy {
    constructor(x, y, { eventBus } = {}) {
        const config = {
            size: NEW_ENEMIES.ELITE.SIZE,
            color: NEW_ENEMIES.ELITE.COLOR,
            health: NEW_ENEMIES.ELITE.HEALTH,
            speed: NEW_ENEMIES.ELITE.SPEED,
            damage: NEW_ENEMIES.ELITE.DAMAGE,
            dropRate: NEW_ENEMIES.ELITE.DROP_RATE,
            attackRange: NEW_ENEMIES.ELITE.ATTACK_RANGE,
            attackCooldown: NEW_ENEMIES.ELITE.ATTACK_COOLDOWN,
            ai: 'berserker'
        };
        super(x, y, config, 1, 1, { eventBus });

        this.armorColor = NEW_ENEMIES.ELITE.ARMOR_COLOR;
        this.eyeColor = NEW_ENEMIES.ELITE.EYE_COLOR;
        this.dropQualityBoost = NEW_ENEMIES.ELITE.DROP_QUALITY_BOOST;
        this.rageMode = false;
        this.rageTimer = 0;
        this.attackAnimation = 0;
        this.isAttacking = false;
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);

        const healthPercent = this.health / this.maxHealth;
        if (healthPercent < 0.3 && !this.rageMode) {
            this.rageMode = true;
            this.speed = this.baseSpeed * 1.5;
        }

        if (this.isAttacking) {
            this.attackAnimation -= deltaTime;
            if (this.attackAnimation <= 0) {
                this.isAttacking = false;
            }
        }
    }

    executeAI(deltaTime, player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > this.attackRange) {
            if (dist > 0) {
                this.x += (dx / dist) * this.speed * this.slowFactor;
                this.y += (dy / dist) * this.speed * this.slowFactor;
            }
        } else {
            if (this.lastAttackTime <= 0) {
                this.lastAttackTime = this.attackCooldown;
                this.isAttacking = true;
                this.attackAnimation = 300;

                if (gameState && !gameState.getData().isInvincible) {
                    gameState.playerHurt(this.damage);
                    if (typeof gameLogic !== 'undefined') {
                        gameLogic.rageSystem.onHurt();
                    }
                    camera.shake(3, 200);
                }
            }
        }

        this.lastAttackTime -= deltaTime;
    }

    render() {
        const ctx = renderer.ctx;
        const size = this.size;
        const halfSize = size / 2;

        let bodyColor = this.color;
        if (this.isHurt) {
            bodyColor = '#ffffff';
        } else if (this.isFrozen) {
            bodyColor = COLORS.BULLET.FREEZE;
        } else if (this.rageMode) {
            bodyColor = '#ff3333';
        }

        ctx.save();

        const scale = this.isAttacking ? 1.1 : 1;
        ctx.translate(this.x, this.y);
        ctx.scale(scale, scale);
        ctx.translate(-this.x, -this.y);

        ctx.fillStyle = bodyColor;
        ctx.fillRect(this.x - halfSize + 4, this.y - halfSize + 4, size - 8, size - 8);

        ctx.fillStyle = this.armorColor;
        ctx.fillRect(this.x - halfSize, this.y - halfSize + 8, size, 6);
        ctx.fillRect(this.x - halfSize + 8, this.y + halfSize - 10, size - 16, 6);

        ctx.fillStyle = this.armorColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y - halfSize + 6, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.eyeColor;
        ctx.beginPath();
        ctx.arc(this.x - 4, this.y - halfSize + 5, 3, 0, Math.PI * 2);
        ctx.arc(this.x + 4, this.y - halfSize + 5, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x - 4, this.y - halfSize + 5, 1.5, 0, Math.PI * 2);
        ctx.arc(this.x + 4, this.y - halfSize + 5, 1.5, 0, Math.PI * 2);
        ctx.fill();

        const weaponX = this.x + halfSize - 2;
        const weaponAngle = this.isAttacking ? -Math.PI / 3 : Math.PI / 4;
        ctx.save();
        ctx.translate(weaponX, this.y);
        ctx.rotate(weaponAngle);
        ctx.fillStyle = '#808080';
        ctx.fillRect(-3, -20, 6, 24);
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(-4, -22, 8, 4);
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(-4, 4, 8, 4);
        ctx.restore();

        if (this.rageMode) {
            ctx.globalAlpha = 0.3 + Math.sin(this.animTimer / 100) * 0.2;
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, halfSize + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        ctx.restore();

        this.renderHealthBar();
    }

    renderHealthBar() {
        if (this.health >= this.maxHealth) {return;}

        const barWidth = 50;
        const barHeight = 6;
        const x = this.x - barWidth / 2;
        const y = this.y - this.size / 2 - 20;

        renderer.drawRect(x, y, barWidth, barHeight, ENEMY_HEALTH_BAR.BG_COLOR);

        const healthPercent = Math.max(0, this.health / this.maxHealth);

        let barColor = '#ff6600';
        if (healthPercent < ENEMY_HEALTH_BAR.LOW_THRESHOLD) {
            barColor = ENEMY_HEALTH_BAR.COLOR_LOW;
        } else if (healthPercent < ENEMY_HEALTH_BAR.MID_THRESHOLD) {
            barColor = ENEMY_HEALTH_BAR.COLOR_MID;
        }

        renderer.drawRect(x, y, barWidth * healthPercent, barHeight, barColor);
        renderer.drawRectOutline(x, y, barWidth, barHeight, ENEMY_HEALTH_BAR.BORDER_COLOR, 1);

        renderer.drawCenteredText('精英', this.x, y - 8, '#ff6600', 'bold 10px "Courier New", monospace');
    }
}
