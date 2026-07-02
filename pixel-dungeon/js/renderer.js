/**
 * 渲染器模块
 * 负责Canvas初始化和游戏画面渲染
 */

/**
 * 光影系统类
 * 负责管理游戏中的光源、暗角等光影效果
 */
class LightingSystem {
    /**
     * 构造函数
     */
    constructor() {
        // 光源列表
        this.lights = [];
        
        // 环境暗度
        this.ambientColor = LIGHTING.AMBIENT_COLOR;
        
        // 暗角强度
        this.vignetteStrength = LIGHTING.VIGNETTE_STRENGTH;
    }
    
    /**
     * 添加光源
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} radius - 光源半径
     * @param {string} color - 光源颜色
     * @param {number} intensity - 光源强度（0-1）
     * @param {boolean} flicker - 是否闪烁
     */
    addLight(x, y, radius, color, intensity, flicker = true) {
        this.lights.push({ 
            x, y, radius, color, intensity, 
            flicker: flicker ? 1 : 0,
            flickerSpeed: 0.1 + Math.random() * 0.1,
            flickerOffset: Math.random() * Math.PI * 2
        });
    }
    
    /**
     * 清空所有光源
     */
    clearLights() {
        this.lights = [];
    }
    
    /**
     * 更新光影系统
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        // 更新光源闪烁
        const time = Date.now() / 1000;
        for (const light of this.lights) {
            if (light.flicker > 0) {
                light.flickerValue = 0.9 + Math.sin(time * 10 + light.flickerOffset) * 0.1;
            } else {
                light.flickerValue = 1;
            }
        }
    }
    
    /**
     * 渲染光影效果
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     * @param {number} canvasWidth - 画布宽度
     * @param {number} canvasHeight - 画布高度
     */
    render(ctx, canvasWidth, canvasHeight) {
        ctx.save();
        
        // 先画环境暗度
        ctx.fillStyle = this.ambientColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // 用 destination-out 混合模式"挖"出光源
        ctx.globalCompositeOperation = 'destination-out';
        
        for (const light of this.lights) {
            const radius = light.radius * light.flickerValue;
            if (!isFinite(light.x) || !isFinite(light.y) || !isFinite(radius) || radius <= 0) continue;
            const gradient = ctx.createRadialGradient(
                light.x, light.y, 0,
                light.x, light.y, radius
            );
            gradient.addColorStop(0, `rgba(0, 0, 0, ${light.intensity})`);
            gradient.addColorStop(0.5, `rgba(0, 0, 0, ${light.intensity * 0.5})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(light.x, light.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        // 暗角效果
        const vignetteGradient = ctx.createRadialGradient(
            canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.3,
            canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.8
        );
        vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGradient.addColorStop(1, `rgba(0, 0, 0, ${this.vignetteStrength})`);
        
        ctx.fillStyle = vignetteGradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
}

class Renderer {
    constructor() {
        // Canvas元素
        this.canvas = null;
        this.ctx = null;
        
        // 画布尺寸
        this.width = GAME_WIDTH;
        this.height = GAME_HEIGHT;
        
        // 是否已初始化
        this.initialized = false;
        
        // 调试模式
        this.debug = false;
        
        // 帧率统计
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        // 光影系统
        this.lightingSystem = new LightingSystem();
        
        // ========== 屏幕效果属性 ==========
        
        // 屏幕震动
        this.screenShakeIntensity = 0;
        this.screenShakeDuration = 0;
        this.screenShakeTimer = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        
        // 受伤红边效果
        this.hurtVignetteAlpha = 0;
        this.hurtVignetteTarget = 0;
        
        // 低血量模糊效果
        this.lowHealthBlur = 0;
        
        // 怒气屏幕脉动
        this.ragePulseAlpha = 0;
        
        // 护盾蓝色边缘
        this.shieldVignetteAlpha = 0;
        
        // 暴击屏幕闪光
        this.critFlashAlpha = 0;
        
        // 慢动作冷色调
        this.slowMoColorAlpha = 0;
        
        // 镜头缩放
        this.cameraZoom = 1;
        this.cameraZoomTarget = 1;
        this.cameraZoomSpeed = 0.005;
        
        // 屏幕闪光（白/其他颜色）
        this.screenFlashAlpha = 0;
        this.screenFlashColor = '#ffffff';
        
        // 低血量红色暗角
        this.lowHealthVignetteAlpha = 0;
        this.lowHealthVignettePulse = 0;
        
        // 画质设置
        this.quality = QUALITY_SETTINGS.DEFAULT;
    }
    
    /**
     * 初始化渲染器
     * @param {string|HTMLCanvasElement} canvasTarget - Canvas元素或ID
     */
    init(canvasTarget) {
        // 获取Canvas元素
        if (typeof canvasTarget === 'string') {
            this.canvas = document.getElementById(canvasTarget);
        } else if (canvasTarget instanceof HTMLCanvasElement) {
            this.canvas = canvasTarget;
        } else {
            console.error('无效的Canvas目标');
            return false;
        }
        
        if (!this.canvas) {
            console.error('未找到Canvas元素');
            return false;
        }
        
        // 获取2D渲染上下文
        this.ctx = this.canvas.getContext('2d');
        
        // 设置Canvas尺寸
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // 设置像素风格（禁用抗锯齿）
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        
        // 设置默认字体
        this.ctx.font = '16px "Courier New", monospace';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        this.initialized = true;
        console.log('渲染器初始化完成');
        
        return true;
    }
    
    /**
     * 清除画布
     */
    clear() {
        if (!this.initialized) return;
        
        // 使用背景色清除画布
        this.ctx.fillStyle = COLORS.DUNGEON.BACKGROUND;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    /**
     * 绘制矩形
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {string} color - 颜色
     */
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }
    
    /**
     * 绘制矩形边框
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {string} color - 颜色
     * @param {number} lineWidth - 线宽
     */
    drawRectOutline(x, y, width, height, color, lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(x, y, width, height);
    }
    
    /**
     * 绘制圆形
     * @param {number} x - 圆心X坐标
     * @param {number} y - 圆心Y坐标
     * @param {number} radius - 半径
     * @param {string} color - 颜色
     */
    drawCircle(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * 绘制圆形边框
     * @param {number} x - 圆心X坐标
     * @param {number} y - 圆心Y坐标
     * @param {number} radius - 半径
     * @param {string} color - 颜色
     * @param {number} lineWidth - 线宽
     */
    drawCircleOutline(x, y, radius, color, lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    /**
     * 绘制线条
     * @param {number} x1 - 起始X
     * @param {number} y1 - 起始Y
     * @param {number} x2 - 结束X
     * @param {number} y2 - 结束Y
     * @param {string} color - 颜色
     * @param {number} lineWidth - 线宽
     */
    drawLine(x1, y1, x2, y2, color, lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
    
    /**
     * 绘制文字
     * @param {string} text - 文字内容
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} color - 颜色
     * @param {string} font - 字体
     * @param {string} align - 对齐方式
     */
    drawText(text, x, y, color = '#ffffff', font = '16px "Courier New", monospace', align = 'left') {
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'top';
        
        // 绘制阴影
        this.ctx.fillStyle = COLORS.UI.TEXT_SHADOW;
        this.ctx.fillText(text, x + 2, y + 2);
        
        // 绘制文字
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }
    
    /**
     * 绘制居中文字
     * @param {string} text - 文字内容
     * @param {number} centerX - 中心X坐标
     * @param {number} centerY - 中心Y坐标
     * @param {string} color - 颜色
     * @param {string} font - 字体
     */
    drawCenteredText(text, centerX, centerY, color = '#ffffff', font = '24px "Courier New", monospace') {
        this.ctx.font = font;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // 绘制阴影
        this.ctx.fillStyle = COLORS.UI.TEXT_SHADOW;
        this.ctx.fillText(text, centerX + 2, centerY + 2);
        
        // 绘制文字
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, centerX, centerY);
    }
    
    /**
     * 绘制像素矩形（用于像素风格）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} size - 尺寸
     * @param {string} color - 颜色
     */
    drawPixelRect(x, y, size, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
    }
    
    /**
     * 绘制像素角色（简化版）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} size - 尺寸
     * @param {string} color - 颜色
     * @param {boolean} isFlashing - 是否闪烁
     */
    drawPixelCharacter(x, y, size, color, isFlashing = false) {
        if (isFlashing) {
            // 无敌闪烁效果
            if (Math.floor(Date.now() / PLAYER.FLASH_INTERVAL) % 2 === 0) {
                return;  // 闪烁时不绘制
            }
        }
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
    }
    
    /**
     * 绘制血条
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} current - 当前值
     * @param {number} max - 最大值
     * @param {string} fullColor - 满血颜色
     * @param {string} emptyColor - 空血颜色
     */
    drawHealthBar(x, y, width, height, current, max, fullColor = '#e91e63', emptyColor = '#424242') {
        // 背景
        this.drawRect(x, y, width, height, emptyColor);
        
        // 血条
        if (current > 0) {
            const fillWidth = (current / max) * width;
            this.drawRect(x, y, fillWidth, height, fullColor);
        }
        
        // 边框
        this.drawRectOutline(x, y, width, height, '#ffffff', 2);
    }
    
    /**
     * 绘制心形（像素风格）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} size - 尺寸
     * @param {boolean} filled - 是否填充
     */
    drawHeart(x, y, size, filled = true) {
        const color = filled ? COLORS.UI.HEALTH_FULL : COLORS.UI.HEALTH_EMPTY;
        const pixelSize = size / 3;
        
        this.ctx.fillStyle = color;
        
        // 绘制像素心形
        // 第一行
        this.ctx.fillRect(x + pixelSize, y, pixelSize, pixelSize);
        this.ctx.fillRect(x + pixelSize * 2, y, pixelSize, pixelSize);
        
        // 第二行
        this.ctx.fillRect(x, y + pixelSize, pixelSize, pixelSize);
        this.ctx.fillRect(x + pixelSize, y + pixelSize, pixelSize, pixelSize);
        this.ctx.fillRect(x + pixelSize * 2, y + pixelSize, pixelSize, pixelSize);
        
        // 第三行
        this.ctx.fillRect(x, y + pixelSize * 2, pixelSize, pixelSize);
        this.ctx.fillRect(x + pixelSize * 2, y + pixelSize * 2, pixelSize, pixelSize);
        
        // 第四行
        this.ctx.fillRect(x + pixelSize, y + pixelSize * 3, pixelSize, pixelSize);
    }
    
    /**
     * 绘制生命值（心形图标组）
     * @param {number} x - 起始X坐标
     * @param {number} y - Y坐标
     * @param {number} current - 当前生命值
     * @param {number} max - 最大生命值
     * @param {number} heartSize - 心形尺寸
     */
    drawHearts(x, y, current, max, heartSize = 24) {
        const spacing = heartSize + 4;
        
        for (let i = 0; i < max; i++) {
            const filled = i < current;
            this.drawHeart(x + i * spacing, y, heartSize, filled);
        }
    }
    
    /**
     * 绘制覆盖层（半透明黑色）
     * @param {number} alpha - 透明度（0-1）
     */
    drawOverlay(alpha = 0.7) {
        this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    /**
     * 绘制调试信息
     * @param {Object} info - 调试信息
     */
    drawDebugInfo(info) {
        if (!this.debug) return;
        
        let debugText = [];
        debugText.push(`FPS: ${this.fps}`);
        debugText.push(`State: ${gameState.getState()}`);
        debugText.push(`Mouse: ${Math.floor(inputManager.mouse.worldX)}, ${Math.floor(inputManager.mouse.worldY)}`);
        
        if (info) {
            Object.keys(info).forEach(key => {
                debugText.push(`${key}: ${info[key]}`);
            });
        }
        
        // 绘制调试信息背景
        this.drawRect(10, 10, 200, debugText.length * 20 + 10, 'rgba(0, 0, 0, 0.5)');
        
        // 绘制调试文字
        debugText.forEach((text, index) => {
            this.drawText(text, 20, 20 + index * 20, '#00ff00', '12px monospace');
        });
    }
    
    /**
     * 更新帧率统计
     * @param {number} currentTime - 当前时间戳
     */
    updateFps(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
    }
    
    /**
     * 获取Canvas元素
     */
    getCanvas() {
        return this.canvas;
    }
    
    /**
     * 获取渲染上下文
     */
    getContext() {
        return this.ctx;
    }
    
    /**
     * 设置调试模式
     * @param {boolean} enabled - 是否启用
     */
    setDebug(enabled) {
        this.debug = enabled;
    }
    
    /**
     * 渲染光影效果
     */
    renderLighting() {
        this.lightingSystem.render(this.ctx, this.width, this.height);
    }
    
    /**
     * 更新光影系统
     * @param {number} deltaTime - 时间增量
     */
    updateLighting(deltaTime) {
        this.lightingSystem.update(deltaTime);
    }
    
    /**
     * 更新屏幕效果
     * @param {number} deltaTime - 时间增量
     */
    updateScreenEffects(deltaTime) {
        // 屏幕震动
        if (this.screenShakeTimer > 0) {
            this.screenShakeTimer -= deltaTime;
            const progress = this.screenShakeTimer / this.screenShakeDuration;
            const currentIntensity = this.screenShakeIntensity * progress;
            this.shakeOffsetX = (Math.random() - 0.5) * currentIntensity * 2;
            this.shakeOffsetY = (Math.random() - 0.5) * currentIntensity * 2;
            if (this.screenShakeTimer <= 0) {
                this.shakeOffsetX = 0;
                this.shakeOffsetY = 0;
            }
        }
        
        // 受伤红边渐隐
        if (this.hurtVignetteAlpha > this.hurtVignetteTarget) {
            this.hurtVignetteAlpha -= deltaTime * 0.002;
            if (this.hurtVignetteAlpha < this.hurtVignetteTarget) {
                this.hurtVignetteAlpha = this.hurtVignetteTarget;
            }
        }
        
        // 护盾蓝边渐隐
        if (this.shieldVignetteAlpha > 0) {
            this.shieldVignetteAlpha -= deltaTime * 0.002;
            if (this.shieldVignetteAlpha < 0) {
                this.shieldVignetteAlpha = 0;
            }
        }
        
        // 暴击闪光渐隐
        if (this.critFlashAlpha > 0) {
            this.critFlashAlpha -= deltaTime * 0.005;
            if (this.critFlashAlpha < 0) {
                this.critFlashAlpha = 0;
            }
        }
        
        // 屏幕闪光渐隐
        if (this.screenFlashAlpha > 0) {
            this.screenFlashAlpha -= deltaTime * 0.005;
            if (this.screenFlashAlpha < 0) {
                this.screenFlashAlpha = 0;
            }
        }
        
        // 镜头缩放缓动
        if (Math.abs(this.cameraZoom - this.cameraZoomTarget) > 0.001) {
            this.cameraZoom += (this.cameraZoomTarget - this.cameraZoom) * this.cameraZoomSpeed * deltaTime / 16;
        }
    }
    
    /**
     * 触发屏幕震动
     * @param {number} intensity - 强度
     * @param {number} duration - 持续时间（毫秒）
     */
    shakeScreen(intensity, duration) {
        this.screenShakeIntensity = intensity;
        this.screenShakeDuration = duration;
        this.screenShakeTimer = duration;
    }
    
    /**
     * 触发受伤红边效果
     * @param {number} alpha - 透明度
     */
    triggerHurtVignette(alpha = 0.5) {
        this.hurtVignetteAlpha = alpha;
    }
    
    /**
     * 设置护盾蓝边效果
     * @param {number} alpha - 透明度
     */
    setShieldVignette(alpha = 0.3) {
        this.shieldVignetteAlpha = alpha;
    }
    
    /**
     * 触发暴击闪光
     */
    triggerCritFlash() {
        this.critFlashAlpha = 0.3;
    }
    
    /**
     * 触发屏幕闪光
     * @param {string} color - 颜色
     * @param {number} alpha - 透明度
     */
    triggerScreenFlash(color = '#ffffff', alpha = 0.5) {
        this.screenFlashColor = color;
        this.screenFlashAlpha = alpha;
    }
    
    /**
     * 设置镜头缩放目标
     * @param {number} zoom - 缩放值
     */
    setCameraZoom(zoom) {
        this.cameraZoomTarget = zoom;
    }
    
    /**
     * 重置镜头缩放
     */
    resetCameraZoom() {
        this.cameraZoomTarget = 1;
    }
    
    /**
     * 更新低血量暗角效果
     * @param {number} healthPercent - 玩家血量百分比（0-1）
     * @param {number} deltaTime - 时间增量
     */
    updateLowHealthVignette(healthPercent, deltaTime) {
        if (healthPercent <= 0.3) {
            const targetAlpha = (0.3 - healthPercent) / 0.3 * 0.6;
            this.lowHealthVignetteAlpha += (targetAlpha - this.lowHealthVignetteAlpha) * 0.05;
            this.lowHealthVignettePulse += deltaTime * 0.005;
            const pulse = Math.sin(this.lowHealthVignettePulse) * 0.15;
            this.lowHealthVignetteAlpha = Math.max(0, this.lowHealthVignetteAlpha + pulse);
        } else {
            this.lowHealthVignetteAlpha *= 0.95;
            if (this.lowHealthVignetteAlpha < 0.01) {
                this.lowHealthVignetteAlpha = 0;
            }
        }
    }
    
    /**
     * 渲染屏幕效果（在所有游戏内容渲染完成后调用）
     */
    renderScreenEffects() {
        const ctx = this.ctx;
        
        // 低血量红色暗角（带脉动）
        if (this.lowHealthVignetteAlpha > 0.01) {
            const gradient = ctx.createRadialGradient(
                this.width / 2, this.height / 2, Math.min(this.width, this.height) * 0.2,
                this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.7
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(1, `rgba(180, 0, 0, ${this.lowHealthVignetteAlpha})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // 受伤红边
        if (this.hurtVignetteAlpha > 0.01) {
            const gradient = ctx.createRadialGradient(
                this.width / 2, this.height / 2, Math.min(this.width, this.height) * 0.3,
                this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.7
            );
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
            gradient.addColorStop(1, `rgba(255, 0, 0, ${this.hurtVignetteAlpha})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // 护盾蓝边
        if (this.shieldVignetteAlpha > 0.01) {
            const gradient = ctx.createRadialGradient(
                this.width / 2, this.height / 2, Math.min(this.width, this.height) * 0.4,
                this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.7
            );
            gradient.addColorStop(0, 'rgba(0, 150, 255, 0)');
            gradient.addColorStop(1, `rgba(0, 150, 255, ${this.shieldVignetteAlpha})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // 暴击闪光
        if (this.critFlashAlpha > 0.01) {
            ctx.fillStyle = `rgba(255, 215, 0, ${this.critFlashAlpha})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // 屏幕闪光
        if (this.screenFlashAlpha > 0.01) {
            const color = this.screenFlashColor;
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.screenFlashAlpha})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // 慢动作冷色调
        if (this.slowMoColorAlpha > 0.01) {
            ctx.fillStyle = `rgba(0, 50, 100, ${this.slowMoColorAlpha})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }
    }
    
    /**
     * 添加光源
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} radius - 光源半径
     * @param {string} color - 光源颜色
     * @param {number} intensity - 光源强度
     * @param {boolean} flicker - 是否闪烁
     */
    addLight(x, y, radius, color, intensity, flicker = true) {
        this.lightingSystem.addLight(x, y, radius, color, intensity, flicker);
    }
    
    /**
     * 清空所有光源
     */
    clearLights() {
        this.lightingSystem.clearLights();
    }
}

// 创建全局渲染器实例
const renderer = new Renderer();