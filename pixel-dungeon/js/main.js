/**
 * 游戏主入口
 * 负责游戏初始化和启动
 */

// 游戏主类
class Game {
    constructor(eventBus) {
        // 游戏是否正在运行
        this.running = false;
        
        // 菜单循环是否运行
        this.menuLoopRunning = false;
        
        // 上一帧时间戳
        this.lastTime = 0;
        
        // 帧时间统计
        this.frameTime = 0;
        
        // 动画帧ID
        this.animationFrameId = null;
        
        // 菜单动画帧ID
        this.menuAnimationFrameId = null;
        
        // 游戏组件引用
        this.gameLogic = null;
        
        // 事件总线
        this.eventBus = eventBus;
        
        // 崩溃界面状态
        this._crashScreenActive = false;
        this._crashError = null;
        this._crashRetryBtn = null;
        this._crashMenuBtn = null;
    }
    
    /**
     * 初始化游戏
     */
    init() {
        console.log('正在初始化游戏...');
        
        // 初始化渲染器
        if (!renderer.init('game-canvas')) {
            console.error('渲染器初始化失败');
            return false;
        }
        
        // 初始化存档管理器
        if (typeof SaveManager !== 'undefined') {
            window.saveManager = new SaveManager();
            saveManager.init();
        }
        
        // 初始化设置管理器
        if (typeof SettingsManager !== 'undefined') {
            window.settingsManager = new SettingsManager();
            settingsManager.init();
        }
        
        // 初始化排行榜管理器
        if (typeof LeaderboardManager !== 'undefined') {
            window.leaderboardManager = new LeaderboardManager();
            leaderboardManager.init();
        }
        
        // 初始化音效管理器
        if (typeof SoundManager !== 'undefined') {
            window.soundManager = new SoundManager();
        }
        
        // 初始化新手引导管理器
        if (typeof TutorialManager !== 'undefined') {
            window.tutorialManager = new TutorialManager();
            tutorialManager.init();
        }
        
        // 初始化音频系统
        audioManager.init();
        
        // 设置输入管理器
        inputManager.setCanvas(renderer.getCanvas());
        
        // 初始化游戏逻辑
        this.gameLogic = new GameLogic({ eventBus: this.eventBus });
        this.gameLogic.init();
        
        // 初始化UI设置界面
        if (uiManager && typeof uiManager.initSettingsUI === 'function') {
            uiManager.initSettingsUI();
        }
        
        // 绑定UI事件
        this.bindUIEvents();
        
        console.log('游戏初始化完成');
        return true;
    }
    
    /**
     * 绑定UI事件
     */
    bindUIEvents() {
        // Canvas点击事件处理
        const canvas = renderer.getCanvas();
        if (canvas) {
            // 移除旧监听器避免重复绑定
            canvas.removeEventListener('click', this._handleCanvasClick);
            this._handleCanvasClick = (e) => this.handleCanvasClick(e);
            canvas.addEventListener('click', this._handleCanvasClick);
        }

        // 移除旧暂停回调
        inputManager.off('onPause', this._onPauseCallback);
        this._onPauseCallback = () => {
            if (gameState.isState(GAME_STATE.PLAYING)) {
                this.pause();
            } else if (gameState.isState(GAME_STATE.PAUSED)) {
                this.resume();
            }
        };
        inputManager.on('onPause', this._onPauseCallback);

        // 移除旧键盘监听器
        if (this._handleKeyDown) {
            document.removeEventListener('keydown', this._handleKeyDown);
        }
        this._handleKeyDown = (e) => {
            if (!gameState.isState(GAME_STATE.PLAYING)) return;
            if (!this.gameLogic) return;

            if (e.code === 'KeyI') {
                this.gameLogic.toggleInventory();
                e.preventDefault();
                return;
            }

            if (e.code === 'KeyE') {
                if (this.gameLogic.shopManager.isShopOpen()) {
                    this.gameLogic.closeShop();
                } else {
                    this.gameLogic.interactWithShop();
                }
                e.preventDefault();
                return;
            }

            if (e.code === 'KeyF') {
                this.gameLogic.toggleAimAssist();
                e.preventDefault();
                return;
            }

            if (e.code >= 'Digit1' && e.code <= 'Digit8') {
                const slotIndex = parseInt(e.code.replace('Digit', '')) - 1;

                if (this.gameLogic.shopManager && this.gameLogic.shopManager.isShopOpen()) {
                    this.gameLogic.buyShopItem(slotIndex);
                } else {
                    this.gameLogic.useInventoryItem(slotIndex);
                }
                e.preventDefault();
                return;
            }

            if (e.code === 'Escape') {
                if (this.gameLogic.inventoryOpen) {
                    this.gameLogic.toggleInventory();
                    e.preventDefault();
                    return;
                }
                if (this.gameLogic.shopManager.isShopOpen()) {
                    this.gameLogic.closeShop();
                    e.preventDefault();
                    return;
                }
            }
        };
        document.addEventListener('keydown', this._handleKeyDown);
    }
    
    /**
     * 处理Canvas点击事件
     * @param {MouseEvent} e - 鼠标事件
     */
    handleCanvasClick(e) {
        // 获取Canvas坐标
        const rect = renderer.getCanvas().getBoundingClientRect();
        const scaleX = GAME_WIDTH / rect.width;
        const scaleY = GAME_HEIGHT / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        // 如果崩溃界面激活，拦截所有点击
        if (this._crashScreenActive) {
            this.handleCrashClick(x, y);
            return;
        }
        
        // 初始化音效（首次用户交互时）
        if (typeof soundManager !== 'undefined' && !soundManager.initialized) {
            soundManager.init();
            soundManager.playMusic('menu');
        }
        
        // 处理设置界面点击
        if (gameState.isState(GAME_STATE.SETTINGS)) {
            const result = uiManager.handleSettingsClick(x, y);
            if (result === 'settings_back') {
                this.returnFromSettings();
            }
            return;
        }
        
        // 处理排行榜界面点击
        if (gameState.isState(GAME_STATE.LEADERBOARD)) {
            const result = uiManager.handleLeaderboardClick(x, y);
            if (result === 'leaderboard_back') {
                this.returnFromLeaderboard();
            }
            return;
        }
        
        // 处理成就界面点击
        if (gameState.isState(GAME_STATE.ACHIEVEMENTS)) {
            const result = uiManager.handleAchievementsClick(x, y);
            if (result === 'achievements_back') {
                this.returnFromAchievements();
            }
            return;
        }
        
        // 处理帮助界面点击
        if (gameState.isState(GAME_STATE.HELP)) {
            const result = uiManager.handleHelpClick(x, y);
            if (result === 'help_back') {
                this.returnFromHelp();
            }
            return;
        }
        
        // 检查UI按钮点击
        const action = uiManager.handleClick(x, y);
        
        if (action) {
            switch (action) {
                case 'start':
                    this.goToCharacterSelect();
                    break;
                case 'confirm':
                    this.startGameWithCharacter();
                    break;
                case 'select':
                    if (gameState.isState(GAME_STATE.DIFFICULTY_SELECT)) {
                        this.startGameWithDifficulty();
                    }
                    break;
                case 'back':
                    if (gameState.isState(GAME_STATE.DIFFICULTY_SELECT)) {
                        this.returnToCharacterSelectFromDifficulty();
                    }
                    break;
                case 'resume':
                    this.resume();
                    break;
                case 'restart':
                    this.restart();
                    break;
                case 'menu':
                    this.returnToMenu();
                    break;
                case 'settings':
                    this.openSettings();
                    break;
                case 'pause_settings':
                    gameState.setState(GAME_STATE.SETTINGS);
                    break;
                case 'leaderboard':
                    this.openLeaderboard();
                    break;
                case 'achievements':
                    this.openAchievements();
                    break;
                case 'help':
                    this.openHelp();
                    break;
                case 'tutorial':
                    this.startTutorial();
                    break;
                case 'route_elite':
                    this.confirmRoute('elite');
                    break;
                case 'route_shop':
                    this.confirmRoute('shop');
                    break;
                case 'route_rest':
                    this.confirmRoute('rest');
                    break;
            }
            return;
        }
    }
    
    /**
     * 进入角色选择界面
     */
    goToCharacterSelect() {
        console.log('进入角色选择界面');
        
        // 重置角色选择管理器动画
        characterSelectManager.introAnimationProgress = 0;
        characterSelectManager.isIntroComplete = false;
        
        // 设置游戏状态为角色选择
        gameState.startCharacterSelect();
        
        // 更新UI
        this.updateUI(GAME_STATE.CHARACTER_SELECT);
    }
    
    /**
     * 开始游戏（使用选中的角色）
     */
    startGameWithCharacter() {
        // 获取选中的角色
        const character = characterSelectManager.getSelectedCharacter();
        
        if (character) {
            console.log(`选择角色: ${character.name}，进入难度选择`);
            
            // 设置选中的角色到游戏状态
            gameState.setSelectedCharacter(character);
            
            // 进入难度选择界面
            this.goToDifficultySelect();
        }
    }
    
    /**
     * 进入难度选择界面
     */
    goToDifficultySelect() {
        console.log('进入难度选择界面');
        
        // 重置难度选择动画
        uiManager.resetDifficultySelectAnimation();
        
        // 设置游戏状态为难度选择
        gameState.startDifficultySelect();
        
        // 更新UI
        this.updateUI(GAME_STATE.DIFFICULTY_SELECT);
    }
    
    startGameWithDifficulty() {
        console.log('确认难度，开始游戏');

        // 确认难度设置
        gameState.confirmDifficultyAndStart();

        // 重新初始化游戏逻辑（应用角色属性和难度设置）
        this.gameLogic.init();

        // 停止菜单循环
        this.stopMenuLoop();

        // 启动游戏循环
        this.running = true;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
    
    /**
     * 从难度选择返回角色选择
     */
    returnToCharacterSelectFromDifficulty() {
        console.log('返回角色选择');
        
        // 重置角色选择动画
        characterSelectManager.introAnimationProgress = 0;
        characterSelectManager.isIntroComplete = false;
        
        // 设置游戏状态为角色选择
        gameState.setState(GAME_STATE.CHARACTER_SELECT);
        
        // 更新UI
        this.updateUI(GAME_STATE.CHARACTER_SELECT);
    }
    
    /**
     * 状态变化处理
     * @param {string} oldState - 原状态
     * @param {string} newState - 新状态
     */
    onStateChange(oldState, newState) {
        // 显示/隐藏对应的UI界面
        this.updateUI(newState);
    }
    
    /**
     * 更新UI显示
     * @param {string} state - 当前游戏状态
     */
    updateUI(state) {
        // 隐藏所有HTML屏幕元素（新版使用Canvas绘制）
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // 根据状态更新HTML屏幕（仅用于兼容备用，实际由Canvas渲染）
        // Canvas UI在uiManager.render()中统一处理
        switch (state) {
            case GAME_STATE.MENU:
                // Canvas会渲染菜单画面
                break;
                
            case GAME_STATE.CHARACTER_SELECT:
                // Canvas会渲染角色选择画面
                break;
                
            case GAME_STATE.DIFFICULTY_SELECT:
                // Canvas会渲染难度选择画面
                break;
                
            case GAME_STATE.PLAYING:
                // 游戏界面由Canvas渲染HUD
                break;
                
            case GAME_STATE.PAUSED:
                // Canvas会渲染暂停画面
                break;
                
            case GAME_STATE.GAME_OVER:
                // Canvas会渲染死亡画面
                // 同时更新HTML统计数据（备用）
                const gameData = gameState.getData();
                document.getElementById('survival-time').textContent = Math.floor(gameData.survivalTime);
                document.getElementById('final-kills').textContent = gameData.killCount;
                document.getElementById('final-score').textContent = gameData.finalScore;
                break;
                
            case GAME_STATE.VICTORY:
                // Canvas会渲染通关画面
                // 同时更新HTML统计数据（备用）
                const victoryData = gameState.getData();
                document.getElementById('victory-time').textContent = Math.floor(victoryData.survivalTime);
                document.getElementById('victory-kills').textContent = victoryData.killCount;
                document.getElementById('victory-weapons').textContent = victoryData.weaponsCollected;
                document.getElementById('victory-score').textContent = victoryData.finalScore;
                break;
        }
    }
    
    /**
     * 开始新游戏
     */
    start() {
        if (this.running) return;
        
        console.log('进入角色选择');
        
        // 停止菜单循环
        this.stopMenuLoop();
        
        // 进入角色选择状态
        gameState.startCharacterSelect();
        
        // 启动菜单动画循环（用于渲染角色选择界面）
        this.startMenuLoop();
    }
    
    /**
     * 暂停游戏
     */
    pause() {
        if (!this.running) return;
        
        console.log('暂停游戏');
        gameState.pauseGame();
    }
    
    /**
     * 继续游戏
     */
    resume() {
        if (!this.running) return;
        
        console.log('继续游戏');
        gameState.resumeGame();
        
        // 继续游戏循环
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
    
    /**
     * 重新开始游戏
     */
    restart() {
        console.log('重新开始游戏');
        
        // 停止当前游戏循环
        this.running = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // 停止菜单循环
        this.stopMenuLoop();
        
        // 清理游戏逻辑
        if (this.gameLogic) {
            this.gameLogic.cleanup();
        }
        
        // 清理全局粒子系统
        if (particleSystem && typeof particleSystem.clear === 'function') {
            particleSystem.clear();
        }
        
        // 重新初始化游戏逻辑
        this.gameLogic.init();
        
        // 重新绑定UI事件
        this.bindUIEvents();
        
        // 开始新游戏
        this.start();
    }
    
    /**
     * 返回主菜单
     */
    returnToMenu() {
        console.log('返回主菜单');
        
        // 停止游戏循环
        this.running = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // 停止菜单循环
        this.stopMenuLoop();
        
        // 清理游戏逻辑
        if (this.gameLogic) {
            this.gameLogic.cleanup();
        }
        
        // 重置游戏状态
        gameState.returnToMenu();
        
        // 更新UI
        this.updateUI(GAME_STATE.MENU);
        
        // 播放菜单音乐
        if (typeof soundManager !== 'undefined' && soundManager.initialized) {
            soundManager.playMusic('menu');
        }
        
        // 启动菜单动画循环
        this.startMenuLoop();
    }
    
    /**
     * 打开设置界面
     */
    openSettings() {
        console.log('打开设置');
        
        // 记录上一个状态
        this.previousState = gameState.getState();
        
        // 切换到设置状态
        gameState.setState(GAME_STATE.SETTINGS);
        
        // 播放按钮音效
        if (typeof soundManager !== 'undefined' && soundManager.initialized) {
            soundManager.play(SOUND_EFFECTS.CLICK);
        }
    }
    
    /**
     * 从设置界面返回
     */
    returnFromSettings() {
        console.log('从设置返回');
        
        // 保存设置
        if (typeof settingsManager !== 'undefined') {
            settingsManager.saveSettings();
        }
        
        // 返回上一个状态
        if (this.previousState) {
            gameState.setState(this.previousState);
        } else {
            gameState.setState(GAME_STATE.MENU);
        }
        
        // 播放按钮音效
        if (typeof soundManager !== 'undefined' && soundManager.initialized) {
            soundManager.play(SOUND_EFFECTS.CLICK);
        }
    }
    
    /**
     * 打开排行榜界面
     */
    openLeaderboard() {
        console.log('打开排行榜');
        
        this.previousState = gameState.getState();
        gameState.setState(GAME_STATE.LEADERBOARD);
        
        if (typeof soundManager !== 'undefined' && soundManager.initialized) {
            soundManager.play(SOUND_EFFECTS.CLICK);
        }
    }
    
    /**
     * 从排行榜返回
     */
    returnFromLeaderboard() {
        console.log('从排行榜返回');
        
        if (this.previousState) {
            gameState.setState(this.previousState);
        } else {
            gameState.setState(GAME_STATE.MENU);
        }
        
        if (typeof soundManager !== 'undefined' && soundManager.initialized) {
            soundManager.play(SOUND_EFFECTS.CLICK);
        }
    }
    
    /**
     * 打开成就界面
     */
    openAchievements() {
        console.log('打开成就');
        
        this.previousState = gameState.getState();
        gameState.setState(GAME_STATE.ACHIEVEMENTS);
        
        if (typeof soundManager !== 'undefined' && soundManager.initialized) {
            soundManager.play(SOUND_EFFECTS.CLICK);
        }
    }
    
    /**
     * 从成就返回
     */
    returnFromAchievements() {
        console.log('从成就返回');
        
        if (this.previousState) {
            gameState.setState(this.previousState);
        } else {
            gameState.setState(GAME_STATE.MENU);
        }
        
        if (typeof soundManager !== 'undefined' && soundManager.initialized) {
            soundManager.play(SOUND_EFFECTS.CLICK);
        }
    }
    
    /**
     * 打开帮助界面
     */
    openHelp() {
        console.log('打开帮助');
        
        this.previousState = gameState.getState();
        gameState.setState(GAME_STATE.HELP);
        
        if (typeof soundManager !== 'undefined' && soundManager.initialized) {
            soundManager.play(SOUND_EFFECTS.CLICK);
        }
    }
    
    /**
     * 从帮助返回
     */
    returnFromHelp() {
        console.log('从帮助返回');
        
        if (this.previousState) {
            gameState.setState(this.previousState);
        } else {
            gameState.setState(GAME_STATE.MENU);
        }
        
        if (typeof soundManager !== 'undefined' && soundManager.initialized) {
            soundManager.play(SOUND_EFFECTS.CLICK);
        }
    }
    
    /**
     * 开始新手引导
     */
    startTutorial() {
        console.log('开始新手引导');
        
        // 停止菜单循环
        this.stopMenuLoop();
        
        // 开始游戏
        this.running = true;
        this.lastTime = performance.now();
        gameState.confirmDifficultyAndStart();
        
        // 启动新手引导
        if (typeof tutorialManager !== 'undefined') {
            tutorialManager.startTutorial(this.gameLogic);
        }
        
        // 启动游戏循环
        this.gameLoop(this.lastTime);
    }

    /**
     * 确认路线选择
     * @param {string} roomType - 选择的房间类型
     */
    confirmRoute(roomType) {
        console.log('选择路线:', roomType);

        // 标记路线选择已锁定（每局只触发一次）
        this.gameLogic.state.getData().routeSelectLocked = true;

        // 从 DungeonLevel 中找到对应类型的房间节点
        const nextRoomNode = this.gameLogic.dungeonLevel.findNextRoomByType(roomType);
        if (nextRoomNode) {
            this.gameLogic.changeRoom(nextRoomNode);
        } else {
            this.gameLogic._pendingRoomType = roomType;
            this.gameLogic.state.getData().currentLevel++;
            this.gameLogic.initRoom();
        }
        
        this.gameLogic.portal = null;
        this.gameLogic.allEnemiesCleared = false;

        // 切回游戏状态
        gameState.setState(GAME_STATE.PLAYING);

        // 播放选择音效
        if (typeof soundManager !== 'undefined' && soundManager.initialized) {
            soundManager.play(SOUND_EFFECTS.CLICK);
        }
    }

    /**
     * 取消路线选择（返回游戏继续）
     */
    cancelRouteSelect() {
        console.log('取消路线选择');

        // 标记路线选择已锁定（每局只触发一次）
        this.gameLogic.state.getData().routeSelectLocked = true;

        // 切回游戏状态
        gameState.setState(GAME_STATE.PLAYING);

        // 如果当前房间未清空，开门让玩家进入下一房间
        if (this.gameLogic.currentRoomNode && !this.gameLogic.currentRoomNode.cleared) {
            this.gameLogic.doorManager.onRoomCleared(this.gameLogic.currentRoomNode);
        }
    }

    /**
     * 启动菜单动画循环
     */
    startMenuLoop() {
        if (this.menuLoopRunning) return;
        
        this.menuLoopRunning = true;
        this.lastTime = performance.now();
        this.menuLoop(this.lastTime);
    }
    
    /**
     * 停止菜单动画循环
     */
    stopMenuLoop() {
        this.menuLoopRunning = false;
        if (this.menuAnimationFrameId) {
            cancelAnimationFrame(this.menuAnimationFrameId);
            this.menuAnimationFrameId = null;
        }
    }
    
    /**
     * 菜单动画循环（仅渲染UI和菜单动画）
     * @param {number} currentTime - 当前时间戳
     */
    menuLoop(currentTime) {
        if (!this.menuLoopRunning) return;
        
        // 计算delta time
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 更新帧率统计
        renderer.updateFps(currentTime);
        
        // 限制delta time
        const clampedDelta = Math.min(deltaTime, DELTA_TIME_MAX);
        
        // 渲染游戏背景和UI
        try {
            if (this.gameLogic) {
                this.gameLogic.render();
            }
            uiManager.update(clampedDelta);
            uiManager.render();
        } catch (error) {
            console.error('[MENU LOOP ERROR]', error);
        }
        
        // 继续下一帧
        this.menuAnimationFrameId = requestAnimationFrame(this.menuLoop.bind(this));
    }
    
    /**
     * 游戏主循环
     * @param {number} currentTime - 当前时间戳
     */
    gameLoop(currentTime) {
        if (!this.running) return;
        
        // 计算delta time
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 更新帧率统计
        renderer.updateFps(currentTime);
        
        // 限制delta time（防止卡顿后出现意外）
        const clampedDelta = Math.min(deltaTime, DELTA_TIME_MAX);
        
        // 如果游戏正在运行且未暂停，更新游戏逻辑
        if (gameState.isPlaying()) {
            try {
                this.gameLogic.update(clampedDelta);
                
                // 更新全局粒子系统
                if (particleSystem) {
                    particleSystem.update(clampedDelta);
                }
                
                // 更新新手引导
                if (typeof tutorialManager !== 'undefined' && tutorialManager.active) {
                    tutorialManager.update(clampedDelta);
                }
                
                // 检查传送门碰撞
                this.checkPortalCollision();
                
                // 检查游戏结束
                this.checkGameEnd();
            } catch (error) {
                console.error('[GAME LOOP ERROR]', error);
                this.handleGameError(error);
            }
        }
        
        // 渲染游戏画面
        try {
            this.gameLogic.render();
            
            // 渲染全局粒子系统效果（在游戏元素之上，UI之下）
            if (particleSystem && gameState.isPlaying()) {
                particleSystem.render(renderer.ctx);
            }
            
            // 更新并渲染UI（使用Canvas绘制）
            uiManager.update(clampedDelta);
            uiManager.render();
        } catch (error) {
            console.error('[RENDER ERROR]', error);
        }
        
        // 继续下一帧
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    /**
     * 检查门碰撞（DungeonLevel驱动的房间切换）
     */
    checkPortalCollision() {
        this.gameLogic.checkDoorCollision();
        this.gameLogic.checkPortalCollision();
    }
    
    /**
     * 处理游戏运行时错误
     * @param {Error} error - 错误对象
     */
    handleGameError(error) {
        console.error('[GAME ERROR] 游戏运行时发生错误:', error);
        console.error('错误堆栈:', error.stack);
        
        if (gameState.isState(GAME_STATE.PLAYING)) {
            if (confirm('游戏运行时出现错误，是否继续游戏？')) {
                return;
            } else {
                this.returnToMenu();
            }
        }
    }
    
    /**
     * 处理未捕获的全局错误
     * @param {Error} error - 错误对象
     */
    handleError(error) {
        console.error('[GLOBAL ERROR]', error);
        
        // 停止游戏循环
        this.running = false;
        this.menuLoopRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.menuAnimationFrameId) {
            cancelAnimationFrame(this.menuAnimationFrameId);
            this.menuAnimationFrameId = null;
        }
        
        // 保存错误信息用于渲染
        this._crashError = error;
        this._crashScreenActive = true;
        
        // 渲染崩溃界面
        this.renderCrashScreen();
    }
    
    /**
     * 渲染崩溃界面到Canvas
     */
    renderCrashScreen() {
        const canvas = renderer.getCanvas();
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const w = canvas.width;
        const h = canvas.height;
        
        // 半透明黑色遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, w, h);
        
        // 标题
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 36px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('游戏遇到问题', w / 2, h / 2 - 100);
        
        // 错误信息
        ctx.fillStyle = '#888888';
        ctx.font = '14px "Courier New", monospace';
        const errorMsg = this._crashError ? (this._crashError.message || '未知错误') : '未知错误';
        ctx.fillText(errorMsg.substring(0, 60), w / 2, h / 2 - 50);
        
        // "重试" 按钮
        this._crashRetryBtn = { x: w / 2 - 100, y: h / 2, w: 200, h: 50 };
        ctx.fillStyle = '#0f3460';
        ctx.fillRect(this._crashRetryBtn.x, this._crashRetryBtn.y, this._crashRetryBtn.w, this._crashRetryBtn.h);
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 2;
        ctx.strokeRect(this._crashRetryBtn.x, this._crashRetryBtn.y, this._crashRetryBtn.w, this._crashRetryBtn.h);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.fillText('重试', w / 2, h / 2 + 25);
        
        // "返回主菜单" 按钮
        this._crashMenuBtn = { x: w / 2 - 100, y: h / 2 + 70, w: 200, h: 50 };
        ctx.fillStyle = '#0f3460';
        ctx.fillRect(this._crashMenuBtn.x, this._crashMenuBtn.y, this._crashMenuBtn.w, this._crashMenuBtn.h);
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 2;
        ctx.strokeRect(this._crashMenuBtn.x, this._crashMenuBtn.y, this._crashMenuBtn.w, this._crashMenuBtn.h);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.fillText('返回主菜单', w / 2, h / 2 + 95);
    }
    
    /**
     * 处理崩溃界面的点击
     * @param {number} x - Canvas X坐标
     * @param {number} y - Canvas Y坐标
     * @returns {boolean} 是否被崩溃界面处理
     */
    handleCrashClick(x, y) {
        if (!this._crashScreenActive) return false;
        
        // 检查"重试"按钮
        if (this._crashRetryBtn && 
            x >= this._crashRetryBtn.x && x <= this._crashRetryBtn.x + this._crashRetryBtn.w &&
            y >= this._crashRetryBtn.y && y <= this._crashRetryBtn.y + this._crashRetryBtn.h) {
            this._crashScreenActive = false;
            this._crashError = null;
            this.restart();
            return true;
        }
        
        // 检查"返回主菜单"按钮
        if (this._crashMenuBtn && 
            x >= this._crashMenuBtn.x && x <= this._crashMenuBtn.x + this._crashMenuBtn.w &&
            y >= this._crashMenuBtn.y && y <= this._crashMenuBtn.y + this._crashMenuBtn.h) {
            this._crashScreenActive = false;
            this._crashError = null;
            this.returnToMenu();
            return true;
        }
        
        return true; // 拦截所有点击，防止穿透
    }
    
    /**
     * 检查游戏是否结束
     */
    checkGameEnd() {
        const gameData = gameState.getData();
        
        // 检查游戏结束状态
        if (gameState.isState(GAME_STATE.GAME_OVER) || gameState.isState(GAME_STATE.VICTORY)) {
            // 游戏已经结束，不再处理
            return;
        }
        
        // 检查玩家是否死亡
        const player = this.gameLogic.player;
        if (player && player.health <= 0) {
            this.handleGameOver();
            return;
        }
        
        // 检查是否通关（击败Boss）- 通过游戏状态或gameLogic.isVictory检测
        const isGameStateVictory = this.gameLogic.state && this.gameLogic.state.isState && this.gameLogic.state.isState(GAME_STATE.VICTORY);
        if (this.gameLogic.isVictory || isGameStateVictory) {
            this.handleVictory();
        }
    }
    
    /**
     * 处理游戏结束（死亡）
     */
    handleGameOver() {
        console.log('游戏结束');
        
        // 停止游戏
        this.running = false;
        
        // 设置游戏结束状态
        gameState.setGameOver();
        
        // 播放死亡音效
        if (typeof soundManager !== 'undefined' && soundManager.initialized) {
            soundManager.play(SOUND_EFFECTS.DEFEAT);
            soundManager.stopMusic();
        }
        
        // 保存游戏统计数据
        this.saveGameStats(false);
    }
    
    /**
     * 处理胜利（通关）
     */
    handleVictory() {
        console.log('游戏胜利！');
        
        // 停止游戏
        this.running = false;
        
        // 设置胜利状态
        gameState.victory();
        
        // 播放胜利音效
        if (typeof soundManager !== 'undefined' && soundManager.initialized) {
            soundManager.play(SOUND_EFFECTS.VICTORY);
            soundManager.stopMusic();
        }
        
        // 保存游戏统计数据
        this.saveGameStats(true);
        
        // 提交排行榜记录
        this.submitLeaderboardRecords(true);
    }
    
    /**
     * 保存游戏统计数据
     * @param {boolean} victory - 是否胜利
     */
    saveGameStats(victory) {
        if (typeof saveManager === 'undefined') return;
        
        const gameData = gameState.getData();
        const character = gameState.getSelectedCharacter();
        
        // 更新全局统计
        saveManager.addTotalKills(gameData.killCount || 0);
        saveManager.addTotalPlayTime(gameData.survivalTime || 0);
        saveManager.addTotalCoins(gameData.coins || 0);
        
        // 如果胜利，更新通关记录
        if (victory && character) {
            saveManager.unlockCharacter(character.id);
            saveManager.setBestClearTime(gameData.survivalTime);
        }
        
        // 保存
        saveManager.saveGlobalStats();
    }
    
    /**
     * 提交排行榜记录
     * @param {boolean} victory - 是否胜利
     */
    submitLeaderboardRecords(victory) {
        if (typeof leaderboardManager === 'undefined') return;
        
        const gameData = gameState.getData();
        const character = gameState.getSelectedCharacter();
        const characterName = character ? character.name : '未知';
        
        // 提交击杀数
        if (gameData.killCount > 0) {
            leaderboardManager.addKillsRecord(gameData.killCount, characterName);
        }
        
        // 提交金币数
        if (gameData.coins > 0) {
            leaderboardManager.addCoinsRecord(gameData.coins, characterName);
        }
        
        // 如果胜利，提交通关时间
        if (victory && gameData.survivalTime > 0) {
            leaderboardManager.submitSpeedRun(gameData.survivalTime, characterName);
        }
        
        // 保存排行榜
        leaderboardManager.saveLeaderboards();
    }
    
    /**
     * 获取游戏逻辑实例
     */
    getGameLogic() {
        return this.gameLogic;
    }
}

// ==================== 游戏实例和初始化 ====================
let game = null;
let particleSystem = null;
let eventBus = null;

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成，正在初始化...');
    
    // 创建事件总线
    eventBus = new EventBus();
    
    // 创建粒子系统
    particleSystem = new ParticleSystem();
    
    // 创建游戏实例
    game = new Game(eventBus);
    
    // 初始化游戏
    if (game.init()) {
        // 显示主菜单
        game.updateUI(GAME_STATE.MENU);
        
        // 启动菜单动画循环
        game.startMenuLoop();
        
        console.log('游戏已就绪');
    } else {
        console.error('游戏初始化失败');
    }
});

// 防止页面关闭时游戏仍在运行
window.addEventListener('beforeunload', () => {
    if (game) {
        game.running = false;
    }
});

// 键盘快捷键监听
window.addEventListener('keydown', (e) => {
    // 如果游戏未初始化，忽略
    if (!game) return;
    
    // 处理角色选择界面的键盘输入
    if (gameState.isState(GAME_STATE.CHARACTER_SELECT)) {
        characterSelectManager.handleKeyNavigation(e.code);
        
        if (e.code === 'Enter' || e.code === 'Space') {
            game.startGameWithCharacter();
        } else if (e.code === 'Escape') {
            game.returnToMenu();
        }
        
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Enter', 'Space', 'Escape'].includes(e.code)) {
            e.preventDefault();
        }
        return;
    }
    
    // 处理设置界面ESC返回
    if (gameState.isState(GAME_STATE.SETTINGS)) {
        if (e.code === 'Escape') {
            game.returnFromSettings();
            e.preventDefault();
        }
        return;
    }
    
    // 处理排行榜界面ESC返回
    if (gameState.isState(GAME_STATE.LEADERBOARD)) {
        if (e.code === 'Escape') {
            game.returnFromLeaderboard();
            e.preventDefault();
        }
        return;
    }
    
    // 处理成就界面ESC返回
    if (gameState.isState(GAME_STATE.ACHIEVEMENTS)) {
        if (e.code === 'Escape') {
            game.returnFromAchievements();
            e.preventDefault();
        }
        return;
    }
    
    // 处理帮助界面ESC返回
    if (gameState.isState(GAME_STATE.HELP)) {
        if (e.code === 'Escape') {
            game.returnFromHelp();
            e.preventDefault();
        }
        return;
    }

    // 处理路线选择界面的键盘输入
    if (gameState.isState(GAME_STATE.ROUTE_SELECT)) {
        if (e.code === 'Digit1') {
            game.confirmRoute(ROOM_TYPES.ELITE);
        } else if (e.code === 'Digit2') {
            game.confirmRoute(ROOM_TYPES.SHOP);
        } else if (e.code === 'Digit3') {
            game.confirmRoute(ROOM_TYPES.REST);
        } else if (e.code === 'Escape') {
            game.cancelRouteSelect();
        }
        e.preventDefault();
        return;
    }

    // 处理难度选择界面的键盘输入
    if (gameState.isState(GAME_STATE.DIFFICULTY_SELECT)) {
        if (e.code === 'ArrowUp' || e.code === 'KeyW') {
            uiManager.selectedDifficultyIndex = Math.max(0, uiManager.selectedDifficultyIndex - 1);
            gameState.setSelectedDifficulty(uiManager.difficultyOptions[uiManager.selectedDifficultyIndex].id);
        } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
            uiManager.selectedDifficultyIndex = Math.min(uiManager.difficultyOptions.length - 1, uiManager.selectedDifficultyIndex + 1);
            gameState.setSelectedDifficulty(uiManager.difficultyOptions[uiManager.selectedDifficultyIndex].id);
        } else if (e.code === 'Enter' || e.code === 'Space') {
            game.startGameWithDifficulty();
        } else if (e.code === 'Escape') {
            game.returnToCharacterSelectFromDifficulty();
        }
        
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Enter', 'Space', 'Escape'].includes(e.code)) {
            e.preventDefault();
        }
        return;
    }
    
    // 某些情况下阻止默认行为
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        // 防止页面滚动
        if (gameState.isPlaying()) {
            e.preventDefault();
        }
    }
});

// ==================== 全局错误捕获 ====================
window.onerror = function(msg, url, line, col, error) {
    console.error('[WINDOW ONERROR]', { msg, url, line, col, error });
    if (game) {
        game.handleError(error || new Error(msg));
    }
    return true;
};

window.addEventListener('unhandledrejection', (e) => {
    console.error('[UNHANDLED REJECTION]', e.reason);
    if (game) {
        game.handleError(e.reason instanceof Error ? e.reason : new Error(String(e.reason)));
    }
    e.preventDefault();
});