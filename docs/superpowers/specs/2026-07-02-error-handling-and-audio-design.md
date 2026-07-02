# 错误处理与音频系统设计

**日期：** 2026-07-02
**项目：** 像素地牢：枪战冒险
**状态：** 已批准

---

## 一、背景

当前游戏存在两个核心体验短板：
1. **无全局错误兜底** — 游戏循环有try-catch但无全局window.onerror，崩溃后白屏无恢复手段
2. **音频全部为振荡器合成** — BGM只播30秒就停，音效单调缺乏打击感

## 二、错误处理系统

### 2.1 全局错误捕获

在 `main.js` 底部添加：

```javascript
window.onerror = function(msg, url, line, col, error) {
    game && game.handleError(error);
    return true;
};

window.addEventListener('unhandledrejection', (e) => {
    game && game.handleError(e.reason);
    e.preventDefault();
};
```

### 2.2 崩溃界面（Canvas绘制）

在 `Game` 类中新增 `handleError(error)` 方法：
- 停止游戏循环（`this.running = false`）
- 在Canvas上绘制崩溃界面：
  - 半透明黑色遮罩（`rgba(0,0,0,0.85)`）
  - "游戏遇到问题" 标题（红色，36px）
  - 错误信息摘要（灰色，14px）
  - "重试" 按钮（居中偏上）
  - "返回主菜单" 按钮（居中偏下）
- 监听Canvas点击事件，判断按钮区域
- 按钮区域：居中矩形，宽200px高50px，间距20px

### 2.3 恢复机制

- "重试" → `game.restart()` 重新初始化所有系统
- "返回主菜单" → `game.returnToMenu()` 清理并返回菜单
- 恢复前调用 `gameLogic.cleanup()` 清理残留状态

### 2.4 涉及文件

| 文件 | 改动 |
|------|------|
| `js/main.js` | 添加window.onerror/unhandledrejection监听 + handleError()方法 + 崩溃界面渲染逻辑 |

## 三、音频系统

### 3.1 音频资源方案

**BGM（程序化生成，无缝循环）：**

| BGM | 风格 | BPM | 层级 |
|-----|------|-----|------|
| dungeon | 低沉压抑 | 100 | bass + melody + pad |
| boss | 紧张急促 | 150 | bass + melody + percussion + pad |
| menu | 舒缓轻松 | 80 | melody + pad |
| victory | 欢快上行 | 120 | melody + percussion |

每层独立Oscillator + GainNode，通过musicGain混音。循环播放无时限。

**SFX（导入真实8-bit音效文件）：**

| 文件名 | 用途 | 风格 |
|--------|------|------|
| pistol.wav | 手枪射击 | 短促biu声 |
| shotgun.wav | 霰弹枪 | 低沉bang声 |
| lightning.wav | 闪电法杖 | 电弧滋滋 |
| grenade.wav | 榴弹 | 爆炸轰声 |
| flame.wav | 火焰喷射 | 持续呼呼 |
| freeze.wav | 冰冻枪 | 冰裂声 |
| homing.wav | 追踪导弹 | 嗖声 |
| hit.wav | 子弹命中 | 砰声 |
| hurt.wav | 玩家受伤 | 短促痛呼 |
| kill.wav | 击杀敌人 | 消失噗声 |
| pickup.wav | 拾取道具 | 清脆叮声 |
| portal.wav | 传送门 | 嗡鸣声 |
| chest.wav | 宝箱打开 | 解锁+光芒 |
| boss_appear.wav | Boss出场 | 低沉警告 |
| boss_attack.wav | Boss攻击 | 冲击声 |
| victory.wav | 通关 | 胜利旋律 |
| defeat.wav | 死亡 | 下行悲伤 |
| click.wav | UI点击 | 短促咔声 |
| switch.wav | 武器切换 | 切换声 |
| levelup.wav | 升级 | 上行琶音 |
| heal.wav | 治疗 | 上行音阶 |
| shield.wav | 护盾 | 上升合成音 |

来源：OpenGameArt.org / freesound.org（CC0授权）

### 3.2 SoundManager 重构

保留现有 `SoundManager` 架构，改动如下：

1. **预加载系统** — `init()` 中创建所有Audio元素，设置 `preload = 'auto'`，监听 `canplaythrough` 事件
2. **播放方式** — `play(soundName)` 改为 `this.sounds[name].cloneNode().play()` 或回退到振荡器
3. **BGM循环** — `playMusic(type)` 改为Audio元素 `loop = true`，替代30秒限时播放
4. **Fallback** — 文件加载失败时自动降级到振荡器合成

### 3.3 BGM 多层合成架构

```
BGM = BassLayer(低音, 三角波, 60-200Hz)
    + MelodyLayer(旋律, 方波/锯齿波, 200-800Hz)
    + PercussionLayer(节奏, 噪声+滤波, 白噪声)
    + PadLayer(氛围, 正弦波, 100-400Hz, 低音量)
```

每层独立振荡器，通过musicGain混音。使用 `setInterval` 或递归调度实现循环。

### 3.4 项目结构

```
pixel-dungeon/
├── assets/
│   └── audio/
│       └── sfx/          # 22个音效文件
│           ├── pistol.wav
│           ├── shotgun.wav
│           └── ...
```

### 3.5 涉及文件

| 文件 | 改动 |
|------|------|
| `js/soundManager.js` | 重构：预加载Audio元素 + play()用Audio + BGM循环 + fallback |
| `js/audio.js` | 保留作为fallback，统一调用由SoundManager处理 |
| `assets/audio/sfx/` | 新增22个音效文件 |

## 四、执行顺序

1. **阶段1：错误处理**（独立，不依赖音频）
   - 添加全局错误监听
   - 实现handleError()和崩溃界面
   - 测试：手动抛出错误验证恢复

2. **阶段2：音效文件获取**
   - 从OpenGameArt/freesound下载CC0音效
   - 统一格式为wav/ogg
   - 放入assets/audio/sfx/

3. **阶段3：SoundManager重构**
   - 添加预加载系统
   - 重构play()方法
   - 实现BGM循环
   - 测试所有音效和BGM

4. **阶段4：集成测试**
   - 全流程测试：菜单→战斗→Boss→通关
   - 错误恢复测试
   - 音频在不同浏览器兼容性测试
