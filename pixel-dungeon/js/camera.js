/**
 * 相机系统类
 * 负责屏幕震动、相机跟随等功能
 */

class Camera {
    constructor() {
        // 相机位置
        this.x = 0;
        this.y = 0;
        
        // 震动偏移
        this.shakeX = 0;
        this.shakeY = 0;
        
        // 震动参数
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeTimer = 0;
        
        // 跟随目标
        this.followTarget = null;
        
        // 跟随平滑度（0-1，越小越平滑）
        this.followSmoothness = 0.1;
        
        // 是否启用跟随
        this.enableFollow = false;
    }
    
    /**
     * 触发屏幕震动
     * @param {number} intensity - 震动强度（像素）
     * @param {number} duration - 震动持续时间（毫秒）
     */
    shake(intensity, duration) {
        // 取较大的强度，确保强震动不会被弱震动覆盖
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
        this.shakeDuration = Math.max(this.shakeDuration, duration);
        this.shakeTimer = duration;
    }
    
    /**
     * 设置跟随目标
     * @param {Object} target - 跟随目标对象（需要有x和y属性）
     */
    setFollowTarget(target) {
        this.followTarget = target;
        this.enableFollow = target !== null;
    }
    
    /**
     * 直接设置相机位置，硬切换无平滑过渡
     * @param {number} x - 目标X坐标
     * @param {number} y - 目标Y坐标
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    /**
     * 更新相机
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    update(deltaTime) {
        // 更新震动
        this.updateShake(deltaTime);
        
        // 更新跟随
        this.updateFollow(deltaTime);
    }
    
    /**
     * 更新震动效果
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updateShake(deltaTime) {
        if (this.shakeTimer > 0) {
            this.shakeTimer -= deltaTime;
            
            // 计算当前震动强度（随时间衰减）
            const progress = Math.max(0, this.shakeTimer / this.shakeDuration);
            const currentIntensity = this.shakeIntensity * progress;
            
            // 随机震动偏移
            this.shakeX = (Math.random() - 0.5) * currentIntensity * 2;
            this.shakeY = (Math.random() - 0.5) * currentIntensity * 2;
            
            // 震动结束，重置参数
            if (this.shakeTimer <= 0) {
                this.shakeTimer = 0;
                this.shakeIntensity = 0;
                this.shakeDuration = 0;
                this.shakeX = 0;
                this.shakeY = 0;
            }
        }
    }
    
    /**
     * 更新相机跟随
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updateFollow(deltaTime) {
        if (!this.enableFollow || !this.followTarget) return;
        
        // 目标位置（目标在屏幕中心）
        const targetX = this.followTarget.x - GAME_WIDTH / 2;
        const targetY = this.followTarget.y - GAME_HEIGHT / 2;
        
        // 平滑跟随
        this.x += (targetX - this.x) * this.followSmoothness;
        this.y += (targetY - this.y) * this.followSmoothness;
    }
    
    /**
     * 应用相机变换到Canvas上下文
     * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
     */
    apply(ctx) {
        ctx.translate(-this.x + this.shakeX, -this.y + this.shakeY);
    }
    
    /**
     * 重置相机
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.shakeX = 0;
        this.shakeY = 0;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeTimer = 0;
        this.followTarget = null;
        this.enableFollow = false;
    }
    
    /**
     * 获取当前震动强度
     * @returns {number} 当前震动强度
     */
    getCurrentShakeIntensity() {
        if (this.shakeTimer <= 0) return 0;
        const progress = this.shakeTimer / this.shakeDuration;
        return this.shakeIntensity * progress;
    }
}

// 创建全局相机实例
const camera = new Camera();
