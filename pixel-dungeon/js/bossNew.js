/**
 * 新Boss系统 - 骷髅王
 * 3阶段技能系统：召唤骷髅兵、投掷骨矛、死亡之雨
 */

class SkeletonKing {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.size = SKELETON_KING.SIZE;
        this.health = SKELETON_KING.HEALTH;
        this.maxHealth = SKELETON_KING.HEALTH;
        this.speed = SKELETON_KING.SPEED;
        this.baseSpeed = SKELETON_KING.SPEED;
        this.damage = SKELETON_KING.DAMAGE;

        this.alive = true;
        this.isHurt = false;
        this.hurtTimer = 0;

        this.phase = 1;
        this.attackTimer = 0;
        this.attackCooldown = SKELETON_KING.PHASE1.ATTACK_COOLDOWN;

        this.summonTimer = 0;

        this.animFrame = 0;
        this.animTimer = 0;

        this.color = SKELETON_KING.COLOR;
        this.armorColor = SKELETON_KING.ARMOR_COLOR;
        this.crownColor = SKELETON_KING.CROWN_COLOR;
        this.eyeColor = SKELETON_KING.EYE_COLOR;

        this.hitFlashTimer = 0;
        this.hitFlashDuration = 100;

        this.knockbackX = 0;
        this.knockbackY = 0;
        this.knockbackTimer = 0;

        this.swingAttackActive = false;
        this.swingAttackTimer = 0;
        this.swingAttackAngle = 0;

        this.boneSpearCooldown = 0;
        this.deathRainTimer = 0;
        this.deathRainActive = false;
        this.deathRainProjectiles = [];

        this.isCharging = false;
        this.chargeWarning = false;
        this.chargeTimer = 0;
        this.chargeDirection = { x: 0, y: 0 };

        this.summonEffects = [];
    }

    update(deltaTime, player, gameLogic) {
        if (!this.alive) {return;}

        if (this.isHurt) {
            this.hurtTimer -= deltaTime;
            if (this.hurtTimer <= 0) {
                this.isHurt = false;
            }
        }

        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= deltaTime;
            if (this.hitFlashTimer < 0) {
                this.hitFlashTimer = 0;
            }
        }

        this.updateKnockback(deltaTime);
        this.checkPhaseChange();
        this.updateAnimation(deltaTime);
        this.updateSummonEffects(deltaTime, gameLogic);

        if (this.chargeWarning || this.isCharging) {
            this.updateCharge(deltaTime, player, gameLogic);
            return;
        }

        if (this.swingAttackActive) {
            this.swingAttackTimer -= deltaTime;
            if (this.swingAttackTimer <= 0) {
                this.swingAttackActive = false;
            }
            return;
        }

        this.moveTowardsPlayer(player);

        this.attackTimer += deltaTime;
        this.summonTimer += deltaTime;
        this.boneSpearCooldown -= deltaTime;
        this.deathRainTimer += deltaTime;

        this.executePhaseBehavior(deltaTime, player, gameLogic);
    }

    checkPhaseChange() {
        const healthPercent = this.health / this.maxHealth;

        if (healthPercent <= SKELETON_KING.PHASE2.HEALTH_THRESHOLD && this.phase === 1) {
            this.phase = 2;
            this.speed = this.baseSpeed * SKELETON_KING.PHASE2.SPEED_MULTIPLIER;
            this.attackCooldown = SKELETON_KING.PHASE2.ATTACK_COOLDOWN;
            this.summonTimer = 0;
            console.log('骷髅王进入第二阶段');
        }

        if (healthPercent <= SKELETON_KING.PHASE3.HEALTH_THRESHOLD && this.phase === 2) {
            this.phase = 3;
            this.speed = this.baseSpeed * SKELETON_KING.PHASE3.SPEED_MULTIPLIER;
            this.damage = SKELETON_KING.DAMAGE * SKELETON_KING.PHASE3.DAMAGE_MULTIPLIER;
            this.attackCooldown = SKELETON_KING.PHASE3.ATTACK_COOLDOWN;
            this.deathRainTimer = 0;
            this.summonTimer = 0;
            console.log('骷髅王进入第三阶段：狂暴');
        }
    }

    executePhaseBehavior(deltaTime, player, gameLogic) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (this.phase === 1) {
            if (dist <= SKELETON_KING.PHASE1.ATTACK_RANGE && this.attackTimer >= this.attackCooldown) {
                this.attackTimer = 0;
                this.swingAttack(player, gameLogic);
            }

            if (this.summonTimer >= SKELETON_KING.PHASE1.SUMMON_INTERVAL) {
                this.summonTimer = 0;
                this.summonSkeletons(gameLogic, SKELETON_KING.PHASE1.SUMMON_COUNT);
            }
        }

        if (this.phase === 2) {
            if (this.boneSpearCooldown <= 0 && dist > 80 && dist < 300) {
                this.boneSpearCooldown = SKELETON_KING.PHASE2.ATTACK_COOLDOWN;
                this.throwBoneSpear(player, gameLogic);
            }

            if (dist <= SKELETON_KING.PHASE1.ATTACK_RANGE && this.attackTimer >= this.attackCooldown) {
                this.attackTimer = 0;
                this.swingAttack(player, gameLogic);
            }

            if (this.summonTimer >= SKELETON_KING.PHASE2.SUMMON_INTERVAL) {
                this.summonTimer = 0;
                this.summonSkeletons(gameLogic, SKELETON_KING.PHASE2.SUMMON_COUNT);
            }
        }

        if (this.phase === 3) {
            if (dist <= SKELETON_KING.PHASE1.ATTACK_RANGE && this.attackTimer >= this.attackCooldown) {
                this.attackTimer = 0;
                this.swingAttack(player, gameLogic);
            }

            if (this.boneSpearCooldown <= 0 && dist > 60) {
                this.boneSpearCooldown = SKELETON_KING.PHASE3.ATTACK_COOLDOWN;
                this.throwBoneSpear(player, gameLogic);
            }

            if (this.deathRainTimer >= SKELETON_KING.PHASE3.DEATH_RAIN_INTERVAL) {
                this.deathRainTimer = 0;
                this.startDeathRain(player, gameLogic);
            }

            if (this.summonTimer >= SKELETON_KING.PHASE3.SUMMON_INTERVAL) {
                this.summonTimer = 0;
                this.summonSkeletons(gameLogic, SKELETON_KING.PHASE3.SUMMON_COUNT);
            }
        }
    }

    swingAttack(player, gameLogic) {
        this.swingAttackActive = true;
        this.swingAttackTimer = 300;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        this.swingAttackAngle = Math.atan2(dy, dx);

        setTimeout(() => {
            if (!this.alive) {return;}

            const hitDist = SKELETON_KING.PHASE1.ATTACK_RANGE + 20;
            const pdx = player.x - this.x;
            const pdy = player.y - this.y;
            const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

            if (pdist < hitDist) {
                const angleToPlayer = Math.atan2(pdy, pdx);
                let angleDiff = Math.abs(angleToPlayer - this.swingAttackAngle);
                if (angleDiff > Math.PI) {angleDiff = Math.PI * 2 - angleDiff;}

                if (angleDiff < Math.PI / 3) {
                    if (gameState && !gameState.getData().isInvincible) {
                        gameState.playerHurt(SKELETON_KING.PHASE1.SWING_DAMAGE);
                        if (gameLogic && gameLogic.rageSystem) {
                            gameLogic.rageSystem.onHurt();
                        }
                        camera.shake(5, 300);
                    }
                }
            }
        }, 150);
    }

    throwBoneSpear(player, gameLogic) {
        if (typeof gameLogic === 'undefined') {return;}

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            const bullet = new Bullet(this.x, this.y - 10, dx / dist, dy / dist, {
                damage: SKELETON_KING.PHASE2.BONE_SPEAR_DAMAGE,
                speed: SKELETON_KING.PHASE2.BONE_SPEAR_SPEED,
                isEnemyBullet: true,
                color: '#f5f5dc',
                size: 12
            });
            bullet.isEnemyBullet = true;
            bullet.isBoneSpear = true;
            gameLogic.bullets.push(bullet);
        }
    }

    startDeathRain(player, gameLogic) {
        if (typeof gameLogic === 'undefined') {return;}

        this.deathRainActive = true;
        const count = SKELETON_KING.PHASE3.DEATH_RAIN_COUNT;

        for (let i = 0; i < count; i++) {
            const targetX = player.x + (Math.random() - 0.5) * 200;
            const targetY = player.y + (Math.random() - 0.5) * 200;

            const margin = LEVELS.WALL_THICKNESS + 30;
            const clampedX = Math.max(margin, Math.min(GAME_WIDTH - margin, targetX));
            const clampedY = Math.max(margin, Math.min(GAME_HEIGHT - margin, targetY));

            this.deathRainProjectiles.push({
                x: clampedX,
                y: clampedY,
                warningTimer: SKELETON_KING.PHASE3.DEATH_RAIN_WARNING,
                active: false,
                damage: SKELETON_KING.PHASE3.DEATH_RAIN_DAMAGE
            });

            setTimeout(
                () => {
                    const proj = this.deathRainProjectiles.find((p) => p.x === clampedX && p.y === clampedY);
                    if (proj) {
                        proj.active = true;
                        proj.warningTimer = 0;

                        if (gameState && !gameState.getData().isInvincible) {
                            const pdx = player.x - proj.x;
                            const pdy = player.y - proj.y;
                            const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
                            if (pdist < 25) {
                                gameState.playerHurt(proj.damage);
                                if (gameLogic && gameLogic.rageSystem) {
                                    gameLogic.rageSystem.onHurt();
                                }
                            }

                            for (let j = 0; j < 10; j++) {
                                const angle = Math.random() * Math.PI * 2;
                                const speed = 1 + Math.random() * 3;
                                gameLogic.particles.push(
                                    new Particle(
                                        proj.x,
                                        proj.y,
                                        Math.cos(angle) * speed,
                                        Math.sin(angle) * speed - 2,
                                        Math.random() < 0.5 ? '#f5f5dc' : '#808080',
                                        3 + Math.random() * 3,
                                        400 + Math.random() * 200
                                    )
                                );
                            }

                            setTimeout(() => {
                                const idx = this.deathRainProjectiles.indexOf(proj);
                                if (idx > -1) {
                                    this.deathRainProjectiles.splice(idx, 1);
                                }
                            }, 300);
                        }
                    }
                },
                SKELETON_KING.PHASE3.DEATH_RAIN_WARNING + i * 100
            );
        }

        setTimeout(
            () => {
                this.deathRainActive = false;
            },
            SKELETON_KING.PHASE3.DEATH_RAIN_WARNING + count * 100 + 500
        );
    }

    summonSkeletons(gameLogic, count) {
        if (typeof gameLogic === 'undefined') {return;}

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 80 + Math.random() * 60;
            const spawnX = this.x + Math.cos(angle) * dist;
            const spawnY = this.y + Math.sin(angle) * dist;

            const margin = LEVELS.WALL_THICKNESS + 20;
            const clampedX = Math.max(margin, Math.min(GAME_WIDTH - margin, spawnX));
            const clampedY = Math.max(margin, Math.min(GAME_HEIGHT - margin, spawnY));

            this.summonEffects.push({
                x: clampedX,
                y: clampedY,
                timer: 600
            });

            setTimeout(() => {
                if (!this.alive) {return;}

                const skeleton = new Skeleton(clampedX, clampedY);
                skeleton.isSummoned = true;
                skeleton.fadeIn = true;
                skeleton.fadeInTimer = 300;

                gameLogic.enemies.push(skeleton);
            }, 600);
        }
    }

    updateSummonEffects(deltaTime, gameLogic) {
        for (let i = this.summonEffects.length - 1; i >= 0; i--) {
            const effect = this.summonEffects[i];
            effect.timer -= deltaTime;

            if (effect.timer > 0 && typeof gameLogic !== 'undefined') {
                for (let j = 0; j < 2; j++) {
                    gameLogic.particles.push(
                        new Particle(
                            effect.x + (Math.random() - 0.5) * 15,
                            effect.y + (Math.random() - 0.5) * 20,
                            0,
                            -1 - Math.random() * 2,
                            '#90ee90',
                            2 + Math.random() * 2,
                            200 + Math.random() * 150
                        )
                    );
                }
            }

            if (effect.timer <= 0) {
                this.summonEffects.splice(i, 1);
            }
        }
    }

    moveTowardsPlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0 && dist > 40) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }

        const margin = LEVELS.WALL_THICKNESS + this.size / 2;
        this.x = Math.max(margin, Math.min(GAME_WIDTH - margin, this.x));
        this.y = Math.max(margin, Math.min(GAME_HEIGHT - margin, this.y));
    }

    updateCharge(deltaTime, player, gameLogic) {
        this.chargeTimer -= deltaTime;

        if (this.chargeWarning) {
            if (this.chargeTimer <= 0) {
                this.chargeWarning = false;
                this.isCharging = true;
                this.chargeTimer = 400;
            }
            return;
        }

        if (this.isCharging) {
            const chargeSpeed = this.speed * 3;
            this.x += this.chargeDirection.x * chargeSpeed;
            this.y += this.chargeDirection.y * chargeSpeed;

            const margin = LEVELS.WALL_THICKNESS + this.size / 2;
            this.x = Math.max(margin, Math.min(GAME_WIDTH - margin, this.x));
            this.y = Math.max(margin, Math.min(GAME_HEIGHT - margin, this.y));

            if (this.chargeTimer <= 0) {
                this.isCharging = false;
            }
        }
    }

    takeDamage(damage, knockbackDirection, knockbackForce) {
        this.health -= damage;
        this.isHurt = true;
        this.hurtTimer = 100;

        this.hitFlashTimer = this.hitFlashDuration;

        if (knockbackDirection && knockbackForce > 0) {
            this.knockbackX = knockbackDirection.x * knockbackForce * 0.2;
            this.knockbackY = knockbackDirection.y * knockbackForce * 0.2;
            this.knockbackTimer = 200;
        }

        if (this.health <= 0) {
            this.alive = false;
        }
    }

    updateKnockback(deltaTime) {
        if (this.knockbackTimer > 0) {
            this.x += this.knockbackX;
            this.y += this.knockbackY;

            this.knockbackX *= 0.85;
            this.knockbackY *= 0.85;

            this.knockbackTimer -= deltaTime;

            if (this.knockbackTimer <= 0) {
                this.knockbackTimer = 0;
                this.knockbackX = 0;
                this.knockbackY = 0;
            }
        }
    }

    updateAnimation(deltaTime) {
        this.animTimer += deltaTime;

        const frameTime = 1000 / 8;

        if (this.animTimer >= frameTime) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }

    render() {
        if (!this.alive) {return;}

        const ctx = renderer.ctx;
        const size = this.size;
        const halfSize = size / 2;

        let bodyColor = this.color;
        if (this.isHurt || this.hitFlashTimer > 0) {
            bodyColor = '#ff0000';
        }

        ctx.save();

        const bobY = Math.sin(this.animTimer / 200) * 2;

        ctx.translate(this.x, this.y + bobY);

        if (this.phase >= 3) {
            ctx.globalAlpha = 0.3 + Math.sin(this.animTimer / 100) * 0.2;
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, halfSize + 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        ctx.fillStyle = this.armorColor;
        ctx.fillRect(-halfSize / 2 - 5, -halfSize / 2, halfSize + 10, size * 0.6);

        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(0, -halfSize + 10, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(-5, -halfSize + 8, 3, 0, Math.PI * 2);
        ctx.arc(5, -halfSize + 8, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.eyeColor;
        ctx.beginPath();
        ctx.arc(-5, -halfSize + 8, 1.5, 0, Math.PI * 2);
        ctx.arc(5, -halfSize + 8, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.moveTo(0, -halfSize + 14);
        ctx.lineTo(-3, -halfSize + 18);
        ctx.lineTo(3, -halfSize + 18);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = this.crownColor;
        ctx.beginPath();
        ctx.moveTo(-12, -halfSize + 2);
        ctx.lineTo(-10, -halfSize - 8);
        ctx.lineTo(-5, -halfSize - 2);
        ctx.lineTo(0, -halfSize - 12);
        ctx.lineTo(5, -halfSize - 2);
        ctx.lineTo(10, -halfSize - 8);
        ctx.lineTo(12, -halfSize + 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(0, -halfSize - 6, 2, 0, Math.PI * 2);
        ctx.fill();

        if (this.swingAttackActive) {
            const swingProgress = 1 - this.swingAttackTimer / 300;
            const swingAngle = this.swingAttackAngle - Math.PI / 2 + swingProgress * Math.PI;

            ctx.save();
            ctx.rotate(swingAngle);
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(-4, -halfSize - 20, 8, 30);
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(-5, 8, 10, 6);
            ctx.restore();
        } else {
            const swordSide = 1;
            ctx.save();
            ctx.translate((halfSize / 2) * swordSide + 5, 0);
            ctx.rotate(Math.PI / 6);
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(-3, -halfSize, 6, 25);
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(-4, 8, 8, 4);
            ctx.restore();
        }

        ctx.fillStyle = this.armorColor;
        ctx.beginPath();
        ctx.moveTo(-halfSize, halfSize * 0.3);
        ctx.lineTo(-halfSize - 8, halfSize + 5);
        ctx.lineTo(-halfSize / 2, halfSize + 5);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(halfSize, halfSize * 0.3);
        ctx.lineTo(halfSize + 8, halfSize + 5);
        ctx.lineTo(halfSize / 2, halfSize + 5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        for (const proj of this.deathRainProjectiles) {
            if (proj.warningTimer > 0) {
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, 25, 0, Math.PI * 2);
                ctx.stroke();

                ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, 25, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        this.renderHealthBar();
    }

    renderHealthBar() {
        const barWidth = ENEMY_HEALTH_BAR.BOSS_WIDTH;
        const barHeight = ENEMY_HEALTH_BAR.BOSS_HEIGHT;
        const x = GAME_WIDTH / 2 - barWidth / 2;
        const y = ENEMY_HEALTH_BAR.BOSS_Y;

        renderer.drawRect(x, y, barWidth, barHeight, ENEMY_HEALTH_BAR.BG_COLOR);

        const healthPercent = Math.max(0, this.health / this.maxHealth);

        let barColor = '#00ff00';
        if (healthPercent < ENEMY_HEALTH_BAR.LOW_THRESHOLD) {
            barColor = ENEMY_HEALTH_BAR.COLOR_LOW;
        } else if (healthPercent < ENEMY_HEALTH_BAR.MID_THRESHOLD) {
            barColor = ENEMY_HEALTH_BAR.COLOR_MID;
        }

        if (this.phase === 3) {
            barColor = '#00ff00';
        }

        renderer.drawRect(x, y, barWidth * healthPercent, barHeight, barColor);
        renderer.drawRectOutline(x, y, barWidth, barHeight, ENEMY_HEALTH_BAR.BORDER_COLOR, 2);

        renderer.drawCenteredText(
            SKELETON_KING.NAME + ' - 阶段' + this.phase,
            GAME_WIDTH / 2,
            y - 10,
            '#ffffff',
            'bold 14px "Courier New", monospace'
        );
    }
}
