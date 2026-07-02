# 像素地牢：枪战冒险 — 稳定性优先验证清单

## 第0阶段：全流程稳定性修复

### Task 1: 游戏循环全局错误捕获
- [x] TC-1.1: gameLoop 更新逻辑添加 try-catch
- [x] TC-1.2: gameLoop 渲染逻辑添加 try-catch
- [x] TC-1.3: 添加 handleGameError 方法
- [x] TC-1.4: menuLoop 添加错误捕获
- [x] TC-1.5: 控制台置空 particleSystem 后游戏不崩溃

### Task 2: Boss战稳定性修复
- [x] TC-2.1: Boss 构造函数添加空值检查
- [x] TC-2.2: Boss update 方法添加参数验证
- [x] TC-2.3: summonEnemies 添加 cancelToken 机制
- [x] TC-2.4: Boss die 方法清理所有定时器
- [x] TC-2.5: 激光攻击参数验证
- [x] TC-2.6: 阶段转换边界检查
- [x] TC-2.7: 连续两次挑战 Boss 无异常

### Task 3: 技能系统稳定性修复
- [x] TC-3.1: ActiveSkill 基类添加 canExecute 方法
- [x] TC-3.2: DashSkill 添加空值检查
- [x] TC-3.3: ShieldSkill 添加空值检查
- [x] TC-3.4: MineSkill 添加空值检查
- [x] TC-3.5: HealSkill 添加空值检查
- [x] TC-3.6: GrenadeSkill 添加空值检查
- [x] TC-3.7: FlameSkill 添加空值检查
- [x] TC-3.8: LightningSkill 添加空值检查
- [x] TC-3.9: 所有技能类添加空值检查和参数验证
- [x] TC-3.10: 技能冷却期间重复点击无异常

### Task 4: 成就系统稳定性修复
- [x] TC-4.1: AchievementManager 构造函数添加 try-catch
- [x] TC-4.2: checkAchievement 方法添加错误处理
- [x] TC-4.3: onAchievementUnlocked 方法添加错误处理
- [x] TC-4.4: 成就界面渲染添加安全检查
- [x] TC-4.5: 游戏重新开始后成就状态保留

### Task 5: 存档系统稳定性修复
- [x] TC-5.1: 添加 SAVE_VERSION 常量
- [x] TC-5.2: 实现 migrateSaveData 方法
- [x] TC-5.3: 添加 checkStorageAvailable 方法
- [x] TC-5.4: 房间清除后自动存档
- [x] TC-5.5: 通关后存档正确
- [x] TC-5.6: 删除存档后游戏正常运行

### Task 6: 重新开始路径稳定性修复
- [x] TC-6.1: restart 方法取消 animationFrame
- [x] TC-6.2: GameLogic 添加 cleanup 方法
- [x] TC-6.3: 事件监听器正确移除（命名函数引用）
- [x] TC-6.4: 连续重新开始5次无内存泄漏
- [x] TC-6.5: 重新开始后所有按键正常响应

## 第1阶段：分支路线方案落地

### Task 7: 路线选择界面完善
- [x] TC-7.1: 战斗房间清除后显示路线选择
- [x] TC-7.2: 键盘快捷键 1/2/3 选择路线
- [x] TC-7.3: 路线选择 UI 渲染正确

### Task 8: 精英房间完善
- [x] TC-8.1: 精英敌人血量和伤害正确计算
- [x] TC-8.2: 精英敌人掉落率验证
- [x] TC-8.3: 精英房间视觉标识

### Task 9: 商店房间完善
- [x] TC-9.1: 商店物品生成逻辑正确
- [x] TC-9.2: 购买流程正常（金币扣除、物品获得）
- [x] TC-9.3: 金币不足时显示提示

### Task 10: 休息房间完善
- [x] TC-10.1: 回血喷泉碰撞检测正确
- [x] TC-10.2: 回血视觉反馈
- [x] TC-10.3: 休息房间无敌人

## 第2阶段：精致度 + UX提升

### Task 11: 视觉反馈增强
- [x] TC-11.1: 伤害数字浮动效果
- [x] TC-11.2: 击杀屏幕震动
- [x] TC-11.3: 拾取飘字效果

### Task 12: UI一致性优化
- [x] TC-12.1: 字体统一（Microsoft YaHei）
- [x] TC-12.2: 按钮样式统一
- [x] TC-12.3: UI颜色主题统一

### Task 13: 操作手感优化
- [x] TC-13.1: 移动参数调整（加速度、最大速度）
- [x] TC-13.2: 受伤无敌帧闪烁速度调整
- [x] TC-13.3: 武器切换手感优化

## 全流程测试
- [ ] FT-001: 主菜单 → 角色选择 → 游戏进行 → 战斗 → 死亡 → 重新开始
- [ ] FT-002: 主菜单 → 角色选择 → 游戏进行 → 战斗 → 通关 → 重新开始
- [ ] FT-003: 主菜单 → 角色选择 → 游戏进行 → 分支路线（精英）→ 战斗 → Boss → 通关
- [ ] FT-004: 主菜单 → 角色选择 → 游戏进行 → 分支路线（商店）→ 购买 → 战斗 → Boss → 通关
- [ ] FT-005: 主菜单 → 角色选择 → 游戏进行 → 分支路线（休息）→ 回血 → 战斗 → Boss → 通关
- [ ] FT-006: 连续重新开始5次，所有按键正常响应
