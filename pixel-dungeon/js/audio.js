/**
 * 音效管理器
 * 负责游戏中所有音频的播放和管理
 */

class AudioManager {
    constructor() {
        // 音频上下文
        this.ctx = null;
        
        // 音频缓存
        this.sounds = {};
        
        // 音量设置
        this.masterVolume = 0.5;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.5;
        
        // 当前播放的音乐
        this.currentMusic = null;
        this.currentMusicSource = null;
        
        // 是否静音
        this.muted = false;
        
        // 是否已初始化
        this.initialized = false;
    }
    
    /**
     * 初始化音频系统
     */
    init() {
        try {
            // 创建音频上下文
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            
            // 创建主音量控制
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.masterGain.gain.value = this.masterVolume;
            
            // 创建音效和音乐音量控制
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.connect(this.masterGain);
            this.sfxGain.gain.value = this.sfxVolume;
            
            this.musicGain = this.ctx.createGain();
            this.musicGain.connect(this.masterGain);
            this.musicGain.gain.value = this.musicVolume;
            
            this.initialized = true;
            console.log('音频系统初始化完成');
            
            return true;
        } catch (e) {
            console.warn('音频系统初始化失败:', e);
            return false;
        }
    }
    
    /**
     * 播放音效
     * @param {string} soundName - 音效名称
     */
    playSound(soundName) {
        if (!this.initialized || this.muted) return;
        
        // 确保音频上下文正在运行（用户交互后）
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        
        // 生成简单的音效（使用振荡器模拟）
        this.generateSound(soundName);
    }
    
    /**
     * 生成简单音效
     * @param {string} soundName - 音效名称
     */
    generateSound(soundName) {
        if (!this.ctx) return;
        
        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        const now = this.ctx.currentTime;
        
        switch (soundName) {
            case AUDIO.SHOOT.PISTOL:
                // 手枪射击 - 短促的"biu"
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
                
            case AUDIO.SHOOT.LIGHTNING:
                // 闪电法杖 - 电弧"滋滋"
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(2000, now);
                oscillator.frequency.setValueAtTime(1500, now + 0.05);
                oscillator.frequency.setValueAtTime(2000, now + 0.1);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;
                
            case AUDIO.SHOOT.GRENADE:
                // 榴弹发射器 - "轰"
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150, now);
                oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.3);
                gainNode.gain.setValueAtTime(0.4, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
                
            case AUDIO.SHOOT.FLAME:
                // 火焰喷射器 - "呼呼"
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(300 + Math.random() * 200, now);
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                oscillator.start(now);
                oscillator.stop(now + 0.08);
                break;
                
            case AUDIO.SHOOT.BOOMERANG:
                // 回旋镖 - "嗖"
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;
                
            case AUDIO.KILL:
                // 击杀敌人 - "噗"
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;
                
            case AUDIO.PICKUP:
                // 拾取武器 - "叮"
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, now);
                oscillator.frequency.setValueAtTime(1320, now + 0.1);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;
                
            case AUDIO.HURT:
                // 玩家受伤 - "啊"
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(300, now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
                
            case AUDIO.BOSS_APPEAR:
                // Boss登场 - 低沉的"警告"
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(80, now);
                oscillator.frequency.setValueAtTime(100, now + 0.2);
                oscillator.frequency.setValueAtTime(80, now + 0.4);
                gainNode.gain.setValueAtTime(0.5, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                oscillator.start(now);
                oscillator.stop(now + 0.6);
                break;
                
            case AUDIO.BOSS_ATTACK:
                // Boss攻击
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.4);
                gainNode.gain.setValueAtTime(0.4, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                oscillator.start(now);
                oscillator.stop(now + 0.4);
                break;
                
            case AUDIO.VICTORY:
                // 通关 - 欢快的胜利音乐
                this.playVictorySound();
                break;
                
            case AUDIO.GAME_OVER:
                // 死亡 - 低沉的失败音乐
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(50, now + 1);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1);
                oscillator.start(now);
                oscillator.stop(now + 1);
                break;

            case AUDIO.SHOOT.FREEZE:
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(1200, now);
                oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.15);
                gainNode.gain.setValueAtTime(0.25, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;

            case AUDIO.SHOOT.SHOTGUN:
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);
                gainNode.gain.setValueAtTime(0.35, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;

            case AUDIO.SHOOT.HOMING:
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.setValueAtTime(800, now + 0.05);
                oscillator.frequency.setValueAtTime(1000, now + 0.1);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;

            default:
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.08);
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                oscillator.start(now);
                oscillator.stop(now + 0.08);
                break;
        }
    }
    
    /**
     * 播放胜利音效
     */
    playVictorySound() {
        if (!this.ctx) return;
        
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            gain.gain.setValueAtTime(0, now + i * 0.15);
            gain.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.4);
            
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.4);
        });
    }
    
    /**
     * 播放背景音乐
     * @param {string} musicName - 音乐名称
     */
    playMusic(musicName) {
        // TODO: 实现背景音乐播放
        // 由于需要音频文件，这里暂时不实现
        console.log('背景音乐播放:', musicName);
    }
    
    /**
     * 停止背景音乐
     */
    stopMusic() {
        if (this.currentMusicSource) {
            this.currentMusicSource.stop();
            this.currentMusicSource = null;
        }
        this.currentMusic = null;
    }
    
    /**
     * 设置主音量
     * @param {number} volume - 音量（0-1）
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }
    
    /**
     * 设置音效音量
     * @param {number} volume - 音量（0-1）
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
    }
    
    /**
     * 设置音乐音量
     * @param {number} volume - 音量（0-1）
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
    }
    
    /**
     * 静音/取消静音
     * @param {boolean} muted - 是否静音
     */
    setMuted(muted) {
        this.muted = muted;
        if (this.masterGain) {
            this.masterGain.gain.value = muted ? 0 : this.masterVolume;
        }
    }
    
    /**
     * 切换静音状态
     */
    toggleMute() {
        this.setMuted(!this.muted);
        return this.muted;
    }
}

// 创建全局音频管理器实例
const audioManager = new AudioManager();