/**
 * 增强版音效管理器
 * 使用 Web Audio API 合成各种音效，无需外部音频文件
 * 包含20+种音效和背景音乐
 */

class SoundManager {
    constructor() {
        // 音频上下文
        this.ctx = null;
        
        // 主音量节点
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.ambientGain = null;
        
        // 音量设置
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.5;
        this.ambientVolume = 0.3;
        
        // UI音效开关
        this.uiSoundEnabled = true;
        this.ambientSoundEnabled = true;
        
        // 当前播放的音乐
        this.currentMusic = null;
        this.musicOscillators = [];
        
        // 环境音
        this.ambientSound = null;
        
        // 是否已初始化
        this.initialized = false;
        
        // 音效缓存
        this.soundCache = {};
    }
    
    /**
     * 初始化音频系统
     */
    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            
            // 创建主音量节点
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.masterGain.gain.value = this.masterVolume;
            
            // 音效音量
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.connect(this.masterGain);
            this.sfxGain.gain.value = this.sfxVolume;
            
            // 音乐音量
            this.musicGain = this.ctx.createGain();
            this.musicGain.connect(this.masterGain);
            this.musicGain.gain.value = this.musicVolume;
            
            // 环境音音量
            this.ambientGain = this.ctx.createGain();
            this.ambientGain.connect(this.masterGain);
            this.ambientGain.gain.value = this.ambientVolume;
            
            this.initialized = true;
            console.log('音效系统初始化完成');
            return true;
        } catch (e) {
            console.warn('音效系统初始化失败:', e);
            return false;
        }
    }
    
    /**
     * 确保音频上下文运行
     */
    ensureRunning() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    
    /**
     * 播放音效
     * @param {string} soundName - 音效名称
     */
    play(soundName) {
        if (!this.initialized) return;
        this.ensureRunning();
        
        switch (soundName) {
            case SOUND_EFFECTS.PISTOL:
                this.playPistol();
                break;
            case SOUND_EFFECTS.SHOTGUN:
                this.playShotgun();
                break;
            case SOUND_EFFECTS.LASER:
                this.playLaser();
                break;
            case SOUND_EFFECTS.EXPLOSION:
                this.playExplosion();
                break;
            case SOUND_EFFECTS.HIT:
                this.playHit();
                break;
            case SOUND_EFFECTS.COIN:
                this.playCoin();
                break;
            case SOUND_EFFECTS.PICKUP:
                this.playPickup();
                break;
            case SOUND_EFFECTS.HURT:
                this.playHurt();
                break;
            case SOUND_EFFECTS.DEATH:
                this.playDeath();
                break;
            case SOUND_EFFECTS.DASH:
                this.playDash();
                break;
            case SOUND_EFFECTS.SHIELD:
                this.playShield();
                break;
            case SOUND_EFFECTS.HEAL:
                this.playHeal();
                break;
            case SOUND_EFFECTS.LEVELUP:
                this.playLevelUp();
                break;
            case SOUND_EFFECTS.CLICK:
                if (this.uiSoundEnabled) this.playClick();
                break;
            case SOUND_EFFECTS.SWITCH:
                if (this.uiSoundEnabled) this.playSwitch();
                break;
            case SOUND_EFFECTS.CHEST:
                this.playChest();
                break;
            case SOUND_EFFECTS.PORTAL:
                this.playPortal();
                break;
            case SOUND_EFFECTS.BOSS:
                this.playBoss();
                break;
            case SOUND_EFFECTS.VICTORY:
                this.playVictory();
                break;
            case SOUND_EFFECTS.DEFEAT:
                this.playDefeat();
                break;
            default:
                console.warn('未知音效:', soundName);
        }
    }
    
    // ==================== 具体音效实现 ====================
    
    /**
     * 手枪射击 - "biu"
     */
    playPistol() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        const now = this.ctx.currentTime;
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }
    
    /**
     * 散弹枪射击 - "bang"
     */
    playShotgun() {
        const now = this.ctx.currentTime;
        
        // 主枪声
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        
        // 添加白噪声音效
        this.playNoise(0.15, 0.2);
    }
    
    /**
     * 激光射击 - "zap"
     */
    playLaser() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        const now = this.ctx.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }
    
    /**
     * 爆炸 - "boom"
     */
    playExplosion() {
        const now = this.ctx.currentTime;
        
        // 低频爆炸
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        
        // 白噪声
        this.playNoise(0.3, 0.4);
    }
    
    /**
     * 击中 - "hit"
     */
    playHit() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        const now = this.ctx.currentTime;
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        osc.start(now);
        osc.stop(now + 0.08);
    }
    
    /**
     * 拾取金币 - "ding"
     */
    playCoin() {
        const now = this.ctx.currentTime;
        
        // 高音
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(this.sfxGain);
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1200, now);
        osc1.frequency.setValueAtTime(1800, now + 0.05);
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc1.start(now);
        osc1.stop(now + 0.15);
        
        // 泛音
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(this.sfxGain);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2400, now + 0.02);
        gain2.gain.setValueAtTime(0.1, now + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc2.start(now + 0.02);
        osc2.stop(now + 0.2);
    }
    
    /**
     * 拾取道具 - "chime"
     */
    playPickup() {
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const startTime = now + i * 0.08;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }
    
    /**
     * 受伤 - "ouch"
     */
    playHurt() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        const now = this.ctx.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        
        osc.start(now);
        osc.stop(now + 0.25);
    }
    
    /**
     * 死亡 - "die"
     */
    playDeath() {
        const now = this.ctx.currentTime;
        
        // 下降的音调
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.8);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
    }
    
    /**
     * 冲刺/跳跃 - "whoosh"
     */
    playDash() {
        const now = this.ctx.currentTime;
        
        // 使用带通滤波的噪声模拟风声
        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(3000, now + 0.2);
        filter.Q.value = 1;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        noise.start(now);
        noise.stop(now + 0.2);
    }
    
    /**
     * 护盾激活 - "shield"
     */
    playShield() {
        const now = this.ctx.currentTime;
        
        // 上升的合成音
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        
        // 泛音
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(this.sfxGain);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(600, now + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
        gain2.gain.setValueAtTime(0.15, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc2.start(now + 0.05);
        osc2.stop(now + 0.35);
    }
    
    /**
     * 治疗 - "heal"
     */
    playHeal() {
        const now = this.ctx.currentTime;
        
        // 上升琶音
        const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const startTime = now + i * 0.08;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
            
            osc.start(startTime);
            osc.stop(startTime + 0.25);
        });
    }
    
    /**
     * 升级 - "levelup"
     */
    playLevelUp() {
        const now = this.ctx.currentTime;
        
        // 上升音阶
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'square';
            osc.frequency.value = freq;
            
            const startTime = now + i * 0.1;
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
            
            osc.start(startTime);
            osc.stop(startTime + 0.2);
        });
    }
    
    /**
     * 按钮点击 - "click"
     */
    playClick() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        const now = this.ctx.currentTime;
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(800, now + 0.02);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        osc.start(now);
        osc.stop(now + 0.08);
    }
    
    /**
     * 菜单切换 - "switch"
     */
    playSwitch() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        const now = this.ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(600, now + 0.05);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }
    
    /**
     * 宝箱打开 - "chest"
     */
    playChest() {
        const now = this.ctx.currentTime;
        
        // 解锁声
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(this.sfxGain);
        
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(200, now);
        osc1.frequency.setValueAtTime(300, now + 0.1);
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc1.start(now);
        osc1.stop(now + 0.15);
        
        // 打开的光芒声
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(this.sfxGain);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(600, now + 0.15);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.35);
        gain2.gain.setValueAtTime(0, now + 0.15);
        gain2.gain.linearRampToValueAtTime(0.25, now + 0.2);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.5);
    }
    
    /**
     * 传送门 - "portal"
     */
    playPortal() {
        const now = this.ctx.currentTime;
        
        // 持续的嗡鸣声
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(400, now + 0.5);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        
        // 泛音
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(this.sfxGain);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(400, now + 0.1);
        osc2.frequency.linearRampToValueAtTime(800, now + 0.4);
        gain2.gain.setValueAtTime(0.1, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.5);
    }
    
    /**
     * Boss出场 - "boss"
     */
    playBoss() {
        const now = this.ctx.currentTime;
        
        // 低沉的警告音
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.setValueAtTime(100, now + 0.3);
        osc.frequency.setValueAtTime(80, now + 0.6);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
    }
    
    /**
     * 胜利 - "victory"
     */
    playVictory() {
        const now = this.ctx.currentTime;
        
        // 胜利旋律：C大调上行
        const melody = [
            { note: 523.25, time: 0 },      // C5
            { note: 659.25, time: 0.15 },   // E5
            { note: 783.99, time: 0.3 },    // G5
            { note: 1046.50, time: 0.45 }   // C6
        ];
        
        melody.forEach(({ note, time }) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'sine';
            osc.frequency.value = note;
            
            const startTime = now + time;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
            
            osc.start(startTime);
            osc.stop(startTime + 0.5);
        });
    }
    
    /**
     * 失败 - "defeat"
     */
    playDefeat() {
        const now = this.ctx.currentTime;
        
        // 下行的悲伤旋律
        const melody = [
            { note: 440, time: 0 },         // A4
            { note: 392, time: 0.2 },       // G4
            { note: 349.23, time: 0.4 },    // F4
            { note: 261.63, time: 0.6 }     // C4
        ];
        
        melody.forEach(({ note, time }) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'sawtooth';
            osc.frequency.value = note;
            
            const startTime = now + time;
            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
            
            osc.start(startTime);
            osc.stop(startTime + 0.4);
        });
    }
    
    // ==================== 辅助方法 ====================
    
    /**
     * 播放白噪声
     * @param {number} volume - 音量
     * @param {number} duration - 持续时间（秒）
     */
    playNoise(volume, duration) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const gain = this.ctx.createGain();
        gain.gain.value = volume;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        noise.start();
    }
    
    // ==================== 背景音乐 ====================
    
    /**
     * 播放背景音乐
     * @param {string} musicType - 音乐类型
     */
    playMusic(musicType = 'dungeon') {
        this.stopMusic();
        
        const now = this.ctx.currentTime;
        
        switch (musicType) {
            case 'dungeon':
                this.playDungeonMusic(now);
                break;
            case 'boss':
                this.playBossMusic(now);
                break;
            case 'menu':
                this.playMenuMusic(now);
                break;
            case 'victory':
                this.playVictoryMusic(now);
                break;
        }
        
        this.currentMusic = musicType;
    }
    
    /**
     * 地牢背景音乐（简单的循环旋律）
     */
    playDungeonMusic(startTime) {
        const notes = [261.63, 293.66, 329.63, 349.23, 392, 349.23, 329.63, 293.66];
        const noteDuration = 0.5;
        
        this.playLoopMusic(startTime, notes, noteDuration, 'triangle', 0.08);
    }
    
    /**
     * Boss战音乐（紧张急促）
     */
    playBossMusic(startTime) {
        const notes = [220, 196, 220, 246.94, 220, 196, 174.61, 196];
        const noteDuration = 0.25;
        
        this.playLoopMusic(startTime, notes, noteDuration, 'sawtooth', 0.06);
    }
    
    /**
     * 主菜单音乐（轻松的）
     */
    playMenuMusic(startTime) {
        const notes = [392, 440, 493.88, 523.25, 493.88, 440, 392, 349.23];
        const noteDuration = 0.4;
        
        this.playLoopMusic(startTime, notes, noteDuration, 'sine', 0.06);
    }
    
    /**
     * 胜利音乐
     */
    playVictoryMusic(startTime) {
        const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
        const noteDuration = 0.3;
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.musicGain);
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const noteTime = startTime + i * noteDuration;
            gain.gain.setValueAtTime(0, noteTime);
            gain.gain.linearRampToValueAtTime(0.15, noteTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, noteTime + noteDuration * 1.5);
            
            osc.start(noteTime);
            osc.stop(noteTime + noteDuration * 1.5);
            
            this.musicOscillators.push(osc);
        });
    }
    
    /**
     * 播放循环音乐
     */
    playLoopMusic(startTime, notes, noteDuration, type, volume) {
        const loopDuration = notes.length * noteDuration;
        const totalDuration = 30;
        
        for (let loop = 0; loop < Math.ceil(totalDuration / loopDuration); loop++) {
            const loopStart = startTime + loop * loopDuration;
            
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.connect(gain);
                gain.connect(this.musicGain);
                
                osc.type = type;
                osc.frequency.value = freq;
                
                const noteTime = loopStart + i * noteDuration;
                gain.gain.setValueAtTime(0, noteTime);
                gain.gain.linearRampToValueAtTime(volume, noteTime + 0.05);
                gain.gain.linearRampToValueAtTime(volume * 0.8, noteTime + noteDuration - 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, noteTime + noteDuration);
                
                osc.start(noteTime);
                osc.stop(noteTime + noteDuration + 0.05);
                
                this.musicOscillators.push(osc);
            });
        }
    }
    
    /**
     * 停止背景音乐
     */
    stopMusic() {
        this.musicOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {}
        });
        this.musicOscillators = [];
        this.currentMusic = null;
    }
    
    // ==================== 环境音 ====================
    
    /**
     * 播放环境音
     * @param {string} type - 环境音类型
     */
    playAmbientSound(type = 'torch') {
        if (!this.ambientSoundEnabled) return;
        
        this.stopAmbientSound();
        
        const now = this.ctx.currentTime;
        
        switch (type) {
            case 'torch':
                this.playTorchSound(now);
                break;
            case 'wind':
                this.playWindSound(now);
                break;
        }
    }
    
    /**
     * 火把声（持续的噼啪声）
     */
    playTorchSound(startTime) {
        const duration = 2;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 0.5;
        
        const gain = this.ctx.createGain();
        gain.gain.value = 0.05;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);
        
        noise.start(startTime);
        this.ambientSound = noise;
    }
    
    /**
     * 风声
     */
    playWindSound(startTime) {
        const duration = 3;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;
        
        const gain = this.ctx.createGain();
        gain.gain.value = 0.04;
        
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.2;
        lfoGain.gain.value = 100;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);
        
        noise.start(startTime);
        this.ambientSound = noise;
    }
    
    /**
     * 停止环境音
     */
    stopAmbientSound() {
        if (this.ambientSound) {
            try {
                this.ambientSound.stop();
            } catch (e) {}
            this.ambientSound = null;
        }
    }
    
    // ==================== 音量控制 ====================
    
    /**
     * 设置主音量
     * @param {number} volume - 0-1
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }
    
    /**
     * 设置音效音量
     * @param {number} volume - 0-1
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
    }
    
    /**
     * 设置音乐音量
     * @param {number} volume - 0-1
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
    }
    
    /**
     * 设置环境音音量
     * @param {number} volume - 0-1
     */
    setAmbientVolume(volume) {
        this.ambientVolume = Math.max(0, Math.min(1, volume));
        if (this.ambientGain) {
            this.ambientGain.gain.value = this.ambientVolume;
        }
    }
    
    /**
     * 设置UI音效开关
     * @param {boolean} enabled
     */
    setUISoundEnabled(enabled) {
        this.uiSoundEnabled = enabled;
    }
    
    /**
     * 设置环境音开关
     * @param {boolean} enabled
     */
    setAmbientSoundEnabled(enabled) {
        this.ambientSoundEnabled = enabled;
        if (!enabled) {
            this.stopAmbientSound();
        }
    }
}

// 创建全局音效管理器实例
const soundManager = new SoundManager();
