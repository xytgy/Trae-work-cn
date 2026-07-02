/**
 * 房间类
 * 负责管理游戏房间的渲染、敌人管理和传送门机制
 */

/**
 * 地砖类
 * 像素风格地砖，带有花纹和磨损效果
 */
class FloorTile {
    /**
     * 构造函数
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} type - 地砖类型（0=普通, 1=花纹, 2=磨损）
     */
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.baseColor = this.getBaseColor();
        this.detailColor = FLOOR_TILE.COLORS.DETAIL;
    }
    
    /**
     * 获取随机基础颜色
     * @returns {string} 颜色值
     */
    getBaseColor() {
        const colors = FLOOR_TILE.COLORS.BASE;
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * 渲染地砖
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     */
    render(ctx) {
        const size = FLOOR_TILE.SIZE;
        
        // 底色
        ctx.fillStyle = this.baseColor;
        ctx.fillRect(this.x, this.y, size, size);
        
        // 花纹
        if (this.type === FLOOR_TILE.TYPES.PATTERN) {
            ctx.fillStyle = this.detailColor;
            // 中心点
            ctx.fillRect(this.x + 14, this.y + 14, 4, 4);
            // 四角
            ctx.fillRect(this.x + 4, this.y + 4, 2, 2);
            ctx.fillRect(this.x + 26, this.y + 4, 2, 2);
            ctx.fillRect(this.x + 4, this.y + 26, 2, 2);
            ctx.fillRect(this.x + 26, this.y + 26, 2, 2);
        } else if (this.type === FLOOR_TILE.TYPES.WORN) {
            // 磨损痕迹
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(this.x + 8, this.y + 16, 16, 2);
            ctx.fillRect(this.x + 12, this.y + 12, 8, 2);
        }
        
        // 地砖缝隙
        ctx.strokeStyle = FLOOR_TILE.COLORS.GAP;
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x + 0.5, this.y + 0.5, size - 1, size - 1);
    }
}

/**
 * 装饰类
 * 房间中的环境装饰物（火把、骷髅、箱子、石柱）
 */
class Decoration {
    /**
     * 构造函数
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} type - 装饰类型
     */
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.animTimer = Math.random() * 1000;
    }
    
    /**
     * 更新装饰动画
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        this.animTimer += deltaTime;
    }
    
    /**
     * 渲染装饰
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     */
    render(ctx) {
        switch (this.type) {
            case DECORATIONS.TYPES.TORCH:
                this.renderTorch(ctx);
                break;
            case DECORATIONS.TYPES.SKULL:
                this.renderSkull(ctx);
                break;
            case DECORATIONS.TYPES.CHEST:
                this.renderChest(ctx);
                break;
            case DECORATIONS.TYPES.PILLAR:
                this.renderPillar(ctx);
                break;
        }
    }
    
    /**
     * 渲染火把
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     */
    renderTorch(ctx) {
        // 火把杆
        ctx.fillStyle = '#5a3010';
        ctx.fillRect(this.x - 2, this.y, 4, 20);
        
        // 火焰
        const flicker = Math.sin(this.animTimer / 50) * 2;
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.moveTo(this.x - 5, this.y);
        ctx.quadraticCurveTo(this.x, this.y - 15 + flicker, this.x + 5, this.y);
        ctx.fill();
        
        // 内焰
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(this.x - 3, this.y - 2);
        ctx.quadraticCurveTo(this.x, this.y - 10 + flicker, this.x + 3, this.y - 2);
        ctx.fill();
    }
    
    /**
     * 渲染骷髅
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     */
    renderSkull(ctx) {
        // 骷髅头
        ctx.fillStyle = '#d0d0d0';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼窝
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(this.x - 3, this.y - 1, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 3, this.y - 1, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 鼻洞
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + 2);
        ctx.lineTo(this.x - 2, this.y + 5);
        ctx.lineTo(this.x + 2, this.y + 5);
        ctx.fill();
    }
    
    /**
     * 渲染箱子
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     */
    renderChest(ctx) {
        // 箱子主体
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(this.x - 12, this.y - 10, 24, 20);
        
        // 箱盖
        ctx.fillStyle = '#a0522d';
        ctx.fillRect(this.x - 14, this.y - 14, 28, 8);
        
        // 金属条
        ctx.fillStyle = '#daa520';
        ctx.fillRect(this.x - 14, this.y - 2, 28, 2);
        ctx.fillRect(this.x - 2, this.y - 14, 4, 24);
        
        // 锁
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(this.x - 3, this.y - 4, 6, 6);
    }
    
    /**
     * 渲染石柱
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     */
    renderPillar(ctx) {
        // 柱子主体
        ctx.fillStyle = '#606070';
        ctx.fillRect(this.x - 10, this.y - 30, 20, 40);
        
        // 柱顶
        ctx.fillStyle = '#707080';
        ctx.fillRect(this.x - 14, this.y - 34, 28, 6);
        
        // 柱底
        ctx.fillRect(this.x - 14, this.y + 6, 28, 6);
        
        // 纹理
        ctx.fillStyle = '#505060';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(this.x - 8, this.y - 20 + i * 12, 16, 2);
        }
    }
}

class Room {
    constructor(roomType = ROOM_TYPES.BATTLE, roomIndex = 0, isBossRoom = false, worldX = 0, worldY = 0) {
        // 房间类型
        this.roomType = roomType;
        
        // 世界坐标（用于多房间渲染时的位置偏移）
        this.worldX = worldX;
        this.worldY = worldY;
        
        // 房间索引（用于难度递增）
        this.roomIndex = roomIndex;
        
        // 是否是Boss房
        this.isBossRoom = isBossRoom || roomType === ROOM_TYPES.BOSS;
        
        // 房间难度倍率
        this.difficultyMultiplier = 1.0;
        
        // 房间尺寸
        this.width = LEVELS.ROOM_WIDTH;
        this.height = LEVELS.ROOM_HEIGHT;
        
        // 墙壁厚度
        this.wallThickness = LEVELS.WALL_THICKNESS;
        
        // 门尺寸
        this.doorSize = LEVELS.DOOR_SIZE;
        
        // 背景颜色
        this.backgroundColor = COLORS.DUNGEON.BACKGROUND;
        this.wallColor = COLORS.DUNGEON.WALL;
        this.doorColor = COLORS.DUNGEON.DOOR;
        this.floorColor = COLORS.DUNGEON.FLOOR;
        
        // 根据房间类型设置不同的视觉风格
        this.setRoomVisualStyle();
        
        // 地砖数组
        this.floorTiles = [];
        
        // 装饰物数组
        this.decorations = [];
        
        // 预渲染的背景（用于优化）
        this.backgroundCanvas = null;
        this.backgroundCtx = null;
        
        // 地板纹理偏移（用于动画效果）
        this.floorOffset = 0;
        
        // 传送门状态
        this.portal = null;
        this.portalSpawnTimer = 0;
        this.portalActive = false;
        this.portalSpawnDelay = PORTAL.SPAWN_DELAY;
        
        // 陷阱管理器
        this.trapManager = null;
        
        // 宝箱管理器
        this.chestManager = null;
        
        // 回血喷泉（休息房）
        this.healingFountain = null;
        
        // 房间是否已完成
        this.completed = false;
        
        // ========== 新增场景动态属性 ==========
        
        // 房间进入渐亮效果
        this.enterFadeIn = true;
        this.enterFadeTimer = 0;
        this.enterFadeDuration = 1000;
        
        // 房间清空后变亮
        this.clearedBrightness = 0;
        this.clearedBrightnessTarget = 0;
        
        // 环境灰尘粒子
        this.dustParticles = [];
        this.dustParticleCount = SCENE_DYNAMICS.DUST.count;
        
        // 洞穴滴水效果
        this.drippingEffects = [];
        this.dripTimer = 0;
        this.dripInterval = SCENE_DYNAMICS.WATER_DROP.interval;
        
        // 地面雾气
        this.fogParticles = [];
        this.fogEnabled = true;
        
        // 环境光动画
        this.ambientLightTimer = 0;
        this.ambientLightSpeed = 0.001;
        
        // 墙壁晃动阴影
        this.shadowOffset = 0;
        
        // 精英房间火焰粒子
        this.flameParticles = [];
        this.flameParticleTimer = 0;
        this.flameParticleInterval = 100;
        
        // 计算房间难度
        this.calculateRoomDifficulty();
        
        // 初始化预渲染背景
        this.initBackground();
        
        // 生成装饰物
        this.generateDecorations();
        
        // 初始化环境粒子
        this.initAmbientParticles();
        
        // 根据房间类型初始化内容
        this.initRoomContent();
    }
    
    /**
     * 计算房间难度倍率
     */
    calculateRoomDifficulty() {
        this.difficultyMultiplier = gameState.getRoomDifficultyMultiplier(this.roomIndex, this.isBossRoom);
    }
    
    /**
     * 获取房间难度倍率
     * @returns {number} 难度倍率
     */
    getDifficultyMultiplier() {
        return this.difficultyMultiplier;
    }
    
    /**
     * 根据房间类型设置不同的视觉风格
     */
    setRoomVisualStyle() {
        switch (this.roomType) {
            case ROOM_TYPES.ELITE:
                this.backgroundColor = '#2d1010';
                this.wallColor = '#5a2020';
                this.doorColor = '#ff4444';
                this.floorColor = '#1a0a0a';
                break;
            case ROOM_TYPES.BOSS:
                this.backgroundColor = '#1a0a2e';
                this.wallColor = '#3a1a4e';
                this.doorColor = '#9c27b0';
                this.floorColor = '#0f051a';
                break;
            case ROOM_TYPES.CHEST:
                this.backgroundColor = '#1a1a0a';
                this.wallColor = '#3a3a1a';
                this.doorColor = '#ffd700';
                this.floorColor = '#101005';
                break;
            case ROOM_TYPES.SHOP:
                this.backgroundColor = '#0a1a2a';
                this.wallColor = '#1a3a4a';
                this.doorColor = '#2196f3';
                this.floorColor = '#05101a';
                break;
            case ROOM_TYPES.REST:
                this.backgroundColor = '#0a2a1a';
                this.wallColor = '#1a4a2a';
                this.doorColor = '#4caf50';
                this.floorColor = '#051a10';
                break;
            case ROOM_TYPES.TRAP:
                this.backgroundColor = '#1a1a1a';
                this.wallColor = '#3a3a3a';
                this.doorColor = '#888888';
                this.floorColor = '#101010';
                break;
            default:
                break;
        }
    }
    
    /**
     * 重置房间状态
     */
    reset() {
        this.portal = null;
        this.portalActive = false;
        this.portalSpawnTimer = 0;
        this.completed = false;
        this.trapManager = null;
        this.chestManager = null;
        this.healingFountain = null;
    }
    
    /**
     * 根据房间类型初始化内容
     */
    initRoomContent() {
        const playableArea = this.getPlayableArea();
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        switch (this.roomType) {
            case ROOM_TYPES.CHEST:
                this.initChestRoom(playableArea, centerX, centerY);
                break;
            case ROOM_TYPES.TRAP:
                this.initTrapRoom(playableArea, centerX, centerY);
                break;
            case ROOM_TYPES.REST:
                this.initRestRoom(playableArea, centerX, centerY);
                break;
            case ROOM_TYPES.SHOP:
                this.initShopRoom(playableArea, centerX, centerY);
                break;
            case ROOM_TYPES.ELITE:
            case ROOM_TYPES.BATTLE:
            case ROOM_TYPES.BOSS:
            default:
                break;
        }
    }
    
    /**
     * 初始化宝箱房
     */
    initChestRoom(playableArea, centerX, centerY) {
        if (typeof ChestManager !== 'undefined') {
            this.chestManager = new ChestManager();
            
            const chestCount = CHEST_ROOM_CONFIG.CHEST_COUNT_MIN + 
                Math.floor(Math.random() * (CHEST_ROOM_CONFIG.CHEST_COUNT_MAX - CHEST_ROOM_CONFIG.CHEST_COUNT_MIN + 1));
            
            for (let i = 0; i < chestCount; i++) {
                const offsetX = (i - (chestCount - 1) / 2) * 60;
                const chestX = centerX + offsetX;
                const chestY = centerY;
                
                let chestType = CHEST_TYPES.NORMAL;
                const rand = Math.random();
                if (rand < 0.1) {
                    chestType = CHEST_TYPES.GEM;
                } else if (rand < 0.3) {
                    chestType = CHEST_TYPES.GOLDEN;
                }
                
                if (Math.random() < CHEST_ROOM_CONFIG.MIMIC_CHANCE) {
                    chestType = CHEST_TYPES.MIMIC;
                }
                
                this.chestManager.addChest(chestType, chestX, chestY);
            }
        }
        
        this.completed = false;
    }
    
    /**
     * 初始化陷阱房
     */
    initTrapRoom(playableArea, centerX, centerY) {
        if (typeof TrapManager !== 'undefined') {
            this.trapManager = new TrapManager();
            
            const trapCount = TRAP_ROOM_CONFIG.TRAP_COUNT_MIN + 
                Math.floor(Math.random() * (TRAP_ROOM_CONFIG.TRAP_COUNT_MAX - TRAP_ROOM_CONFIG.TRAP_COUNT_MIN + 1));
            
            const trapTypes = [
                TRAP_TYPES.SPIKE,
                TRAP_TYPES.FIRE,
                TRAP_TYPES.POISON,
                TRAP_TYPES.ICE,
                TRAP_TYPES.ROCK,
                TRAP_TYPES.TELEPORT
            ];
            
            const margin = 80;
            
            for (let i = 0; i < trapCount; i++) {
                const trapType = trapTypes[Math.floor(Math.random() * trapTypes.length)];
                const x = margin + Math.random() * (this.width - margin * 2);
                const y = margin + Math.random() * (this.height - margin * 2);
                
                this.trapManager.addTrap(x, y, trapType);
            }
        }
        
        this.completed = false;
    }
    
    /**
     * 初始化休息房
     */
    initRestRoom(playableArea, centerX, centerY) {
        if (typeof HealingFountain !== 'undefined') {
            this.healingFountain = new HealingFountain(centerX, centerY);
        }
        
        this.completed = false;
    }
    
    /**
     * 初始化商店房（占位实现）
     */
    initShopRoom(playableArea, centerX, centerY) {
        this.completed = false;
    }
    
    /**
     * 检查房间是否完成
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     * @returns {boolean} 是否完成
     */
    checkRoomCompleted(gameLogic) {
        if (this.completed) return true;
        
        switch (this.roomType) {
            case ROOM_TYPES.BATTLE:
            case ROOM_TYPES.ELITE:
            case ROOM_TYPES.BOSS:
                const allEnemiesDead = gameLogic.enemies.every(e => !e.alive);
                if (allEnemiesDead && !gameLogic.boss) {
                    this.completed = true;
                } else if (allEnemiesDead && gameLogic.boss && !gameLogic.boss.alive) {
                    this.completed = true;
                }
                return this.completed;
                
            case ROOM_TYPES.CHEST:
                if (this.chestManager) {
                    const allOpened = this.chestManager.chests.every(c => c.opened || !c.alive);
                    if (allOpened && this.chestManager.chests.length > 0) {
                        this.completed = true;
                    }
                } else {
                    this.completed = true;
                }
                return this.completed;
                
            case ROOM_TYPES.TRAP:
            case ROOM_TYPES.REST:
            case ROOM_TYPES.SHOP:
            default:
                return false;
        }
    }
    
    /**
     * 初始化预渲染背景
     * @param {RoomNode} roomNode - 房间节点（可选）
     */
    initBackground(roomNode) {
        this.backgroundCanvas = document.createElement('canvas');
        this.backgroundCanvas.width = this.width;
        this.backgroundCanvas.height = this.height;
        
        this.backgroundCtx = this.backgroundCanvas.getContext('2d');
        
        this.generateFloorTiles();
        
        const ctx = this.backgroundCtx;

        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, this.width, this.height);

        this.drawFloorPattern(ctx);

        if (roomNode) {
            this.drawWallsWithDoors(ctx, roomNode);
            this.drawDoorsWithDoors(ctx, roomNode);
        } else {
            this.drawWalls(ctx);
            this.drawDoors(ctx);
        }
    }
    
    /**
     * 根据房间节点预渲染背景（支持门信息）
     * @param {RoomNode} roomNode - 房间节点
     */
    preRenderBackground(roomNode) {
        if (!roomNode) {
            this.initBackground();
            return;
        }

        this.backgroundCanvas = document.createElement('canvas');
        this.backgroundCanvas.width = this.width;
        this.backgroundCanvas.height = this.height;
        this.backgroundCtx = this.backgroundCanvas.getContext('2d');

        this.generateFloorTiles();

        const ctx = this.backgroundCtx;

        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, this.width, this.height);

        this.drawFloorPattern(ctx);
        this.drawWallsWithDoors(ctx, roomNode);
        this.drawDoorsWithDoors(ctx, roomNode);
    }
    
    /**
     * 根据门信息绘制墙壁
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     * @param {RoomNode} roomNode - 房间节点
     */
    drawWallsWithDoors(ctx, roomNode) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const doorWidth = this.doorSize;
        const halfDoorWidth = doorWidth / 2;

        if (roomNode.hasDoor(DOOR.TOP)) {
            this.drawBrickWall(ctx, 0, 0, centerX - halfDoorWidth, this.wallThickness, 'top');
            this.drawBrickWall(ctx, centerX + halfDoorWidth, 0, this.width - centerX - halfDoorWidth, this.wallThickness, 'top');
        } else {
            this.drawBrickWall(ctx, 0, 0, this.width, this.wallThickness, 'top');
        }

        if (roomNode.hasDoor(DOOR.BOTTOM)) {
            this.drawBrickWall(ctx, 0, this.height - this.wallThickness, centerX - halfDoorWidth, this.wallThickness, 'bottom');
            this.drawBrickWall(ctx, centerX + halfDoorWidth, this.height - this.wallThickness, this.width - centerX - halfDoorWidth, this.wallThickness, 'bottom');
        } else {
            this.drawBrickWall(ctx, 0, this.height - this.wallThickness, this.width, this.wallThickness, 'bottom');
        }

        if (roomNode.hasDoor(DOOR.LEFT)) {
            this.drawBrickWall(ctx, 0, 0, this.wallThickness, centerY - halfDoorWidth, 'left');
            this.drawBrickWall(ctx, 0, centerY + halfDoorWidth, this.wallThickness, this.height - centerY - halfDoorWidth, 'left');
        } else {
            this.drawBrickWall(ctx, 0, 0, this.wallThickness, this.height, 'left');
        }

        if (roomNode.hasDoor(DOOR.RIGHT)) {
            this.drawBrickWall(ctx, this.width - this.wallThickness, 0, this.wallThickness, centerY - halfDoorWidth, 'right');
            this.drawBrickWall(ctx, this.width - this.wallThickness, centerY + halfDoorWidth, this.wallThickness, this.height - centerY - halfDoorWidth, 'right');
        } else {
            this.drawBrickWall(ctx, this.width - this.wallThickness, 0, this.wallThickness, this.height, 'right');
        }
    }
    
    /**
     * 根据门信息绘制门
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     * @param {RoomNode} roomNode - 房间节点
     */
    drawDoorsWithDoors(ctx, roomNode) {
        const doorWidth = this.doorSize;
        const doorHeight = this.wallThickness;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const frameThickness = 4;

        const drawDoorFrame = (x, y, w, h, isVertical) => {
            ctx.shadowColor = this.doorColor;
            ctx.shadowBlur = 15;
            ctx.fillStyle = this.doorColor;
            ctx.fillRect(x, y, w, h);
            ctx.shadowBlur = 0;

            const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
            gradient.addColorStop(0, '#2a1a3a');
            gradient.addColorStop(0.5, '#1a0a2a');
            gradient.addColorStop(1, '#0f051a');
            ctx.fillStyle = gradient;
            ctx.fillRect(x + frameThickness, y + frameThickness, w - frameThickness * 2, h - frameThickness * 2);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            if (isVertical) {
                ctx.fillRect(x + 2, y + 2, 3, h - 4);
                ctx.fillRect(x + w - 5, y + 2, 3, h - 4);
            } else {
                ctx.fillRect(x + 2, y + 2, w - 4, 3);
                ctx.fillRect(x + 2, y + h - 5, w - 4, 3);
            }

            ctx.fillStyle = 'rgba(100, 100, 120, 0.2)';
            const tileSize = 10;
            for (let ty = y + frameThickness + 5; ty < y + h - frameThickness - 5; ty += tileSize) {
                for (let tx = x + frameThickness + 5; tx < x + w - frameThickness - 5; tx += tileSize) {
                    if ((tx + ty) % (tileSize * 2) < tileSize) {
                        ctx.fillRect(tx, ty, tileSize - 2, tileSize - 2);
                    }
                }
            }
        };

        if (roomNode.hasDoor(DOOR.TOP)) {
            drawDoorFrame(centerX - doorWidth / 2, 0, doorWidth, doorHeight, false);
        }
        if (roomNode.hasDoor(DOOR.BOTTOM)) {
            drawDoorFrame(centerX - doorWidth / 2, this.height - doorHeight, doorWidth, doorHeight, false);
        }
        if (roomNode.hasDoor(DOOR.LEFT)) {
            drawDoorFrame(0, centerY - doorWidth / 2, doorHeight, doorWidth, true);
        }
        if (roomNode.hasDoor(DOOR.RIGHT)) {
            drawDoorFrame(this.width - doorHeight, centerY - doorWidth / 2, doorHeight, doorWidth, true);
        }
    }
    
    /**
     * 生成地砖
     */
    generateFloorTiles() {
        this.floorTiles = [];
        
        const tileSize = FLOOR_TILE.SIZE;
        const rows = Math.ceil(this.height / tileSize);
        const cols = Math.ceil(this.width / tileSize);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * tileSize;
                const y = row * tileSize;
                
                // 只在可活动区域生成地砖
                if (x >= this.wallThickness && 
                    x < this.width - this.wallThickness &&
                    y >= this.wallThickness && 
                    y < this.height - this.wallThickness) {
                    
                    // 随机决定地砖类型
                    let type = FLOOR_TILE.TYPES.NORMAL;
                    const rand = Math.random();
                    if (rand < FLOOR_TILE.PATTERN_CHANCE) {
                        type = FLOOR_TILE.TYPES.PATTERN;
                    } else if (rand < FLOOR_TILE.PATTERN_CHANCE + FLOOR_TILE.WORN_CHANCE) {
                        type = FLOOR_TILE.TYPES.WORN;
                    }
                    
                    this.floorTiles.push(new FloorTile(x, y, type));
                }
            }
        }
    }
    
    /**
     * 生成装饰物
     */
    generateDecorations() {
        this.decorations = [];
        
        const playableArea = this.getPlayableArea();
        const margin = 50;
        
        // 生成火把（靠墙位置）
        const torchPositions = [
            { x: this.wallThickness + 30, y: this.wallThickness + 30 },
            { x: this.width - this.wallThickness - 30, y: this.wallThickness + 30 },
            { x: this.wallThickness + 30, y: this.height - this.wallThickness - 30 },
            { x: this.width - this.wallThickness - 30, y: this.height - this.wallThickness - 30 }
        ];
        
        for (let i = 0; i < DECORATIONS.TORCH_COUNT && i < torchPositions.length; i++) {
            const pos = torchPositions[i];
            this.decorations.push(new Decoration(pos.x, pos.y, DECORATIONS.TYPES.TORCH));
        }
        
        // 生成骷髅（随机位置）
        for (let i = 0; i < DECORATIONS.SKULL_COUNT; i++) {
            const x = playableArea.x + margin + Math.random() * (playableArea.width - margin * 2);
            const y = playableArea.y + margin + Math.random() * (playableArea.height - margin * 2);
            this.decorations.push(new Decoration(x, y, DECORATIONS.TYPES.SKULL));
        }
        
        // 生成石柱（随机位置，避开中心）
        const pillarCount = this.roomType === ROOM_TYPES.ELITE ? 1 : DECORATIONS.PILLAR_COUNT;
        for (let i = 0; i < pillarCount; i++) {
            let x, y;
            let attempts = 0;
            do {
                x = playableArea.x + margin + Math.random() * (playableArea.width - margin * 2);
                y = playableArea.y + margin + Math.random() * (playableArea.height - margin * 2);
                attempts++;
            } while (
                Math.abs(x - this.width / 2) < 100 && 
                Math.abs(y - this.height / 2) < 100 && 
                attempts < 10
            );
            this.decorations.push(new Decoration(x, y, DECORATIONS.TYPES.PILLAR));
        }
        
        // 生成箱子（随机位置）
        for (let i = 0; i < DECORATIONS.CHEST_COUNT; i++) {
            const x = playableArea.x + margin + Math.random() * (playableArea.width - margin * 2);
            const y = playableArea.y + margin + Math.random() * (playableArea.height - margin * 2);
            this.decorations.push(new Decoration(x, y, DECORATIONS.TYPES.CHEST));
        }
    }
    
    /**
     * 渲染静态背景（只渲染一次的内容）
     */
    renderStaticBackground() {
        const ctx = this.backgroundCtx;
        
        // 绘制主背景
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // 绘制地板纹理（像素地砖）
        this.drawFloorPattern(ctx);
        
        // 绘制墙壁（3D砖墙）
        this.drawWalls(ctx);
        
        // 绘制门
        this.drawDoors(ctx);
    }
    
    /**
     * 绘制地板纹理（像素地砖）
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     */
    drawFloorPattern(ctx) {
        // 渲染所有地砖
        for (const tile of this.floorTiles) {
            tile.render(ctx);
        }
    }
    
    /**
     * 绘制墙壁（3D砖墙效果）
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     */
    drawWalls(ctx) {
        // 上墙
        this.drawBrickWall(ctx, 0, 0, this.width, this.wallThickness, 'top');
        
        // 下墙
        this.drawBrickWall(ctx, 0, this.height - this.wallThickness, this.width, this.wallThickness, 'bottom');
        
        // 左墙
        this.drawBrickWall(ctx, 0, 0, this.wallThickness, this.height, 'left');
        
        // 右墙
        this.drawBrickWall(ctx, this.width - this.wallThickness, 0, this.wallThickness, this.height, 'right');
    }
    
    /**
     * 绘制砖墙
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {string} side - 墙壁方向（top, bottom, left, right）
     */
    drawBrickWall(ctx, x, y, width, height, side) {
        const brickWidth = WALL_BRICK.BRICK_WIDTH;
        const brickHeight = WALL_BRICK.BRICK_HEIGHT;
        
        const rows = Math.ceil(height / brickHeight);
        const cols = Math.ceil(width / brickWidth);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const offset = row % 2 === 0 ? 0 : brickWidth / 2;
                const bx = x + col * brickWidth + offset;
                const by = y + row * brickHeight;
                
                if (bx > x + width) continue;
                if (bx + brickWidth - 2 < x) continue;
                
                // 砖块主体
                ctx.fillStyle = WALL_BRICK.COLORS.BASE;
                ctx.fillRect(bx, by, brickWidth - 2, brickHeight - 2);
                
                // 顶部高光
                ctx.fillStyle = WALL_BRICK.COLORS.HIGHLIGHT;
                ctx.fillRect(bx, by, brickWidth - 2, 2);
                
                // 左侧高光
                ctx.fillRect(bx, by, 2, brickHeight - 2);
                
                // 底部阴影
                ctx.fillStyle = WALL_BRICK.COLORS.SHADOW;
                ctx.fillRect(bx, by + brickHeight - 4, brickWidth - 2, 2);
                
                // 右侧阴影
                ctx.fillRect(bx + brickWidth - 4, by, 2, brickHeight - 2);
            }
        }
    }
    
    /**
     * 绘制门
     * @param {CanvasRenderingContext2D} ctx - 渲染上下文
     */
    drawDoors(ctx) {
        ctx.fillStyle = this.doorColor;
        
        const doorWidth = this.doorSize;
        const doorHeight = this.wallThickness;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // 上门
        ctx.fillRect(
            centerX - doorWidth / 2,
            0,
            doorWidth,
            doorHeight
        );
        
        // 下门
        ctx.fillRect(
            centerX - doorWidth / 2,
            this.height - doorHeight,
            doorWidth,
            doorHeight
        );
        
        // 左门
        ctx.fillRect(
            0,
            centerY - doorWidth / 2,
            doorHeight,
            doorWidth
        );
        
        // 右门
        ctx.fillRect(
            this.width - doorHeight,
            centerY - doorWidth / 2,
            doorHeight,
            doorWidth
        );
    }
    
    /**
     * 更新房间（每帧调用）
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {Player} player - 玩家引用
     * @param {GameLogic} gameLogic - 游戏逻辑引用
     */
    update(deltaTime, player, gameLogic) {
        // 更新地板动画
        this.floorOffset += deltaTime * 0.02;
        if (this.floorOffset > 40) {
            this.floorOffset = 0;
        }
        
        // 房间进入渐亮
        if (this.enterFadeIn) {
            this.enterFadeTimer += deltaTime;
            if (this.enterFadeTimer >= this.enterFadeDuration) {
                this.enterFadeIn = false;
            }
        }
        
        // 房间清空后亮度渐变
        if (this.completed && this.clearedBrightness < this.clearedBrightnessTarget) {
            this.clearedBrightness += deltaTime * 0.0005;
            if (this.clearedBrightness > this.clearedBrightnessTarget) {
                this.clearedBrightness = this.clearedBrightnessTarget;
            }
        }
        
        // 环境光动画
        this.ambientLightTimer += deltaTime * this.ambientLightSpeed;
        this.shadowOffset = Math.sin(this.ambientLightTimer) * 2;
        
        // 更新环境灰尘粒子
        this.updateDustParticles(deltaTime);
        
        // 更新滴水效果
        this.updateDripping(deltaTime);
        
        // 更新地面雾气
        if (this.fogEnabled) {
            this.updateFogParticles(deltaTime);
        }
        
        // 更新精英房间火焰粒子
        this.updateFlameParticles(deltaTime);
        
        // 更新装饰物动画
        for (const decoration of this.decorations) {
            decoration.update(deltaTime);
        }
        
        // 更新传送门
        this.updatePortal(deltaTime);
        
        // 更新陷阱
        if (this.trapManager && player) {
            this.trapManager.update(deltaTime, player, gameLogic);
        }
        
        // 更新宝箱
        if (this.chestManager && player) {
            this.chestManager.update(deltaTime, player, gameLogic);
        }
        
        // 更新回血喷泉
        if (this.healingFountain && player) {
            this.healingFountain.update(deltaTime, gameLogic);
        }
    }
    
    /**
     * 初始化环境粒子
     */
    initAmbientParticles() {
        // 初始化灰尘粒子
        for (let i = 0; i < this.dustParticleCount; i++) {
            this.dustParticles.push(this.createDustParticle());
        }
        
        // 初始化雾气粒子
        if (this.fogEnabled) {
            for (let i = 0; i < 15; i++) {
                this.fogParticles.push(this.createFogParticle());
            }
        }
    }
    
    /**
     * 创建灰尘粒子
     */
    createDustParticle() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: 1 + Math.random() * 2,
            speedX: (Math.random() - 0.5) * 0.02,
            speedY: -0.01 - Math.random() * 0.02,
            alpha: 0.2 + Math.random() * 0.3,
            phase: Math.random() * Math.PI * 2
        };
    }
    
    /**
     * 创建雾气粒子
     */
    createFogParticle() {
        return {
            x: Math.random() * this.width,
            y: this.height - 20 - Math.random() * 40,
            size: 30 + Math.random() * 50,
            speedX: (Math.random() - 0.5) * 0.01,
            alpha: 0.05 + Math.random() * 0.1,
            phase: Math.random() * Math.PI * 2
        };
    }
    
    /**
     * 更新灰尘粒子
     * @param {number} deltaTime - 时间增量
     */
    updateDustParticles(deltaTime) {
        for (const particle of this.dustParticles) {
            particle.phase += deltaTime * 0.001;
            particle.x += particle.speedX * deltaTime + Math.sin(particle.phase) * 0.1;
            particle.y += particle.speedY * deltaTime;
            
            // 循环
            if (particle.y < 0) {
                particle.y = this.height;
                particle.x = Math.random() * this.width;
            }
            if (particle.x < 0) particle.x = this.width;
            if (particle.x > this.width) particle.x = 0;
        }
    }
    
    /**
     * 更新滴水效果
     * @param {number} deltaTime - 时间增量
     */
    updateDripping(deltaTime) {
        this.dripTimer += deltaTime;
        
        // 随机生成水滴
        if (this.dripTimer >= this.dripInterval) {
            this.dripTimer = 0;
            if (Math.random() < 0.3) {
                this.drippingEffects.push({
                    x: this.wallThickness + Math.random() * (this.width - this.wallThickness * 2),
                    y: this.wallThickness,
                    speed: 0.1 + Math.random() * 0.1,
                    size: 2,
                    alpha: 0.6,
                    state: 'falling'
                });
            }
        }
        
        // 更新水滴
        for (let i = this.drippingEffects.length - 1; i >= 0; i--) {
            const drip = this.drippingEffects[i];
            
            if (drip.state === 'falling') {
                drip.y += drip.speed * deltaTime;
                
                // 落地
                if (drip.y >= this.height - this.wallThickness - 10) {
                    drip.state = 'splash';
                    drip.splashTimer = 0;
                    drip.splashDuration = 300;
                }
            } else if (drip.state === 'splash') {
                drip.splashTimer += deltaTime;
                drip.alpha = 0.6 * (1 - drip.splashTimer / drip.splashDuration);
                
                if (drip.splashTimer >= drip.splashDuration) {
                    this.drippingEffects.splice(i, 1);
                }
            }
        }
    }
    
    /**
     * 更新雾气粒子
     * @param {number} deltaTime - 时间增量
     */
    updateFogParticles(deltaTime) {
        for (const particle of this.fogParticles) {
            particle.phase += deltaTime * 0.0005;
            particle.x += particle.speedX * deltaTime + Math.sin(particle.phase) * 0.05;
            
            // 循环
            if (particle.x < -particle.size) particle.x = this.width + particle.size;
            if (particle.x > this.width + particle.size) particle.x = -particle.size;
        }
    }
    
    /**
     * 创建火焰粒子
     */
    createFlameParticle() {
        const playableArea = this.getPlayableArea();
        return {
            x: playableArea.x + Math.random() * playableArea.width,
            y: playableArea.y + playableArea.height + 20,
            size: 4 + Math.random() * 6,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: -0.3 - Math.random() * 0.5,
            alpha: 0.8 + Math.random() * 0.2,
            phase: Math.random() * Math.PI * 2,
            flickerSpeed: 0.02 + Math.random() * 0.02,
            color: Math.random() < 0.3 ? '#ffff00' : (Math.random() < 0.5 ? '#ff6600' : '#ff3300')
        };
    }
    
    /**
     * 更新火焰粒子（精英房间）
     * @param {number} deltaTime - 时间增量
     */
    updateFlameParticles(deltaTime) {
        if (this.roomType !== ROOM_TYPES.ELITE) return;
        
        // 生成新粒子
        this.flameParticleTimer += deltaTime;
        if (this.flameParticleTimer >= this.flameParticleInterval) {
            this.flameParticleTimer = 0;
            if (this.flameParticles.length < 30) {
                this.flameParticles.push(this.createFlameParticle());
            }
        }
        
        // 更新粒子
        for (let i = this.flameParticles.length - 1; i >= 0; i--) {
            const particle = this.flameParticles[i];
            
            particle.phase += deltaTime * particle.flickerSpeed;
            particle.x += particle.speedX * deltaTime + Math.sin(particle.phase) * 0.5;
            particle.y += particle.speedY * deltaTime;
            particle.size *= 0.995;
            particle.alpha -= deltaTime * 0.001;
            
            // 移除死亡粒子
            if (particle.y < this.wallThickness || particle.alpha <= 0 || particle.size <= 0.5) {
                this.flameParticles.splice(i, 1);
            }
        }
    }
    
    /**
     * 标记房间完成
     */
    markCompleted() {
        this.completed = true;
        this.clearedBrightnessTarget = 0.15;
    }
    
    /**
     * 更新传送门状态
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     */
    updatePortal(deltaTime) {
        // 如果传送门已激活，无需更新
        if (this.portalActive) return;
        
        // 如果传送门正在生成
        if (this.portal && this.portal.spawnTime > 0) {
            this.portal.spawnTime -= deltaTime;
            
            // 传送门可使用时标记为激活
            if (this.portal.spawnTime <= 0) {
                this.portalActive = true;
                this.portal.spawnTime = 0;
            }
        }
    }
    
    /**
     * 生成传送门（击杀所有敌人后调用）
     */
    spawnPortal() {
        if (this.portal) {
            console.log('传送门已存在，跳过生成');
            return;
        }
        this.portal = {
            x: this.width / 2,
            y: this.height / 2,
            size: PORTAL.SIZE,
            spawnTime: PORTAL.SPAWN_DELAY,
            active: true,
            particleTimer: 0
        };
        this.portalActive = false;
        console.log('传送门已生成，将在3秒后可用');
    }
    
    /**
     * 更新传送门粒子效果
     * @param {number} deltaTime - 距离上一帧的时间（毫秒）
     * @param {Array} particles - 粒子数组引用
     */
    updatePortalParticles(deltaTime, particles) {
        if (!this.portal || !this.portal.active) return;
        
        // 更新粒子生成计时器
        this.portal.particleTimer += deltaTime;
        
        // 每50ms生成一个粒子
        if (this.portal.particleTimer >= 50) {
            this.portal.particleTimer = 0;
            
            // 生成传送门周围的粒子
            const angle = Math.random() * Math.PI * 2;
            const dist = this.portal.size / 2;
            
            particles.push(new Particle(
                this.portal.x + Math.cos(angle) * dist,
                this.portal.y + Math.sin(angle) * dist,
                Math.cos(angle) * 1,
                Math.sin(angle) * 1 - 1,
                PORTAL.PARTICLE_COLOR,
                4 + Math.random() * 4,
                400 + Math.random() * 200
            ));
        }
    }
    
    /**
     * 检查玩家是否进入传送门
     * @param {Player} player - 玩家对象
     * @returns {boolean} - 是否进入传送门
     */
    checkPortalCollision(player) {
        // 如果传送门未激活，不能进入
        if (!this.portal || !this.portalActive) return false;
        
        const portalWorldX = this.portal.x + this.worldX;
        const portalWorldY = this.portal.y + this.worldY;
        
        const dx = player.x - portalWorldX;
        const dy = player.y - portalWorldY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 传送门碰撞半径
        const collisionRadius = this.portal.size / 2 + player.size / 2;
        
        return distance < collisionRadius;
    }
    
    /**
     * 渲染装饰物
     * @param {Renderer} renderer - 渲染器引用
     */
    renderDecorations(renderer) {
        const ctx = renderer.ctx;
        
        ctx.save();
        ctx.translate(this.worldX, this.worldY);
        
        for (const decoration of this.decorations) {
            decoration.render(ctx);
        }
        
        ctx.restore();
    }
    
    /**
     * 渲染环境效果（灰尘、雾气、滴水等）
     * @param {Renderer} renderer - 渲染器引用
     */
    renderAmbientEffects(renderer) {
        const ctx = renderer.ctx;
        
        // 渲染灰尘粒子
        for (const particle of this.dustParticles) {
            const wobble = Math.sin(particle.phase) * 0.5;
            ctx.fillStyle = `rgba(255, 255, 200, ${particle.alpha})`;
            ctx.beginPath();
            ctx.arc(particle.x + wobble, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 渲染滴水效果
        for (const drip of this.drippingEffects) {
            if (drip.state === 'falling') {
                ctx.fillStyle = `rgba(100, 180, 255, ${drip.alpha})`;
                ctx.beginPath();
                ctx.ellipse(drip.x, drip.y, drip.size * 0.6, drip.size, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (drip.state === 'splash') {
                const splashProgress = drip.splashTimer / drip.splashDuration;
                const splashRadius = 3 + splashProgress * 8;
                ctx.strokeStyle = `rgba(100, 180, 255, ${drip.alpha})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.ellipse(drip.x, drip.y, splashRadius, splashRadius * 0.3, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        // 渲染地面雾气
        if (this.fogEnabled) {
            for (const particle of this.fogParticles) {
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size
                );
                gradient.addColorStop(0, `rgba(200, 200, 220, ${particle.alpha})`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.ellipse(particle.x, particle.y, particle.size, particle.size * 0.3, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // 渲染精英房间火焰粒子
        this.renderFlameParticles(renderer);
    }
    
    /**
     * 渲染火焰粒子（精英房间）
     * @param {Renderer} renderer - 渲染器引用
     */
    renderFlameParticles(renderer) {
        if (this.roomType !== ROOM_TYPES.ELITE) return;
        
        const ctx = renderer.ctx;
        
        for (const particle of this.flameParticles) {
            const flicker = Math.sin(particle.phase) * 0.3 + 0.7;
            const currentAlpha = particle.alpha * flicker;
            const currentSize = particle.size * flicker;
            
            // 外焰
            const outerGradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, currentSize * 1.5
            );
            outerGradient.addColorStop(0, particle.color);
            outerGradient.addColorStop(0.5, `rgba(255, 100, 0, ${currentAlpha * 0.5})`);
            outerGradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = outerGradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, currentSize * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // 内核
            ctx.fillStyle = `rgba(255, 255, 200, ${currentAlpha})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, currentSize * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    /**
     * 获取房间渐暗叠加层颜色
     * @returns {object} 颜色和透明度
     */
    getEnterFadeOverlay() {
        if (this.enterFadeIn) {
            const progress = this.enterFadeTimer / this.enterFadeDuration;
            return {
                alpha: 1 - progress,
                color: '#000000'
            };
        }
        return null;
    }
    
    /**
     * 渲染陷阱
     * @param {Renderer} renderer - 渲染器引用
     */
    renderTraps(renderer) {
        if (!this.trapManager) return;
        
        const ctx = renderer.ctx;
        
        ctx.save();
        ctx.translate(this.worldX, this.worldY);
        
        this.trapManager.render(ctx);
        
        ctx.restore();
    }
    
    /**
     * 渲染宝箱
     * @param {Renderer} renderer - 渲染器引用
     */
    renderChests(renderer) {
        if (!this.chestManager) return;
        
        const ctx = renderer.ctx;
        
        ctx.save();
        ctx.translate(this.worldX, this.worldY);
        
        this.chestManager.render(ctx);
        
        ctx.restore();
    }
    
    /**
     * 渲染回血喷泉
     * @param {Renderer} renderer - 渲染器引用
     */
    renderFountain(renderer) {
        if (!this.healingFountain) return;
        
        const ctx = renderer.ctx;
        
        ctx.save();
        ctx.translate(this.worldX, this.worldY);
        
        this.healingFountain.render(ctx);
        
        ctx.restore();
    }
    
    /**
     * 获取房间类型名称
     * @returns {string} 房间类型名称
     */
    getRoomTypeName() {
        const names = {
            [ROOM_TYPES.BATTLE]: '战斗房',
            [ROOM_TYPES.CHEST]: '宝箱房',
            [ROOM_TYPES.SHOP]: '商店房',
            [ROOM_TYPES.TRAP]: '陷阱房',
            [ROOM_TYPES.ELITE]: '精英房',
            [ROOM_TYPES.REST]: '休息房',
            [ROOM_TYPES.BOSS]: 'Boss房'
        };
        return names[this.roomType] || '未知房间';
    }
    
    /**
     * 渲染传送门
     * @param {Renderer} renderer - 渲染器引用
     */
    renderPortal(renderer) {
        if (!this.portal || !this.portal.active) return;
        
        const ctx = renderer.ctx;
        const portal = this.portal;
        const time = Date.now() / 1000;
        
        // 旋转效果
        const rotation = time * 2;
        
        // 计算透明度（生成中时闪烁提示）
        let alpha = 1;
        if (!this.portalActive) {
            // 生成中：快速闪烁
            alpha = Math.sin(time * 10) > 0 ? 1 : 0.3;
        }
        
        ctx.save();
        ctx.translate(this.worldX, this.worldY);
        
        // 绘制传送门光圈
        ctx.save();
        ctx.translate(portal.x, portal.y);
        ctx.rotate(rotation);
        ctx.globalAlpha = alpha;
        
        // 绘制多个光环
        for (let i = 0; i < 3; i++) {
            const size = portal.size - i * 8;
            const ringAlpha = 0.3 + (i * 0.2);
            ctx.fillStyle = `rgba(156, 39, 176, ${ringAlpha})`;
            ctx.fillRect(-size / 2, -size / 2, size, size);
        }
        
        ctx.restore();
        
        // 绘制中心
        ctx.globalAlpha = alpha;
        renderer.drawCircle(portal.x, portal.y, 10, COLORS.PARTICLE.PORTAL);
        ctx.globalAlpha = 1;
        
        // 如果传送门未激活，显示倒计时提示
        if (!this.portalActive) {
            const remainingSeconds = Math.ceil(portal.spawnTime / 1000);
            renderer.drawCenteredText(
                `${remainingSeconds}`,
                portal.x,
                portal.y + portal.size / 2 + 15,
                '#ffffff',
                '14px "Courier New", monospace'
            );
        }
        
        ctx.restore();
    }
    
    /**
     * 渲染房间背景
     * @param {Renderer} renderer - 渲染器引用
     */
    render(renderer) {
        const ctx = renderer.ctx;
        
        ctx.save();
        ctx.translate(this.worldX, this.worldY);
        
        // 如果有预渲染的背景，直接绘制
        if (this.backgroundCanvas) {
            ctx.drawImage(this.backgroundCanvas, 0, 0);
        } else {
            console.warn('Room.render(): backgroundCanvas is null');
        }
        
        // 添加精英房间特殊视觉效果
        this.renderEliteRoomEffects(renderer);
        
        ctx.restore();
    }
    
    /**
     * 渲染精英房间特殊效果
     * @param {Renderer} renderer - 渲染器引用
     */
    renderEliteRoomEffects(renderer) {
        if (this.roomType !== ROOM_TYPES.ELITE) return;
        
        const ctx = renderer.ctx;
        const time = Date.now() / 1000;
        
        // 红色光环效果（从中心向外扩散的脉冲）
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const pulseRadius = 100 + Math.sin(time * 2) * 20;
        const pulseAlpha = 0.1 + Math.sin(time * 3) * 0.05;
        
        // 绘制多层光环
        for (let i = 0; i < 3; i++) {
            const radius = pulseRadius + i * 50;
            const alpha = pulseAlpha * (1 - i * 0.3);
            
            const gradient = ctx.createRadialGradient(
                centerX, centerY, radius * 0.8,
                centerX, centerY, radius
            );
            gradient.addColorStop(0, `rgba(255, 50, 50, 0)`);
            gradient.addColorStop(0.8, `rgba(255, 50, 50, ${alpha})`);
            gradient.addColorStop(1, `rgba(255, 20, 20, ${alpha * 0.5})`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // 地面红光反射
        const groundGradient = ctx.createLinearGradient(
            0, this.height * 0.6,
            0, this.height
        );
        groundGradient.addColorStop(0, 'transparent');
        groundGradient.addColorStop(0.5, `rgba(255, 50, 50, ${pulseAlpha * 0.3})`);
        groundGradient.addColorStop(1, `rgba(255, 20, 20, ${pulseAlpha * 0.5})`);
        
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, this.height * 0.6, this.width, this.height * 0.4);
    }
    
    /**
     * 获取火把光源位置
     * @returns {Array} 火把光源数组
     */
    getTorchLights() {
        const torches = this.decorations.filter(d => d.type === DECORATIONS.TYPES.TORCH);
        return torches.map(torch => ({
            x: torch.x,
            y: torch.y - 10,
            radius: LIGHTING.TORCH_LIGHT.RADIUS,
            intensity: LIGHTING.TORCH_LIGHT.INTENSITY,
            color: LIGHTING.TORCH_LIGHT.COLOR
        }));
    }
    
    /**
     * 检查点是否在墙壁上
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    isPointOnWall(x, y) {
        const wall = this.wallThickness;
        
        return x < wall || 
               x > this.width - wall || 
               y < wall || 
               y > this.height - wall;
    }
    
    /**
     * 检查点是否在门上
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    isPointOnDoor(x, y) {
        const doorWidth = this.doorSize;
        const doorHeight = this.wallThickness;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // 简化的门检测
        // 上门
        if (y >= 0 && y <= doorHeight) {
            if (x >= centerX - doorWidth / 2 && x <= centerX + doorWidth / 2) {
                return true;
            }
        }
        
        // 下门
        if (y >= this.height - doorHeight && y <= this.height) {
            if (x >= centerX - doorWidth / 2 && x <= centerX + doorWidth / 2) {
                return true;
            }
        }
        
        // 左门
        if (x >= 0 && x <= doorHeight) {
            if (y >= centerY - doorWidth / 2 && y <= centerY + doorWidth / 2) {
                return true;
            }
        }
        
        // 右门
        if (x >= this.width - doorHeight && x <= this.width) {
            if (y >= centerY - doorWidth / 2 && y <= centerY + doorWidth / 2) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 获取可活动区域
     */
    getPlayableArea() {
        return {
            x: this.wallThickness,
            y: this.wallThickness,
            width: this.width - this.wallThickness * 2,
            height: this.height - this.wallThickness * 2
        };
    }
}
