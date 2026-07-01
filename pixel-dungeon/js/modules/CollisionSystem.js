/**
 * 碰撞检测系统
 * 从 GameLogic 中提取碰撞检测相关方法
 */
class CollisionSystem {
    constructor({ eventBus, gameLogic }) {
        this.eventBus = eventBus;
        this.gameLogic = gameLogic;
    }

    /**
     * 检查两个实体是否碰撞（AABB）
     * @param {Object} a - 实体A
     * @param {Object} b - 实体B
     */
    checkCollision(a, b) {
        const sizeA = a.size || PIXEL_SIZE.PLAYER;
        const sizeB = b.size || PIXEL_SIZE.ENEMY;

        return a.x - sizeA / 2 < b.x + sizeB / 2 &&
               a.x + sizeA / 2 > b.x - sizeB / 2 &&
               a.y - sizeA / 2 < b.y + sizeB / 2 &&
               a.y + sizeA / 2 > b.y - sizeB / 2;
    }

    /**
     * 检查子弹与目标碰撞
     * @param {Object} bullet - 子弹
     * @param {Object} target - 目标
     */
    checkBulletCollision(bullet, target) {
        const targetSize = target.size || PIXEL_SIZE.ENEMY;
        const bulletSize = PIXEL_SIZE.BULLET;

        return bullet.x - bulletSize / 2 < target.x + targetSize / 2 &&
               bullet.x + bulletSize / 2 > target.x - targetSize / 2 &&
               bullet.y - bulletSize / 2 < target.y + targetSize / 2 &&
               bullet.y + bulletSize / 2 > target.y - targetSize / 2;
    }
}
