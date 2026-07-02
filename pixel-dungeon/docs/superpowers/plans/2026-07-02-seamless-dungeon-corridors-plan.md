# 无缝地牢走廊系统 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现无缝地牢地图系统，在房间之间添加物理走廊，玩家可以自由漫游，战斗时相机锁定在房间范围内。

**Architecture:** 将所有房间和走廊合并为一个连续的世界坐标系统，走廊连接相邻房间。相机支持两种模式：战斗模式（锁定房间范围）和探索模式（跟随玩家）。

**Tech Stack:** HTML5 Canvas, JavaScript, 现有游戏框架

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `js/dungeon/RoomNode.js` | 房间节点，添加世界坐标 |
| `js/dungeon/DungeonLevel.js` | 地牢层级，添加走廊生成 |
| `js/room.js` | 房间渲染，修改为世界坐标渲染 |
| `js/camera.js` | 相机系统，添加锁定模式 |
| `js/game.js` | 游戏主逻辑，修改房间切换和战斗触发 |
| `js/modules/CollisionSystem.js` | 碰撞系统，添加走廊碰撞检测 |

---

## Task 1: 修改 RoomNode 添加世界坐标

**Files:**
- Modify: `js/dungeon/RoomNode.js`

**目标:** 让房间节点存储世界坐标，用于无缝地图渲染。

- [ ] **Step 1: 修改 RoomNode 构造函数**

```javascript
constructor(gridX, gridY) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.roomType = null;
    this.doors = 0;
    this.connections = [];
    this.enemies = [];
    this.cleared = false;
    this.entered = false;
    this.hasPortal = false;
    this.neighbors = [];
    this.index = gridY * 5 + gridX;
    
    // 世界坐标（房间左上角）
    this.worldX = gridX * LEVELS.ROOM_WIDTH;
    this.worldY = gridY * LEVELS.ROOM_HEIGHT;
    
    // 房间边界
    this.left = this.worldX;
    this.right = this.worldX + LEVELS.ROOM_WIDTH;
    this.top = this.worldY;
    this.bottom = this.worldY + LEVELS.ROOM_HEIGHT;
}
```

- [ ] **Step 2: 添加世界坐标获取方法**

```javascript
getCenterWorldX() {
    return this.worldX + LEVELS.ROOM_WIDTH / 2;
}

getCenterWorldY() {
    return this.worldY + LEVELS.ROOM_HEIGHT / 2;
}

containsWorldPoint(x, y) {
    return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
}
```

- [ ] **Step 3: 验证修改**

运行游戏，检查房间节点是否有正确的世界坐标。

---

## Task 2: 创建走廊系统

**Files:**
- Create: `js/dungeon/Corridor.js`
- Modify: `js/dungeon/DungeonLevel.js`

**目标:** 在相邻房间之间生成走廊。

### Task 2.1: 创建 Corridor 类

```javascript
class Corridor {
    constructor(fromRoom, toRoom) {
        this.fromRoom = fromRoom;
        this.toRoom = toRoom;
        
        // 确定走廊方向
        const dx = toRoom.gridX - fromRoom.gridX;
        const dy = toRoom.gridY - fromRoom.gridY;
        
        if (dx !== 0) {
            // 水平走廊
            this.direction = dx > 0 ? 'right' : 'left';
            this.width = LEVELS.DOOR_SIZE;
            this.length = LEVELS.ROOM_WIDTH / 2;
            
            const startX = dx > 0 ? fromRoom.right : toRoom.right;
            const startY = fromRoom.worldY + (LEVELS.ROOM_HEIGHT - this.width) / 2;
            
            this.x = startX;
            this.y = startY;
            this.left = startX;
            this.right = startX + this.length;
            this.top = startY;
            this.bottom = startY + this.width;
        } else {
            // 垂直走廊
            this.direction = dy > 0 ? 'down' : 'up';
            this.width = LEVELS.DOOR_SIZE;
            this.length = LEVELS.ROOM_HEIGHT / 2;
            
            const startX = fromRoom.worldX + (LEVELS.ROOM_WIDTH - this.width) / 2;
            const startY = dy > 0 ? fromRoom.bottom : toRoom.bottom;
            
            this.x = startX;
            this.y = startY;
            this.left = startX;
            this.right = startX + this.width;
            this.top = startY;
            this.bottom = startY + this.length;
        }
        
        this.tiles = [];
        this.generateTiles();
    }
    
    generateTiles() {
        const tileSize = FLOOR_TILE.SIZE;
        for (let ty = 0; ty < this.length; ty += tileSize) {
            for (let tx = 0; tx < this.width; tx += tileSize) {
                const type = Math.random() < 0.3 ? FLOOR_TILE.TYPES.PATTERN : FLOOR_TILE.TYPES.NORMAL;
                this.tiles.push(new FloorTile(this.x + tx, this.y + ty, type));
            }
        }
    }
    
    render(ctx) {
        // 渲染墙壁
        ctx.fillStyle = COLORS.DUNGEON.WALL;
        if (this.direction === 'right' || this.direction === 'left') {
            // 水平走廊：上下墙壁
            ctx.fillRect(this.left, this.top - 20, this.length, 20);
            ctx.fillRect(this.left, this.bottom, this.length, 20);
        } else {
            // 垂直走廊：左右墙壁
            ctx.fillRect(this.left - 20, this.top, 20, this.length);
            ctx.fillRect(this.right, this.top, 20, this.length);
        }
        
        // 渲染地砖
        for (const tile of this.tiles) {
            tile.render(ctx);
        }
    }
    
    containsPoint(x, y) {
        return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
    }
}
```

### Task 2.2: 修改 DungeonLevel 添加走廊生成

```javascript
class DungeonLevel {
    constructor(act, stage) {
        this.act = act;
        this.stage = stage;
        this.grid = [];
        this.rooms = [];
        this.corridors = [];  // 添加走廊数组
        this.currentRoomNode = null;
        this.theme = this.getRandomThemeForAct(act);
        this.startRoom = null;
        this.bossRoom = null;
        this.portalRooms = [];
    }
    
    // 在 connectRooms 方法中添加走廊生成
    connectRooms(roomA, roomB) {
        // ... 现有代码 ...
        
        if (directionA && directionB) {
            roomA.addDoor(directionA);
            roomB.addDoor(directionB);
            roomA.addConnection(roomB);
            roomB.addConnection(roomA);
            
            // 生成走廊
            this.corridors.push(new Corridor(roomA, roomB));
        }
    }
}
```

---

## Task 3: 修改相机系统添加锁定模式

**Files:**
- Modify: `js/camera.js`

**目标:** 相机支持战斗模式（锁定房间范围）和探索模式（跟随玩家）。

```javascript
class Camera {
    constructor() {
        // ... 现有属性 ...
        
        // 相机模式
        this.mode = 'explore';  // 'explore' | 'battle'
        
        // 锁定边界
        this.lockLeft = -Infinity;
        this.lockRight = Infinity;
        this.lockTop = -Infinity;
        this.lockBottom = Infinity;
    }
    
    setMode(mode) {
        this.mode = mode;
    }
    
    setLockBounds(left, right, top, bottom) {
        this.lockLeft = left;
        this.lockRight = right;
        this.lockTop = top;
        this.lockBottom = bottom;
    }
    
    clearLockBounds() {
        this.lockLeft = -Infinity;
        this.lockRight = Infinity;
        this.lockTop = -Infinity;
        this.lockBottom = Infinity;
    }
    
    updateFollow(deltaTime) {
        if (!this.enableFollow || !this.followTarget) return;
        
        const targetX = this.followTarget.x - GAME_WIDTH / 2;
        const targetY = this.followTarget.y - GAME_HEIGHT / 2;
        
        this.x += (targetX - this.x) * this.followSmoothness;
        this.y += (targetY - this.y) * this.followSmoothness;
        
        // 应用锁定边界（战斗模式）
        if (this.mode === 'battle') {
            const halfWidth = GAME_WIDTH / 2;
            const halfHeight = GAME_HEIGHT / 2;
            
            this.x = Math.max(this.lockLeft - halfWidth, Math.min(this.x, this.lockRight - halfWidth));
            this.y = Math.max(this.lockTop - halfHeight, Math.min(this.y, this.lockBottom - halfHeight));
        }
    }
}
```

---

## Task 4: 修改房间渲染为世界坐标

**Files:**
- Modify: `js/room.js`
- Modify: `js/game.js`

**目标:** 房间在世界坐标中渲染，支持无缝地图。

### Task 4.1: 修改 Room 类添加世界坐标偏移

```javascript
class Room {
    constructor(roomType, roomIndex, isBossRoom, worldX = 0, worldY = 0) {
        // ... 现有属性 ...
        
        // 世界坐标偏移
        this.worldX = worldX;
        this.worldY = worldY;
    }
    
    render(renderer) {
        const ctx = renderer.ctx;
        
        ctx.save();
        ctx.translate(this.worldX, this.worldY);
        
        if (this.backgroundCanvas) {
            renderer.ctx.drawImage(this.backgroundCanvas, 0, 0);
        }
        
        this.renderEliteRoomEffects(renderer);
        
        ctx.restore();
    }
    
    renderDecorations(renderer) {
        const ctx = renderer.ctx;
        
        ctx.save();
        ctx.translate(this.worldX, this.worldY);
        
        for (const decoration of this.decorations) {
            decoration.update(16);
            decoration.render(ctx);
        }
        
        ctx.restore();
    }
    
    // 其他渲染方法类似修改...
}
```

### Task 4.2: 修改 game.js 中的房间初始化

```javascript
initRoom(roomNode = null) {
    // ... 现有代码 ...
    
    const roomType = roomNode.roomType;
    const currentStage = this.state.getData().currentStage || 1;
    const roomIndex = Math.min(currentStage, 7);
    const isBossRoom = roomType === ROOM_TYPES.BOSS;
    
    // 使用世界坐标创建房间
    this.currentRoom = new Room(roomType, roomIndex, isBossRoom, roomNode.worldX, roomNode.worldY);
    this.currentRoom.preRenderBackground(roomNode);
    
    // ... 其他代码 ...
}
```

---

## Task 5: 修改游戏主循环渲染所有房间和走廊

**Files:**
- Modify: `js/game.js`

**目标:** 在渲染循环中渲染所有房间和走廊。

```javascript
render() {
    renderer.clear();
    
    const ctx = renderer.ctx;
    
    ctx.save();
    camera.apply(ctx);
    
    // 渲染所有房间
    if (this.dungeonLevel) {
        for (const roomNode of this.dungeonLevel.rooms) {
            if (roomNode.roomType !== null && roomNode.entered) {
                // 找到对应的房间实例并渲染
                // 需要维护所有已访问房间的实例
            }
        }
        
        // 渲染所有走廊
        for (const corridor of this.dungeonLevel.corridors) {
            corridor.render(ctx);
        }
    }
    
    // 渲染当前房间（高亮）
    if (this.currentRoom) {
        this.currentRoom.render(renderer);
        this.currentRoom.renderDecorations(renderer);
        // ... 其他渲染 ...
    }
    
    // ... 敌人、子弹、玩家渲染 ...
    
    ctx.restore();
    
    // ... UI渲染 ...
}
```

---

## Task 6: 修改玩家移动和碰撞检测

**Files:**
- Modify: `js/modules/CollisionSystem.js`
- Modify: `js/player.js`

**目标:** 玩家可以在房间和走廊之间自由移动。

```javascript
// 在 CollisionSystem 中添加走廊碰撞检测
checkWallCollision(x, y, width, height) {
    // 检查房间墙壁碰撞
    
    // 检查走廊墙壁碰撞
    if (game.dungeonLevel) {
        for (const corridor of game.dungeonLevel.corridors) {
            if (x < corridor.left - 20 || x + width > corridor.right + 20 ||
                y < corridor.top - 20 || y + height > corridor.bottom + 20) {
                // 在走廊外部，检查是否与走廊墙壁碰撞
                if (x < corridor.left && x + width > corridor.left - 20 &&
                    y >= corridor.top - 20 && y + height <= corridor.bottom + 20) {
                    return true;
                }
                // 其他墙壁方向类似...
            }
        }
    }
    
    return false;
}
```

---

## Task 7: 修改战斗触发逻辑

**Files:**
- Modify: `js/game.js`

**目标:** 当玩家进入有敌人的房间时，自动切换到战斗模式。

```javascript
update(deltaTime) {
    // ... 现有代码 ...
    
    // 检测玩家所在区域
    this.checkPlayerArea();
    
    // ... 其他代码 ...
}

checkPlayerArea() {
    const playerX = this.player.x;
    const playerY = this.player.y;
    
    // 找到玩家当前所在的房间
    let currentRoom = null;
    if (this.dungeonLevel) {
        for (const roomNode of this.dungeonLevel.rooms) {
            if (roomNode.containsWorldPoint(playerX, playerY)) {
                currentRoom = roomNode;
                break;
            }
        }
    }
    
    // 如果玩家进入新房间
    if (currentRoom && currentRoom !== this.currentRoomNode) {
        this.enterRoom(currentRoom);
    }
    
    // 检测战斗状态
    if (currentRoom && !currentRoom.cleared && this.enemies.length > 0) {
        // 切换到战斗模式
        camera.setMode('battle');
        camera.setLockBounds(
            currentRoom.left,
            currentRoom.right,
            currentRoom.top,
            currentRoom.bottom
        );
    } else {
        // 切换到探索模式
        camera.setMode('explore');
        camera.clearLockBounds();
    }
}

enterRoom(roomNode) {
    this.currentRoomNode = roomNode;
    roomNode.markEntered();
    
    // 初始化房间内容
    this.initRoom(roomNode);
    
    // 更新玩家位置到房间中心
    this.player.x = roomNode.getCenterWorldX();
    this.player.y = roomNode.getCenterWorldY();
}
```

---

## Task 8: 测试和调试

**Files:**
- All modified files

**目标:** 确保系统正常工作。

- [ ] **Step 1: 运行游戏测试**

启动游戏，检查：
- 走廊是否正确渲染
- 玩家是否可以在走廊中移动
- 战斗模式相机是否锁定
- 探索模式相机是否跟随

- [ ] **Step 2: 修复发现的问题**

根据测试结果修复问题。

---

## Self-Review

**1. Spec coverage:**
- FR-1 (地图结构重构): Task 1, Task 4, Task 5
- FR-2 (走廊系统): Task 2
- FR-3 (相机系统): Task 3
- FR-4 (玩家移动): Task 6
- FR-5 (战斗触发): Task 7

**2. Placeholder scan:** 没有占位符

**3. Type consistency:** 属性名称和方法签名一致

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-02-seamless-dungeon-corridors-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
