# 像素地牢：枪战冒险 — 先稳后优实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将游戏从"部分可用的 Demo"提升到"全流程稳定的可发布产品"，按阶段执行：第0阶段（稳定性修复）→ 第1阶段（分支路线）→ 第2阶段（精致度提升）

**Architecture:** 渐进式修复和优化，每个阶段完成后进行全流程测试，确保无回归问题。采用防御性编程策略：全局错误捕获、空值检查、参数验证。

**Tech Stack:** 原生 JavaScript (ES6+), HTML5 Canvas, Web Audio API, localStorage

---

## 第0阶段：全流程稳定性修复

### Task 1: 游戏循环全局错误捕获

**Files:**
- Modify: `js/main.js:771-819`

- [ ] **Step 1: 添加全局错误捕获到游戏循环**

在 `gameLoop` 方法中添加 try-catch 包裹：

```javascript
gameLoop(currentTime) {
    if (!this.running) return;
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    renderer.updateFps(currentTime);
    const clampedDelta = Math.min(deltaTime, DELTA_TIME_MAX);
    
    if (gameState.isPlaying()) {
        try {
            this.gameLogic.update(clampedDelta);
            if (particleSystem) {
                particleSystem.update(clampedDelta);
            }
            if (typeof tutorialManager !== 'undefined' && tutorialManager.active) {
                tutorialManager.update(clampedDelta);
            }
            this.checkPortalCollision();
            this.checkGameEnd();
        } catch (error) {
            console.error('[GAME LOOP ERROR]', error);
            this.handleGameError(error);
        }
    }
    
    try {
        this.gameLogic.render();
        if (particleSystem && gameState.isPlaying()) {
            particleSystem.render(renderer.ctx);
        }
        uiManager.update(clampedDelta);
        uiManager.render();
    } catch (error) {
        console.error('[RENDER ERROR]', error);
    }
    
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
}
```

- [ ] **Step 2: 添加 handleGameError 方法**

```javascript
handleGameError(error) {
    console.error('[GAME ERROR] 游戏运行时发生错误:', error);
    console.error('错误堆栈:', error.stack);
    
    if (gameState.isState(GAME_STATE.PLAYING)) {
        if (confirm('游戏运行时出现错误，是否继续游戏？')) {
            return;
        } else {
            this.returnToMenu();
        }
    }
}
```

- [ ] **Step 3: 添加菜单循环错误捕获**

在 `menuLoop` 方法中添加 try-catch：

```javascript
menuLoop(currentTime) {
    if (!this.menuLoopRunning) return;
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    renderer.updateFps(currentTime);
    const clampedDelta = Math.min(deltaTime, DELTA_TIME_MAX);
    
    try {
        if (this.gameLogic) {
            this.gameLogic.render();
        }
        uiManager.update(clampedDelta);
        uiManager.render();
    } catch (error) {
        console.error('[MENU LOOP ERROR]', error);
    }
    
    this.menuAnimationFrameId = requestAnimationFrame(this.menuLoop.bind(this));
}
```

- [ ] **Step 4: 测试验证**

运行游戏，触发一个错误（如在浏览器控制台执行 `particleSystem = null`），验证游戏不会崩溃。

---

### Task 2: Boss战稳定性修复

**Files:**
- Modify: `js/boss.js`

- [ ] **Step 1: 添加空值检查到 Boss 构造函数**

```javascript
constructor(x, y, { eventBus } = {}) {
    this.eventBus = eventBus || null;
    this.x = typeof x === 'number' ? x : 0;
    this.y = typeof y === 'number' ? y : 0;
    // ... 其余初始化代码
}
```

- [ ] **Step 2: 添加空值检查到 update 方法**

```javascript
update(deltaTime, player, gameLogic) {
    if (!this.alive && !this.isDying) return;
    if (typeof deltaTime !== 'number') deltaTime = 0;
    if (!player || !gameLogic) return;
    
    // ... 其余更新代码
}
```

- [ ] **Step 3: 修复 summonEnemies 中的 setTimeout 内存泄漏**

```javascript
summonEnemies(player, gameLogic) {
    if (!player || !gameLogic) return;
    
    const count = BOSS.PHASE2.SUMMON_COUNT;
    
    for (let i = 0; i < count; i++) {
        // ... 召唤位置计算代码
        
        const cancelToken = { cancelled: false };
        this.summonTokens.push(cancelToken);
        
        this.summonEffects.push({
            x: spawnX,
            y: spawnY,
            timer: BOSS.SUMMON_POSITION.EFFECT_DURATION,
            cancelToken: cancelToken
        });
        
        const summonTimeout = setTimeout(() => {
            if (cancelToken.cancelled) return;
            if (!this.alive) return;
            if (!gameLogic || !gameLogic.enemies) return;
            
            const slime = new Slime(spawnX, spawnY);
            slime.isSummoned = true;
            slime.fadeIn = true;
            slime.fadeInTimer = BOSS.SUMMON_POSITION.FADE_IN_DURATION;
            
            gameLogic.enemies.push(slime);
        }, BOSS.SUMMON_POSITION.EFFECT_DURATION);
        
        cancelToken.timeoutId = summonTimeout;
    }
}
```

- [ ] **Step 4: 添加 Boss 死亡时清理定时器**

```javascript
die(gameLogic) {
    this.alive = false;
    this.isDying = true;
    this.deathTimer = this.deathDuration;
    
    this.summonTokens.forEach(token => {
        token.cancelled = true;
        if (token.timeoutId) {
            clearTimeout(token.timeoutId);
        }
    });
    this.summonTokens = [];
    this.summonEffects = [];
    
    if (this.eventBus) {
        this.eventBus.publish('BOSS_DEATH', { boss: this });
    }
    
    audioManager.playSound(AUDIO.BOSS_DEATH);
}
```

- [ ] **Step 5: 添加激光攻击参数验证**

```javascript
updateLaser(deltaTime, player, gameLogic) {
    if (!this.laserActive) return;
    if (!player || !gameLogic) return;
    
    this.laserTimer -= deltaTime;
    
    if (this.laserTimer <= 0) {
        if (this.laserWarning) {
            this.laserWarning = false;
            this.laserTimer = BOSS.PHASE3.LASER_DURATION;
        } else {
            this.laserActive = false;
            return;
        }
    }
    
    // 验证渲染参数
    const ctx = renderer && renderer.ctx;
    if (!ctx) return;
    
    // ... 激光渲染代码
}
```

- [ ] **Step 6: 添加阶段转换边界检查**

```javascript
checkPhaseTransition() {
    const healthPercent = this.health / this.maxHealth;
    
    if (healthPercent <= BOSS.PHASE3.HEALTH_THRESHOLD && this.phase === 2) {
        this.startPhaseTransition(3);
    } else if (healthPercent <= BOSS.PHASE2.HEALTH_THRESHOLD && this.phase === 1) {
        this.startPhaseTransition(2);
    }
}

startPhaseTransition(newPhase) {
    if (this.isPhaseTransitioning) return;
    
    this.isPhaseTransitioning = true;
    this.oldPhase = this.phase;
    this.phase = newPhase;
    this.phaseTransitionTimer = this.phaseTransitionDuration;
    
    if (this.eventBus) {
        this.eventBus.publish('BOSS_PHASE_CHANGE', { 
            boss: this, 
            oldPhase: this.oldPhase, 
            newPhase: this.phase 
        });
    }
}
```

- [ ] **Step 7: 测试验证**

测试用例：
1. TC-Boss-001: 普通模式下通关 Boss（不使用任何技能）
2. TC-Boss-002: 使用冲刺技能穿过 Boss 激光
3. TC-Boss-003: 在 Boss 回血蓄力期间打断
4. TC-Boss-004: 连续两次挑战 Boss

---

### Task 3: 技能系统稳定性修复

**Files:**
- Modify: `js/skills.js`
- Modify: `js/skill.js`

- [ ] **Step 1: 添加空值检查到 ActiveSkill 基类**

```javascript
class ActiveSkill {
    constructor(name, key, cooldown, description) {
        this.name = name || '未知技能';
        this.key = key || '';
        this.cooldown = cooldown || 1000;
        this.description = description || '';
        
        this.owner = null;
        this.currentCooldown = 0;
        this.eventBus = null;
    }
    
    setOwner(owner) {
        this.owner = owner;
    }
    
    setEventBus(eventBus) {
        this.eventBus = eventBus;
    }
    
    update(deltaTime) {
        if (typeof deltaTime !== 'number') deltaTime = 0;
        
        if (this.currentCooldown > 0) {
            this.currentCooldown -= deltaTime;
            if (this.currentCooldown < 0) this.currentCooldown = 0;
        }
    }
    
    canExecute() {
        if (!this.owner) return false;
        if (this.currentCooldown > 0) return false;
        return true;
    }
    
    execute() {
        if (!this.canExecute()) return;
        this.currentCooldown = this.cooldown;
    }
}
```

- [ ] **Step 2: 添加空值检查到所有技能类的 execute 方法**

以 DashSkill 为例：

```javascript
class DashSkill extends ActiveSkill {
    constructor() {
        super('冲刺', ' ', 3000, '向鼠标方向快速冲刺，期间无敌');
        this.dashSpeed = 20;
        this.dashDistance = 300;
        this.dashDuration = 200;
        this.dashTimer = 0;
        this.dashDirection = { x: 0, y: 0 };
        this.isDashing = false;
        this.invincibleDuringDash = true;
    }
    
    execute() {
        if (!this.canExecute()) return;
        
        const mousePos = inputManager && inputManager.getMouseWorldPosition();
        if (!mousePos) return;
        
        const mouseX = mousePos.x;
        const mouseY = mousePos.y;
        
        if (typeof mouseX !== 'number' || typeof mouseY !== 'number') return;
        if (typeof this.owner.x !== 'number' || typeof this.owner.y !== 'number') return;
        
        const dx = mouseX - this.owner.x;
        const dy = mouseY - this.owner.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.dashDirection.x = dx / dist;
            this.dashDirection.y = dy / dist;
            this.isDashing = true;
            this.dashTimer = this.dashDuration;
            this.spawnDashEffect();
        }
        
        super.execute();
        
        if (this.eventBus) {
            this.eventBus.publish('SKILL_USED', { skill: this, player: this.owner });
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.isDashing && this.owner) {
            this.dashTimer -= deltaTime;
            this.owner.x += this.dashDirection.x * this.dashSpeed;
            this.owner.y += this.dashDirection.y * this.dashSpeed;
            this.spawnDashTrail();
            
            if (this.dashTimer <= 0) {
                this.isDashing = false;
            }
        }
    }
    
    spawnDashEffect() {
        if (!particleSystem || !this.owner) return;
        
        for (let i = 0; i < 10; i++) {
            const particle = particleSystem.createParticle(
                this.owner.x,
                this.owner.y,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                '#00ffff',
                6,
                300
            );
            if (particle) {
                particle.setKind(PARTICLES.KIND.CIRCLE);
                particle.setGravity(0);
            }
        }
    }
}
```

- [ ] **Step 3: 对所有技能类应用相同的空值检查模式**

需要修改的技能类：
- ShieldSkill
- MineSkill (地雷技能)
- HealSkill (治疗技能)
- GrenadeSkill (手雷技能)
- FlameSkill (火焰技能)
- LightningSkill (闪电技能)
- 以及其他所有技能类

每个技能的 `execute()` 和 `update()` 方法都需要添加：
1. `canExecute()` 检查
2. `particleSystem` 空值检查
3. `this.owner` 空值检查
4. 数值类型验证

- [ ] **Step 4: 测试验证**

测试用例：
1. TC-Skill-001: 每个主动技能至少释放一次，无崩溃
2. TC-Skill-002: 被动技能在战斗中正确触发
3. TC-Skill-003: 技能冷却期间重复点击无异常
4. TC-Skill-004: 连续释放多个不同技能组合

---

### Task 4: 成就系统稳定性修复

**Files:**
- Modify: `js/achievement.js`
- Modify: `js/ui.js`

- [ ] **Step 1: 添加错误处理到 AchievementManager**

```javascript
class AchievementManager {
    constructor() {
        this.achievements = {};
        this.unlockedCount = 0;
        this.totalCount = 0;
        this.newAchievements = [];
        this.stats = {
            killsTotal: 0,
            killsSingle: 0,
            goldSingle: 0,
            gemsTotal: 0,
            weaponsCollected: 0,
            weaponsUsedSingle: 0,
            damageTakenSingle: 0,
            itemsCollected: 0,
            victories: 0,
            noDamageVictories: 0,
            fullHealthVictories: 0,
            noPotionVictories: 0,
            legendaryDrops: 0,
            lowHpBossKills: 0,
            skillKills: 0,
            bestTime: Infinity
        };
        this.weaponsUsedSet = new Set();
        this.collectedItemsSet = new Set();
        this.tookDamage = false;
        this.usedPotion = false;
        
        try {
            this.initAchievements();
        } catch (error) {
            console.error('[ACHIEVEMENT] 初始化成就失败:', error);
        }
    }
    
    checkAchievement(condition, value) {
        try {
            for (const id in this.achievements) {
                const achievement = this.achievements[id];
                if (!achievement) continue;
                if (achievement.unlocked) continue;
                if (achievement.condition === condition) {
                    if (achievement.updateProgress(value)) {
                        this.onAchievementUnlocked(achievement);
                    }
                }
            }
        } catch (error) {
            console.error('[ACHIEVEMENT] 检查成就条件失败:', error);
        }
    }
    
    onAchievementUnlocked(achievement) {
        try {
            this.unlockedCount++;
            this.newAchievements.push(achievement);
            
            if (this.eventBus) {
                this.eventBus.publish('ACHIEVEMENT_UNLOCKED', { achievement });
            }
            
            if (typeof saveManager !== 'undefined') {
                saveManager.unlockAchievement(achievement.id);
            }
        } catch (error) {
            console.error('[ACHIEVEMENT] 成就解锁处理失败:', error);
        }
    }
}
```

- [ ] **Step 2: 添加成就界面渲染安全检查**

在 `ui.js` 中查找成就渲染代码，添加安全检查：

```javascript
renderAchievements() {
    if (!achievementManager) return;
    
    const ctx = renderer.ctx;
    if (!ctx) return;
    
    try {
        const achievements = achievementManager.getAllAchievements();
        
        achievements.forEach((achievement, index) => {
            if (!achievement) return;
            
            // ... 渲染代码
        });
    } catch (error) {
        console.error('[UI] 渲染成就界面失败:', error);
    }
}
```

- [ ] **Step 3: 测试验证**

测试用例：
1. TC-Achievement-001: 解锁一个成就，UI正确显示
2. TC-Achievement-002: 查看已解锁和未解锁成就列表
3. TC-Achievement-003: 游戏重新开始后成就状态保留

---

### Task 5: 存档系统稳定性修复

**Files:**
- Modify: `js/save.js`
- Modify: `js/game.js`

- [ ] **Step 1: 添加存档版本号和迁移逻辑**

```javascript
class SaveManager {
    constructor() {
        this.saveSlots = [];
        this.selectedSlot = 0;
        this.globalStats = {
            totalKills: 0,
            totalPlayTime: 0,
            totalVictories: 0,
            totalGamesPlayed: 0,
            unlockedCharacters: {},
            achievements: {},
            collectedWeapons: [],
            coins: 0,
            gems: 0
        };
        this.SAVE_VERSION = '1.0';
        
        try {
            this.init();
        } catch (error) {
            console.error('[SAVE] 存档系统初始化失败:', error);
        }
    }
    
    loadSlot(slotIndex) {
        try {
            const key = `${SAVE.STORAGE_KEY}_slot_${slotIndex}`;
            const data = localStorage.getItem(key);
            
            if (data) {
                const saveData = JSON.parse(data);
                return this.migrateSaveData(saveData);
            }
        } catch (e) {
            console.warn(`加载存档槽 ${slotIndex} 失败:`, e);
        }
        
        return null;
    }
    
    migrateSaveData(saveData) {
        if (!saveData) return null;
        
        const version = saveData.version || '0.0';
        
        if (version === this.SAVE_VERSION) {
            return saveData;
        }
        
        console.log(`[SAVE] 迁移存档数据: ${version} -> ${this.SAVE_VERSION}`);
        
        if (version === '0.0') {
            saveData.version = '1.0';
            if (!saveData.characterName) {
                saveData.characterName = '未知';
            }
            if (!saveData.isVictory) {
                saveData.isVictory = false;
            }
        }
        
        return saveData;
    }
    
    saveToSlot(slotIndex, gameData) {
        try {
            const saveData = {
                version: this.SAVE_VERSION,
                timestamp: Date.now(),
                characterId: gameData.selectedCharacter?.id || 1,
                characterName: gameData.selectedCharacter?.name || '未知',
                currentLevel: gameData.currentLevel || 1,
                playTime: gameData.playTime || 0,
                killCount: gameData.killCount || 0,
                weaponsCollected: gameData.weaponsCollected || 0,
                finalScore: gameData.finalScore || 0,
                isVictory: gameState && gameState.isState(GAME_STATE.VICTORY),
                playerHealth: gameData.playerHealth || PLAYER.MAX_HEALTH,
                currentWeaponIndex: gameData.currentWeaponIndex || 0,
                playerWeapons: gameData.playerWeapons || []
            };
            
            const key = `${SAVE.STORAGE_KEY}_slot_${slotIndex}`;
            localStorage.setItem(key, JSON.stringify(saveData));
            
            this.saveSlots[slotIndex] = saveData;
            this.updateGlobalStats(gameData);
            
            console.log(`存档保存成功，槽位: ${slotIndex}`);
            return true;
        } catch (e) {
            console.error('保存存档失败:', e);
            return false;
        }
    }
    
    checkStorageAvailable() {
        try {
            const testKey = '__pixel_dungeon_storage_test__';
            localStorage.setItem(testKey, '1');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('[SAVE] localStorage 不可用:', e);
            return false;
        }
    }
}
```

- [ ] **Step 2: 在 game.js 中集成自动存档时机**

```javascript
nextRoom() {
    this.currentRoomIndex++;
    
    if (this.currentRoomIndex >= this.totalRooms) {
        this.isVictory = true;
        return;
    }
    
    this.initRoom();
    
    if (typeof saveManager !== 'undefined') {
        saveManager.autoSave(gameState.getData());
    }
}

handleRoomClear() {
    this.allEnemiesCleared = true;
    
    if (typeof saveManager !== 'undefined') {
        saveManager.autoSave(gameState.getData());
    }
    
    if (this.eventBus) {
        this.eventBus.publish('ROOM_CLEARED', { 
            roomIndex: this.currentRoomIndex, 
            player: this.player 
        });
    }
}
```

- [ ] **Step 3: 在 main.js 中添加读档恢复逻辑**

```javascript
// 在 game.init() 完成后添加
if (game.init()) {
    game.updateUI(GAME_STATE.MENU);
    game.startMenuLoop();
    
    if (typeof saveManager !== 'undefined') {
        const autoSave = saveManager.loadAutoSave();
        if (autoSave) {
            if (confirm(`发现上次的游戏进度，是否继续？\n角色: ${autoSave.characterName}\n关卡: ${autoSave.currentLevel}`)) {
                // 恢复进度逻辑
            }
        }
    }
    
    console.log('游戏已就绪');
}
```

- [ ] **Step 4: 测试验证**

测试用例：
1. TC-Save-001: 游戏进行中自动存档，退出后重新进入恢复
2. TC-Save-002: 手动存档到不同槽位，读档正确恢复
3. TC-Save-003: 通关后存档，重新读档显示通关状态
4. TC-Save-004: 删除存档后游戏正常运行

---

### Task 6: 重新开始路径稳定性修复

**Files:**
- Modify: `js/main.js`
- Modify: `js/game.js`

- [ ] **Step 1: 完善 restart() 方法的清理逻辑**

```javascript
restart() {
    console.log('重新开始游戏');
    
    this.running = false;
    if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }
    
    this.stopMenuLoop();
    
    if (this.gameLogic) {
        this.gameLogic.cleanup();
    }
    
    this.gameLogic = new GameLogic({ eventBus: this.eventBus });
    this.gameLogic.init();
    
    this.bindUIEvents();
    
    this.start();
}
```

- [ ] **Step 2: 在 GameLogic 中添加 cleanup() 方法**

```javascript
cleanup() {
    if (this.boss) {
        this.boss.die(this);
        this.boss = null;
    }
    
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.drops = [];
    
    if (this.eventBus) {
        this.eventBus.clearAll();
    }
}
```

- [ ] **Step 3: 确保事件监听器正确移除**

在 `bindUIEvents()` 中确保使用命名函数引用：

```javascript
bindUIEvents() {
    const canvas = renderer.getCanvas();
    if (canvas) {
        canvas.removeEventListener('click', this._handleCanvasClick);
        this._handleCanvasClick = (e) => this.handleCanvasClick(e);
        canvas.addEventListener('click', this._handleCanvasClick);
    }
    
    inputManager.off('onPause', this._onPauseCallback);
    this._onPauseCallback = () => {
        if (gameState.isState(GAME_STATE.PLAYING)) {
            this.pause();
        } else if (gameState.isState(GAME_STATE.PAUSED)) {
            this.resume();
        }
    };
    inputManager.on('onPause', this._onPauseCallback);
    
    if (this._handleKeyDown) {
        document.removeEventListener('keydown', this._handleKeyDown);
    }
    this._handleKeyDown = (e) => {
        // ... 键盘处理代码
    };
    document.addEventListener('keydown', this._handleKeyDown);
}
```

- [ ] **Step 4: 测试验证**

测试用例：
1. TC-Restart-001: 游戏进行中按 P 暂停，按 R 重新开始
2. TC-Restart-002: 游戏结束后点击"重新开始"按钮
3. TC-Restart-003: 连续重新开始5次，无内存泄漏迹象
4. TC-Restart-004: 重新开始后所有按键正常响应

---

## 第1阶段：分支路线方案落地

### Task 7: 路线选择界面完善

**Files:**
- Modify: `js/game.js`
- Modify: `js/ui.js`

- [ ] **Step 1: 确保路线选择界面在正确时机触发**

```javascript
checkRoomClear() {
    if (this.enemies.length === 0 && !this.boss && !this.allEnemiesCleared) {
        this.allEnemiesCleared = true;
        
        if (this.currentRoomIndex < this.totalRooms - 1) {
            gameState.startRouteSelect();
        }
        
        if (typeof saveManager !== 'undefined') {
            saveManager.autoSave(gameState.getData());
        }
        
        if (this.eventBus) {
            this.eventBus.publish('ROOM_CLEARED', { 
                roomIndex: this.currentRoomIndex, 
                player: this.player 
            });
        }
    }
}
```

- [ ] **Step 2: 添加路线选择键盘快捷键**

在 `main.js` 的键盘事件处理中添加：

```javascript
if (gameState.isState(GAME_STATE.ROUTE_SELECT)) {
    if (e.code === 'Digit1') {
        game.confirmRoute('elite');
    } else if (e.code === 'Digit2') {
        game.confirmRoute('shop');
    } else if (e.code === 'Digit3') {
        game.confirmRoute('rest');
    } else if (e.code === 'Escape') {
        game.returnToMenu();
    }
    e.preventDefault();
    return;
}
```

- [ ] **Step 3: 测试验证**

测试用例：
1. TC-Route-001: 战斗房间清除后显示路线选择
2. TC-Route-002: 选择精英路线进入精英房间
3. TC-Route-003: 选择商店路线进入商店并购买物品
4. TC-Route-004: 选择休息路线恢复生命值

---

### Task 8: 精英房间完善

**Files:**
- Modify: `js/room.js`
- Modify: `js/game.js`

- [ ] **Step 1: 确保精英敌人属性正确计算**

```javascript
createEliteRoom() {
    const difficultyMultiplier = gameState.getRoomDifficultyMultiplier(this.currentRoomIndex);
    
    const enemyTypes = ['slime', 'bat', 'ghost'];
    const enemyCount = 3 + Math.floor(this.currentRoomIndex * 0.5);
    
    for (let i = 0; i < enemyCount; i++) {
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const enemy = this.createEnemy(type);
        
        if (enemy) {
            enemy.health = Math.floor(enemy.health * difficultyMultiplier * 1.5);
            enemy.damage = Math.floor(enemy.damage * 1.2);
            enemy.isElite = true;
            enemy.color = '#ffd700';
            
            this.enemies.push(enemy);
        }
    }
    
    this.roomType = 'elite';
}
```

- [ ] **Step 2: 验证精英敌人掉落率**

```javascript
handleEnemyDeath(enemy) {
    if (enemy.isElite) {
        const dropRate = 0.6;
        if (Math.random() < dropRate) {
            this.spawnDrop(enemy.x, enemy.y, 'rare');
        }
    } else {
        const dropRate = 0.3;
        if (Math.random() < dropRate) {
            this.spawnDrop(enemy.x, enemy.y, 'common');
        }
    }
}
```

- [ ] **Step 3: 测试验证**

测试用例：
1. TC-Elite-001: 精英房间敌人数量和属性正确
2. TC-Elite-002: 击败精英敌人后获得稀有掉落
3. TC-Elite-003: 精英房间失败后返回主菜单

---

### Task 9: 商店房间完善

**Files:**
- Modify: `js/shop.js`
- Modify: `js/ui.js`

- [ ] **Step 1: 确保商店物品生成逻辑正确**

```javascript
generateShopItems() {
    const items = [];
    const availableWeapons = Object.values(WEAPONS).filter(w => w.ID !== 1);
    
    for (let i = 0; i < 4; i++) {
        const weapon = availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
        const price = Math.floor(weapon.DAMAGE * 50 + weapon.FIRE_RATE / 10);
        
        items.push({
            type: 'weapon',
            data: weapon,
            price: price
        });
    }
    
    items.push({
        type: 'potion',
        data: { name: '生命药水', healAmount: 1 },
        price: 100
    });
    
    return items;
}
```

- [ ] **Step 2: 验证购买流程**

```javascript
buyItem(index) {
    const item = this.items[index];
    if (!item) return false;
    
    if (this.playerGold < item.price) {
        uiManager.showMessage('金币不足！');
        return false;
    }
    
    this.playerGold -= item.price;
    
    if (item.type === 'weapon') {
        this.gameLogic.addWeapon(item.data);
    } else if (item.type === 'potion') {
        this.gameLogic.player.heal(item.data.healAmount);
    }
    
    this.items.splice(index, 1);
    
    if (this.eventBus) {
        this.eventBus.publish('SHOP_PURCHASE', { item, price: item.price });
    }
    
    return true;
}
```

- [ ] **Step 3: 测试验证**

测试用例：
1. TC-Shop-001: 商店物品显示正确，价格合理
2. TC-Shop-002: 购买物品后金币正确扣除
3. TC-Shop-003: 金币不足时无法购买，有提示

---

### Task 10: 休息房间完善

**Files:**
- Modify: `js/room.js`
- Modify: `js/game.js`

- [ ] **Step 1: 确保回血喷泉碰撞检测正确**

```javascript
createRestRoom() {
    this.fountain = {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        radius: 30,
        healAmount: 1,
        healCooldown: 2000,
        lastHealTime: 0
    };
    
    this.roomType = 'rest';
}

checkFountainCollision(player) {
    if (!this.fountain || !player) return;
    
    const dx = player.x - this.fountain.x;
    const dy = player.y - this.fountain.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist <= this.fountain.radius) {
        const now = Date.now();
        if (now - this.fountain.lastHealTime >= this.fountain.healCooldown) {
            player.heal(this.fountain.healAmount);
            this.fountain.lastHealTime = now;
            
            if (this.eventBus) {
                this.eventBus.publish('HEAL', { amount: this.fountain.healAmount, player });
            }
        }
    }
}
```

- [ ] **Step 2: 添加回血视觉反馈**

```javascript
renderFountain(ctx) {
    if (!this.fountain) return;
    
    const { x, y, radius } = this.fountain;
    
    ctx.save();
    
    const pulse = Math.sin(Date.now() / 200) * 0.2 + 1;
    
    ctx.beginPath();
    ctx.arc(x, y, radius * pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#4caf50';
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('❤️', x, y);
    
    ctx.restore();
}
```

- [ ] **Step 3: 测试验证**

测试用例：
1. TC-Rest-001: 接触回血喷泉恢复生命值
2. TC-Rest-002: 满血时接触喷泉无效果
3. TC-Rest-003: 休息房间无敌人，可安全探索

---

## 第2阶段：精致度 + UX提升

### Task 11: 视觉反馈增强

**Files:**
- Modify: `js/game.js`
- Modify: `js/ui.js`

- [ ] **Step 1: 伤害数字浮动效果**

```javascript
showDamageNumber(x, y, damage, isPlayer = false) {
    const color = isPlayer ? '#ff1744' : '#ffd54f';
    
    uiManager.addFloatingText({
        x: x,
        y: y,
        text: `-${damage}`,
        color: color,
        duration: 1000,
        speed: { x: 0, y: -2 },
        fontSize: 24
    });
}
```

- [ ] **Step 2: 击杀屏幕震动**

```javascript
onEnemyKilled(enemy) {
    camera.shake(5, 100);
    
    uiManager.showFloatingText({
        x: enemy.x,
        y: enemy.y - 20,
        text: '击杀!',
        color: '#ffeb3b',
        duration: 800,
        speed: { x: 0, y: -3 },
        fontSize: 28
    });
}
```

- [ ] **Step 3: 拾取飘字效果**

```javascript
onGoldPickup(amount) {
    uiManager.showFloatingText({
        x: this.player.x,
        y: this.player.y - 30,
        text: `+${amount}G`,
        color: '#ffd700',
        duration: 1200,
        speed: { x: 0, y: -2 },
        fontSize: 20
    });
}
```

---

### Task 12: UI一致性优化

**Files:**
- Modify: `js/ui.js`
- Modify: `css/style.css`

- [ ] **Step 1: 字体统一**

```javascript
renderText(ctx, text, x, y, fontSize = 16, color = '#ffffff') {
    ctx.font = `${fontSize}px Microsoft YaHei, Arial, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
}
```

- [ ] **Step 2: 按钮样式统一**

```css
.menu-button {
    font-family: 'Microsoft YaHei', Arial, sans-serif;
    font-size: 18px;
    padding: 12px 30px;
    margin: 10px;
    background: linear-gradient(135deg, #e94560, #c23616);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.menu-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.4);
    background: linear-gradient(135deg, #ff5252, #e91e63);
}

.menu-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
```

---

### Task 13: 操作手感优化

**Files:**
- Modify: `js/constants.js`

- [ ] **Step 1: 调整移动参数**

```javascript
const PLAYER = {
    SIZE: 16,
    SPEED: 4,
    MAX_HEALTH: 3,
    INVINCIBLE_TIME: 1000,
    FLASH_INTERVAL: 200,  // 从100调整为200，闪烁更慢
    MAX_WEAPONS: 2,
    WEAPON_SWITCH_COOLDOWN: 300,
    
    MAX_SPEED: 5.2,       // 从4.8调整为5.2
    ACCELERATION: 1.8,    // 从1.5调整为1.8
    DECELERATION: 2.0,
    FRICTION: 0.85,
    AIR_RESISTANCE: 0.99,
    
    INTERPOLATION_FACTOR: 0.25,
    TURN_SENSITIVITY: 0.8,
    DIAGONAL_CORRECTION: 0.95,
    BURST_SPEED: 1.3,
    BURST_DURATION: 150,
    WALL_SLIDE_FACTOR: 0.7,
    
    WALK_BOB_AMOUNT: 2,
    WALK_BOB_SPEED: 0.1,
    MAX_TILT: 0.1,
    TILT_SPEED: 0.1,
    
    SHADOW_COLOR: 'rgba(0, 0, 0, 0.3)',
    SHADOW_WIDTH: 12,
    SHADOW_HEIGHT: 4,
    SHADOW_OFFSET_Y: 12
};
```

---

## 执行顺序总结

| 阶段 | 任务 | 优先级 | 依赖 |
|------|------|--------|------|
| 第0阶段 | Task 1: 游戏循环全局错误捕获 | 🔴 最高 | 无 |
| 第0阶段 | Task 2: Boss战稳定性修复 | 🔴 最高 | Task 1 |
| 第0阶段 | Task 3: 技能系统稳定性修复 | 🔴 最高 | Task 1 |
| 第0阶段 | Task 4: 成就系统稳定性修复 | 🟡 高 | Task 1 |
| 第0阶段 | Task 5: 存档系统稳定性修复 | 🟡 高 | Task 1 |
| 第0阶段 | Task 6: 重新开始路径稳定性修复 | 🟡 高 | Task 1 |
| 第1阶段 | Task 7: 路线选择界面完善 | 🟡 高 | 第0阶段完成 |
| 第1阶段 | Task 8: 精英房间完善 | 🟡 高 | Task 7 |
| 第1阶段 | Task 9: 商店房间完善 | 🟡 高 | Task 7 |
| 第1阶段 | Task 10: 休息房间完善 | 🟡 高 | Task 7 |
| 第2阶段 | Task 11: 视觉反馈增强 | 🟢 中 | 第1阶段完成 |
| 第2阶段 | Task 12: UI一致性优化 | 🟢 中 | Task 11 |
| 第2阶段 | Task 13: 操作手感优化 | 🟢 中 | Task 11 |

---

## 完成标准

### 第0阶段完成标准
1. ✅ 全流程测试通过（菜单→战斗→Boss→死亡/通关→重开）
2. ✅ Boss战三阶段攻击无崩溃
3. ✅ 所有27个技能释放无崩溃
4. ✅ 成就系统正常工作
5. ✅ 存档/读档功能稳定
6. ✅ 连续重新开始5次无异常
7. ✅ 游戏循环错误捕获机制生效

### 第1阶段完成标准
1. ✅ 路线选择界面正确触发和显示
2. ✅ 精英房间敌人属性和掉落正确
3. ✅ 商店购买流程正常
4. ✅ 休息房间回血效果正确

### 第2阶段完成标准
1. ✅ 伤害数字浮动效果正常
2. ✅ 击杀特效和屏幕震动正常
3. ✅ UI字体和按钮样式统一
4. ✅ Boss阶段转换特效正常
5. ✅ 操作手感优化完成
