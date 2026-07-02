# 像素地牢：房间门洞通道与相机平滑过渡系统 — Trae 执行提示

**必须先写设计文档，再执行代码。**

## 任务概述

当前房间之间切换是"触碰边缘→硬传送→瞬间黑屏"式体验。需要改为：
1. 房间之间有**可见的门洞/通道**，玩家能看到"那里可以过去"
2. 穿过门时**相机平滑过渡**，画面持续连贯不黑屏

## 项目路径

`/Users/xytgy/Downloads/software/Trae-work-cn/pixel-dungeon/`

## 当前实现分析

### 现有 dungeon 系统（已实现）

`js/dungeon/` 下已有 6 个文件（RoomNode、DungeonLevel、DungeonGenerator、DoorManager、Minimap、RoomRenderer），game.js 也已接入。

### 当前房间切换的代码路径

1. **`game.js:742` `checkDoorCollision()`** — 每帧检测玩家位置：
   - 玩家在房间边缘 60px 以内 → 判断方向上有门且门是开的 → 调用 `changeRoom()`
   
2. **`game.js:697` `changeRoom(nextRoomNode)`** — 切换房间：
   ```js
   this.player.x = GAME_WIDTH / 2;    // 玩家瞬移到新房间中心
   this.player.y = GAME_HEIGHT / 2;
   camera.setPosition(0, 0);          // 相机瞬移到(0,0)
   camera.setFollowTarget(this.player);
   this.initRoom(nextRoomNode);       // 重新初始化房间（清空/重建敌人等）
   ```

3. **`camera.js:57` `setPosition(x, y)`** — 直接设置相机位置，无过渡

### 需要做的改动

---

## 一、房间墙体上的门洞

### 1.1 当前问题

`RoomRenderer.js:241` `drawDoors()` 的逻辑是：
- 如果房间**没有**上方向的门 → 画一堵实心墙
- 如果房间**有**上方向的门 → 留空（不画墙）

但墙体画在**预渲染背景**上的，门洞位置已经画了墙砖，所以门洞被墙砖填满了。玩家看不到门的开口。

### 1.2 修复方案

在 `RoomRenderer.js` 的 `drawWalls()` 方法中，**有门的方向不画墙砖**（留出门洞的空白）：

```javascript
drawWalls(ctx, colors) {
    // 上墙 - 只在没有上方向门时画
    if (!roomNode.hasDoor(DOOR.TOP)) {
        this.drawBrickWall(ctx, 0, 0, this.width, this.wallThickness, 'top', colors);
    } else {
        // 有上方向门：画两段墙，中间留出门洞
        const doorWidth = this.doorSize;
        const centerX = this.width / 2;
        // 左段墙
        this.drawBrickWall(ctx, 0, 0, centerX - doorWidth / 2, this.wallThickness, 'top', colors);
        // 右段墙
        this.drawBrickWall(ctx, centerX + doorWidth / 2, 0, this.width - centerX - doorWidth / 2, this.wallThickness, 'top', colors);
        // 门洞底部装饰
        ctx.fillStyle = colors.wallColor;
        ctx.fillRect(centerX - doorWidth / 2, this.wallThickness - 4, doorWidth, 4);
    }
    // 下墙、左墙、右墙同理...
}
```

### 1.3 门洞视觉增强

在门洞位置加地面阴影/光效，暗示"这里可以走"：

```javascript
// 在 drawDoors 中，有门的地方画地面引导光
drawDoorGlow(ctx, roomNode, doorManager) {
    if (!roomNode.hasDoor(direction)) return;
    const state = doorManager?.getDoorState(roomNode, direction);
    if (state === 'locked') return;
    
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.15)');
    gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(cx - 40, cy - 5, 80, 10);
}
```

---

## 二、相机平滑过门过渡

### 2.1 核心思路

不是把世界变成一整张大地图。房间仍是独立 800×600。
过门时：

```
阶段 1（玩家靠近门）：检测到玩家在门阈值内 → 启动过门
阶段 2（过渡动画 500ms）：相机从当前房间中心 → 目标房间中心，平滑插值
阶段 3（过渡完成）：更新 currentRoomNode，初始化新房间敌人
```

### 2.2 Camera 类改动

新增过渡动画属性：

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
}
```

### 2.3 房间中心坐标计算

房间中心 = 网格坐标 × 房间尺寸 + 房间半宽：

```javascript
getRoomCenter(roomNode) {
    return {
        x: roomNode.gridX * ROOM_WIDTH + ROOM_WIDTH / 2,
        y: roomNode.gridY * ROOM_HEIGHT + ROOM_HEIGHT / 2
    };
}
```

| 房间位置 | gridX,gridY | 中心 X |
|---------|-------------|--------|
| 第一列 | 0, y | 400 |
| 第二列 | 1, y | 1200 |
| 第三列 | 2, y | 2000 |
| 第四列 | 3, y | 2800 |
| 第五列 | 4, y | 3600 |

### 2.4 GameLogic changeRoom 改动

过渡期间需要同时渲染两个房间（当前房间 + 目标房间的可见部分）。`render()` 方法在相机过渡期间不重建场景：

```javascript
changeRoom(nextRoomNode) {
    if (!nextRoomNode || !this.dungeonLevel) return;
    
    // 安全检查：当前战斗房是否已清空
    const currentNode = this.currentRoomNode;
    if (currentNode) {
        const requiresClear = currentNode.roomType === ROOM_TYPES.BATTLE || 
                              currentNode.roomType === ROOM_TYPES.ELITE || 
                              currentNode.roomType === ROOM_TYPES.BOSS;
        if (requiresClear && !currentNode.cleared) {
            return;
        }
    }
    
    // 保存目标房间引用（过渡完成后真正初始化）
    this.pendingRoomNode = nextRoomNode;
    
    // 计算两个房间的中心坐标
    const fromX = currentNode.gridX * ROOM_WIDTH;
    const fromY = currentNode.gridY * ROOM_HEIGHT;
    const toX = nextRoomNode.gridX * ROOM_WIDTH;
    const toY = nextRoomNode.gridY * ROOM_HEIGHT;
    
    // 锁住玩家输入
    this.inputLocked = true;
    
    // 启动相机过渡
    camera.startTransition(fromX, fromY, toX, toY, 400, () => {
        // 过渡完成 → 真正初始化新房间
        this.currentRoomNode = nextRoomNode;
        nextRoomNode.markEntered();
        this.initRoom(nextRoomNode);
        this.inputLocked = false;
        
        // 玩家放在目标房间的入口位置（不要放中心）
        this.player.x = this.getRoomEntrancePosition(nextRoomNode, currentNode);
        this.player.y = GAME_HEIGHT / 2;
    });
}
```

### 2.5 渲染改造（过渡期间双房间）

在 `game.js` 的 `render()` 中：

```javascript
render() {
    renderer.clear();
    const ctx = renderer.ctx;
    
    camera.apply(ctx);  // 应用相机变换（此时如果正在过渡，相机在两个房间中间）
    
    if (camera.transitioning && this.currentRoomNode && this.pendingRoomNode) {
        // 过渡期间：两个房间都渲染
        // 画当前房间
        this.currentRoom.render(renderer);
        // 画目标房间（相移到目标房间坐标偏移）
        // ... 渲染目标房间的背景 ...
    } else {
        // 正常单房间渲染
        this.currentRoom.render(renderer);
        // ... 其余渲染 ...
    }
    
    // 恢复画布状态
    // UI 渲染（不受相机影响）
    uiManager.render();
}
```

---

## 三、过门时玩家输入锁定

玩家穿过门到目标房间的过程中，应该短暂锁定移动输入（避免玩家在半空中往回走）：

```javascript
// 在 updatePlayer 中
updatePlayer(deltaTime) {
    if (this.inputLocked) return;  // 过门时锁住输入
    // ... 正常移动 ...
}
```

---

## 四、backroom 支持（回到已清空的房间）

DoorManager 的门禁逻辑要支持**已清空的战斗房门保持开启**：

```javascript
onPlayerEnterRoom(roomNode) {
    // 如果房间已经清空，不锁门
    if (roomNode.cleared) return;
    
    // 未清空的战斗房/精英房/Boss房才锁门
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

回到已清空的房间时，`initRoom` 应该检查 `roomNode.cleared`，如果已清空就不生成敌人。

---

## 五、新增/修改文件清单

| 文件 | 改动 |
|------|------|
| `camera.js` | 新增 `startTransition()`、`transitioning` 属性、缓动插值逻辑 |
| `game.js` | 重写 `changeRoom()` 使用相机过渡；`checkDoorCollision()` 调整触发逻辑；`render()` 支持过渡期双房间渲染；新增 `inputLocked` |
| `RoomRenderer.js` | `drawWalls()` 在有门的方向留出门洞；新增门洞光晕装饰 |
| `DoorManager.js` | `onPlayerEnterRoom()` 检查 `roomNode.cleared`，已清空不锁门 |
| `renderer.js` | 无需改动（`renderer.clear()` + 相机 `apply` 已支持） |

---

## 六、约束条件

- 不改整体架构（不引入大地图）
- 房间间过渡只在碰撞/门禁判定通过后触发
- 过渡期间游戏逻辑暂停（玩家输入锁定、敌人不更新）
- 过渡完成后才初始化新房间敌人并锁门
- 保持像素风格
- 不破坏已有的 dungeon 系统

---

## 七、精英房难度调整

精英房（红色的那个房间）当前配置：
- 精英怪血量：基础血量 × 1.5（精英倍率） × 房间进度倍率 × 难度倍率
- 精英怪伤害：基础伤害 × 1.2（精英倍率） × 房间进度倍率 × 难度倍率  
- 小兵：2 个（噩梦难度 3 个）
- 被击中时触发大范围屏幕震动

### 降低方案

修改 `game.js` 的 `initEliteRoom()` 方法：

```javascript
// 当前（太强）：
const eliteStatMult = { health: 1.5, damage: 1.2, speed: 1.1 };

// 改为（降低）：
const eliteStatMult = { health: 1.2, damage: 1.0, speed: 1.05 };
```

具体改动：
1. 精英怪血量加成从 1.5 → 1.2（更容易打死）
2. 精英怪伤害加成从 1.2 → 1.0（和普通敌人一样）
3. 精英怪速度加成从 1.1 → 1.05（稍微慢一点，好躲）

### 效果对比

| 属性 | 改前 | 改后 |
|------|------|------|
| 精英血量 | 基础 × 1.5 | 基础 × 1.2 |
| 精英伤害 | 基础 × 1.2 | 基础 × 1.0 |
| 精英速度 | 基础 × 1.1 | 基础 × 1.05 |
| 小兵数量 | 2 个 | 2 个（不变） |

简单难度下精英房的实际表现：
- 精英血量 ≈ 3（基础 2 × 1.2 × 0.7 简单倍率 × 1.0 房间进度）→ 3 枪打死
- 精英伤害 = 1（和普通敌人一样）
- 小兵 2 个，各 1-2 枪打死
