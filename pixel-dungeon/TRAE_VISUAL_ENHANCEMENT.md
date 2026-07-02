# 像素地牢：角色外观与武器弹道增强 — Trae 执行提示

## 任务概述

对像素地牢游戏的角色外观、武器弹道效果、自动瞄准进行增强。**必须先写设计文档，再执行代码。**

## 项目路径

`/Users/xytgy/Downloads/software/Trae-work-cn/pixel-dungeon/`

## 已有设计文档参考

先阅读 `docs/superpowers/specs/2026-07-02-character-weapon-visual-enhancement-design.md`

## 当前代码库状态（必读）

### 已修复的问题（不要还原）
1. 粒子配置缺失（PARTICLES.TYPES 缺少 6 项）→ 已修复
2. 启动时不调用 gameLogic.init() → 已修复
3. 召唤小怪双重伤害碰撞循环 → 已删除
4. 物理移动系统已启用（加速度 1.5）→ 已修复
5. 暂停界面的设置按钮无效 → 已修复
6. 敌人子弹从未与玩家碰撞 → 已修复
7. 伤害数字渲染两次 → 已修复
8. 武器音效缺失 → 已修复
9. room.js 引用不存在的 SCENE_DYNAMICS.* → 已修复
10. 重启后事件监听器泄漏 → 已修复
11. 宝箱传参顺序错误 → 已修复
12. 击中粒子缺少 config 变量声明 → 已修复
13. 回血喷泉传参多了一个 player → 已修复
14. 第一间房固定战斗房 → 已修复
15. 路线分支选择功能 → 已添加
16. 房间数提升、敌人数量提升、前期敌人类型提前解锁 → 已修复

### 当前系统现状

- 24 个角色定义在 `characterSelect.js` 中，每个角色有 `id, name, category, icon, color, description, stats, skills`
- 角色在玩家头上渲染为**一个彩色圆形 + 两个白色眼白 + 黑色瞳孔**（`player.js` 的 `renderPlayer()`）
- 角色选择界面的卡片渲染在 `characterSelect.js` 中（1144 行）
- 8 种武器定义在 `constants.js` 的 `WEAPONS` 中，有 `DAMAGE` 字段但没有物理/魔法区分
- 所有武器子弹绘制在 `bullet.js` 中，各自有 `draw(ctx)` 方法
- 辅助瞄准在 `game.js` 的 `calculateAimAssist()` 中
- 武器射击在 `game.js` 的 `createBullet()` 中，每种武器 switch case 创建不同子弹类
- `character.js` 有 `Character` 基类但**从未被用于游戏逻辑**（gameLogic.init 不调用角色初始化）
- `characters.js` 有 24 个角色类定义但**只有颜色被用到**
- 粒子效果通过 `this.particles.push(new Particle(...))` 添加到 `gameLogic.particles` 数组

### 重要的实现约束

1. **角色外观只在玩家渲染上生效** — 在 `player.js` 的 `renderPlayer()` 方法中修改绘制代码，新增 `bodyShape` 参数驱动的数学绘制分支
2. **角色选择界面卡片也显示差异外观** — 在 `characterSelect.js` 的角色卡片预览中也使用相同的数学绘制
3. **武器弹道效果只改 `bullet.js` 的 `draw()` 方法** — 不修改子弹逻辑
4. **粒子效果走现有 `this.particles.push(new Particle(...))` 模式**
5. **所有角色 `bodyShape` 配置加在 `characterSelect.js` 的角色数组里**
6. **自动瞄准改 `game.js` 的 `calculateAimAssist()`**，新增 weapon 参数

---

## 执行流程

### 阶段 0：写设计文档

1. 先阅读整个项目的核心文件（至少：`constants.js`, `game.js`, `player.js`, `bullet.js`, `characterSelect.js`, `character.js`, `input.js`）
2. 写设计文档保存到 `docs/superpowers/specs/2026-07-02-character-weapon-visual-enhancement-trae-design.md`
3. 设计文档必须包含：
   - 每个角色 `bodyShape` 配置（24 个角色全部覆盖）
   - 每种子弹 `draw()` 方法的具体改动
   - 辅助瞄准按武器的参数表
   - 不做的范围

### 阶段 1：角色外观代码生成

1. 在 `characterSelect.js` 中 24 个角色配置里添加 `bodyShape` 字段
2. 在 `player.js` 的 `renderPlayer()` 中新增外观绘制函数：
   - `drawCharacterBody(ctx, build)` — 根据 build 画不同身体
   - `drawCharacterHead(ctx, head)` — 根据 head 画不同头型
   - `drawCharacterWeapon(ctx, weapon)` — 根据 weapon 画不同手持武器
   - `drawCharacterDecor(ctx, decor)` — 画装饰物
   - `drawCharacterPattern(ctx, pattern)` — 画身体纹理
3. 在 `characterSelect.js` 的角色卡片中也渲染该角色的 bodyShape
4. 如果角色没有 `bodyShape` 配置，回退到原来的纯圆形渲染

### 阶段 2：武器弹道效果增强

1. 修改 `bullet.js` 中各子弹的 `draw()` 方法
   - `Bullet.draw` → 加拖尾粒子
   - `LightningBullet.draw` → 增强电弧锯齿，加分支
   - `GrenadeBullet.draw` → 抛物线尾迹
   - `FlameBullet.draw` → 粒子翻倍，颜色渐变
   - `BoomerangBullet.draw` → 弧线拖尾
   - `FreezeBullet.draw` → 命中冰裂
   - `ShotgunBullet.draw` → 独立拖尾
   - `HomingBullet.draw` → 尾焰增强，转弯轨迹
2. 在 `game.js` 中增强爆炸粒子效果和击中碎片效果

### 阶段 3：自动瞄准优化

1. 修改 `constants.js` 的 `AIM_ASSIST`，新增武器级别瞄准配置
2. 修改 `game.js` 的 `calculateAimAssist()` 方法，接受 weaponType 参数
3. 在 `handleShooting()` 中传入当前武器类型
4. 在游戏中渲染目标指示器（锁定敌人头上的红色三角/准星）

---

## 约束条件

- 所有代码使用原生 JavaScript（ES6+），无框架依赖
- Canvas 2D，不引入 WebGL
- 不添加 npm 包或 CDN 资源
- 所有音效使用 Web Audio API 合成
- 保持像素风格
- **不能破坏已有的 16 个已修复问题**
