# 像素地牢：元气骑士风格地牢地图系统 — Trae 执行提示

## 任务概述

实现一套《元气骑士》风格的 2D Roguelike 地牢地图系统，替代当前传送门式房间切换。**必须先写设计文档，再执行代码。**

## 项目路径

`/Users/xytgy/Downloads/software/Trae-work-cn/pixel-dungeon/`

## 对应设计文档

**必读：** `docs/superpowers/specs/2026-07-02-soul-knight-dungeon-system-design.md`

## 当前代码库相关现状

### 现有系统（需要理解再改动）

- **Room 类**（`room.js`，1311 行）— 管理单个房间的地砖、装饰、陷阱、宝箱。每个房间通过 `new Room(roomType, roomIndex, isBossRoom)` 创建。有 `initBackground()` 预渲染静态背景、`generateDecorations()` 生成装饰物、`render()` 绘制背景、`checkRoomCompleted()` 检查房间完成状态
- **GameLogic 房间切换**（`game.js`）— `initRoom()` 创建房间、`nextRoom()` 递增 level 并调用 `initRoom()`、`checkRoomClear()` 清空后生成传送门
- **Camera 类**（`camera.js`，142 行）— 已有 `followTarget` + `updateFollow` + `apply(ctx)` 相机变换，但当前未被启用（相机固定在 0,0）
- **渲染**（`game.js` 的 `render()`）— 渲染当前房间背景、装饰、陷阱、宝箱、传送门、粒子、敌人、Boss、子弹、玩家，按固定层次
- **边界**（`game.js` `clampPlayerToRoom()`）— 玩家限制在 `GAME_WIDTH/GAME_HEIGHT` 内
- **关卡数据**（`state.js`）— `currentLevel`、`nextLevel()` 递增
- **Route Select**（已在 `game.js` + `ui.js` + `main.js` 实现）— 第二间房清空后出现三选一路线选择，这个**需要与新的地牢系统整合**

### 已修复的问题（不要还原）

（略去，与现有 TRAE_STABILITY_POLISH.md 一致）

---

## 执行流程

### 阶段 0：写设计文档（已写好，直接读）

先阅读设计文档 `docs/superpowers/specs/2026-07-02-soul-knight-dungeon-system-design.md` 和所有核心文件，根据实际情况可能需要调整设计。

### 阶段 1：基础数据结构

1. 新建 `js/dungeon/` 目录
2. 新建 `RoomNode.js` — 房间节点类（gridX, gridY, roomType, doors bitmask, connections, enemies, cleared, entered, hasPortal）
3. 新建 `DungeonLevel.js` — 关卡数据类（act, stage, grid[5][5], rooms[], currentRoom, currentRoomNode）
4. 新建 `DungeonGenerator.js` — 生成器类：
   - 5×5 空网格
   - 主路径生成（初始房 → 2/3 个小怪房 → 传送门/Boss房）
   - 分支生成（随机挂在基础小怪房侧面）
   - 连通性校验（BFS 确保所有房间可达，失败则重试）
   - 分支类型随机分配

### 阶段 2：房间渲染适配

1. 新建 `RoomRenderer.js` — 从 Room 类中提取渲染逻辑，适配 RoomNode
2. 新建 `DoorManager.js` — 门禁状态管理：
   - 房间踏入时关门锁死
   - 清空敌人时开门
   - 初始房入口默认关闭
   - 非战斗房门默认开启
3. 新建 `Minimap.js` — 小地图渲染：
   - 5×5 网格缩略显示
   - 已进入房间亮色、已连通未进入灰色、未探索黑色
   - 玩家位置小点
   - 特殊房黄色「!」标记
   - 离开初始房后可见

### 阶段 3：GameLogic 改造

1. 移除旧 `initRoom()` 中的房间创建逻辑（保留敌人生成等）
2. 新增 `DungeonLevel` 驱动的房间切换流程：
   - `GameLogic` 持有 `DungeonLevel` 实例
   - 玩家穿门时调用 `changeRoom(nextRoomNode)`
   - `changeRoom()`：更新 `currentRoomNode`、`Camera` 锁定新房间中心、触发门禁逻辑、激活敌人
3. 门禁碰撞检测：玩家靠近门位置时检测→进入下一房间
4. Boss 房特殊处理：击败 Boss 后出传送门 + 金色宝箱

### 阶段 4：相机改造

1. 启用 `camera.setFollowTarget(null)` — 改为直接设置位置 `camera.setPosition(roomCenterX, roomCenterY)`
2. 房间切换时：相机立即硬切换到新房间中心（无平滑过渡）
3. 震动功能保留不变

### 阶段 5：大关主题与数据分层

1. 在 `constants.js` 中新增 `ACT_THEMES` 配置
2. 每大关有独立主题色、敌人池、Boss、难度
3. 玩家状态在跨关时继承
4. 每大关开始随机抽取主题

### 阶段 6：测试

1. 生成连通性测试（反复生成 100 次验证无孤立房间）
2. 全流程测试：4 大关 × 5 小关，从初始房到 Boss 房完整打通
3. 门禁逻辑测试：战斗房踏入自动关门、清空自动开门、非战斗房门常开
4. 小地图测试：迷雾逻辑、位置标记、特殊房标记

---

## 约束条件

- 所有代码使用原生 JavaScript（ES6+），无框架依赖
- Canvas 2D，不引入 WebGL
- 不添加 npm 包或 CDN 资源
- 保持像素风格
- **不能破坏已有的功能修复**
- **不能破坏路线选择（Route Select）功能**，将其整合到新的地牢系统中
- 房间尺寸：小型（640×480）、中型（800×600）、大型（960×720），兼容 800×600 画布
