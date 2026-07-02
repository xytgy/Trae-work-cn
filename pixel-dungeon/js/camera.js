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
        
        // 过渡动画属性
        this.transitioning = false;
        this.transitionStartX = 0;
        this.transitionStartY = 0;
        this.transitionTargetX = 0;
        this.transitionTargetY = 0;
        this.transitionDuration = 0;
        this.transitionTimer = 0;
        this.onTransitionComplete = null;
        
        // 相机模式
        this.mode = 'explore';
        
        // 锁定边界
        this.lockLeft = -Infinity;
        this.lockRight = Infinity;
        this.lockTop = -Infinity;
        this.lockBottom = Infinity;
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
     * 设置相机模式
     * @param {string} mode - 相机模式（'explore' 或 'battle'）
     */
    setMode(mode) {
        this.mode = mode;
    }
    
    /**
     * 设置锁定边界
     * @param {number} left - 左边界
     * @param {number} right - 右边界
     * @param {number} top - 上边界
     * @param {number} bottom - 下边界
     */
    setLockBounds(left, right, top, bottom) {
        this.lockLeft = left;
        this.lockRight = right;
        this.lockTop = top;
        this.lockBottom = bottom;
    }
    
    /**
     * 清除锁定边界
     */
    clearLockBounds() {
        this.lockLeft = -Infinity;
        this.lockRight = Infinity;
        this.lockTop = -Infinity;
        this.lockBottom = Infinity;
    }
    
    /**
     * 开始相机过渡动画
     * @param {number} fromX - 起始X坐标
     * @param {number} fromY - 起始Y坐标
     * @param {number} toX - 目标X坐标
     * @param {number} toY - 目标Y坐标
     * @param {number} duration - 过渡持续时间（毫秒）
     * @param {function} onComplete - 过渡完成回调
     */
    startTransition(fromX, fromY, toX, toY, duration, onComplete) {
        this.transitionStartX = fromX;
        this.transitionStartY = fromY;
        this.transitionTargetX = toX;
        this.transitionTargetY = toY;
        this.transitionDuration = duration;
        this.transitionTimer = duration;
        this.onTransitionComplete = onComplete;
        this.transitioning = true;
        
        this.x = fromX;
        this.y = fromY;
    }
    
    /**
     * 更新相机
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    update(deltaTime) {
        // 更新震动
        this.updateShake(deltaTime);
        
        // 过渡期间优先处理插值
        if (this.transitioning) {
            this.transitionTimer -= deltaTime;
            
            if (this.transitionTimer <= 0) {
                this.x = this.transitionTargetX;
                this.y = this.transitionTargetY;
                this.transitioning = false;
                
                if (this.onTransitionComplete) {
                    this.onTransitionComplete();
                    this.onTransitionComplete = null;
                }
            } else {
                const t = 1 - this.transitionTimer / this.transitionDuration;
                const easedT = t * t * (3 - 2 * t);
                
                this.x = this.transitionStartX + (this.transitionTargetX - this.transitionStartX) * easedT;
                this.y = this.transitionStartY + (this.transitionTargetY - this.transitionStartY) * easedT;
            }
        } else {
            // 更新跟随
            this.updateFollow(deltaTime);
        }
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
        
        const targetX = this.followTarget.x - GAME_WIDTH / 2;
        const targetY = this.followTarget.y - GAME_HEIGHT / 2;
        
        this.x += (targetX - this.x) * this.followSmoothness;
        this.y += (targetY - this.y) * this.followSmoothness;
        
        if (this.mode === 'battle') {
            this.x = Math.max(this.lockLeft, Math.min(this.x, this.lockRight - GAME_WIDTH));
            this.y = Math.max(this.lockTop, Math.min(this.y, this.lockBottom - GAME_HEIGHT));
        }
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
        
        // 重置过渡动画属性
        this.transitioning = false;
        this.transitionStartX = 0;
        this.transitionStartY = 0;
        this.transitionTargetX = 0;
        this.transitionTargetY = 0;
        this.transitionDuration = 0;
        this.transitionTimer = 0;
        this.onTransitionComplete = null;
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
