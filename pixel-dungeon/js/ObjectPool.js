/**
 * 对象池类
 * 用于复用对象，减少频繁创建和销毁带来的性能开销
 */
class ObjectPool {
    constructor(createFunction, maxSize = 100) {
        this.createFunction = createFunction;
        this.maxSize = maxSize;
        this.pool = [];
        this.activeObjects = [];
    }

    acquire(...args) {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
            this.resetObject(obj, ...args);
        } else {
            obj = this.createFunction(...args);
        }
        obj.active = true;
        this.activeObjects.push(obj);
        return obj;
    }

    release(obj) {
        obj.active = false;
        const index = this.activeObjects.indexOf(obj);
        if (index !== -1) {
            this.activeObjects.splice(index, 1);
        }
        if (this.pool.length < this.maxSize) {
            this.pool.push(obj);
        }
    }

    releaseAll() {
        for (const obj of this.activeObjects) {
            obj.active = false;
            if (this.pool.length < this.maxSize) {
                this.pool.push(obj);
            }
        }
        this.activeObjects = [];
    }

    resetObject(obj, ...args) {
        obj.x = args[0] || 0;
        obj.y = args[1] || 0;
        obj.age = 0;
        obj.distanceTraveled = 0;
        if (obj.trail) {
            obj.trail = [];
        }
        if (obj.penetrateCount !== undefined) {
            obj.penetrateCount = obj.penetrateMax || 0;
        }
        if (obj.boomerangReturned !== undefined) {
            obj.boomerangReturned = false;
        }
        if (obj.startX !== undefined) {
            obj.startX = args[0] || 0;
            obj.startY = args[1] || 0;
        }
    }

    getActiveObjects() {
        return this.activeObjects;
    }

    getPoolSize() {
        return this.pool.length;
    }

    getActiveCount() {
        return this.activeObjects.length;
    }
}
