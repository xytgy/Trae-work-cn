/**
 * 输入抽象层
 * 提供统一的输入接口，支持键盘、鼠标和手柄
 * 向后兼容现有的 InputManager
 */

class InputSystem {
    constructor({ eventBus }) {
        this.eventBus = eventBus;
        this.keys = {};
        this.mouse = { x: 0, y: 0, buttons: {} };
        this.inputBuffer = {};
        this.bufferTimeout = 100;
        this.canvas = null;
        this.canvasRect = null;
        this.deadZone = 0.15;

        this.pressedKeys = {};
        this.justPressedKeys = {};

        this.keyMap = {
            KeyW: 'moveUp',
            ArrowUp: 'moveUp',
            KeyS: 'moveDown',
            ArrowDown: 'moveDown',
            KeyA: 'moveLeft',
            ArrowLeft: 'moveLeft',
            KeyD: 'moveRight',
            ArrowRight: 'moveRight',
            KeyQ: 'weaponSwitch',
            KeyP: 'pause',
            Escape: 'pause',
            KeyE: 'skill1',
            KeyR: 'skill2',
            KeyF: 'interact',
            KeyI: 'inventory',
            Tab: 'inventory',
            Space: 'skill1'
        };

        this.gamepad = {
            connected: false,
            gamepadIndex: null,
            axes: { leftX: 0, leftY: 0, rightX: 0, rightY: 0 },
            buttons: {},
            lastButtonStates: {}
        };

        this.actionCallbacks = {};
    }

    init(canvas) {
        this.canvas = canvas;
        if (canvas) {
            this.canvasRect = canvas.getBoundingClientRect();
        }

        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('contextmenu', (e) => e.preventDefault());

        if ('ongamepadconnected' in window) {
            window.addEventListener('gamepadconnected', this.onGamepadConnected.bind(this));
            window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected.bind(this));
        }
    }

    onKeyDown(e) {
        if (e.repeat) {
            return;
        }

        const action = this.keyMap[e.code];
        if (action) {
            this.pressedKeys[e.code] = true;
            this.justPressedKeys[e.code] = true;
            this.keys[action] = true;

            if (this.eventBus) {
                this.eventBus.publish('INPUT_KEY_DOWN', { key: e.code, action });
            }

            this.triggerAction(action);
            e.preventDefault();
        }
    }

    onKeyUp(e) {
        const action = this.keyMap[e.code];
        if (action) {
            this.pressedKeys[e.code] = false;
            this.justPressedKeys[e.code] = false;
            this.keys[action] = false;

            if (this.eventBus) {
                this.eventBus.publish('INPUT_KEY_UP', { key: e.code, action });
            }
        }
    }

    onMouseDown(e) {
        this.mouse.buttons[e.button] = true;

        if (e.button === 0) {
            this.keys.shoot = true;

            if (this.eventBus) {
                this.eventBus.publish('INPUT_MOUSE_DOWN', { button: 0, x: e.clientX, y: e.clientY });
            }

            this.triggerAction('shoot');
        }
    }

    onMouseUp(e) {
        this.mouse.buttons[e.button] = false;

        if (e.button === 0) {
            this.keys.shoot = false;

            if (this.eventBus) {
                this.eventBus.publish('INPUT_MOUSE_UP', { button: 0, x: e.clientX, y: e.clientY });
            }

            this.triggerAction('shootRelease');
        }
    }

    onMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        this.updateCanvasRect();

        if (this.canvas && this.canvasRect) {
            const scaleX = this.canvas.width / this.canvasRect.width;
            const scaleY = this.canvas.height / this.canvasRect.height;

            this.mouse.worldX = (this.mouse.x - this.canvasRect.left) * scaleX;
            this.mouse.worldY = (this.mouse.y - this.canvasRect.top) * scaleY;
        }
    }

    updateCanvasRect() {
        if (this.canvas) {
            this.canvasRect = this.canvas.getBoundingClientRect();
        }
    }

    onGamepadConnected(e) {
        this.gamepad.connected = true;
        this.gamepad.gamepadIndex = e.gamepad.index;

        for (let i = 0; i < e.gamepad.buttons.length; i++) {
            this.gamepad.lastButtonStates[i] = false;
        }

        if (this.eventBus) {
            this.eventBus.publish('GAMEPAD_CONNECTED', { id: e.gamepad.id });
        }
    }

    onGamepadDisconnected(e) {
        if (this.gamepad.gamepadIndex === e.gamepad.index) {
            this.gamepad.connected = false;
            this.gamepad.gamepadIndex = null;

            if (this.eventBus) {
                this.eventBus.publish('GAMEPAD_DISCONNECTED', { id: e.gamepad.id });
            }
        }
    }

    connectGamepad(gamepad) {
        this.gamepad.connected = true;
        this.gamepad.gamepadIndex = gamepad.index;
    }

    disconnectGamepad() {
        this.gamepad.connected = false;
        this.gamepad.gamepadIndex = null;
        this.gamepad.axes = { leftX: 0, leftY: 0, rightX: 0, rightY: 0 };
        this.gamepad.buttons = {};
    }

    updateGamepad() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        let gamepad = null;

        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                gamepad = gamepads[i];
                if (!this.gamepad.connected || this.gamepad.gamepadIndex !== i) {
                    this.gamepad.connected = true;
                    this.gamepad.gamepadIndex = i;
                }
                break;
            }
        }

        if (!gamepad) {
            this.gamepad.connected = false;
            return;
        }

        let leftX = gamepad.axes[0] || 0;
        let leftY = gamepad.axes[1] || 0;

        if (Math.abs(leftX) < this.deadZone) {
            leftX = 0;
        }
        if (Math.abs(leftY) < this.deadZone) {
            leftY = 0;
        }

        const leftMagnitude = Math.sqrt(leftX * leftX + leftY * leftY);
        if (leftMagnitude > 1) {
            leftX /= leftMagnitude;
            leftY /= leftMagnitude;
        }

        this.gamepad.axes.leftX = leftX;
        this.gamepad.axes.leftY = leftY;

        let rightX = gamepad.axes[2] || 0;
        let rightY = gamepad.axes[3] || 0;

        if (Math.abs(rightX) < this.deadZone) {
            rightX = 0;
        }
        if (Math.abs(rightY) < this.deadZone) {
            rightY = 0;
        }

        this.gamepad.axes.rightX = rightX;
        this.gamepad.axes.rightY = rightY;

        for (let i = 0; i < gamepad.buttons.length; i++) {
            const pressed = gamepad.buttons[i].pressed;
            const wasPressed = this.gamepad.lastButtonStates[i] || false;

            this.gamepad.buttons[i] = pressed;

            if (pressed && !wasPressed) {
                this.onGamepadButtonDown(i);
            }

            if (!pressed && wasPressed) {
                this.onGamepadButtonUp(i);
            }

            this.gamepad.lastButtonStates[i] = pressed;
        }
    }

    onGamepadButtonDown(buttonIndex) {
        const buttonMap = {
            0: 'skill1',
            2: 'skill2',
            3: 'interact',
            4: 'weaponSwitch',
            5: 'weaponSwitch',
            8: 'pause',
            9: 'inventory'
        };

        const action = buttonMap[buttonIndex];
        if (action) {
            this.keys[action] = true;
            this.triggerAction(action);
        }
    }

    onGamepadButtonUp(buttonIndex) {
        const buttonMap = {
            0: 'skill1',
            2: 'skill2',
            3: 'interact',
            4: 'weaponSwitch',
            5: 'weaponSwitch',
            8: 'pause',
            9: 'inventory'
        };

        const action = buttonMap[buttonIndex];
        if (action) {
            this.keys[action] = false;
        }
    }

    update(deltaTime) {
        this.updateGamepad();
        this.updateInputBuffer(deltaTime);
        this.justPressedKeys = {};
    }

    getMovementVector() {
        let dx = 0;
        let dy = 0;

        if (this.keys.moveUp) {
            dy -= 1;
        }
        if (this.keys.moveDown) {
            dy += 1;
        }
        if (this.keys.moveLeft) {
            dx -= 1;
        }
        if (this.keys.moveRight) {
            dx += 1;
        }

        if (this.gamepad.connected) {
            if (Math.abs(this.gamepad.axes.leftX) > 0.01 || Math.abs(this.gamepad.axes.leftY) > 0.01) {
                dx = this.gamepad.axes.leftX;
                dy = this.gamepad.axes.leftY;
            }
        }

        if (!this.gamepad.connected && dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }

        return { x: dx, y: dy };
    }

    isKeyPressed(key) {
        return !!this.pressedKeys[key];
    }

    isKeyJustPressed(key) {
        return !!this.justPressedKeys[key];
    }

    isMouseDown(button = 0) {
        return !!this.mouse.buttons[button];
    }

    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }

    getMouseWorldPosition() {
        return { x: this.mouse.worldX || 0, y: this.mouse.worldY || 0 };
    }

    bufferInput(action) {
        this.inputBuffer[action] = {
            time: this.bufferTimeout,
            duration: this.bufferTimeout
        };
    }

    isBuffered(action) {
        const buffer = this.inputBuffer[action];
        return buffer ? buffer.time > 0 : false;
    }

    clearBuffer(action) {
        if (this.inputBuffer[action]) {
            this.inputBuffer[action].time = 0;
        }
    }

    consumeBuffer(action) {
        if (this.isBuffered(action)) {
            this.clearBuffer(action);
            return true;
        }
        return false;
    }

    updateInputBuffer(deltaTime) {
        for (const action in this.inputBuffer) {
            if (this.inputBuffer[action].time > 0) {
                this.inputBuffer[action].time -= deltaTime;
                if (this.inputBuffer[action].time < 0) {
                    this.inputBuffer[action].time = 0;
                }
            }
        }
    }

    setDeadZone(value) {
        this.deadZone = Math.max(0, Math.min(1, value));
    }

    onAction(action, callback) {
        if (!this.actionCallbacks[action]) {
            this.actionCallbacks[action] = [];
        }
        this.actionCallbacks[action].push(callback);
    }

    offAction(action, callback) {
        if (this.actionCallbacks[action]) {
            const index = this.actionCallbacks[action].indexOf(callback);
            if (index !== -1) {
                this.actionCallbacks[action].splice(index, 1);
            }
        }
    }

    triggerAction(action) {
        if (this.actionCallbacks[action]) {
            for (const callback of this.actionCallbacks[action]) {
                try {
                    callback();
                } catch (error) {
                    console.error(`[InputSystem] Action callback error for ${action}:`, error);
                }
            }
        }

        this.bufferInput(action);

        if (this.eventBus) {
            this.eventBus.publish('INPUT_ACTION', { action });
        }
    }

    getGamepadAxes() {
        return { ...this.gamepad.axes };
    }

    isGamepadConnected() {
        return this.gamepad.connected;
    }

    reset() {
        this.keys = {};
        this.pressedKeys = {};
        this.justPressedKeys = {};
        this.mouse.buttons = {};
        this.inputBuffer = {};
    }

    destroy() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('mousemove', this.onMouseMove);

        if ('ongamepadconnected' in window) {
            window.removeEventListener('gamepadconnected', this.onGamepadConnected);
            window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);
        }

        this.actionCallbacks = {};
    }
}
