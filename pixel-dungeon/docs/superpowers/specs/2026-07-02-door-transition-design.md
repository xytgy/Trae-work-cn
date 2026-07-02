# 像素地牢：房间门洞通道与相机平滑过渡系统 — 设计文档

## Overview
- **Summary**: 实现房间之间可见的门洞通道和相机平滑过渡效果，替代当前"触碰边缘→硬传送→瞬间黑屏"的体验
- **Purpose**: 提升游戏视觉体验和沉浸感，使房间切换更加流畅自然
- **Target Users**: 所有游戏玩家

## Goals
- 房间墙体上显示可见的门洞开口，玩家能直观看到"那里可以过去"
- 过门时相机平滑过渡，画面持续连贯不黑屏
- 支持回到已清空的房间（backroom）
- 降低精英房难度，提升游戏平衡性

## Non-Goals (Out of Scope)
- 不引入大地图模式，保持房间级独立渲染
- 不改变整体游戏架构
- 不修改 dungeon 系统的核心数据结构

## Background & Context
- 当前房间切换：`checkDoorCollision()` 检测玩家在边缘 60px 以内 → 调用 `changeRoom()` → 玩家瞬移到新房间中心 → 相机瞬移到 (0,0)
- 当前门洞：`drawWalls()` 在四边都绘制完整砖墙，`drawDoors()` 只在"没有门"的位置画封闭门，有门的位置被砖墙填满，玩家看不到门的开口
- 房间尺寸：800×600，5×5 网格布局

## Functional Requirements
- **FR-1**: 房间墙体上有可见的门洞开口（墙体断开）
- **FR-2**: 门洞位置有门框装饰和地面光晕引导
- **FR-3**: 过门时相机平滑过渡（400ms 缓入缓出）
- **FR-4**: 过渡期间同时渲染两个房间（当前房间 + 目标房间）
- **FR-5**: 过渡期间锁定玩家输入
- **FR-6**: 已清空的战斗房/精英房/Boss房保持门开启，支持返回
- **FR-7**: 精英房难度降低（血量 1.5→1.2，伤害 1.2→1.0，速度 1.1→1.05）

## Non-Functional Requirements
- **NFR-1**: 过渡动画流畅，无卡顿或跳帧
- **NFR-2**: 保持像素风格视觉一致性
- **NFR-3**: 不破坏已有的 dungeon 系统和游戏逻辑

## Constraints
- **Technical**: 房间仍是独立 800×600 单元，不合并成大地图
- **Dependencies**: 依赖现有 RoomRenderer、Camera、GameLogic、DoorManager 模块

## Assumptions
- 玩家理解"地面光晕"暗示可通行
- 过渡时间 400ms 足够让玩家感知到画面变化
- 已清空房间的敌人状态正确保存

## Acceptance Criteria

### AC-1: 可见门洞
- **Given**: 房间有门（例如上方向门）
- **When**: 玩家进入该房间
- **Then**: 墙体在门的位置断开形成开口，有门框装饰和地面光晕
- **Verification**: `human-judgment`

### AC-2: 相机平滑过渡
- **Given**: 玩家靠近开着的门
- **When**: 玩家进入门阈值区域
- **Then**: 相机在 400ms 内平滑移动到目标房间，画面持续连贯
- **Verification**: `human-judgment`

### AC-3: 过渡期双房间渲染
- **Given**: 相机正在过渡中
- **When**: 渲染帧
- **Then**: 当前房间和目标房间同时可见，无明显断层或闪烁
- **Verification**: `human-judgment`

### AC-4: 输入锁定
- **Given**: 相机正在过渡中
- **When**: 玩家尝试移动或射击
- **Then**: 输入被忽略，玩家位置不变
- **Verification**: `human-judgment`

### AC-5: Backroom 支持
- **Given**: 战斗房已清空
- **When**: 玩家返回该房间
- **Then**: 门保持开启，不再生成敌人
- **Verification**: `human-judgment`

### AC-6: 精英房难度降低
- **Given**: 玩家进入精英房
- **When**: 战斗开始
- **Then**: 精英怪血量约为基础的 1.2 倍，伤害与普通敌人相同，速度略微提升
- **Verification**: `human-judgment`

## Open Questions
- [x] 门洞视觉风格：已确认方案 C（墙体断开 + 门框装饰 + 地面光晕）
- [x] 相机过渡模式：已确认方案 A（房间级硬切换 + 相机平滑插值）
- [x] 实现方法：已确认方法 1（单相机双房间渲染）

## 实现方案

### 一、门洞系统（RoomRenderer.js）

**改动**：
1. 修改 `drawWalls()`：在有门的方向，墙体断开形成开口
2. 新增 `drawDoorFrame()`：在门洞边缘画门框装饰
3. 新增 `drawDoorGlow()`：在门洞底部画地面光晕引导

**关键代码逻辑**：
```javascript
drawWalls(ctx, colors, roomNode) {
    // 上墙 - 有门时断开
    if (!roomNode.hasDoor(DOOR.TOP)) {
        this.drawBrickWall(ctx, 0, 0, this.width, this.wallThickness, 'top', colors);
    } else {
        // 画两段墙，中间留出门洞
        const doorWidth = this.doorSize;
        const centerX = this.width / 2;
        this.drawBrickWall(ctx, 0, 0, centerX - doorWidth / 2, this.wallThickness, 'top', colors);
        this.drawBrickWall(ctx, centerX + doorWidth / 2, 0, this.width - centerX - doorWidth / 2, this.wallThickness, 'top', colors);
    }
    // 下墙、左墙、右墙同理...
}
```

### 二、相机平滑过渡（camera.js）

**改动**：
1. 新增过渡动画属性：`transitioning`、`transitionStartX/Y`、`transitionTargetX/Y`、`transitionDuration`、`transitionTimer`、`onTransitionComplete`
2. 新增 `startTransition(fromX, fromY, toX, toY, duration, onComplete)` 方法
3. 修改 `update()`：过渡期间优先处理插值，完成后调用回调

**关键代码逻辑**：
```javascript
startTransition(fromX, fromY, toX, toY, duration, onComplete) {
    this.transitioning = true;
    this.transitionStartX = fromX;
    this.transitionStartY = fromY;
    this.transitionTargetX = toX;
    this.transitionTargetY = toY;
    this.transitionDuration = duration || 500;
    this.transitionTimer = 0;
    this.onTransitionComplete = onComplete || null;
}

update(deltaTime) {
    this.updateShake(deltaTime);
    
    if (this.transitioning) {
        this.transitionTimer += deltaTime;
        const progress = Math.min(this.transitionTimer / this.transitionDuration, 1);
        const eased = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        this.x = this.transitionStartX + (this.transitionTargetX - this.transitionStartX) * eased;
        this.y = this.transitionStartY + (this.transitionTargetY - this.transitionStartY) * eased;
        
        if (progress >= 1) {
            this.transitioning = false;
            this.x = this.transitionTargetX;
            this.y = this.transitionTargetY;
            if (this.onTransitionComplete) {
                this.onTransitionComplete();
                this.onTransitionComplete = null;
            }
        }
    } else {
        this.updateFollow(deltaTime);
    }
}
```

### 三、双房间渲染（game.js）

**改动**：
1. 修改 `changeRoom()`：保存 pendingRoomNode，启动相机过渡
2. 修改 `render()`：过渡期间同时渲染当前房间和目标房间
3. 新增 `inputLocked`：过渡期间锁定玩家输入
4. 修改 `updatePlayer()`：检查 inputLocked

**关键代码逻辑**：
```javascript
changeRoom(nextRoomNode) {
    // ... 安全检查 ...
    
    this.pendingRoomNode = nextRoomNode;
    this.inputLocked = true;
    
    const fromX = this.currentRoomNode.gridX * LEVELS.ROOM_WIDTH;
    const fromY = this.currentRoomNode.gridY * LEVELS.ROOM_HEIGHT;
    const toX = nextRoomNode.gridX * LEVELS.ROOM_WIDTH;
    const toY = nextRoomNode.gridY * LEVELS.ROOM_HEIGHT;
    
    camera.startTransition(fromX, fromY, toX, toY, 400, () => {
        this.currentRoomNode = nextRoomNode;
        nextRoomNode.markEntered();
        this.initRoom(nextRoomNode);
        this.inputLocked = false;
        
        // 玩家放在目标房间的入口位置
        this.player.x = this.getRoomEntrancePosition(nextRoomNode, this.currentRoomNode);
        this.player.y = GAME_HEIGHT / 2;
        
        camera.setPosition(nextRoomNode.gridX * LEVELS.ROOM_WIDTH, nextRoomNode.gridY * LEVELS.ROOM_HEIGHT);
        camera.setFollowTarget(this.player);
    });
}

render() {
    renderer.clear();
    const ctx = renderer.ctx;
    
    camera.apply(ctx);
    
    if (camera.transitioning && this.currentRoomNode && this.pendingRoomNode) {
        // 渲染当前房间
        this.currentRoom.render(renderer);
        // 渲染目标房间（偏移到目标房间坐标）
        const offsetX = (this.pendingRoomNode.gridX - this.currentRoomNode.gridX) * LEVELS.ROOM_WIDTH;
        const offsetY = (this.pendingRoomNode.gridY - this.currentRoomNode.gridY) * LEVELS.ROOM_HEIGHT;
        ctx.save();
        ctx.translate(offsetX, offsetY);
        this.pendingRoom.render(renderer);
        ctx.restore();
    } else {
        // 正常单房间渲染
        this.currentRoom.render(renderer);
    }
    
    // ... 其余渲染 ...
    ctx.restore();
}
```

### 四、Backroom 支持（DoorManager.js）

**改动**：
1. 修改 `onPlayerEnterRoom()`：检查 `roomNode.cleared`，已清空的房间不锁门

**关键代码逻辑**：
```javascript
onPlayerEnterRoom(roomNode) {
    if (roomNode.cleared) return;
    
    const roomType = roomNode.roomType;
    if (roomType === ROOM_TYPES.BATTLE ||
        roomType === ROOM_TYPES.ELITE ||
        roomType === ROOM_TYPES.BOSS) {
        const directions = roomNode.getDoorDirections();
        for (const direction of directions) {
            this.closeAndLockDoor(roomNode, direction);
        }
    }
}
```

### 五、精英房难度调整（game.js）

**改动**：
1. 修改 `initEliteRoom()`：降低精英怪属性倍率

**关键代码逻辑**：
```javascript
// 当前：
const eliteStatMult = { health: 1.5, damage: 1.2, speed: 1.1 };

// 改为：
const eliteStatMult = { health: 1.2, damage: 1.0, speed: 1.05 };
```

## 文件改动清单

| 文件 | 改动内容 |
|------|----------|
| `camera.js` | 新增过渡动画属性和 `startTransition()` 方法；修改 `update()` 支持过渡插值 |
| `game.js` | 重写 `changeRoom()` 使用相机过渡；修改 `render()` 支持过渡期双房间渲染；新增 `inputLocked` 和 `pendingRoomNode`；修改 `updatePlayer()` 检查输入锁定；修改 `initEliteRoom()` 降低精英难度 |
| `RoomRenderer.js` | 修改 `drawWalls()` 在有门的方向留出门洞；新增 `drawDoorFrame()` 和 `drawDoorGlow()`；修改 `preRenderBackground()` 传递 roomNode |
| `DoorManager.js` | 修改 `onPlayerEnterRoom()` 检查 `roomNode.cleared`，已清空不锁门 |

## 测试计划

1. **门洞可见性测试**：进入有门的房间，确认墙体断开、有门框和光晕
2. **过渡流畅性测试**：穿过门，确认相机平滑移动，无黑屏或跳帧
3. **输入锁定测试**：过渡期间尝试移动，确认输入被忽略
4. **Backroom 测试**：清空战斗房后返回，确认门开启且无敌人
5. **精英房难度测试**：进入精英房，确认精英怪更容易击杀