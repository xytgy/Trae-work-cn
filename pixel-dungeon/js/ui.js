/**
 * UI管理模块
 * 负责游戏UI的Canvas绘制和显示
 * 包含：顶部状态栏、底部信息栏、开始画面、暂停画面、死亡画面、通关画面
 */

class UIManager {
    constructor() {
        // UI尺寸配置
        this.topBarHeight = 60;      // 顶部状态栏高度
        this.bottomBarHeight = 40;   // 底部信息栏高度
        
        // 游戏区域偏移
        this.gameAreaY = this.topBarHeight;
        this.gameAreaHeight = GAME_HEIGHT - this.topBarHeight - this.bottomBarHeight;
        
        // 按钮配置
        this.buttons = [];
        
        // 初始化按钮
        this.initButtons();
        
        // 当前点击状态
        this.isMouseDown = false;
        
        // 动画状态
        this.menuPulse = 0;
        
        // 游戏逻辑引用
        this.gameLogic = null;
        
        // ==================== 主菜单动画相关属性 ====================
        // 背景粒子数组
        this.menuParticles = [];
        
        // 打字机效果状态
        this.typewriterState = {
            currentCharIndex: 0,      // 当前显示到第几个字
            lastCharTime: 0,          // 上一个字显示的时间
            isComplete: false,        // 是否完成显示
            cursorVisible: true,      // 光标是否可见
            lastCursorBlink: 0        // 上次光标闪烁时间
        };
        
        // 背景地牢滚动偏移
        this.dungeonScrollOffset = 0;
        
        // 浮动武器图标数组
        this.floatingWeapons = [];
        
        // 按钮悬停动画状态（存储每个按钮的缩放进度）
        this.buttonHoverStates = {};
        
        // 上一次游戏状态（用于检测状态变化）
        this.lastGameState = null;
        
        // ==================== 难度选择界面相关属性 ====================
        this.difficultyOptions = [
            DIFFICULTY.LEVELS.EASY,
            DIFFICULTY.LEVELS.NORMAL,
            DIFFICULTY.LEVELS.HARD,
            DIFFICULTY.LEVELS.NIGHTMARE
        ];
        this.selectedDifficultyIndex = 1; // 默认普通
        this.difficultyHoverIndex = -1;
        this.difficultyAnimationTime = 0;
        this.difficultyIntroProgress = 0;
        this.isDifficultyIntroComplete = false;
        
        // 初始化主菜单动画
        this.initMenuAnimations();
    }
    
    /**
     * 初始化主菜单动画
     */
    initMenuAnimations() {
        // 初始化背景粒子
        this.initMenuParticles();
        
        // 初始化浮动武器图标
        this.initFloatingWeapons();
        
        // 重置打字机状态
        this.resetTypewriter();
    }
    
    /**
     * 初始化背景粒子
     */
    initMenuParticles() {
        this.menuParticles = [];
        const config = MENU_ANIMATION.PARTICLES;
        const count = Math.floor(config.COUNT_MIN + Math.random() * (config.COUNT_MAX - config.COUNT_MIN));
        
        for (let i = 0; i < count; i++) {
            this.menuParticles.push({
                x: Math.random() * GAME_WIDTH,
                y: Math.random() * GAME_HEIGHT,
                size: config.SIZE_MIN + Math.random() * (config.SIZE_MAX - config.SIZE_MIN),
                speed: config.SPEED_MIN + Math.random() * (config.SPEED_MAX - config.SPEED_MIN),
                color: config.COLORS[Math.floor(Math.random() * config.COLORS.length)],
                swayOffset: Math.random() * Math.PI * 2,
                swaySpeed: config.SWAY_SPEED + Math.random() * 0.01,
                swayAmount: config.SWAY_AMOUNT
            });
        }
    }
    
    /**
     * 初始化浮动武器图标
     */
    initFloatingWeapons() {
        this.floatingWeapons = [];
        const config = MENU_ANIMATION.FLOATING_WEAPONS;
        
        for (let i = 0; i < config.COUNT; i++) {
            this.floatingWeapons.push({
                x: Math.random() * GAME_WIDTH,
                y: Math.random() * GAME_HEIGHT,
                size: config.SIZE_MIN + Math.random() * (config.SIZE_MAX - config.SIZE_MIN),
                icon: config.WEAPON_ICONS[Math.floor(Math.random() * config.WEAPON_ICONS.length)],
                floatOffset: Math.random() * Math.PI * 2,
                floatSpeed: config.FLOAT_SPEED + Math.random() * 0.01,
                floatAmount: config.FLOAT_AMOUNT,
                rotateOffset: Math.random() * Math.PI * 2,
                rotateSpeed: config.ROTATE_SPEED * (Math.random() > 0.5 ? 1 : -1)
            });
        }
    }
    
    /**
     * 重置打字机效果
     */
    resetTypewriter() {
        this.typewriterState = {
            currentCharIndex: 0,
            lastCharTime: Date.now(),
            isComplete: false,
            cursorVisible: true,
            lastCursorBlink: Date.now()
        };
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    drawRoundedRect(ctx, x, y, w, h, r, fillColor, strokeColor, lineWidth) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }
        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth || 1;
            ctx.stroke();
        }
    }
    
    /**
     * 初始化按钮配置
     */
    initButtons() {
        // 按钮基础配置
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonSpacing = 20;
        
        // 主菜单按钮（仅渲染start按钮，但保留其他按钮的hitbox用于扩展）
        this.menuButtons = {
            start: {
                x: GAME_WIDTH / 2 - buttonWidth / 2,
                y: GAME_HEIGHT * 0.5 - buttonHeight / 2,
                width: buttonWidth,
                height: buttonHeight,
                text: '开始游戏',
                action: 'start'
            },
            leaderboard: {
                x: GAME_WIDTH / 2 - buttonWidth / 2,
                y: GAME_HEIGHT * 0.5 + buttonHeight + 20,
                width: buttonWidth,
                height: buttonHeight,
                text: '🏆 排行榜',
                action: 'leaderboard'
            },
            settings: {
                x: GAME_WIDTH / 2 - buttonWidth / 2,
                y: GAME_HEIGHT * 0.5 + (buttonHeight + 20) * 2,
                width: buttonWidth,
                height: buttonHeight,
                text: '⚙️ 设置',
                action: 'settings'
            },
            achievements: {
                x: GAME_WIDTH / 2 - buttonWidth / 2,
                y: GAME_HEIGHT * 0.5 + (buttonHeight + 20) * 3,
                width: buttonWidth,
                height: buttonHeight,
                text: '🏅 成就',
                action: 'achievements'
            },
            help: {
                x: GAME_WIDTH / 2 - buttonWidth / 2,
                y: GAME_HEIGHT * 0.5 + (buttonHeight + 20) * 4,
                width: buttonWidth,
                height: buttonHeight,
                text: '📖 游戏说明',
                action: 'help'
            }
        };
        
        // 暂停菜单按钮
        this.pauseButtons = {
            resume: {
                x: GAME_WIDTH / 2 - buttonWidth / 2,
                y: GAME_HEIGHT / 2 - 60,
                width: buttonWidth,
                height: buttonHeight,
                text: '继续',
                action: 'resume'
            },
            settings: {
                x: GAME_WIDTH / 2 - buttonWidth / 2,
                y: GAME_HEIGHT / 2,
                width: buttonWidth,
                height: buttonHeight,
                text: '设置',
                action: 'settings'
            },
            restart: {
                x: GAME_WIDTH / 2 - buttonWidth / 2,
                y: GAME_HEIGHT / 2 + 60,
                width: buttonWidth,
                height: buttonHeight,
                text: '重新开始',
                action: 'restart'
            },
            menu: {
                x: GAME_WIDTH / 2 - buttonWidth / 2,
                y: GAME_HEIGHT / 2 + 120,
                width: buttonWidth,
                height: buttonHeight,
                text: '返回主菜单',
                action: 'menu'
            }
        };
        
        // 死亡菜单按钮
        this.gameOverButtons = {
            retry: {
                x: GAME_WIDTH / 2 - buttonWidth / 2,
                y: GAME_HEIGHT / 2 + 80,
                width: buttonWidth,
                height: buttonHeight,
                text: '重新开始',
                action: 'restart'
            },
            menu: {
                x: GAME_WIDTH / 2 - buttonWidth / 2,
                y: GAME_HEIGHT / 2 + buttonHeight + buttonSpacing + 80,
                width: buttonWidth,
                height: buttonHeight,
                text: '返回主菜单',
                action: 'menu'
            }
        };
        
        // 通关菜单按钮
        this.victoryButtons = {
            playAgain: {
                x: GAME_WIDTH / 2 - buttonWidth / 2,
                y: GAME_HEIGHT / 2 + 100,
                width: buttonWidth,
                height: buttonHeight,
                text: '再来一局',
                action: 'restart'
            },
            menu: {
                x: GAME_WIDTH / 2 - buttonWidth / 2,
                y: GAME_HEIGHT / 2 + buttonHeight + buttonSpacing + 100,
                width: buttonWidth,
                height: buttonHeight,
                text: '返回主菜单',
                action: 'menu'
            }
        };
    }
    
    /**
     * 更新动画状态
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        this.menuPulse += deltaTime * 0.003;
        if (this.menuPulse > Math.PI * 2) {
            this.menuPulse = 0;
        }
        
        // 获取当前游戏状态
        const currentState = gameState.getState();
        
        // 检测状态变化，如果刚进入主菜单则重置动画
        if (currentState === GAME_STATE.MENU && this.lastGameState !== GAME_STATE.MENU) {
            this.resetMenuAnimations();
        }
        this.lastGameState = currentState;
        
        // 只在主菜单状态下更新菜单动画
        if (currentState === GAME_STATE.MENU) {
            this.updateMenuParticles(deltaTime);
            this.updateTypewriter(deltaTime);
            this.updateDungeonScroll(deltaTime);
            this.updateFloatingWeapons(deltaTime);
            this.updateButtonHoverStates(deltaTime);
        }
        
        // 角色选择界面动画
        if (currentState === GAME_STATE.CHARACTER_SELECT) {
            characterSelectManager.update(deltaTime);
        }
        
        // 难度选择界面动画
        if (currentState === GAME_STATE.DIFFICULTY_SELECT) {
            this.updateDifficultySelect(deltaTime);
        }

        // 路线选择界面悬停检测
        if (currentState === GAME_STATE.ROUTE_SELECT) {
            const mouseX = inputManager.mouse.x || 0;
            const mouseY = inputManager.mouse.y || 0;
            this._routeSelectHoverIndex = -1;
            if (this.routeSelectCards) {
                for (let i = 0; i < this.routeSelectCards.length; i++) {
                    const card = this.routeSelectCards[i];
                    if (mouseX >= card.x && mouseX <= card.x + card.width &&
                        mouseY >= card.y && mouseY <= card.y + card.height) {
                        this._routeSelectHoverIndex = i;
                        break;
                    }
                }
            }
        }
    }
    
    /**
     * 重置主菜单所有动画
     */
    resetMenuAnimations() {
        this.initMenuParticles();
        this.initFloatingWeapons();
        this.resetTypewriter();
        this.dungeonScrollOffset = 0;
        this.buttonHoverStates = {};
    }
    
    /**
     * 更新背景粒子
     * @param {number} deltaTime - 时间增量
     */
    updateMenuParticles(deltaTime) {
        const config = MENU_ANIMATION.PARTICLES;
        
        this.menuParticles.forEach(particle => {
            // 向下移动
            particle.y += particle.speed;
            
            // 左右飘动
            particle.swayOffset += particle.swaySpeed;
            particle.x += Math.sin(particle.swayOffset) * particle.swayAmount;
            
            // 如果粒子超出底部，重置到顶部
            if (particle.y > GAME_HEIGHT + particle.size) {
                particle.y = -particle.size;
                particle.x = Math.random() * GAME_WIDTH;
            }
            
            // 边界检查（左右）
            if (particle.x < -particle.size) {
                particle.x = GAME_WIDTH + particle.size;
            } else if (particle.x > GAME_WIDTH + particle.size) {
                particle.x = -particle.size;
            }
        });
    }
    
    /**
     * 更新打字机效果
     * @param {number} deltaTime - 时间增量
     */
    updateTypewriter(deltaTime) {
        const state = this.typewriterState;
        const config = MENU_ANIMATION.TYPEWRITER;
        const now = Date.now();
        
        // 如果还没完成打字
        if (!state.isComplete) {
            if (now - state.lastCharTime >= config.CHAR_INTERVAL) {
                state.currentCharIndex++;
                state.lastCharTime = now;
                
                // 检查是否完成
                if (state.currentCharIndex >= config.TEXT.length) {
                    state.isComplete = true;
                }
            }
        }
        
        // 更新光标闪烁
        if (now - state.lastCursorBlink >= config.CURSOR_BLINK_SPEED) {
            state.cursorVisible = !state.cursorVisible;
            state.lastCursorBlink = now;
        }
    }
    
    /**
     * 更新背景地牢滚动
     * @param {number} deltaTime - 时间增量
     */
    updateDungeonScroll(deltaTime) {
        const config = MENU_ANIMATION.DUNGEON_SCROLL;
        this.dungeonScrollOffset += config.SPEED;
        
        // 滚动一个地砖尺寸后重置，防止数值过大
        if (this.dungeonScrollOffset >= config.TILE_SIZE) {
            this.dungeonScrollOffset -= config.TILE_SIZE;
        }
    }
    
    /**
     * 更新浮动武器图标
     * @param {number} deltaTime - 时间增量
     */
    updateFloatingWeapons(deltaTime) {
        this.floatingWeapons.forEach(weapon => {
            // 更新浮动偏移
            weapon.floatOffset += weapon.floatSpeed;
            
            // 更新旋转偏移
            weapon.rotateOffset += weapon.rotateSpeed;
        });
    }
    
    /**
     * 更新按钮悬停动画状态
     * @param {number} deltaTime - 时间增量
     */
    updateButtonHoverStates(deltaTime) {
        const config = MENU_ANIMATION.BUTTON_HOVER;
        const mouseX = inputManager.mouse.x || 0;
        const mouseY = inputManager.mouse.y || 0;
        
        // 获取当前状态的所有按钮
        const buttons = this.getAllButtons();
        
        buttons.forEach(button => {
            const buttonId = button.text;
            const isHovered = this.isPointInButton(mouseX, mouseY, button);
            
            // 初始化状态
            if (!this.buttonHoverStates[buttonId]) {
                this.buttonHoverStates[buttonId] = { scale: 1 };
            }
            
            const state = this.buttonHoverStates[buttonId];
            const targetScale = isHovered ? config.SCALE : 1;
            
            // 平滑过渡
            const speed = deltaTime / config.TRANSITION_TIME;
            state.scale += (targetScale - state.scale) * speed * 2;
            
            // 限制范围
            state.scale = Math.max(1, Math.min(config.SCALE, state.scale));
        });
    }
    
    /**
     * 获取当前状态的所有按钮
     */
    getAllButtons() {
        const state = gameState.getState();
        let buttons = [];
        
        switch (state) {
            case GAME_STATE.MENU:
                buttons = [
                    this.menuButtons.start,
                    this.menuButtons.leaderboard,
                    this.menuButtons.settings,
                    this.menuButtons.achievements,
                    this.menuButtons.help
                ];
                break;
            case GAME_STATE.PAUSED:
                buttons = [
                    this.pauseButtons.resume,
                    this.pauseButtons.settings,
                    this.pauseButtons.restart,
                    this.pauseButtons.menu
                ];
                break;
            case GAME_STATE.GAME_OVER:
                buttons = [this.gameOverButtons.retry, this.gameOverButtons.menu];
                break;
            case GAME_STATE.VICTORY:
                buttons = [this.victoryButtons.playAgain, this.victoryButtons.menu];
                break;
        }
        
        return buttons;
    }
    
    /**
     * 检查点是否在矩形内
     * @param {number} x - 点击X坐标
     * @param {number} y - 点击Y坐标
     * @param {Object} button - 按钮配置
     */
    isPointInButton(x, y, button) {
        return x >= button.x && 
               x <= button.x + button.width &&
               y >= button.y && 
               y <= button.y + button.height;
    }
    
    /**
     * 处理鼠标点击
     * @param {number} x - 点击X坐标
     * @param {number} y - 点击Y坐标
     * @returns {string|null} - 返回按钮动作或null
     */
    handleClick(x, y) {
        const state = gameState.getState();
        
        switch (state) {
            case GAME_STATE.MENU:
                if (this.isPointInButton(x, y, this.menuButtons.start)) {
                    return 'start';
                }
                if (this.isPointInButton(x, y, this.menuButtons.leaderboard)) {
                    return 'leaderboard';
                }
                if (this.isPointInButton(x, y, this.menuButtons.settings)) {
                    return 'settings';
                }
                if (this.isPointInButton(x, y, this.menuButtons.achievements)) {
                    return 'achievements';
                }
                if (this.isPointInButton(x, y, this.menuButtons.help)) {
                    return 'help';
                }
                break;
                
            case GAME_STATE.CHARACTER_SELECT:
                // 使用角色选择管理器处理点击
                if (characterSelectManager.handleClick(x, y)) {
                    return 'confirm';
                }
                break;
                
            case GAME_STATE.DIFFICULTY_SELECT:
                return this.handleDifficultySelectClick(x, y);
                
            case GAME_STATE.PAUSED:
                if (this.isPointInButton(x, y, this.pauseButtons.resume)) {
                    return 'resume';
                }
                if (this.isPointInButton(x, y, this.pauseButtons.settings)) {
                    return 'pause_settings';
                }
                if (this.isPointInButton(x, y, this.pauseButtons.restart)) {
                    return 'restart';
                }
                if (this.isPointInButton(x, y, this.pauseButtons.menu)) {
                    return 'menu';
                }
                break;
                
            case GAME_STATE.SETTINGS:
                return this.handleSettingsClick(x, y);
                
            case GAME_STATE.LEADERBOARD:
                return this.handleLeaderboardClick(x, y);
                
            case GAME_STATE.ACHIEVEMENTS:
                return this.handleAchievementsClick(x, y);
                
            case GAME_STATE.HELP:
                return this.handleHelpClick(x, y);

            case GAME_STATE.ROUTE_SELECT:
                return this.handleRouteSelectClick(x, y);

            case GAME_STATE.GAME_OVER:
                if (this.isPointInButton(x, y, this.gameOverButtons.retry)) {
                    return 'restart';
                }
                if (this.isPointInButton(x, y, this.gameOverButtons.menu)) {
                    return 'menu';
                }
                break;
                
            case GAME_STATE.VICTORY:
                if (this.isPointInButton(x, y, this.victoryButtons.playAgain)) {
                    return 'restart';
                }
                if (this.isPointInButton(x, y, this.victoryButtons.menu)) {
                    return 'menu';
                }
                break;
        }
        
        return null;
    }
    
    /**
     * 渲染UI（根据游戏状态）
     */
    render() {
        const state = gameState.getState();
        
        // 根据状态渲染不同的UI
        switch (state) {
            case GAME_STATE.MENU:
                this.renderMenuScreen();
                break;
                
            case GAME_STATE.CHARACTER_SELECT:
                this.renderCharacterSelectScreen();
                break;
                
            case GAME_STATE.DIFFICULTY_SELECT:
                this.renderDifficultySelectScreen();
                break;
                
            case GAME_STATE.PLAYING:
                this.renderTopBar();
                this.renderBottomBar();
                // 渲染怒气条
                this.renderRageBar();
                // 渲染技能栏
                this.renderSkillBar();
                // 渲染角色信息
                this.renderCharacterInfo();
                // 渲染被动技能效果
                this.renderPassiveEffects();
                // 渲染新手引导
                if (typeof tutorialManager !== 'undefined' && tutorialManager.active) {
                    tutorialManager.render(renderer.ctx);
                }
                // 渲染掉落物
                if (this.gameLogic && this.gameLogic.dropManager) {
                    this.gameLogic.dropManager.render(renderer.ctx);
                }
                // 渲染商人
                if (this.gameLogic && this.gameLogic.shopManager) {
                    this.gameLogic.shopManager.render(renderer.ctx);
                }
                // 渲染Buff效果
                if (this.gameLogic && this.gameLogic.buffManager) {
                    this.renderBuffIndicators();
                }
                // 渲染背包
                if (this.gameLogic && this.gameLogic.inventoryOpen) {
                    this.renderInventoryUI();
                }
                // 渲染商店界面
                if (this.gameLogic && this.gameLogic.shopManager && this.gameLogic.shopManager.isShopOpen()) {
                    this.renderShopUI();
                }
                // 渲染成就通知
                if (this.gameLogic && this.gameLogic.achievementNotifications) {
                    this.renderAchievementNotifications();
                }
                // 渲染商人交互提示
                if (this.gameLogic && this.gameLogic.shopManager && 
                    this.gameLogic.shopManager.canInteract(this.gameLogic.player.x, this.gameLogic.player.y) &&
                    !this.gameLogic.shopManager.isShopOpen()) {
                    this.renderShopHint();
                }
                break;
                
            case GAME_STATE.PAUSED:
                this.renderTopBar();
                this.renderBottomBar();
                this.renderPauseScreen();
                break;
                
            case GAME_STATE.SETTINGS:
                this.renderSettingsScreen();
                break;
                
            case GAME_STATE.LEADERBOARD:
                this.renderLeaderboardScreen();
                break;
                
            case GAME_STATE.ACHIEVEMENTS:
                this.renderAchievementsScreen();
                break;
                
            case GAME_STATE.HELP:
                this.renderHelpScreen();
                break;

            case GAME_STATE.ROUTE_SELECT:
                this.renderRouteSelectScreen();
                break;

            case GAME_STATE.GAME_OVER:
                this.renderGameOverScreen();
                break;
                
            case GAME_STATE.VICTORY:
                this.renderVictoryScreen();
                break;
        }
    }
    
    /**
     * 渲染顶部状态栏
     * 格式：❤️❤️❤️        第 1 关        🔫 手枪
     */
    renderTopBar() {
        const ctx = renderer.ctx;
        
        // 绘制顶部状态栏背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, GAME_WIDTH, this.topBarHeight);
        
        // 绘制分隔线
        ctx.fillStyle = COLORS.DUNGEON.WALL;
        ctx.fillRect(0, this.topBarHeight - 2, GAME_WIDTH, 2);
        
        // 获取游戏数据
        const data = gameState.getData();
        const weapon = gameState.getCurrentWeapon();
        
        // 绘制生命值（左侧）
        this.renderHearts(20, this.topBarHeight / 2, data.playerHealth, PLAYER.MAX_HEALTH);
        
        // 绘制关卡显示（中央）
        ctx.font = '24px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = COLORS.UI.TEXT;
        ctx.fillText(`第 ${data.currentLevel} 关`, GAME_WIDTH / 2, this.topBarHeight / 2);
        
        // 绘制当前武器（右侧）
        if (weapon) {
            ctx.font = '20px serif';
            ctx.textAlign = 'right';
            ctx.fillText(`${weapon.ICON} ${weapon.NAME}`, GAME_WIDTH - 20, this.topBarHeight / 2);
        }
    }
    
    /**
     * 渲染像素风心形图标
     * @param {number} x - 起始X坐标
     * @param {number} y - Y坐标（居中）
     * @param {number} current - 当前生命值
     * @param {number} max - 最大生命值
     */
    renderHearts(x, y, current, max) {
        const heartSize = 20;
        const gap = 5;
        const spacing = heartSize + gap;
        
        for (let i = 0; i < max; i++) {
            const hx = x + i * spacing;
            const hy = y;
            const isFull = i < current;
            const isHalf = !isFull && i < Math.ceil(current);
            
            // 心跳动画（满血时最后一颗心跳动）
            let scale = 1;
            if (isFull && i === Math.floor(current) - 1) {
                scale = 1 + Math.sin(Date.now() / 200) * 0.1;
            }
            
            const ctx = renderer.ctx;
            ctx.save();
            ctx.translate(hx + heartSize / 2, hy);
            ctx.scale(scale, scale);
            
            // 像素心形
            const color = isFull ? COLORS.UI.HEALTH_FULL : (isHalf ? '#ff6666' : COLORS.UI.HEALTH_EMPTY);
            this.drawPixelHeart(ctx, color, heartSize);
            
            ctx.restore();
        }
    }
    
    /**
     * 绘制像素心形图案
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {string} color - 颜色
     * @param {number} size - 尺寸
     */
    drawPixelHeart(ctx, color, size) {
        // 像素心形图案（8x8）
        const heart = [
            '01100110',
            '11111111',
            '11111111',
            '11111111',
            '01111110',
            '00111100',
            '00011000',
            '00000000'
        ];
        
        const pixelSize = size / 8;
        const offsetX = -size / 2;
        const offsetY = -size / 2;
        
        ctx.fillStyle = color;
        for (let row = 0; row < heart.length; row++) {
            const rowStr = heart[row];
            for (let col = 0; col < rowStr.length; col++) {
                if (rowStr[col] === '1') {
                    ctx.fillRect(
                        offsetX + col * pixelSize,
                        offsetY + row * pixelSize,
                        pixelSize,
                        pixelSize
                    );
                }
            }
        }
    }
    
    /**
     * 渲染底部信息栏
     * 格式：当前武器: 手枪 [Q切换]    击杀: 0
     */
    renderBottomBar() {
        const ctx = renderer.ctx;
        
        // 绘制底部状态栏背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, GAME_HEIGHT - this.bottomBarHeight, GAME_WIDTH, this.bottomBarHeight);
        
        // 绘制分隔线
        ctx.fillStyle = COLORS.DUNGEON.WALL;
        ctx.fillRect(0, GAME_HEIGHT - this.bottomBarHeight, GAME_WIDTH, 2);
        
        // 获取游戏数据
        const weapon = gameState.getCurrentWeapon();
        const data = gameState.getData();
        
        // 绘制武器信息（左侧）
        ctx.font = '16px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = COLORS.UI.TEXT;
        
        let weaponText = '当前武器: ';
        if (weapon) {
            const ammoText = weapon.MAX_AMMO === Infinity 
                ? '∞' 
                : `${weapon.AMMO}/${weapon.MAX_AMMO}`;
            weaponText += `${weapon.NAME} [${ammoText}] [Q切换]`;
        }
        ctx.fillText(weaponText, 20, GAME_HEIGHT - this.bottomBarHeight / 2);
        
        // 绘制击杀计数（右侧）
        ctx.textAlign = 'right';
        ctx.fillText(`击杀: ${data.killCount}`, GAME_WIDTH - 20, GAME_HEIGHT - this.bottomBarHeight / 2);
    }
    
    /**
     * 渲染主菜单画面
     */
    renderMenuScreen() {
        const ctx = renderer.ctx;
        const { width, height } = { width: GAME_WIDTH, height: GAME_HEIGHT };
        
        // 动态粒子背景
        this.renderMenuBackground(ctx, width, height);
        
        // 绘制浮动武器图标
        this.renderFloatingWeapons();
        
        // 标题
        const titleY = height * 0.3;
        const titleBob = Math.sin(Date.now() / 500) * 5;
        
        ctx.save();
        ctx.translate(width / 2, titleY + titleBob);
        
        // 标题发光
        ctx.shadowColor = UI_COLORS.MENU_TITLE_GLOW;
        ctx.shadowBlur = 20;
        
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = UI_COLORS.MENU_TITLE_FILL;
        ctx.fillText('像素地牢', 0, 0);
        
        // 标题描边
        ctx.strokeStyle = UI_COLORS.MENU_TITLE_STROKE;
        ctx.lineWidth = 3;
        ctx.strokeText('像素地牢', 0, 0);
        
        ctx.restore();
        
        // 副标题
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('枪战冒险', width / 2, titleY + 35 + titleBob);
        
        // 按钮
        const buttons = [this.menuButtons.start];
        const startY = height * 0.5;
        
        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            const by = startY + i * (button.height + 20);
            this.renderMenuButton(ctx, button, by);
        }
        
        // 操作说明
        ctx.font = '18px "Courier New", monospace';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText('操作说明', width / 2, startY + 100);
        
        ctx.font = '14px "Courier New", monospace';
        ctx.fillStyle = '#888888';
        ctx.fillText('WASD移动  |  鼠标射击  |  Q切换武器  |  P暂停', width / 2, startY + 140);
        
        // 版本号
        ctx.fillStyle = '#666666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('v1.0.0', width - 10, height - 10);
    }
    
    /**
     * 渲染菜单背景（渐变+粒子）
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} width - 宽度
     * @param {number} height - 高度
     */
    renderMenuBackground(ctx, width, height) {
        // 渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, UI_COLORS.MENU_BG_GRADIENT_TOP);
        gradient.addColorStop(1, UI_COLORS.MENU_BG_GRADIENT_BOTTOM);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // 漂浮粒子
        this.menuParticles.forEach(p => {
            const pulse = 0.5 + Math.sin(Date.now() / 500 + p.x) * 0.5;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = (0.3 + Math.random() * 0.1) * pulse;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        // 底部星空
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 20; i++) {
            const sx = (i * 97) % width;
            const sy = (i * 53) % (height * 0.3);
            const size = (i % 3) + 1;
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    /**
     * 渲染菜单按钮（渐变+悬停效果）
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {Object} button - 按钮配置
     * @param {number} y - Y坐标
     */
    renderMenuButton(ctx, button, y) {
        const buttonWidth = button.width;
        const buttonHeight = button.height;
        const bx = GAME_WIDTH / 2 - buttonWidth / 2;
        
        const mouseX = inputManager.mouse.x || 0;
        const mouseY = inputManager.mouse.y || 0;
        const isHover = this.isPointInButton(mouseX, mouseY, { ...button, x: bx, y: y });
        
        // 获取按钮缩放状态
        const buttonId = button.text;
        if (!this.buttonHoverStates[buttonId]) {
            this.buttonHoverStates[buttonId] = { scale: 1 };
        }
        const scale = this.buttonHoverStates[buttonId].scale;
        
        ctx.save();
        ctx.translate(GAME_WIDTH / 2, y + buttonHeight / 2);
        ctx.scale(scale, scale);
        
        // 按钮背景渐变
        const gradient = ctx.createLinearGradient(-buttonWidth / 2, 0, buttonWidth / 2, 0);
        if (isHover) {
            gradient.addColorStop(0, UI_COLORS.MENU_BUTTON_HOVER_START);
            gradient.addColorStop(1, UI_COLORS.MENU_BUTTON_HOVER_END);
        } else {
            gradient.addColorStop(0, UI_COLORS.MENU_BUTTON_GRADIENT_START);
            gradient.addColorStop(1, UI_COLORS.MENU_BUTTON_GRADIENT_END);
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);
        
        // 按钮边框
        ctx.strokeStyle = isHover ? UI_COLORS.MENU_BUTTON_HOVER_BORDER : UI_COLORS.MENU_BUTTON_BORDER;
        ctx.lineWidth = 2;
        ctx.strokeRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);
        
        // 按钮文字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(button.text, 0, 0);
        
        ctx.restore();
    }
    
    /**
     * 渲染角色选择画面
     */
    renderCharacterSelectScreen() {
        // 更新角色选择管理器的悬停状态（内部从inputManager获取鼠标位置）
        characterSelectManager.update(16);
        
        // 使用角色选择管理器渲染
        characterSelectManager.render(renderer.ctx);
    }
    
    /**
     * 更新难度选择界面动画
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updateDifficultySelect(deltaTime) {
        this.difficultyAnimationTime += deltaTime;
        
        // 入场动画
        if (!this.isDifficultyIntroComplete) {
            this.difficultyIntroProgress = Math.min(1, this.difficultyIntroProgress + deltaTime / 800);
            if (this.difficultyIntroProgress >= 1) {
                this.isDifficultyIntroComplete = true;
            }
        }
    }
    
    /**
     * 渲染难度选择界面
     */
    renderDifficultySelectScreen() {
        const ctx = renderer.ctx;
        const centerX = GAME_WIDTH / 2;
        const centerY = GAME_HEIGHT / 2;
        
        // 入场动画进度
        const progress = this.easeOutCubic(this.difficultyIntroProgress);
        
        // 标题
        const titleY = 120 - (1 - progress) * 50;
        const titleAlpha = progress;
        
        ctx.save();
        ctx.globalAlpha = titleAlpha;
        ctx.font = 'bold 36px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = COLORS.UI.TEXT_PRIMARY;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('选择难度', centerX, titleY);
        ctx.restore();
        
        // 难度选项
        const optionWidth = 360;
        const optionHeight = 70;
        const optionGap = 20;
        const totalHeight = this.difficultyOptions.length * optionHeight + (this.difficultyOptions.length - 1) * optionGap;
        const startY = centerY - totalHeight / 2 + 30;
        
        this.difficultyOptions.forEach((difficulty, index) => {
            const y = startY + index * (optionHeight + optionGap);
            const isSelected = index === this.selectedDifficultyIndex;
            const isHovered = index === this.difficultyHoverIndex;
            
            // 入场动画：每个选项依次出现
            const optionDelay = index * 100;
            const optionProgress = Math.max(0, Math.min(1, (this.difficultyIntroProgress * 1000 - optionDelay) / 500));
            const optionEased = this.easeOutCubic(optionProgress);
            
            if (optionProgress <= 0) return;
            
            const x = centerX - optionWidth / 2 + (1 - optionEased) * 100;
            const alpha = optionEased;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // 选项背景
            let bgColor = isSelected ? 'rgba(100, 80, 150, 0.9)' : 'rgba(40, 35, 50, 0.9)';
            if (isHovered && !isSelected) {
                bgColor = 'rgba(60, 50, 80, 0.9)';
            }
            
            // 绘制圆角矩形背景
            this.drawRoundedRect(ctx, x, y, optionWidth, optionHeight, 10, bgColor);
            
            // 选中边框
            if (isSelected) {
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 3;
                this.drawRoundedRect(ctx, x, y, optionWidth, optionHeight, 10, null, '#ffd700', 3);
            }
            
            // 难度图标和名称
            ctx.font = 'bold 22px "Microsoft YaHei", sans-serif';
            ctx.fillStyle = isSelected ? '#ffd700' : COLORS.UI.TEXT_PRIMARY;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`${difficulty.icon} ${difficulty.name}`, x + 20, y + 12);
            
            // 难度描述
            ctx.font = '14px "Microsoft YaHei", sans-serif';
            ctx.fillStyle = COLORS.UI.TEXT_SECONDARY;
            ctx.fillText(difficulty.description, x + 20, y + 40);
            
            // 默认标记
            if (difficulty.id === DIFFICULTY.DEFAULT) {
                ctx.font = '12px "Microsoft YaHei", sans-serif';
                ctx.fillStyle = '#88ff88';
                ctx.textAlign = 'right';
                ctx.fillText('[默认]', x + optionWidth - 20, y + 15);
            }
            
            ctx.restore();
        });
        
        // 提示文字
        const hintY = startY + totalHeight + 40;
        const hintAlpha = Math.max(0, progress - 0.8) * 5;
        
        ctx.save();
        ctx.globalAlpha = hintAlpha;
        ctx.font = '16px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = COLORS.UI.TEXT_SECONDARY;
        ctx.textAlign = 'center';
        ctx.fillText('点击选择难度，确认后开始游戏', centerX, hintY);
        
        // 闪烁提示
        const blinkAlpha = 0.5 + 0.5 * Math.sin(this.difficultyAnimationTime / 400);
        ctx.globalAlpha = hintAlpha * blinkAlpha;
        ctx.fillStyle = '#ffd700';
        ctx.fillText('⚔  按 空格/回车 确认  ⚔', centerX, hintY + 30);
        ctx.restore();
        
        // 返回按钮
        const backBtnX = 40;
        const backBtnY = GAME_HEIGHT - 60;
        const backBtnW = 100;
        const backBtnH = 40;
        
        ctx.save();
        ctx.globalAlpha = progress;
        
        const backHovered = this.difficultyHoverIndex === -2;
        const backBgColor = backHovered ? 'rgba(80, 60, 100, 0.9)' : 'rgba(50, 40, 70, 0.9)';
        this.drawRoundedRect(ctx, backBtnX, backBtnY, backBtnW, backBtnH, 8, backBgColor);
        
        ctx.font = '16px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = COLORS.UI.TEXT_PRIMARY;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('← 返回', backBtnX + backBtnW / 2, backBtnY + backBtnH / 2);
        ctx.restore();
    }
    
    /**
     * 处理难度选择点击
     * @param {number} x - 点击X坐标
     * @param {number} y - 点击Y坐标
     * @returns {string|null} - 返回按钮动作或null
     */
    handleDifficultySelectClick(x, y) {
        if (!this.isDifficultyIntroComplete) return null;
        
        const centerX = GAME_WIDTH / 2;
        const optionWidth = 360;
        const optionHeight = 70;
        const optionGap = 20;
        const totalHeight = this.difficultyOptions.length * optionHeight + (this.difficultyOptions.length - 1) * optionGap;
        const startY = GAME_HEIGHT / 2 - totalHeight / 2 + 30;
        
        // 检查难度选项点击
        for (let i = 0; i < this.difficultyOptions.length; i++) {
            const optionY = startY + i * (optionHeight + optionGap);
            const optionX = centerX - optionWidth / 2;
            
            if (x >= optionX && x <= optionX + optionWidth &&
                y >= optionY && y <= optionY + optionHeight) {
                this.selectedDifficultyIndex = i;
                gameState.setSelectedDifficulty(this.difficultyOptions[i].id);
                return 'select';
            }
        }
        
        // 检查返回按钮
        const backBtnX = 40;
        const backBtnY = GAME_HEIGHT - 60;
        const backBtnW = 100;
        const backBtnH = 40;
        
        if (x >= backBtnX && x <= backBtnX + backBtnW &&
            y >= backBtnY && y <= backBtnY + backBtnH) {
            return 'back';
        }
        
        return null;
    }
    
    /**
     * 处理难度选择鼠标移动
     * @param {number} x - 鼠标X坐标
     * @param {number} y - 鼠标Y坐标
     */
    handleDifficultySelectMouseMove(x, y) {
        if (!this.isDifficultyIntroComplete) {
            this.difficultyHoverIndex = -1;
            return;
        }
        
        const centerX = GAME_WIDTH / 2;
        const optionWidth = 360;
        const optionHeight = 70;
        const optionGap = 20;
        const totalHeight = this.difficultyOptions.length * optionHeight + (this.difficultyOptions.length - 1) * optionGap;
        const startY = GAME_HEIGHT / 2 - totalHeight / 2 + 30;
        
        let hovered = false;
        
        // 检查难度选项悬停
        for (let i = 0; i < this.difficultyOptions.length; i++) {
            const optionY = startY + i * (optionHeight + optionGap);
            const optionX = centerX - optionWidth / 2;
            
            if (x >= optionX && x <= optionX + optionWidth &&
                y >= optionY && y <= optionY + optionHeight) {
                this.difficultyHoverIndex = i;
                hovered = true;
                break;
            }
        }
        
        if (!hovered) {
            // 检查返回按钮
            const backBtnX = 40;
            const backBtnY = GAME_HEIGHT - 60;
            const backBtnW = 100;
            const backBtnH = 40;
            
            if (x >= backBtnX && x <= backBtnX + backBtnW &&
                y >= backBtnY && y <= backBtnY + backBtnH) {
                this.difficultyHoverIndex = -2;
                hovered = true;
            }
        }
        
        if (!hovered) {
            this.difficultyHoverIndex = -1;
        }
    }
    
    /**
     * 重置难度选择动画
     */
    resetDifficultySelectAnimation() {
        this.difficultyAnimationTime = 0;
        this.difficultyIntroProgress = 0;
        this.isDifficultyIntroComplete = false;
        this.difficultyHoverIndex = -1;
        
        // 同步选中的难度
        const savedDifficulty = gameState.getSelectedDifficulty();
        this.selectedDifficultyIndex = this.difficultyOptions.findIndex(d => d.id === savedDifficulty);
        if (this.selectedDifficultyIndex === -1) {
            this.selectedDifficultyIndex = 1;
        }
    }
    
    /**
     * 处理角色选择点击
     * @param {number} x - 点击X坐标
     * @param {number} y - 点击Y坐标
     * @returns {string|null} - 返回按钮动作或null
     */
    handleCharacterSelectClick(x, y) {
        const result = characterSelectManager.handleClick(x, y);
        if (result) {
            // 获取选中的角色
            const character = characterSelectManager.getSelectedCharacter();
            if (character) {
                return 'start';
            }
        }
        return result ? 'start' : null;
    }
    
    /**
     * 渲染背景地牢图案
     */
    renderDungeonPattern() {
        const ctx = renderer.ctx;
        const config = MENU_ANIMATION.DUNGEON_SCROLL;
        const tileSize = config.TILE_SIZE;
        
        ctx.save();
        ctx.globalAlpha = config.ALPHA;
        
        // 绘制砖块纹理
        const offset = this.dungeonScrollOffset;
        
        for (let y = -tileSize + offset; y < GAME_HEIGHT + tileSize; y += tileSize) {
            for (let x = -tileSize; x < GAME_WIDTH + tileSize; x += tileSize) {
                // 判断是哪种砖块（交错排列）
                const row = Math.floor((y - offset) / tileSize);
                const col = Math.floor(x / tileSize);
                const isEvenRow = row % 2 === 0;
                
                // 砖块主体
                ctx.fillStyle = COLORS.DUNGEON.WALL;
                ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
                
                // 砖块高光（顶部和左侧）
                ctx.fillStyle = '#1a4a7a';
                ctx.fillRect(x + 1, y + 1, tileSize - 2, 2);
                ctx.fillRect(x + 1, y + 1, 2, tileSize - 2);
                
                // 砖块阴影（底部和右侧）
                ctx.fillStyle = '#0a1f3a';
                ctx.fillRect(x + 1, y + tileSize - 3, tileSize - 2, 2);
                ctx.fillRect(x + tileSize - 3, y + 1, 2, tileSize - 2);
                
                // 砖缝
                ctx.fillStyle = '#0a0a1a';
                ctx.fillRect(x, y, tileSize, 1);
                ctx.fillRect(x, y, 1, tileSize);
            }
        }
        
        ctx.restore();
    }
    
    /**
     * 渲染背景粒子
     */
    renderMenuParticles() {
        const ctx = renderer.ctx;
        
        this.menuParticles.forEach(particle => {
            ctx.fillStyle = particle.color;
            ctx.fillRect(
                particle.x - particle.size / 2,
                particle.y - particle.size / 2,
                particle.size,
                particle.size
            );
        });
    }
    
    /**
     * 渲染浮动武器图标
     */
    renderFloatingWeapons() {
        const ctx = renderer.ctx;
        const config = MENU_ANIMATION.FLOATING_WEAPONS;
        
        ctx.save();
        ctx.globalAlpha = config.ALPHA;
        
        this.floatingWeapons.forEach(weapon => {
            const floatY = Math.sin(weapon.floatOffset) * weapon.floatAmount;
            const rotation = Math.sin(weapon.rotateOffset) * 0.3;
            
            ctx.save();
            ctx.translate(weapon.x, weapon.y + floatY);
            ctx.rotate(rotation);
            ctx.font = `${weapon.size}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(weapon.icon, 0, 0);
            ctx.restore();
        });
        
        ctx.restore();
    }
    
    /**
     * 渲染打字机效果标题
     */
    renderTypewriterTitle() {
        const ctx = renderer.ctx;
        const config = MENU_ANIMATION.TYPEWRITER;
        const state = this.typewriterState;
        
        // 获取当前显示的文字
        const displayText = config.TEXT.substring(0, state.currentCharIndex);
        
        // 标题脉冲效果（只在完成后启用）
        let pulse = 1;
        if (state.isComplete) {
            pulse = Math.sin(this.menuPulse) * 0.05 + 1;
        }
        
        const fontSize = Math.floor(48 * pulse);
        ctx.font = `${fontSize}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 标题阴影
        ctx.fillStyle = COLORS.UI.TEXT_SHADOW;
        ctx.fillText(displayText, GAME_WIDTH / 2 + 3, 150 + 3);
        
        // 标题
        ctx.fillStyle = COLORS.UI.TEXT;
        ctx.fillText(displayText, GAME_WIDTH / 2, 150);
        
        // 光标（只在未完成或刚完成时显示）
        if (state.cursorVisible) {
            const cursorX = GAME_WIDTH / 2 + ctx.measureText(displayText).width / 2 + 5;
            ctx.fillStyle = COLORS.DUNGEON.DOOR;
            ctx.fillText(config.CURSOR_CHAR, cursorX, 150);
        }
    }
    
    /**
     * 渲染暂停画面
     */
    renderPauseScreen() {
        const ctx = renderer.ctx;
        
        // 绘制半透明黑色遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // 绘制暂停文字
        ctx.font = '48px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = COLORS.UI.TEXT;
        ctx.fillText('游戏暂停', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100);
        
        // 绘制按钮
        this.renderButton(this.pauseButtons.resume);
        this.renderButton(this.pauseButtons.restart);
    }
    
    /**
     * 渲染死亡画面
     */
    renderGameOverScreen() {
        const ctx = renderer.ctx;
        
        // 绘制半透明黑色遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // 绘制游戏结束文字
        ctx.font = '48px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 红色游戏结束
        ctx.fillStyle = '#ff4444';
        ctx.fillText('游戏结束', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150);
        
        // 获取游戏数据
        const data = gameState.getData();
        
        // 绘制统计信息
        ctx.font = '20px "Courier New", monospace';
        ctx.fillStyle = COLORS.UI.TEXT;
        
        const statsY = GAME_HEIGHT / 2 - 60;
        ctx.fillText(`存活时间: ${Math.floor(data.survivalTime)} 秒`, GAME_WIDTH / 2, statsY);
        ctx.fillText(`击杀数: ${data.killCount}`, GAME_WIDTH / 2, statsY + 35);
        ctx.fillText(`得分: ${data.finalScore}`, GAME_WIDTH / 2, statsY + 70);
        
        // 绘制按钮
        this.renderButton(this.gameOverButtons.retry);
        this.renderButton(this.gameOverButtons.menu);
    }
    
    /**
     * 渲染通关画面
     */
    renderVictoryScreen() {
        const ctx = renderer.ctx;
        
        // 绘制半透明黑色遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // 绘制恭喜通关文字（带发光效果）
        const time = Date.now() / 1000;
        const glow = Math.sin(time * 3) * 0.3 + 0.7;
        
        ctx.font = '52px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 发光效果
        ctx.shadowColor = '#ffeb3b';
        ctx.shadowBlur = 20 * glow;
        ctx.fillStyle = '#ffeb3b';
        ctx.fillText('恭喜通关！', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 180);
        ctx.shadowBlur = 0;
        
        // 获取游戏数据
        const data = gameState.getData();
        
        // 绘制统计信息
        ctx.font = '20px "Courier New", monospace';
        ctx.fillStyle = COLORS.UI.TEXT;
        
        const statsY = GAME_HEIGHT / 2 - 90;
        ctx.fillText(`存活时间: ${Math.floor(data.survivalTime)} 秒`, GAME_WIDTH / 2, statsY);
        ctx.fillText(`击杀数: ${data.killCount}`, GAME_WIDTH / 2, statsY + 35);
        ctx.fillText(`获得武器: ${data.weaponsCollected}`, GAME_WIDTH / 2, statsY + 70);
        ctx.fillText(`最终得分: ${data.finalScore}`, GAME_WIDTH / 2, statsY + 105);
        
        // 绘制按钮
        this.renderButton(this.victoryButtons.playAgain);
        this.renderButton(this.victoryButtons.menu);
    }
    
    /**
     * 渲染按钮
     * @param {Object} button - 按钮配置
     */
    renderButton(button) {
        const ctx = renderer.ctx;
        const config = MENU_ANIMATION.BUTTON_HOVER;
        
        // 获取按钮的缩放状态
        const buttonId = button.text;
        if (!this.buttonHoverStates[buttonId]) {
            this.buttonHoverStates[buttonId] = { scale: 1 };
        }
        const scale = this.buttonHoverStates[buttonId].scale;
        
        // 检测鼠标是否在按钮上
        const mouseX = inputManager.mouse.x || 0;
        const mouseY = inputManager.mouse.y || 0;
        const isHovered = this.isPointInButton(mouseX, mouseY, button);
        
        // 计算缩放后的位置和尺寸
        const centerX = button.x + button.width / 2;
        const centerY = button.y + button.height / 2;
        const scaledWidth = button.width * scale;
        const scaledHeight = button.height * scale;
        const scaledX = centerX - scaledWidth / 2;
        const scaledY = centerY - scaledHeight / 2;
        
        // 按钮颜色
        const bgColor = isHovered ? COLORS.DUNGEON.DOOR : COLORS.DUNGEON.WALL;
        const textColor = isHovered ? '#ffffff' : '#cccccc';
        const borderColor = isHovered ? '#ffffff' : '#666666';
        
        // 绘制发光效果（仅在悬停时）
        if (isHovered || scale > 1.01) {
            const glowIntensity = (scale - 1) / (config.SCALE - 1);
            const glowSize = config.GLOW_SIZE * glowIntensity;
            
            ctx.save();
            ctx.shadowColor = config.GLOW_COLOR;
            ctx.shadowBlur = glowSize;
            
            // 发光按钮背景
            ctx.fillStyle = bgColor;
            ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
            
            ctx.restore();
        }
        
        // 绘制按钮背景
        ctx.fillStyle = bgColor;
        ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
        
        // 绘制按钮边框（更亮）
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2 * scale;
        ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
        
        // 绘制按钮文字（随按钮放大）
        const fontSize = Math.floor(20 * scale);
        ctx.font = `${fontSize}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = textColor;
        ctx.fillText(button.text, centerX, centerY);
    }
    
    /**
     * 获取当前鼠标位置的按钮（如果有）
     * @param {number} x - 鼠标X坐标
     * @param {number} y - 鼠标Y坐标
     * @returns {Object|null} - 按钮对象或null
     */
    getButtonAtPosition(x, y) {
        const state = gameState.getState();
        
        let buttons = [];
        switch (state) {
            case GAME_STATE.MENU:
                buttons = [this.menuButtons.start];
                break;
            case GAME_STATE.PAUSED:
                buttons = [this.pauseButtons.resume, this.pauseButtons.restart];
                break;
            case GAME_STATE.GAME_OVER:
                buttons = [this.gameOverButtons.retry, this.gameOverButtons.menu];
                break;
            case GAME_STATE.VICTORY:
                buttons = [this.victoryButtons.playAgain, this.victoryButtons.menu];
                break;
        }
        
        for (const button of buttons) {
            if (this.isPointInButton(x, y, button)) {
                return button;
            }
        }
        
        return null;
    }
    
    // ==================== 设置界面 ====================
    
    /**
     * 初始化设置界面相关属性
     */
    initSettingsUI() {
        this.settingsTab = 'graphics';
        this.settingsTabs = ['graphics', 'audio', 'controls', 'game'];
        this.settingsTabNames = {
            graphics: '画面',
            audio: '音效',
            controls: '操作',
            game: '游戏'
        };
        
        // 返回按钮
        this.settingsBackButton = {
            x: 30,
            y: 20,
            width: 80,
            height: 35,
            text: '返回'
        };
    }
    
    /**
     * 渲染设置界面
     */
    renderSettingsScreen() {
        const ctx = renderer.ctx;
        
        // 背景
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // 标题
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚙️ 设置', GAME_WIDTH / 2, 50);
        
        // 返回按钮
        this.renderSmallButton(this.settingsBackButton);
        
        // 选项卡
        this.renderSettingsTabs();
        
        // 当前选项卡内容
        this.renderSettingsContent();
    }
    
    /**
     * 渲染设置选项卡
     */
    renderSettingsTabs() {
        const ctx = renderer.ctx;
        const tabWidth = 100;
        const tabHeight = 40;
        const startX = GAME_WIDTH / 2 - (this.settingsTabs.length * tabWidth) / 2;
        const y = 80;
        
        this.settingsTabButtons = [];
        
        this.settingsTabs.forEach((tab, i) => {
            const x = startX + i * tabWidth;
            const isActive = this.settingsTab === tab;
            
            // 背景
            ctx.fillStyle = isActive ? '#e94560' : '#0f3460';
            ctx.fillRect(x, y, tabWidth, tabHeight);
            
            // 边框
            ctx.strokeStyle = isActive ? '#ffffff' : '#666666';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, tabWidth, tabHeight);
            
            // 文字
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.settingsTabNames[tab], x + tabWidth / 2, y + tabHeight / 2);
            
            // 保存按钮信息
            this.settingsTabButtons.push({ x, y, width: tabWidth, height: tabHeight, tab });
        });
    }
    
    /**
     * 渲染设置内容
     */
    renderSettingsContent() {
        const ctx = renderer.ctx;
        const contentY = 150;
        
        switch (this.settingsTab) {
            case 'graphics':
                this.renderGraphicsSettings(contentY);
                break;
            case 'audio':
                this.renderAudioSettings(contentY);
                break;
            case 'controls':
                this.renderControlsSettings(contentY);
                break;
            case 'game':
                this.renderGameSettings(contentY);
                break;
        }
    }
    
    /**
     * 渲染画面设置
     */
    renderGraphicsSettings(startY) {
        const ctx = renderer.ctx;
        const settings = settingsManager.get();
        let y = startY;
        
        // 画质选择
        this.renderSettingOption(y, '画质', settings.graphics.quality, ['low', 'medium', 'high'], ['低', '中', '高'], 'quality');
        y += 60;
        
        // 屏幕震动
        this.renderSettingToggle(y, '屏幕震动', settings.graphics.screenShake, 'screenShake');
        y += 50;
        
        // 粒子数量
        this.renderSettingOption(y, '粒子数量', settings.graphics.particleCount, ['low', 'medium', 'high'], ['低', '中', '高'], 'particleCount');
        y += 60;
        
        // 屏幕闪光
        this.renderSettingToggle(y, '屏幕闪光', settings.graphics.screenFlash, 'screenFlash');
        y += 50;
        
        // 血液效果
        this.renderSettingToggle(y, '血液效果', settings.graphics.bloodEffect, 'bloodEffect');
        y += 50;
        
        // 全屏切换
        this.renderSettingToggle(y, '全屏模式', settings.graphics.fullscreen, 'fullscreen');
    }
    
    /**
     * 渲染音效设置
     */
    renderAudioSettings(startY) {
        const ctx = renderer.ctx;
        const settings = settingsManager.get();
        let y = startY;
        
        // 主音量
        this.renderSettingSlider(y, '主音量', settings.audio.masterVolume, 0, 100, 'masterVolume');
        y += 60;
        
        // 音效音量
        this.renderSettingSlider(y, '音效音量', settings.audio.sfxVolume, 0, 100, 'sfxVolume');
        y += 60;
        
        // 音乐音量
        this.renderSettingSlider(y, '音乐音量', settings.audio.musicVolume, 0, 100, 'musicVolume');
        y += 60;
        
        // UI音效
        this.renderSettingToggle(y, 'UI音效', settings.audio.uiSound, 'uiSound');
        y += 50;
        
        // 环境音
        this.renderSettingToggle(y, '环境音', settings.audio.ambientSound, 'ambientSound');
    }
    
    /**
     * 渲染操作设置
     */
    renderControlsSettings(startY) {
        const ctx = renderer.ctx;
        const settings = settingsManager.get();
        let y = startY;
        
        // 辅助瞄准
        this.renderSettingOption(y, '辅助瞄准', settings.controls.aimAssist, ['off', 'low', 'medium', 'high'], ['关', '低', '中', '高'], 'aimAssist');
        y += 60;
        
        // 鼠标灵敏度
        this.renderSettingSlider(y, '鼠标灵敏度', settings.controls.mouseSensitivity, 50, 150, 'mouseSensitivity');
        y += 60;
        
        // 摇杆死区
        this.renderSettingSlider(y, '摇杆死区', settings.controls.joystickDeadzone, 0, 30, 'joystickDeadzone');
        y += 60;
        
        // 自动射击
        this.renderSettingToggle(y, '自动射击', settings.controls.autoShoot, 'autoShoot');
    }
    
    /**
     * 渲染游戏设置
     */
    renderGameSettings(startY) {
        const ctx = renderer.ctx;
        const settings = settingsManager.get();
        let y = startY;
        
        // 难度
        this.renderSettingOption(y, '难度', settings.game.difficulty, ['easy', 'normal', 'hard', 'nightmare'], ['简单', '普通', '困难', '噩梦'], 'difficulty');
        y += 60;
        
        // 自动拾取
        this.renderSettingToggle(y, '自动拾取', settings.game.autoPickup, 'autoPickup');
        y += 50;
        
        // 受伤红边
        this.renderSettingToggle(y, '受伤屏幕红边', settings.game.hurtRedBorder, 'hurtRedBorder');
        y += 50;
        
        // 新手提示
        this.renderSettingToggle(y, '新手提示', settings.game.tutorialEnabled, 'tutorialEnabled');
        y += 50;
        
        // 语言
        this.renderSettingOption(y, '语言', settings.game.language, ['zh', 'en'], ['中文', '英文'], 'language');
    }
    
    /**
     * 渲染设置选项（多选）
     */
    renderSettingOption(y, label, value, options, labels, settingKey) {
        const ctx = renderer.ctx;
        const x = 150;
        const width = 500;
        
        // 标签
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(label, x, y);
        
        // 选项按钮
        const optionWidth = 70;
        const optionHeight = 30;
        const optionSpacing = 10;
        const optionsTotalWidth = options.length * optionWidth + (options.length - 1) * optionSpacing;
        const optionStartX = x + width - optionsTotalWidth;
        
        if (!this.settingButtons) this.settingButtons = {};
        this.settingButtons[settingKey] = [];
        
        options.forEach((opt, i) => {
            const ox = optionStartX + i * (optionWidth + optionSpacing);
            const isSelected = value === opt;
            
            ctx.fillStyle = isSelected ? '#e94560' : '#0f3460';
            ctx.fillRect(ox, y - 5, optionWidth, optionHeight);
            
            ctx.strokeStyle = isSelected ? '#ffffff' : '#666666';
            ctx.lineWidth = 2;
            ctx.strokeRect(ox, y - 5, optionWidth, optionHeight);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(labels[i], ox + optionWidth / 2, y - 5 + optionHeight / 2);
            
            this.settingButtons[settingKey].push({ x: ox, y: y - 5, width: optionWidth, height: optionHeight, value: opt });
        });
    }
    
    /**
     * 渲染设置开关
     */
    renderSettingToggle(y, label, value, settingKey) {
        const ctx = renderer.ctx;
        const x = 150;
        const width = 500;
        
        // 标签
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(label, x, y);
        
        // 开关按钮
        const toggleWidth = 60;
        const toggleHeight = 30;
        const toggleX = x + width - toggleWidth;
        
        if (!this.settingButtons) this.settingButtons = {};
        this.settingButtons[settingKey] = [{ x: toggleX, y: y - 5, width: toggleWidth, height: toggleHeight, toggle: true }];
        
        // 背景
        ctx.fillStyle = value ? '#4caf50' : '#666666';
        ctx.fillRect(toggleX, y - 5, toggleWidth, toggleHeight);
        
        // 滑块
        const sliderSize = 24;
        const sliderX = value ? toggleX + toggleWidth - sliderSize - 3 : toggleX + 3;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sliderX, y - 2, sliderSize, sliderSize - 6);
        
        // 边框
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 2;
        ctx.strokeRect(toggleX, y - 5, toggleWidth, toggleHeight);
    }
    
    /**
     * 渲染设置滑块
     */
    renderSettingSlider(y, label, value, min, max, settingKey) {
        const ctx = renderer.ctx;
        const x = 150;
        const width = 500;
        
        // 标签
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(label, x, y);
        
        // 数值
        ctx.fillStyle = '#ffcc00';
        ctx.font = '16px "Courier New", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${value}%`, x + width, y);
        
        // 滑块背景
        const sliderY = y + 30;
        const sliderHeight = 8;
        const sliderWidth = width - 100;
        const sliderX = x + 50;
        
        ctx.fillStyle = '#333333';
        ctx.fillRect(sliderX, sliderY, sliderWidth, sliderHeight);
        
        // 滑块填充
        const fillWidth = (value - min) / (max - min) * sliderWidth;
        ctx.fillStyle = '#e94560';
        ctx.fillRect(sliderX, sliderY, fillWidth, sliderHeight);
        
        // 滑块手柄
        const handleSize = 16;
        const handleX = sliderX + fillWidth - handleSize / 2;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(handleX, sliderY + sliderHeight / 2, handleSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 保存滑块信息
        if (!this.settingSliders) this.settingSliders = {};
        this.settingSliders[settingKey] = { x: sliderX, y: sliderY, width: sliderWidth, height: sliderHeight, min, max };
    }
    
    /**
     * 渲染小按钮
     */
    renderSmallButton(button) {
        const ctx = renderer.ctx;
        
        ctx.fillStyle = '#0f3460';
        ctx.fillRect(button.x, button.y, button.width, button.height);
        
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.strokeRect(button.x, button.y, button.width, button.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
    }
    
    /**
     * 处理设置界面点击
     */
    handleSettingsClick(x, y) {
        // 返回按钮
        if (this.isPointInRect(x, y, this.settingsBackButton)) {
            return 'settings_back';
        }
        
        // 选项卡
        if (this.settingsTabButtons) {
            for (const btn of this.settingsTabButtons) {
                if (this.isPointInRect(x, y, btn)) {
                    this.settingsTab = btn.tab;
                    return 'settings_tab';
                }
            }
        }
        
        // 设置项
        if (this.settingButtons) {
            for (const key in this.settingButtons) {
                const buttons = this.settingButtons[key];
                for (const btn of buttons) {
                    if (this.isPointInRect(x, y, btn)) {
                        if (btn.toggle) {
                            // 开关类型
                            const category = this.getSettingsCategory(key);
                            const currentValue = settingsManager.get(category, key);
                            settingsManager.set(category, key, !currentValue);
                            if (typeof soundManager !== 'undefined') {
                                soundManager.play(SOUND_EFFECTS.CLICK);
                            }
                        } else {
                            // 选项类型
                            const category = this.getSettingsCategory(key);
                            settingsManager.set(category, key, btn.value);
                            if (typeof soundManager !== 'undefined') {
                                soundManager.play(SOUND_EFFECTS.SWITCH);
                            }
                        }
                        return 'settings_change';
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * 获取设置所属分类
     */
    getSettingsCategory(key) {
        const graphicsKeys = ['quality', 'screenShake', 'particleCount', 'screenFlash', 'bloodEffect', 'fullscreen'];
        const audioKeys = ['masterVolume', 'sfxVolume', 'musicVolume', 'uiSound', 'ambientSound'];
        const controlsKeys = ['aimAssist', 'mouseSensitivity', 'joystickDeadzone', 'autoShoot', 'keyBindings'];
        const gameKeys = ['difficulty', 'autoPickup', 'hurtRedBorder', 'tutorialEnabled', 'language'];
        
        if (graphicsKeys.includes(key)) return 'graphics';
        if (audioKeys.includes(key)) return 'audio';
        if (controlsKeys.includes(key)) return 'controls';
        if (gameKeys.includes(key)) return 'game';
        return 'game';
    }
    
    /**
     * 检查点是否在矩形内
     */
    isPointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }
    
    // ==================== 排行榜界面 ====================
    
    /**
     * 渲染排行榜界面
     */
    renderLeaderboardScreen() {
        const ctx = renderer.ctx;
        
        // 背景
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // 标题
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 32px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 排行榜', GAME_WIDTH / 2, 50);
        
        // 返回按钮
        this.leaderboardBackButton = { x: 30, y: 20, width: 80, height: 35, text: '返回' };
        this.renderSmallButton(this.leaderboardBackButton);
        
        // 排行榜类型选项卡
        this.renderLeaderboardTabs();
        
        // 排行榜内容
        this.renderLeaderboardContent();
    }
    
    /**
     * 渲染排行榜选项卡
     */
    renderLeaderboardTabs() {
        const ctx = renderer.ctx;
        const types = Object.values(LEADERBOARD.TYPES);
        const typeNames = {
            [LEADERBOARD.TYPES.SPEED]: '最快通关',
            [LEADERBOARD.TYPES.KILLS]: '击杀数',
            [LEADERBOARD.TYPES.COINS]: '金币收集',
            [LEADERBOARD.TYPES.ENDLESS]: '无尽模式',
            [LEADERBOARD.TYPES.CHARACTERS]: '角色通关'
        };
        
        const tabWidth = 120;
        const tabHeight = 35;
        const totalWidth = types.length * tabWidth;
        const startX = GAME_WIDTH / 2 - totalWidth / 2;
        const y = 90;
        
        this.leaderboardTabButtons = [];
        
        types.forEach((type, i) => {
            const x = startX + i * tabWidth;
            const isActive = leaderboardManager.getCurrentType() === type;
            
            ctx.fillStyle = isActive ? '#e94560' : '#0f3460';
            ctx.fillRect(x, y, tabWidth, tabHeight);
            
            ctx.strokeStyle = isActive ? '#ffffff' : '#666666';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, tabWidth, tabHeight);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '13px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(typeNames[type], x + tabWidth / 2, y + tabHeight / 2);
            
            this.leaderboardTabButtons.push({ x, y, width: tabWidth, height: tabHeight, type });
        });
    }
    
    /**
     * 渲染排行榜内容
     */
    renderLeaderboardContent() {
        const ctx = renderer.ctx;
        const board = leaderboardManager.getCurrentLeaderboard();
        const startY = 160;
        const rowHeight = 40;
        
        if (board.length === 0) {
            ctx.fillStyle = '#888888';
            ctx.font = '20px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('暂无记录', GAME_WIDTH / 2, startY + 50);
            return;
        }
        
        board.forEach((record, index) => {
            const y = startY + index * rowHeight;
            const rank = index + 1;
            const medal = leaderboardManager.getRankMedal(rank);
            
            // 背景条纹
            if (index % 2 === 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.fillRect(100, y - 5, GAME_WIDTH - 200, rowHeight - 5);
            }
            
            // 排名
            ctx.fillStyle = rank <= 3 ? '#ffcc00' : '#ffffff';
            ctx.font = 'bold 18px "Courier New", monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${medal} ${rank}`, 120, y + rowHeight / 2 - 5);
            
            // 角色
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px "Courier New", monospace';
            ctx.fillText(record.character || '未知', 220, y + rowHeight / 2 - 5);
            
            // 数值
            ctx.fillStyle = '#4fc3f7';
            ctx.font = 'bold 18px "Courier New", monospace';
            ctx.textAlign = 'right';
            ctx.fillText(record.label || record.value, GAME_WIDTH - 220, y + rowHeight / 2 - 5);
            
            // 日期
            ctx.fillStyle = '#888888';
            ctx.font = '12px "Courier New", monospace';
            ctx.fillText(leaderboardManager.formatRelativeTime(record.timestamp), GAME_WIDTH - 120, y + rowHeight / 2 - 5);
        });
    }
    
    /**
     * 处理排行榜界面点击
     */
    handleLeaderboardClick(x, y) {
        // 返回按钮
        if (this.leaderboardBackButton && this.isPointInRect(x, y, this.leaderboardBackButton)) {
            return 'leaderboard_back';
        }
        
        // 选项卡
        if (this.leaderboardTabButtons) {
            for (const btn of this.leaderboardTabButtons) {
                if (this.isPointInRect(x, y, btn)) {
                    leaderboardManager.setCurrentType(btn.type);
                    if (typeof soundManager !== 'undefined') {
                        soundManager.play(SOUND_EFFECTS.SWITCH);
                    }
                    return 'leaderboard_tab';
                }
            }
        }
        
        return null;
    }
    
    // ==================== 成就界面 ====================
    
    /**
     * 渲染成就界面
     */
    renderAchievementsScreen() {
        const ctx = renderer.ctx;
        
        // 背景
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // 标题
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 32px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🏅 成就', GAME_WIDTH / 2, 50);
        
        // 返回按钮
        this.achievementsBackButton = { x: 30, y: 20, width: 80, height: 35, text: '返回' };
        this.renderSmallButton(this.achievementsBackButton);
        
        // 统计
        const allAchievements = ACHIEVEMENTS.LIST;
        const unlockedCount = allAchievements.filter(a => 
            typeof saveManager !== 'undefined' && saveManager.isAchievementUnlocked(a.id)
        ).length;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`已解锁: ${unlockedCount} / ${allAchievements.length}`, GAME_WIDTH / 2, 85);
        
        // 成就列表
        this.renderAchievementsList();
    }
    
    /**
     * 渲染成就列表
     */
    renderAchievementsList() {
        const ctx = renderer.ctx;
        const achievements = ACHIEVEMENTS.LIST;
        const startY = 110;
        const rowHeight = 55;
        const colWidth = (GAME_WIDTH - 100) / 2;
        
        achievements.forEach((achievement, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = 50 + col * colWidth;
            const y = startY + row * rowHeight;
            
            const isUnlocked = typeof saveManager !== 'undefined' && saveManager.isAchievementUnlocked(achievement.id);
            
            // 背景
            ctx.fillStyle = isUnlocked ? 'rgba(255, 204, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)';
            ctx.fillRect(x + 5, y, colWidth - 10, rowHeight - 5);
            
            // 边框
            ctx.strokeStyle = isUnlocked ? '#ffcc00' : '#333333';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 5, y, colWidth - 10, rowHeight - 5);
            
            // 图标
            ctx.globalAlpha = isUnlocked ? 1 : 0.3;
            ctx.font = '24px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(achievement.icon, x + 15, y + 10);
            ctx.globalAlpha = 1;
            
            // 名称
            ctx.fillStyle = isUnlocked ? '#ffcc00' : '#888888';
            ctx.font = 'bold 14px "Courier New", monospace';
            ctx.fillText(achievement.name, x + 50, y + 8);
            
            // 描述
            ctx.fillStyle = isUnlocked ? '#ffffff' : '#666666';
            ctx.font = '11px "Courier New", monospace';
            ctx.fillText(achievement.description, x + 50, y + 28);
        });
    }
    
    /**
     * 处理成就界面点击
     */
    handleAchievementsClick(x, y) {
        if (this.achievementsBackButton && this.isPointInRect(x, y, this.achievementsBackButton)) {
            return 'achievements_back';
        }
        return null;
    }
    
    // ==================== 游戏说明界面 ====================
    
    /**
     * 渲染游戏说明界面
     */
    renderHelpScreen() {
        const ctx = renderer.ctx;
        
        // 背景
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // 标题
        ctx.fillStyle = '#4fc3f7';
        ctx.font = 'bold 32px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('📖 游戏说明', GAME_WIDTH / 2, 50);
        
        // 返回按钮
        this.helpBackButton = { x: 30, y: 20, width: 80, height: 35, text: '返回' };
        this.renderSmallButton(this.helpBackButton);
        
        const startY = 100;
        let y = startY;
        
        // 游戏目标
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('游戏目标', 60, y);
        y += 30;
        
        ctx.fillStyle = '#cccccc';
        ctx.font = '14px "Courier New", monospace';
        ctx.fillText('击杀所有敌人，进入传送门，最终击败Boss通关！', 60, y);
        y += 40;
        
        // 操作说明
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.fillText('操作说明', 60, y);
        y += 30;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px "Courier New", monospace';
        const controls = [
            '移动: W A S D / 方向键',
            '射击: 鼠标左键',
            '瞄准: 移动鼠标',
            '切换武器: Q',
            '技能: 空格键',
            '暂停: P / ESC'
        ];
        
        controls.forEach(text => {
            ctx.fillText(`• ${text}`, 80, y);
            y += 22;
        });
        
        y += 15;
        
        // 角色介绍
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.fillText('角色系统', 60, y);
        y += 30;
        
        ctx.fillStyle = '#cccccc';
        ctx.font = '14px "Courier New", monospace';
        ctx.fillText('游戏中有多种角色可选，每个角色都有独特的', 60, y);
        y += 20;
        ctx.fillText('主动技能和被动技能，选择适合你的角色！', 60, y);
        y += 40;
        
        // 武器介绍
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.fillText('武器系统', 60, y);
        y += 30;
        
        ctx.fillStyle = '#cccccc';
        ctx.font = '14px "Courier New", monospace';
        ctx.fillText('8种不同武器：手枪、闪电法杖、榴弹发射器、', 60, y);
        y += 20;
        ctx.fillText('火焰喷射器、回旋镖、冰冻枪、散弹枪、追踪导弹', 60, y);
    }

    /**
     * 帮助界面点击处理
     */
    handleHelpClick(x, y) {
        if (this.helpBackButton && this.isPointInRect(x, y, this.helpBackButton)) {
            return 'help_back';
        }
        return null;
    }

    /**
     * 渲染路线选择画面
     */
    renderRouteSelectScreen() {
        const ctx = renderer.ctx;

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // 标题
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('选择下一片区域', GAME_WIDTH / 2, 80);

        const options = this.state ? this.state.getAvailableRouteOptions() : [];

        if (options.length === 0) {
            ctx.fillStyle = '#888888';
            ctx.font = '16px Arial';
            ctx.fillText('没有可选的路线', GAME_WIDTH / 2, GAME_HEIGHT / 2);
            return;
        }

        // 选项配置（图标、名称、描述）
        const optionConfigs = {
            'elite': { icon: '🏆', name: '精英房', desc: '强力敌人，高额奖励', color: '#ff4444' },
            'shop': { icon: '🛒', name: '商店房', desc: '使用金币购买道具', color: '#ffd700' },
            'rest': { icon: '💤', name: '休息房', desc: '恢复生命值', color: '#4caf50' }
        };

        const cardWidth = 180;
        const cardHeight = 200;
        const gap = 30;
        const totalWidth = options.length * cardWidth + (options.length - 1) * gap;
        const startX = GAME_WIDTH / 2 - totalWidth / 2;
        const cardY = GAME_HEIGHT / 2 - cardHeight / 2 + 30;

        // 保存卡片信息用于点击检测
        this.routeSelectCards = [];

        options.forEach((optionType, index) => {
            const config = optionConfigs[optionType];
            if (!config) return;

            const cx = startX + index * (cardWidth + gap);

            // 卡片背景
            const isHovered = this._routeSelectHoverIndex === index;
            const bgColor = isHovered ? 'rgba(60, 50, 80, 0.95)' : 'rgba(40, 35, 55, 0.9)';
            const borderColor = isHovered ? config.color : '#555555';

            ctx.fillStyle = bgColor;
            this.drawRoundedRect(ctx, cx, cardY, cardWidth, cardHeight, 12, bgColor);

            ctx.strokeStyle = borderColor;
            ctx.lineWidth = isHovered ? 3 : 2;
            this.drawRoundedRect(ctx, cx, cardY, cardWidth, cardHeight, 12, null, borderColor, isHovered ? 3 : 2);

            // 图标
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(config.icon, cx + cardWidth / 2, cardY + 60);

            // 名称
            ctx.fillStyle = config.color;
            ctx.font = 'bold 20px Arial';
            ctx.fillText(config.name, cx + cardWidth / 2, cardY + 115);

            // 描述
            ctx.fillStyle = '#aaaaaa';
            ctx.font = '14px Arial';
            ctx.fillText(config.desc, cx + cardWidth / 2, cardY + 145);

            // 数字键提示
            ctx.fillStyle = '#666666';
            ctx.font = '12px Arial';
            ctx.fillText(`[ ${index + 1} ]`, cx + cardWidth / 2, cardY + cardHeight - 15);

            // 保存点击区域
            this.routeSelectCards.push({
                x: cx, y: cardY, width: cardWidth, height: cardHeight,
                type: optionType, index: index
            });
        });

        // 底部提示
        ctx.fillStyle = '#666666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('点击选择 或 按数字键 1/2/3', GAME_WIDTH / 2, GAME_HEIGHT - 60);
    }

    /**
     * 处理路线选择点击
     * @param {number} x - 点击X坐标
     * @param {number} y - 点击Y坐标
     * @returns {string|null} - 返回动作或null
     */
    handleRouteSelectClick(x, y) {
        if (!this.routeSelectCards) return null;

        for (const card of this.routeSelectCards) {
            if (x >= card.x && x <= card.x + card.width &&
                y >= card.y && y <= card.y + card.height) {
                // 返回选择的房间类型
                return 'route_' + card.type;
            }
        }
        return null;
    }

    // ==================== 以下为兼容旧版DOM UI的方法 ====================
    
    /**
     * 初始化UI（兼容旧版）
     */
    init() {
        // 新版使用Canvas绘制，无需DOM操作
        // 获取游戏逻辑引用
        if (typeof gameLogic !== 'undefined') {
            this.gameLogic = gameLogic;
        }
    }
    
    /**
     * 显示/隐藏UI（兼容旧版）
     * @param {boolean} show - 是否显示
     */
    show(show = true) {
        // 新版Canvas UI始终显示，由render方法控制可见性
    }
    
    /**
     * 更新生命值显示（兼容旧版）
     */
    updateHealth() {
        // 由renderTopBar统一处理
    }
    
    /**
     * 更新关卡显示（兼容旧版）
     */
    updateLevel() {
        // 由renderTopBar统一处理
    }
    
    /**
     * 更新武器显示（兼容旧版）
     */
    updateWeapon() {
        // 由renderTopBar统一处理
    }
    
    /**
     * 更新武器信息（兼容旧版）
     */
    updateWeaponInfo() {
        // 由renderBottomBar统一处理
    }
    
    /**
     * 更新击杀计数（兼容旧版）
     */
    updateKillCount() {
        // 由renderBottomBar统一处理
    }
    
    /**
     * 更新所有UI元素
     */
    updateAll() {
        // 由render统一处理
    }
    
    /**
     * 显示武器切换提示（兼容旧版）
     * @param {string} message - 提示信息
     */
    showWeaponSwitchHint(message) {
        console.log(message);
    }
    
    /**
     * 渲染怒气条（火焰效果）
     */
    renderRageBar() {
        if (!this.gameLogic || !this.gameLogic.rageSystem) return;
        
        const ctx = renderer.ctx;
        const rage = this.gameLogic.rageSystem;
        
        const barWidth = 180;
        const barHeight = 16;
        const barX = 10;
        const barY = 55;
        
        // 怒气条背景
        ctx.fillStyle = '#1a0a00';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 火焰填充
        const fillWidth = barWidth * rage.getPercentage();
        if (fillWidth > 0) {
            // 火焰渐变（垂直方向：黄-橙-红）
            const gradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
            gradient.addColorStop(0, '#ffff00');
            gradient.addColorStop(0.4, '#ff6600');
            gradient.addColorStop(1, '#cc0000');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(barX, barY, fillWidth, barHeight);
            
            // 火焰波动效果
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            for (let i = 0; i < 5; i++) {
                const waveX = barX + (fillWidth * i / 5) + Math.sin(Date.now() / 150 + i) * 5;
                const waveY = barY + Math.sin(Date.now() / 200 + i * 0.7) * 3;
                ctx.beginPath();
                ctx.arc(waveX, waveY, 6, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
        
        // 边框
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // 文字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`怒气: ${Math.floor(rage.currentRage)}/${rage.maxRage}`, barX + 5, barY + barHeight / 2);
        
        // 满怒气效果
        if (rage.isFull()) {
            // 边框发光
            const glow = Math.sin(Date.now() / 100) * 0.3 + 0.7;
            ctx.strokeStyle = `rgba(255, 255, 0, ${glow})`;
            ctx.lineWidth = 3;
            ctx.strokeRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
            
            // 溢出粒子
            if (typeof particleSystem !== 'undefined' && Math.random() < 0.3) {
                particleSystem.createRageOverflowParticle(
                    barX + fillWidth,
                    barY + barHeight / 2 + (Math.random() - 0.5) * 10
                );
            }
        }
    }
    
    /**
     * 渲染技能栏（图标+冷却环）
     */
    renderSkillBar() {
        if (!this.gameLogic || !this.gameLogic.player) return;
        
        const ctx = renderer.ctx;
        const player = this.gameLogic.player;
        const skill = player.activeSkill;
        
        if (!skill) return;
        
        const barY = GAME_HEIGHT - 70;
        const iconSize = 40;
        const iconX = GAME_WIDTH / 2 - iconSize / 2;
        
        // 技能图标背景
        ctx.fillStyle = UI_COLORS.SKILL_ICON_BG;
        ctx.fillRect(iconX - 5, barY - 5, iconSize + 10, iconSize + 10);
        
        // 技能图标
        const icon = SKILL_ICONS[skill.name] || '✨';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, iconX + iconSize / 2, barY + iconSize / 2);
        
        // 冷却进度
        let cooldownPercent = 0;
        if (skill.isOnCooldown && skill.isOnCooldown()) {
            cooldownPercent = skill.getCooldownPercentage ? skill.getCooldownPercentage() : 0;
        }
        
        // 绘制冷却环
        this.drawCooldownRing(
            ctx,
            iconX + iconSize / 2,
            barY + iconSize / 2,
            iconSize / 2 + 3,
            cooldownPercent,
            skill
        );
        
        // 快捷键提示
        const keyText = skill.key === ' ' ? '空格' : (skill.key || '?').toUpperCase();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`[${keyText}]`, iconX + iconSize / 2, barY + iconSize + 15);
        
        // 技能名称
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '10px Arial';
        ctx.fillText(skill.name || '无技能', iconX + iconSize / 2, barY - 8);
    }
    
    /**
     * 绘制冷却环
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} radius - 半径
     * @param {number} percent - 冷却百分比（0=就绪，1=完全冷却）
     * @param {Object} skill - 技能对象
     */
    drawCooldownRing(ctx, x, y, radius, percent, skill) {
        // 检查是否正在前摇
        const isCasting = skill.isCasting || false;
        const castProgress = skill.castProgress && skill.castTime ? skill.castProgress / skill.castTime : 0;
        
        // 背景环
        ctx.strokeStyle = UI_COLORS.SKILL_ICON_RING_BG;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        if (isCasting) {
            // 前摇蓄力效果（黄色，从0增长到满）
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * castProgress);
            ctx.stroke();
            
            // 内圈发光效果
            const glowAlpha = 0.3 + Math.sin(Date.now() / 100) * 0.2;
            ctx.strokeStyle = `rgba(255, 255, 0, ${glowAlpha})`;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
            ctx.stroke();
            
            // 蓄力文字
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('蓄力', x, y);
        } else if (percent > 0) {
            // 冷却进度
            ctx.strokeStyle = UI_COLORS.SKILL_ICON_RING_FG;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - percent));
            ctx.stroke();
            
            // 冷却时间
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const cdRemaining = skill.getCooldownRemaining ? skill.getCooldownRemaining() : 0;
            ctx.fillText(Math.ceil(cdRemaining / 100) / 10 + 's', x, y);
        } else {
            // 就绪发光
            const glow = Math.sin(Date.now() / 200) * 0.3 + 0.7;
            ctx.strokeStyle = `rgba(0, 255, 100, ${glow})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    /**
     * 渲染角色信息
     */
    renderCharacterInfo() {
        if (!this.gameLogic || !this.gameLogic.player) return;
        
        const ctx = renderer.ctx;
        const player = this.gameLogic.player;
        
        const infoX = GAME_WIDTH - UI.CHARACTER_INFO_WIDTH - UI.CHARACTER_INFO_X_OFFSET;
        const infoY = UI.CHARACTER_INFO_Y_OFFSET;
        const boxWidth = UI.CHARACTER_INFO_WIDTH;
        const boxHeight = UI.CHARACTER_INFO_HEIGHT;
        
        // 背景框
        ctx.fillStyle = UI_COLORS.INFO_BG;
        ctx.fillRect(infoX, infoY, boxWidth, boxHeight);
        
        // 角色图标（使用字符的icon属性，如果没有则使用默认图标）
        const icon = player.character?.icon || '👤';
        const name = player.character?.name || '玩家';
        const title = player.character?.title || '';
        
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(icon, infoX + boxWidth / 2, infoY + 30);
        
        // 角色名称
        ctx.font = '12px Arial';
        ctx.fillStyle = UI_COLORS.INFO_NAME;
        ctx.fillText(name, infoX + boxWidth / 2, infoY + 50);
        
        // 角色称号
        ctx.font = '10px Arial';
        ctx.fillStyle = UI_COLORS.INFO_TITLE;
        ctx.fillText(title, infoX + boxWidth / 2, infoY + 65);
        
        // 被动技能图标
        if (player.passiveSkill) {
            ctx.fillStyle = UI_COLORS.INFO_PASSIVE;
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('◆', infoX + 5, infoY + 75);
            
            ctx.fillStyle = UI_COLORS.SKILL_TEXT;
            ctx.font = '9px Arial';
            ctx.fillText(player.passiveSkill.name || '被动', infoX + 18, infoY + 75);
        }
    }
    
    /**
     * 渲染被动技能效果
     */
    renderPassiveEffects() {
        if (!this.gameLogic || !this.gameLogic.player) return;
        
        const ctx = renderer.ctx;
        const passive = this.gameLogic.player.passiveSkill;
        
        if (!passive) return;
        
        // 如果有激活的buff（如小丑的随机buff）
        if (passive.activeBuffs && passive.activeBuffs.length > 0) {
            let y = GAME_HEIGHT - 100;
            
            for (const buff of passive.activeBuffs) {
                const color = buff.name === '速度' ? UI_COLORS.BUFF_SPEED :
                             buff.name === '伤害' ? UI_COLORS.BUFF_DAMAGE :
                             buff.name === '防御' ? UI_COLORS.BUFF_DEFENSE : UI_COLORS.BUFF_DEFAULT;
                
                ctx.fillStyle = color;
                ctx.font = '12px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(
                    `▲ ${buff.name}: ${Math.ceil(buff.timer / 1000)}s`,
                    GAME_WIDTH - 10,
                    y
                );
                
                y -= 15;
            }
        }
        
        // 如果有召唤物（骷髅）
        if (passive.activeSkeletons && passive.activeSkeletons.length > 0) {
            ctx.fillStyle = '#888888';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(
                `骷髅: ${passive.activeSkeletons.length}`,
                GAME_WIDTH - 10,
                GAME_HEIGHT - 80
            );
        }
        
        // 如果有飞龙
        if (passive.dragon && passive.dragon.active) {
            ctx.fillStyle = '#ff4444';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(
                '飞龙: 活跃',
                GAME_WIDTH - 10,
                GAME_HEIGHT - 65
            );
        }
    }
    
    /**
     * 渲染Buff指示器
     */
    renderBuffIndicators() {
        if (!this.gameLogic || !this.gameLogic.buffManager) return;
        
        const ctx = renderer.ctx;
        const buffs = this.gameLogic.buffManager.buffs;
        
        if (!buffs || buffs.length === 0) return;
        
        let y = 80;
        const x = 10;
        
        ctx.textAlign = 'left';
        ctx.font = '12px Arial';
        
        for (const buff of buffs) {
            const remaining = Math.ceil(buff.remaining / 1000);
            
            let color = UI_COLORS.BUFF_DEFAULT;
            if (buff.type === BUFF_TYPE.HEALTH) color = UI_COLORS.HEALTH_GREEN;
            else if (buff.type === BUFF_TYPE.RAGE) color = '#ffaa00';
            else if (buff.type === BUFF_TYPE.SHIELD) color = '#44aaff';
            else if (buff.type === BUFF_TYPE.SPEED) color = UI_COLORS.BUFF_SPEED;
            else if (buff.type === BUFF_TYPE.DAMAGE) color = UI_COLORS.BUFF_DAMAGE;
            else if (buff.type === BUFF_TYPE.CRIT) color = '#ff44ff';
            else if (buff.type === BUFF_TYPE.INVINCIBLE) color = '#ffff00';
            else if (buff.type === BUFF_TYPE.POISON) color = '#88ff44';
            else if (buff.type === BUFF_TYPE.INVISIBLE) color = '#aaaaff';
            
            ctx.fillStyle = color;
            ctx.fillText(`${buff.icon} ${buff.name}: ${remaining}s`, x, y);
            
            y += 16;
        }
    }
    
    /**
     * 渲染背包UI
     */
    renderInventoryUI() {
        if (!this.gameLogic || !this.gameLogic.inventory) return;
        
        const ctx = renderer.ctx;
        const inventory = this.gameLogic.inventory;
        
        const panelX = GAME_WIDTH / 2 - 200;
        const panelY = GAME_HEIGHT / 2 - 120;
        const panelWidth = 400;
        const panelHeight = 240;
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // 边框
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 3;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // 标题
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('背包 [I键关闭]', GAME_WIDTH / 2, panelY + 30);
        
        // 道具槽
        const slotSize = 40;
        const slotGap = 10;
        const startX = panelX + 30;
        const startY = panelY + 60;
        
        for (let i = 0; i < 8; i++) {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const slotX = startX + col * (slotSize + slotGap);
            const slotY = startY + row * (slotSize + slotGap);
            
            // 槽位背景
            ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
            ctx.fillRect(slotX, slotY, slotSize, slotSize);
            
            // 槽位边框
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.strokeRect(slotX, slotY, slotSize, slotSize);
            
            // 数字键提示
            ctx.fillStyle = '#888';
            ctx.font = '10px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${i + 1}`, slotX + 3, slotY + 12);
            
            // 道具图标
            const item = inventory.getItem(i);
            if (item) {
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#fff';
                ctx.fillText(item.icon, slotX + slotSize / 2, slotY + slotSize / 2 + 7);
                
                // 数量
                if (item.stackable && item.count > 1) {
                    ctx.font = 'bold 10px Arial';
                    ctx.fillStyle = '#ffd700';
                    ctx.textAlign = 'right';
                    ctx.fillText(`x${item.count}`, slotX + slotSize - 3, slotY + slotSize - 3);
                }
            }
        }
        
        // 金币和宝石
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`金币: 💰${inventory.gold}`, startX, panelY + panelHeight - 20);
        
        ctx.fillStyle = '#44ddff';
        ctx.textAlign = 'right';
        ctx.fillText(`宝石: 💎${inventory.gems}`, panelX + panelWidth - 30, panelY + panelHeight - 20);
    }
    
    /**
     * 渲染商店UI
     */
    renderShopUI() {
        if (!this.gameLogic || !this.gameLogic.shopManager) return;
        
        const ctx = renderer.ctx;
        const shop = this.gameLogic.shopManager;
        const inventory = this.gameLogic.inventory;
        
        const panelX = GAME_WIDTH / 2 - 220;
        const panelY = GAME_HEIGHT / 2 - 150;
        const panelWidth = 440;
        const panelHeight = 300;
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // 边框
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 3;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // 标题
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('【神秘商人】', GAME_WIDTH / 2, panelY + 35);
        
        // 商品列表
        const items = shop.getShopItems();
        if (items && items.length > 0) {
            const itemY = panelY + 60;
            const itemHeight = 35;
            
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const y = itemY + i * itemHeight;
                
                // 商品背景
                ctx.fillStyle = i % 2 === 0 ? 'rgba(40, 40, 40, 0.6)' : 'rgba(60, 60, 60, 0.6)';
                ctx.fillRect(panelX + 20, y, panelWidth - 40, itemHeight - 5);
                
                // 道具图标和名称
                ctx.font = '16px Arial';
                ctx.textAlign = 'left';
                ctx.fillStyle = '#fff';
                ctx.fillText(`${item.icon} ${item.name}`, panelX + 30, y + 22);
                
                // 价格
                ctx.textAlign = 'right';
                if (item.gemPrice && item.gemPrice > 0) {
                    ctx.fillStyle = '#44ddff';
                    ctx.fillText(`💎${item.gemPrice}`, panelX + panelWidth - 30, y + 22);
                } else {
                    ctx.fillStyle = '#ffd700';
                    ctx.fillText(`💰${item.price || 0}`, panelX + panelWidth - 30, y + 22);
                }
                
                // 数字键提示
                ctx.fillStyle = '#888';
                ctx.font = '12px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(`[${i + 1}]`, panelX + 4, y + 22);
            }
        }
        
        // 玩家金币和宝石
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`你的金币: 💰${inventory.gold}`, panelX + 20, panelY + panelHeight - 40);
        
        ctx.fillStyle = '#44ddff';
        ctx.textAlign = 'right';
        ctx.fillText(`宝石: 💎${inventory.gems}`, panelX + panelWidth - 20, panelY + panelHeight - 40);
        
        // 操作提示
        ctx.fillStyle = '#888';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('按数字键1-5购买  |  按E/ESC关闭', GAME_WIDTH / 2, panelY + panelHeight - 15);
    }
    
    /**
     * 渲染成就通知
     */
    renderAchievementNotifications() {
        if (!this.gameLogic || !this.gameLogic.achievementNotifications) return;
        
        const ctx = renderer.ctx;
        const notifications = this.gameLogic.achievementNotifications;
        
        if (notifications.length === 0) return;
        
        for (let i = 0; i < notifications.length; i++) {
            const notif = notifications[i];
            const achievement = notif.achievement;
            
            const panelX = GAME_WIDTH / 2 - 150;
            const panelY = 20 + i * 70;
            const panelWidth = 300;
            const panelHeight = 60;
            
            // 背景
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
            
            // 边框（金色）
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
            
            // 图标
            ctx.font = '28px Arial';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#fff';
            ctx.fillText(achievement.icon, panelX + 10, panelY + 38);
            
            // 标题
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('成就解锁!', GAME_WIDTH / 2, panelY + 18);
            
            // 成就名称
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.fillText(achievement.name, GAME_WIDTH / 2, panelY + 38);
            
            // 描述
            ctx.fillStyle = '#aaa';
            ctx.font = '10px Arial';
            ctx.fillText(achievement.description, GAME_WIDTH / 2, panelY + 52);
        }
    }
    
    /**
     * 渲染商店交互提示
     */
    renderShopHint() {
        const ctx = renderer.ctx;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(GAME_WIDTH / 2 - 80, GAME_HEIGHT - 120, 160, 30);
        
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1;
        ctx.strokeRect(GAME_WIDTH / 2 - 80, GAME_HEIGHT - 120, 160, 30);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('按 E 与商人交易', GAME_WIDTH / 2, GAME_HEIGHT - 100);
    }
}

// 创建全局UI管理器实例
const uiManager = new UIManager();
