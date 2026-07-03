/**
 * 伤害系统
 * 从 GameLogic 中提取伤害计算相关方法
 */
class DamageSystem {
    constructor({ eventBus, gameLogic }) {
        this.eventBus = eventBus;
        this.gameLogic = gameLogic;
    }

    /**
     * 对敌人造成伤害并应用击退
     * @param {Object} enemy - 敌人对象
     * @param {number} damage - 伤害值
     * @param {Object} bullet - 子弹对象（用于计算击退方向）
     */
    damageEnemy(enemy, damage, bullet) {
        const gl = this.gameLogic;

        let dirX = 0;
        let dirY = 0;

        if (bullet) {
            if (bullet.velX !== undefined && bullet.velY !== undefined) {
                dirX = bullet.velX;
                dirY = bullet.velY;
            } else {
                dirX = bullet.x - gl.player.x;
                dirY = bullet.y - gl.player.y;
            }
        }

        const dist = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        const knockbackDir = { x: dirX / dist, y: dirY / dist };

        const knockbackForce = FEEDBACK.KNOCKBACK.ENEMY_BASE_FORCE + damage * FEEDBACK.KNOCKBACK.ENEMY_DAMAGE_MULT;

        enemy.takeDamage(damage, knockbackDir, knockbackForce);
    }

    /**
     * 对敌人造成爆炸伤害并应用击退
     * @param {Object} enemy - 敌人对象
     * @param {number} damage - 伤害值
     * @param {number} explosionX - 爆炸中心X坐标
     * @param {number} explosionY - 爆炸中心Y坐标
     * @param {number} forceMultiplier - 击退力倍率
     */
    damageEnemyWithExplosion(enemy, damage, explosionX, explosionY, forceMultiplier = 1.5) {
        const dx = enemy.x - explosionX;
        const dy = enemy.y - explosionY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const knockbackDir = { x: dx / dist, y: dy / dist };

        const knockbackForce =
            (FEEDBACK.KNOCKBACK.ENEMY_BASE_FORCE + damage * FEEDBACK.KNOCKBACK.ENEMY_DAMAGE_MULT) * forceMultiplier;

        enemy.takeDamage(damage, knockbackDir, knockbackForce);
    }

    /**
     * 对Boss造成伤害并应用击退
     * @param {number} damage - 伤害值
     * @param {Object} bullet - 子弹对象（用于计算击退方向）
     */
    damageBoss(damage, bullet) {
        const gl = this.gameLogic;
        if (!gl.boss || !gl.boss.alive) {
            return;
        }

        let dirX = 0;
        let dirY = 0;

        if (bullet) {
            if (bullet.velX !== undefined && bullet.velY !== undefined) {
                dirX = bullet.velX;
                dirY = bullet.velY;
            } else {
                dirX = bullet.x - gl.player.x;
                dirY = bullet.y - gl.player.y;
            }
        }

        const dist = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        const knockbackDir = { x: dirX / dist, y: dirY / dist };

        const knockbackForce =
            (FEEDBACK.KNOCKBACK.ENEMY_BASE_FORCE + damage * FEEDBACK.KNOCKBACK.ENEMY_DAMAGE_MULT) * 0.3;

        gl.boss.takeDamage(damage, knockbackDir, knockbackForce);
    }

    /**
     * 对Boss造成爆炸伤害并应用击退
     * @param {number} damage - 伤害值
     * @param {number} explosionX - 爆炸中心X坐标
     * @param {number} explosionY - 爆炸中心Y坐标
     */
    damageBossWithExplosion(damage, explosionX, explosionY) {
        const gl = this.gameLogic;
        if (!gl.boss || !gl.boss.alive) {
            return;
        }

        const dx = gl.boss.x - explosionX;
        const dy = gl.boss.y - explosionY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const knockbackDir = { x: dx / dist, y: dy / dist };

        const knockbackForce =
            (FEEDBACK.KNOCKBACK.ENEMY_BASE_FORCE + damage * FEEDBACK.KNOCKBACK.ENEMY_DAMAGE_MULT) * 1.5 * 0.3;

        gl.boss.takeDamage(damage, knockbackDir, knockbackForce);
    }

    /**
     * 处理普通子弹碰撞
     * @param {Bullet} bullet - 子弹
     */
    handleNormalBulletCollision(bullet) {
        const gl = this.gameLogic;

        gl.enemies.forEach((enemy) => {
            if (!enemy.alive) {
                return;
            }

            if (gl.collisionSystem.checkBulletCollision(bullet, enemy)) {
                this.damageEnemy(enemy, bullet.damage, bullet);
                bullet.active = false;

                gl.particleManager.spawnHitParticles(enemy.x, enemy.y, enemy.color);

                if (!enemy.alive) {
                    gl.onEnemyKilled(enemy);
                }
            }
        });

        if (gl.boss && gl.boss.alive) {
            if (gl.collisionSystem.checkBulletCollision(bullet, gl.boss)) {
                this.damageBoss(bullet.damage, bullet);
                bullet.active = false;

                gl.particleManager.spawnHitParticles(gl.boss.x, gl.boss.y, gl.boss.color);

                if (!gl.boss.alive) {
                    gl.onBossKilled();
                }
            }
        }
    }

    /**
     * 处理闪电子弹碰撞（可穿透）
     * @param {LightningBullet} bullet - 闪电子弹
     */
    handleLightningBulletCollision(bullet) {
        const gl = this.gameLogic;

        gl.enemies.forEach((enemy) => {
            if (!enemy.alive) {
                return;
            }

            if (gl.collisionSystem.checkBulletCollision(bullet, enemy)) {
                this.damageEnemy(enemy, bullet.damage, bullet);

                gl.particleManager.spawnHitParticles(enemy.x, enemy.y, enemy.color);

                if (!enemy.alive) {
                    gl.onEnemyKilled(enemy);
                }

                if (!bullet.penetrate()) {
                    bullet.active = false;
                }
            }
        });

        if (gl.boss && gl.boss.alive) {
            if (gl.collisionSystem.checkBulletCollision(bullet, gl.boss)) {
                this.damageBoss(bullet.damage, bullet);

                gl.particleManager.spawnHitParticles(gl.boss.x, gl.boss.y, gl.boss.color);

                if (!gl.boss.alive) {
                    gl.onBossKilled();
                }

                if (!bullet.penetrate()) {
                    bullet.active = false;
                }
            }
        }
    }

    /**
     * 处理榴弹碰撞（爆炸范围伤害）
     * @param {GrenadeBullet} bullet - 榴弹
     */
    handleGrenadeBulletCollision(bullet) {
        if (bullet.hasExploded) {
            return;
        }

        const gl = this.gameLogic;
        let exploded = false;

        gl.enemies.forEach((enemy) => {
            if (!enemy.alive) {
                return;
            }

            if (gl.collisionSystem.checkBulletCollision(bullet, enemy)) {
                exploded = true;
            }
        });

        if (gl.boss && gl.boss.alive) {
            if (gl.collisionSystem.checkBulletCollision(bullet, gl.boss)) {
                exploded = true;
            }
        }

        if (!exploded && !bullet.active) {
            exploded = true;
        }

        if (exploded) {
            this.explodeGrenade(bullet);
        }
    }

    /**
     * 榴弹爆炸处理
     * @param {GrenadeBullet} bullet - 榴弹
     */
    explodeGrenade(bullet) {
        if (bullet.hasExploded) {
            return;
        }
        bullet.hasExploded = true;
        bullet.active = false;

        const gl = this.gameLogic;
        const explosionRadius = bullet.getExplosionRadius();

        camera.shake(FEEDBACK.SCREEN_SHAKE.EXPLOSION.intensity, FEEDBACK.SCREEN_SHAKE.EXPLOSION.duration);

        gl.enemies.forEach((enemy) => {
            if (!enemy.alive) {
                return;
            }

            const dx = enemy.x - bullet.x;
            const dy = enemy.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= explosionRadius) {
                this.damageEnemyWithExplosion(enemy, bullet.damage, bullet.x, bullet.y);
                gl.particleManager.spawnHitParticles(enemy.x, enemy.y, enemy.color);

                if (!enemy.alive) {
                    gl.onEnemyKilled(enemy);
                }
            }
        });

        if (gl.boss && gl.boss.alive) {
            const dx = gl.boss.x - bullet.x;
            const dy = gl.boss.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= explosionRadius) {
                this.damageBossWithExplosion(bullet.damage, bullet.x, bullet.y);
                gl.particleManager.spawnHitParticles(gl.boss.x, gl.boss.y, gl.boss.color);

                if (!gl.boss.alive) {
                    gl.onBossKilled();
                }
            }
        }

        gl.particleManager.spawnExplosionParticles(bullet.x, bullet.y);
    }

    /**
     * 处理冰冻子弹碰撞（减速敌人）
     * @param {FreezeBullet} bullet - 冰冻子弹
     */
    handleFreezeBulletCollision(bullet) {
        const gl = this.gameLogic;

        gl.enemies.forEach((enemy) => {
            if (!enemy.alive) {
                return;
            }

            if (gl.collisionSystem.checkBulletCollision(bullet, enemy)) {
                this.damageEnemy(enemy, bullet.damage, bullet);
                enemy.applyFreeze(bullet.slowFactor, bullet.slowDuration);
                bullet.active = false;

                gl.particleManager.spawnHitParticles(enemy.x, enemy.y, COLORS.BULLET.FREEZE);

                if (!enemy.alive) {
                    gl.onEnemyKilled(enemy);
                }
            }
        });

        if (gl.boss && gl.boss.alive) {
            if (gl.collisionSystem.checkBulletCollision(bullet, gl.boss)) {
                this.damageBoss(bullet.damage, bullet);
                if (gl.boss.applyFreeze) {
                    gl.boss.applyFreeze(bullet.slowFactor, bullet.slowDuration);
                }
                bullet.active = false;

                gl.particleManager.spawnHitParticles(gl.boss.x, gl.boss.y, COLORS.BULLET.FREEZE);

                if (!gl.boss.alive) {
                    gl.onBossKilled();
                }
            }
        }
    }

    /**
     * 处理追踪导弹碰撞（爆炸伤害）
     * @param {HomingBullet} bullet - 追踪导弹
     */
    handleHomingBulletCollision(bullet) {
        if (bullet.hasExploded) {
            return;
        }

        const gl = this.gameLogic;
        let exploded = false;

        gl.enemies.forEach((enemy) => {
            if (!enemy.alive) {
                return;
            }

            if (gl.collisionSystem.checkBulletCollision(bullet, enemy)) {
                exploded = true;
            }
        });

        if (gl.boss && gl.boss.alive) {
            if (gl.collisionSystem.checkBulletCollision(bullet, gl.boss)) {
                exploded = true;
            }
        }

        if (!exploded && !bullet.active) {
            exploded = true;
        }

        if (exploded) {
            this.explodeHoming(bullet);
        }
    }

    /**
     * 追踪导弹爆炸处理
     * @param {HomingBullet} bullet - 追踪导弹
     */
    explodeHoming(bullet) {
        if (bullet.hasExploded) {
            return;
        }
        bullet.hasExploded = true;
        bullet.active = false;

        const gl = this.gameLogic;
        const explosionRadius = bullet.explosionRadius || 20;

        camera.shake(FEEDBACK.SCREEN_SHAKE.EXPLOSION.intensity, FEEDBACK.SCREEN_SHAKE.EXPLOSION.duration);

        gl.enemies.forEach((enemy) => {
            if (!enemy.alive) {
                return;
            }

            const dx = enemy.x - bullet.x;
            const dy = enemy.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= explosionRadius) {
                this.damageEnemyWithExplosion(enemy, bullet.damage, bullet.x, bullet.y);
                gl.particleManager.spawnHitParticles(enemy.x, enemy.y, enemy.color);

                if (!enemy.alive) {
                    gl.onEnemyKilled(enemy);
                }
            }
        });

        if (gl.boss && gl.boss.alive) {
            const dx = gl.boss.x - bullet.x;
            const dy = gl.boss.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= explosionRadius) {
                this.damageBossWithExplosion(bullet.damage, bullet.x, bullet.y);
                gl.particleManager.spawnHitParticles(gl.boss.x, gl.boss.y, gl.boss.color);

                if (!gl.boss.alive) {
                    gl.onBossKilled();
                }
            }
        }

        gl.particleManager.spawnHomingExplosionParticles(bullet.x, bullet.y);
    }

    /**
     * 玩家被敌人击中
     * @param {Object} enemy - 敌人
     */
    playerHitByEnemy(enemy) {
        const gl = this.gameLogic;
        if (gl.state.getData().isInvincible) {
            return;
        }

        const damage = enemy.damage || 1;

        let actualDamage = damage;
        if (gl.player.passiveSkill) {
            actualDamage = gl.player.passiveSkill.onTakeDamage(damage);
        }

        if (actualDamage > 0) {
            gl.rageSystem.onHurt();
            gl.player.triggerHitFlash();

            camera.shake(FEEDBACK.SCREEN_SHAKE.PLAYER_HURT.intensity, FEEDBACK.SCREEN_SHAKE.PLAYER_HURT.duration);

            const dx = gl.player.x - enemy.x;
            const dy = gl.player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const knockbackDir = { x: dx / dist, y: dy / dist };

            gl.player.applyKnockback(knockbackDir, FEEDBACK.KNOCKBACK.PLAYER_FORCE);
        }

        gl.state.playerHurt(actualDamage);

        gl.particleManager.spawnDamageParticles(gl.player.x, gl.player.y);

        soundManager.play(SOUND_EFFECTS.HURT);

        if (gl.state.isState(GAME_STATE.GAME_OVER)) {
            console.log('玩家死亡');
        }
    }

    /**
     * 玩家被Boss击中
     */
    playerHitByBoss() {
        const gl = this.gameLogic;
        if (gl.state.getData().isInvincible) {
            return;
        }

        let damage = BOSS.DAMAGE;
        if (gl.boss && gl.boss.isCharging) {
            damage = gl.boss.getChargeDamage();
        }

        let actualDamage = damage;
        if (gl.player.passiveSkill) {
            actualDamage = gl.player.passiveSkill.onTakeDamage(damage);
        }

        if (actualDamage > 0) {
            gl.rageSystem.onHurt();
            gl.player.hurtFlashTimer = 200;
        }

        gl.state.playerHurt(actualDamage);

        gl.particleManager.spawnDamageParticles(gl.player.x, gl.player.y);

        soundManager.play(SOUND_EFFECTS.HURT);

        if (gl.state.isState(GAME_STATE.GAME_OVER)) {
            console.log('玩家死亡');
        }
    }
}
