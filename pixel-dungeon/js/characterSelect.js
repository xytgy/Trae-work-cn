/**
 * 角色选择界面管理
 * 负责角色选择界面的渲染、动画和交互
 */

class CharacterSelectManager {
    constructor() {
        // 角色列表
        this.characters = [];

        // 当前选中的角色索引
        this.selectedIndex = 0;

        // 角色分类
        this.categories = ['战士', '刺客', '法师', '辅助', '猎人', '机械', '召唤', '特殊'];

        // 当前显示的分类
        this.currentCategory = 0;

        // 角色卡片布局
        this.cardWidth = 120;
        this.cardHeight = 160;
        this.cardSpacing = 15;

        // 面板尺寸
        this.detailPanelWidth = 300;
        this.detailPanelHeight = 400;

        // 动画状态
        this.animationTime = 0;

        // 鼠标悬停状态
        this.hoveredIndex = -1;

        // 鼠标位置
        this.mouseX = 0;
        this.mouseY = 0;

        // 初始动画状态
        this.introAnimationProgress = 0;
        this.isIntroComplete = false;

        // 初始化角色
        this.initCharacters();
    }

    /**
     * 初始化角色数据
     */
    initCharacters() {
        this.characters = [
            // 战士系
            {
                id: 1,
                name: '勇者',
                category: '战士',
                icon: '⚔️',
                color: '#ff6666',
                description: '平衡型角色，适合新手',
                bodyShape: { build: 'muscular', head: 'helmet', weapon: 'sword', decor: 'none', pattern: 'solid' },
                stats: { survivability: 3, offensive: 3, skillPower: 3 },
                skills: [
                    { name: '冲刺', key: 'Shift', cooldown: 2000, description: '向移动方向快速冲刺' },
                    { name: '重击', key: 'Space', cooldown: 1000, description: '造成150%伤害' }
                ]
            },
            {
                id: 2,
                name: '圣骑士',
                category: '战士',
                icon: '🛡️',
                color: '#ff8844',
                description: '高生存能力，攻守兼备',
                bodyShape: { build: 'muscular', head: 'helmet', weapon: 'sword', decor: 'cape', pattern: 'solid' },
                stats: { survivability: 5, offensive: 2, skillPower: 3 },
                skills: [
                    { name: '护盾', key: 'Shift', cooldown: 5000, description: '生成护盾吸收伤害' },
                    { name: '盾击', key: 'Space', cooldown: 1500, description: '眩晕敌人' }
                ]
            },
            {
                id: 3,
                name: '狂战士',
                category: '战士',
                icon: '⚔️',
                color: '#ff4444',
                description: '高攻击低防御，风险与收益并存',
                bodyShape: { build: 'muscular', head: 'square', weapon: 'sword', decor: 'none', pattern: 'stripes' },
                stats: { survivability: 2, offensive: 5, skillPower: 2 },
                skills: [
                    { name: '狂暴', key: 'Shift', cooldown: 8000, description: '攻击力提升100%' },
                    { name: '旋风斩', key: 'Space', cooldown: 2000, description: '周围敌人受伤' }
                ]
            },

            // 刺客系
            {
                id: 4,
                name: '忍者',
                category: '刺客',
                icon: '🗡️',
                color: '#66ff66',
                description: '高机动性，擅长暗杀',
                bodyShape: { build: 'slim', head: 'mask', weapon: 'dagger', decor: 'bandana', pattern: 'solid' },
                stats: { survivability: 2, offensive: 4, skillPower: 3 },
                skills: [
                    { name: '影遁', key: 'Shift', cooldown: 3000, description: '短暂消失并移至敌人身后' },
                    { name: '毒刃', key: 'Space', cooldown: 1000, description: '造成持续伤害' }
                ]
            },
            {
                id: 5,
                name: '杀手',
                category: '刺客',
                icon: '💀',
                color: '#44ff44',
                description: '高爆发，一击必杀',
                bodyShape: { build: 'slim', head: 'mask', weapon: 'dagger', decor: 'bandana', pattern: 'solid' },
                stats: { survivability: 1, offensive: 5, skillPower: 3 },
                skills: [
                    { name: '背刺', key: 'Shift', cooldown: 2000, description: '背后攻击伤害翻倍' },
                    { name: '致命一击', key: 'Space', cooldown: 5000, description: '造成500%伤害' }
                ]
            },

            // 法师系
            {
                id: 6,
                name: '元素师',
                category: '法师',
                icon: '🔮',
                color: '#6666ff',
                description: '元素魔法，攻守自如',
                bodyShape: { build: 'normal', head: 'pointed', weapon: 'staff', decor: 'none', pattern: 'gradient' },
                stats: { survivability: 3, offensive: 4, skillPower: 4 },
                skills: [
                    { name: '火球', key: 'Shift', cooldown: 1500, description: '发射火球攻击' },
                    { name: '冰霜', key: 'Space', cooldown: 3000, description: '减速并伤害敌人' }
                ]
            },
            {
                id: 7,
                name: '死灵法师',
                category: '法师',
                icon: '💀',
                color: '#9966ff',
                description: '召唤亡灵，群体作战',
                bodyShape: { build: 'slim', head: 'pointed', weapon: 'staff', decor: 'none', pattern: 'solid' },
                stats: { survivability: 2, offensive: 3, skillPower: 5 },
                skills: [
                    { name: '召唤骷髅', key: 'Shift', cooldown: 8000, description: '召唤骷髅战士' },
                    { name: '暗影箭', key: 'Space', cooldown: 1000, description: '发射暗影箭' }
                ]
            },

            // 辅助系
            {
                id: 8,
                name: '圣职者',
                category: '辅助',
                icon: '✨',
                color: '#ffff66',
                description: '治疗与辅助，团队核心',
                bodyShape: { build: 'normal', head: 'oval', weapon: 'staff', decor: 'cape', pattern: 'solid' },
                stats: { survivability: 3, offensive: 2, skillPower: 4 },
                skills: [
                    { name: '治疗', key: 'Shift', cooldown: 5000, description: '恢复生命值' },
                    { name: '祝福', key: 'Space', cooldown: 3000, description: '提升队友属性' }
                ]
            },
            {
                id: 9,
                name: '诗人',
                category: '辅助',
                icon: '🎵',
                color: '#ffcc00',
                description: '增益与控制，战场指挥官',
                bodyShape: { build: 'normal', head: 'round', weapon: 'staff', decor: 'none', pattern: 'stripes' },
                stats: { survivability: 2, offensive: 3, skillPower: 4 },
                skills: [
                    { name: '战斗乐章', key: 'Shift', cooldown: 6000, description: '提升全队攻击力' },
                    { name: '混乱之歌', key: 'Space', cooldown: 4000, description: '使敌人混乱' }
                ]
            },

            // 猎人系
            {
                id: 10,
                name: '弓箭手',
                category: '猎人',
                icon: '🏹',
                color: '#66ffff',
                description: '远程攻击，精准打击',
                bodyShape: { build: 'normal', head: 'pointed', weapon: 'bow', decor: 'none', pattern: 'solid' },
                stats: { survivability: 2, offensive: 4, skillPower: 3 },
                skills: [
                    { name: '多重射击', key: 'Shift', cooldown: 3000, description: '同时发射三支箭' },
                    { name: '瞄准', key: 'Space', cooldown: 2000, description: '下两次攻击必定暴击' }
                ]
            },
            {
                id: 11,
                name: '狙击手',
                category: '猎人',
                icon: '🎯',
                color: '#00ffff',
                description: '超远距离，一击必中',
                bodyShape: { build: 'slim', head: 'helmet', weapon: 'bow', decor: 'none', pattern: 'solid' },
                stats: { survivability: 1, offensive: 5, skillPower: 3 },
                skills: [
                    { name: '狙击', key: 'Shift', cooldown: 10000, description: '超远距离高伤害' },
                    { name: '穿甲弹', key: 'Space', cooldown: 3000, description: '无视护甲' }
                ]
            },

            // 机械系
            {
                id: 12,
                name: '工程师',
                category: '机械',
                icon: '🔧',
                color: '#ff66ff',
                description: '放置系单位，布局策略',
                bodyShape: { build: 'normal', head: 'helmet', weapon: 'gun', decor: 'none', pattern: 'solid' },
                stats: { survivability: 3, offensive: 3, skillPower: 4 },
                skills: [
                    { name: '放置炮台', key: 'Shift', cooldown: 8000, description: '放置自动炮台' },
                    { name: '地雷', key: 'Space', cooldown: 4000, description: '布置可爆炸地雷' }
                ]
            },
            {
                id: 13,
                name: '机械师',
                category: '机械',
                icon: '🤖',
                color: '#ff44ff',
                description: '召唤机械单位作战',
                bodyShape: { build: 'bulky', head: 'helmet', weapon: 'gun', decor: 'none', pattern: 'stripes' },
                stats: { survivability: 2, offensive: 4, skillPower: 4 },
                skills: [
                    { name: '召唤机器人', key: 'Shift', cooldown: 10000, description: '召唤机器人助战' },
                    { name: 'EMP', key: 'Space', cooldown: 6000, description: '瘫痪敌人电子设备' }
                ]
            },

            // 召唤系
            {
                id: 14,
                name: '召唤师',
                category: '召唤',
                icon: '🔮',
                color: '#ff9966',
                description: '召唤异界生物，协同作战',
                bodyShape: { build: 'normal', head: 'oval', weapon: 'staff', decor: 'wings', pattern: 'gradient' },
                stats: { survivability: 2, offensive: 3, skillPower: 5 },
                skills: [
                    { name: '召唤使魔', key: 'Shift', cooldown: 7000, description: '召唤强力使魔' },
                    { name: '灵魂链接', key: 'Space', cooldown: 5000, description: '与召唤物共享生命' }
                ]
            },
            {
                id: 15,
                name: '德鲁伊',
                category: '召唤',
                icon: '🌿',
                color: '#88ff44',
                description: '召唤自然生物，恢复能力强',
                bodyShape: { build: 'normal', head: 'round', weapon: 'staff', decor: 'horns', pattern: 'solid' },
                stats: { survivability: 4, offensive: 2, skillPower: 4 },
                skills: [
                    { name: '召唤狼', key: 'Shift', cooldown: 5000, description: '召唤狼协助战斗' },
                    { name: '荆棘', key: 'Space', cooldown: 3000, description: '反弹伤害' }
                ]
            },

            // 特殊系
            {
                id: 16,
                name: '赌博师',
                category: '特殊',
                icon: '🎰',
                color: '#ffffff',
                description: '高风险高回报，一切看脸',
                bodyShape: { build: 'normal', head: 'round', weapon: 'fist', decor: 'none', pattern: 'dots' },
                stats: { survivability: 2, offensive: 5, skillPower: 2 },
                skills: [
                    { name: '幸运翻转', key: 'Shift', cooldown: 8000, description: '50%伤害翻倍或减半' },
                    { name: '老虎机', key: 'Space', cooldown: 12000, description: '随机释放强力技能' }
                ]
            },
            {
                id: 17,
                name: '时空旅行者',
                category: '特殊',
                icon: '⏰',
                color: '#aaaaaa',
                description: '操控时间，扭曲现实',
                bodyShape: { build: 'slim', head: 'pointed', weapon: 'staff', decor: 'none', pattern: 'gradient' },
                stats: { survivability: 3, offensive: 3, skillPower: 5 },
                skills: [
                    { name: '时间暂停', key: 'Shift', cooldown: 15000, description: '暂停时间3秒' },
                    { name: '闪烁', key: 'Space', cooldown: 2000, description: '瞬间移动' }
                ]
            },
            {
                id: 18,
                name: '梦魇',
                category: '特殊',
                icon: '🌙',
                color: '#9966cc',
                description: '操控梦境，现实与虚幻交织',
                bodyShape: { build: 'slim', head: 'mask', weapon: 'dagger', decor: 'wings', pattern: 'zigzag' },
                stats: { survivability: 3, offensive: 4, skillPower: 4 },
                skills: [
                    { name: '梦魇入侵', key: 'Shift', cooldown: 6000, description: '使敌人沉睡' },
                    { name: '幻影', key: 'Space', cooldown: 3000, description: '制造分身' }
                ]
            },

            // 更多角色
            {
                id: 19,
                name: '龙裔',
                category: '战士',
                icon: '🐉',
                color: '#ff0000',
                description: '龙族血脉，火焰之力',
                bodyShape: { build: 'muscular', head: 'helmet', weapon: 'sword', decor: 'horns', pattern: 'gradient' },
                stats: { survivability: 4, offensive: 5, skillPower: 3 },
                skills: [
                    { name: '龙息', key: 'Shift', cooldown: 5000, description: '喷吐火焰' },
                    { name: '龙鳞', key: 'Space', cooldown: 8000, description: '获得减伤' }
                ]
            },
            {
                id: 20,
                name: '精灵弓手',
                category: '猎人',
                icon: '🏹',
                color: '#00ff88',
                description: '精准射击，自然之力',
                bodyShape: { build: 'slim', head: 'pointed', weapon: 'bow', decor: 'none', pattern: 'solid' },
                stats: { survivability: 3, offensive: 4, skillPower: 3 },
                skills: [
                    { name: '穿云箭', key: 'Shift', cooldown: 4000, description: '穿透性射击' },
                    { name: '自然之愈', key: 'Space', cooldown: 6000, description: '缓慢恢复生命' }
                ]
            },
            {
                id: 21,
                name: '暗影刺客',
                category: '刺客',
                icon: '🌑',
                color: '#220033',
                description: '暗影中潜行，一击脱离',
                bodyShape: { build: 'slim', head: 'mask', weapon: 'dagger', decor: 'bandana', pattern: 'solid' },
                stats: { survivability: 2, offensive: 5, skillPower: 3 },
                skills: [
                    { name: '暗影步', key: 'Shift', cooldown: 4000, description: '融入暗影快速移动' },
                    { name: '暗影之刃', key: 'Space', cooldown: 2000, description: '造成大量伤害' }
                ]
            },
            {
                id: 22,
                name: '冰霜法师',
                category: '法师',
                icon: '❄️',
                color: '#00ccff',
                description: '冰系魔法，控制战场',
                bodyShape: { build: 'slim', head: 'pointed', weapon: 'staff', decor: 'none', pattern: 'gradient' },
                stats: { survivability: 3, offensive: 4, skillPower: 4 },
                skills: [
                    { name: '冰封', key: 'Shift', cooldown: 7000, description: '冻结敌人' },
                    { name: '暴风雪', key: 'Space', cooldown: 8000, description: '大范围冰系伤害' }
                ]
            },
            {
                id: 23,
                name: '炼金师',
                category: '辅助',
                icon: '⚗️',
                color: '#88ff00',
                description: '药水与爆炸，科学的力量',
                bodyShape: { build: 'normal', head: 'round', weapon: 'gun', decor: 'none', pattern: 'dots' },
                stats: { survivability: 3, offensive: 4, skillPower: 3 },
                skills: [
                    { name: '投掷药水', key: 'Shift', cooldown: 3000, description: '投掷各种药水' },
                    { name: '化学风暴', key: 'Space', cooldown: 10000, description: '制造毒雾' }
                ]
            },
            {
                id: 24,
                name: '武僧',
                category: '战士',
                icon: '🥋',
                color: '#ffcc66',
                description: '拳脚功夫，气功大师',
                bodyShape: { build: 'muscular', head: 'oval', weapon: 'fist', decor: 'none', pattern: 'solid' },
                stats: { survivability: 4, offensive: 4, skillPower: 3 },
                skills: [
                    { name: '气功波', key: 'Shift', cooldown: 3000, description: '发射气功远程攻击' },
                    { name: '铁布衫', key: 'Space', cooldown: 6000, description: '短时间内减伤' }
                ]
            }
        ];
    }

    /**
     * 更新动画状态
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        this.animationTime += deltaTime;

        // 初始动画
        if (!this.isIntroComplete) {
            this.introAnimationProgress += deltaTime / 1500; // 1.5秒完成
            if (this.introAnimationProgress >= 1) {
                this.introAnimationProgress = 1;
                this.isIntroComplete = true;
            }
        }

        // 处理鼠标悬停检测
        this.updateHoverState();
    }

    /**
     * 更新鼠标悬停状态
     */
    updateHoverState() {
        // 直接从 inputManager 获取鼠标位置
        this.mouseX = inputManager.mouse.worldX || 0;
        this.mouseY = inputManager.mouse.worldY || 0;

        const startX = (GAME_WIDTH - this.getTotalWidth()) / 2;
        const startY = 120;

        this.hoveredIndex = -1;

        for (let i = 0; i < this.characters.length; i++) {
            const col = i % this.getColumnCount();
            const row = Math.floor(i / this.getColumnCount());

            const cardX = startX + col * (this.cardWidth + this.cardSpacing);
            const cardY = startY + row * (this.cardHeight + this.cardSpacing);

            if (this.mouseX >= cardX &&
                this.mouseX <= cardX + this.cardWidth &&
                this.mouseY >= cardY &&
                this.mouseY <= cardY + this.cardHeight
            ) {
                this.hoveredIndex = i;
                break;
            }
        }
    }

    /**
     * 获取列数
     */
    getColumnCount() {
        const availableWidth = GAME_WIDTH - 100;
        return Math.floor(availableWidth / (this.cardWidth + this.cardSpacing));
    }

    /**
     * 获取总宽度
     */
    getTotalWidth() {
        return this.getColumnCount() * (this.cardWidth + this.cardSpacing) - this.cardSpacing;
    }

    /**
     * 渲染角色选择界面
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     */
    render(ctx) {
        const time = this.animationTime;

        // 绘制背景
        this.renderBackground(ctx, time);

        // 绘制标题
        this.renderTitle(ctx, time);

        // 绘制角色卡片
        this.renderCharacterCards(ctx, time);

        // 绘制详情面板
        this.renderDetailPanel(ctx, time);

        // 绘制操作提示
        this.renderControlsHint(ctx);

        // 绘制分类标题
        this.renderCategoryTitle(ctx);
    }

    /**
     * 渲染背景
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {number} time - 当前时间
     */
    renderBackground(ctx, time) {
        // 背景渐变
        const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(1, '#1a1a3a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // 背景粒子效果
        for (let i = 0; i < 30; i++) {
            const x = (i * 137 + time * 0.01) % GAME_WIDTH;
            const y = (i * 89 + time * 0.02) % GAME_HEIGHT;
            const alpha = Math.sin(time / 1000 + i) * 0.3 + 0.4;
            const size = 2 + Math.sin(i) * 1;

            ctx.fillStyle = `rgba(100, 100, 200, ${alpha})`;
            ctx.fillRect(x, y, size, size);
        }
    }

    /**
     * 渲染标题
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {number} time - 当前时间
     */
    renderTitle(ctx, time) {
        const pulse = Math.sin(time / 300) * 0.1 + 0.9;
        const titleY = 50;

        ctx.save();
        ctx.shadowColor = '#6666ff';
        ctx.shadowBlur = 20 * pulse;

        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('选择你的角色', GAME_WIDTH / 2, titleY);

        ctx.restore();
    }

    /**
     * 渲染角色卡片
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {number} time - 当前时间
     */
    renderCharacterCards(ctx, time) {
        const startX = (GAME_WIDTH - this.getTotalWidth()) / 2;
        const startY = 120;

        for (let i = 0; i < this.characters.length; i++) {
            const character = this.characters[i];
            const col = i % this.getColumnCount();
            const row = Math.floor(i / this.getColumnCount());

            const cardX = startX + col * (this.cardWidth + this.cardSpacing);
            const cardY = startY + row * (this.cardHeight + this.cardSpacing);

            // 初始动画偏移
            let offsetY = 0;
            if (!this.isIntroComplete) {
                offsetY = (1 - this.introAnimationProgress) * 50;
            }

            // 选中动画
            if (i === this.selectedIndex) {
                this.renderSelectionAnimation(
                    ctx,
                    cardX - 3,
                    cardY - 3 + offsetY,
                    this.cardWidth + 6,
                    this.cardHeight + 6,
                    time
                );
            }

            // 悬停动画
            if (i === this.hoveredIndex && i !== this.selectedIndex) {
                this.renderHoverEffect(ctx, cardX, cardY + offsetY, this.cardWidth, this.cardHeight, time);
            }

            // 检查角色是否解锁
            if (!this.isCharacterUnlocked(character.id)) {
                this.renderLockedCharacter(
                    ctx,
                    character,
                    cardX,
                    cardY + offsetY,
                    this.cardWidth,
                    this.cardHeight,
                    time
                );
                continue;
            }

            // 绘制卡片背景
            ctx.fillStyle = 'rgba(30, 30, 60, 0.9)';
            ctx.fillRect(cardX, cardY + offsetY, this.cardWidth, this.cardHeight);

            // 卡片边框
            const borderColor = i === this.selectedIndex ? '#6666ff' : '#444466';
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = i === this.selectedIndex ? 3 : 1;
            ctx.strokeRect(cardX, cardY + offsetY, this.cardWidth, this.cardHeight);

            // 角色图标
            const iconSize = 40;
            this.renderCharacterIcon(
                ctx,
                character,
                cardX + this.cardWidth / 2,
                cardY + 35 + offsetY,
                iconSize,
                i === this.selectedIndex,
                time
            );

            // 角色名称
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(character.name, cardX + this.cardWidth / 2, cardY + 85 + offsetY);

            // 角色分类
            ctx.font = '11px Arial';
            ctx.fillStyle = character.color;
            ctx.fillText(character.category, cardX + this.cardWidth / 2, cardY + 102 + offsetY);

            // 绘制角色统计
            this.renderMiniStats(ctx, character, cardX + 10, cardY + 120 + offsetY);
        }
    }

    /**
     * 渲染角色图标动画
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Object} character - 角色数据
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} size - 尺寸
     * @param {boolean} isSelected - 是否选中
     * @param {number} time - 当前时间
     */
    renderCharacterIcon(ctx, character, x, y, size, isSelected, time) {
        let offsetY = 0;
        if (isSelected) {
            offsetY = Math.sin(time / 300) * 3;
        }

        if (isSelected) {
            ctx.save();
            ctx.shadowColor = character.color;
            ctx.shadowBlur = 15;
        }

        if (isSelected) {
            const gradient = ctx.createRadialGradient(x, y + offsetY, 0, x, y + offsetY, size);
            gradient.addColorStop(0, character.color + '60');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y + offsetY, size, 0, Math.PI * 2);
            ctx.fill();
        }

        if (character.bodyShape) {
            ctx.save();
            ctx.translate(x, y + offsetY);

            const breathScale = 1 + Math.sin(time / 500) * 0.05;
            ctx.scale(1, breathScale);

            const drawSize = size * 1.5;
            const bodyColor = character.color;
            const accentColor = character.color;

            drawCharacterDecor(ctx, character.bodyShape.decor, accentColor, 0, -drawSize * 0.3, drawSize);
            drawCharacterBody(ctx, character.bodyShape.build, bodyColor, 0, 0, drawSize);
            drawCharacterPattern(ctx, character.bodyShape.pattern, accentColor, 0, 0, drawSize);
            drawCharacterHead(ctx, character.bodyShape.head, bodyColor, 0, -drawSize * 0.7, drawSize);
            drawCharacterWeapon(ctx, character.bodyShape.weapon, accentColor, drawSize * 0.4, 0, drawSize, Math.PI / 4);

            ctx.restore();
        } else {
            ctx.font = `${size}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(character.icon, x, y + offsetY);
        }

        if (isSelected) {
            ctx.restore();
        }

        if (character.category === '法师' && isSelected) {
            this.renderMagicParticles(ctx, x, y + offsetY, time);
        } else if (character.category === '战士' && isSelected) {
            this.renderWarriorParticles(ctx, x, y + offsetY, time);
        }
    }

    /**
     * 法师粒子效果
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} time - 当前时间
     */
    renderMagicParticles(ctx, x, y, time) {
        for (let i = 0; i < 5; i++) {
            const angle = (time / 1000 + i * 1.2) % (Math.PI * 2);
            const radius = 40 + Math.sin(time / 500 + i) * 10;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;

            ctx.fillStyle = `rgba(100, 100, 255, ${0.5 + Math.sin(time / 200 + i) * 0.3})`;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * 战士粒子效果
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} time - 当前时间
     */
    renderWarriorParticles(ctx, x, y, time) {
        for (let i = 0; i < 3; i++) {
            const offsetX = Math.sin(time / 300 + i) * 20;
            const offsetY = -20 + Math.cos(time / 400 + i) * 5;

            ctx.fillStyle = `rgba(255, 100, 100, ${0.5 + Math.sin(time / 200 + i) * 0.3})`;
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * 渲染迷你统计
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Object} character - 角色数据
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    renderMiniStats(ctx, character, x, y) {
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#aaaaaa';

        const stats = [
            { label: '生存', value: character.stats.survivability },
            { label: '攻击', value: character.stats.offensive },
            { label: '技能', value: character.stats.skillPower }
        ];

        stats.forEach((stat, index) => {
            const statY = y + index * 12;
            ctx.fillText(`${stat.label}: ${'★'.repeat(stat.value)}${'☆'.repeat(5 - stat.value)}`, x, statY);
        });
    }

    /**
     * 渲染选择动画
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} time - 当前时间
     */
    renderSelectionAnimation(ctx, x, y, width, height, time) {
        const pulse = Math.sin(time / 200) * 0.2 + 0.8;

        // 脉冲光晕
        ctx.strokeStyle = `rgba(102, 102, 255, ${pulse * 0.5})`;
        ctx.lineWidth = 6;
        ctx.strokeRect(x - 3, y - 3, width + 6, height + 6);
    }

    /**
     * 渲染悬停效果
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} time - 当前时间
     */
    renderHoverEffect(ctx, x, y, width, height, time) {
        const glow = Math.sin(time / 150) * 0.3 + 0.7;

        ctx.save();
        ctx.shadowColor = '#8888ff';
        ctx.shadowBlur = 10 * glow;
        ctx.fillStyle = 'rgba(136, 136, 255, 0.1)';
        ctx.fillRect(x, y, width, height);
        ctx.restore();
    }

    /**
     * 检查角色是否解锁
     * @param {number} characterId - 角色ID
     * @returns {boolean} 是否解锁
     */
    isCharacterUnlocked(characterId) {
        // 默认全部解锁
        // 后续可以实现解锁系统
        return true;
    }

    /**
     * 渲染锁定角色
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Object} character - 角色数据
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} time - 当前时间
     */
    renderLockedCharacter(ctx, character, x, y, width, height, time) {
        // 灰色遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x, y, width, height);

        // 锁定图标
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', x + width / 2, y + height / 2);

        // 解锁条件
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '10px Arial';
        ctx.fillText('完成成就解锁', x + width / 2, y + height - 15);
    }

    /**
     * 渲染详情面板
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {number} time - 当前时间
     */
    renderDetailPanel(ctx, time) {
        const panelX = GAME_WIDTH - this.detailPanelWidth - 20;
        const panelY = (GAME_HEIGHT - this.detailPanelHeight) / 2;

        const character = this.characters[this.selectedIndex];

        // 面板背景
        ctx.fillStyle = 'rgba(20, 20, 50, 0.95)';
        ctx.fillRect(panelX, panelY, this.detailPanelWidth, this.detailPanelHeight);

        // 面板边框
        ctx.strokeStyle = '#6666ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, this.detailPanelWidth, this.detailPanelHeight);

        // 角色图标（带动画）
        const iconX = panelX + this.detailPanelWidth / 2;
        const iconY = panelY + 50;
        this.renderCharacterPreview(ctx, character, iconX, iconY, 50, time);

        // 角色名称
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(character.name, iconX, panelY + 110);

        // 角色分类
        ctx.font = '14px Arial';
        ctx.fillStyle = character.color;
        ctx.fillText(character.category + '系', iconX, panelY + 130);

        // 描述
        ctx.font = '13px Arial';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(character.description, iconX, panelY + 155);

        // 分隔线
        ctx.strokeStyle = '#444466';
        ctx.beginPath();
        ctx.moveTo(panelX + 20, panelY + 175);
        ctx.lineTo(panelX + this.detailPanelWidth - 20, panelY + 175);
        ctx.stroke();

        // 详细统计
        this.renderCharacterStats(ctx, character, panelX + 20, panelY + 195);

        // 分隔线
        ctx.beginPath();
        ctx.moveTo(panelX + 20, panelY + 240);
        ctx.lineTo(panelX + this.detailPanelWidth - 20, panelY + 240);
        ctx.stroke();

        // 技能列表
        this.renderSkills(ctx, character, panelX + 20, panelY + 255, time);
    }

    /**
     * 渲染角色3D预览效果（简化版）
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Object} character - 角色数据
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} size - 尺寸
     * @param {number} time - 当前时间
     */
    renderCharacterPreview(ctx, character, x, y, size, time) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, character.color + '40');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        if (character.bodyShape) {
            ctx.save();
            ctx.translate(x, y);

            const breathScale = 1 + Math.sin(time / 500) * 0.05;
            ctx.scale(1, breathScale);

            const floatOffset = Math.sin(time / 800) * 3;
            ctx.translate(0, floatOffset);

            const drawSize = size * 2;
            const bodyColor = character.color;
            const accentColor = character.color;

            drawCharacterDecor(ctx, character.bodyShape.decor, accentColor, 0, -drawSize * 0.3, drawSize);
            drawCharacterBody(ctx, character.bodyShape.build, bodyColor, 0, 0, drawSize);
            drawCharacterPattern(ctx, character.bodyShape.pattern, accentColor, 0, 0, drawSize);
            drawCharacterHead(ctx, character.bodyShape.head, bodyColor, 0, -drawSize * 0.7, drawSize);
            drawCharacterWeapon(ctx, character.bodyShape.weapon, accentColor, drawSize * 0.4, 0, drawSize, Math.PI / 4);

            ctx.restore();
        } else {
            ctx.font = `${size}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(character.icon, x, y);
        }

        if (character.category === '法师') {
            this.renderMagicParticles(ctx, x, y, time);
        } else if (character.category === '战士') {
            this.renderWarriorParticles(ctx, x, y, time);
        }
    }

    /**
     * 渲染角色统计
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Object} character - 角色数据
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    renderCharacterStats(ctx, character, x, y) {
        ctx.textAlign = 'left';

        const stats = [
            { label: '生存能力', value: character.stats.survivability, color: '#66ff66' },
            { label: '攻击能力', value: character.stats.offensive, color: '#ff6666' },
            { label: '技能强度', value: character.stats.skillPower, color: '#6666ff' }
        ];

        stats.forEach((stat, index) => {
            const statY = y + index * 18;

            ctx.fillStyle = '#888888';
            ctx.font = '12px Arial';
            ctx.fillText(stat.label + ':', x, statY);

            // 星级
            ctx.font = '12px Arial';
            ctx.fillStyle = stat.color;
            const stars = '★'.repeat(stat.value) + '☆'.repeat(5 - stat.value);
            ctx.fillText(stars, x + 80, statY);
        });
    }

    /**
     * 渲染技能详细说明
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Object} character - 角色数据
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} time - 当前时间
     */
    renderSkills(ctx, character, x, y, time) {
        character.skills.forEach((skill, index) => {
            const skillY = y + index * 70;

            // 技能图标
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.getSkillIcon(skill), x + 20, skillY + 25);

            // 技能名称
            ctx.fillStyle = '#66ccff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(skill.name, x + 45, skillY + 20);

            // 冷却时间
            ctx.fillStyle = '#ff6666';
            ctx.font = '11px Arial';
            ctx.fillText(`冷却: ${skill.cooldown / 1000}秒`, x + 45, skillY + 36);

            // 技能描述
            ctx.fillStyle = '#aaaaaa';
            ctx.font = '12px Arial';
            this.wrapText(ctx, skill.description, x + 45, skillY + 52, 230, 15);

            // 按键提示
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            const keyText = skill.key === ' ' ? '空格' : skill.key;
            ctx.fillText(`[${keyText}]`, x + 230, skillY + 20);
        });
    }

    /**
     * 获取技能图标
     * @param {Object} skill - 技能数据
     * @returns {string} 技能图标
     */
    getSkillIcon(skill) {
        const icons = {
            冲刺: '💨',
            闪电链: '⚡',
            地雷: '💣',
            护盾: '🛡️',
            治疗: '💚',
            炮台: '🔫',
            火球: '🔥',
            冰霜: '❄️',
            影遁: '🌑',
            龙息: '🔥',
            龙鳞: '🛡️'
        };
        return icons[skill.name] || '✨';
    }

    /**
     * 文字换行
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {string} text - 文字内容
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} maxWidth - 最大宽度
     * @param {number} lineHeight - 行高
     */
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split('');
        let line = '';
        let testLine = '';

        for (let i = 0; i < words.length; i++) {
            testLine += words[i];
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, x, y);
                line = words[i];
                testLine = words[i];
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    }

    /**
     * 渲染分类标题
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     */
    renderCategoryTitle(ctx) {
        const y = 80;

        const colors = {
            战士: '#ff6666',
            刺客: '#66ff66',
            法师: '#6666ff',
            辅助: '#ffff66',
            猎人: '#66ffff',
            机械: '#ff66ff',
            召唤: '#ff9966',
            特殊: '#ffffff'
        };

        // 分类导航
        const navX = 20;
        const navY = 30;

        ctx.font = '12px Arial';
        ctx.textAlign = 'left';

        this.categories.forEach((category, index) => {
            const catX = navX + index * 70;
            const isActive = index === this.currentCategory;

            ctx.fillStyle = isActive ? colors[category] || '#ffffff' : '#666666';
            ctx.fillText(category, catX, navY);

            if (isActive) {
                ctx.strokeStyle = colors[category] || '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(catX, navY + 3);
                ctx.lineTo(catX + 40, navY + 3);
                ctx.stroke();
            }
        });
    }

    /**
     * 渲染操作提示
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     */
    renderControlsHint(ctx) {
        const y = GAME_HEIGHT - 30;

        ctx.fillStyle = '#666666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        ctx.fillText('↑↓←→ / WASD: 选择角色    Enter / 空格: 开始游戏    ESC: 返回主菜单', GAME_WIDTH / 2, y);
    }

    /**
     * 处理键盘导航
     * @param {string} key - 按键
     */
    handleKeyNavigation(key) {
        const columnCount = this.getColumnCount();

        switch (key) {
            case 'ArrowUp':
            case 'KeyW':
                this.selectedIndex = Math.max(0, this.selectedIndex - columnCount);
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.selectedIndex = Math.min(this.characters.length - 1, this.selectedIndex + columnCount);
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.selectedIndex = Math.min(this.characters.length - 1, this.selectedIndex + 1);
                break;
            case 'Enter':
            case 'Space':
                this.confirmSelection();
                break;
        }
    }

    /**
     * 确认选择
     */
    confirmSelection() {
        const character = this.characters[this.selectedIndex];
        if (this.isCharacterUnlocked(character.id)) {
            console.log(`选择了角色: ${character.name}`);
            // 触发角色选择完成事件
            if (this.onCharacterSelected) {
                this.onCharacterSelected(character);
            }
        }
    }

    /**
     * 获取当前选中的角色
     * @returns {Object} 当前角色
     */
    getSelectedCharacter() {
        return this.characters[this.selectedIndex];
    }

    /**
     * 设置鼠标位置
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    setMousePosition(x, y) {
        this.mouseX = x;
        this.mouseY = y;
    }

    /**
     * 处理鼠标点击
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {boolean} 是否点击了角色
     */
    handleClick(x, y) {
        // 检查是否点击了角色卡片
        if (this.hoveredIndex !== -1) {
            this.selectedIndex = this.hoveredIndex;
            this.confirmSelection();
            return true;
        }
        return false;
    }
}

// 创建全局角色选择管理器实例
const characterSelectManager = new CharacterSelectManager();
