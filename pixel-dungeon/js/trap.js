/**
 * 陷阱系统
 * 实现6种不同类型的陷阱：地刺、火焰、毒雾、冰冻、落石、传送
 */

/**
 * 陷阱基类
 * 所有陷阱的父类，包含通用属性和方法
 */
class Trap {
    /**
     * 构造函数
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} type - 陷阱类型
     */
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.active = true;
        this.visible = true;
        this.cooldown = 0;
        this.cooldownMax = 2000;
        this.damage = 1;
        this.size = 32;
        this.triggered = false;
        this.activeTimer = 0;
        this.animTimer = 0;
        this.config = this.getConfig();
    }

    /**
     * 获取陷阱配置
     * @returns {Object} 陷阱配置
     */
    getConfig() {
        switch (this.type) {
            case TRAP_TYPES.SPIKE:
                return TRAPS.SPIKE;
            case TRAP_TYPES.FIRE:
                return TRAPS.FIRE;
            case TRAP_TYPES.POISON:
                return TRAPS.POISON;
            case TRAP_TYPES.ICE:
                return TRAPS.ICE;
            case TRAP_TYPES.ROCK:
                return TRAPS.ROCK;
            case TRAP_TYPES.TELEPORT:
                return TRAPS.TELEPORT;
            default:
                return TRAPS.SPIKE;
        }
    }

    /**
     * 更新陷阱
     * @param {number} deltaTime - 时间增量
     * @param {Player} player - 玩家引用
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    update(deltaTime, player, gameLogic) {
        if (!this.active) {return;}

        this.animTimer += deltaTime;

        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
        }

        if (this.activeTimer > 0) {
            this.activeTimer -= deltaTime;
            this.checkEffect(player, gameLogic);
        }

        if (this.cooldown <= 0 && this.activeTimer <= 0) {
            this.tryTrigger(player, gameLogic);
        }
    }

    /**
     * 尝试触发陷阱
     * @param {Player} player - 玩家引用
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    tryTrigger(player, gameLogic) {
        if (this.checkCollision(player)) {
            this.trigger(player, gameLogic);
        }
    }

    /**
     * 检查玩家与陷阱碰撞
     * @param {Player} player - 玩家引用
     * @returns {boolean} 是否碰撞
     */
    checkCollision(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const collisionRadius = this.size / 2 + PLAYER.SIZE / 2;
        return distance < collisionRadius;
    }

    /**
     * 触发陷阱
     * @param {Player} player - 玩家引用
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    trigger(player, gameLogic) {
        this.triggered = true;
        this.activeTimer = this.config.ACTIVE_DURATION;
        this.cooldown = this.config.COOLDOWN;
    }

    /**
     * 检查陷阱效果
     * @param {Player} player - 玩家引用
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    checkEffect(player, gameLogic) {
        if (this.checkCollision(player)) {
            this.applyEffect(player, gameLogic);
        }
    }

    /**
     * 应用陷阱效果（子类重写）
     * @param {Player} player - 玩家引用
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    applyEffect(player, gameLogic) {}

    /**
     * 渲染陷阱
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     */
    render(ctx) {
        if (!this.active) {return;}
        if (!this.config.VISIBLE && this.activeTimer <= 0) {return;}
    }
}

/**
 * 地刺陷阱
 * 踩上扣1血，有弹出动画
 */
class SpikeTrap extends Trap {
    constructor(x, y) {
        super(x, y, TRAP_TYPES.SPIKE);
        this.spikeHeight = 0;
        this.maxSpikeHeight = 16;
    }

    update(deltaTime, player, gameLogic) {
        super.update(deltaTime, player, gameLogic);

        if (this.activeTimer > 0) {
            const progress = 1 - this.activeTimer / this.config.ACTIVE_DURATION;
            if (progress < 0.3) {
                this.spikeHeight = (progress / 0.3) * this.maxSpikeHeight;
            } else if (progress > 0.7) {
                this.spikeHeight = ((1 - progress) / 0.3) * this.maxSpikeHeight;
            } else {
                this.spikeHeight = this.maxSpikeHeight;
            }
        } else {
            this.spikeHeight = 0;
        }
    }

    applyEffect(player, gameLogic) {
        if (gameState && !gameState.getData().isInvincible) {
            gameState.playerHurt(this.config.DAMAGE);
            gameLogic.rageSystem.onHurt();
            camera.shake(2, 150);
            this.spawnHitParticles(gameLogic);
        }
    }

    spawnHitParticles(gameLogic) {
        for (let i = 0; i < 5; i++) {
            gameLogic.particles.push(
                new Particle(
                    this.x + (Math.random() - 0.5) * 20,
                    this.y - this.spikeHeight,
                    (Math.random() - 0.5) * 3,
                    -2 - Math.random() * 2,
                    '#c0c0c0',
                    2 + Math.random() * 2,
                    300 + Math.random() * 200
                )
            );
        }
    }

    render(ctx) {
        super.render(ctx);

        const size = this.size;
        const halfSize = size / 2;

        ctx.fillStyle = this.config.COLOR;
        ctx.fillRect(this.x - halfSize, this.y - 4, size, 8);

        if (this.spikeHeight > 0) {
            ctx.fillStyle = this.config.SPIKE_COLOR;
            const spikeCount = 4;
            const spikeWidth = size / spikeCount;

            for (let i = 0; i < spikeCount; i++) {
                const sx = this.x - halfSize + i * spikeWidth + spikeWidth / 2;
                ctx.beginPath();
                ctx.moveTo(sx - spikeWidth / 2 + 2, this.y - 4);
                ctx.lineTo(sx, this.y - 4 - this.spikeHeight);
                ctx.lineTo(sx + spikeWidth / 2 - 2, this.y - 4);
                ctx.fill();
            }
        }

        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - halfSize + 0.5, this.y - 4.5, size - 1, 8);
    }
}

/**
 * 火焰陷阱
 * 周期性喷火
 */
class FireTrap extends Trap {
    constructor(x, y) {
        super(x, y, TRAP_TYPES.FIRE);
        this.flameHeight = 0;
        this.maxFlameHeight = 30;
    }

    update(deltaTime, player, gameLogic) {
        super.update(deltaTime, player, gameLogic);

        if (this.activeTimer > 0) {
            const progress = 1 - this.activeTimer / this.config.ACTIVE_DURATION;
            if (progress < 0.2) {
                this.flameHeight = (progress / 0.2) * this.maxFlameHeight;
            } else if (progress > 0.8) {
                this.flameHeight = ((1 - progress) / 0.2) * this.maxFlameHeight;
            } else {
                this.flameHeight = this.maxFlameHeight;
            }

            if (Math.random() < 0.3) {
                gameLogic.particles.push(
                    new Particle(
                        this.x + (Math.random() - 0.5) * 16,
                        this.y - 10,
                        (Math.random() - 0.5) * 1,
                        -2 - Math.random() * 2,
                        Math.random() < 0.5 ? '#ff4500' : '#ffff00',
                        3 + Math.random() * 4,
                        200 + Math.random() * 200
                    )
                );
            }
        } else {
            this.flameHeight = 0;
        }
    }

    tryTrigger(player, gameLogic) {
        this.trigger(player, gameLogic);
    }

    applyEffect(player, gameLogic) {
        if (gameState && !gameState.getData().isInvincible) {
            if (!this.lastDamageTime || Date.now() - this.lastDamageTime > 300) {
                gameState.playerHurt(this.config.DAMAGE);
                gameLogic.rageSystem.onHurt();
                this.lastDamageTime = Date.now();
            }
        }
    }

    render(ctx) {
        super.render(ctx);

        const size = this.size;
        const halfSize = size / 2;

        ctx.fillStyle = this.config.COLOR;
        ctx.beginPath();
        ctx.arc(this.x, this.y, halfSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2a1a0a';
        ctx.beginPath();
        ctx.arc(this.x, this.y, halfSize - 4, 0, Math.PI * 2);
        ctx.fill();

        if (this.flameHeight > 0) {
            const flicker = Math.sin(this.animTimer / 50) * 3;

            const gradient = ctx.createRadialGradient(
                this.x,
                this.y - this.flameHeight / 2,
                0,
                this.x,
                this.y - this.flameHeight / 2,
                this.flameHeight / 2
            );
            gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(this.x - 12, this.y - 4);
            ctx.quadraticCurveTo(
                this.x - 8,
                this.y - this.flameHeight / 2,
                this.x,
                this.y - this.flameHeight + flicker
            );
            ctx.quadraticCurveTo(this.x + 8, this.y - this.flameHeight / 2, this.x + 12, this.y - 4);
            ctx.fill();
        }
    }
}

/**
 * 毒雾陷阱
 * 持续掉血的绿色雾气
 */
class PoisonTrap extends Trap {
    constructor(x, y) {
        super(x, y, TRAP_TYPES.POISON);
        this.poisonTimer = 0;
    }

    tryTrigger(player, gameLogic) {
        this.trigger(player, gameLogic);
    }

    applyEffect(player, gameLogic) {
        this.poisonTimer += 16;
        if (this.poisonTimer >= 1000) {
            this.poisonTimer = 0;
            if (gameState && !gameState.getData().isInvincible) {
                gameState.playerHurt(this.config.DAMAGE);
                gameLogic.rageSystem.onHurt();
            }
        }
    }

    update(deltaTime, player, gameLogic) {
        super.update(deltaTime, player, gameLogic);

        if (this.activeTimer > 0 && Math.random() < 0.2) {
            const angle = Math.random() * Math.PI * 2;
            const dist = (Math.random() * this.size) / 2;
            gameLogic.particles.push(
                new Particle(
                    this.x + Math.cos(angle) * dist,
                    this.y + Math.sin(angle) * dist,
                    (Math.random() - 0.5) * 0.5,
                    -0.5 - Math.random() * 0.5,
                    'rgba(50, 205, 50, 0.6)',
                    4 + Math.random() * 6,
                    800 + Math.random() * 600
                )
            );
        }
    }

    render(ctx) {
        super.render(ctx);

        const size = this.size;

        if (this.activeTimer > 0) {
            const pulse = Math.sin(this.animTimer / 300) * 0.1 + 0.5;

            ctx.fillStyle = `rgba(50, 205, 50, ${pulse * 0.3})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, size / 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = `rgba(34, 139, 34, ${pulse * 0.2})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, size / 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#2d5a2d';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1a3a1a';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * 冰冻陷阱
 * 减速50%
 */
class IceTrap extends Trap {
    constructor(x, y) {
        super(x, y, TRAP_TYPES.ICE);
        this.playerSlowed = false;
    }

    tryTrigger(player, gameLogic) {
        this.trigger(player, gameLogic);
    }

    applyEffect(player, gameLogic) {
        if (!this.playerSlowed) {
            this.playerSlowed = true;
            if (gameLogic.player) {
                gameLogic.player.speedMultiplier = this.config.SLOW_FACTOR;
                setTimeout(() => {
                    if (gameLogic.player) {
                        gameLogic.player.speedMultiplier = 1;
                    }
                    this.playerSlowed = false;
                }, this.config.SLOW_DURATION);
            }
        }
    }

    update(deltaTime, player, gameLogic) {
        super.update(deltaTime, player, gameLogic);

        if (this.activeTimer > 0 && Math.random() < 0.1) {
            gameLogic.particles.push(
                new Particle(
                    this.x + (Math.random() - 0.5) * this.size,
                    this.y + (Math.random() - 0.5) * this.size,
                    (Math.random() - 0.5) * 0.5,
                    -0.3 - Math.random() * 0.3,
                    '#87ceeb',
                    2 + Math.random() * 3,
                    600 + Math.random() * 400
                )
            );
        }
    }

    render(ctx) {
        super.render(ctx);

        const size = this.size;
        const halfSize = size / 2;

        ctx.fillStyle = '#4169e1';
        ctx.fillRect(this.x - halfSize, this.y - halfSize / 2, size, halfSize);

        if (this.activeTimer > 0) {
            const pulse = Math.sin(this.animTimer / 200) * 0.2 + 0.6;
            ctx.fillStyle = `rgba(135, 206, 250, ${pulse})`;
            ctx.fillRect(this.x - halfSize + 2, this.y - halfSize / 2 + 2, size - 4, halfSize - 4);

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x - halfSize + 4, this.y - 2);
            ctx.lineTo(this.x, this.y - halfSize / 2 + 4);
            ctx.lineTo(this.x + halfSize - 4, this.y - 2);
            ctx.stroke();
        }

        ctx.strokeStyle = '#2c4d8c';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - halfSize + 0.5, this.y - halfSize / 2 + 0.5, size - 1, halfSize - 1);
    }
}

/**
 * 落石陷阱
 * 天花板掉石头，有警告圈
 */
class RockTrap extends Trap {
    constructor(x, y) {
        super(x, y, TRAP_TYPES.ROCK);
        this.warning = false;
        this.falling = false;
        this.rockY = -50;
        this.targetY = 0;
    }

    tryTrigger(player, gameLogic) {
        if (!this.warning && !this.falling) {
            this.warning = true;
            this.activeTimer = this.config.WARNING_DURATION;
            this.warningTimer = this.config.WARNING_DURATION;
        }
    }

    trigger(player, gameLogic) {
        this.warning = true;
        this.cooldown = this.config.COOLDOWN;
        this.warningTimer = this.config.WARNING_DURATION;
        this.activeTimer = this.config.WARNING_DURATION + this.config.ACTIVE_DURATION;
    }

    update(deltaTime, player, gameLogic) {
        if (!this.active) {return;}

        this.animTimer += deltaTime;

        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
        }

        if (this.warning) {
            this.warningTimer -= deltaTime;

            if (Math.random() < 0.3) {
                gameLogic.particles.push(
                    new Particle(
                        this.x + (Math.random() - 0.5) * this.size,
                        this.y + (Math.random() - 0.5) * this.size,
                        0,
                        0,
                        'rgba(255, 0, 0, 0.5)',
                        2 + Math.random() * 2,
                        200
                    )
                );
            }

            if (this.warningTimer <= 0) {
                this.warning = false;
                this.falling = true;
                this.rockY = -30;
                this.targetY = this.y;
                this.fallSpeed = 0;
            }
        }

        if (this.falling) {
            this.fallSpeed += 0.8;
            this.rockY += this.fallSpeed;

            if (this.rockY >= this.targetY) {
                this.rockY = this.targetY;
                this.falling = false;
                this.activeTimer = this.config.ACTIVE_DURATION;

                if (this.checkCollision(player) && gameState && !gameState.getData().isInvincible) {
                    gameState.playerHurt(this.config.DAMAGE);
                    gameLogic.rageSystem.onHurt();
                    camera.shake(4, 200);
                }

                for (let i = 0; i < 10; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    gameLogic.particles.push(
                        new Particle(
                            this.x,
                            this.y,
                            Math.cos(angle) * (2 + Math.random() * 3),
                            -2 - Math.random() * 3,
                            '#696969',
                            3 + Math.random() * 4,
                            400 + Math.random() * 300
                        )
                    );
                }
            }
        }

        if (this.activeTimer > 0 && !this.warning && !this.falling) {
            this.activeTimer -= deltaTime;
        }

        if (this.cooldown <= 0 && !this.warning && !this.falling && this.activeTimer <= 0) {
            this.tryTrigger(player, gameLogic);
        }
    }

    render(ctx) {
        if (!this.active) {return;}

        const size = this.size;

        if (this.warning) {
            const pulse = Math.sin(this.animTimer / 100) * 0.3 + 0.5;
            ctx.strokeStyle = `rgba(255, 0, 0, ${pulse})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, size / 2, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = `rgba(255, 0, 0, ${pulse * 0.2})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, size / 2 - 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = `rgba(255, 255, 0, ${pulse})`;
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('!', this.x, this.y + 5);
        }

        if (this.falling || (this.activeTimer > 0 && !this.warning)) {
            const rockSize = 20;

            ctx.fillStyle = '#696969';
            ctx.beginPath();
            ctx.arc(this.x, this.rockY, rockSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#808080';
            ctx.beginPath();
            ctx.arc(this.x - 4, this.rockY - 4, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#4a4a4a';
            ctx.beginPath();
            ctx.arc(this.x + 5, this.rockY + 3, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

/**
 * 传送陷阱
 * 传送到随机位置
 */
class TeleportTrap extends Trap {
    constructor(x, y) {
        super(x, y, TRAP_TYPES.TELEPORT);
        this.teleportCooldown = 0;
    }

    tryTrigger(player, gameLogic) {
        if (this.checkCollision(player) && this.cooldown <= 0) {
            this.trigger(player, gameLogic);
        }
    }

    trigger(player, gameLogic) {
        super.trigger(player, gameLogic);
        this.teleportPlayer(player, gameLogic);
    }

    teleportPlayer(player, gameLogic) {
        const room = gameLogic.currentRoom;
        if (!room) {return;}

        const playable = room.getPlayableArea();
        const margin = 50;

        let newX, newY;
        let attempts = 0;
        do {
            newX = playable.x + margin + Math.random() * (playable.width - margin * 2);
            newY = playable.y + margin + Math.random() * (playable.height - margin * 2);
            attempts++;
        } while (Math.abs(newX - this.x) < 100 && Math.abs(newY - this.y) < 100 && attempts < 20);

        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            gameLogic.particles.push(
                new Particle(
                    player.x,
                    player.y,
                    Math.cos(angle) * (1 + Math.random() * 2),
                    Math.sin(angle) * (1 + Math.random() * 2),
                    '#da70d6',
                    3 + Math.random() * 3,
                    300 + Math.random() * 200
                )
            );
        }

        player.x = newX;
        player.y = newY;
        player.renderX = newX;
        player.renderY = newY;

        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            gameLogic.particles.push(
                new Particle(
                    newX,
                    newY,
                    Math.cos(angle) * (1 + Math.random() * 2),
                    Math.sin(angle) * (1 + Math.random() * 2),
                    '#9932cc',
                    3 + Math.random() * 3,
                    300 + Math.random() * 200
                )
            );
        }
    }

    update(deltaTime, player, gameLogic) {
        super.update(deltaTime, player, gameLogic);

        if (Math.random() < 0.15) {
            const angle = Math.random() * Math.PI * 2;
            const dist = this.size / 2;
            gameLogic.particles.push(
                new Particle(
                    this.x + Math.cos(angle) * dist,
                    this.y + Math.sin(angle) * dist,
                    Math.cos(angle) * 0.5,
                    Math.sin(angle) * 0.5,
                    '#da70d6',
                    2 + Math.random() * 2,
                    400 + Math.random() * 300
                )
            );
        }
    }

    render(ctx) {
        if (!this.active) {return;}

        const size = this.size;
        const halfSize = size / 2;
        const rotation = this.animTimer / 500;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(rotation);

        for (let i = 0; i < 3; i++) {
            const layerSize = halfSize - i * 6;
            const alpha = 0.3 + i * 0.2;

            ctx.strokeStyle = `rgba(153, 50, 204, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, layerSize, 0, Math.PI * 2);
            ctx.stroke();
        }

        const pulse = Math.sin(this.animTimer / 200) * 0.2 + 0.6;
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, halfSize - 6);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${pulse})`);
        gradient.addColorStop(0.5, `rgba(186, 85, 211, ${pulse * 0.7})`);
        gradient.addColorStop(1, 'rgba(153, 50, 204, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, halfSize - 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

/**
 * 陷阱管理器
 * 管理房间中的所有陷阱
 */
class TrapManager {
    constructor() {
        this.traps = [];
    }

    /**
     * 生成陷阱
     * @param {number} count - 陷阱数量
     * @param {Object} playableArea - 可活动区域
     */
    generateTraps(count, playableArea) {
        this.traps = [];

        const trapTypes = [
            TRAP_TYPES.SPIKE,
            TRAP_TYPES.FIRE,
            TRAP_TYPES.POISON,
            TRAP_TYPES.ICE,
            TRAP_TYPES.ROCK,
            TRAP_TYPES.TELEPORT
        ];

        const margin = 60;

        for (let i = 0; i < count; i++) {
            const type = trapTypes[Math.floor(Math.random() * trapTypes.length)];
            const x = playableArea.x + margin + Math.random() * (playableArea.width - margin * 2);
            const y = playableArea.y + margin + Math.random() * (playableArea.height - margin * 2);

            this.addTrap(x, y, type);
        }
    }

    addTrap(x, y, trapType) {
        let trap;
        switch (trapType) {
            case TRAP_TYPES.SPIKE:
                trap = new SpikeTrap(x, y);
                break;
            case TRAP_TYPES.FIRE:
                trap = new FireTrap(x, y);
                break;
            case TRAP_TYPES.POISON:
                trap = new PoisonTrap(x, y);
                break;
            case TRAP_TYPES.ICE:
                trap = new IceTrap(x, y);
                break;
            case TRAP_TYPES.ROCK:
                trap = new RockTrap(x, y);
                break;
            case TRAP_TYPES.TELEPORT:
                trap = new TeleportTrap(x, y);
                break;
            default:
                trap = new SpikeTrap(x, y);
        }

        this.traps.push(trap);
    }

    /**
     * 更新所有陷阱
     * @param {number} deltaTime - 时间增量
     * @param {Player} player - 玩家引用
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    update(deltaTime, player, gameLogic) {
        for (const trap of this.traps) {
            trap.update(deltaTime, player, gameLogic);
        }
    }

    /**
     * 渲染所有陷阱
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     */
    render(ctx) {
        for (const trap of this.traps) {
            trap.render(ctx);
        }
    }

    /**
     * 清空所有陷阱
     */
    clear() {
        this.traps = [];
    }
}
