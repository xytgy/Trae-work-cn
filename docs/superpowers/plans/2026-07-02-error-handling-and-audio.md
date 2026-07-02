# 错误处理与音频系统实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add global error handling with crash recovery, and replace oscillator-only audio with real 8-bit sound files plus procedural looping BGM.

**Architecture:** Two independent subsystems executed in parallel. Error handling adds a global catch + Canvas crash overlay to `main.js`. Audio system refactors `SoundManager` to preload Audio elements for SFX and implement multi-layer procedural BGM with infinite looping.

**Tech Stack:** HTML5 Canvas, Web Audio API, vanilla JavaScript

---

## File Structure

```
pixel-dungeon/
├── assets/
│   └── audio/
│       └── sfx/                    # 新增：22个音效文件
│           ├── pistol.wav
│           ├── shotgun.wav
│           ├── lightning.wav
│           ├── grenade.wav
│           ├── flame.wav
│           ├── freeze.wav
│           ├── homing.wav
│           ├── hit.wav
│           ├── hurt.wav
│           ├── kill.wav
│           ├── pickup.wav
│           ├── portal.wav
│           ├── chest.wav
│           ├── boss_appear.wav
│           ├── boss_attack.wav
│           ├── victory.wav
│           ├── defeat.wav
│           ├── click.wav
│           ├── switch.wav
│           ├── levelup.wav
│           ├── heal.wav
│           └── shield.wav
├── js/
│   ├── main.js                     # 修改：添加全局错误监听 + handleError()
│   └── soundManager.js             # 修改：重构为Audio预加载 + BGM循环
```

---

## Task 1: 全局错误捕获与崩溃界面

**Files:**
- Modify: `pixel-dungeon/js/main.js`

- [ ] **Step 1: 在Game类中添加handleError方法**

在 `main.js` 的 `Game` 类中，在 `handleGameError` 方法之后添加：

```javascript
/**
 * 处理未捕获的全局错误
 * @param {Error} error - 错误对象
 */
handleError(error) {
    console.error('[GLOBAL ERROR]', error);
    
    // 停止游戏循环
    this.running = false;
    this.menuLoopRunning = false;
    if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }
    if (this.menuAnimationFrameId) {
        cancelAnimationFrame(this.menuAnimationFrameId);
        this.menuAnimationFrameId = null;
    }
    
    // 保存错误信息用于渲染
    this._crashError = error;
    this._crashScreenActive = true;
    
    // 渲染崩溃界面
    this.renderCrashScreen();
}

/**
 * 渲染崩溃界面到Canvas
 */
renderCrashScreen() {
    const canvas = renderer.getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const w = canvas.width;
    const h = canvas.height;
    
    // 半透明黑色遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, w, h);
    
    // 标题
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏遇到问题', w / 2, h / 2 - 100);
    
    // 错误信息
    ctx.fillStyle = '#888888';
    ctx.font = '14px "Courier New", monospace';
    const errorMsg = this._crashError ? (this._crashError.message || '未知错误') : '未知错误';
    ctx.fillText(errorMsg.substring(0, 60), w / 2, h / 2 - 50);
    
    // "重试" 按钮
    this._crashRetryBtn = { x: w / 2 - 100, y: h / 2, w: 200, h: 50 };
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(this._crashRetryBtn.x, this._crashRetryBtn.y, this._crashRetryBtn.w, this._crashRetryBtn.h);
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.strokeRect(this._crashRetryBtn.x, this._crashRetryBtn.y, this._crashRetryBtn.w, this._crashRetryBtn.h);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillText('重试', w / 2, h / 2 + 25);
    
    // "返回主菜单" 按钮
    this._crashMenuBtn = { x: w / 2 - 100, y: h / 2 + 70, w: 200, h: 50 };
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(this._crashMenuBtn.x, this._crashMenuBtn.y, this._crashMenuBtn.w, this._crashMenuBtn.h);
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.strokeRect(this._crashMenuBtn.x, this._crashMenuBtn.y, this._crashMenuBtn.w, this._crashMenuBtn.h);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillText('返回主菜单', w / 2, h / 2 + 95);
}

/**
 * 处理崩溃界面的点击
 * @param {number} x - Canvas X坐标
 * @param {number} y - Canvas Y坐标
 * @returns {boolean} 是否被崩溃界面处理
 */
handleCrashClick(x, y) {
    if (!this._crashScreenActive) return false;
    
    // 检查"重试"按钮
    if (this._crashRetryBtn && 
        x >= this._crashRetryBtn.x && x <= this._crashRetryBtn.x + this._crashRetryBtn.w &&
        y >= this._crashRetryBtn.y && y <= this._crashRetryBtn.y + this._crashRetryBtn.h) {
        this._crashScreenActive = false;
        this._crashError = null;
        this.restart();
        return true;
    }
    
    // 检查"返回主菜单"按钮
    if (this._crashMenuBtn && 
        x >= this._crashMenuBtn.x && x <= this._crashMenuBtn.x + this._crashMenuBtn.w &&
        y >= this._crashMenuBtn.y && y <= this._crashMenuBtn.y + this._crashMenuBtn.h) {
        this._crashScreenActive = false;
        this._crashError = null;
        this.returnToMenu();
        return true;
    }
    
    return true; // 拦截所有点击，防止穿透
}
```

- [ ] **Step 2: 在handleCanvasClick中集成崩溃界面拦截**

找到 `main.js` 中的 `handleCanvasClick` 方法，在方法最开头添加：

```javascript
// 如果崩溃界面激活，拦截所有点击
if (this._crashScreenActive) {
    this.handleCrashClick(x, y);
    return;
}
```

需要在方法开头、获取Canvas坐标之后添加此逻辑。修改后 `handleCanvasClick` 开头部分为：

```javascript
handleCanvasClick(e) {
    // 获取Canvas坐标
    const rect = renderer.getCanvas().getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    const scaleY = GAME_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // 如果崩溃界面激活，拦截所有点击
    if (this._crashScreenActive) {
        this.handleCrashClick(x, y);
        return;
    }
    
    // ... 后续原有代码
```

- [ ] **Step 3: 在constructor中初始化崩溃状态**

在 `Game` 类的 `constructor` 中添加：

```javascript
// 崩溃界面状态
this._crashScreenActive = false;
this._crashError = null;
this._crashRetryBtn = null;
this._crashMenuBtn = null;
```

- [ ] **Step 4: 添加全局错误监听**

在 `main.js` 底部，`window.addEventListener('keydown', ...)` 之后添加：

```javascript
// ==================== 全局错误捕获 ====================
window.onerror = function(msg, url, line, col, error) {
    console.error('[WINDOW ONERROR]', { msg, url, line, col, error });
    if (game) {
        game.handleError(error || new Error(msg));
    }
    return true; // 防止默认控制台报错
};

window.addEventListener('unhandledrejection', (e) => {
    console.error('[UNHANDLED REJECTION]', e.reason);
    if (game) {
        game.handleError(e.reason instanceof Error ? e.reason : new Error(String(e.reason)));
    }
    e.preventDefault();
});
```

- [ ] **Step 5: 测试错误恢复**

在浏览器控制台手动执行以下代码验证：

```javascript
// 测试1：抛出同步错误
throw new Error('测试错误恢复');

// 测试2：抛出异步错误
Promise.reject(new Error('测试Promise错误'));
```

预期：游戏停止，Canvas上显示崩溃界面，点击"重试"可恢复。

- [ ] **Step 6: 提交**

```bash
git add js/main.js
git commit -m "feat: add global error handling with Canvas crash overlay"
```

---

## Task 2: 获取8-bit音效文件

**Files:**
- Create: `pixel-dungeon/assets/audio/sfx/` (22个文件)

- [ ] **Step 1: 创建音效目录**

```bash
mkdir -p pixel-dungeon/assets/audio/sfx
```

- [ ] **Step 2: 下载CC0音效资源**

从以下来源获取8-bit风格音效（CC0/CC-BY授权）：

| 来源 | URL | 说明 |
|------|-----|------|
| OpenGameArt | https://opengameart.org/content/8-bit-sound-effects-pack | 8-bit音效包 |
| freesound | https://freesound.org/search/?q=8bit+game | 搜索8bit游戏音效 |
| Kenney | https://kenney.nl/assets/game-sounds | 免费游戏音效包 |

需要的22个音效文件对应关系：

| 文件名 | 搜索关键词 | 描述 |
|--------|-----------|------|
| pistol.wav | "laser shoot 8bit" | 短促射击声 |
| shotgun.wav | "shotgun 8bit" | 低沉枪声 |
| lightning.wav | "electric zap 8bit" | 电弧声 |
| grenade.wav | "explosion 8bit" | 爆炸声 |
| flame.wav | "fire whoosh 8bit" | 火焰声 |
| freeze.wav | "ice crack 8bit" | 冰裂声 |
| homing.wav | "missile launch 8bit" | 导弹声 |
| hit.wav | "hit impact 8bit" | 命中声 |
| hurt.wav | "hurt pain 8bit" | 受伤声 |
| kill.wav | "enemy death 8bit" | 死亡声 |
| pickup.wav | "coin collect 8bit" | 拾取声 |
| portal.wav | "portal warp 8bit" | 传送声 |
| chest.wav | "chest open 8bit" | 宝箱声 |
| boss_appear.wav | "boss warning 8bit" | Boss警告 |
| boss_attack.wav | "boss attack 8bit" | Boss攻击 |
| victory.wav | "victory fanfare 8bit" | 胜利旋律 |
| defeat.wav | "game over 8bit" | 失败旋律 |
| click.wav | "ui click 8bit" | 点击声 |
| switch.wav | "menu switch 8bit" | 切换声 |
| levelup.wav | "level up 8bit" | 升级声 |
| heal.wav | "heal restore 8bit" | 治疗声 |
| shield.wav | "shield activate 8bit" | 护盾声 |

**注意：** 如果无法下载，可以用Audacity自行生成简单的8-bit波形音效（方波/锯齿波+包络）。

- [ ] **Step 3: 统一音频格式**

所有文件统一为：
- 格式：WAV (PCM 16-bit)
- 采样率：22050Hz（节省体积，8-bit风格不需要高采样率）
- 声道：单声道

```bash
# 如果用ffmpeg批量转换（可选）
for f in pixel-dungeon/assets/audio/sfx/*.mp3; do
    ffmpeg -i "$f" -ar 22050 -ac 1 "${f%.mp3}.wav"
done
```

- [ ] **Step 4: 验证文件存在**

```bash
ls -la pixel-dungeon/assets/audio/sfx/
# 应该看到22个.wav文件
```

- [ ] **Step 5: 提交**

```bash
git add pixel-dungeon/assets/audio/sfx/
git commit -m "feat: add 8-bit sound effect assets (22 files, CC0)"
```

---

## Task 3: SoundManager 重构 — 预加载系统

**Files:**
- Modify: `pixel-dungeon/js/soundManager.js`

- [ ] **Step 1: 添加音频文件映射表**

在 `SoundManager` 类的 `constructor` 中，在 `this.soundCache = {};` 之后添加：

```javascript
// 音效文件映射（soundName → 文件路径）
this.soundFiles = {
    'pistol': 'assets/audio/sfx/pistol.wav',
    'shotgun': 'assets/audio/sfx/shotgun.wav',
    'lightning': 'assets/audio/sfx/lightning.wav',
    'grenade': 'assets/audio/sfx/grenade.wav',
    'flame': 'assets/audio/sfx/flame.wav',
    'freeze': 'assets/audio/sfx/freeze.wav',
    'homing': 'assets/audio/sfx/homing.wav',
    'hit': 'assets/audio/sfx/hit.wav',
    'hurt': 'assets/audio/sfx/hurt.wav',
    'kill': 'assets/audio/sfx/kill.wav',
    'pickup': 'assets/audio/sfx/pickup.wav',
    'portal': 'assets/audio/sfx/portal.wav',
    'chest': 'assets/audio/sfx/chest.wav',
    'boss_appear': 'assets/audio/sfx/boss_appear.wav',
    'boss_attack': 'assets/audio/sfx/boss_attack.wav',
    'victory': 'assets/audio/sfx/victory.wav',
    'defeat': 'assets/audio/sfx/defeat.wav',
    'click': 'assets/audio/sfx/click.wav',
    'switch': 'assets/audio/sfx/switch.wav',
    'levelup': 'assets/audio/sfx/levelup.wav',
    'heal': 'assets/audio/sfx/heal.wav',
    'shield': 'assets/audio/sfx/shield.wav'
};

// 已加载的Audio元素缓存
this.audioCache = {};

// 预加载完成标记
this.preloaded = false;
```

- [ ] **Step 2: 添加预加载方法**

在 `SoundManager` 类中，`ensureRunning()` 方法之后添加：

```javascript
/**
 * 预加载所有音效文件
 * @returns {Promise} 预加载完成的Promise
 */
preloadSounds() {
    return new Promise((resolve) => {
        const entries = Object.entries(this.soundFiles);
        let loaded = 0;
        const total = entries.length;
        
        if (total === 0) {
            this.preloaded = true;
            resolve();
            return;
        }
        
        const checkComplete = () => {
            loaded++;
            if (loaded >= total) {
                this.preloaded = true;
                console.log(`音效预加载完成: ${total}个文件`);
                resolve();
            }
        };
        
        entries.forEach(([name, path]) => {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.volume = 1.0;
            
            audio.oncanplaythrough = () => {
                this.audioCache[name] = audio;
                checkComplete();
            };
            
            audio.onerror = () => {
                console.warn(`音效加载失败: ${name} (${path})，将使用合成音效`);
                this.audioCache[name] = null; // 标记为失败，fallback到振荡器
                checkComplete();
            };
            
            audio.src = path;
        });
    });
}
```

- [ ] **Step 3: 修改init()方法添加预加载**

找到 `SoundManager` 的 `init()` 方法，在 `this.initialized = true;` 之后、`return true;` 之前添加：

```javascript
// 预加载音效文件（异步，不阻塞初始化）
this.preloadSounds().catch(err => {
    console.warn('音效预加载失败:', err);
});
```

- [ ] **Step 4: 验证预加载逻辑**

在浏览器中打开游戏，在控制台执行：

```javascript
soundManager.preloadSounds().then(() => {
    console.log('预加载完成', Object.keys(soundManager.audioCache).length, '个音效');
});
```

预期：输出"预加载完成 22 个音效"（如果文件都存在）。

- [ ] **Step 5: 提交**

```bash
git add js/soundManager.js
git commit -m "feat: add audio preloading system to SoundManager"
```

---

## Task 4: SoundManager 重构 — 播放系统

**Files:**
- Modify: `pixel-dungeon/js/soundManager.js`

- [ ] **Step 1: 重写play()方法**

替换 `SoundManager` 类中的 `play(soundName)` 方法：

```javascript
/**
 * 播放音效
 * @param {string} soundName - 音效名称
 */
play(soundName) {
    if (!this.initialized) return;
    this.ensureRunning();
    
    // 尝试播放预加载的音频文件
    if (this.preloaded && this.audioCache[soundName]) {
        this.playFromCache(soundName);
        return;
    }
    
    // Fallback: 使用振荡器合成
    this.playSynthesized(soundName);
}

/**
 * 从缓存播放音频
 * @param {string} soundName - 音效名称
 */
playFromCache(soundName) {
    const audio = this.audioCache[soundName];
    if (!audio) return;
    
    // 克隆Audio元素以支持重叠播放
    const clone = audio.cloneNode(true);
    clone.volume = this.sfxVolume;
    
    // 播放完成后清理
    clone.onended = () => {
        clone.src = '';
    };
    
    clone.play().catch(e => {
        console.warn('音效播放失败:', e);
    });
}

/**
 * 使用振荡器合成音效（fallback）
 * @param {string} soundName - 音效名称
 */
playSynthesized(soundName) {
    // 保留原有的振荡器合成逻辑作为fallback
    // 以下是原有switch语句的简化版本
    switch (soundName) {
        case SOUND_EFFECTS.PISTOL:
            this.playSynthPistol();
            break;
        case SOUND_EFFECTS.SHOTGUN:
            this.playSynthShotgun();
            break;
        case SOUND_EFFECTS.EXPLOSION:
            this.playSynthExplosion();
            break;
        case SOUND_EFFECTS.HIT:
            this.playSynthHit();
            break;
        case SOUND_EFFECTS.COIN:
            this.playSynthCoin();
            break;
        case SOUND_EFFECTS.PICKUP:
            this.playSynthPickup();
            break;
        case SOUND_EFFECTS.HURT:
            this.playSynthHurt();
            break;
        case SOUND_EFFECTS.DEATH:
            this.playSynthDeath();
            break;
        case SOUND_EFFECTS.DASH:
            this.playSynthDash();
            break;
        case SOUND_EFFECTS.SHIELD:
            this.playSynthShield();
            break;
        case SOUND_EFFECTS.HEAL:
            this.playSynthHeal();
            break;
        case SOUND_EFFECTS.LEVELUP:
            this.playSynthLevelUp();
            break;
        case SOUND_EFFECTS.CLICK:
            if (this.uiSoundEnabled) this.playSynthClick();
            break;
        case SOUND_EFFECTS.SWITCH:
            if (this.uiSoundEnabled) this.playSynthSwitch();
            break;
        case SOUND_EFFECTS.CHEST:
            this.playSynthChest();
            break;
        case SOUND_EFFECTS.PORTAL:
            this.playSynthPortal();
            break;
        case SOUND_EFFECTS.BOSS:
            this.playSynthBoss();
            break;
        case SOUND_EFFECTS.VICTORY:
            this.playSynthVictory();
            break;
        case SOUND_EFFECTS.DEFEAT:
            this.playSynthDefeat();
            break;
        case SOUND_EFFECTS.LASER:
            this.playSynthLaser();
            break;
        default:
            console.warn('未知音效:', soundName);
    }
}
```

- [ ] **Step 2: 将原有合成方法重命名为playSynth*前缀**

将原有的 `playPistol()`, `playShotgun()` 等方法重命名为 `playSynthPistol()`, `playSynthShotgun()` 等。这是一个批量重命名：

| 原方法名 | 新方法名 |
|----------|----------|
| `playPistol()` | `playSynthPistol()` |
| `playShotgun()` | `playSynthShotgun()` |
| `playLaser()` | `playSynthLaser()` |
| `playExplosion()` | `playSynthExplosion()` |
| `playHit()` | `playSynthHit()` |
| `playCoin()` | `playSynthCoin()` |
| `playPickup()` | `playSynthPickup()` |
| `playHurt()` | `playSynthHurt()` |
| `playDeath()` | `playSynthDeath()` |
| `playDash()` | `playSynthDash()` |
| `playShield()` | `playSynthShield()` |
| `playHeal()` | `playSynthHeal()` |
| `playLevelUp()` | `playSynthLevelUp()` |
| `playClick()` | `playSynthClick()` |
| `playSwitch()` | `playSynthSwitch()` |
| `playChest()` | `playSynthChest()` |
| `playPortal()` | `playSynthPortal()` |
| `playBoss()` | `playSynthBoss()` |
| `playVictory()` | `playSynthVictory()` |
| `playDefeat()` | `playSynthDefeat()` |

使用编辑器的批量替换功能完成。

- [ ] **Step 3: 测试播放系统**

在浏览器控制台测试：

```javascript
// 测试1：播放一个音效
soundManager.play('pistol');

// 测试2：播放所有音效
const sounds = ['pistol', 'shotgun', 'hit', 'hurt', 'kill', 'pickup', 'click'];
sounds.forEach((s, i) => setTimeout(() => soundManager.play(s), i * 500));

// 测试3：检查预加载状态
console.log('预加载:', soundManager.preloaded);
console.log('缓存数量:', Object.keys(soundManager.audioCache).length);
```

- [ ] **Step 4: 提交**

```bash
git add js/soundManager.js
git commit -m "feat: refactor SoundManager play() to use preloaded Audio with synth fallback"
```

---

## Task 5: SoundManager 重构 — BGM循环系统

**Files:**
- Modify: `pixel-dungeon/js/soundManager.js`

- [ ] **Step 1: 重写playMusic()方法**

替换 `SoundManager` 类中的 `playMusic(musicType)` 方法：

```javascript
/**
 * 播放背景音乐（多层合成，无限循环）
 * @param {string} musicType - 音乐类型 ('dungeon'|'boss'|'menu'|'victory')
 */
playMusic(musicType = 'dungeon') {
    this.stopMusic();
    
    const musicConfigs = {
        dungeon: {
            bpm: 100,
            layers: ['bass', 'melody', 'pad']
        },
        boss: {
            bpm: 150,
            layers: ['bass', 'melody', 'percussion', 'pad']
        },
        menu: {
            bpm: 80,
            layers: ['melody', 'pad']
        },
        victory: {
            bpm: 120,
            layers: ['melody', 'percussion']
        }
    };
    
    const config = musicConfigs[musicType] || musicConfigs.dungeon;
    this.startProceduralBGM(musicType, config);
    this.currentMusic = musicType;
}

/**
 * 启动程序化BGM
 * @param {string} musicType - 音乐类型
 * @param {object} config - BGM配置
 */
startProceduralBGM(musicType, config) {
    const beatDuration = 60 / config.bpm; // 每拍秒数
    const barDuration = beatDuration * 4;  // 每小节秒数
    
    // 音乐数据定义
    const musicData = this.getMusicData(musicType);
    
    // 为每个层级创建调度器
    config.layers.forEach(layerName => {
        const layer = musicData[layerName];
        if (!layer) return;
        
        this.scheduleLayer(layerName, layer, beatDuration, barDuration);
    });
}

/**
 * 获取音乐数据
 * @param {string} musicType - 音乐类型
 * @returns {object} 各层级的音符数据
 */
getMusicData(musicType) {
    const musicData = {
        dungeon: {
            bass: {
                type: 'triangle',
                volume: 0.08,
                notes: [
                    { freq: 65.41, beats: [0, 2] },      // C2
                    { freq: 73.42, beats: [1, 3] },      // D2
                    { freq: 82.41, beats: [0, 2] },      // E2
                    { freq: 73.42, beats: [1, 3] }       // D2
                ]
            },
            melody: {
                type: 'square',
                volume: 0.05,
                notes: [
                    { freq: 261.63, beats: [0] },         // C4
                    { freq: 293.66, beats: [1] },         // D4
                    { freq: 329.63, beats: [2] },         // E4
                    { freq: 349.23, beats: [3] },         // F4
                    { freq: 392.00, beats: [0, 2] },      // G4
                    { freq: 349.23, beats: [1, 3] }       // F4
                ]
            },
            pad: {
                type: 'sine',
                volume: 0.03,
                notes: [
                    { freq: 130.81, beats: [0], duration: 4 },  // C3 持续整小节
                    { freq: 164.81, beats: [0], duration: 4 }   // E3 持续整小节
                ]
            }
        },
        boss: {
            bass: {
                type: 'sawtooth',
                volume: 0.07,
                notes: [
                    { freq: 55.00, beats: [0, 1, 2, 3] },  // A1 连续
                    { freq: 61.74, beats: [0, 1, 2, 3] }   // B1 连续
                ]
            },
            melody: {
                type: 'square',
                volume: 0.06,
                notes: [
                    { freq: 440.00, beats: [0] },           // A4
                    { freq: 493.88, beats: [0.5] },         // B4
                    { freq: 523.25, beats: [1] },           // C5
                    { freq: 493.88, beats: [1.5] },         // B4
                    { freq: 440.00, beats: [2] },           // A4
                    { freq: 392.00, beats: [2.5] },         // G4
                    { freq: 349.23, beats: [3] },           // F4
                    { freq: 392.00, beats: [3.5] }          // G4
                ]
            },
            percussion: {
                type: 'noise',
                volume: 0.04,
                notes: [
                    { freq: 0, beats: [0, 2] },             // 强拍
                    { freq: 0, beats: [1, 3], volume: 0.02 } // 弱拍
                ]
            },
            pad: {
                type: 'sine',
                volume: 0.02,
                notes: [
                    { freq: 220.00, beats: [0], duration: 4 },  // A3
                    { freq: 277.18, beats: [0], duration: 4 }   // C#4
                ]
            }
        },
        menu: {
            melody: {
                type: 'sine',
                volume: 0.06,
                notes: [
                    { freq: 392.00, beats: [0] },           // G4
                    { freq: 440.00, beats: [1] },           // A4
                    { freq: 493.88, beats: [2] },           // B4
                    { freq: 523.25, beats: [3] },           // C5
                    { freq: 493.88, beats: [2] },           // B4
                    { freq: 440.00, beats: [1] },           // A4
                    { freq: 392.00, beats: [0] },           // G4
                    { freq: 349.23, beats: [3] }            // F4
                ]
            },
            pad: {
                type: 'sine',
                volume: 0.025,
                notes: [
                    { freq: 196.00, beats: [0], duration: 4 },  // G3
                    { freq: 261.63, beats: [0], duration: 4 }   // C4
                ]
            }
        },
        victory: {
            melody: {
                type: 'square',
                volume: 0.06,
                notes: [
                    { freq: 523.25, beats: [0] },           // C5
                    { freq: 659.25, beats: [1] },           // E5
                    { freq: 783.99, beats: [2] },           // G5
                    { freq: 1046.50, beats: [3] }           // C6
                ]
            },
            percussion: {
                type: 'noise',
                volume: 0.03,
                notes: [
                    { freq: 0, beats: [0, 1, 2, 3] }
                ]
            }
        }
    };
    
    return musicData[musicType] || musicData.dungeon;
}

/**
 * 调度一个音乐层级的播放
 * @param {string} layerName - 层级名称
 * @param {object} layerData - 层级数据
 * @param {number} beatDuration - 每拍秒数
 * @param {number} barDuration - 每小节秒数
 */
scheduleLayer(layerName, layerData, beatDuration, barDuration) {
    const scheduleAhead = 0.2; // 提前调度时间（秒）
    const loopInterval = barDuration * 1000; // 循环间隔（毫秒）
    
    const scheduleBar = () => {
        if (!this.currentMusic) return;
        
        const now = this.ctx.currentTime;
        
        layerData.notes.forEach(note => {
            const noteTime = now + note.beats[0] * beatDuration;
            const duration = (note.duration || 0.5) * beatDuration;
            const volume = (note.volume !== undefined ? note.volume : layerData.volume);
            
            if (layerData.type === 'noise') {
                this.scheduleNoise(noteTime, duration, volume);
            } else {
                this.scheduleNote(noteTime, duration, note.freq, layerData.type, volume);
            }
        });
    };
    
    // 立即调度第一小节
    scheduleBar();
    
    // 设置循环调度
    const intervalId = setInterval(() => {
        if (!this.currentMusic) {
            clearInterval(intervalId);
            return;
        }
        scheduleBar();
    }, loopInterval);
    
    this.musicOscillators.push({ stop: () => clearInterval(intervalId) });
}

/**
 * 调度单个音符
 */
scheduleNote(time, duration, frequency, type, volume) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.musicGain);
    
    osc.type = type;
    osc.frequency.value = frequency;
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.02);
    gain.gain.setValueAtTime(volume, time + duration - 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
    osc.start(time);
    osc.stop(time + duration + 0.01);
    
    this.musicOscillators.push(osc);
}

/**
 * 调度噪声打击乐
 */
scheduleNoise(time, duration, volume) {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    
    noise.start(time);
    noise.stop(time + duration);
    
    this.musicOscillators.push(noise);
}
```

- [ ] **Step 2: 保留stopMusic()方法不变**

现有的 `stopMusic()` 方法已经能正确清理 `musicOscillators` 数组，无需修改。

- [ ] **Step 3: 测试BGM循环**

在浏览器控制台测试：

```javascript
// 测试1：播放地牢BGM
soundManager.playMusic('dungeon');

// 等待30秒以上，验证BGM仍在播放（之前30秒会停止）

// 测试2：切换到Boss音乐
soundManager.playMusic('boss');

// 测试3：停止音乐
soundManager.stopMusic();
```

预期：BGM持续循环播放，不会在30秒后停止。

- [ ] **Step 4: 提交**

```bash
git add js/soundManager.js
git commit -m "feat: implement infinite looping procedural BGM with multi-layer synthesis"
```

---

## Task 6: 音频系统集成测试

**Files:**
- No new files, testing only

- [ ] **Step 1: 测试错误恢复流程**

1. 打开游戏，进入主菜单
2. 在控制台执行 `throw new Error('test')`
3. 验证：Canvas显示崩溃界面
4. 点击"重试"
5. 验证：游戏重新初始化，可正常操作

- [ ] **Step 2: 测试音效播放**

1. 打开游戏，进入主菜单
2. 点击"开始游戏"
3. 验证：按钮点击有click音效
4. 进入战斗，射击敌人
5. 验证：射击有对应武器音效
6. 击杀敌人
7. 验证：有击杀音效

- [ ] **Step 3: 测试BGM**

1. 打开游戏
2. 验证：主菜单有menu BGM循环播放
3. 开始游戏
4. 验证：切换到dungeon BGM
5. 等待60秒
6. 验证：BGM仍在播放（之前30秒会停）
7. 进入Boss房
8. 验证：切换到boss BGM

- [ ] **Step 4: 测试音频fallback**

1. 临时重命名一个音效文件（如pistol.wav → pistol.wav.bak）
2. 射击
3. 验证：控制台显示"音效加载失败"警告，但仍能播放合成音效
4. 恢复文件名

- [ ] **Step 5: 跨浏览器测试**

在以下浏览器中测试基本功能：
- Chrome
- Firefox
- Safari（macOS）
- Edge

- [ ] **Step 6: 最终提交**

```bash
git add -A
git commit -m "feat: complete error handling and audio system upgrade

- Add global window.onerror/unhandledrejection catch
- Add Canvas crash overlay with retry/menu buttons
- Import 22 CC0 8-bit sound effect files
- Refactor SoundManager with Audio preloading + synth fallback
- Implement infinite looping procedural BGM (dungeon/boss/menu/victory)
- Multi-layer synthesis: bass + melody + percussion + pad"
```
