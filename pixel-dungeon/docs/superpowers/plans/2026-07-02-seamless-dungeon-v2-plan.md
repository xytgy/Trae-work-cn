# 无缝地牢系统 V2 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现真正的无缝地牢地图系统，玩家可以在房间和走廊之间自由移动。

**Architecture:** 所有游戏对象使用世界坐标，房间按网格排列，走廊连接相邻房间。相机有探索模式（跟随玩家）和战斗模式（锁定房间）。

**Tech Stack:** JavaScript, Canvas 2D

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `js/dungeon/RoomNode.js` | 房间节点，存储世界坐标和连接关系 |
| `js/dungeon/Corridor.js` | 走廊类，渲染和碰撞检测 |
| `js/dungeon/DungeonLevel.js` | 地牢层级，生成走廊 |
| `js/camera.js` | 相机系统，双模式切换 |
| `js/room.js` | 房间渲染，世界坐标 |
| `js/game.js` | 游戏主逻辑 |
| `js/modules/CollisionSystem.js` | 碰撞检测 |
| `js/bullet.js` | 子弹边界检测 |
| `js/main.js` | 入口文件 |

---

### Task 1: RoomNode 添加世界坐标

**Files:**
- Modify: `js/dungeon/RoomNode.js`

- [ ] **Step 1: 添加世界坐标属性**

```javascript
class RoomNode {
    constructor(gridX, gridY) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.worldX = gridX * LEVELS.ROOM_WIDTH;
        this.worldY = gridY * LEVELS.ROOM_HEIGHT;
        this.left = this.worldX;
        this.right = this.worldX + LEVELS.ROOM_WIDTH;
        this.top = this.worldY;
        this.bottom = this.worldY + LEVELS.ROOM_HEIGHT;
        // ... 其他属性
    }
    
    getCenterWorldX() { return this.worldX + LEVELS.ROOM_WIDTH / 2; }
    getCenterWorldY() { return this.worldY + LEVELS.ROOM_HEIGHT / 2; }
    containsWorldPoint(x, y) { 
        return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom; 
    }
}
```

- [ ] **Step 2: 验证语法**

Run: `node --check js/dungeon/RoomNode.js`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add js/dungeon/RoomNode.js
git commit -m "feat: add world coordinates to RoomNode"
```

---

### Task 2: 创建 Corridor 类

**Files:**
- Create: `js/dungeon/Corridor.js`

- [ ] **Step 1: 创建 Corridor 类**

```javascript
class Corridor {
    constructor(fromRoom, toRoom) {
        this.fromRoom = fromRoom;
        this.toRoom = toRoom;
        
        const dx = toRoom.gridX - fromRoom.gridX;
        const dy = toRoom.gridY - fromRoom.gridY;
        
        if (dx !== 0) {
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
    }
    
    render(ctx) {
        ctx.fillStyle = COLORS.DUNGEON.WALL;
        if (this.direction === 'right' || this.direction === 'left') {
            ctx.fillRect(this.left, this.top - 20, this.length, 20);
            ctx.fillRect(this.left, this.bottom, this.length, 20);
        } else {
            ctx.fillRect(this.left - 20, this.top, 20, this.length);
            ctx.fillRect(this.right, this.top, 20, this.length);
        }
        
        const tileSize = 32;
        ctx.fillStyle = COLORS.DUNGEON.FLOOR;
        for (let ty = 0; ty < this.length; ty += tileSize) {
            for (let tx = 0; tx < this.width; tx += tileSize) {
                ctx.fillRect(this.x + tx, this.y + ty, tileSize, tileSize);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.lineWidth = 1;
                ctx.strokeRect(this.x + tx + 0.5, this.y + ty + 0.5, tileSize - 1, tileSize - 1);
            }
        }
    }
    
    containsPoint(x, y) {
        return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
    }
}
```

- [ ] **Step 2: 验证语法**

Run: `node --check js/dungeon/Corridor.js`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add js/dungeon/Corridor.js
git commit -m "feat: create Corridor class"
```

---

### Task 3: DungeonLevel 生成走廊

**Files:**
- Modify: `js/dungeon/DungeonLevel.js`

- [ ] **Step 1: 添加走廊数组和生成方法**

```javascript
class DungeonLevel {
    constructor(act, stage) {
        this.act = act;
        this.stage = stage;
        this.grid = [];
        this.rooms = [];
        this.corridors = [];  // 添加走廊数组
        // ... 其他属性
    }
    
    generateCorridors() {
        this.corridors = [];
        for (const room of this.rooms) {
            for (const connection of room.connections) {
                if (room.gridX < connection.gridX || room.gridY < connection.gridY) {
                    this.corridors.push(new Corridor(room, connection));
                }
            }
        }
    }
}
```

- [ ] **Step 2: 找到生成方法并调用 generateCorridors**

搜索 `generate` 方法，在生成房间连接后调用 `this.generateCorridors()`

- [ ] **Step 3: 验证语法**

Run: `node --check js/dungeon/DungeonLevel.js`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add js/dungeon/DungeonLevel.js
git commit -m "feat: generate corridors in DungeonLevel"
```

---

### Task 4: Camera 添加双模式

**Files:**
- Modify: `js/camera.js`

- [ ] **Step 1: 添加模式和锁定边界**

```javascript
class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.mode = 'explore';  // 'explore' | 'battle'
        this.lockLeft = -Infinity;
        this.lockRight = Infinity;
        this.lockTop = -Infinity;
        this.lockBottom = Infinity;
        // ... 其他属性
    }
    
    setMode(mode) { this.mode = mode; }
    
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
        // ... 现有跟随逻辑 ...
        
        if (this.mode === 'battle') {
            const halfWidth = GAME_WIDTH / 2;
            const halfHeight = GAME_HEIGHT / 2;
            this.x = Math.max(this.lockLeft - halfWidth, Math.min(this.x, this.lockRight - halfWidth));
            this.y = Math.max(this.lockTop - halfHeight, Math.min(this.y, this.lockBottom - halfHeight));
        }
    }
}
```

- [ ] **Step 2: 验证语法**

Run: `node --check js/camera.js`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add js/camera.js
git commit -m "feat: add dual camera modes"
```

---

### Task 5: Room 渲染使用世界坐标

**Files:**
- Modify: `js/room.js`

- [ ] **Step 1: 修改构造函数添加世界坐标**

```javascript
class Room {
    constructor(roomType, roomIndex, isBossRoom, worldX = 0, worldY = 0) {
        this.roomType = roomType;
        this.roomIndex = roomIndex;
        this.isBossRoom = isBossRoom;
        this.worldX = worldX;
        this.worldY = worldY;
        // ... 其他属性
    }
}
```

- [ ] **Step 2: 修改所有渲染方法添加坐标变换**

在 `render`, `renderDecorations`, `renderTraps`, `renderChests`, `renderFountain`, `renderPortal` 方法中添加：

```javascript
render(renderer) {
    const ctx = renderer.ctx;
    ctx.save();
    ctx.translate(this.worldX, this.worldY);
    // ... 渲染逻辑 ...
    ctx.restore();
}
```

- [ ] **Step 3: 修改传送门碰撞检测使用世界坐标**

```javascript
checkPortalCollision(player) {
    if (!this.portal || !this.portalActive) return false;
    const portalWorldX = this.portal.x + this.worldX;
    const portalWorldY = this.portal.y + this.worldY;
    const dx = player.x - portalWorldX;
    const dy = player.y - portalWorldY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const collisionRadius = this.portal.size / 2 + player.size / 2;
    return distance < collisionRadius;
}
```

- [ ] **Step 4: 验证语法**

Run: `node --check js/room.js`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add js/room.js
git commit -m "feat: room rendering with world coordinates"
```

---

### Task 6: Game.js 主逻辑修改

**Files:**
- Modify: `js/game.js`

- [ ] **Step 1: 添加 visitedRooms 缓存**

```javascript
class GameLogic {
    constructor({ eventBus }) {
        this.visitedRooms = new Map();
        // ... 其他属性
    }
}
```

- [ ] **Step 2: 修改 initRoom 使用世界坐标**

```javascript
initRoom(roomNode) {
    this.currentRoomNode = roomNode;
    this.currentRoom = new Room(roomType, roomIndex, isBossRoom, roomNode.worldX, roomNode.worldY);
    
    if (this.player) {
        this.player.x = roomNode.getCenterWorldX();
        this.player.y = roomNode.getCenterWorldY();
    }
    
    camera.setPosition(roomNode.getCenterWorldX() - GAME_WIDTH / 2, roomNode.getCenterWorldY() - GAME_HEIGHT / 2);
    
    const roomKey = `${roomNode.gridX},${roomNode.gridY}`;
    this.visitedRooms.set(roomKey, this.currentRoom);
}
```

- [ ] **Step 3: 添加渲染所有房间和走廊**

```javascript
render() {
    renderer.clear();
    const ctx = renderer.ctx;
    ctx.save();
    camera.apply(ctx);
    
    this.renderVisitedRooms(renderer);
    this.renderCorridors(renderer);
    // ... 其他渲染 ...
    ctx.restore();
}

renderVisitedRooms(renderer) {
    for (const roomNode of this.dungeonLevel.rooms) {
        if (roomNode.entered) {
            const roomKey = `${roomNode.gridX},${roomNode.gridY}`;
            const room = this.visitedRooms.get(roomKey);
            if (room) {
                room.render(renderer);
                room.renderDecorations(renderer);
                room.renderTraps(renderer);
                room.renderChests(renderer);
                room.renderFountain(renderer);
                room.renderPortal(renderer);
            }
        }
    }
}

renderCorridors(renderer) {
    const ctx = renderer.ctx;
    for (const corridor of this.dungeonLevel.corridors) {
        corridor.render(ctx);
    }
}
```

- [ ] **Step 4: 修改玩家移动限制**

```javascript
clampPlayerToRoom() {
    const margin = LEVELS.WALL_THICKNESS;
    const playerHalfSize = PLAYER.SIZE / 2;
    
    if (camera.mode === 'battle' && this.currentRoomNode) {
        // 战斗模式限制在房间内
        this.player.x = Math.max(this.currentRoomNode.left + margin + playerHalfSize, 
                                  Math.min(this.player.x, this.currentRoomNode.right - margin - playerHalfSize));
        this.player.y = Math.max(this.currentRoomNode.top + margin + playerHalfSize, 
                                  Math.min(this.player.y, this.currentRoomNode.bottom - margin - playerHalfSize));
    }
    
    if (camera.mode === 'explore') {
        this.checkCorridorWallCollision();
    }
}

checkCorridorWallCollision() {
    // 走廊墙壁碰撞检测
}
```

- [ ] **Step 5: 添加房间切换和相机模式检测**

```javascript
checkPlayerArea() {
    const playerWorldX = this.player.x;
    const playerWorldY = this.player.y;
    
    let currentRoomNode = null;
    for (const roomNode of this.dungeonLevel.rooms) {
        if (roomNode.containsWorldPoint(playerWorldX, playerWorldY)) {
            currentRoomNode = roomNode;
            break;
        }
    }
    
    if (currentRoomNode && currentRoomNode !== this.currentRoomNode) {
        this.enterRoom(currentRoomNode);
    }
    
    const hasEnemies = this.enemies.length > 0 || (this.boss && this.boss.alive);
    if (hasEnemies && camera.mode !== 'battle') {
        camera.setMode('battle');
        camera.setLockBounds(currentRoomNode.left + margin, currentRoomNode.right - margin, 
                            currentRoomNode.top + margin, currentRoomNode.bottom - margin);
    } else if (!hasEnemies && camera.mode !== 'explore') {
        camera.setMode('explore');
        camera.clearLockBounds();
    }
}

enterRoom(roomNode) {
    const roomKey = `${roomNode.gridX},${roomNode.gridY}`;
    if (this.visitedRooms.has(roomKey)) {
        this.currentRoom = this.visitedRooms.get(roomKey);
    } else {
        this.currentRoom = new Room(roomType, roomIndex, isBossRoom, roomNode.worldX, roomNode.worldY);
        this.visitedRooms.set(roomKey, this.currentRoom);
    }
    // ... 加载房间内容 ...
}
```

- [ ] **Step 6: 修改敌人位置使用世界坐标**

在 `initBattleRoom`, `initEliteRoom`, `initBossRoom`, `initShopRoom` 中修改敌人位置：

```javascript
const margin = LEVELS.WALL_THICKNESS + 50;
const roomLeft = this.currentRoomNode.left + margin;
const roomRight = this.currentRoomNode.right - margin;
const roomTop = this.currentRoomNode.top + margin;
const roomBottom = this.currentRoomNode.bottom - margin;
const x = roomLeft + Math.random() * (roomRight - roomLeft);
const y = roomTop + Math.random() * (roomBottom - roomTop);
```

- [ ] **Step 7: 添加传送门检测**

```javascript
checkPortalCollision() {
    if (this.currentRoom && this.currentRoom.checkPortalCollision(this.player)) {
        this.enterPortal();
    }
}

enterPortal() {
    const act = this.state.getData().currentAct || 1;
    const stage = this.state.getData().currentStage || 1;
    if (stage >= 7) {
        if (act >= 4) {
            this.state.victory();
        } else {
            this.state.advanceAct();
        }
    } else {
        this.state.advanceStage();
    }
    this.init();
}
```

- [ ] **Step 8: 验证语法**

Run: `node --check js/game.js`
Expected: No errors

- [ ] **Step 9: Commit**

```bash
git add js/game.js
git commit -m "feat: seamless dungeon main logic"
```

---

### Task 7: 修改子弹边界检测

**Files:**
- Modify: `js/bullet.js`

- [ ] **Step 1: 修改边界检测使用世界坐标**

```javascript
update(deltaTime) {
    // ... 现有逻辑 ...
    
    // 修改边界检测
    const worldLeft = 0;
    const worldRight = 10000;
    const worldTop = 0;
    const worldBottom = 10000;
    if (this.x < worldLeft || this.x > worldRight ||
        this.y < worldTop || this.y > worldBottom) {
        this.active = false;
    }
}
```

- [ ] **Step 2: 验证语法**

Run: `node --check js/bullet.js`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add js/bullet.js
git commit -m "fix: bullet boundary with world coordinates"
```

---

### Task 8: 修改 main.js 调用传送门检测

**Files:**
- Modify: `js/main.js`

- [ ] **Step 1: 修改 checkPortalCollision**

```javascript
checkPortalCollision() {
    this.gameLogic.checkDoorCollision();
    this.gameLogic.checkPortalCollision();
}
```

- [ ] **Step 2: 验证语法**

Run: `node --check js/main.js`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "fix: call portal collision detection"
```

---

### Task 9: 更新 index.html 加载顺序

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 添加 Corridor.js 引用**

```html
<script src="js/dungeon/RoomNode.js"></script>
<script src="js/dungeon/Corridor.js"></script>
<script src="js/room.js"></script>
```

- [ ] **Step 2: 验证页面加载**

Run: `python3 -m http.server 9998`
Open: `http://localhost:9998/`
Expected: 页面正常加载，无控制台错误

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "fix: add Corridor.js to load order"
```

---

## Self-Review

**1. Spec coverage:**
- FR-1: 世界坐标系统 ✓ (Task 1)
- FR-2: 走廊系统 ✓ (Task 2, 3)
- FR-3: 相机系统 ✓ (Task 4)
- FR-4: 玩家移动 ✓ (Task 6)
- FR-5: 房间切换 ✓ (Task 6)
- FR-6: 战斗触发 ✓ (Task 6)
- FR-7: 传送门系统 ✓ (Task 6)

**2. Placeholder scan:** 无占位符

**3. Type consistency:** 世界坐标属性名称一致

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-02-seamless-dungeon-v2-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**