/**
 * 具体道具实现
 * 包含各种基础道具的创建和使用逻辑
 */

const ItemFactory = {
    /**
     * 根据配置创建道具
     * @param {Object} config - 道具配置
     * @param {number} count - 数量
     * @returns {Item}
     */
    createItem(config, count = 1) {
        const item = new Item(config.id, config.name, config.icon, config.type, config.rarity, config.description);

        item.stackable = config.stackable || false;
        item.maxStack = config.maxStack || 1;
        item.value = config.value || 0;
        item.count = count;
        item.price = config.price || 0;
        item.gemPrice = config.gemPrice || 0;

        return item;
    },

    /**
     * 创建金币
     * @param {number} amount - 金币数量
     * @returns {Item}
     */
    createGold(amount = 1) {
        return this.createItem(
            {
                ...BASE_ITEMS.GOLD,
                type: 'material',
                stackable: true,
                maxStack: 999,
                value: 1
            },
            amount
        );
    },

    /**
     * 创建宝石
     * @param {number} amount - 宝石数量
     * @returns {Item}
     */
    createGem(amount = 1) {
        return this.createItem(
            {
                ...BASE_ITEMS.GEM,
                type: 'material',
                stackable: true,
                maxStack: 99,
                value: 10
            },
            amount
        );
    },

    /**
     * 创建炸弹
     * @param {number} count - 数量
     * @returns {Item}
     */
    createBomb(count = 1) {
        const item = this.createItem(
            {
                ...BASE_ITEMS.BOMB,
                type: 'consumable',
                stackable: true,
                maxStack: 10,
                value: 20
            },
            count
        );

        item.use = function (gameLogic) {
            if (this.count <= 0) {return false;}

            const player = gameLogic.player;
            const explosionRadius = 60;
            const damage = 3;

            gameLogic.enemies.forEach((enemy) => {
                if (!enemy.alive) {return;}
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= explosionRadius) {
                    gameLogic.damageEnemyWithExplosion(enemy, damage, player.x, player.y);
                    if (!enemy.alive) {
                        gameLogic.onEnemyKilled(enemy);
                    }
                }
            });

            if (gameLogic.boss && gameLogic.boss.alive) {
                const dx = gameLogic.boss.x - player.x;
                const dy = gameLogic.boss.y - player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= explosionRadius) {
                    gameLogic.damageBossWithExplosion(damage, player.x, player.y);
                    if (!gameLogic.boss.alive) {
                        gameLogic.onBossKilled();
                    }
                }
            }

            gameLogic.spawnExplosionParticles(player.x, player.y);
            camera.shake(5, 300);

            this.count--;
            return this.count <= 0;
        };

        return item;
    },

    /**
     * 创建钥匙
     * @param {number} count - 数量
     * @returns {Item}
     */
    createKey(count = 1) {
        return this.createItem(
            {
                ...BASE_ITEMS.KEY,
                type: 'key',
                stackable: true,
                maxStack: 10,
                value: 30
            },
            count
        );
    },

    /**
     * 创建经验书
     * @returns {Item}
     */
    createXPBook() {
        const item = this.createItem(
            {
                ...BASE_ITEMS.XP_BOOK,
                type: 'consumable',
                stackable: false,
                maxStack: 1,
                value: 100
            },
            1
        );

        item.use = function (gameLogic) {
            gameLogic.player.damageBonus = (gameLogic.player.damageBonus || 0) + 1;
            return true;
        };

        return item;
    },

    /**
     * 创建食物
     * @param {number} count - 数量
     * @returns {Item}
     */
    createFood(count = 1) {
        const item = this.createItem(
            {
                ...BASE_ITEMS.FOOD,
                type: 'consumable',
                stackable: true,
                maxStack: 5,
                value: 25
            },
            count
        );

        item.use = function (gameLogic) {
            if (this.count <= 0) {return false;}

            gameLogic.state.addBuff({
                type: 'regen',
                duration: 10000,
                value: 0.2,
                interval: 1000
            });

            this.count--;
            return this.count <= 0;
        };

        return item;
    },

    /**
     * 创建神秘卷轴
     * @param {number} count - 数量
     * @returns {Item}
     */
    createScroll(count = 1) {
        const item = this.createItem(
            {
                ...BASE_ITEMS.SCROLL,
                type: 'scroll',
                stackable: true,
                maxStack: 3,
                value: 80
            },
            count
        );

        item.use = function (gameLogic) {
            if (this.count <= 0) {return false;}

            const effects = ['speed', 'damage', 'crit', 'regen', 'rage'];
            const randomEffect = effects[Math.floor(Math.random() * effects.length)];

            const durations = {
                speed: 10000,
                damage: 10000,
                crit: 10000,
                regen: 8000,
                rage: 0
            };

            const values = {
                speed: 0.3,
                damage: 0.5,
                crit: 0.5,
                regen: 0.3,
                rage: 50
            };

            if (randomEffect === 'rage') {
                gameLogic.rageSystem.addRage(values[randomEffect]);
            } else {
                gameLogic.state.addBuff({
                    type: randomEffect,
                    duration: durations[randomEffect],
                    value: values[randomEffect]
                });
            }

            this.count--;
            return this.count <= 0;
        };

        return item;
    },

    /**
     * 创建随机掉落物
     * @param {string} rarity - 稀有度
     * @returns {Item}
     */
    createRandomDrop(rarity = 'common') {
        const drops = {
            common: [
                () => this.createGold(10 + Math.floor(Math.random() * 20)),
                () => this.createFood(1),
                () => this.createBomb(1)
            ],
            uncommon: [
                () => this.createGold(30 + Math.floor(Math.random() * 30)),
                () => this.createBomb(2),
                () => this.createKey(1)
            ],
            rare: [
                () => this.createGem(1),
                () => this.createGold(50 + Math.floor(Math.random() * 50)),
                () => this.createScroll(1)
            ],
            epic: [() => this.createGem(2), () => this.createXPBook()],
            legendary: [() => this.createGem(5), () => this.createXPBook()]
        };

        const pool = drops[rarity] || drops.common;
        const factory = pool[Math.floor(Math.random() * pool.length)];
        return factory();
    }
};
