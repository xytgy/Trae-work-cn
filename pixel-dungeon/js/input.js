/**
 * 输入处理模块
 * 负责管理键盘、鼠标和手柄输入
 * 包含输入缓冲、手柄震动、鼠标灵敏度等功能
 */

class InputManager {
    constructor() {
        // 键盘按键状态
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            shoot: false,
            switchWeapon: false,
            pause: false,
            skill: false,
            interact: false
        };
        
        // 鼠标状态
        this.mouse = {
            x: 0,
            y: 0,
            clicked: false,
            worldX: 0,
            worldY: 0,
            smoothedX: 0,
            smoothedY: 0
        };
        
        // 按键映射
        this.keyMap = {
            'KeyW': 'up',
            'ArrowUp': 'up',
            'KeyS': 'down',
            'ArrowDown': 'down',
            'KeyA': 'left',
            'ArrowLeft': 'left',
            'KeyD': 'right',
            'ArrowRight': 'right',
            'KeyQ': 'switchWeapon',
            'KeyP': 'pause',
            'Escape': 'pause',
            'KeyE': 'skill',
            'KeyF': 'interact',
            'Space': 'skill'
        };
        
        // 回调函数
        this.callbacks = {
            onMove: [],
            onShoot: [],
            onShootRelease: [],
            onSwitchWeapon: [],
            onPause: [],
            onSkill: [],
            onInteract: []
        };
        
        // Canvas引用
        this.canvas = null;
        this.canvasRect = null;
        
        // 输入缓冲系统
        this.inputBuffer = {
            enabled: INPUT_BUFFER.ENABLED,
            buffers: {
                dash: { time: 0, duration: INPUT_BUFFER.DASH },
                shoot: { time: 0, duration: INPUT_BUFFER.SHOOT },
                skill: { time: 0, duration: INPUT_BUFFER.SKILL },
                switchWeapon: { time: 0, duration: INPUT_BUFFER.WEAPON_SWITCH },
                interact: { time: 0, duration: INPUT_BUFFER.INTERACT }
            }
        };
        
        // 手柄状态
        this.gamepad = {
            enabled: GAMEPAD.ENABLED,
            connected: false,
            gamepadIndex: null,
            axes: {
                leftX: 0,
                leftY: 0,
                rightX: 0,
                rightY: 0
            },
            buttons: {},
            lastButtonStates: {},
            vibration: {
                active: false,
                endTime: 0
            }
        };
        
        // 瞄准增强（LT键按下时加强辅助瞄准）
        this.aimBoostActive = false;
        
        // 初始化事件监听
        this.init();
    }
    
    /**
     * 初始化输入管理器
     */
    init() {
        // 键盘事件（用 window 而非 document，避免触控板/点击导致焦点丢失）
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));

        // 鼠标事件
        window.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));

        // 防止右键菜单
        document.addEventListener('contextmenu', e => e.preventDefault());

        // 手柄连接事件
        if (GAMEPAD.ENABLED && 'ongamepadconnected' in window) {
            window.addEventListener('gamepadconnected', this.onGamepadConnected.bind(this));
            window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected.bind(this));
        }
    }
    
    /**
     * 设置Canvas引用
     */
    setCanvas(canvas) {
        this.canvas = canvas;
        this.updateCanvasRect();
    }
    
    /**
     * 更新Canvas位置信息
     */
    updateCanvasRect() {
        if (this.canvas) {
            this.canvasRect = this.canvas.getBoundingClientRect();
        }
    }
    
    // ==================== 键盘事件 ====================
    
    /**
     * 键盘按下处理
     */
    onKeyDown(e) {
        const key = this.keyMap[e.code];

        if (key) {
            if (e.repeat) return;
            
            this.keys[key] = true;
            
            // 添加到输入缓冲
            this.addToBuffer(key);
            
            // 触发对应事件
            if (key === 'pause') {
                this.triggerPause();
            }
            if (key === 'switchWeapon') {
                this.triggerSwitchWeapon();
            }
            if (key === 'skill') {
                this.triggerSkill();
            }
            if (key === 'interact') {
                this.triggerInteract();
            }
            
            e.preventDefault();
        }
    }
    
    /**
     * 键盘释放处理
     */
    onKeyUp(e) {
        const key = this.keyMap[e.code];
        
        if (key) {
            this.keys[key] = false;
            e.preventDefault();
        }
    }
    
    // ==================== 鼠标事件 ====================
    
    /**
     * 鼠标按下处理
     */
    onMouseDown(e) {
        if (e.button === 0) {
            this.keys.shoot = true;
            this.mouse.clicked = true;
            this.addToBuffer('shoot');
            this.triggerShoot();
        }
    }
    
    /**
     * 鼠标释放处理
     */
    onMouseUp(e) {
        if (e.button === 0) {
            this.keys.shoot = false;
            this.triggerShootRelease();
        }
    }
    
    /**
     * 鼠标移动处理
     */
    onMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        
        this.updateMouseWorldPosition();
        
        // 鼠标平滑处理
        if (MOUSE.SMOOTHING && typeof settingsManager !== 'undefined') {
            const smoothingFactor = MOUSE.SMOOTHING_FACTOR;
            this.mouse.smoothedX += (this.mouse.worldX - this.mouse.smoothedX) * smoothingFactor;
            this.mouse.smoothedY += (this.mouse.worldY - this.mouse.smoothedY) * smoothingFactor;
        } else {
            this.mouse.smoothedX = this.mouse.worldX;
            this.mouse.smoothedY = this.mouse.worldY;
        }
    }
    
    /**
     * 更新鼠标世界坐标
     */
    updateMouseWorldPosition() {
        if (!this.canvas || !this.canvasRect) {
            this.updateCanvasRect();
        }
        
        if (this.canvas && this.canvasRect) {
            const scaleX = this.canvas.width / this.canvasRect.width;
            const scaleY = this.canvas.height / this.canvasRect.height;
            
            this.mouse.worldX = (this.mouse.x - this.canvasRect.left) * scaleX;
            this.mouse.worldY = (this.mouse.y - this.canvasRect.top) * scaleY;
        }
    }
    
    // ==================== 手柄事件 ====================
    
    /**
     * 手柄连接事件
     */
    onGamepadConnected(e) {
        console.log('手柄已连接:', e.gamepad.id);
        this.gamepad.connected = true;
        this.gamepad.gamepadIndex = e.gamepad.index;
        
        // 初始化按钮状态
        for (let i = 0; i < e.gamepad.buttons.length; i++) {
            this.gamepad.lastButtonStates[i] = false;
        }
    }
    
    /**
     * 手柄断开连接事件
     */
    onGamepadDisconnected(e) {
        console.log('手柄已断开:', e.gamepad.id);
        if (this.gamepad.gamepadIndex === e.gamepad.index) {
            this.gamepad.connected = false;
            this.gamepad.gamepadIndex = null;
        }
    }
    
    /**
     * 更新手柄状态（每帧调用）
     */
    updateGamepad() {
        if (!GAMEPAD.ENABLED) return;
        
        // 获取游戏手柄列表
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        let gamepad = null;
        
        // 查找已连接的手柄
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                gamepad = gamepads[i];
                if (!this.gamepad.connected || this.gamepad.gamepadIndex !== i) {
                    this.gamepad.connected = true;
                    this.gamepad.gamepadIndex = i;
                    console.log('手柄已连接:', gamepad.id);
                }
                break;
            }
        }
        
        if (!gamepad) {
            this.gamepad.connected = false;
            return;
        }
        
        const deadZone = typeof settingsManager !== 'undefined' 
            ? settingsManager.getGamepadDeadZone() 
            : GAMEPAD.DEAD_ZONE_LEFT;
        const sensitivity = typeof settingsManager !== 'undefined'
            ? settingsManager.getGamepadSensitivity()
            : GAMEPAD.SENSITIVITY_LEFT;
        
        // 更新左摇杆（移动）
        let leftX = gamepad.axes[GAMEPAD.AXES.LEFT_X] || 0;
        let leftY = gamepad.axes[GAMEPAD.AXES.LEFT_Y] || 0;
        
        // 死区处理
        if (Math.abs(leftX) < deadZone) leftX = 0;
        if (Math.abs(leftY) < deadZone) leftY = 0;
        
        // 应用灵敏度
        leftX *= sensitivity;
        leftY *= sensitivity;
        
        // 归一化（防止对角线速度过快）
        const leftMagnitude = Math.sqrt(leftX * leftX + leftY * leftY);
        if (leftMagnitude > 1) {
            leftX /= leftMagnitude;
            leftY /= leftMagnitude;
        }
        
        this.gamepad.axes.leftX = leftX;
        this.gamepad.axes.leftY = leftY;
        
        // 更新右摇杆（瞄准）
        let rightX = gamepad.axes[GAMEPAD.AXES.RIGHT_X] || 0;
        let rightY = gamepad.axes[GAMEPAD.AXES.RIGHT_Y] || 0;
        
        // 死区处理
        if (Math.abs(rightX) < deadZone) rightX = 0;
        if (Math.abs(rightY) < deadZone) rightY = 0;
        
        // 应用灵敏度
        rightX *= sensitivity;
        rightY *= sensitivity;
        
        this.gamepad.axes.rightX = rightX;
        this.gamepad.axes.rightY = rightY;
        
        // 更新按键状态
        for (let i = 0; i < gamepad.buttons.length; i++) {
            const pressed = gamepad.buttons[i].pressed;
            const wasPressed = this.gamepad.lastButtonStates[i] || false;
            
            // 保存当前状态
            this.gamepad.buttons[i] = pressed;
            
            // 检测按下事件（上升沿）
            if (pressed && !wasPressed) {
                this.onGamepadButtonDown(i);
            }
            
            // 检测释放事件（下降沿）
            if (!pressed && wasPressed) {
                this.onGamepadButtonUp(i);
            }
            
            // 更新上一帧状态
            this.gamepad.lastButtonStates[i] = pressed;
        }
        
        // 右摇杆作为瞄准输入（如果有输入）
        const rightMagnitude = Math.sqrt(rightX * rightX + rightY * rightY);
        if (rightMagnitude > 0) {
            // 使用右摇杆方向作为瞄准方向
            // 这里只是保存摇杆状态，实际瞄准由游戏逻辑处理
        }
        
        // RT键射击（轴或按钮）
        const rtValue = gamepad.buttons[GAMEPAD.BUTTONS.RT] ? 
            (typeof gamepad.buttons[GAMEPAD.BUTTONS.RT].value === 'number' ? 
                gamepad.buttons[GAMEPAD.BUTTONS.RT].value : 
                (gamepad.buttons[GAMEPAD.BUTTONS.RT].pressed ? 1 : 0)) : 0;
        
        const wasShooting = this.keys.shoot;
        const isShooting = rtValue > GAMEPAD.TRIGGER_THRESHOLD;
        
        // 如果手柄在射击，覆盖键盘/鼠标状态
        if (rightMagnitude > 0.3) {
            this.keys.shoot = isShooting;
            if (isShooting && !wasShooting) {
                this.addToBuffer('shoot');
                this.triggerShoot();
            }
            if (!isShooting && wasShooting) {
                this.triggerShootRelease();
            }
        }
        
        // LT键瞄准增强
        const ltValue = gamepad.buttons[GAMEPAD.BUTTONS.LT] ?
            (typeof gamepad.buttons[GAMEPAD.BUTTONS.LT].value === 'number' ?
                gamepad.buttons[GAMEPAD.BUTTONS.LT].value :
                (gamepad.buttons[GAMEPAD.BUTTONS.LT].pressed ? 1 : 0)) : 0;
        this.aimBoostActive = ltValue > GAMEPAD.TRIGGER_THRESHOLD;
    }
    
    /**
     * 手柄按键按下处理
     */
    onGamepadButtonDown(buttonIndex) {
        switch (buttonIndex) {
            case GAMEPAD.BUTTONS.A:
                this.addToBuffer('skill');
                this.triggerSkill();
                break;
            case GAMEPAD.BUTTONS.B:
                // 技能2
                break;
            case GAMEPAD.BUTTONS.X:
                // 技能3
                break;
            case GAMEPAD.BUTTONS.Y:
                this.addToBuffer('interact');
                this.triggerInteract();
                break;
            case GAMEPAD.BUTTONS.LB:
            case GAMEPAD.BUTTONS.RB:
                this.addToBuffer('switchWeapon');
                this.triggerSwitchWeapon();
                break;
            case GAMEPAD.BUTTONS.START:
                this.triggerPause();
                break;
            case GAMEPAD.BUTTONS.BACK:
                // 地图/背包
                break;
        }
    }
    
    /**
     * 手柄按键释放处理
     */
    onGamepadButtonUp(buttonIndex) {
        // 处理按键释放事件
    }
    
    /**
     * 触发手柄震动
     * @param {string} type - 震动类型 (shoot, hurt, pickup, explosion)
     */
    vibrate(type) {
        if (!this.gamepad.connected) return;
        if (!GAMEPAD.VIBRATION[type]) return;
        
        const vibrationConfig = GAMEPAD.VIBRATION[type];
        const intensity = vibrationConfig.intensity * GAMEPAD.VIBRATION_INTENSITY;
        
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gamepad = gamepads[this.gamepad.gamepadIndex];
        
        if (gamepad && gamepad.vibrationActuator) {
            gamepad.vibrationActuator.playEffect('dual-rumble', {
                startDelay: 0,
                duration: vibrationConfig.duration,
                weakMagnitude: intensity * 0.5,
                strongMagnitude: intensity
            });
        }
    }
    
    // ==================== 输入缓冲 ====================
    
    /**
     * 添加输入到缓冲
     * @param {string} action - 操作名称
     */
    addToBuffer(action) {
        if (!this.inputBuffer.enabled) return;
        
        const bufferMap = {
            'skill': 'dash',
            'shoot': 'shoot',
            'switchWeapon': 'switchWeapon',
            'interact': 'interact'
        };
        
        const bufferKey = bufferMap[action];
        if (bufferKey && this.inputBuffer.buffers[bufferKey]) {
            this.inputBuffer.buffers[bufferKey].time = this.inputBuffer.buffers[bufferKey].duration;
        }
    }
    
    /**
     * 检查缓冲中是否有输入
     * @param {string} bufferName - 缓冲名称 (dash, shoot, skill, switchWeapon, interact)
     * @returns {boolean} 是否有缓冲输入
     */
    hasBufferedInput(bufferName) {
        if (!this.inputBuffer.enabled) return false;
        if (!this.inputBuffer.buffers[bufferName]) return false;
        return this.inputBuffer.buffers[bufferName].time > 0;
    }
    
    /**
     * 消耗缓冲输入
     * @param {string} bufferName - 缓冲名称
     * @returns {boolean} 是否成功消耗
     */
    consumeBuffer(bufferName) {
        if (this.hasBufferedInput(bufferName)) {
            this.inputBuffer.buffers[bufferName].time = 0;
            return true;
        }
        return false;
    }
    
    /**
     * 更新输入缓冲（每帧调用）
     * @param {number} deltaTime - 时间增量（毫秒）
     */
    updateInputBuffer(deltaTime) {
        if (!this.inputBuffer.enabled) return;
        
        for (const key in this.inputBuffer.buffers) {
            if (this.inputBuffer.buffers[key].time > 0) {
                this.inputBuffer.buffers[key].time -= deltaTime;
                if (this.inputBuffer.buffers[key].time < 0) {
                    this.inputBuffer.buffers[key].time = 0;
                }
            }
        }
    }
    
    // ==================== 输入获取方法 ====================
    
    /**
     * 获取移动向量（整合键盘和手柄）
     * @returns {Object} 移动向量 {x, y}
     */
    getMovementVector() {
        let dx = 0;
        let dy = 0;
        
        // 键盘输入
        if (this.keys.up) dy -= 1;
        if (this.keys.down) dy += 1;
        if (this.keys.left) dx -= 1;
        if (this.keys.right) dx += 1;
        
        // 手柄输入（如果已连接且有输入）
        if (this.gamepad.connected) {
            if (Math.abs(this.gamepad.axes.leftX) > 0.01 || Math.abs(this.gamepad.axes.leftY) > 0.01) {
                dx = this.gamepad.axes.leftX;
                dy = this.gamepad.axes.leftY;
            }
        }
        
        // 归一化对角线移动（仅键盘输入时）
        if (!this.gamepad.connected && dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }
        
        return { x: dx, y: dy };
    }
    
    /**
     * 获取瞄准目标位置
     * @param {Object} playerPos - 玩家位置 {x, y}
     * @returns {Object} 瞄准位置 {x, y}
     */
    getAimTarget(playerPos) {
        // 优先使用鼠标瞄准
        if (this.mouse.worldX !== 0 || this.mouse.worldY !== 0) {
            return {
                x: this.mouse.smoothedX,
                y: this.mouse.smoothedY
            };
        }
        
        // 手柄右摇杆瞄准
        if (this.gamepad.connected) {
            const rightX = this.gamepad.axes.rightX;
            const rightY = this.gamepad.axes.rightY;
            
            if (Math.abs(rightX) > 0.1 || Math.abs(rightY) > 0.1) {
                // 右摇杆方向作为瞄准方向，距离设为固定值
                const aimDistance = 200;
                return {
                    x: playerPos.x + rightX * aimDistance,
                    y: playerPos.y + rightY * aimDistance
                };
            }
        }
        
        // 默认返回玩家位置（无瞄准输入）
        return { x: playerPos.x, y: playerPos.y };
    }
    
    /**
     * 获取鼠标世界坐标
     */
    getMouseWorldPosition() {
        return {
            x: this.mouse.worldX,
            y: this.mouse.worldY
        };
    }
    
    /**
     * 获取鼠标相对于玩家的方向
     */
    getMouseDirection(playerPos) {
        const dx = this.mouse.worldX - playerPos.x;
        const dy = this.mouse.worldY - playerPos.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) {
            return { x: 0, y: 0 };
        }
        
        return {
            x: dx / length,
            y: dy / length
        };
    }
    
    /**
     * 检查是否正在射击
     */
    isShooting() {
        return this.keys.shoot;
    }
    
    /**
     * 检查是否有移动输入
     */
    isMoving() {
        return this.keys.up || this.keys.down || this.keys.left || this.keys.right ||
               (this.gamepad.connected && 
                (Math.abs(this.gamepad.axes.leftX) > 0.1 || 
                 Math.abs(this.gamepad.axes.leftY) > 0.1));
    }
    
    /**
     * 检查瞄准增强是否激活（LT键）
     */
    isAimBoostActive() {
        return this.aimBoostActive;
    }
    
    // ==================== 事件触发方法 ====================
    
    triggerShoot() {
        this.callbacks.onShoot.forEach(cb => cb(this.getMouseWorldPosition()));
    }
    
    triggerShootRelease() {
        this.callbacks.onShootRelease.forEach(cb => cb());
    }
    
    triggerSwitchWeapon() {
        this.callbacks.onSwitchWeapon.forEach(cb => cb());
    }
    
    triggerPause() {
        this.callbacks.onPause.forEach(cb => cb());
    }
    
    triggerSkill() {
        this.callbacks.onSkill.forEach(cb => cb());
    }
    
    triggerInteract() {
        this.callbacks.onInteract.forEach(cb => cb());
    }
    
    // ==================== 回调注册 ====================
    
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }
    
    off(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
    }
    
    // ==================== 更新方法（每帧调用） ====================
    
    /**
     * 每帧更新输入状态
     * @param {number} deltaTime - 时间增量（毫秒）
     */
    update(deltaTime) {
        // 更新手柄状态
        this.updateGamepad();
        
        // 更新输入缓冲
        this.updateInputBuffer(deltaTime);
        
        // 更新鼠标平滑
        if (!MOUSE.SMOOTHING) {
            this.mouse.smoothedX = this.mouse.worldX;
            this.mouse.smoothedY = this.mouse.worldY;
        }
    }
    
    /**
     * 重置所有输入状态
     */
    reset() {
        this.keys.up = false;
        this.keys.down = false;
        this.keys.left = false;
        this.keys.right = false;
        this.keys.shoot = false;
        this.keys.switchWeapon = false;
        this.keys.pause = false;
        this.keys.skill = false;
        this.keys.interact = false;
        this.mouse.clicked = false;
        
        // 重置输入缓冲
        for (const key in this.inputBuffer.buffers) {
            this.inputBuffer.buffers[key].time = 0;
        }
    }
    
    /**
     * 销毁输入管理器
     */
    destroy() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('contextmenu', e => e.preventDefault());
        
        if ('ongamepadconnected' in window) {
            window.removeEventListener('gamepadconnected', this.onGamepadConnected);
            window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);
        }
        
        this.callbacks = {
            onMove: [],
            onShoot: [],
            onShootRelease: [],
            onSwitchWeapon: [],
            onPause: [],
            onSkill: [],
            onInteract: []
        };
    }
}

// 创建全局输入管理器实例
const inputManager = new InputManager();
