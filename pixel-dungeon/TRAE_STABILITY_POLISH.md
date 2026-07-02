# 像素地牢：稳定性 + 代码优化 + 精致度UX — Trae 执行提示

## 任务概述

对像素地牢游戏进行全流程稳定性加固、代码清理、精致度和用户体验优化。**必须先写设计文档，再执行代码。**

## 项目路径

`/Users/xytgy/Downloads/software/Trae-work-cn/pixel-dungeon/`

## 核心目标（按优先级）

### 一、稳定性（最高优先级）

**目标：从主菜单到通关/死亡到重新开始，全流程无崩溃、无卡死、无异常**

1. **全流程测试路径**（必须逐个覆盖）：
   - 菜单 → 角色选择 → 难度选择 → 第一间战斗房 → 第二间战斗房 → 分支路线选择（精英/商店/休息）
   - 精英房战斗 → 后续战斗房 → Boss 战（三阶段全部触发：散弹→召唤→激光）
   - 玩家死亡 → 游戏结束画面 → 重新开始
   - Boss 击杀 → 通关画面 → 再来一局
   - 暂停 → 设置 → 返回 / 返回主菜单
   - 打开背包 → 使用道具 → 关闭背包
   - 与商人交互 → 购买物品 → 关闭商店

2. **崩溃风险点排查**：
   - 所有 `PARTICLES.TYPES.*` 引用对应的配置项是否都存在
   - 所有粒子效果函数中 `config` 变量是否都有声明
   - 所有 `ctx.createRadialGradient()` 调用的坐标参数确保是有限数字（!= NaN/Infinity）
   - 所有 `particles.push()` 调用前确保 `gameLogic.particles` 存在
   - 所有嵌套属性访问加可选链或 guard（如 `obj?.prop?.method()`）
   - 所有 gameLoop 中的 update/render 加 try-catch，单帧异常不终止循环

3. **游戏循环健壮性**：
   - gameLoop 主循环用 try-catch 包裹 `this.gameLogic.update()` 和 `this.gameLogic.render()`
   - 粒子数量超过 `PARTICLES.MAX_COUNT`（200）时强制裁剪
   - 子弹数量超过 200 时回收最早的子弹
   - 敌人数量超过 50 时限制生成

4. **资源管理**：
   - `localStorage` 读写失败时不阻塞游戏（try-catch）
   - `AudioContext` 创建失败时静默降级
   - 页面隐藏时（`visibilitychange` 事件）自动暂停游戏
   - restart 时确保所有旧的事件监听器被清理

### 二、代码清理

1. **index.html 移除未使用文件的 script 引用**：

   以下文件已确认从未被实例化或使用，从 HTML 中移除 script 标签：
   - `js/config/ConfigLoader.js`
   - `js/weapon.js`（整个武器基类从未被使用，子弹在 game.js 硬编码）
   - `js/weaponPistol.js`
   - `js/weaponLightning.js`
   - `js/weaponGrenade.js`
   - `js/weaponFlame.js`
   - `js/weaponBoomerang.js`
   - `js/weaponFreeze.js`
   - `js/weaponShotgun.js`
   - `js/weaponHoming.js`
   - `js/modules/SaveSystem.js`
   - `js/modules/InputSystem.js`
   - `js/modules/CollisionSystem.js`
   - `js/modules/DamageSystem.js`
   - `js/modules/DropSystem.js`
   - `js/modules/AchievementSystem.js`
   - `js/modules/RoomManager.js`
   - `js/modules/BulletManager.js`
   - `js/modules/ParticleManager.js`

   （保留 `js/modules/EventBus.js`，它被实际使用）

2. **双音频系统合并**：
   - `audio.js`（audioManager）和 `soundManager.js`（SoundManager）做同一件事
   - 保留 `soundManager.js`（功能更全，20+ 种音效）
   - 将 `audio.js` 中 `audioManager` 的所有调用（`audioManager.playSound()`、`audioManager.init()`）替换为 `soundManager.play()` 和 `soundManager.init()`
   - 移除 `audio.js` 的 script 引用

3. **全局变量治理**：
   - 检查 `window.game`、`window.saveManager` 等挂载到 window 上的全局变量
   - 非必要的不挂到 window，保持文件作用域

4. **废弃的 config/ 目录**：
   - `config/` 下 7 个 JSON 文件从未被加载或引用
   - 这些文件保留不动，但确认不被加载

### 三、精致度优化

1. **视觉反馈增强**：
   - 击中敌人时红色闪烁更明显（强度从 0.3 调到 0.6）
   - 击杀敌人时屏幕震动强度翻倍（从 2→4）
   - 拾取金币时飘字 "+5G"（使用现有的 `showDamage` 机制改颜色和前缀）
   - 武器切换时在屏幕中央显示大图标提示 2 秒
   - 弹药耗尽自动切回手枪时显示提示

2. **UI 一致性**：
   - 所有界面字体统一为 `"Courier New", monospace`（现在混用了 Arial、Microsoft YaHei）
   - 所有按钮悬停效果统一
   - 难度选择界面的文字颜色使用现有常量而非硬编码

3. **粒子效果增强**：
   - 环境灰尘粒子从 25 个提高到 40 个
   - Boss 阶段转换时触发大范围粒子爆发（参考 `spawnBossExplosion` 的强度）
   - 传送门周围粒子密度翻倍
   - 火焰喷射器火焰粒子数量从 1→3 每帧

4. **动画平滑**：
   - 房间切换时加 300ms 淡入淡出（黑色覆盖层透明度渐变）
   - 传送门激活时有脉动缩放动画
   - 角色选择卡片入场动画微调

### 四、用户体验优化

1. **操作手感微调**：
   - 加速度从 1.5 调到 1.8（更跟手）
   - 最大速度从 4.8 调到 5.2
   - 受伤无敌帧闪烁间隔从 100ms 调到 150ms（不那么急促）

2. **引导提示**：
   - 第一间房顶部显示 3 秒 "WASD 移动 | 鼠标射击 | Q 切换武器"
   - 第一次拾取武器时显示 "按 Q 切换武器"
   - Boss 房进入时屏幕中央显示红色 "WARNING" 文字

3. **信息可见性**：
   - 怒气条显示进度百分比数字
   - Boss 血条上方显示当前阶段名称（"阶段 1 正常" / "阶段 2 狂暴" / "阶段 3 最终"）
   - 当前武器弹药在玩家头顶显示小弹药图标
   - 击杀数在右上角用更大字体显示

4. **容错处理**：
   - 所有 `localStorage` 操作加 try-catch
   - 游戏检测到帧率低于 20fps 时自动降低粒子数量
   - 浏览器标签页切换时自动暂停

### 五、Boss 战稳定性专项

Boss 战是崩溃最高危区域，需要特别排查：

1. Boss 三阶段切换时血量阈值是否正确（50%→25%→0）
2. 激光攻击时 `boss.laserAngle` 是否初始化
3. 冲锋攻击时 `boss.chargeDirection` 是否初始化
4. 召唤小怪时 `this.enemies.push` 是否正常
5. Boss 死亡后 `onBossKilled` → `state.victory()` 延迟 2 秒是否正常触发
6. 通关后 `handleVictory` → `saveGameStats` 中的 `saveManager` 是否存在

---

## 执行流程

### 阶段 1：写设计文档

先阅读所有核心文件，写设计文档保存到 `docs/superpowers/specs/2026-07-02-stability-polish-design.md`
设计文档必须包含：风险点清单、每个改动项的具体方案、不做的范围

### 阶段 2：稳定性修复
按设计文档的风险点清单逐个修复

### 阶段 3：代码清理
移除无用 script 引用、合并音频系统

### 阶段 4：精致度 + UX
视觉增强、UI统一、粒子效果、操作引导

### 阶段 5：Boss 战专项测试
至少完整打通 3 次 Boss 战，每次用不同角色和武器

---

## 约束条件

- 所有代码使用原生 JavaScript（ES6+），无框架依赖
- Canvas 2D，不引入 WebGL
- 不添加 npm 包或 CDN 资源
- 保持像素风格
- **不能破坏已有的功能修复**
