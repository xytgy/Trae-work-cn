class WeaponSystem {
    constructor() {
        this.weaponDrops = [];
    }

    reset() {
        this.weaponDrops = [];
    }

    spawnWeaponDrop(x, y, isElite = false, game) {
        const weaponTypes = isElite
            ? [WEAPONS.SHOTGUN, WEAPONS.HOMING, WEAPONS.FREEZE, WEAPONS.BOOMERANG]
            : [WEAPONS.LIGHTNING, WEAPONS.GRENADE, WEAPONS.FLAME, WEAPONS.BOOMERANG];
        const weapon = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];

        const playerWeapons = game.state.getData().playerWeapons;
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

        this.weaponDrops.push(drop);

        if (game.spawnPickupParticles) {
            game.spawnPickupParticles(x, y, weapon.COLOR);
        }
    }

    checkWeaponPickup(player, game) {
        if (!this.weaponDrops || this.weaponDrops.length === 0) {return;}

        const playerPos = player.getPosition();

        this.weaponDrops = this.weaponDrops.filter((drop) => {
            if (!drop.active) {return false;}

            const dx = playerPos.x - drop.x;
            const dy = playerPos.y - drop.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const pickupRange = 30;

            if (distance < pickupRange) {
                const added = game.state.addWeapon(drop.weapon);

                if (added) {
                    console.log(`拾取了武器: ${drop.weapon.NAME}`);
                    soundManager.play(SOUND_EFFECTS.PICKUP);
                    uiManager.updateWeapon();
                    uiManager.updateWeaponInfo();

                    game.camera.shake(
                        FEEDBACK.SCREEN_SHAKE.WEAPON_PICKUP.intensity,
                        FEEDBACK.SCREEN_SHAKE.WEAPON_PICKUP.duration
                    );

                    game.timeManager.startTimeStop(FEEDBACK.TIME_STOP.POWER_WEAPON);

                    game.showPickupText(drop.x, drop.y - 20, `武器: ${drop.weapon.NAME}`, 'weapon');

                    return false;
                }
            }

            return true;
        });
    }

    renderWeaponDrop(renderer) {
        if (!this.weaponDrops || this.weaponDrops.length === 0) {return;}

        const time = Date.now() / 1000;

        this.weaponDrops.forEach((drop) => {
            if (!drop.active) {return;}

            const floatY = Math.sin(time * 4 + drop.x) * 5;
            const glowSize = 20 + Math.sin(time * 6) * 5;

            const gradient = renderer.ctx.createRadialGradient(
                drop.x,
                drop.y + floatY,
                0,
                drop.x,
                drop.y + floatY,
                glowSize
            );
            gradient.addColorStop(0, drop.weapon.COLOR + '80');
            gradient.addColorStop(1, 'transparent');

            renderer.ctx.fillStyle = gradient;
            renderer.ctx.beginPath();
            renderer.ctx.arc(drop.x, drop.y + floatY, glowSize, 0, Math.PI * 2);
            renderer.ctx.fill();

            renderer.drawCenteredText(drop.weapon.ICON, drop.x, drop.y + floatY - 8, drop.weapon.COLOR, '24px serif');
        });
    }
}