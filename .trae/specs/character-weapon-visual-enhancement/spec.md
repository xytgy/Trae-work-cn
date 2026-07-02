# 像素地牢：角色外观与武器弹道增强 — 产品需求文档

## Overview

### Summary
对像素地牢游戏进行视觉增强，包括24个角色的差异化外观、8种武器的弹道效果优化、以及武器级别的自动瞄准参数调整。

### Purpose
提升游戏视觉体验，使每个角色拥有独特外观，每种武器拥有独特的弹道效果，并根据武器特性调整辅助瞄准行为。

### Target Users
像素地牢游戏玩家，特别是喜欢地牢闯关和射击战斗的玩家群体。

## Goals

- [ ] 为24个角色添加独特的bodyShape配置，实现差异化外观渲染
- [ ] 增强8种武器子弹的视觉效果（拖尾、粒子、特效）
- [ ] 实现武器级别的自动瞄准参数配置
- [ ] 在角色选择界面显示角色差异化外观
- [ ] 渲染目标指示器显示锁定敌人

## Non-Goals (Out of Scope)

- [ ] 不修改子弹逻辑（update方法、碰撞检测）
- [ ] 不修改角色技能系统（技能效果、冷却时间）
- [ ] 不添加新武器或新角色
- [ ] 不修改游戏核心循环
- [ ] 不引入新的外部依赖或CDN资源

## Background & Context

当前游戏状态：
- 24个角色定义在 `characterSelect.js` 中，每个角色有基本属性但外观统一为圆形
- 8种武器定义在 `constants.js` 的 `WEAPONS` 中
- 所有武器子弹绘制在 `bullet.js` 中，各自有 `draw(ctx)` 方法
- 辅助瞄准在 `game.js` 的 `calculateAimAssist()` 中，使用统一参数

已修复的16个问题（不能破坏）：
1. 粒子配置缺失
2. 启动时不调用 gameLogic.init()
3. 召唤小怪双重伤害碰撞循环
4. 物理移动系统已启用
5. 暂停界面的设置按钮无效
6. 敌人子弹从未与玩家碰撞
7. 伤害数字渲染两次
8. 武器音效缺失
9. room.js 引用不存在的 SCENE_DYNAMICS.*
10. 重启后事件监听器泄漏
11. 宝箱传参顺序错误
12. 击中粒子缺少 config 变量声明
13. 回血喷泉传参多了一个 player
14. 第一间房固定战斗房
15. 路线分支选择功能
16. 房间数提升、敌人数量提升、前期敌人类型提前解锁

## Functional Requirements

### FR-1: 角色bodyShape配置
为24个角色添加bodyShape配置，包含build、head、weapon、decor、pattern五个字段。

### FR-2: 角色外观渲染
在player.js中实现基于bodyShape的角色渲染，包括drawCharacterBody、drawCharacterHead、drawCharacterWeapon、drawCharacterDecor、drawCharacterPattern函数。

### FR-3: 角色选择界面渲染
在characterSelect.js中使用相同的bodyShape绘制逻辑，在角色卡片和详情面板中显示角色差异化外观。

### FR-4: 武器弹道效果增强
修改bullet.js中8种子弹的draw()方法，添加拖尾、粒子、特效等视觉效果。

### FR-5: 武器级别瞄准配置
在constants.js中为每种武器添加独立的瞄准参数配置。

### FR-6: 自动瞄准方法优化
修改game.js的calculateAimAssist()方法，接受weaponType参数，根据武器类型调整瞄准行为。

### FR-7: 目标指示器渲染
在游戏中渲染目标指示器（红色三角/准星），显示当前锁定的敌人。

## Non-Functional Requirements

### NFR-1: 性能优化
- 使用对象池化技术管理粒子
- 保持粒子总数在合理范围内（≤200）
- 不影响游戏帧率（保持60fps）

### NFR-2: 像素风格一致性
- 所有新绘制使用数学图形
- 保持8-bit像素风格
- 不使用图片资源

### NFR-3: 兼容性
- 保持与现有代码的兼容性
- 不破坏已修复的16个问题

## Constraints

### Technical
- 原生JavaScript（ES6+），无框架依赖
- Canvas 2D，不引入WebGL
- 不添加npm包或CDN资源
- 所有音效使用Web Audio API合成

### Business
- 保持游戏核心玩法不变
- 保持角色技能系统不变

## Assumptions

- 现有粒子系统已完善，可通过 `this.particles.push(new Particle(...))` 添加粒子
- 现有渲染流程支持自定义绘制函数
- 角色选择界面可扩展以支持bodyShape渲染

## Acceptance Criteria

### AC-1: 角色bodyShape配置完整

- **Given**: 查看characterSelect.js中的角色定义
- **When**: 检查每个角色对象
- **Then**: 24个角色都包含完整的bodyShape配置（build、head、weapon、decor、pattern）
- **Verification**: `programmatic`

### AC-2: 角色外观渲染正常

- **Given**: 游戏运行中，选择不同角色
- **When**: 观察玩家角色渲染
- **Then**: 不同角色显示不同的体型、头型、武器、装饰物和纹理效果
- **Verification**: `human-judgment`

### AC-3: 角色选择界面显示差异外观

- **Given**: 进入角色选择界面
- **When**: 查看角色卡片和详情面板
- **Then**: 角色卡片预览与游戏中渲染一致，显示差异化外观
- **Verification**: `human-judgment`

### AC-4: 子弹视觉效果增强

- **Given**: 游戏中使用不同武器射击
- **When**: 观察子弹飞行过程
- **Then**: 每种武器子弹显示独特的视觉效果（拖尾、粒子、特效）
- **Verification**: `human-judgment`

### AC-5: 武器级别瞄准参数生效

- **Given**: 使用不同武器时
- **When**: 启用辅助瞄准
- **Then**: 不同武器的辅助瞄准范围、角度、强度不同
- **Verification**: `human-judgment`

### AC-6: 目标指示器显示

- **Given**: 游戏中瞄准敌人
- **When**: 辅助瞄准锁定敌人
- **Then**: 敌人头上显示红色三角/准星指示器
- **Verification**: `human-judgment`

### AC-7: 性能保持

- **Given**: 游戏运行中，大量子弹和粒子效果
- **When**: 监控帧率
- **Then**: 帧率保持在60fps，粒子数量不超过200
- **Verification**: `programmatic`

### AC-8: 兼容性检查

- **Given**: 测试游戏所有功能
- **When**: 运行测试场景
- **Then**: 已修复的16个问题仍然正常，无回归
- **Verification**: `programmatic`

## Open Questions

- [ ] 是否需要为不同bodyShape配置添加颜色变化？
- [ ] 目标指示器的具体样式和动画效果如何确定？
- [ ] 是否需要添加武器弹道效果的开关设置？
