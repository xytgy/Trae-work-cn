# 像素地牢：音效系统全面优化设计文档

## 概述
- **摘要**: 全面优化游戏音效系统，解决当前音效刺耳问题，提升玩家听觉体验
- **目的**: 通过改进合成音效质量、添加滤波和包络、统一音效管理，使游戏音效更加柔和、自然、舒适
- **目标用户**: 所有游戏玩家

## 问题分析

### 当前系统架构
游戏使用两个音效管理器：
1. **audioManager**（audio.js）- 用于游戏核心音效（射击、受伤、拾取、击杀等）
2. **soundManager**（soundManager.js）- 用于UI音效和背景音乐

### 刺耳原因
| 问题 | 影响 | 严重程度 |
|------|------|----------|
| 方波/锯齿波缺少低通滤波 | 高频谐波过多，尖锐刺耳 | 高 |
| 音量过高（0.3-0.5） | 听觉过载，疲劳感强 | 高 |
| 缺少ADSR包络 | 声音生硬突兀，没有自然过渡 | 中 |
| 缺少噪声层 | 合成音效太干净，缺乏真实质感 | 中 |
| 两个管理器并存 | 音效风格不一致，维护困难 | 中 |

## 设计方案

### 1. 统一音效管理器

**目标**: 将所有音效播放统一到soundManager

**实现**:
- 在soundManager中添加与AUDIO常量对应的音效映射
- 修改所有调用audioManager.playSound()的地方，改用soundManager.play()
- 保留audioManager作为兼容层（向后兼容）

**文件修改**:
- `js/soundManager.js` - 添加新的音效映射和合成方法
- `js/game.js` - 将audioManager.playSound()替换为soundManager.play()
- `js/boss.js` - 同上
- `js/modules/DamageSystem.js` - 同上
- `js/modules/DropSystem.js` - 同上
- `js/modules/RoomManager.js` - 同上
- `js/skills.js` - 同上
- `js/state.js` - 同上

### 2. 改进合成音效质量

**核心优化技术**:

#### 2.1 添加低通滤波器
- 为每个合成音效添加BiquadFilter低通滤波
- 截止频率根据音效类型调整：
  - 射击类：800-2000Hz
  - 爆炸类：500-1000Hz
  - 拾取/UI类：2000-3000Hz

#### 2.2 波形优化
- 使用三角波替代方波（手枪、点击等）
- 使用正弦波作为基础（拾取、治愈、升级等）
- 锯齿波仅用于特殊效果（Boss警告），但添加强滤波

#### 2.3 ADSR包络
- Attack（攻击期）：快速上升
- Decay（衰减期）：快速衰减到持续值
- Sustain（持续期）：保持稳定音量
- Release（释放期）：缓慢淡出

#### 2.4 噪声层
- 为爆炸、射击等音效添加白噪声/粉红噪声层
- 使用低通滤波后的噪声增加质感

#### 2.5 音量调整
- 射击音效：0.3 → 0.15-0.2
- 爆炸音效：0.4 → 0.2-0.25
- Boss音效：0.4-0.5 → 0.25-0.3
- 受伤音效：0.3 → 0.15
- 拾取音效：0.3 → 0.15

### 3. 音效映射表

| 原始AUDIO常量 | 新SOUND_EFFECTS名称 | 优化方案 |
|---------------|---------------------|----------|
| AUDIO.SHOOT.PISTOL | SOUND_EFFECTS.PISTOL | 三角波+低通滤波+噪声+ADSR |
| AUDIO.SHOOT.LIGHTNING | SOUND_EFFECTS.LASER | 锯齿波+高通滤波+噪声 |
| AUDIO.SHOOT.GRENADE | SOUND_EFFECTS.EXPLOSION | 三角波+低通滤波+噪声+ADSR |
| AUDIO.SHOOT.FLAME | SOUND_EFFECTS.FLAME | 锯齿波+低通滤波+噪声 |
| AUDIO.SHOOT.BOOMERANG | SOUND_EFFECTS.DASH | 噪声+带通滤波 |
| AUDIO.SHOOT.FREEZE | SOUND_EFFECTS.FREEZE | 正弦波+低通滤波 |
| AUDIO.SHOOT.SHOTGUN | SOUND_EFFECTS.SHOTGUN | 三角波+噪声+低通滤波 |
| AUDIO.SHOOT.HOMING | SOUND_EFFECTS.HOMING | 正弦波+噪声+低通滤波 |
| AUDIO.KILL | SOUND_EFFECTS.KILL | 三角波+低通滤波+ADSR |
| AUDIO.PICKUP | SOUND_EFFECTS.PICKUP | 正弦波+ADSR |
| AUDIO.HURT | SOUND_EFFECTS.HURT | 三角波+低通滤波+ADSR |
| AUDIO.BOSS_APPEAR | SOUND_EFFECTS.BOSS | 三角波+低通滤波+ADSR |
| AUDIO.BOSS_ATTACK | SOUND_EFFECTS.BOSS_ATTACK | 三角波+低通滤波+噪声 |
| AUDIO.VICTORY | SOUND_EFFECTS.VICTORY | 正弦波+ADSR |
| AUDIO.GAME_OVER | SOUND_EFFECTS.DEFEAT | 三角波+低通滤波+ADSR |

### 4. 具体合成音效优化

#### 4.1 手枪射击 (synthPistol)
```
波形: 三角波
频率: 800Hz → 200Hz (指数衰减)
低通滤波: 1500Hz
噪声层: 带通滤波白噪声
ADSR: A=0.01s, D=0.02s, S=0.5, R=0.05s
音量: 0.18
```

#### 4.2 闪电射击 (synthLaser)
```
波形: 锯齿波 + 噪声
频率: 2000Hz → 800Hz
高通滤波: 500Hz
低通滤波: 3000Hz
ADSR: A=0.005s, D=0.05s, S=0.3, R=0.05s
音量: 0.15
```

#### 4.3 榴弹爆炸 (synthExplosion)
```
波形: 三角波 + 噪声
频率: 150Hz → 30Hz
低通滤波: 800Hz
噪声层: 低通滤波白噪声
ADSR: A=0.01s, D=0.1s, S=0.4, R=0.2s
音量: 0.22
```

#### 4.4 火焰喷射 (synthFlame)
```
波形: 锯齿波 + 噪声
频率: 300-500Hz (随机)
低通滤波: 1000Hz
噪声层: 带通滤波白噪声
ADSR: A=0.005s, D=0.02s, S=0.6, R=0.03s
音量: 0.12
```

#### 4.5 受伤音效 (synthHurt)
```
波形: 三角波
频率: 400Hz → 100Hz
低通滤波: 800Hz
ADSR: A=0.01s, D=0.05s, S=0.5, R=0.15s
音量: 0.15
```

#### 4.6 击杀音效 (synthKill)
```
波形: 三角波
频率: 400Hz → 80Hz
低通滤波: 600Hz
ADSR: A=0.01s, D=0.08s, S=0.3, R=0.1s
音量: 0.12
```

#### 4.7 Boss登场 (synthBoss)
```
波形: 三角波
频率: 80Hz → 100Hz → 80Hz
低通滤波: 400Hz
ADSR: A=0.05s, D=0.15s, S=0.5, R=0.3s
音量: 0.25
```

### 5. BGM优化

**改进点**:
- 将方波替换为三角波或正弦波
- 添加低通滤波
- 降低整体音量（0.05-0.08 → 0.03-0.05）
- 添加动态音量变化（战斗时略微提升）

## 实施步骤

### 阶段1: 统一音效管理器
1. 在soundManager中添加完整的音效映射
2. 添加所有新的合成音效方法
3. 修改所有调用audioManager的地方

### 阶段2: 优化合成音效
1. 为所有合成音效添加低通滤波器
2. 优化波形选择
3. 添加ADSR包络
4. 添加噪声层
5. 调整音量

### 阶段3: 优化BGM
1. 改进波形选择
2. 添加滤波器
3. 调整音量

### 阶段4: 测试验证
1. 运行游戏测试所有音效
2. 调整参数优化听感

## 预期效果

| 音效类型 | 优化前 | 优化后 |
|----------|--------|--------|
| 手枪射击 | 尖锐刺耳 | 柔和有质感 |
| 爆炸音效 | 刺耳轰鸣 | 低沉有力 |
| 受伤音效 | 尖锐惨叫 | 低沉痛苦 |
| Boss音效 | 吓人刺耳 | 震撼有力 |
| 整体体验 | 听觉疲劳 | 舒适沉浸 |

## 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 音效质量依赖个人听感 | 优化效果可能不符合预期 | 提供音量调节和音效开关 |
| 代码修改范围较大 | 可能引入bug | 分阶段实施，每阶段测试 |
| 滤波器增加计算开销 | 可能影响性能 | 使用简单的BiquadFilter，对性能影响极小 |

---

## 设计审查

请审查上述设计方案，确认是否满意。如有需要修改的地方，请告诉我。