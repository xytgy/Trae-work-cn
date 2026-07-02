# 像素地牢：难度调整与界面优化设计文档

## Overview
- **Summary**: 降低精英房难度（减少障碍物、降低敌人强度、增加提示信息）并优化UI字体显示（缩小顶部状态栏关卡文字）
- **Purpose**: 提升游戏体验，使精英房更具可玩性，同时确保UI元素不遮挡关键游戏区域
- **Target Users**: 所有玩家，特别是新手玩家

## Goals
- 降低精英房整体难度，保持适当挑战性
- 优化顶部状态栏字体显示，避免遮挡门的位置
- 增加精英房入口提示信息

## Non-Goals (Out of Scope)
- 不修改其他房间类型的难度配置
- 不改变整体游戏流程
- 不新增游戏机制

## Background & Context
根据玩家反馈，精英房难度过高，且顶部状态栏的"第X关"文字遮挡了房间顶部的门位置，影响游戏体验。

## Functional Requirements
- **FR-1**: 精英房石柱数量从2个减至1个
- **FR-2**: 精英房随从数量从2个减至1个
- **FR-3**: 精英怪血量倍率从1.2降至1.1
- **FR-4**: 在精英房入口显示"⚠️ 精英房"提示信息
- **FR-5**: 顶部状态栏"第X关"字体从24px减至18px

## Non-Functional Requirements
- **NFR-1**: 修改后游戏保持适当的挑战性
- **NFR-2**: UI元素布局合理，信息展示清晰

## Constraints
- **Technical**: 不引入新的依赖库
- **Business**: 保持原有游戏风格

## Assumptions
- 精英房配置在constants.js中的ELITE_ROOM_CONFIG对象中
- 装饰物配置在constants.js中的DECORATIONS对象中
- UI顶部栏渲染在ui.js中的renderTopBar()方法中

## Acceptance Criteria

### AC-1: 精英房石柱数量减少
- **Given**: 进入精英房
- **When**: 房间生成装饰物
- **Then**: 精英房只生成1个石柱（而非原来的2个）
- **Verification**: `human-judgment`

### AC-2: 精英房随从数量减少
- **Given**: 进入精英房
- **When**: 房间生成敌人
- **Then**: 精英房只生成1个随从（而非原来的2个）
- **Verification**: `human-judgment`

### AC-3: 精英怪强度降低
- **Given**: 精英怪生成
- **When**: 应用难度倍率
- **Then**: 精英怪血量倍率为1.1（而非原来的1.2）
- **Verification**: `programmatic`

### AC-4: 精英房入口提示
- **Given**: 玩家靠近精英房入口
- **When**: 门打开前
- **Then**: 显示"⚠️ 精英房"警告提示
- **Verification**: `human-judgment`

### AC-5: 顶部状态栏字体缩小
- **Given**: 游戏运行中
- **When**: 渲染顶部状态栏
- **Then**: "第X关"文字字体大小为18px（而非原来的24px）
- **Verification**: `human-judgment`

## Open Questions
- [ ] 无

## Implementation Details

### 1. 精英房难度调整

#### 1.1 减少石柱数量
修改 `js/room.js` 中的 `generateDecorations()` 方法，根据房间类型调整石柱数量：
- 精英房：1个石柱
- 其他房间：保持原有数量

#### 1.2 减少随从数量
修改 `js/constants.js` 中的 `ELITE_ROOM_CONFIG.MINION_COUNT` 从2改为1

#### 1.3 降低精英怪强度
修改 `js/constants.js` 中的 `ELITE_ROOM_CONFIG.ELITE_STATS_MULTIPLIER.health` 从1.2改为1.1

#### 1.4 精英房入口提示
在 `js/game.js` 中的房间切换逻辑中添加提示，当玩家进入精英房前显示警告信息

### 2. UI字体优化

#### 2.1 缩小顶部状态栏字体
修改 `js/ui.js` 中的 `renderTopBar()` 方法，将"第X关"文字的字体大小从24px改为18px