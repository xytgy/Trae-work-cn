# 像素地牢：枪战冒险 — 第一阶段（架构加固）设计规格

## 概述

**目标**: 将现有代码从"能跑通的个人 Demo"重构为"可支撑长期迭代的稳固技术底座"

**核心原则**:
- 解耦优先：模块间通过事件总线通信，禁止直接引用
- 数据驱动：所有游戏配置提取为 JSON 文件
- 依赖注入：通过构造函数注入依赖，避免全局变量
- 可测试性：每个模块可独立测试，不依赖其他模块

---

## 执行顺序（按优先级调整）

1. **事件总线（EventBus）** — 基础设施，必须最先实现
2. **数据驱动配置** — 提取 JSON 配置文件
3. **模块化重构** — 拆分 GameLogic 类
4. **存档系统** — localStorage/IndexedDB 存档机制
5. **输入抽象层** — 封装输入系统

---

## 子任务 1: 事件总线（EventBus）

### 目标
实现中心化事件系统，解耦模块间的直接依赖

### 技术方案

```
类名: EventBus
方法:
  - subscribe(eventName, callback)    // 订阅事件
  - unsubscribe(eventName, callback)  // 取消订阅
  - publish(eventName, data)          // 发布事件
  - once(eventName, callback)         // 单次订阅
  - clear(eventName)                  // 清除某事件所有订阅者
```

### 核心事件定义

| 事件名 | 触发时机 | 数据结构 | 监听者 |
|--------|----------|----------|--------|
| `ENEMY_KILLED` | 敌人死亡 | `{ enemy, killer }` | RageSystem, ScoreSystem, ParticleSystem |
| `PLAYER_HURT` | 玩家受伤 | `{ damage, attacker }` | RageSystem, CameraShake, ParticleSystem |
| `WEAPON_PICKUP` | 拾取武器 | `{ weapon, player }` | UIManager, AudioManager |
| `SKILL_USED` | 使用技能 | `{ skill, player }` | RageSystem, ParticleSystem |
| `ROOM_CLEARED` | 房间清除 | `{ roomIndex, player }` | SaveSystem, UIManager |
| `BOSS_SPAWN` | Boss 出现 | `{ boss }` | AudioManager, Camera |
| `BOSS_DEATH` | Boss 死亡 | `{ boss }` | TimeManager, ParticleSystem, AudioManager |
| `ACHIEVEMENT_UNLOCKED` | 成就解锁 | `{ achievement }` | UIManager, SaveSystem |
| `GOLD_EARNED` | 获得金币 | `{ amount }` | UIManager, AchievementSystem |
| `BUFF_APPLIED` | 应用 Buff | `{ buff, target }` | ParticleSystem |

### 预期改动文件

- `js/modules/EventBus.js` — 新建事件总线模块
- `js/game.js` — 修改，使用事件总线替代直接调用
- `js/player.js` — 修改，使用事件总线
- `js/enemy.js` — 修改，使用事件总线

### 验收标准

1. 敌人死亡事件通过事件总线广播，怒气系统、得分系统、粒子系统各自响应
2. 模块间无直接依赖，可独立测试
3. 同一事件可被多个订阅者监听
4. 支持取消订阅，避免内存泄漏

---

## 子任务 2: 数据驱动配置

### 目标
将所有角色、武器、敌人、技能、关卡的数值参数提取为 JSON 配置文件

### 技术方案

```
目录结构:
config/
  ├── characters.json   # 24角色配置
  ├── weapons.json      # 8武器配置
  ├── enemies.json      # 8敌人配置
  ├── skills.json       # 技能配置（主动+被动）
  ├── levels.json       # 关卡配置
  ├── bosses.json       # Boss配置
  └── traps.json        # 陷阱配置

类名: ConfigLoader
方法:
  - loadAll()                  // 加载所有配置
  - getCharacter(id)           // 获取角色配置
  - getWeapon(id)              // 获取武器配置
  - getEnemy(type)             // 获取敌人配置
  - getSkill(id)               // 获取技能配置
  - getLevel(index)            // 获取关卡配置
  - reload()                   // 重新加载配置（开发模式）
```

### 配置文件格式

**characters.json** 示例:
```json
{
  "knight": {
    "id": 1,
    "name": "骑士",
    "category": "warrior",
    "stats": { "survivability": 4, "damage": 2, "speed": 2 },
    "activeSkill": "shield",
    "passiveSkill": "damage_reduction",
    "color": "#4fc3f7"
  }
}
```

**weapons.json** 示例:
```json
{
  "pistol": {
    "id": 1,
    "name": "手枪",
    "damage": 1,
    "fireRate": 270,
    "ammo": null,
    "maxAmmo": null,
    "bulletSpeed": 8,
    "recoil": 3,
    "color": "#ffd54f",
    "icon": "🔫"
  }
}
```

### 预期改动文件

- `config/characters.json` — 新建
- `config/weapons.json` — 新建
- `config/enemies.json` — 新建
- `config/skills.json` — 新建
- `config/levels.json` — 新建
- `js/config/ConfigLoader.js` — 新建配置加载器
- `js/constants.js` — 修改，移除硬编码数据，保留通用常量

### 验收标准

1. 新增角色只需修改 JSON 配置，不碰主代码
2. 开发模式下修改配置文件后自动热加载
3. 配置加载失败时有优雅的错误处理和默认值回退
4. 配置数据可被多个模块共享访问

---

## 子任务 3: 模块化重构

### 目标
将 GameLogic 类拆分为独立模块，每个模块职责单一

### 模块拆分方案

| 模块 | 职责 | 新文件路径 |
|------|------|------------|
| CollisionSystem | 碰撞检测（AABB）、碰撞响应 | `js/modules/CollisionSystem.js` |
| DamageSystem | 伤害计算、击退效果、伤害数字 | `js/modules/DamageSystem.js` |
| DropSystem | 掉落物生成、拾取检测 | `js/modules/DropSystem.js` |
| AchievementSystem | 成就检测、解锁、统计 | `js/modules/AchievementSystem.js` |
| RoomManager | 房间管理、敌人生成、传送门 | `js/modules/RoomManager.js` |
| BulletManager | 子弹更新、回收、碰撞 | `js/modules/BulletManager.js` |
| ParticleManager | 粒子生成、更新、回收、对象池 | `js/modules/ParticleManager.js` |

### GameLogic 简化后职责

- 协调各模块
- 游戏主循环调度
- 状态管理
- 玩家引用

### 预期改动文件

- `js/modules/CollisionSystem.js` — 新建
- `js/modules/DamageSystem.js` — 新建
- `js/modules/DropSystem.js` — 新建
- `js/modules/AchievementSystem.js` — 新建
- `js/modules/RoomManager.js` — 新建
- `js/modules/BulletManager.js` — 新建
- `js/modules/ParticleManager.js` — 新建
- `js/game.js` — 修改，简化为协调者角色

### 验收标准

1. GameLogic 类代码量减少 50% 以上（从 ~2000 行降至 <1000 行）
2. 每个模块可独立测试，不依赖其他模块
3. 通过依赖注入获取所需服务
4. 游戏功能完全保持不变

---

## 子任务 4: 存档系统

### 目标
实现完整的存档机制，支持自动存档、手动存档、多存档槽位、数据版本迁移

### 技术方案

```
类名: SaveSystem
方法:
  - save(slotIndex)            // 保存到指定槽位
  - load(slotIndex)            // 从指定槽位加载
  - delete(slotIndex)          // 删除存档
  - getSaveInfo(slotIndex)     // 获取存档信息（时间、进度、角色）
  - hasSave(slotIndex)         // 检查是否有存档
  - autoSave()                 // 自动存档

存档数据结构:
{
  "version": "1.0",           // 存档版本，用于迁移
  "timestamp": 1234567890,    // 存档时间戳
  "characterId": 1,           // 角色ID
  "difficulty": "normal",     // 难度
  "currentLevel": 3,          // 当前关卡
  "playerHealth": 3,          // 玩家生命值
  "gold": 120,                // 金币
  "killCount": 45,            // 击杀数
  "survivalTime": 180,        // 存活时间
  "weapons": [1, 3],          // 当前武器ID列表
  "relics": [2, 5],           // 遗物列表
  "buffs": [],                // 当前Buff列表
  "achievements": [1, 5, 8],  // 已解锁成就
  "completed": false          // 是否通关
}
```

### 版本迁移机制

- 每次存档包含版本号
- 加载时检测版本号，如果低于当前版本，执行迁移函数
- 迁移函数按版本顺序执行，确保数据兼容性

### 预期改动文件

- `js/modules/SaveSystem.js` — 新建存档系统
- `js/ui/saveMenu.js` — 新建存档选择UI
- `js/game.js` — 修改，集成存档系统
- `js/ui.js` — 修改，添加存档菜单入口

### 验收标准

1. 支持 3 个存档槽位
2. 每房间通关后自动存档
3. 手动存档/读档无数据丢失
4. 存档版本迁移机制，更新后旧存档仍可读取
5. 存档数据加密存储（简单 Base64 + 校验和）

---

## 子任务 5: 输入抽象层

### 目标
封装输入系统，支持键盘、鼠标，并预留手柄/触屏扩展接口

### 技术方案

```
类名: InputSystem
方法:
  - update(deltaTime)           // 更新输入状态
  - getMovementVector()         // 获取移动向量
  - isKeyPressed(key)           // 检查按键是否按下
  - isKeyJustPressed(key)       // 检查按键是否刚刚按下
  - isMouseDown(button)         // 检查鼠标按键是否按下
  - getMousePosition()          // 获取鼠标位置
  - getMouseWorldPosition()     // 获取鼠标在游戏世界的位置
  - onKeyDown(callback)         // 注册按键按下回调
  - onKeyUp(callback)           // 注册按键释放回调
  - onMouseDown(callback)       // 注册鼠标按下回调
  - onMouseUp(callback)         // 注册鼠标释放回调
  - setDeadZone(value)          // 设置摇杆死区（手柄）

输入映射配置（JSON）:
{
  "moveUp": ["KeyW", "ArrowUp"],
  "moveDown": ["KeyS", "ArrowDown"],
  "moveLeft": ["KeyA", "ArrowLeft"],
  "moveRight": ["KeyD", "ArrowRight"],
  "shoot": ["MouseLeft"],
  "skill1": ["KeyE"],
  "skill2": ["KeyR"],
  "weaponSwitch": ["KeyQ"],
  "pause": ["KeyP", "Escape"]
}
```

### 输入缓冲机制

- 支持输入缓冲（Input Buffer），防止按键丢失
- 缓冲时间可配置（默认 100ms）
- 支持的操作：冲刺、射击、技能、武器切换、互动

### 手柄支持

- 预留手柄接口（Gamepad API）
- 支持震动反馈（按事件类型：射击、受伤、拾取、爆炸）
- 摇杆死区配置

### 预期改动文件

- `js/modules/InputSystem.js` — 新建输入抽象层
- `config/input.json` — 新建输入映射配置
- `js/input.js` — 修改，适配新接口
- `js/game.js` — 修改，使用新输入系统

### 验收标准

1. 键盘、鼠标输入通过统一接口
2. 输入缓冲机制有效，防止快速操作丢失
3. 预留手柄/触屏扩展接口
4. 输入映射可配置，支持自定义按键

---

## 通用技术规范

### 依赖注入模式

所有模块通过构造函数获取依赖，禁止直接访问全局变量：

```javascript
// 错误方式（当前）
class GameLogic {
    constructor() {
        this.player = new Player();
        this.state = gameState;
    }
}

// 正确方式（重构后）
class GameLogic {
    constructor({ player, state, eventBus, collisionSystem }) {
        this.player = player;
        this.state = state;
        this.eventBus = eventBus;
        this.collisionSystem = collisionSystem;
    }
}
```

### 错误处理规范

- 所有异步操作（配置加载、存档读写）必须有错误处理
- 关键操作失败时有降级方案和默认值
- 使用 try-catch 包裹可能抛出异常的代码
- 错误信息输出到 console，但不影响游戏运行

### 日志规范

- 分类日志：`console.log('[EVENT] 事件名')`、`console.warn('[WARN] 警告信息')`、`console.error('[ERROR] 错误信息')`
- 生产环境可关闭调试日志
- 关键流程（状态切换、模块初始化）必须有日志

### 代码风格规范

- 函数最大长度：300 行
- 变量命名：驼峰式（camelCase）
- 常量命名：大写蛇形（UPPER_CASE_WITH_UNDERSCORES）
- 类命名：帕斯卡式（PascalCase）
- 注释：每个函数必须有 JSDoc 注释，复杂逻辑必须有说明注释

---

## 完成标准

1. 所有 5 个子任务完成并通过验收
2. 全代码通过 ESLint 检查，零警告
3. 游戏功能完全保持不变，无回归问题
4. 新增模块可独立测试
5. 存档/读档 100 次无数据丢失或 corruption
6. 新增角色只需修改 JSON 配置 + 添加贴图，不碰主代码

---

## 风险评估

| 风险 | 概率 | 影响 | 应对策略 |
|------|------|------|----------|
| 模块拆分引入回归问题 | 中 | 高 | 拆分前编写测试用例，拆分后逐一验证 |
| 事件总线导致调试困难 | 低 | 中 | 添加事件日志和调试工具 |
| 配置文件格式变更导致兼容性问题 | 中 | 中 | 配置加载时进行版本检查和迁移 |
| localStorage 存储限制（5MB） | 低 | 低 | 数据压缩、清理旧存档 |
| 手柄支持跨浏览器兼容性 | 低 | 低 | 渐进增强，不支持手柄的浏览器降级为键盘操作 |
