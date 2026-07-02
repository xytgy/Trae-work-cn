# 像素地牢：音效系统全面优化 - 产品需求文档

## Overview
- **Summary**: 全面优化游戏音效系统，解决当前音效刺耳问题，提升玩家听觉体验
- **Purpose**: 通过改进合成音效质量、添加滤波和包络、统一音效管理，使游戏音效更加柔和、自然、舒适
- **Target Users**: 所有游戏玩家

## Goals
- 将所有音效播放统一到soundManager，消除两个管理器并存的问题
- 为所有合成音效添加低通滤波器，减少高频谐波
- 使用更柔和的波形（三角波、正弦波）替代方波和锯齿波
- 添加ADSR包络使声音过渡更加自然
- 为爆炸、射击等音效添加噪声层增加真实质感
- 降低整体音效音量，避免听觉疲劳

## Non-Goals (Out of Scope)
- 添加新的音效文件（使用合成音效优化，不新增WAV文件）
- 实现3D音效定位系统
- 添加音效混响效果
- 实现动态音效环境切换

## Background & Context
当前游戏使用两个音效管理器：
1. `audioManager`（audio.js）- 用于游戏核心音效，全部使用原始振荡器合成，波形粗糙无滤波
2. `soundManager`（soundManager.js）- 用于UI音效和背景音乐，支持WAV文件和更好的合成效果

音效刺耳的主要原因：
- 方波和锯齿波含有大量高次谐波
- 缺少低通滤波器来软化高频成分
- 音量过高（0.3-0.5）
- 缺少ADSR包络，声音生硬突兀

## Functional Requirements
- **FR-1**: 在soundManager中添加完整的游戏音效映射和合成方法
- **FR-2**: 将所有audioManager.playSound()调用替换为soundManager.play()
- **FR-3**: 为所有合成音效添加低通滤波器（BiquadFilter）
- **FR-4**: 使用三角波替代方波，正弦波作为基础波形
- **FR-5**: 添加ADSR包络控制音量变化
- **FR-6**: 为射击、爆炸等音效添加噪声层
- **FR-7**: 降低整体音效音量（射击0.3→0.15-0.2，爆炸0.4→0.2-0.25）

## Non-Functional Requirements
- **NFR-1**: 音效优化不应影响游戏性能（帧率保持60fps）
- **NFR-2**: 音效调整应向后兼容，不破坏现有功能
- **NFR-3**: 音效质量应明显改善，不再刺耳

## Constraints
- **Technical**: 纯前端实现，使用Web Audio API，不引入新的第三方库
- **Dependencies**: 需要保持与现有AUDIO和SOUND_EFFECTS常量的兼容性

## Assumptions
- 用户已安装支持Web Audio API的现代浏览器
- 游戏运行在标准桌面环境，性能足够处理音频滤波

## Acceptance Criteria

### AC-1: 音效管理器统一
- **Given**: 游戏中有多个音效播放调用
- **When**: 游戏运行时触发各种音效事件
- **Then**: 所有音效都通过soundManager播放，不再使用audioManager
- **Verification**: `human-judgment`

### AC-2: 合成音效质量提升
- **Given**: 玩家进行射击、受伤、拾取等游戏操作
- **When**: 触发相应音效
- **Then**: 音效听起来柔和自然，没有刺耳的高频噪音
- **Verification**: `human-judgment`

### AC-3: 音量调整合理
- **Given**: 玩家进行各种游戏操作
- **When**: 多个音效同时播放
- **Then**: 音效音量适中，不会产生听觉疲劳
- **Verification**: `human-judgment`

### AC-4: 性能不受影响
- **Given**: 游戏正常运行
- **When**: 频繁触发音效
- **Then**: 帧率保持在60fps，没有明显卡顿
- **Verification**: `programmatic`

## Open Questions
- [ ] 是否需要添加音效预设（如"柔和"、"标准"、"动感"）？
- [ ] 是否需要添加单独的音效类型音量控制（如射击音效、环境音效）？