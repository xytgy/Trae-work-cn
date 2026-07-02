# 像素地牢：枪战冒险 — 稳定性优先实现计划

## [x] Task 1: 游戏循环全局错误捕获
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 在 `gameLoop` 方法中添加 try-catch 包裹更新和渲染逻辑
  - 添加 `handleGameError` 方法处理运行时错误
  - 在 `menuLoop` 方法中添加错误捕获
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 运行游戏，在控制台执行 `particleSystem = null`，验证游戏不崩溃
  - `programmatic` TR-1.2: 触发渲染错误，验证游戏继续运行
- **Notes**: 错误处理应显示友好提示，让玩家选择继续或返回菜单

## [x] Task 2: Boss战稳定性修复
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 添加空值检查到 Boss 构造函数和 update 方法
  - 修复 summonEnemies 中的 setTimeout 内存泄漏（添加 cancelToken 机制）
  - 添加 Boss 死亡时清理定时器
  - 添加激光攻击参数验证
  - 添加阶段转换边界检查
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment` TR-2.1: 普通模式下通关 Boss（不使用任何技能）
  - `human-judgment` TR-2.2: 使用冲刺技能穿过 Boss 激光
  - `human-judgment` TR-2.3: 在 Boss 回血蓄力期间打断
  - `human-judgment` TR-2.4: 连续两次挑战 Boss
- **Notes**: 重点关注 summonTokens 的清理，防止内存泄漏

## [x] Task 3: 技能系统稳定性修复
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 在 ActiveSkill 基类中添加 `canExecute()` 方法
  - 对所有技能类的 `execute()` 和 `update()` 方法添加空值检查
  - 添加 `particleSystem`、`inputManager`、`this.owner` 的空值验证
  - 添加数值类型验证
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-3.1: 每个主动技能至少释放一次，无崩溃
  - `human-judgment` TR-3.2: 被动技能在战斗中正确触发
  - `human-judgment` TR-3.3: 技能冷却期间重复点击无异常
  - `human-judgment` TR-3.4: 连续释放多个不同技能组合
- **Notes**: 需要检查 skills.js 中的所有技能类（约27个）

## [x] Task 4: 成就系统稳定性修复
- **Priority**: medium
- **Depends On**: Task 1
- **Description**: 
  - 在 AchievementManager 中添加错误处理（try-catch）
  - 添加成就界面渲染安全检查
  - 添加 null 检查和参数验证
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-4.1: 解锁一个成就，UI正确显示
  - `human-judgment` TR-4.2: 查看已解锁和未解锁成就列表
  - `human-judgment` TR-4.3: 游戏重新开始后成就状态保留
- **Notes**: 关注 achievement.js 和 ui.js 中的成就渲染代码

## [x] Task 5: 存档系统稳定性修复
- **Priority**: medium
- **Depends On**: Task 1
- **Description**: 
  - 添加存档版本号（SAVE_VERSION = '1.0'）
  - 实现迁移逻辑 `migrateSaveData()`
  - 添加 `checkStorageAvailable()` 检查 localStorage 可用性
  - 集成自动存档时机（房间清除后、Boss战前）
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: 游戏进行中自动存档，退出后重新进入恢复
  - `programmatic` TR-5.2: 手动存档到不同槽位，读档正确恢复
  - `human-judgment` TR-5.3: 通关后存档，重新读档显示通关状态
  - `programmatic` TR-5.4: 删除存档后游戏正常运行
- **Notes**: 需要修改 save.js 和 game.js

## [x] Task 6: 重新开始路径稳定性修复
- **Priority**: medium
- **Depends On**: Task 1
- **Description**: 
  - 完善 `restart()` 方法的清理逻辑（取消 animationFrame、清理定时器）
  - 在 GameLogic 中添加 `cleanup()` 方法
  - 确保事件监听器正确移除（使用命名函数引用）
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-6.1: 游戏进行中按 P 暂停，按 R 重新开始
  - `human-judgment` TR-6.2: 游戏结束后点击"重新开始"按钮
  - `programmatic` TR-6.3: 连续重新开始5次，无内存泄漏迹象
  - `human-judgment` TR-6.4: 重新开始后所有按键正常响应
- **Notes**: 需要修改 main.js 和 game.js

## [x] Task 7: 路线选择界面完善
- **Priority**: medium
- **Depends On**: Phase 0 完成
- **Description**: 
  - 确保路线选择界面在正确时机触发（战斗房间清除后）
  - 添加路线选择键盘快捷键（1-精英、2-商店、3-休息）
  - 完善路线选择 UI 渲染
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `human-judgment` TR-7.1: 战斗房间清除后显示路线选择
  - `human-judgment` TR-7.2: 选择精英路线进入精英房间
  - `human-judgment` TR-7.3: 选择商店路线进入商店并购买物品
  - `human-judgment` TR-7.4: 选择休息路线恢复生命值
- **Notes**: 需要修改 game.js 和 ui.js

## [x] Task 8: 精英房间完善
- **Priority**: medium
- **Depends On**: Task 7
- **Description**: 
  - 确保精英敌人属性正确计算（难度倍率、血量、伤害）
  - 验证精英敌人掉落率
  - 添加精英房间独特视觉标识
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `human-judgment` TR-8.1: 精英房间敌人数量和属性正确
  - `human-judgment` TR-8.2: 击败精英敌人后获得稀有掉落
  - `human-judgment` TR-8.3: 精英房间失败后返回主菜单
- **Notes**: 需要修改 room.js 和 game.js

## [x] Task 9: 商店房间完善
- **Priority**: medium
- **Depends On**: Task 7
- **Description**: 
  - 确保商店物品生成逻辑正确
  - 验证购买流程（金币扣除、物品获得）
  - 添加购买失败提示（金币不足）
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `human-judgment` TR-9.1: 商店物品显示正确，价格合理
  - `human-judgment` TR-9.2: 购买物品后金币正确扣除
  - `human-judgment` TR-9.3: 金币不足时无法购买，有提示
- **Notes**: 需要修改 shop.js 和 ui.js

## [x] Task 10: 休息房间完善
- **Priority**: medium
- **Depends On**: Task 7
- **Description**: 
  - 确保回血喷泉碰撞检测正确
  - 添加回血视觉反馈（飘字、特效）
  - 确保休息房间无敌人，可安全探索
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `human-judgment` TR-10.1: 接触回血喷泉恢复生命值
  - `human-judgment` TR-10.2: 满血时接触喷泉无效果
  - `human-judgment` TR-10.3: 休息房间无敌人，可安全探索
- **Notes**: 需要修改 room.js 和 game.js

## [x] Task 11: 视觉反馈增强
- **Priority**: medium
- **Depends On**: Phase 1 完成
- **Description**: 
  - 伤害数字浮动效果优化（颜色、动画）
  - 击杀屏幕震动效果增强
  - 拾取飘字效果（金币、武器）
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgment` TR-11.1: 击中敌人显示伤害数字
  - `human-judgment` TR-11.2: 击杀敌人屏幕震动
  - `human-judgment` TR-11.3: 拾取金币显示 "+X G"
- **Notes**: 需要修改 game.js 和 ui.js

## [x] Task 12: UI一致性优化
- **Priority**: medium
- **Depends On**: Task 11
- **Description**: 
  - 字体统一（使用 Microsoft YaHei）
  - 按钮样式统一（悬停效果、阴影）
  - UI颜色主题统一
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgment` TR-12.1: 所有界面字体一致
  - `human-judgment` TR-12.2: 所有按钮悬停效果一致
  - `human-judgment` TR-12.3: UI颜色搭配协调
- **Notes**: 需要修改 ui.js 和 style.css

## [x] Task 13: 操作手感优化
- **Priority**: low
- **Depends On**: Task 11
- **Description**: 
  - 调整移动参数（加速度、最大速度）
  - 调整受伤无敌帧闪烁速度
  - 优化武器切换手感
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgment` TR-13.1: 角色移动流畅跟手
  - `human-judgment` TR-13.2: 受伤闪烁效果舒适
  - `human-judgment` TR-13.3: 武器切换响应及时
- **Notes**: 需要修改 constants.js
