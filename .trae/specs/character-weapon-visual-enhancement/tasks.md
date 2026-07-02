# 像素地牢：角色外观与武器弹道增强 — 实现计划

## [ ] Task 1: 为24个角色添加bodyShape配置
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 在characterSelect.js的24个角色定义中添加bodyShape字段
  - bodyShape包含build、head、weapon、decor、pattern五个属性
  - 参考设计文档中的角色配置表
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 检查characterSelect.js中每个角色对象都包含bodyShape字段
  - `programmatic` TR-1.2: 检查bodyShape包含所有五个属性（build、head、weapon、decor、pattern）
- **Notes**: bodyShape配置将用于后续的角色渲染

## [ ] Task 2: 在player.js中实现角色外观渲染函数
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 在player.js中新增drawCharacterBody(ctx, build)函数
  - 新增drawCharacterHead(ctx, head)函数
  - 新增drawCharacterWeapon(ctx, weapon)函数
  - 新增drawCharacterDecor(ctx, decor)函数
  - 新增drawCharacterPattern(ctx, pattern, color)函数
  - 修改renderPlayer()方法使用这些新函数
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment` TR-2.1: 游戏中不同角色显示不同体型（slim/normal/muscular/bulky/tiny）
  - `human-judgment` TR-2.2: 游戏中不同角色显示不同头型（round/oval/square/pointed/helmet/mask）
  - `human-judgment` TR-2.3: 游戏中不同角色显示不同手持武器
  - `human-judgment` TR-2.4: 游戏中不同角色显示不同装饰物
  - `human-judgment` TR-2.5: 游戏中不同角色显示不同身体纹理
- **Notes**: 如果角色没有bodyShape配置，回退到原来的纯圆形渲染

## [ ] Task 3: 在characterSelect.js中渲染角色差异化外观
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 修改renderCharacterIcon()方法，使用bodyShape绘制角色
  - 修改renderCharacterPreview()方法，使用bodyShape绘制角色预览
  - 确保角色卡片预览与游戏中渲染一致
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-3.1: 角色选择界面卡片显示差异化外观
  - `human-judgment` TR-3.2: 详情面板角色预览显示差异化外观
  - `human-judgment` TR-3.3: 卡片预览与游戏中渲染一致
- **Notes**: 复用player.js中的绘制逻辑

## [ ] Task 4: 增强武器弹道效果（bullet.js）
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改Bullet.draw() — 添加拖尾粒子效果
  - 修改LightningBullet.draw() — 增强电弧锯齿，添加分支
  - 修改GrenadeBullet.draw() — 添加抛物线尾迹
  - 修改FlameBullet.draw() — 粒子翻倍，颜色渐变
  - 修改BoomerangBullet.draw() — 添加弧线拖尾
  - 修改FreezeBullet.draw() — 添加命中冰裂效果
  - 修改ShotgunBullet.draw() — 添加独立拖尾
  - 修改HomingBullet.draw() — 尾焰增强，添加转弯轨迹
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-4.1: 手枪子弹显示拖尾效果
  - `human-judgment` TR-4.2: 闪电子弹显示分支电弧
  - `human-judgment` TR-4.3: 榴弹子弹显示抛物线尾迹
  - `human-judgment` TR-4.4: 火焰子弹显示增强粒子效果
  - `human-judgment` TR-4.5: 回旋镖显示弧线拖尾
  - `human-judgment` TR-4.6: 冰冻子弹显示冰晶效果
  - `human-judgment` TR-4.7: 散弹子弹显示独立拖尾
  - `human-judgment` TR-4.8: 追踪导弹显示增强尾焰
- **Notes**: 只修改draw()方法，不修改update()或碰撞检测逻辑

## [ ] Task 5: 添加武器级别瞄准配置（constants.js）
- **Priority**: medium
- **Depends On**: None
- **Description**: 
  - 在constants.js的AIM_ASSIST中新增WEAPON_SETTINGS配置
  - 为8种武器分别配置assistRange、assistAngle、snapStrength、bulletCurveStrength
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: 检查AIM_ASSIST.WEAPON_SETTINGS包含8种武器配置
  - `programmatic` TR-5.2: 检查每种武器配置包含所有四个参数
- **Notes**: 配置参数参考设计文档

## [ ] Task 6: 修改calculateAimAssist()方法（game.js）
- **Priority**: medium
- **Depends On**: Task 5
- **Description**: 
  - 修改game.js的calculateAimAssist()方法，接受weaponType参数
  - 根据武器类型获取对应的瞄准参数
  - 在handleShooting()中传入当前武器类型
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgment` TR-6.1: 不同武器的辅助瞄准范围不同
  - `human-judgment` TR-6.2: 不同武器的辅助瞄准角度不同
  - `human-judgment` TR-6.3: 不同武器的辅助强度不同
- **Notes**: 保持向后兼容性，默认使用PISTOL配置

## [ ] Task 7: 渲染目标指示器（game.js）
- **Priority**: medium
- **Depends On**: Task 6
- **Description**: 
  - 在game.js中添加目标指示器渲染逻辑
  - 在锁定敌人头上绘制红色三角/准星
  - 添加脉冲动画效果
  - 仅在辅助瞄准激活时显示
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `human-judgment` TR-7.1: 辅助瞄准锁定敌人时显示目标指示器
  - `human-judgment` TR-7.2: 目标指示器显示脉冲动画
  - `human-judgment` TR-7.3: 目标指示器大小随距离变化
- **Notes**: 目标指示器应在UI层渲染

## [ ] Task 8: 性能优化与兼容性测试
- **Priority**: low
- **Depends On**: Task 1-7
- **Description**: 
  - 确保粒子数量不超过200
  - 确保帧率保持60fps
  - 验证已修复的16个问题没有回归
- **Acceptance Criteria Addressed**: AC-7, AC-8
- **Test Requirements**:
  - `programmatic` TR-8.1: 粒子数量监控，确保≤200
  - `programmatic` TR-8.2: 帧率监控，确保≥58fps
  - `programmatic` TR-8.3: 运行所有已修复问题的测试用例
- **Notes**: 使用现有调试工具进行性能监控
