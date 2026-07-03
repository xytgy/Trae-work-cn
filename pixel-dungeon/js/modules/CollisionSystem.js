/**
 * 碰撞检测系统
 * 从 GameLogic 中提取碰撞检测相关方法
 */
class CollisionSystem {
    constructor({ eventBus, gameLogic }) {
        this.eventBus = eventBus;
        this.gameLogic = gameLogic;
        this.quadTree = null;
        this.initQuadTree();
    }

    initQuadTree() {
        this.quadTree = new QuadTree(
            { x: 0, y: 0, width: GAME_WIDTH * 10, height: GAME_HEIGHT * 10 },
            10,
            5
        );
    }

    clearQuadTree() {
        if (this.quadTree) {
            this.quadTree.clear();
        }
    }

    insertIntoQuadTree(entities) {
        if (!this.quadTree) return;

        entities.forEach((entity) => {
            if (entity && entity.active !== false && typeof entity.x === 'number' && typeof entity.y === 'number') {
                const size = entity.size || 16;
                this.quadTree.insert({
                    x: entity.x - size / 2,
                    y: entity.y - size / 2,
                    width: size,
                    height: size,
                    entity: entity
                });
            }
        });
    }

    queryQuadTree(entity) {
        if (!this.quadTree) return [];

        const size = entity.size || 16;
        const rect = {
            x: entity.x - size / 2,
            y: entity.y - size / 2,
            width: size,
            height: size
        };

        return this.quadTree.query(rect).map((item) => item.entity);
    }

    /**
     * 检查两个实体是否碰撞（AABB）
     * @param {Object} a - 实体A
     * @param {Object} b - 实体B
     */
    checkCollision(a, b) {
        const sizeA = a.size || PIXEL_SIZE.PLAYER;
        const sizeB = b.size || PIXEL_SIZE.ENEMY;

        return (
            a.x - sizeA / 2 < b.x + sizeB / 2 &&
            a.x + sizeA / 2 > b.x - sizeB / 2 &&
            a.y - sizeA / 2 < b.y + sizeB / 2 &&
            a.y + sizeA / 2 > b.y - sizeB / 2
        );
    }

    /**
     * 检查子弹与目标碰撞
     * @param {Object} bullet - 子弹
     * @param {Object} target - 目标
     */
    checkBulletCollision(bullet, target) {
        const targetSize = target.size || PIXEL_SIZE.ENEMY;
        const bulletSize = PIXEL_SIZE.BULLET;

        return (
            bullet.x - bulletSize / 2 < target.x + targetSize / 2 &&
            bullet.x + bulletSize / 2 > target.x - targetSize / 2 &&
            bullet.y - bulletSize / 2 < target.y + targetSize / 2 &&
            bullet.y + bulletSize / 2 > target.y - targetSize / 2
        );
    }

    /**
     * 检查玩家与墙壁碰撞
     * @param {number} x - 玩家X坐标（世界坐标）
     * @param {number} y - 玩家Y坐标（世界坐标）
     * @param {number} width - 玩家宽度
     * @param {number} height - 玩家高度
     */
    checkWallCollision(x, y, width, height) {
        if (game.dungeonLevel && game.dungeonLevel.corridors) {
            for (const corridor of game.dungeonLevel.corridors) {
                if (this.checkCorridorCollision(x, y, width, height, corridor)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 检查玩家与走廊墙壁碰撞
     * @param {number} x - 玩家X坐标（世界坐标）
     * @param {number} y - 玩家Y坐标（世界坐标）
     * @param {number} width - 玩家宽度
     * @param {number} height - 玩家高度
     * @param {Object} corridor - 走廊对象
     */
    checkCorridorCollision(x, y, width, height, corridor) {
        const wallThickness = 20;

        if (corridor.direction === 'right' || corridor.direction === 'left') {
            const topWallBottom = corridor.top;
            const topWallTop = corridor.top - wallThickness;
            const bottomWallTop = corridor.bottom;
            const bottomWallBottom = corridor.bottom + wallThickness;

            if (x < corridor.right && x + width > corridor.left) {
                if (y < topWallBottom && y + height > topWallTop) {
                    return true;
                }
                if (y < bottomWallBottom && y + height > bottomWallTop) {
                    return true;
                }
            }
        } else {
            const leftWallRight = corridor.left;
            const leftWallLeft = corridor.left - wallThickness;
            const rightWallLeft = corridor.right;
            const rightWallRight = corridor.right + wallThickness;

            if (y < corridor.bottom && y + height > corridor.top) {
                if (x < leftWallRight && x + width > leftWallLeft) {
                    return true;
                }
                if (x < rightWallRight && x + width > rightWallLeft) {
                    return true;
                }
            }
        }

        return false;
    }
}
