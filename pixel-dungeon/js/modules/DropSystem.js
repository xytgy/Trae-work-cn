/**
 * 掉落系统
 * 从 GameLogic 中提取掉落相关方法
 */
class DropSystem {
    constructor({ eventBus, gameLogic }) {
        this.eventBus = eventBus;
        this.gameLogic = gameLogic;
    }

    /**
     * 生成道具掉落
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    spawnItemDrop(x, y) {
        const gl = this.gameLogic;
        const rand = Math.random();
        let item;

        if (rand < 0.4) {
            const goldAmount = 5 + Math.floor(Math.random() * 15);
            item = ItemFactory.createGold(goldAmount);
        } else if (rand < 0.6) {
            item = PotionFactory.createHealthPotion(1);
        } else if (rand < 0.75) {
            item = ItemFactory.createBomb(1);
        } else if (rand < 0.85) {
            item = ItemFactory.createFood(1);
        } else if (rand < 0.92) {
            item = PotionFactory.createRandomPotion('uncommon');
        } else if (rand < 0.97) {
            item = ItemFactory.createKey(1);
        } else {
            item = RelicFactory.createRandomRelic('rare');
            if (item.rarity === 'legendary') {
                gl.achievementManager.onLegendaryDrop();
            }
        }

        if (item) {
            const offsetX = (Math.random() - 0.5) * 30;
            const offsetY = (Math.random() - 0.5) * 30;
            gl.dropManager.addDrop(item, x + offsetX, y + offsetY);
        }
    }

    /**
     * 检查道具拾取
     */
    checkItemPickup() {
        const gl = this.gameLogic;
        if (!gl.player) {
            return;
        }

        const pickedUp = gl.dropManager.pickUpInRange(gl.player.x, gl.player.y, gl.inventory);

        pickedUp.forEach((item) => {
            gl.achievementManager.onItemCollected(item.id);

            if (item.rarity === 'legendary') {
                gl.achievementManager.onLegendaryDrop();
            }

            if (item.id === 'gold') {
                let goldAmount = item.count;
                if (gl.player.goldGainBonus) {
                    goldAmount = Math.floor(goldAmount * (1 + gl.player.goldGainBonus));
                }
                gl.achievementManager.onGoldEarned(goldAmount);
            }

            if (item.id === 'gem') {
                gl.achievementManager.onGemsEarned(item.count);
            }
        });
    }

    /**
     * 生成武器掉落
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    spawnWeaponDrop(x, y) {
        const gl = this.gameLogic;

        const weaponTypes = [WEAPONS.LIGHTNING, WEAPONS.GRENADE, WEAPONS.FLAME, WEAPONS.BOOMERANG];
        const weapon = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];

        const playerWeapons = gl.state.getData().playerWeapons;
        if (playerWeapons.some((w) => w.ID === weapon.ID)) {
            return;
        }

        const drop = {
            x: x,
            y: y,
            type: 'weapon',
            weapon: { ...weapon },
            active: true,
            spawnTime: Date.now(),
            floatOffset: 0
        };

        if (!gl.weaponDrops) {
            gl.weaponDrops = [];
        }
        gl.weaponDrops.push(drop);

        gl.particleManager.spawnPickupParticles(x, y, weapon.COLOR);
    }

    /**
     * 检查武器拾取
     */
    checkWeaponPickup() {
        const gl = this.gameLogic;
        if (!gl.weaponDrops || gl.weaponDrops.length === 0) {
            return;
        }

        const playerPos = gl.player.getPosition();

        gl.weaponDrops = gl.weaponDrops.filter((drop) => {
            if (!drop.active) {
                return false;
            }

            const dx = playerPos.x - drop.x;
            const dy = playerPos.y - drop.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const pickupRange = 30;

            if (distance < pickupRange) {
                const added = gl.state.addWeapon(drop.weapon);

                if (added) {
                    console.log(`拾取了武器: ${drop.weapon.NAME}`);
                    soundManager.play(SOUND_EFFECTS.PICKUP);
                    uiManager.updateWeapon();
                    uiManager.updateWeaponInfo();

                    camera.shake(
                        FEEDBACK.SCREEN_SHAKE.WEAPON_PICKUP.intensity,
                        FEEDBACK.SCREEN_SHAKE.WEAPON_PICKUP.duration
                    );

                    gl.timeManager.startTimeStop(FEEDBACK.TIME_STOP.POWER_WEAPON);

                    return false;
                }
            }

            return true;
        });
    }
}
