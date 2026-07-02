# 房间门洞通道与相机平滑过渡系统 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现房间之间可见的门洞通道和相机平滑过渡效果，替代当前"触碰边缘→硬传送→瞬间黑屏"的体验

**Architecture:** 保持房间级独立渲染（800×600），过门时相机从当前房间中心平滑移动到目标房间中心（400ms 缓入缓出），过渡期间同时渲染两个房间，玩家输入锁定。

**Tech Stack:** HTML5 Canvas, JavaScript, Web Audio API

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `js/camera.js` | 相机系统，新增过渡动画属性和方法 |
| `js/game.js` | 游戏逻辑，修改房间切换和渲染流程 |
| `js/dungeon/RoomRenderer.js` | 房间渲染，修改墙体绘制支持门洞 |
| `js/dungeon/DoorManager.js` | 门禁系统，支持已清空房间不锁门 |

---

### Task 1: 相机过渡系统（camera.js）

**Files:**
- Modify: `js/camera.js`

**AC Addressed:** AC-2, AC-3, AC-4

**Test Requirements:**
- `human-judgment`: 相机过渡流畅，400ms 内完成，缓入缓出效果明显

**Implementation:**

- [ ] **Step 1: 新增过渡动画属性**

```javascript
class Camera {
    constructor() {
        // ... 现有属性 ...
        
        // === 新增：房间过渡 ===
        this.transitioning = false;        // 是否正在过门过渡
        this.transitionStartX = 0;          // 过渡起始 X
        this.transitionStartY = 0;          // 过渡起始 Y
        this.transitionTargetX = 0;         // 过渡目标 X
        this.transitionTargetY = 0;         // 过渡目标 Y
        this.transitionDuration = 500;      // 过渡时长（毫秒）
        this.transitionTimer = 0;           // 过渡计时器
        this.onTransitionComplete = null;   // 过渡完成回调
    }
    // ... 现有方法 ...
}
```

- [ ] **Step 2: 新增 startTransition() 方法**

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
```

- [ ] **Step 3: 修改 update() 方法支持过渡插值**

```javascript
update(deltaTime) {
    this.updateShake(deltaTime);
    
    if (this.transitioning) {
        this.transitionTimer += deltaTime;
        const progress = Math.min(this.transitionTimer / this.transitionDuration, 1);
        
        // 缓入缓出
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

- [ ] **Step 4: 修改 reset() 方法重置过渡属性**

```javascript
reset() {
    this.x = 0;
    this.y = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
    this.followTarget = null;
    this.enableFollow = false;
    // === 新增 ===
    this.transitioning = false;
    this.transitionTimer = 0;
    this.onTransitionComplete = null;
}
```

---

### Task 2: 门洞系统（RoomRenderer.js）

**Files:**
- Modify: `js/dungeon/RoomRenderer.js`

**AC Addressed:** AC-1

**Test Requirements:**
- `human-judgment`: 有门的方向墙体断开，有门框装饰和地面光晕引导

**Implementation:**

- [ ] **Step 1: 修改 drawWalls() 支持门洞**

```javascript
drawWalls(ctx, colors, roomNode) {
    const doorWidth = this.doorSize;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    // 上墙
    if (!roomNode.hasDoor(DOOR.TOP)) {
        this.drawBrickWall(ctx, 0, 0, this.width, this.wallThickness, 'top', colors);
    } else {
        this.drawBrickWall(ctx, 0, 0, centerX - doorWidth / 2, this.wallThickness, 'top', colors);
        this.drawBrickWall(ctx, centerX + doorWidth / 2, 0, this.width - centerX - doorWidth / 2, this.wallThickness, 'top', colors);
    }
    
    // 下墙
    if (!roomNode.hasDoor(DOOR.BOTTOM)) {
        this.drawBrickWall(ctx, 0, this.height - this.wallThickness, this.width, this.wallThickness, 'bottom', colors);
    } else {
        this.drawBrickWall(ctx, 0, this.height - this.wallThickness, centerX - doorWidth / 2, this.wallThickness, 'bottom', colors);
        this.drawBrickWall(ctx, centerX + doorWidth / 2, this.height - this.wallThickness, this.width - centerX - doorWidth / 2, this.wallThickness, 'bottom', colors);
    }
    
    // 左墙
    if (!roomNode.hasDoor(DOOR.LEFT)) {
        this.drawBrickWall(ctx, 0, 0, this.wallThickness, this.height, 'left', colors);
    } else {
        this.drawBrickWall(ctx, 0, 0, this.wallThickness, centerY - doorWidth / 2, 'left', colors);
        this.drawBrickWall(ctx, 0, centerY + doorWidth / 2, this.wallThickness, this.height - centerY - doorWidth / 2, 'left', colors);
    }
    
    // 右墙
    if (!roomNode.hasDoor(DOOR.RIGHT)) {
        this.drawBrickWall(ctx, this.width - this.wallThickness, 0, this.wallThickness, this.height, 'right', colors);
    } else {
        this.drawBrickWall(ctx, this.width - this.wallThickness, 0, this.wallThickness, centerY - doorWidth / 2, 'right', colors);
        this.drawBrickWall(ctx, this.width - this.wallThickness, centerY + doorWidth / 2, this.wallThickness, this.height - centerY - doorWidth / 2, 'right', colors);
    }
}
```

- [ ] **Step 2: 修改 preRenderBackground() 传递 roomNode**

```javascript
preRenderBackground(roomNode) {
    if (!roomNode) return;

    const colors = this.getThemeColors(roomNode.roomType);

    this.backgroundCanvas = document.createElement('canvas');
    this.backgroundCanvas.width = this.width;
    this.backgroundCanvas.height = this.height;
    this.backgroundCtx = this.backgroundCanvas.getContext('2d');

    this.generateFloorTiles(colors);
    this.generateDecorations(roomNode.roomType);

    const ctx = this.backgroundCtx;

    ctx.fillStyle = colors.backgroundColor;
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawFloorPattern(ctx);
    this.drawWalls(ctx, colors, roomNode);  // 传递 roomNode
    this.drawDoors(ctx, roomNode, colors);
    this.drawDoorGlows(ctx, roomNode, colors);  // 新增门洞光晕
}
```

- [ ] **Step 3: 新增 drawDoorGlows() 方法**

```javascript
drawDoorGlows(ctx, roomNode, colors) {
    const doorWidth = this.doorSize;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const glowSize = 40;
    
    const drawGlow = (cx, cy, direction) => {
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.2)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
        ctx.fillStyle = gradient;
        
        let rectX, rectY, rectW, rectH;
        if (direction === 'top') {
            rectX = cx - glowSize;
            rectY = this.wallThickness - 5;
            rectW = glowSize * 2;
            rectH = glowSize;
        } else if (direction === 'bottom') {
            rectX = cx - glowSize;
            rectY = this.height - this.wallThickness - glowSize + 5;
            rectW = glowSize * 2;
            rectH = glowSize;
        } else if (direction === 'left') {
            rectX = this.wallThickness - 5;
            rectY = cy - glowSize;
            rectW = glowSize;
            rectH = glowSize * 2;
        } else {
            rectX = this.width - this.wallThickness - glowSize + 5;
            rectY = cy - glowSize;
            rectW = glowSize;
            rectH = glowSize * 2;
        }
        ctx.fillRect(rectX, rectY, rectW, rectH);
    };
    
    if (roomNode.hasDoor(DOOR.TOP)) {
        drawGlow(centerX, this.wallThickness, 'top');
    }
    if (roomNode.hasDoor(DOOR.BOTTOM)) {
        drawGlow(centerX, this.height - this.wallThickness, 'bottom');
    }
    if (roomNode.hasDoor(DOOR.LEFT)) {
        drawGlow(this.wallThickness, centerY, 'left');
    }
    if (roomNode.hasDoor(DOOR.RIGHT)) {
        drawGlow(this.width - this.wallThickness, centerY, 'right');
    }
}
```

---

### Task 3: 房间切换逻辑（game.js）

**Files:**
- Modify: `js/game.js`

**AC Addressed:** AC-2, AC-3, AC-4

**Test Requirements:**
- `human-judgment`: 过渡期间输入锁定，双房间渲染连贯

**Implementation:**

- [ ] **Step 1: 新增 inputLocked 和 pendingRoomNode 属性**

在 `GameLogic` 构造函数中添加：

```javascript
this.inputLocked = false;           // 输入锁定标志
this.pendingRoomNode = null;        // 待切换的目标房间
```

- [ ] **Step 2: 修改 updatePlayer() 检查输入锁定**

```javascript
updatePlayer(deltaTime) {
    if (this.inputLocked) return;  // 过门时锁住输入
    // ... 现有移动逻辑 ...
}
```

- [ ] **Step 3: 修改 changeRoom() 使用相机过渡**

```javascript
changeRoom(nextRoomNode) {
    if (!nextRoomNode || !this.dungeonLevel) return;

    const currentNode = this.currentRoomNode;
    if (currentNode) {
        const roomType = currentNode.roomType;
        const requiresClear = roomType === ROOM_TYPES.BATTLE || 
                              roomType === ROOM_TYPES.ELITE || 
                              roomType === ROOM_TYPES.BOSS;
        
        if (requiresClear && !currentNode.cleared) {
            console.log(`当前房间 [${currentNode.gridX},${currentNode.gridY}] 未清空，无法切换`);
            return;
        }
    }

    this.pendingRoomNode = nextRoomNode;
    this.inputLocked = true;

    const fromX = currentNode ? currentNode.gridX * LEVELS.ROOM_WIDTH : 0;
    const fromY = currentNode ? currentNode.gridY * LEVELS.ROOM_HEIGHT : 0;
    const toX = nextRoomNode.gridX * LEVELS.ROOM_WIDTH;
    const toY = nextRoomNode.gridY * LEVELS.ROOM_HEIGHT;

    camera.startTransition(fromX, fromY, toX, toY, 400, () => {
        this.currentRoomNode = nextRoomNode;
        nextRoomNode.markEntered();
        this.initRoom(nextRoomNode);
        this.inputLocked = false;
        this.pendingRoomNode = null;

        const roomType = nextRoomNode.roomType;
        if (roomType === ROOM_TYPES.BOSS) {
            this.state.data.currentLevel = 7;
        }

        this.player.x = GAME_WIDTH / 2;
        this.player.y = GAME_HEIGHT / 2;

        camera.setPosition(toX, toY);
        camera.setFollowTarget(this.player);

        this.eventBus.publish('ROOM_CHANGED', {
            fromRoom: currentNode,
            toRoom: nextRoomNode,
            roomType: roomType
        });

        console.log(`切换到房间 [${nextRoomNode.gridX},${nextRoomNode.gridY}] - 类型: ${nextRoomNode.getRoomTypeName()}`);
    });
}
```

- [ ] **Step 4: 修改 render() 支持过渡期双房间渲染**

```javascript
render() {
    renderer.clear();
    
    const ctx = renderer.ctx;
    
    ctx.save();
    camera.apply(ctx);
    
    if (camera.transitioning && this.currentRoomNode && this.pendingRoomNode) {
        // 过渡期间：渲染当前房间
        if (this.currentRoom) {
            this.currentRoom.render(renderer);
            this.currentRoom.renderDecorations(renderer);
            this.currentRoom.renderTraps(renderer);
            this.currentRoom.renderChests(renderer);
            this.currentRoom.renderFountain(renderer);
        }
        
        // 渲染目标房间（偏移到目标房间坐标）
        const offsetX = (this.pendingRoomNode.gridX - this.currentRoomNode.gridX) * LEVELS.ROOM_WIDTH;
        const offsetY = (this.pendingRoomNode.gridY - this.currentRoomNode.gridY) * LEVELS.ROOM_HEIGHT;
        
        ctx.save();
        ctx.translate(offsetX, offsetY);
        
        // 预渲染目标房间背景
        if (!this.pendingRoom) {
            this.pendingRoom = new RoomRenderer();
        }
        this.pendingRoom.preRenderBackground(this.pendingRoomNode);
        ctx.drawImage(this.pendingRoom.backgroundCanvas, 0, 0);
        this.pendingRoom.renderDecorations(ctx);
        
        ctx.restore();
    } else {
        // 正常单房间渲染
        if (this.currentRoom) {
            this.currentRoom.render(renderer);
            
            this.currentRoom.renderDecorations(renderer);
            
            this.currentRoom.renderTraps(renderer);
            
            this.currentRoom.renderChests(renderer);
            
            this.currentRoom.renderFountain(renderer);
        }
    }
    
    // 渲染传送门
    if (this.currentRoom) {
        this.currentRoom.renderPortal(renderer);
    }
    
    // 渲染武器掉落
    this.renderWeaponDrop();
    
    // 渲染粒子（底层）
    this.renderParticles();
    
    // 渲染敌人
    this.renderEnemies();
    
    // 渲染Boss
    this.renderBoss();
    
    // 渲染目标指示器
    this.renderTargetIndicator(ctx);
    
    // 渲染子弹
    this.renderBullets();
    
    // 渲染玩家
    this.renderPlayer();
    
    ctx.restore();
    
    // 更新光源（玩家光圈 + 火把光源）
    this.updateLights();
    
    // 渲染光影效果（在所有游戏元素之后，不受相机影响）
    renderer.renderLighting();
    
    // 渲染伤害数字（不受相机影响）
    this.renderDamageNumbers(renderer.ctx);
    
    // 渲染拾取文字（不受相机影响）
    this.renderPickupTexts(renderer.ctx);
    
    // 渲染调试信息
    renderer.drawDebugInfo({
        'Enemies': this.enemies.length,
        'Bullets': this.bullets.length,
        'Particles': this.particles.length,
        'Boss HP': this.boss ? this.boss.health : 'N/A',
        'TimeScale': this.timeManager.timeScale.toFixed(2),
        'Shake': camera.getCurrentShakeIntensity().toFixed(1),
        'Transition': camera.transitioning ? 'IN PROGRESS' : 'IDLE'
    });
}
```

---

### Task 4: Backroom 支持（DoorManager.js）

**Files:**
- Modify: `js/dungeon/DoorManager.js`

**AC Addressed:** AC-5

**Test Requirements:**
- `human-judgment`: 已清空战斗房返回时门保持开启，不再生成敌人

**Implementation:**

- [ ] **Step 1: 修改 onPlayerEnterRoom() 检查 cleared 状态**

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

- [ ] **Step 2: 修改 game.js 的 initRoom() 检查 cleared 状态**

```javascript
initRoom(roomNode) {
    // ... 现有清理逻辑 ...
    
    if (roomNode.cleared) {
        console.log(`房间 [${roomNode.gridX},${roomNode.gridY}] 已清空，跳过敌人生成`);
        return;
    }
    
    // ... 现有敌人生成逻辑 ...
}
```

---

### Task 5: 精英房难度调整（game.js）

**Files:**
- Modify: `js/game.js`

**AC Addressed:** AC-6

**Test Requirements:**
- `human-judgment`: 精英怪更容易击杀，伤害与普通敌人相同

**Implementation:**

- [ ] **Step 1: 查找并修改 initEliteRoom() 中的精英倍率**

```javascript
// 找到类似如下代码并修改：
const eliteStatMult = { health: 1.5, damage: 1.2, speed: 1.1 };

// 改为：
const eliteStatMult = { health: 1.2, damage: 1.0, speed: 1.05 };
```

---

## 测试计划

### 验证检查点

1. **门洞可见性** ✅
   - 进入有门的房间，确认墙体断开形成开口
   - 确认有门框装饰
   - 确认有地面光晕引导

2. **过渡流畅性** ✅
   - 穿过门，确认相机平滑移动（400ms 缓入缓出）
   - 确认画面持续连贯，无黑屏或跳帧
   - 确认过渡期双房间同时可见

3. **输入锁定** ✅
   - 过渡期间尝试移动，确认输入被忽略
   - 过渡期间尝试射击，确认输入被忽略

4. **Backroom 支持** ✅
   - 清空战斗房后返回，确认门保持开启
   - 确认不再生成敌人

5. **精英房难度** ✅
   - 进入精英房，确认精英怪血量降低（约 3 枪打死）
   - 确认精英怪伤害与普通敌人相同

---

## 执行说明

按照任务顺序执行，每个任务完成后进行测试验证。建议使用 subagent 异步执行每个任务。