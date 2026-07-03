/**
 * 新手引导系统
 * 负责游戏新手教程的管理和显示
 */

class TutorialManager {
    constructor() {
        // 是否启用引导
        this.enabled = true;

        // 当前步骤索引
        this.currentStepIndex = 0;

        // 是否正在显示引导
        this.active = false;

        // 是否已完成所有引导
        this.completed = false;

        // 引导步骤状态
        this.stepStates = {};

        // 游戏逻辑引用
        this.gameLogic = null;

        // 动画相关
        this.arrowBounce = 0;
        this.highlightPulse = 0;
    }

    /**
     * 初始化引导系统
     */
    init() {
        // 检查是否已完成引导
        this.checkTutorialComplete();

        // 根据设置决定是否启用
        if (typeof settingsManager !== 'undefined') {
            this.enabled = settingsManager.isTutorialEnabled();
        }
    }

    /**
     * 检查引导是否已完成
     */
    checkTutorialComplete() {
        try {
            const completed = localStorage.getItem(TUTORIAL.STORAGE_KEY);
            this.completed = completed === 'true';
        } catch (e) {
            console.warn('读取引导状态失败:', e);
            this.completed = false;
        }
    }

    /**
     * 标记引导为已完成
     */
    markTutorialComplete() {
        this.completed = true;
        this.active = false;

        try {
            localStorage.setItem(TUTORIAL.STORAGE_KEY, 'true');
        } catch (e) {
            console.warn('保存引导状态失败:', e);
        }
    }

    /**
     * 开始引导
     * @param {Object} gameLogic - 游戏逻辑引用
     */
    startTutorial(gameLogic) {
        if (this.completed || !this.enabled) {
            return false;
        }

        this.gameLogic = gameLogic;
        this.currentStepIndex = 0;
        this.active = true;
        this.stepStates = {};

        console.log('新手引导开始');
        return true;
    }

    /**
     * 结束引导
     */
    endTutorial() {
        this.active = false;
        this.markTutorialComplete();
        console.log('新手引导完成');
    }

    /**
     * 跳过引导
     */
    skipTutorial() {
        this.active = false;
        this.markTutorialComplete();
        console.log('新手引导已跳过');
    }

    /**
     * 重置引导（可以重新开始）
     */
    resetTutorial() {
        this.completed = false;
        this.currentStepIndex = 0;
        this.active = false;
        this.stepStates = {};

        try {
            localStorage.removeItem(TUTORIAL.STORAGE_KEY);
        } catch (e) {}
    }

    /**
     * 获取当前步骤
     * @returns {Object|null}
     */
    getCurrentStep() {
        if (!this.active) {
            return null;
        }
        return TUTORIAL.STEPS[this.currentStepIndex] || null;
    }

    /**
     * 进入下一步
     */
    nextStep() {
        if (this.currentStepIndex < TUTORIAL.STEPS.length - 1) {
            this.currentStepIndex++;
            this.playStepSound();
            return true;
        } else {
            // 所有步骤完成
            this.endTutorial();
            return false;
        }
    }

    /**
     * 播放步骤切换音效
     */
    playStepSound() {
        if (typeof soundManager !== 'undefined') {
            soundManager.play(SOUND_EFFECTS.SWITCH);
        }
    }

    /**
     * 更新引导系统（每帧调用）
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        if (!this.active) {
            return;
        }

        // 更新动画
        this.arrowBounce += deltaTime * 0.005;
        this.highlightPulse += deltaTime * 0.003;

        // 检查当前步骤是否完成
        this.checkStepCompletion();
    }

    /**
     * 检查步骤完成条件
     */
    checkStepCompletion() {
        const step = this.getCurrentStep();
        if (!step) {
            return;
        }

        let completed = false;

        switch (step.completeCondition) {
            case 'moved':
                completed = this.checkMoved();
                break;
            case 'killedEnemy':
                completed = this.checkKilledEnemy();
                break;
            case 'usedSkill':
                completed = this.checkUsedSkill();
                break;
            case 'pickedUp':
                completed = this.checkPickedUp();
                break;
            case 'enteredPortal':
                completed = this.checkEnteredPortal();
                break;
        }

        if (completed) {
            this.nextStep();
        }
    }

    /**
     * 检查是否移动了
     * @returns {boolean}
     */
    checkMoved() {
        if (!this.gameLogic || !this.gameLogic.player) {
            return false;
        }

        const player = this.gameLogic.player;

        // 检查玩家是否有速度
        if (Math.abs(player.vx) > 0.1 || Math.abs(player.vy) > 0.1) {
            return true;
        }

        return false;
    }

    /**
     * 检查是否击杀了敌人
     * @returns {boolean}
     */
    checkKilledEnemy() {
        if (!this.gameLogic) {
            return false;
        }

        const data = gameState.getData();
        return data.killCount > 0;
    }

    /**
     * 检查是否使用了技能
     * @returns {boolean}
     */
    checkUsedSkill() {
        if (!this.stepStates.skillUsed) {
            // 这里需要通过事件监听，简化处理
            return false;
        }
        return this.stepStates.skillUsed;
    }

    /**
     * 检查是否拾取了道具
     * @returns {boolean}
     */
    checkPickedUp() {
        if (!this.gameLogic) {
            return false;
        }

        const data = gameState.getData();
        return data.weaponsCollected > 0;
    }

    /**
     * 检查是否进入了传送门
     * @returns {boolean}
     */
    checkEnteredPortal() {
        if (!this.gameLogic) {
            return false;
        }

        const data = gameState.getData();
        return data.currentLevel > 1;
    }

    /**
     * 记录技能使用
     */
    onSkillUsed() {
        this.stepStates.skillUsed = true;
    }

    /**
     * 记录拾取
     */
    onItemPickedUp() {
        this.stepStates.itemPickedUp = true;
    }

    /**
     * 渲染引导界面
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    render(ctx) {
        if (!this.active) {
            return;
        }

        const step = this.getCurrentStep();
        if (!step) {
            return;
        }

        // 绘制半透明遮罩
        this.drawOverlay(ctx);

        // 绘制高亮区域
        this.drawHighlight(ctx, step);

        // 绘制提示框
        this.drawTooltip(ctx, step);

        // 绘制箭头
        this.drawArrow(ctx, step);

        // 绘制跳过按钮
        this.drawSkipButton(ctx);

        // 绘制进度指示
        this.drawProgress(ctx);
    }

    /**
     * 绘制半透明遮罩
     */
    drawOverlay(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    /**
     * 绘制高亮区域
     */
    drawHighlight(ctx, step) {
        ctx.save();

        const pulse = Math.sin(this.highlightPulse) * 0.2 + 0.8;

        // 先清除高亮区域的遮罩（通过剪切实现）
        ctx.globalCompositeOperation = 'destination-out';

        let highlightArea = this.getHighlightArea(step);
        if (highlightArea) {
            ctx.fillStyle = `rgba(0, 0, 0, ${pulse})`;
            ctx.fillRect(highlightArea.x, highlightArea.y, highlightArea.width, highlightArea.height);
        }

        ctx.restore();

        // 绘制高亮边框
        if (highlightArea) {
            ctx.strokeStyle = `rgba(255, 255, 0, ${pulse})`;
            ctx.lineWidth = 3;
            ctx.strokeRect(highlightArea.x, highlightArea.y, highlightArea.width, highlightArea.height);
        }
    }

    /**
     * 获取高亮区域
     */
    getHighlightArea(step) {
        switch (step.highlight) {
            case 'keys':
                return { x: 50, y: GAME_HEIGHT - 150, width: 200, height: 100 };
            case 'mouse':
                return { x: GAME_WIDTH / 2 - 50, y: GAME_HEIGHT / 2 - 50, width: 100, height: 100 };
            case 'skill':
                return { x: GAME_WIDTH / 2 - 40, y: GAME_HEIGHT - 90, width: 80, height: 80 };
            case 'item':
                // 找一个掉落物的位置
                if (this.gameLogic && this.gameLogic.currentRoom) {
                    const drops = this.gameLogic.currentRoom.drops || [];
                    if (drops.length > 0) {
                        const drop = drops[0];
                        return { x: drop.x - 20, y: drop.y - 20, width: 40, height: 40 };
                    }
                }
                return { x: GAME_WIDTH / 2 - 20, y: GAME_HEIGHT / 2 - 20, width: 40, height: 40 };
            case 'portal':
                if (this.gameLogic && this.gameLogic.currentRoom && this.gameLogic.currentRoom.portal) {
                    const portal = this.gameLogic.currentRoom.portal;
                    return { x: portal.x - 25, y: portal.y - 25, width: 50, height: 50 };
                }
                return { x: GAME_WIDTH / 2 - 25, y: 50, width: 50, height: 50 };
            default:
                return null;
        }
    }

    /**
     * 绘制提示框
     */
    drawTooltip(ctx, step) {
        const boxWidth = 300;
        const boxHeight = 100;
        const boxX = GAME_WIDTH / 2 - boxWidth / 2;
        const boxY = 80;

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // 边框
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // 标题
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 20px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.currentStepIndex + 1}. ${step.title}`, GAME_WIDTH / 2, boxY + 30);

        // 描述
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Courier New", monospace';
        ctx.fillText(step.description, GAME_WIDTH / 2, boxY + 65);
    }

    /**
     * 绘制箭头
     */
    drawArrow(ctx, step) {
        const bounceOffset = Math.sin(this.arrowBounce) * 10;

        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';

        let arrowX = GAME_WIDTH / 2;
        let arrowY = 200 + bounceOffset;
        let arrow = '⬇️';

        const highlightArea = this.getHighlightArea(step);
        if (highlightArea) {
            // 箭头指向高亮区域
            if (highlightArea.y > GAME_HEIGHT / 2) {
                arrowY = highlightArea.y - 40 + bounceOffset;
                arrowX = highlightArea.x + highlightArea.width / 2;
                arrow = '⬇️';
            } else {
                arrowY = highlightArea.y + highlightArea.height + 40 - bounceOffset;
                arrowX = highlightArea.x + highlightArea.width / 2;
                arrow = '⬆️';
            }
        }

        ctx.fillText(arrow, arrowX, arrowY);
    }

    /**
     * 绘制跳过按钮
     */
    drawSkipButton(ctx) {
        const btnWidth = 80;
        const btnHeight = 30;
        const btnX = GAME_WIDTH - btnWidth - 20;
        const btnY = 20;

        // 背景
        ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
        ctx.fillRect(btnX, btnY, btnWidth, btnHeight);

        // 边框
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);

        // 文字
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('跳过', btnX + btnWidth / 2, btnY + btnHeight / 2);

        // 保存按钮位置供点击检测
        this.skipButton = { x: btnX, y: btnY, width: btnWidth, height: btnHeight };
    }

    /**
     * 绘制进度指示
     */
    drawProgress(ctx) {
        const totalSteps = TUTORIAL.STEPS.length;
        const dotRadius = 5;
        const spacing = 15;
        const totalWidth = (totalSteps - 1) * spacing;
        const startX = GAME_WIDTH / 2 - totalWidth / 2;
        const y = 50;

        for (let i = 0; i < totalSteps; i++) {
            const x = startX + i * spacing;

            if (i < this.currentStepIndex) {
                // 已完成
                ctx.fillStyle = '#4caf50';
            } else if (i === this.currentStepIndex) {
                // 当前
                ctx.fillStyle = '#ffcc00';
            } else {
                // 未完成
                ctx.fillStyle = '#666666';
            }

            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * 处理点击
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {boolean} 是否处理了点击
     */
    handleClick(x, y) {
        if (!this.active) {
            return false;
        }

        // 检查跳过按钮
        if (this.skipButton) {
            if (
                x >= this.skipButton.x &&
                x <= this.skipButton.x + this.skipButton.width &&
                y >= this.skipButton.y &&
                y <= this.skipButton.y + this.skipButton.height
            ) {
                this.skipTutorial();
                return true;
            }
        }

        return false;
    }

    /**
     * 检查是否应该显示引导
     * @returns {boolean}
     */
    shouldShowTutorial() {
        return this.enabled && !this.completed;
    }

    /**
     * 设置引导启用状态
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

// 创建全局新手引导管理器实例
const tutorialManager = new TutorialManager();
