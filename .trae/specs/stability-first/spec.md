# 像素地牢：枪战冒险 — 稳定性优先产品需求文档

## Overview
- **Summary**: 将"像素地牢：枪战冒险"从部分可用的 Demo 提升为全流程稳定的可发布产品，采用防御性编程策略，确保游戏从主菜单到通关到重新开始的完整循环无崩溃。
- **Purpose**: 解决当前游戏存在的稳定性问题（Boss战崩溃、技能系统空值引用、成就系统异常、存档系统版本兼容、重新开始路径内存泄漏），提升产品质量至企业级标准。
- **Target Users**: 游戏玩家，期望获得流畅稳定的游戏体验。

## Goals
- [ ] 全流程稳定性：确保菜单→角色选择→战斗→Boss战→死亡/通关→重新开始的完整循环无崩溃
- [ ] Boss战稳定性：三阶段攻击、召唤机制、激光攻击、阶段转换无异常
- [ ] 技能系统稳定性：所有27个技能释放无崩溃，空值引用安全
- [ ] 成就系统稳定性：成就解锁、保存、渲染无异常
- [ ] 存档系统稳定性：版本兼容、自动存档、读档恢复正常
- [ ] 分支路线功能：精英/商店/休息房间完整可用
- [ ] 视觉反馈增强：伤害数字、击杀特效、拾取飘字
- [ ] UI一致性：字体、按钮样式统一

## Non-Goals (Out of Scope)
- [ ] 不重构游戏架构（如拆分大文件、合并双系统等留待后续迭代）
- [ ] 不添加新功能（如游戏手柄支持、排行榜等）
- [ ] 不优化性能（如对象池、离屏Canvas等留待后续迭代）
- [ ] 不修改游戏玩法平衡（如武器伤害、敌人数量等）

## Background & Context
- 项目是一个 HTML5 Canvas 原生 JavaScript 像素风地牢射击游戏
- 当前代码库约 110,000 行，包含约 50 个 JS 文件
- 已修复 16 个关键问题（粒子配置、碰撞检测、事件泄漏等）
- 当前仍存在稳定性风险：游戏循环无错误捕获、技能系统无空值检查、Boss战定时器泄漏、存档无版本迁移

## Functional Requirements
- **FR-1**: 游戏循环全局错误捕获，单一异常不终止整个游戏
- **FR-2**: Boss战三阶段攻击无崩溃，召唤定时器正确清理
- **FR-3**: 所有技能类添加空值检查和参数验证
- **FR-4**: 成就系统添加错误处理，渲染安全检查
- **FR-5**: 存档系统添加版本号和迁移逻辑
- **FR-6**: 重新开始路径正确清理事件监听器和定时器
- **FR-7**: 分支路线选择界面正确触发和显示
- **FR-8**: 精英/商店/休息房间功能完整可用

## Non-Functional Requirements
- **NFR-1**: 游戏运行时错误捕获率 100%，不出现未捕获异常导致的崩溃
- **NFR-2**: 重新开始5次无内存泄漏迹象（FPS稳定、内存增长可控）
- **NFR-3**: 存档数据兼容旧版本，迁移成功率 100%
- **NFR-4**: 所有UI元素渲染安全，不出现 null reference 错误

## Constraints
- **Technical**: 原生 JavaScript (ES6+)，HTML5 Canvas，Web Audio API，localStorage
- **Dependencies**: 无外部 npm 包或 CDN 资源
- **Art Style**: 保持像素风格

## Assumptions
- [ ] 用户已安装现代浏览器（Chrome/Firefox/Edge/Safari）
- [ ] localStorage 可用（游戏会优雅处理不可用情况）
- [ ] Web Audio API 可用（游戏会优雅处理不可用情况）

## Acceptance Criteria

### AC-1: 游戏循环错误捕获
- **Given**: 游戏运行中某个组件抛出异常
- **When**: 异常发生在 gameLoop 或 menuLoop 中
- **Then**: 游戏不崩溃，显示错误提示，可选择继续或返回菜单
- **Verification**: `programmatic`

### AC-2: Boss战稳定性
- **Given**: 玩家进入 Boss 房间
- **When**: Boss 释放三阶段攻击（散弹、召唤、激光）
- **Then**: 攻击正常执行，Boss 死亡时定时器正确清理
- **Verification**: `human-judgment`

### AC-3: 技能系统稳定性
- **Given**: 玩家拥有各种主动技能
- **When**: 连续释放不同技能组合
- **Then**: 所有技能正常执行，无空值引用错误
- **Verification**: `human-judgment`

### AC-4: 成就系统稳定性
- **Given**: 玩家达成成就条件
- **When**: 成就解锁触发
- **Then**: 成就正确保存，UI正确显示
- **Verification**: `human-judgment`

### AC-5: 存档系统稳定性
- **Given**: 玩家进行游戏并退出
- **When**: 重新进入游戏
- **Then**: 自动存档正确恢复，版本迁移正常
- **Verification**: `programmatic`

### AC-6: 重新开始路径稳定性
- **Given**: 玩家在游戏中重新开始
- **When**: 连续重新开始5次
- **Then**: 游戏状态正确重置，无事件监听器泄漏
- **Verification**: `programmatic`

### AC-7: 分支路线功能
- **Given**: 玩家清除战斗房间
- **When**: 选择分支路线（精英/商店/休息）
- **Then**: 正确进入对应房间，功能正常
- **Verification**: `human-judgment`

### AC-8: 视觉反馈增强
- **Given**: 玩家造成伤害/击杀敌人/拾取物品
- **When**: 触发相应事件
- **Then**: 显示伤害数字、击杀特效、拾取飘字
- **Verification**: `human-judgment`

## Open Questions
- [ ] 是否需要添加更多的自动存档时机？
- [ ] 是否需要调整技能冷却时间以平衡游戏体验？
- [ ] 是否需要增加更多的错误日志记录？
