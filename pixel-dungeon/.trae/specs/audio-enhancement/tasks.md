# 像素地牢：音效系统全面优化 - 实施计划

## [x] Task 1: 优化soundManager合成音效方法
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 为soundManager添加新的合成音效方法，使用三角波/正弦波替代方波/锯齿波
  - 为每个合成音效添加低通滤波器（BiquadFilter）
  - 添加ADSR包络控制
  - 添加噪声层增加真实质感
  - 降低整体音量
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `human-judgment` TR-1.1: 合成音效听起来柔和自然，没有刺耳噪音
  - `human-judgment` TR-1.2: 音量适中，不会产生听觉疲劳
- **Notes**: 需要修改soundManager.js中的所有synthXxx方法

## [x] Task 2: 添加游戏音效映射到soundManager
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 在soundManager中添加与AUDIO常量对应的音效映射
  - 添加缺失的合成音效方法（flame、homing、kill、boss_attack等）
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgment` TR-2.1: 所有AUDIO常量对应的音效都能正常播放
- **Notes**: 需要确保与现有SOUND_EFFECTS常量兼容

## [x] Task 3: 替换game.js中的音效调用
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 将game.js中所有audioManager.playSound()调用替换为soundManager.play()
  - 确保所有射击音效、拾取音效、击杀音效、受伤音效等都正确迁移
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `human-judgment` TR-3.1: 游戏中的所有音效都能正常播放
  - `human-judgment` TR-3.2: 音效质量明显改善
- **Notes**: 需要查找game.js中所有audioManager.playSound调用（约20处）

## [/] Task 4: 替换其他文件中的音效调用
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 替换boss.js中的audioManager.playSound()调用
  - 替换DamageSystem.js中的audioManager.playSound()调用
  - 替换DropSystem.js中的audioManager.playSound()调用
  - 替换RoomManager.js中的audioManager.playSound()调用
  - 替换skills.js中的audioManager.playSound()调用
  - 替换state.js中的audioManager.playSound()调用
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgment` TR-4.1: 所有场景中的音效都能正常播放
- **Notes**: 需要查找约10处audioManager.playSound调用

## [ ] Task 5: 优化BGM合成质量
- **Priority**: medium
- **Depends On**: None
- **Description**: 
  - 将BGM中的方波替换为三角波或正弦波
  - 添加低通滤波器
  - 降低整体音量（0.05-0.08 → 0.03-0.05）
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `human-judgment` TR-5.1: BGM听起来更加柔和舒适
- **Notes**: 修改soundManager.js中的getMusicData方法和scheduleNote方法

## [ ] Task 6: 测试验证
- **Priority**: high
- **Depends On**: Tasks 1-5
- **Description**: 
  - 运行游戏测试所有音效
  - 验证帧率是否保持60fps
  - 调整参数优化听感
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-6.1: 游戏帧率保持在60fps
  - `human-judgment` TR-6.2: 所有音效正常播放，质量明显改善
- **Notes**: 需要使用浏览器开发者工具监控帧率